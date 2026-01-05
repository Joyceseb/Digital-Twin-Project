import sys
import os

sys.path.append(os.getcwd())
from rag.vectorstore import VectorStore

with open("debug_results_clean.txt", "w", encoding="utf-8") as f:
    f.write("--- DEBUGGING VECTOR STORE ---\n")
    try:
        vs = VectorStore()
        count = vs.vectorstore._collection.count()
        f.write(f"Collection Count: {count}\n")
        
        if count > 0:
            f.write("Performing test search query 'document'...\n")
            results = vs.search("document")
            f.write(f"Found {len(results)} results.\n")
            for i, r in enumerate(results):
                f.write(f"Result {i+1}: {r.page_content[:50]}...\n")
        else:
            f.write("WARNING: Vector Store is EMPTY.\n")
            
    except Exception as e:
        f.write(f"ERROR: {e}\n")
    f.write("------------------------------\n")
