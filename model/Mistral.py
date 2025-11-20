from mistralai import Mistral
import time

class MistralModel:
    def __init__(self, api_key, model_name="mistral-large-latest"):
        self.client = Mistral(api_key=api_key)
        self.model_name = model_name

    def generate(self, prompt: str) -> str:
        for attempt in range(3):
            try:
                response = self.client.chat.complete(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}]
                )

                # NEW SDK: message.content (NOT ["content"])
                return response.choices[0].message.content

            except Exception as e:
                print(f"[Mistral Retry {attempt+1}/3] {e}")
                time.sleep(1)

        return "Mistral failed after 3 retries."
