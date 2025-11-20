# model/DeepSeek.py
from openai import OpenAI

class DeepSeekModel:
    def __init__(self, api_key, model_name="deepseek-chat-lite"):
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
        self.model_name = model_name

    def generate(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
