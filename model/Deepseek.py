from openai import OpenAI
from prompts import load_prompt


class DeepSeekModel:
    def __init__(self, api_key, model_name="deepseek-chat"):
        self.client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        self.model_name = model_name

        # Load system prompt
        self.system_prompt = load_prompt("deepseek_system_prompt.md")

    def generate(self, user_content: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.65,
        )

        return response.choices[0].message.content
