import json
import os
import sys

# Add the backend to path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.nutrition_intelligence_engine import NutritionIntelligenceEngine

PRODUCTS = [
    # Natural / Whole Foods
    {"name": "Apple", "sugar": 19, "added_sugar": 0, "protein": 0, "fiber": 4, "sodium": 0, "ingredients": ["apple"]},
    {"name": "Banana", "sugar": 14, "added_sugar": 0, "protein": 1, "fiber": 3, "sodium": 0, "ingredients": ["banana"]},
    {"name": "Broccoli", "sugar": 2, "added_sugar": 0, "protein": 3, "fiber": 2, "sodium": 30, "ingredients": ["broccoli"]},
    {"name": "Spinach", "sugar": 0, "added_sugar": 0, "protein": 3, "fiber": 2, "sodium": 24, "ingredients": ["spinach"]},
    {"name": "Sweet Potato", "sugar": 6, "added_sugar": 0, "protein": 2, "fiber": 4, "sodium": 41, "ingredients": ["sweet potato"]},
    {"name": "Brown Rice", "sugar": 0, "added_sugar": 0, "protein": 5, "fiber": 3, "sodium": 10, "ingredients": ["brown rice"]},
    {"name": "Quinoa", "sugar": 0, "added_sugar": 0, "protein": 8, "fiber": 5, "sodium": 10, "ingredients": ["quinoa"]},
    {"name": "Black Beans", "sugar": 0, "added_sugar": 0, "protein": 15, "fiber": 15, "sodium": 10, "ingredients": ["black beans"]},
    {"name": "Lentils", "sugar": 2, "added_sugar": 0, "protein": 18, "fiber": 16, "sodium": 5, "ingredients": ["lentils"]},
    {"name": "Oats", "sugar": 1, "added_sugar": 0, "protein": 5, "fiber": 4, "sodium": 0, "ingredients": ["rolled oats"]},
    {"name": "Chia Seeds", "sugar": 0, "added_sugar": 0, "protein": 5, "fiber": 10, "sodium": 5, "ingredients": ["chia seeds"]},
    {"name": "Flax Seeds", "sugar": 0, "added_sugar": 0, "protein": 5, "fiber": 8, "sodium": 10, "ingredients": ["flax seeds"]},
    {"name": "Almonds", "sugar": 1, "added_sugar": 0, "protein": 6, "fiber": 4, "sodium": 0, "ingredients": ["almonds"]},
    {"name": "Walnuts", "sugar": 1, "added_sugar": 0, "protein": 4, "fiber": 2, "sodium": 0, "ingredients": ["walnuts"]},
    {"name": "Chicken Breast", "sugar": 0, "added_sugar": 0, "protein": 31, "fiber": 0, "sodium": 74, "ingredients": ["chicken breast"]},
    {"name": "Salmon", "sugar": 0, "added_sugar": 0, "protein": 25, "fiber": 0, "sodium": 50, "ingredients": ["salmon"]},
    {"name": "Eggs", "sugar": 1, "added_sugar": 0, "protein": 6, "fiber": 0, "sodium": 70, "ingredients": ["eggs"]},
    {"name": "Greek Yogurt (Plain)", "sugar": 6, "added_sugar": 0, "protein": 15, "fiber": 0, "sodium": 60, "ingredients": ["milk", "live active cultures"]},
    
    # Processed but Generally Healthy
    {"name": "Whole Wheat Bread", "sugar": 3, "added_sugar": 2, "protein": 5, "fiber": 3, "sodium": 150, "ingredients": ["whole wheat flour", "water", "yeast", "sugar", "salt"]},
    {"name": "Peanut Butter", "sugar": 3, "added_sugar": 1, "protein": 8, "fiber": 2, "sodium": 100, "ingredients": ["peanuts", "sugar", "palm oil", "salt"]},
    {"name": "Hummus", "sugar": 1, "added_sugar": 0, "protein": 2, "fiber": 2, "sodium": 120, "ingredients": ["chickpeas", "tahini", "olive oil", "lemon juice", "garlic", "salt"]},
    {"name": "Protein Powder", "sugar": 2, "added_sugar": 0, "protein": 25, "fiber": 1, "sodium": 150, "ingredients": ["whey protein isolate", "cocoa powder", "natural flavor", "stevia"]},
    {"name": "Canned Tuna", "sugar": 0, "added_sugar": 0, "protein": 20, "fiber": 0, "sodium": 300, "ingredients": ["tuna", "water", "salt"]},
    {"name": "Olive Oil", "sugar": 0, "added_sugar": 0, "protein": 0, "fiber": 0, "sodium": 0, "ingredients": ["extra virgin olive oil"]},
    {"name": "Almond Milk (Unsweetened)", "sugar": 0, "added_sugar": 0, "protein": 1, "fiber": 1, "sodium": 150, "ingredients": ["almondmilk", "calcium carbonate", "sea salt", "sunflower lecithin", "gellan gum"]},
    {"name": "Tofu", "sugar": 0, "added_sugar": 0, "protein": 10, "fiber": 1, "sodium": 10, "ingredients": ["water", "soybeans", "calcium sulfate"]},
    {"name": "Cottage Cheese", "sugar": 4, "added_sugar": 0, "protein": 12, "fiber": 0, "sodium": 400, "ingredients": ["cultured skim milk", "cream", "salt"]},
    {"name": "Dark Chocolate (85%)", "sugar": 4, "added_sugar": 4, "protein": 2, "fiber": 3, "sodium": 10, "ingredients": ["chocolate", "cocoa butter", "sugar", "soy lecithin", "vanilla"]},

    # Ultra-Processed / Unhealthy
    {"name": "Coca-Cola", "sugar": 39, "added_sugar": 39, "protein": 0, "fiber": 0, "sodium": 45, "ingredients": ["carbonated water", "high fructose corn syrup", "caramel color", "phosphoric acid", "natural flavors", "caffeine"]},
    {"name": "Diet Coke", "sugar": 0, "added_sugar": 0, "protein": 0, "fiber": 0, "sodium": 40, "ingredients": ["carbonated water", "caramel color", "aspartame", "phosphoric acid", "potassium benzoate", "natural flavors", "citric acid", "caffeine"]},
    {"name": "Doritos", "sugar": 1, "added_sugar": 1, "protein": 2, "fiber": 1, "sodium": 210, "ingredients": ["corn", "vegetable oil", "maltodextrin", "salt", "cheddar cheese", "whey", "monosodium glutamate", "buttermilk", "romano cheese", "whey protein concentrate", "onion powder", "corn flour", "natural and artificial flavor", "dextrose", "tomato powder", "lactose", "spices", "artificial color", "yellow 6", "yellow 5", "red 40", "lactic acid", "citric acid", "sugar", "garlic powder", "skim milk", "red and green bell pepper powder", "disodium inosinate", "disodium guanylate"]},
    {"name": "Oreos", "sugar": 14, "added_sugar": 14, "protein": 1, "fiber": 1, "sodium": 90, "ingredients": ["sugar", "unbleached enriched flour", "palm and/or canola oil", "cocoa", "high fructose corn syrup", "leavening", "salt", "soy lecithin", "chocolate", "artificial flavor"]},
    {"name": "Monster Energy", "sugar": 54, "added_sugar": 54, "protein": 0, "fiber": 0, "sodium": 370, "ingredients": ["carbonated water", "sugar", "glucose", "citric acid", "natural flavors", "taurine", "sodium citrate", "color added", "panax ginseng extract", "l-carnitine l-tartrate", "caffeine", "sorbic acid", "benzoic acid", "niacinamide", "sucralose", "salt", "d-glucuronolactone", "inositol", "guarana extract", "pyridoxine hydrochloride", "sucralose", "riboflavin", "maltodextrin", "cyanocobalamin"]},
    {"name": "Pop-Tarts", "sugar": 30, "added_sugar": 30, "protein": 4, "fiber": 1, "sodium": 340, "ingredients": ["enriched flour", "corn syrup", "high fructose corn syrup", "dextrose", "soybean and palm oil", "sugar", "cracker meal", "wheat starch", "salt", "dried strawberries", "dried pears", "dried apples", "leavening", "citric acid", "gelatin", "soy lecithin", "modified wheat starch", "caramel color", "xanthan gum", "red 40", "yellow 6", "blue 1"]},
    {"name": "Cheetos", "sugar": 1, "added_sugar": 0, "protein": 2, "fiber": 0, "sodium": 250, "ingredients": ["enriched corn meal", "vegetable oil", "cheese seasoning", "whey", "cheddar cheese", "canola oil", "maltodextrin", "salt", "whey protein concentrate", "monosodium glutamate", "natural and artificial flavors", "lactic acid", "citric acid", "artificial color", "yellow 6"]},
    {"name": "Snickers", "sugar": 28, "added_sugar": 25, "protein": 4, "fiber": 1, "sodium": 120, "ingredients": ["milk chocolate", "peanuts", "corn syrup", "sugar", "palm oil", "skim milk", "lactose", "salt", "egg whites", "artificial flavor"]},
    {"name": "Frozen Pizza", "sugar": 5, "added_sugar": 3, "protein": 14, "fiber": 2, "sodium": 760, "ingredients": ["enriched flour", "water", "cheese", "tomato paste", "pepperoni", "soybean oil", "sugar", "salt", "yeast", "spices", "garlic powder", "sodium nitrite", "bha", "bht", "citric acid"]},
    {"name": "Instant Noodles", "sugar": 2, "added_sugar": 1, "protein": 5, "fiber": 2, "sodium": 890, "ingredients": ["enriched wheat flour", "palm oil", "salt", "monosodium glutamate", "hydrolyzed corn protein", "sugar", "dehydrated vegetables", "spices", "garlic powder", "tbhq"]},
    {"name": "Gummy Bears", "sugar": 14, "added_sugar": 14, "protein": 2, "fiber": 0, "sodium": 5, "ingredients": ["corn syrup", "sugar", "gelatin", "dextrose", "citric acid", "artificial and natural flavors", "palm kernel oil", "carnauba wax", "yellow 5", "red 40", "blue 1"]},
    {"name": "Margarine", "sugar": 0, "added_sugar": 0, "protein": 0, "fiber": 0, "sodium": 105, "ingredients": ["vegetable oil blend", "water", "salt", "whey", "soy lecithin", "vegetable mono and diglycerides", "potassium sorbate", "citric acid", "artificial flavor", "vitamin a palmitate", "beta carotene"]},
    {"name": "Cereal (Froot Loops)", "sugar": 12, "added_sugar": 12, "protein": 2, "fiber": 2, "sodium": 210, "ingredients": ["corn flour blend", "sugar", "wheat flour", "whole oat flour", "modified corn starch", "contains 2% or less of vegetable oil", "salt", "natural flavor", "red 40", "yellow 5", "blue 1", "yellow 6", "bht for freshness"]},
    {"name": "Ketchup", "sugar": 4, "added_sugar": 4, "protein": 0, "fiber": 0, "sodium": 160, "ingredients": ["tomato concentrate", "distilled vinegar", "high fructose corn syrup", "corn syrup", "salt", "spice", "onion powder", "natural flavoring"]},
    {"name": "Fruit Juice (100% Apple)", "sugar": 24, "added_sugar": 0, "protein": 0, "fiber": 0, "sodium": 10, "ingredients": ["apple juice from concentrate", "ascorbic acid"]},
    {"name": "Nutella", "sugar": 21, "added_sugar": 21, "protein": 2, "fiber": 1, "sodium": 15, "ingredients": ["sugar", "palm oil", "hazelnuts", "skim milk", "cocoa", "soy lecithin", "vanillin"]},
    {"name": "Hot Dog", "sugar": 1, "added_sugar": 1, "protein": 5, "fiber": 0, "sodium": 480, "ingredients": ["mechanically separated turkey", "pork", "water", "corn syrup", "salt", "contains 2% or less of: potassium lactate", "sodium diacetate", "sodium erythorbate", "sodium nitrite"]},
    {"name": "Bacon", "sugar": 0, "added_sugar": 0, "protein": 4, "fiber": 0, "sodium": 190, "ingredients": ["pork", "water", "salt", "sugar", "sodium phosphates", "sodium erythorbate", "sodium nitrite"]},
    {"name": "Mayonnaise", "sugar": 0, "added_sugar": 0, "protein": 0, "fiber": 0, "sodium": 90, "ingredients": ["soybean oil", "water", "whole eggs and egg yolks", "vinegar", "salt", "sugar", "lemon juice", "calcium disodium edta", "natural flavors"]},
    {"name": "BBQ Sauce", "sugar": 16, "added_sugar": 15, "protein": 0, "fiber": 0, "sodium": 300, "ingredients": ["high fructose corn syrup", "distilled vinegar", "tomato paste", "modified corn starch", "contains less than 2% of salt", "pineapple juice concentrate", "natural smoke flavor", "spice", "caramel color", "molasses", "sodium benzoate", "garlic", "mustard flour", "corn syrup", "sugar", "tamarind", "natural flavor", "celery seed"]},
    {"name": "Ranch Dressing", "sugar": 1, "added_sugar": 1, "protein": 0, "fiber": 0, "sodium": 260, "ingredients": ["vegetable oil", "water", "sugar", "salt", "nonfat buttermilk", "egg yolk", "natural flavors", "less than 1% of: spices", "garlic", "onion", "vinegar", "phosphoric acid", "xanthan gum", "modified food starch", "artificial flavors", "disodium phosphate", "sorbic acid", "calcium disodium edta", "disodium inosinate", "disodium guanylate"]},
    {"name": "Ice Cream", "sugar": 21, "added_sugar": 16, "protein": 4, "fiber": 0, "sodium": 50, "ingredients": ["milk", "cream", "sugar", "corn syrup", "whey", "nonfat milk", "cellulose gel", "cellulose gum", "mono and diglycerides", "carrageenan", "natural and artificial flavors", "annatto color"]}
]

class MockProfile:
    health_goal = "general"

def run_benchmark(output_file):
    results = []
    
    for product in PRODUCTS:
        # Mock parsed data from ExtractionService
        parsed_data = {
            "nutrition_facts": {
                "sugar": product["sugar"],
                "added_sugar": product["added_sugar"],
                "protein": product["protein"],
                "fiber": product["fiber"],
                "sodium": product["sodium"],
            },
            "ingredients": product["ingredients"],
            "extraction_confidence": 95 # Adding confidence mock
        }
        
        analysis = NutritionIntelligenceEngine.analyze(parsed_data, MockProfile())
        
        # Determine exactly what score fields exist
        overall = analysis.get("overall_score") or analysis.get("score")
        nutrition = analysis.get("nutrition_score")
        ingredient = analysis.get("ingredient_quality_score")
        processing = analysis.get("processing_score")
        goal_alignment = analysis.get("goal_alignment_score")
        
        results.append({
            "name": product["name"],
            "sugar": product["sugar"],
            "added_sugar": product["added_sugar"],
            "overall_score": overall,
            "nutrition_score": nutrition,
            "ingredient_score": ingredient,
            "processing_score": processing,
            "goal_alignment_score": goal_alignment,
            "classification": analysis.get("classification"),
            "concerns": analysis.get("concerns", []),
            "ingredient_findings": analysis.get("ingredient_findings", [])
        })

    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Benchmark completed: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_benchmark(sys.argv[1])
    else:
        run_benchmark("benchmark_results.json")
