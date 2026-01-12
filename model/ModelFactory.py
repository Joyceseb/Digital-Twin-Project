from model.OpenAI import OpenAIModel
from model.Mistral import MistralModel
from model.Deepseek import DeepSeekModel
from model.Claude import ClaudeModel
from model.Gemini import GeminiModel

import os
from dotenv import load_dotenv

load_dotenv()

class ModelFactory:
    @staticmethod
    def create_models():
        return {
            "openai": OpenAIModel(api_key=os.getenv("OPENAI_API_KEY")),
            "mistral": MistralModel(api_key=os.getenv("MISTRAL_API_KEY")),
            # "deepseek": DeepSeekModel(api_key=os.getenv("DEEPSEEK_API_KEY")),
            
            # Judge models
            # "claude": ClaudeModel(api_key=os.getenv("ANTHROPIC_API_KEY")),
            "gemini": GeminiModel(api_key=os.getenv("GEMINI_API_KEY"), model_name="gemini-1.5-flash"),
            "gemini_judge": GeminiModel(api_key=os.getenv("GEMINI_API_KEY"), model_name="gemini-2.0-flash-exp"),
        }
