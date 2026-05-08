"""
AI Crop Stress Whisperer — Prediction Serverless Function

Accepts a multipart POST with an image file, runs MobileNetV2 inference
fine-tuned on PlantVillage, and returns structured stress diagnostics.

Deployed as a Vercel Serverless Function (Python 3.11 + tensorflow-cpu).
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
# Model loading — happens ONCE per cold start, reused across warm invocations
# ---------------------------------------------------------------------------

_model = None


def _load_model():
    """
    Load the MobileNetV2-based crop stress classifier.

    Strategy:
    1. If a fine-tuned model exists at MODEL_PATH env var or ./model/, load it.
    2. Otherwise, build a MobileNetV2 base with a fresh classification head
       (useful for first deploy / demo before the fine-tuned weights are ready).
    """
    global _model

    if _model is not None:
        return _model

    import tensorflow as tf

    model_path = os.environ.get("MODEL_PATH", os.path.join(os.path.dirname(__file__), "model"))

    if os.path.exists(model_path):
        try:
            _model = tf.keras.models.load_model(model_path, compile=False)
            print(f"[predict] Loaded fine-tuned model from {model_path}")
            return _model
        except Exception as exc:
            print(f"[predict] Failed to load model from {model_path}: {exc}")

    # Fallback: build a demo architecture (MobileNetV2 + classification head)
    print("[predict] Building demo MobileNetV2 classifier (no fine-tuned weights)")
    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg",
    )
    base.trainable = False

    _model = tf.keras.Sequential([
        base,
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(len(STRESS_CATEGORIES), activation="softmax"),
    ])
    _model.build(input_shape=(None, 224, 224, 3))
    return _model


# Eagerly load on cold start
_load_model()


# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------

def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Decode image bytes → PIL Image → resize to 224×224 → normalise to [0, 1].
    Returns a batch-ready numpy array of shape (1, 224, 224, 3).
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMAGE_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


# ---------------------------------------------------------------------------
# Severity estimation
# ---------------------------------------------------------------------------

def _estimate_severity(stress_type: str, confidence: float) -> int:
    """
    Map stress type + confidence to a 0-100 severity score.
    Healthy → 0.  Others scale with confidence.
    """
    if stress_type == "Healthy":
        return 0

    severity_weights: dict[str, tuple[int, int]] = {
        "Drought Stress":       (40, 95),
        "Nutrient Deficiency":  (30, 80),
        "Pest Attack":          (50, 100),
        "Fungal Disease":       (45, 95),
    }
    low, high = severity_weights.get(stress_type, (30, 90))
    severity = int(low + (high - low) * confidence)
    return min(severity, 100)


# ---------------------------------------------------------------------------
# Multipart parser (Vercel provides raw body — no framework)
# ---------------------------------------------------------------------------

def _extract_file_from_multipart(body: bytes, content_type: str) -> tuple[bytes | None, str | None]:
    """
    Minimal multipart/form-data parser that extracts the first file field
    named 'file'. Returns (file_bytes, mime_type) or (None, None).
    """
    if "boundary=" not in content_type:
        return None, None

    boundary = content_type.split("boundary=")[-1].strip()
    if boundary.startswith('"') and boundary.endswith('"'):
        boundary = boundary[1:-1]

    delimiter = f"--{boundary}".encode()
    parts = body.split(delimiter)

    for part in parts:
        if b'name="file"' not in part:
            continue

        # Split headers from body (double CRLF)
        header_end = part.find(b"\r\n\r\n")
        if header_end == -1:
            continue

        headers_raw = part[:header_end].decode("utf-8", errors="replace")
        file_data = part[header_end + 4:]

        # Strip trailing \r\n-- from last boundary
        if file_data.endswith(b"\r\n"):
            file_data = file_data[:-2]
        if file_data.endswith(b"--"):
            file_data = file_data[:-2]
        if file_data.endswith(b"\r\n"):
            file_data = file_data[:-2]

        # Detect MIME type from Content-Type header or filename
        mime = "application/octet-stream"
        for line in headers_raw.split("\r\n"):
            if line.lower().startswith("content-type:"):
                mime = line.split(":", 1)[1].strip()
                break

        return file_data, mime

    return None, None


# ---------------------------------------------------------------------------
# HTTP Handler (Vercel Serverless Function interface)
# ---------------------------------------------------------------------------

class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless function handler."""

    def _send_json(self, status: int, data: dict[str, Any]) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        """Health check endpoint."""
        self._send_json(200, {
            "service": "AI Crop Stress Whisperer",
            "version": "1.0.0",
            "status": "ready",
            "categories": STRESS_CATEGORIES,
        })

    def do_POST(self):
        """
        Accept multipart image upload, run inference, return diagnostics.
        """
        try:
            # --- Read body ---
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self._send_json(400, {"error": "Empty request body."})
                return

            body = self.rfile.read(content_length)
            content_type = self.headers.get("Content-Type", "")

            # --- Validate multipart ---
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

            # --- Validate image type ---
            if mime_type not in ALLOWED_CONTENT_TYPES:
                self._send_json(400, {
                    "error": (
                        f"Unsupported file type: {mime_type}. "
                        f"Accepted: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
                    ),
                })
                return

            # --- Preprocess ---
            try:
                input_tensor = _preprocess_image(file_bytes)
            except Exception:
                self._send_json(400, {
                    "error": "Could not decode the uploaded file as a valid image.",
                })
                return

            # --- Inference ---
            model = _load_model()
            predictions = model.predict(input_tensor, verbose=0)
            probs = predictions[0]

            predicted_idx = int(np.argmax(probs))
            confidence = float(probs[predicted_idx])
            stress_type = STRESS_CATEGORIES[predicted_idx]

            # --- Low-confidence guard ---
            if confidence < CONFIDENCE_THRESHOLD:
                from api.climate import get_climate_alert

                lat = self.headers.get("X-Latitude")
                lon = self.headers.get("X-Longitude")

                self._send_json(200, {
                    "stress_type": stress_type,
                    "severity": 0,
                    "confidence": round(confidence, 4),
                    "recommendation": (
                        "Low confidence prediction — the model is not certain about "
                        "this diagnosis. Please upload a clearer, well-lit photo of "
                        "the affected leaf or plant area for a more reliable analysis."
                    ),
                    "climate_alert": get_climate_alert(lat, lon),
                    "low_confidence": True,
                })
                return

            # --- Build full response ---
            from api.recommender import get_recommendation
            from api.climate import get_climate_alert

            severity = _estimate_severity(stress_type, confidence)

            lat = self.headers.get("X-Latitude")
            lon = self.headers.get("X-Longitude")

            self._send_json(200, {
                "stress_type": stress_type,
                "severity": severity,
                "confidence": round(confidence, 4),
                "recommendation": get_recommendation(stress_type),
                "climate_alert": get_climate_alert(lat, lon),
                "low_confidence": False,
            })

        except Exception:
            self._send_json(500, {
                "error": "Internal server error during inference.",
                "detail": traceback.format_exc(),
            })
