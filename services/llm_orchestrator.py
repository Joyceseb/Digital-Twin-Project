import os
from tempfile import NamedTemporaryFile
import timeit
from rag.pipeline import RAGPipeline
from model.ModelFactory import ModelFactory


class LLMOrchestrator:
    """
    Orchestrates everything:
    - document handling
    - RAG embedding + retrieval
    - model selection
    - building augmented prompt
    - running single or multiple LLMs
    """

    def __init__(self):
        self.rag = RAGPipeline()
        self.models = ModelFactory.create_models()  # {'openai': OpenAIModel(), ...}

    # -------------------------------------
    # INTERNAL HELPERS
    # -------------------------------------
    def _measure_performance(self, func, *args, **kwargs):
        """Runs the function and captures time and result."""
        start_time = timeit.default_timer()
        response = func(*args, **kwargs)
        end_time = timeit.default_timer()
        duration = end_time - start_time
        
        # Estimate tokens (rough approximation: 4 chars / token)
        # Using 0 if response is not string (e.g. dict error)
        text_len = len(str(response)) if response else 0
        token_count = text_len // 4
        
        return {
            "content": response,
            "metrics": {
                "time": round(duration, 2),
                "tokens": token_count
            }
        }

    # -------------------------------------
    # DOCUMENT HANDLING
    # -------------------------------------

    def _save_temp_file(self, uploaded_file):
        """Save Django uploaded file in temp folder."""
        if not uploaded_file:
            return None

        import os
        _, ext = os.path.splitext(uploaded_file.name)

        tmp = NamedTemporaryFile(delete=False, suffix=ext)
        for chunk in uploaded_file.chunks():
            tmp.write(chunk)
        tmp.close()

        return tmp.name

    def _process_document(self, file):
        print(f"DEBUG: Processing document: {file.name}")
        if not file:
            print("DEBUG: No file provided.")
            return None
            
        if file.size > 100 * 1024 * 1024: # 100MB limit
            print(f"DEBUG: File {file.name} too large ({file.size} bytes).")
            raise ValueError("File too large. Maximum size is 100MB.")

        try:
            file_path = self._save_temp_file(file)
            print(f"DEBUG: Saved temp file to: {file_path}")
            
            # CLEAR existing context to prevent hallucinations from old files
            # This makes the "Upload" action act as "Set Context"
            print("DEBUG: Clearing previous RAG context...")
            self.rag.clear()
            
            print("DEBUG: Indexing document...")
            self.rag.index_document(file_path)
            print("DEBUG: Indexing complete.")
            
            return file_path
        except Exception as e:
            print(f"DEBUG: Error in _process_document: {e}")
            import traceback
            traceback.print_exc()
            raise e

    # -------------------------------------
    # RUN SINGLE MODEL
    # -------------------------------------

    def _save_text_to_file(self, content: str, filename: str) -> str:
        """Save text content to a file in MEDIA_ROOT and return the URL."""
        from django.conf import settings
        import uuid
        
        # Ensure media directory exists
        media_dir = settings.MEDIA_ROOT / "generated"
        media_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = media_dir / filename
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        return f"{settings.MEDIA_URL}generated/{filename}"

    def run_single(self, model_name: str, message: str, file=None):
        """Run one LLM with RAG."""
        processed_file_path = None
        if file:
            processed_file_path = self._process_document(file)

        model_name = model_name.lower()
        model = self.models.get(model_name)

        if not model:
            return {"content": f"❌ Model '{model_name}' not found.", "metrics": {"time": 0, "tokens": 0}}

        # INTENT CHECK: Translation / Full Document Generation / Summarization
        # Heuristic: if user asks to "translate" OR "summarize" and we have a file context
        intent_keywords = ["translate", "summarize", "summary", "resume", "analyse", "analyze"]
        if any(k in message.lower() for k in intent_keywords) and processed_file_path:
            try:
                # Bypass RAG, load FULL content
                from rag.loader import load_any
                print(f"DEBUG: Full-Document Intent detected. Loading content from {processed_file_path}")
                docs_objs = load_any(processed_file_path)
                full_text = "\n\n".join([d["content"] for d in docs_objs])
                
                # Dynamic Instruction based on keyword
                task_type = "Translation" if "translate" in message.lower() else "Processing"
                
                prompt = f"""
[INSTRUCTION]
You are an advanced AI assistant. The user has provided a document and a request.
You must process the ENTIRE document provided below.
Do not skip any sections. Provide a comprehensive, detailed, and accurate response.

User Request: {message}

[DOCUMENT START]
{full_text}
[DOCUMENT END]
"""
                print("DEBUG: Sending full document to LLM...")
                
                result = self._measure_performance(model.generate, prompt)
                content = result["content"]
                
                # If it's a translation, we still save it as file.
                # If it's a summary, we might want to just return text?
                # The user expects a chat response usually for summary.
                # But 'run_single' returns dict.
                
                # Let's return text primarily, but if it looks like a file generation request (translate), we can add file attachment.
                # For consistency, if it is "translate", keep file behavior.
                if "translate" in message.lower():
                     import uuid
                     filename = f"translated_{uuid.uuid4().hex[:8]}.md"
                     file_url = self._save_text_to_file(content, filename)
                     return {
                        "content": "I have processed the document. You can download the result below.",
                        "type": "file",
                        "file_url": file_url,
                        "filename": filename,
                        "metrics": result["metrics"]
                     }
                else:
                     # For Summary/Analysis, return the TEXT content directly to chat.
                     return {
                        "content": content,
                        "metrics": result["metrics"]
                     }

            except Exception as e:
                print(f"❌ Full-Context processing failed: {e}")
                import traceback
                traceback.print_exc()
                # Fallback to RAG if full load fails
                pass

        # Default RAG Flow
        def run_rag_flow():
            return self.rag.run(model, message)["response"]

        result = self._measure_performance(run_rag_flow)
        return result # Returns { "content": ..., "metrics": ... }

    # -------------------------------------
    # RUN ALL MODELS (BENCHMARK)
    # -------------------------------------

    def run_all(self, message: str, file=None):
        """Run OpenAI, Mistral, DeepSeek in parallel."""
        processed_file_path = None
        if file:
            processed_file_path = self._process_document(file)

        responses = {}
        target_models = ["openai", "mistral"]
        
        # Check translation intent for Compare Mode too
        translation_context = None
        if "translate" in message.lower() and processed_file_path:
             try:
                from rag.loader import load_any
                # Load metadata-rich dicts
                docs_objs = load_any(processed_file_path)
                # Combine content string
                full_text = "\n\n".join([d["content"] for d in docs_objs])
                
                translation_context = f"""
[INSTRUCTION]
Translate the following document based on the user's request. 
Preserve the structural formatting (markdown/headings) as much as possible.
Make sure to include ALL information clearly.

User Request: {message}

[DOCUMENT START]
{full_text}
[DOCUMENT END]
"""
             except Exception as e:
                 print(f"Error preparing translation context in run_all: {e}")

        for name, model in self.models.items():
            if name in target_models:
                
                def run_model_logic():
                    # If translation intent & file present, bypass RAG
                    if translation_context:
                        return model.generate(translation_context)
                    else:
                        return self.rag.run(model, message)["response"]
                    
                result = self._measure_performance(run_model_logic)
                responses[name] = result 

        return responses
