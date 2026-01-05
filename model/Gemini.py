import os
import google.generativeai as genai

class GeminiModel:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = None
        if not self.api_key:
            print("⚠️ WARNING: Gemini API key missing — running in MOCK MODE.")
        else:
            try:
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel("gemini-2.0-flash")
            except Exception as e:
                print(f"⚠️ ERROR initializing Gemini: {e}")
                self.client = None

    def generate(self, prompt: str):
        if not self.client:
            # Mocked output
            return '{"model_A_score": 14, "model_B_score": 16, "reason": "Mocked judge"}'

        try:
            res = self.client.generate_content(prompt)
            # Check for safety blocking or empty response
            if hasattr(res, 'text'):
                return res.text
            elif hasattr(res, 'parts'):
                return "".join([p.text for p in res.parts])
            else:
                return "Error: No text returned (possibly blocked)."
        except Exception as e:
            print(f"Gemini Generation Error: {e}")
            return f"I encountered an error: {str(e)}"

    def chat_completion(self, system_prompt, user_message):
        if not self.client:
            return '{"model_A_score": 10, "model_B_score": 17, "reason": "Mocked JSON"}'

        prompt = f"{system_prompt}\n\n{user_message}"
        try:
            res = self.client.generate_content(prompt)
            if hasattr(res, 'text'):
                return res.text
            else:
                return "Error: No text returned."
        except Exception as e:
            print(f"Gemini Chat Completion Error: {e}")
            return "{}"
