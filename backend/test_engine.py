import asyncio
import json
from app.services.nutrition_intelligence_engine import NutritionIntelligenceEngine

class MockProfile:
    def __init__(self):
        self.health_goal = "muscle gain"
        self.weight_kg = 75.0
        self.height_cm = 180.0

parsed_data_nutella = {
    "nutrition_facts": {
        "calories": 200,
        "protein": 2.0,
        "sugar": 21.0,
        "added_sugar": 21.0,
        "fiber": 1.0,
        "sodium": 15.0
    },
    "ingredients": ["sugar", "palm oil", "hazelnuts", "skim milk", "cocoa", "soy lecithin", "vanillin"],
    "allergens": ["milk", "soy", "nuts"]
}

user_profile = {"profile": MockProfile()}

analysis = NutritionIntelligenceEngine.analyze(parsed_data_nutella, user_profile)
print(json.dumps(analysis, indent=2))
