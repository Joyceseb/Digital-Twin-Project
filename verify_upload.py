import os
import sys

# Add project root to path
sys.path.append(os.getcwd())

# Setup Django environment for ORM/settings if needed (though we might get away without it for this unit test)
import django
from django.conf import settings

if not settings.configured:
    # Minimal settings
    settings.configure(
        BASE_DIR=os.getcwd(),
        SECRET_KEY='secret',
        INSTALLED_APPS=[
            'django.contrib.contenttypes',
            'rag', 
        ],
    )
    django.setup()


from services.llm_orchestrator import LLMOrchestrator

class MockFile:
    def __init__(self, name, content):
        self.name = name
        self.content = content
        self.size = len(content)
    
    def chunks(self):
        yield self.content

def test_upload_normal():
    print("\n--- Testing Normal Upload ---")
    orchestrator = LLMOrchestrator()
    file = MockFile("test_normal.txt", b"Hello world this is a test.")
    try:
        path = orchestrator._process_document(file)
        print(f"Success: Processed {path}")
    except Exception as e:
        print(f"Failed: {e}")

def test_upload_large():
    print("\n--- Testing Large Upload (Should Fail) ---")
    orchestrator = LLMOrchestrator()
    # 11MB
    large_content = b"x" * (11 * 1024 * 1024) 
    file = MockFile("test_large.txt", large_content)
    try:
        path = orchestrator._process_document(file)
        print(f"Unexpected Success: Processed {path}")
    except ValueError as e:
        print(f"Expected Failure: {e}")
    except Exception as e:
        print(f"Unexpected Error: {e}")

if __name__ == "__main__":
    test_upload_normal()
    
    print("\n--- Testing Batch Indexing (Medium Load) ---")
    # 50 chunks * ~500 chars = 25000 chars. Let's do 100k to be sure.
    medium_content = b"This is a sentence. " * 5000 
    file = MockFile("test_batching.txt", medium_content)
    try:
        orchestrator = LLMOrchestrator()
        path = orchestrator._process_document(file)
        print(f"Success: Processed {path}")
    except Exception as e:
        print(f"Failed: {e}")

    test_upload_large()
