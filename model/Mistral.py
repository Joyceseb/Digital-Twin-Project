from mistralai import Mistral
from prompts import load_prompt


class MistralModel:
    def __init__(self, api_key, model_name="mistral-large-latest"):
        self.client = Mistral(api_key=api_key)
        self.model_name = model_name

        # Load system prompt
        self.system_prompt = load_prompt("mistral_system_prompt.md")

    def generate(self, user_content: str) -> str:
        response = self.client.chat.complete(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.65,
        )

        return response.choices[0].message.content
