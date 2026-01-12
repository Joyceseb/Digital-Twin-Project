import os
from anthropic import Anthropic
from prompts import load_prompt

class ClaudeModel:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            print("⚠️ WARNING: Claude API key missing — running in MOCK MODE.")
            self.client = None
        else:
            self.client = Anthropic(api_key=self.api_key)
        
        self.model_name = "claude-3-opus"
        self.system_prompt = load_prompt("master_prompt.md").replace("{MODEL_NAME}", self.model_name)

    def generate(self, prompt: str):
        """
        Returns a TEXT response.
        """
        if not self.client:
            # Mocked behavior if no API key
            return {"response": '{"model_A_score": 15, "model_B_score": 20, "reason": "Mocked judge"}'}

        msg = self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=800,
            temperature=0,
            system=self.system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )

        return {"response": msg.content[0].text}

    def chat_completion(self, system_prompt, user_message):
        """
        Used by JudgeService (forces JSON output).
        """
        if not self.client:
            return '{"model_A_score": 12, "model_B_score": 18, "reason": "Mocked JSON"}'

        msg = self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=800,
            temperature=0,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ],
        )

        return msg.content[0].text
