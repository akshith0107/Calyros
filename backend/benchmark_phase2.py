import json
import os
import sys
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.nutrition_intelligence_engine import NutritionIntelligenceEngine

CORE_PRODUCTS = [
    {"name": "Soda", "calories": 150, "sugar": 39, "added_sugar": 39, "protein": 0, "fiber": 0, "sodium": 45, "ingredients": ["carbonated water", "high fructose corn syrup", "caramel color", "phosphoric acid", "natural flavors", "caffeine"]},
    {"name": "Fruit Juice", "calories": 110, "sugar": 24, "added_sugar": 0, "protein": 0, "fiber": 0, "sodium": 10, "ingredients": ["apple juice", "ascorbic acid"]},
    {"name": "Greek Yogurt", "calories": 100, "sugar": 6, "added_sugar": 0, "protein": 15, "fiber": 0, "sodium": 60, "ingredients": ["milk", "live active cultures"]},
    {"name": "Whey Protein", "calories": 120, "sugar": 2, "added_sugar": 0, "protein": 25, "fiber": 1, "sodium": 150, "ingredients": ["whey protein isolate", "cocoa powder", "natural flavor", "stevia", "sucralose"]},
    {"name": "Protein Bar", "calories": 200, "sugar": 1, "added_sugar": 0, "protein": 20, "fiber": 10, "sodium": 200, "ingredients": ["protein blend", "chicory root fiber", "erythritol", "almonds", "palm oil", "sea salt"]},
    {"name": "Oatmeal", "calories": 150, "sugar": 1, "added_sugar": 0, "protein": 5, "fiber": 4, "sodium": 0, "ingredients": ["rolled oats"]},
    {"name": "Almonds", "calories": 160, "sugar": 1, "added_sugar": 0, "protein": 6, "fiber": 4, "sodium": 0, "ingredients": ["almonds"]},
    {"name": "Doritos", "calories": 150, "sugar": 1, "added_sugar": 1, "protein": 2, "fiber": 1, "sodium": 210, "ingredients": ["corn", "vegetable oil", "maltodextrin", "salt", "cheese", "red 40", "yellow 5", "monosodium glutamate"]},
    {"name": "Snickers", "calories": 250, "sugar": 28, "added_sugar": 25, "protein": 4, "fiber": 1, "sodium": 120, "ingredients": ["milk chocolate", "peanuts", "corn syrup", "sugar", "palm oil"]},
    {"name": "Monster Energy", "calories": 210, "sugar": 54, "added_sugar": 54, "protein": 0, "fiber": 0, "sodium": 370, "ingredients": ["carbonated water", "sugar", "glucose", "citric acid", "natural flavors", "caffeine", "sodium benzoate", "red 40"]}
]

def generate_100_products():
    products = []
    # Add the core 10
    products.extend(CORE_PRODUCTS)
    
    # Generate 90 more with variations
    for i in range(11, 101):
        base = random.choice(CORE_PRODUCTS)
        new_prod = dict(base)
        new_prod["name"] = f"{base['name']} Variant {i}"
        new_prod["sugar"] = max(0, base["sugar"] + random.randint(-5, 5))
        new_prod["added_sugar"] = min(new_prod["sugar"], max(0, base["added_sugar"] + random.randint(-5, 5)))
        new_prod["protein"] = max(0, base["protein"] + random.randint(-3, 10))
        new_prod["fiber"] = max(0, base["fiber"] + random.randint(-2, 5))
        new_prod["calories"] = max(10, base["calories"] + random.randint(-50, 100))
        products.append(new_prod)
    return products

PRODUCTS = generate_100_products()

class MockProfile:
    health_goal = "weight loss" # Hardcode to weight loss for consistency

def run_benchmark(output_file):
    results = []
    
    for product in PRODUCTS:
        parsed_data = {
            "nutrition_facts": {
                "calories": product["calories"],
                "sugar": product["sugar"],
                "added_sugar": product["added_sugar"],
                "protein": product["protein"],
                "fiber": product["fiber"],
                "sodium": product["sodium"],
            },
            "ingredients": product["ingredients"],
            "extraction_confidence": 95,
            "ocr_confidence": 95
        }
        
        analysis = NutritionIntelligenceEngine.analyze(parsed_data, MockProfile())
        
        results.append({
            "name": product["name"],
            "calories": product["calories"],
            "sugar": product["sugar"],
            "added_sugar": product["added_sugar"],
            "protein": product["protein"],
            "fiber": product["fiber"],
            "overall_score": analysis.get("overall_score", 0),
            "nutrition_score": analysis.get("nutrition_score", 0),
            "ingredient_score": analysis.get("ingredient_quality_score", 0),
            "processing_score": analysis.get("processing_score", 0),
            "goal_alignment_score": analysis.get("goal_alignment_score", 0),
            "nutrient_density_score": analysis.get("nutrient_density_score", 0),
            "satiety_score": analysis.get("satiety_score", 0),
            "protein_quality_score": analysis.get("protein_quality_score", 0),
            "sugar_quality_score": analysis.get("sugar_quality_score", 0),
            "score_deductions": analysis.get("score_deductions", []),
            "goal_specific_reasoning": analysis.get("goal_specific_reasoning", []),
            "ingredient_findings": analysis.get("ingredient_findings", [])
        })

    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Benchmark completed: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_benchmark(sys.argv[1])
    else:
        run_benchmark("benchmark_phase2_results.json")
