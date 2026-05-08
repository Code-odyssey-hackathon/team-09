"""
AI Crop Stress Whisperer — Prediction Serverless Function

Accepts a multipart POST with an image file, runs MobileNetV2 ONNX inference,
and returns structured stress diagnostics.

Model strategy:
  1. If api/model/model.onnx exists → run real ONNX inference.
  2. Otherwise → softmax over random logits (demo / first-deploy mode).

Deployed as a Vercel Serverless Function (Python 3.11 + onnxruntime).
Bundle size: ~100 MB  (well under Vercel's 500 MB Lambda limit).
"""

from __future__ import annotations

import io
import json
import os
import traceback
from http.server import BaseHTTPRequestHandler
from typing import Any

import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

STRESS_CATEGORIES: list[str] = [
    "Healthy",
    "Drought Stress",
    "Nutrient Deficiency",
    "Pest Attack",
    "Fungal Disease",
]

IMAGE_SIZE: tuple[int, int] = (224, 224)
CONFIDENCE_THRESHOLD: float = 0.4
ALLOWED_CONTENT_TYPES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/tiff",
}

# ---------------------------------------------------------------------------
# Model loading — once per cold start, reused across warm invocations
# ---------------------------------------------------------------------------

_session = None   # onnxruntime.InferenceSession
_demo_mode = False


def _load_model():
    """
    Load the MobileNetV2 ONNX model.

    Falls back to demo mode (random softmax) if the ONNX file is absent,
    so the API stays functional during development / first deploy.
    """
    global _session, _demo_mode

    if _session is not None or _demo_mode:
        return

    model_path = os.environ.get(
        "MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "model", "model.onnx"),
    )

    if os.path.exists(model_path):
        try:
            import onnxruntime as ort
            opts = ort.SessionOptions()
            opts.inter_op_num_threads = 1
            opts.intra_op_num_threads = 1
            _session = ort.InferenceSession(model_path, sess_options=opts)
            print(f"[predict] Loaded ONNX model from {model_path}")
        except Exception as exc:
            print(f"[predict] Failed to load ONNX model: {exc}. Using demo mode.")
            _demo_mode = True
    else:
        print("[predict] No ONNX model found — running in demo mode.")
        _demo_mode = True


# Eagerly load on cold start
_load_model()


# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------

def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Decode image bytes → PIL Image → resize to 224×224 → normalise to [0, 1].
    Returns a batch-ready float32 array of shape (1, 224, 224, 3).
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMAGE_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)          # shape: (1, 224, 224, 3)


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

def _run_inference(input_tensor: np.ndarray) -> np.ndarray:
    """
    Run inference and return a probability array of shape (5,).
    Uses the ONNX session when available, otherwise softmax over random logits.
    """
    if _session is not None:
        input_name = _session.get_inputs()[0].name
        outputs = _session.run(None, {input_name: input_tensor})
        probs = outputs[0][0]                   # shape: (5,)
    else:
        # Demo mode — deterministic-ish random so results look realistic
        rng = np.random.default_rng(seed=int(input_tensor.mean() * 1e6))
        logits = rng.random(len(STRESS_CATEGORIES)).astype(np.float32)
        exp = np.exp(logits - logits.max())
        probs = exp / exp.sum()

    return probs.astype(np.float32)


# ---------------------------------------------------------------------------
# Severity estimation
# ---------------------------------------------------------------------------

def _estimate_severity(stress_type: str, confidence: float) -> int:
    """
    Map stress type + confidence → 0–100 severity score.
    Healthy → 0. Others scale linearly with confidence within a type-specific range.
    """
    if stress_type == "Healthy":
        return 0

    severity_weights: dict[str, tuple[int, int]] = {
        "Drought Stress":      (40, 95),
        "Nutrient Deficiency": (30, 80),
        "Pest Attack":         (50, 100),
        "Fungal Disease":      (45, 95),
    }
    low, high = severity_weights.get(stress_type, (30, 90))
    return min(int(low + (high - low) * confidence), 100)


# ---------------------------------------------------------------------------
# Multipart parser (Vercel delivers raw body — no framework)
# ---------------------------------------------------------------------------

def _extract_file_from_multipart(
    body: bytes, content_type: str
) -> tuple[bytes | None, str | None]:
    """
    Minimal multipart/form-data parser — extracts the first 'file' field.
    Returns (file_bytes, mime_type) or (None, None).
    """
    if "boundary=" not in content_type:
        return None, None

    boundary = content_type.split("boundary=")[-1].strip().strip('"')
    delimiter = f"--{boundary}".encode()
    parts = body.split(delimiter)

    for part in parts:
        if b'name="file"' not in part:
            continue

        header_end = part.find(b"\r\n\r\n")
        if header_end == -1:
            continue

        headers_raw = part[:header_end].decode("utf-8", errors="replace")
        file_data = part[header_end + 4:]

        # Strip trailing boundary markers
        for suffix in (b"--", b"\r\n"):
            if file_data.endswith(suffix):
                file_data = file_data[: -len(suffix)]

        mime = "application/octet-stream"
        for line in headers_raw.split("\r\n"):
            if line.lower().startswith("content-type:"):
                mime = line.split(":", 1)[1].strip()
                break

        return file_data, mime

    return None, None


# ---------------------------------------------------------------------------
# HTTP Handler
# ---------------------------------------------------------------------------

class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless function handler."""

    def _send_json(self, status: int, data: dict[str, Any]) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        self._send_json(200, {
            "service": "AI Crop Stress Whisperer",
            "version": "1.1.0",
            "runtime": "onnxruntime" if not _demo_mode else "demo",
            "status": "ready",
            "categories": STRESS_CATEGORIES,
        })

    def do_POST(self):
        """Accept multipart image upload, run inference, return diagnostics."""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self._send_json(400, {"error": "Empty request body."})
                return

            body = self.rfile.read(content_length)
            content_type = self.headers.get("Content-Type", "")

            if "multipart/form-data" not in content_type:
                self._send_json(400, {
                    "error": "Expected multipart/form-data with a 'file' field.",
                })
                return

            file_bytes, mime_type = _extract_file_from_multipart(body, content_type)

            if file_bytes is None:
                self._send_json(400, {
                    "error": "No 'file' field found in the multipart request.",
                })
                return

            if mime_type not in ALLOWED_CONTENT_TYPES:
                self._send_json(400, {
                    "error": (
                        f"Unsupported file type: {mime_type}. "
                        f"Accepted: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
                    ),
                })
                return

            try:
                input_tensor = _preprocess_image(file_bytes)
            except Exception:
                self._send_json(400, {
                    "error": "Could not decode the uploaded file as a valid image.",
                })
                return

            probs = _run_inference(input_tensor)
            predicted_idx = int(np.argmax(probs))
            confidence = float(probs[predicted_idx])
            stress_type = STRESS_CATEGORIES[predicted_idx]

            from api.climate import get_climate_alert
            lat = self.headers.get("X-Latitude")
            lon = self.headers.get("X-Longitude")
            climate_alert = get_climate_alert(lat, lon)

            if confidence < CONFIDENCE_THRESHOLD:
                self._send_json(200, {
                    "stress_type": stress_type,
                    "severity": 0,
                    "confidence": round(confidence, 4),
                    "recommendation": (
                        "Low confidence — the model is uncertain about this image. "
                        "Please upload a clearer, well-lit photo of the affected "
                        "leaf or plant area for a more reliable diagnosis."
                    ),
                    "climate_alert": climate_alert,
                    "low_confidence": True,
                    "demo_mode": _demo_mode,
                })
                return

            from api.recommender import get_recommendation
            self._send_json(200, {
                "stress_type": stress_type,
                "severity": _estimate_severity(stress_type, confidence),
                "confidence": round(confidence, 4),
                "recommendation": get_recommendation(stress_type),
                "climate_alert": climate_alert,
                "low_confidence": False,
                "demo_mode": _demo_mode,
            })

        except Exception:
            self._send_json(500, {
                "error": "Internal server error during inference.",
                "detail": traceback.format_exc(),
            })
