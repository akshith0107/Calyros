import json
import logging
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

class GptOssService:
    def __init__(self):
        # Using unified Groq Reasoning Model
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_REASONING_MODEL
        
    async def _generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        """
        Base method to call Groq API and enforce JSON response.
        """
        if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "dummy":
            raise ValueError("GROQ_API_KEY is missing or invalid. AI inference cannot proceed.")

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            logger.error(f"Groq API Error: {e}")
            raise RuntimeError(f"Failed to generate AI response: {e}") from e

gpt_oss_service = GptOssService()
