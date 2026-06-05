import os
from app.services.gpt_oss_service import gpt_oss_service

class IngredientExplainer:
    def __init__(self):
        prompt_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts", "ingredient_prompt.txt")
        with open(prompt_path, 'r') as f:
            self.system_prompt = f.read()

    async def explain_ingredients(self, ingredients: list[str]) -> list[dict]:
        """
        Sends the list of ingredient names to Groq for explanation.
        """
        if not ingredients:
            return []

        user_prompt = f"Please explain the following ingredients: {', '.join(ingredients)}"
        
        result = await gpt_oss_service._generate_json(self.system_prompt, user_prompt)
        return result.get("ingredient_explanations", [])

ingredient_explainer = IngredientExplainer()
