import requests

url = "http://127.0.0.1:8000/api/upload/"
files = {'file': ('test.txt', 'This is a test file content')}

try:
    print(f"Attempting to connect to {url}...")
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except requests.exceptions.ConnectionError:
    print("Failed to connect: Connection refused")
except Exception as e:
    print(f"An error occurred: {e}")
