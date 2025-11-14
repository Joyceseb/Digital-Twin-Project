from mistralai import Mistral

client = Mistral(api_key="YOUR_MISTRAL_API_KEY")

def ask_mistral(prompt, model="mistral-medium"):
    response = client.chat.complete(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message["content"]