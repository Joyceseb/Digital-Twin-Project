import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

with open("models_list_clean.txt", "w", encoding="utf-8") as f:
    if not api_key:
        f.write("No API Key found.\n")
    else:
        genai.configure(api_key=api_key)
        try:
            f.write("Listing available models:\n")
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    f.write(f"- {m.name}\n")
        except Exception as e:
            f.write(f"Error: {e}\n")
