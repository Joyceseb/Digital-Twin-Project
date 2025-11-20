from model.ModelFactory import load_model
import pandas as pd

models = load_model()
prompt = "Write a short professional message to a telecom director about AI integration benefits."

responses = {}

print("\n=========== Running Benchmark ===========\n")

for name, model in models.items():
    print(f">>> Running {name}...")
    
    try:
        resp = model.generate(prompt)
        responses[name] = resp
        print(f"{name} ✓ SUCCESS\n")
    
    except Exception as e:
        error_msg = f"SKIPPED / ERROR: {str(e)}"
        responses[name] = error_msg
        print(f"{name} ⚠ FAILED → {error_msg}\n")

print("\n=========== BENCHMARK RESULTS ===========\n")

for name, response in responses.items():
    print(f"----------- {name} -----------\n")
    print(response)
    print("\n")
