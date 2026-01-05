
import os
import sys
from rag.loader import load_any

def create_dummy_docx(filename):
    try:
        from docx import Document
        doc = Document()
        doc.add_paragraph("This is a test paragraph.")
        doc.save(filename)
        print(f"Created {filename}")
        return True
    except ImportError:
        print("python-docx not installed, skipping docx creation")
        return False

def create_dummy_pdf(filename):
    # Minimal PDF structure
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

def test_load(filename):
    print(f"Testing load_any('{filename}')...")
    try:
        content = load_any(filename)
        print(f"Success! Loaded {len(content)} chunks.")
    except Exception as e:
        print(f"Caught exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Test text file (should work)
    with open("test_debug.txt", "w") as f:
        f.write("Hello world")
    test_load("test_debug.txt")

    # Test DOCX
    if create_dummy_docx("test_debug.docx"):
        test_load("test_debug.docx")

    # Test PDF (if we can make one, or if there is one)
    # If we can't create one, we might need to assume the user's PDF is the issue
    # But let's verify if *any* PDF works if we can.
    if create_dummy_pdf("test_debug.pdf"):
        test_load("test_debug.pdf")
