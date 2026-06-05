"""
Phase 4.5 — AI Accuracy Validation Suite
Tests OCR + Llama 4 Scout extraction accuracy against a synthetic dataset.
"""
import asyncio
import json
import time
import sys
import os

# Ensure app modules are importable
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from app.services.extraction_service import extraction_service
from app.services.nutrition_parser import nutrition_parser
from app.services.scoring_service import scoring_service

# ============================================================
# SYNTHETIC VALIDATION DATASET
# Each sample simulates OCR text from a real nutrition label.
# ============================================================
VALIDATION_DATASET = [
    {
        "id": "healthy_granola",
        "category": "Healthy Product",
        "ocr_text": (
            "Nature's Path Organic Granola\n"
            "Nutrition Facts\nServing Size 3/4 cup (55g)\n"
            "Calories 230\nTotal Fat 6g\nSaturated Fat 0.5g\nTrans Fat 0g\n"
            "Cholesterol 0mg\nSodium 90mg\nTotal Carbohydrate 40g\n"
            "Dietary Fiber 4g\nTotal Sugars 10g\nAdded Sugars 5g\n"
            "Protein 5g\nIngredients: Rolled oats, cane sugar, sunflower oil, "
            "brown rice syrup, coconut, vanilla extract."
        ),
        "expected": {
            "product_name_contains": "granola",
            "calories": 230,
            "protein": 5,
            "total_fat": 6,
            "carbohydrates": 40,
            "sugar": 10,
            "sodium": 90,
            "expected_score_range": [40, 70],  # Moderate
        }
    },
    {
        "id": "ultra_processed_chips",
        "category": "Ultra-Processed Product",
        "ocr_text": (
            "Doritos Nacho Cheese Tortilla Chips\n"
            "Nutrition Facts\nServing Size About 12 chips (28g)\n"
            "Calories 140\nTotal Fat 8g\nSaturated Fat 1g\nTrans Fat 0g\n"
            "Sodium 210mg\nTotal Carbohydrate 17g\n"
            "Dietary Fiber 1g\nTotal Sugars 1g\nAdded Sugars 0g\n"
            "Protein 2g\nIngredients: Corn, vegetable oil (corn, canola, and/or sunflower oil), "
            "maltodextrin, salt, cheddar cheese, whey, monosodium glutamate, "
            "buttermilk, romano cheese, whey protein concentrate, onion powder, "
            "artificial color including Yellow 6, Red 40, citric acid, "
            "garlic powder, lactic acid, sodium caseinate."
        ),
        "expected": {
            "product_name_contains": "doritos",
            "calories": 140,
            "protein": 2,
            "total_fat": 8,
            "carbohydrates": 17,
            "sugar": 1,
            "sodium": 210,
            "expected_score_range": [10, 45],  # Unhealthy
        }
    },
    {
        "id": "high_sugar_soda",
        "category": "High-Sugar Product",
        "ocr_text": (
            "Coca-Cola Classic\n"
            "Nutrition Facts\nServing Size 1 can (355mL)\n"
            "Calories 140\nTotal Fat 0g\nSodium 45mg\n"
            "Total Carbohydrate 39g\nTotal Sugars 39g\nAdded Sugars 39g\n"
            "Protein 0g\nIngredients: Carbonated water, high fructose corn syrup, "
            "caramel color, phosphoric acid, natural flavors, caffeine."
        ),
        "expected": {
            "product_name_contains": "coca",
            "calories": 140,
            "protein": 0,
            "total_fat": 0,
            "carbohydrates": 39,
            "sugar": 39,
            "sodium": 45,
            "expected_score_range": [5, 30],  # Very unhealthy
        }
    },
    {
        "id": "high_protein_yogurt",
        "category": "High-Protein Product",
        "ocr_text": (
            "Fage Total 0% Greek Yogurt\n"
            "Nutrition Facts\nServing Size 1 container (170g)\n"
            "Calories 90\nTotal Fat 0g\nSaturated Fat 0g\nTrans Fat 0g\n"
            "Cholesterol 10mg\nSodium 65mg\nTotal Carbohydrate 5g\n"
            "Dietary Fiber 0g\nTotal Sugars 5g\nAdded Sugars 0g\n"
            "Protein 18g\nIngredients: Grade A pasteurized skimmed milk, "
            "live active yogurt cultures (L. Bulgaricus, S. Thermophilus, "
            "L. Acidophilus, Bifidus, L. Casei)."
        ),
        "expected": {
            "product_name_contains": "yogurt",
            "calories": 90,
            "protein": 18,
            "total_fat": 0,
            "carbohydrates": 5,
            "sugar": 5,
            "sodium": 65,
            "expected_score_range": [70, 100],  # Healthy
        }
    },
    {
        "id": "ingredient_list_only",
        "category": "Ingredient List (Partial Label)",
        "ocr_text": (
            "Product: Organic Almond Butter\n"
            "Ingredients: Dry roasted organic almonds.\n"
            "Nutrition Facts\nServing Size 2 tbsp (32g)\n"
            "Calories 190\nTotal Fat 17g\nSaturated Fat 1.5g\n"
            "Sodium 0mg\nTotal Carbohydrate 6g\nDietary Fiber 3g\n"
            "Total Sugars 1g\nProtein 7g"
        ),
        "expected": {
            "product_name_contains": "almond",
            "calories": 190,
            "protein": 7,
            "total_fat": 17,
            "carbohydrates": 6,
            "sugar": 1,
            "sodium": 0,
            "expected_score_range": [55, 85],  # Healthy fat source
        }
    },
    {
        "id": "energy_drink",
        "category": "High-Sugar Product",
        "ocr_text": (
            "Monster Energy Original\n"
            "Nutrition Facts\nServing Size 1 can (473mL)\n"
            "Calories 210\nTotal Fat 0g\nSodium 370mg\n"
            "Total Carbohydrate 54g\nTotal Sugars 54g\nAdded Sugars 54g\n"
            "Protein 0g\nIngredients: Carbonated water, sugar, glucose, citric acid, "
            "natural flavors, taurine, sodium citrate, color added, panax ginseng extract, "
            "L-carnitine, caffeine, sorbic acid, benzoic acid, niacinamide, "
            "sucralose, salt, D-glucuronolactone, inositol, guarana extract, "
            "pyridoxine hydrochloride, riboflavin, maltodextrin, cyanocobalamin."
        ),
        "expected": {
            "product_name_contains": "monster",
            "calories": 210,
            "protein": 0,
            "total_fat": 0,
            "carbohydrates": 54,
            "sugar": 54,
            "sodium": 370,
            "expected_score_range": [5, 25],  # Very unhealthy
        }
    },
]

TOLERANCE = 0.15  # 15% tolerance for numeric field matching

def check_numeric(actual, expected, field_name):
    """Check if actual value is within tolerance of expected."""
    if expected == 0:
        return actual == 0, actual
    error = abs(actual - expected) / expected
    return error <= TOLERANCE, actual

async def run_validation():
    results = []
    total_fields = 0
    correct_fields = 0
    product_id_correct = 0
    score_in_range = 0

    print("=" * 70)
    print("PHASE 4.5 — AI ACCURACY VALIDATION")
    print("=" * 70)

    for sample in VALIDATION_DATASET:
        print(f"\n--- Sample: {sample['id']} ({sample['category']}) ---")
        t0 = time.time()

        # Stage 1: Llama 4 Scout Extraction
        try:
            raw = await extraction_service.extract_data(sample["ocr_text"])
        except Exception as e:
            print(f"  EXTRACTION FAILED: {e}")
            results.append({"id": sample["id"], "status": "EXTRACTION_FAILED", "error": str(e)})
            continue
        
        extraction_time = time.time() - t0

        # Stage 2: Parse
        parsed = nutrition_parser.parse(raw)
        expected = sample["expected"]

        sample_result = {
            "id": sample["id"],
            "category": sample["category"],
            "extraction_time_s": round(extraction_time, 2),
            "field_results": {},
            "product_id_match": False,
            "score_in_range": False,
        }

        # Product Name Check
        actual_name = (parsed.get("product_name") or "").lower()
        name_match = expected["product_name_contains"].lower() in actual_name
        sample_result["product_id_match"] = name_match
        if name_match:
            product_id_correct += 1
        print(f"  Product Name: '{parsed.get('product_name')}' -> {'✓' if name_match else '✗'}")

        # Nutrition Field Checks
        facts = parsed.get("nutrition_facts", {})
        for field in ["calories", "protein", "total_fat", "carbohydrates", "sugar", "sodium"]:
            actual = facts.get(field, 0.0)
            exp = expected[field]
            match, val = check_numeric(actual, exp, field)
            sample_result["field_results"][field] = {
                "expected": exp, "actual": val, "match": match
            }
            total_fields += 1
            if match:
                correct_fields += 1
            status = "✓" if match else "✗"
            print(f"  {field:20s}: expected={exp:>8} actual={val:>8.1f} {status}")

        # Health Score Range Check (only if we have a mock scoring call)
        # We'll skip actual scoring since it requires DB context; just log expected range
        lo, hi = expected["expected_score_range"]
        sample_result["expected_score_range"] = [lo, hi]
        print(f"  Expected Score Range: [{lo}, {hi}]")

        results.append(sample_result)

    # ============================================================
    # SUMMARY
    # ============================================================
    nutrition_accuracy = (correct_fields / total_fields * 100) if total_fields else 0
    product_accuracy = (product_id_correct / len(VALIDATION_DATASET) * 100) if VALIDATION_DATASET else 0

    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)
    print(f"Samples Tested:              {len(VALIDATION_DATASET)}")
    print(f"Nutrition Fields Tested:     {total_fields}")
    print(f"Nutrition Fields Correct:    {correct_fields}")
    print(f"Nutrition Extraction Accuracy: {nutrition_accuracy:.1f}% (Target: >90%)")
    print(f"Product Identification:      {product_id_correct}/{len(VALIDATION_DATASET)} ({product_accuracy:.1f}%)")
    print(f"Target Met (Nutrition):      {'YES ✓' if nutrition_accuracy >= 90 else 'NO ✗'}")
    print(f"Target Met (Product ID):     {'YES ✓' if product_accuracy >= 90 else 'NO ✗'}")
    print("=" * 70)

    return {
        "samples": len(VALIDATION_DATASET),
        "nutrition_accuracy_pct": round(nutrition_accuracy, 1),
        "product_id_accuracy_pct": round(product_accuracy, 1),
        "nutrition_target_met": nutrition_accuracy >= 90,
        "product_id_target_met": product_accuracy >= 90,
        "details": results,
    }


if __name__ == "__main__":
    summary = asyncio.run(run_validation())
    print("\n[JSON Summary]")
    print(json.dumps(summary, indent=2, default=str))
