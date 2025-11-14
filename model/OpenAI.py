from openai import OpenAI

client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

def ask_openai(prompt, model="gpt-4o-mini"):
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return response.choices[0].message.content