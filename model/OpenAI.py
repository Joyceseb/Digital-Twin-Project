# model/OpenAI.py
from openai import OpenAI
from prompts import load_prompt


class OpenAIModel:
    def __init__(self, api_key, model_name="gpt-4o"):
        self.client = OpenAI(api_key=api_key)
        self.model_name = model_name
        self.system_prompt = load_prompt("openai_system_prompt.md")

    def generate(self, user_content: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content
