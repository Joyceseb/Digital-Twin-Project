import os
import google.generativeai as genai
from prompts import load_prompt

class GeminiModel:
    def __init__(self, api_key=None, model_name="gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = None
        if not self.api_key:
            print("⚠️ WARNING: Gemini API key missing — running in MOCK MODE.")
        else:
            try:
                genai.configure(api_key=self.api_key)
                self.model_name = model_name
                self.client = genai.GenerativeModel(self.model_name)
        
                self.system_prompt = load_prompt("master_prompt.md").replace("{MODEL_NAME}", self.model_name)
            except Exception as e:
                print(f"⚠️ ERROR initializing Gemini: {e}")
                self.client = None

    def generate(self, prompt: str):
        if not self.client:
            # Mocked output
            return '{"model_A_score": 14, "model_B_score": 16, "reason": "Mocked judge"}'

        try:
            # Combine system prompt with user prompt for Gemini
            full_prompt = f"{self.system_prompt}\n\n[USER REQUEST]\n{prompt}"
            res = self.client.generate_content(full_prompt)
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
        
        # Configure safety settings to avoid blocking "harmful" content in judge context
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        try:
            res = self.client.generate_content(prompt, safety_settings=safety_settings)
            
            if hasattr(res, 'text'):
                return res.text
                
            if hasattr(res, 'text'):
                return res.text
            else:
                return "Error: No text returned."
        except Exception as e:
            print(f"Gemini Chat Completion Error: {e}")
            with open("debug_gemini_error.txt", "w") as f:
                f.write(str(e))
            return "{}"
