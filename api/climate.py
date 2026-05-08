"""
Climate alert module for AI Crop Stress Whisperer.

Calls OpenWeatherMap free-tier Current Weather API and returns a
one-sentence climate advisory relevant to crop health.
"""

import os
import requests

OPENWEATHERMAP_URL = "https://api.openweathermap.org/data/2.5/weather"
DEFAULT_LAT = "20.5937"   # India centre — sensible default for hackathon
DEFAULT_LON = "78.9629"
TIMEOUT_SECONDS = 5


def _build_alert(weather: dict) -> str:
    """Compose a one-sentence alert from weather JSON."""
    main = weather.get("main", {})
    wind = weather.get("wind", {})
    conditions = weather.get("weather", [{}])[0]

    temp_c = main.get("temp")
    humidity = main.get("humidity")
    wind_speed = wind.get("speed")
    description = conditions.get("description", "unknown conditions")
    city = weather.get("name", "your region")

    parts: list[str] = []

    if temp_c is not None and temp_c > 35:
        parts.append(
            f"extreme heat of {temp_c:.0f}°C detected — increase irrigation "
            f"and provide shade cover"
        )
    elif temp_c is not None and temp_c < 5:
        parts.append(
            f"frost risk at {temp_c:.0f}°C — protect sensitive crops with "
            f"row covers or mulch"
        )

    if humidity is not None and humidity > 85:
        parts.append(
            f"humidity is {humidity}% which favours fungal growth — ensure "
            f"adequate ventilation"
        )
    elif humidity is not None and humidity < 30:
        parts.append(
            f"humidity is very low at {humidity}% — monitor for drought stress"
        )

    if wind_speed is not None and wind_speed > 10:
        parts.append(
            f"strong winds at {wind_speed:.0f} m/s — secure young plants and "
            f"row structures"
        )

    if parts:
        alert = (
            f"Climate alert for {city} ({description}): "
            + "; ".join(parts)
            + "."
        )
    else:
        alert = (
            f"Current conditions in {city}: {description}, "
            f"{temp_c:.0f}°C, {humidity}% humidity — "
            f"no immediate climate risk to crops."
        )

    return alert


def get_climate_alert(lat: str | None = None, lon: str | None = None) -> str:
    """
    Fetch current weather and return a one-sentence crop-relevant alert.

    Uses OPENWEATHERMAP_KEY env var.  Fails gracefully if the key is
    missing or the API call errors out.
    """
    api_key = os.environ.get("OPENWEATHERMAP_KEY")
    if not api_key:
        return (
            "Climate data unavailable — OPENWEATHERMAP_KEY is not configured. "
            "Set the environment variable to enable real-time climate alerts."
        )

    params = {
        "lat": lat or DEFAULT_LAT,
        "lon": lon or DEFAULT_LON,
        "appid": api_key,
        "units": "metric",
    }

    try:
        resp = requests.get(OPENWEATHERMAP_URL, params=params, timeout=TIMEOUT_SECONDS)
        resp.raise_for_status()
        return _build_alert(resp.json())
    except requests.exceptions.Timeout:
        return "Climate data unavailable — weather service timed out."
    except requests.exceptions.HTTPError as exc:
        return f"Climate data unavailable — weather API returned {exc.response.status_code}."
    except Exception:
        return "Climate data unavailable — unexpected error contacting weather service."
