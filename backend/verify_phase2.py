import json
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.nutrition_intelligence_engine import NutritionIntelligenceEngine

PRODUCTS = [
    {
        "name": "Nutella",
        "calories": 200,
        "sugar": 21,
        "added_sugar": 21,
        "protein": 2,
        "fiber": 1,
        "sodium": 15,
        "ingredients": ["sugar", "palm oil", "hazelnuts", "skim milk", "cocoa", "soy lecithin", "vanillin"]
    },
    {
        "name": "Coca-Cola",
        "calories": 140,
        "sugar": 39,
        "added_sugar": 39,
        "protein": 0,
        "fiber": 0,
        "sodium": 45,
        "ingredients": ["carbonated water", "high fructose corn syrup", "caramel color", "phosphoric acid", "natural flavors", "caffeine"]
    },
    {
        "name": "Plain Greek Yogurt",
        "calories": 100,
        "sugar": 6,
        "added_sugar": 0,
        "protein": 15,
        "fiber": 0,
        "sodium": 60,
        "ingredients": ["milk", "live active cultures"]
    },
    {
        "name": "Whey Protein Isolate",
        "calories": 120,
        "sugar": 1,
        "added_sugar": 0,
        "protein": 25,
        "fiber": 1,
        "sodium": 150,
        "ingredients": ["whey protein isolate", "cocoa powder", "natural flavor", "sucralose"]
    },
    {
        "name": "Doritos",
        "calories": 150,
        "sugar": 1,
        "added_sugar": 1,
        "protein": 2,
        "fiber": 1,
        "sodium": 210,
        "ingredients": ["corn", "vegetable oil", "maltodextrin", "salt", "cheese", "red 40", "yellow 5", "monosodium glutamate"]
    }
]

GOALS = ["Weight Loss", "Muscle Gain", "Heart Health"]

class MockProfile:
    def __init__(self, goal):
        self.health_goal = goal

def run_verification(output_file):
    report = []
    report.append("# Phase 2 Runtime Verification\n")
    
    for product in PRODUCTS:
        report.append(f"## {product['name']}\n")
        
        for goal in GOALS:
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
            
            analysis = NutritionIntelligenceEngine.analyze(parsed_data, MockProfile(goal))
            
            report.append(f"### Goal: {goal}\n")
            report.append("```json\n")
            
            output = {
                "overall_score": analysis.get("overall_score"),
                "satiety_score": analysis.get("satiety_score"),
                "protein_quality_score": analysis.get("protein_quality_score"),
                "sugar_quality_score": analysis.get("sugar_quality_score"),
                "nutrient_density_score": analysis.get("nutrient_density_score"),
                "goal_alignment_score": analysis.get("goal_alignment_score"),
                "processing_assessment": analysis.get("processing_assessment"),
                "score_deductions": analysis.get("score_deductions"),
                "goal_specific_reasoning": analysis.get("goal_specific_reasoning")
            }
            
            report.append(json.dumps(output, indent=2))
            report.append("\n```\n")

    with open(output_file, 'w') as f:
        f.writelines(report)
    print(f"Verification completed: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_verification(sys.argv[1])
    else:
        run_verification("verification_report.md")
