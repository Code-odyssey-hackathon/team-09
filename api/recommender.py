"""
Stress-type → actionable recommendation mapping for AI Crop Stress Whisperer.
"""

RECOMMENDATIONS: dict[str, str] = {
    "Healthy": (
        "Your crop appears healthy. Continue current irrigation and fertilization "
        "schedules. Monitor weekly for early signs of stress and maintain proper "
        "crop rotation to preserve soil health."
    ),
    "Drought Stress": (
        "Immediate action required: increase irrigation frequency and apply mulch "
        "around the root zone to retain soil moisture. Consider installing drip "
        "irrigation for water-efficient delivery. Avoid fertilizing until the plant "
        "recovers to prevent salt burn on stressed roots."
    ),
    "Nutrient Deficiency": (
        "Conduct a soil test to identify the specific deficient nutrient. Apply a "
        "balanced NPK fertilizer (10-10-10) as an interim measure. For yellowing "
        "leaves (nitrogen), use urea at 50 kg/ha; for purple stems (phosphorus), "
        "apply superphosphate. Foliar micronutrient sprays can provide rapid relief."
    ),
    "Pest Attack": (
        "Inspect the crop for visible pests and egg clusters. Apply neem-oil-based "
        "organic pesticide (1500 ppm azadirachtin) as a first response. For severe "
        "infestations, use targeted chemical control after identifying the pest "
        "species. Introduce beneficial predators like ladybugs for long-term "
        "integrated pest management."
    ),
    "Fungal Disease": (
        "Remove and destroy visibly infected plant parts immediately to prevent "
        "spore spread. Apply copper-based fungicide (Bordeaux mixture) at 1% "
        "concentration. Improve air circulation by pruning dense foliage and avoid "
        "overhead irrigation. Rotate crops and use disease-resistant varieties in "
        "the next planting cycle."
    ),
}


def get_recommendation(stress_type: str) -> str:
    """Return the recommendation for a given stress type, with a safe fallback."""
    return RECOMMENDATIONS.get(
        stress_type,
        "Unable to determine a specific recommendation. Please consult a local "
        "agricultural extension officer for a field assessment.",
    )
