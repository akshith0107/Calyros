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
        brand = raw_data.get("brand")
        serving_size = raw_data.get("serving_size")
        
        # 2. Nutrition Facts (convert strings to float, clamp negative to 0)
        raw_facts = raw_data.get("nutrition_facts", {})
        nutrition_facts = {}
        
        # Mapping from scout extraction to db columns
        field_mapping = {
            "calories": "calories",
            "protein_g": "protein",
            "carbs_g": "carbohydrates",
            "sugar_g": "sugar",
            "fiber_g": "fiber",
            "sodium_mg": "sodium",
            "fat_g": "total_fat"
        }
        
        for scout_field, db_field in field_mapping.items():
            val = raw_facts.get(scout_field)
            nutrition_facts[db_field] = NutritionParser._safe_float(val)

        # 3. Ingredients (ensure list of strings)
        raw_ingredients = raw_data.get("ingredients", [])
        ingredients: List[str] = []
        
        if isinstance(raw_ingredients, list):
            for ing in raw_ingredients:
                if isinstance(ing, str) and ing.strip():
                    ingredients.append(ing.strip())
        elif isinstance(raw_ingredients, str):
            # LLM might return comma separated string
            ingredients = [i.strip() for i in raw_ingredients.split(',') if i.strip()]
            
        return {
            "product_name": str(product_name),
            "brand": str(brand) if brand else None,
            "serving_size": str(serving_size) if serving_size else None,
            "nutrition_facts": nutrition_facts,
            "ingredients": ingredients
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
