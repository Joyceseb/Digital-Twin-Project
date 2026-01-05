
import time
import timeit
from typing import Dict, Any, List
from services.llm_orchestrator import LLMOrchestrator
from model.ModelFactory import ModelFactory
from rag.loader import load_any

class AnalysisService:
    def __init__(self):
        self.models = ModelFactory.create_models()

    def _load_document_content(self, file_path: str) -> str:
        """Loads and joins the document content."""
        chunks = load_any(file_path)
        return "\n\n".join([c["content"] for c in chunks])

    def _measure_performance(self, func, *args, **kwargs) -> Dict[str, Any]:
        """Runs the function and captures time and result."""
        start_time = timeit.default_timer()
        response = func(*args, **kwargs)
        end_time = timeit.default_timer()
        duration = end_time - start_time
        
        # Estimate tokens (rough approximation: 4 chars / token)
        token_count = len(response) // 4 if isinstance(response, str) else 0
        
        return {
            "result": response,
            "metrics": {
                "response_time_seconds": round(duration, 2),
                "estimated_tokens": token_count
            }
        }

    def analyze_document(self, model_name: str, file_path: str, analysis_types: List[str], target_language: str = "English") -> Dict[str, Any]:
        
        model = self.models.get(model_name.lower())
        if not model:
            raise ValueError(f"Model {model_name} not found")

        content = self._load_document_content(file_path)
        print(f"DEBUG: Loaded content length: {len(content)} chars")

        # Limit content if strictly necessary, but for now assuming model handles it or we truncate
        # Truncate to safe limit (approx 30k chars ~ 7.5k tokens for safety if not extensive context)
        # But user wants 100+ pages. Gemini handles it. Mistral might crash.
        # For now, let's just pass it.
        
        results = {}

        results = {}

        log_path = "c:/Users/nabde/OneDrive/Desktop/Digital-Twin-Project/server_debug.log"

        for analysis_type in analysis_types:
            with open(log_path, "a") as f:
                f.write(f"DEBUG: Processing analysis_type: {analysis_type}\n")
            
            prompt = self._get_prompt_for_type(analysis_type, content, target_language)
            if prompt:
                with open(log_path, "a") as f:
                    f.write(f"DEBUG: Prompt generated. Length: {len(prompt)}\n")
                
                try:
                    output = self._measure_performance(model.generate, prompt)
                    with open(log_path, "a") as f:
                         f.write(f"DEBUG: Model Output for {analysis_type} success.\n")
                    results[analysis_type] = output
                except Exception as e:
                    with open(log_path, "a") as f:
                        f.write(f"DEBUG: Model execution failed for {analysis_type}: {e}\n")
            else:
                with open(log_path, "a") as f:
                    f.write(f"DEBUG: No prompt generated for {analysis_type}\n")

        with open(log_path, "a") as f:
            f.write(f"DEBUG: Final Results keys: {list(results.keys())}\n")
        
        return results

    def _get_prompt_for_type(self, analysis_type: str, content: str, target_language: str = "English") -> str:
        
        base_instruction = f"""
You are an expert AI assistant performing a precise analysis on the following document.
[DOCUMENT START]
{content[:1000000]} 
[DOCUMENT END]
(Note: Document truncated to first 1M chars for safety)
"""
        # Note: simplistic truncation for now. Ideally we check model context window.

        if analysis_type == "translation" or analysis_type == "translation_fr":
            return base_instruction + f"\n\nTask: Translate the *entire* document above into {target_language}. Maintain original formatting."
        
        elif analysis_type == "summary_abstractive":
            return base_instruction + "\n\nTask: Provide a concise abstractive summary of the document. Capture the main ideas, arguments, and conclusions in your own words."

        elif analysis_type == "summary_extractive":
            return base_instruction + "\n\nTask: Provide an extractive summary. Extract line-by-line the most critical sentences from the document that best represent its content."

        elif analysis_type == "qa_generation":
            return base_instruction + "\n\nTask: Generate a comprehensive Q&A (Question and Answer) set based on this document. Create at least 10 pairs of insightful questions and correct answers found in the text."

        elif analysis_type == "sentiment":
            return base_instruction + "\n\nTask: Analyze the sentiment of the document. Is it Positive, Negative, or Neutral? Provide a score (0-10) and an explanation of the tone, emotion, and intent detected."

        elif analysis_type == "intent":
            return base_instruction + "\n\nTask: Detect the primary intent of this document. Is it to Inform, Persuade, Sell, Warn, or Entertain? Explain your reasoning."

        elif analysis_type == "grammar_style":
            return base_instruction + "\n\nTask: Analyze the grammar and style. List significant grammatical errors if any (or state 'None'). Describe the writing style (e.g., Formal, Academic, Casual)."

        elif analysis_type == "compliance_gdpr":
            return base_instruction + "\n\nTask: GDPR Compliance Check. Scan the text for PII (Personally Identifiable Information) such as Names, Emails, IP addresses. Report findings and suggest anonymization if needed."

        elif analysis_type == "compliance_ccpa":
            return base_instruction + "\n\nTask: CCPA Compliance Check. Identify sensitive user data. Does the document mention data sale, opt-out rights, or transparency? Report potential issues."

        elif analysis_type == "compliance_ai_act":
            return base_instruction + "\n\nTask: EU AI Act Compliance. Does this text (if generated by AI or describing AI) pose risks of hallucinations? verify if the content is explainable and transparent. Rate the risk level."

        elif analysis_type == "cognitive_facts":
            return base_instruction + "\n\nTask: Fact Extraction. List the key factual claims made in this document. For each, indicate if it seems verifiable or requires external source checking."

        elif analysis_type == "cognitive_hallucination":
            return base_instruction + "\n\nTask: Hallucination Detection. Identify any statements that sound implausible, contradictory, or unsupported by the context. Estimate a 'Hallucination Risk Score' (0-100%)."

        return None
