import os
import json
from app.services.gpt_oss_service import gpt_oss_service

class HealthAdvisor:
    def __init__(self):
        prompt_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts", "health_advisor_prompt.txt")
        with open(prompt_path, 'r') as f:
            self.system_prompt = f.read()

    async def generate_advice(self, profile: dict, extracted_data: dict) -> dict:
        """
        Generates the personalized health advice and scoring using Groq.
        """
        payload = {
            "user_profile": profile,
            "extracted_nutrition_data": extracted_data
        }
        
        user_prompt = f"Analyze the following data and generate the JSON payload:\n\n{json.dumps(payload, indent=2, default=str)}"
        
        result = await gpt_oss_service._generate_json(self.system_prompt, user_prompt)
        return result

health_advisor = HealthAdvisor()
