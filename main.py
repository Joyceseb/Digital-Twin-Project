from model.OpenAI import ask_openai
from model.Mistral import ask_mistral
from model.Deepseek import ask_deepseek
import pandas as pd

prompt = "Write a short professional message to a telecom director about AI integration benefits."

responses = {
    "OpenAI": ask_openai(prompt),
    "Mistral": ask_mistral(prompt),
    "DeepSeek": ask_deepseek(prompt)
}

df = pd.DataFrame(list(responses.items()), columns=["Model", "Response"])
print(df)
df.to_csv("results/benchmark_results.csv", index=False)