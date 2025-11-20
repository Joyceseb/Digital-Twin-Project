# model/ModelFactory.py
from model.OpenAI import OpenAIModel
from model.Mistral import MistralModel
from model.Deepseek import DeepSeekModel

def load_model():
    return {
        "OpenAI": OpenAIModel(api_key="aaa"),
        "Mistral": MistralModel(api_key="bbb"),
        "DeepSeek": DeepSeekModel(api_key="xxx")
    }
