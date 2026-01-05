# prompts/__init__.py
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def load_prompt(name: str) -> str:
    path = BASE_DIR / name
    return path.read_text(encoding="utf-8")
