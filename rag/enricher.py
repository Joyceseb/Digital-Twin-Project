# rag/enricher.py
import os
import google.generativeai as genai
from typing import Optional
import time

class VisualEnricher:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-pro")
        else:
            self.model = None

    def enrich_pdf(self, pdf_path: str) -> Optional[str]:
        """
        Uploads PDF to Gemini to get a description of visual elements (charts, graphs).
        Returns a text string containing the descriptions.
        """
        if not self.model:
            print("⚠️ VisualEnricher: No API KEY, skipping enrichment.")
            return None

        print(f"DEBUG: Enriching PDF {pdf_path} with Visual Analysis...")
        try:
            # 1. Upload File
            # Note: File API might have a delay or strict quotas.
            print("DEBUG: Uploading to Gemini File API...")
            pdf_file = genai.upload_file(path=pdf_path)
            
            # Wait for processing state if necessary (usually fast for small docs)
            # But let's check state just in case
            while pdf_file.state.name == "PROCESSING":
                print("DEBUG: Processing file...")
                time.sleep(2)
                pdf_file = genai.get_file(pdf_file.name)

            if pdf_file.state.name == "FAILED":
                print("❌ Gemini File Processing Failed.")
                return None

            # 2. Generate Description
            prompt = """
            Analyze this PDF document focusing strictly on **VISUAL DATA**.
            Identify every chart, graph, diagram, and table.
            For each visual element:
            1. State the Page Number.
            2. Provide a detailed textual description of the data (numbers, labels, axes, trends).
            3. Do not summarize the text of the document, ONLY the visual elements.
            
            Format:
            [VISUAL EXTRACTION - Page X]
            Description: ...
            """
            
            print("DEBUG: Generating visual description...")
            response = self.model.generate_content([pdf_file, prompt])
            
            # 3. Cleanup (Delete file to avoid cluttering storage)
            # genai.delete_file(pdf_file.name) # Good practice
            
            if response.text:
                print("DEBUG: Enrichment successful.")
                return f"\n\n--- [VISUAL ENRICHMENT START] ---\n{response.text}\n--- [VISUAL ENRICHMENT END] ---\n"
            
            return None

        except Exception as e:
            print(f"❌ Visual Enrichment Error: {e}")
            return None
