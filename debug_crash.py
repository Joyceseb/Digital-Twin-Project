
import os
import sys
from rag.loader import load_any
from rag.vectorstore import VectorStore
from services.llm_orchestrator import LLMOrchestrator

# Dummy PDF creation (from previous debug step)
def create_dummy_pdf(filename):
    content = (
        b"%PDF-1.1\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n"
        b"4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\n"
        b"xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000300 00000 n \n"
        b"trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n386\n%%EOF"
    )
    with open(filename, "wb") as f:
        f.write(content)
    print(f"Created {filename}")
    return True

def test_pipeline():
    filename = "debug_crash.pdf"
    create_dummy_pdf(filename)

    print("Step 1: Loading Document...")
    try:
        docs = load_any(filename)
        print(f"Loaded {len(docs)} pages.")
        print(f"Content sample: {docs[0][:50]}...")
    except Exception as e:
        print(f"CRASH AT LOADER: {e}")
        return

    print("Step 2: Initializing VectorStore...")
    try:
        vs = VectorStore()
        print("VectorStore initialized.")
    except Exception as e:
        print(f"CRASH AT VS INIT: {e}")
        return

    print("Step 3: Indexing (Splitting + Embedding + Chroma)...")
    try:
        vs.index(docs)
        print("Indexing Complete!")
    except Exception as e:
        print(f"CRASH AT INDEXING: {e}")
        import traceback
        traceback.print_exc()
        return

if __name__ == "__main__":
    test_pipeline()
