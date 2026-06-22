import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from app.services.nutrition_intelligence_engine import NutritionIntelligenceEngine

class MockProfile:
    def __init__(self, goal, allergies=[]):
        self.health_goal = goal
        self.allergies = allergies

products = [
    {
        "product_name": "Nutella",
        "ingredients": ["SUGAR", "PALM OIL", "HAZELNUTS", "COCOA", "SKIM MILK", "REDUCED MINERALS WHEY (MILK)", "LECITHIN AS EMULSIFIER (SOY)", "VANILLIN: AN ARTIFICIAL FLAVOR"],
        "allergens": ["MILK", "SOY", "HAZELNUTS"],
        "nutrition_facts": {"calories": 200, "sugar": 21, "protein": 2, "fiber": 1, "sodium": 15},
        "additives": ["VANILLIN"]
    },
    {
        "product_name": "Greek Yogurt (Plain)",
        "ingredients": ["Cultured nonfat milk"],
        "allergens": ["Milk"],
        "nutrition_facts": {"calories": 90, "sugar": 5, "protein": 16, "fiber": 0, "sodium": 60},
        "additives": []
    },
    {
        "product_name": "Whey Protein Isolate",
        "ingredients": ["Whey Protein Isolate", "Cocoa Powder", "Natural Flavors", "Sucralose", "Soy Lecithin"],
        "allergens": ["Milk", "Soy"],
        "nutrition_facts": {"calories": 120, "sugar": 1, "protein": 25, "fiber": 1, "sodium": 150},
        "additives": ["Sucralose", "Natural Flavors"]
    },
    {
        "product_name": "Coca-Cola",
        "ingredients": ["Carbonated Water", "High Fructose Corn Syrup", "Caramel Color", "Phosphoric Acid", "Natural Flavors", "Caffeine"],
        "allergens": [],
        "nutrition_facts": {"calories": 140, "sugar": 39, "protein": 0, "fiber": 0, "sodium": 45},
        "additives": ["Caramel Color", "Phosphoric Acid"]
    },
    {
        "product_name": "Doritos Nacho Cheese",
        "ingredients": ["Corn", "Vegetable Oil (Corn, Canola, and/or Sunflower Oil)", "Maltodextrin", "Salt", "Cheddar Cheese", "Whey", "Monosodium Glutamate", "Artificial Color (Red 40, Yellow 6, Yellow 5)"],
        "allergens": ["Milk"],
        "nutrition_facts": {"calories": 150, "sugar": 1, "protein": 2, "fiber": 1, "sodium": 210},
        "additives": ["Monosodium Glutamate", "Artificial Color (Red 40, Yellow 6, Yellow 5)"]
    },
    {
        "product_name": "Rolled Oats",
        "ingredients": ["Whole Grain Rolled Oats"],
        "allergens": [],
        "nutrition_facts": {"calories": 150, "sugar": 1, "protein": 5, "fiber": 4, "sodium": 0},
        "additives": []
    },
    {
        "product_name": "Peanut Butter (Natural)",
        "ingredients": ["Peanuts", "Salt"],
        "allergens": ["Peanuts"],
        "nutrition_facts": {"calories": 190, "sugar": 2, "protein": 8, "fiber": 3, "sodium": 100},
        "additives": []
    },
    {
        "product_name": "Protein Bar (Quest)",
        "ingredients": ["Protein Blend (Milk Protein Isolate, Whey Protein Isolate)", "Polydextrose", "Almonds", "Water", "Erythritol", "Natural Flavors", "Stevia", "Sucralose"],
        "allergens": ["Milk", "Almonds"],
        "nutrition_facts": {"calories": 200, "sugar": 1, "protein": 21, "fiber": 14, "sodium": 220},
        "additives": ["Natural Flavors", "Sucralose"]
    },
    {
        "product_name": "Energy Drink (Monster)",
        "ingredients": ["Carbonated Water", "Sugar", "Glucose", "Citric Acid", "Taurine", "Sodium Citrate", "Panax Ginseng Extract", "L-Carnitine", "Caffeine", "Sorbic Acid (Preservative)", "Benzoic Acid (Preservative)", "Sucralose", "Red 40"],
        "allergens": [],
        "nutrition_facts": {"calories": 210, "sugar": 54, "protein": 0, "fiber": 0, "sodium": 370},
        "additives": ["Taurine", "Red 40", "Sucralose"],
        "preservatives": ["Sorbic Acid", "Benzoic Acid"]
    },
    {
        "product_name": "Sports Drink (Gatorade)",
        "ingredients": ["Water", "Sugar", "Dextrose", "Citric Acid", "Salt", "Sodium Citrate", "Monopotassium Phosphate", "Modified Food Starch", "Natural Flavor", "Yellow 5"],
        "allergens": [],
        "nutrition_facts": {"calories": 140, "sugar": 34, "protein": 0, "fiber": 0, "sodium": 270},
        "additives": ["Yellow 5", "Natural Flavor"]
    },
    {
        "product_name": "Breakfast Cereal (Froot Loops)",
        "ingredients": ["Corn flour blend", "sugar", "wheat flour", "whole grain oat flour", "modified food starch", "hydrogenated vegetable oil", "salt", "red 40", "yellow 5", "blue 1", "bht for freshness"],
        "allergens": ["Wheat"],
        "nutrition_facts": {"calories": 150, "sugar": 12, "protein": 2, "fiber": 2, "sodium": 210},
        "additives": ["red 40", "yellow 5", "blue 1"],
        "preservatives": ["bht"]
    },
    {
        "product_name": "Instant Noodles",
        "ingredients": ["Enriched wheat flour", "Palm oil", "Salt", "Monosodium glutamate", "Hydrolyzed soy protein", "Garlic powder", "Artificial flavor", "TBHQ (preservative)"],
        "allergens": ["Wheat", "Soy"],
        "nutrition_facts": {"calories": 380, "sugar": 1, "protein": 8, "fiber": 2, "sodium": 1500},
        "additives": ["Monosodium glutamate", "Artificial flavor"],
        "preservatives": ["TBHQ"]
    },
    {
        "product_name": "Dark Chocolate (85%)",
        "ingredients": ["Chocolate", "Cocoa powder", "Cocoa butter", "Sugar", "Bourbon vanilla bean"],
        "allergens": [],
        "nutrition_facts": {"calories": 210, "sugar": 5, "protein": 4, "fiber": 6, "sodium": 0},
        "additives": []
    },
    {
        "product_name": "Almond Milk (Unsweetened)",
        "ingredients": ["Almondmilk (Water, Almonds)", "Calcium Carbonate", "Sunflower Lecithin", "Sea Salt", "Potassium Citrate", "Natural Flavors", "Locust Bean Gum", "Gellan Gum", "Vitamin A Palmitate", "Vitamin D2"],
        "allergens": ["Almonds"],
        "nutrition_facts": {"calories": 30, "sugar": 0, "protein": 1, "fiber": 1, "sodium": 170},
        "additives": ["Gellan Gum", "Locust Bean Gum"]
    },
    {
        "product_name": "Plant Protein Powder",
        "ingredients": ["Pea Protein Isolate", "Brown Rice Protein", "Natural Vanilla Flavor", "Stevia Extract", "Xanthan Gum"],
        "allergens": [],
        "nutrition_facts": {"calories": 120, "sugar": 0, "protein": 24, "fiber": 2, "sodium": 200},
        "additives": ["Xanthan Gum"]
    },
    {
        "product_name": "Fruit Juice (Orange, 100%)",
        "ingredients": ["100% Orange Juice"],
        "allergens": [],
        "nutrition_facts": {"calories": 110, "sugar": 22, "protein": 2, "fiber": 0, "sodium": 0},
        "additives": []
    },
    {
        "product_name": "Granola",
        "ingredients": ["Whole grain oats", "Sugar", "Canola oil", "Rice flour", "Honey", "Salt", "Brown sugar syrup", "Baking soda", "Soy lecithin", "Natural flavor"],
        "allergens": ["Soy"],
        "nutrition_facts": {"calories": 200, "sugar": 12, "protein": 4, "fiber": 3, "sodium": 140},
        "additives": ["Natural flavor"]
    },
    {
        "product_name": "Ice Cream (Vanilla)",
        "ingredients": ["Milk", "Cream", "Sugar", "Skim Milk", "Vanilla Extract", "Guar Gum", "Carob Bean Gum"],
        "allergens": ["Milk"],
        "nutrition_facts": {"calories": 250, "sugar": 24, "protein": 4, "fiber": 0, "sodium": 50},
        "additives": ["Guar Gum", "Carob Bean Gum"]
    },
    {
        "product_name": "Cheddar Cheese",
        "ingredients": ["Pasteurized Milk", "Cheese Cultures", "Salt", "Enzymes", "Annatto (Color)"],
        "allergens": ["Milk"],
        "nutrition_facts": {"calories": 110, "sugar": 0, "protein": 7, "fiber": 0, "sodium": 180},
        "additives": ["Annatto"]
    },
    {
        "product_name": "Whole Wheat Bread",
        "ingredients": ["Whole wheat flour", "Water", "Sugar", "Wheat gluten", "Yeast", "Soybean oil", "Salt", "Calcium propionate (preservative)", "Datem", "Monoglycerides"],
        "allergens": ["Wheat"],
        "nutrition_facts": {"calories": 100, "sugar": 3, "protein": 5, "fiber": 3, "sodium": 160},
        "additives": ["Datem", "Monoglycerides"],
        "preservatives": ["Calcium propionate"]
    }
]

profile = MockProfile("General Health")

results = []
for p in products:
    parsed_data = {
        "nutrition_facts": p["nutrition_facts"],
        "ingredients": p["ingredients"],
        "allergens": p["allergens"],
        "additives": p.get("additives", []),
        "preservatives": p.get("preservatives", [])
    }
    ans = NutritionIntelligenceEngine.analyze(parsed_data, profile)
    results.append({
        "product": p["product_name"],
        "health_score": ans["score"],
        "ingredient_score": ans.get("ingredient_quality_score"),
        "processing": ans.get("processing_assessment"),
        "key_findings": ans["key_findings"],
        "ingredient_findings": ans.get("ingredient_findings")
    })

with open("benchmark_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("Benchmark complete. Results saved to benchmark_results.json")
