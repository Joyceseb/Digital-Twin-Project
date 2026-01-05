# services/memory_service.py
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "..", "storage")

os.makedirs(STORAGE_DIR, exist_ok=True)

MEMORY_FILES = {
    "openai": os.path.join(STORAGE_DIR, "memory_openai.json"),
    "mistral": os.path.join(STORAGE_DIR, "memory_mistral.json"),
    "deepseek": os.path.join(STORAGE_DIR, "memory_deepseek.json"),
}

def _load_memory(path):
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_memory(path, history):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

def get_history(model_key: str):
    path = MEMORY_FILES.get(model_key)
    if not path:
        return []
    return _load_memory(path)

def append_message(model_key: str, role: str, content: str):
    """
    role: "user" ou "assistant"
    """
    path = MEMORY_FILES.get(model_key)
    if not path:
        return

    history = _load_memory(path)
    history.append({"role": role, "content": content})
    _save_memory(path, history)
    return history
