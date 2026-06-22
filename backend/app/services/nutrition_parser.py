from typing import Dict, Any, List, Union
import logging
import json

logger = logging.getLogger(__name__)

class NutritionParser:
    """Validates and normalizes raw JSON from Groq Llama 4 Scout model."""
    
    def parse(self, raw_data: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes raw dictionary from the LLM, sanitizes and returns valid dictionary
        with correct data types and constraints.
        """
        logger.info("Parsing nutrition data")
        
        if isinstance(raw_data, str):
            try:
                raw_data = json.loads(raw_data)
            except json.JSONDecodeError:
                raw_data = {}
        
        # 1. Base Product Data
        product_name = raw_data.get("product_name") or "Unknown Product"
        brand = raw_data.get("brand_name")
        serving_size = raw_data.get("serving_size")
        raw_text = raw_data.get("raw_text", "")
        
        # 2. Base Nutrition Facts (try to extract floats for backward DB compatibility where needed)
        raw_facts = raw_data.get("nutrition_facts", {})
        nutrition_facts = {}
        # Keep basic DB compatibility fields while saving everything dynamic
        db_fields = ["calories", "protein", "carbohydrates", "sugar", "fiber", "sodium", "total_fat", "saturated_fat", "trans_fat", "added_sugar"]
        
        # Map new suffix names to db fields
        key_mapping = {
            "protein_g": "protein",
            "fat_g": "total_fat",
            "saturated_fat_g": "saturated_fat",
            "trans_fat_g": "trans_fat",
            "carbohydrates_g": "carbohydrates",
            "fiber_g": "fiber",
            "sugar_g": "sugar",
            "added_sugar_g": "added_sugar",
            "sodium_mg": "sodium"
        }
        
        for k, v in raw_facts.items():
            mapped_k = key_mapping.get(k, k)
            if mapped_k in db_fields:
                nutrition_facts[mapped_k] = NutritionParser._safe_float(v)
            else:
                nutrition_facts[k] = v

        # Default DB fields to 0.0 if entirely missing so DB doesn't complain
        for db_f in db_fields:
            if db_f not in nutrition_facts:
                nutrition_facts[db_f] = 0.0

        # 3. Dynamic Arrays of Dicts
        def parse_obj_array(raw_arr) -> List[Dict[str, Any]]:
            if isinstance(raw_arr, list):
                return [i for i in raw_arr if isinstance(i, dict)]
            return []

        ingredient_intelligence = parse_obj_array(raw_data.get("ingredient_intelligence", []))

        # 4. Arrays of Strings
        def parse_array(raw_arr) -> List[str]:
            if isinstance(raw_arr, list):
                return [str(i).strip() for i in raw_arr if str(i).strip()]
            elif isinstance(raw_arr, str):
                return [i.strip() for i in raw_arr.split(',') if i.strip()]
            return []

        ingredients = parse_array(raw_data.get("ingredients", []))
        allergens = parse_array(raw_data.get("allergens", []))
        food_additives = parse_array(raw_data.get("food_additives", []))
        preservatives = parse_array(raw_data.get("preservatives", []))
        artificial_colors = parse_array(raw_data.get("artificial_colors", []))
        artificial_sweeteners = parse_array(raw_data.get("artificial_sweeteners", []))
            
        return {
            "product_name": str(product_name),
            "brand": str(brand) if brand else None,
            "serving_size": str(serving_size) if serving_size else None,
            "nutrition_facts": nutrition_facts,
            "ingredients": ingredients,
            "allergens": allergens,
            "ingredient_intelligence": ingredient_intelligence,
            "food_additives": food_additives,
            "preservatives": preservatives,
            "artificial_colors": artificial_colors,
            "artificial_sweeteners": artificial_sweeteners,
            "processing_level": raw_data.get("processing_level", ""),
            "processing_reason": raw_data.get("processing_reason", ""),
            "raw_text": raw_text
        }

    @staticmethod
    def _safe_float(val: Any) -> float:
        """Converts value to float, defaulting to 0.0 for negatives or failures."""
        if val is None:
            return 0.0
        try:
            # Handle cases like "15g"
            if isinstance(val, str):
                import re
                match = re.search(r"(\d+(\.\d+)?)", val)
                if match:
                    val = match.group(1)
                else:
                    return 0.0
                    
            f_val = float(val)
            return f_val if f_val >= 0 else 0.0
        except (ValueError, TypeError):
            return 0.0

nutrition_parser = NutritionParser()
