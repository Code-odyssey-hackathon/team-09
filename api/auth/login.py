"""
Demo authentication: login endpoint for CropWhisperer.
Accepts JSON and returns mock access/refresh tokens.
"""

from __future__ import annotations

import json
import time
import uuid
from http.server import BaseHTTPRequestHandler

TOKEN_TTL_SECONDS = 3600


def _send_json(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.end_headers()
    handler.wfile.write(json.dumps(payload).encode("utf-8"))


def _read_json(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length", 0))
    if length == 0:
        return {}
    raw = handler.rfile.read(length)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def _make_tokens() -> dict:
    return {
        "access_token": f"demo-access-{uuid.uuid4().hex}",
        "refresh_token": f"demo-refresh-{uuid.uuid4().hex}",
        "token_type": "Bearer",
        "expires_in": TOKEN_TTL_SECONDS,
        "issued_at": int(time.time()),
    }


class handler(BaseHTTPRequestHandler):
    """Vercel serverless handler for demo login."""

    def do_OPTIONS(self):
        _send_json(self, 200, {"status": "ok"})

    def do_GET(self):
        _send_json(self, 405, {"error": "Use POST for demo login."})

    def do_POST(self):
        data = _read_json(self)
        email = (data.get("email") or "").strip()
        password = data.get("password") or ""

        if not email or "@" not in email:
            _send_json(self, 400, {"error": "A valid email address is required."})
            return

        if len(password) < 8:
            _send_json(self, 400, {"error": "Password must be at least 8 characters."})
            return

        user = {
            "id": f"demo-{uuid.uuid4().hex[:12]}",
            "email": email,
        }

        payload = {
            "message": "Demo login successful. No account lookup performed.",
            "demo": True,
            "user": user,
            **_make_tokens(),
        }
        _send_json(self, 200, payload)
