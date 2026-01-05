import requests
import json

url = "http://127.0.0.1:8000/api/analyze/"
file_path = "test_debug.txt"

# Create a dummy file if it doesn't exist
with open(file_path, "w") as f:
    f.write("This is a test document. It is very positive and happy. The sun is shining.")

files = {'file': open(file_path, 'rb')}
data = {
    'model': 'gemini',
    'target_language': 'Spanish',
    'analysis_types': json.dumps(["sentiment", "translation", "summary_extractive", "intent"])
}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, files=files, data=data)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        json_response = response.json()
        results = json_response.get("results", {})
        print("\n--- Keys returned in 'results' ---")
        print(list(results.keys()))
        
        print("\n--- Full Response (Truncated) ---")
        print(str(json_response)[:500])
        
        missing = [t for t in ["sentiment", "translation", "summary_extractive", "intent"] if t not in results]
        if missing:
            print(f"\n[FAIL] Missing analysis types: {missing}")
        else:
            print("\n[SUCCESS] All requested types found.")
            
    else:
        print(f"Error: {response.text}")

except Exception as e:
    print(f"Exception: {e}")
