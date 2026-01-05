# api/views.py
import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from services.llm_orchestrator import LLMOrchestrator
from services.memory_service import get_history, append_message
from services.JudgeService import JudgeService
from services.AnalysisService import AnalysisService

# Singleton services
orchestrator = LLMOrchestrator()
judge_service = JudgeService()
analysis_service = AnalysisService()

@csrf_exempt
def chat_view(request, model):
    if request.method != "POST":
         return JsonResponse({"error": "Only POST allowed"}, status=405)
    
    prompt = request.POST.get("prompt")
    file = request.FILES.get("file")
    
    # Handle JSON body if not multipart
    if not prompt and not file:
        try:
            data = json.loads(request.body.decode("utf-8"))
            prompt = data.get("prompt")
        except:
            pass
            
    if not prompt:
        return JsonResponse({"error": "No prompt provided"}, status=400)

    # Use orchestrator
    try:
        response = orchestrator.run_single(model, prompt, file)
        if isinstance(response, dict):
             return JsonResponse(response)
        return JsonResponse({"response": response})
    except Exception as e:
        print(f"Error in chat_view: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def compare_view(request):
    if request.method != "POST":
         return JsonResponse({"error": "Only POST allowed"}, status=405)

    prompt = request.POST.get("prompt")
    file = request.FILES.get("file")
    
    if not prompt and not file:
        try:
            data = json.loads(request.body.decode("utf-8"))
            prompt = data.get("prompt")
        except:
            pass

    if not prompt:
        return JsonResponse({"error": "No prompt provided"}, status=400)

    results = orchestrator.run_all(prompt, file)
    return JsonResponse(results)

@csrf_exempt
def upload_document_view(request):
    if request.method != "POST":
         return JsonResponse({"error": "Only POST allowed"}, status=405)
         
    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No file provided"}, status=400)
        
    try:
        path = orchestrator._process_document(file)
        return JsonResponse({"message": "File processed", "path": path, "name": file.name})
    except Exception as e:
        print(f"Error in upload_document_view: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def judge_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
        
    try:
        body = json.loads(request.body.decode("utf-8"))
        question = body.get("question")
        ans_openai = body.get("openai_answer")
        ans_mistral = body.get("mistral_answer")
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
        
    # Allow partial answers if just testing one model? 
    # But judge service likely expects all. 
    # original code:
    if not all([question, ans_openai, ans_mistral]):
        # Just return error as before
        return JsonResponse({"error": "Missing fields"}, status=400)

    try:
        results = judge_service.evaluate_two_models(
            question, ans_openai, ans_mistral
        )
        return JsonResponse(results)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def memory_view(request, model):
    return JsonResponse(get_history(model), safe=False)

from api.utils.pdf_generator import generate_pdf_buffer
from django.http import HttpResponse

@csrf_exempt
def generate_document_view(request):
    if request.method != "POST":
         return JsonResponse({"error": "Only POST allowed"}, status=405)
         
    try:
        body = json.loads(request.body.decode("utf-8"))
        content = body.get("content", "")
        title = body.get("title", "Document")
        
        if not content:
            return JsonResponse({"error": "No content provided"}, status=400)
            
        pdf_buffer = generate_pdf_buffer(content, title)
        
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{title}.pdf"'
        return response
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def arena_stats_view(request):
    try:
        data = judge_service.get_arena_stats()
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def delete_battle_view(request):
    if request.method != "POST":
         return JsonResponse({"error": "Only POST allowed"}, status=405)
         
    try:
        data = json.loads(request.body.decode("utf-8"))
        timestamp = data.get("timestamp")
        
        if not timestamp:
            return JsonResponse({"error": "No timestamp provided"}, status=400)
            
        success = judge_service.delete_battle(timestamp)
        if success:
            # Return updated stats
            new_stats = judge_service.get_arena_stats()
            return JsonResponse({"message": "Battle deleted", "stats": new_stats})
        else:
             return JsonResponse({"error": "Battle not found"}, status=404)
             
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def analyze_view(request):
    if request.method != "POST":
         return JsonResponse({"error": "Only POST allowed"}, status=405)

    file = request.FILES.get("file")
    
    # Get parameters
    analysis_types_raw = request.POST.get("analysis_types")
    model_name = request.POST.get("model", "gemini")
    target_language = request.POST.get("target_language", "English")
    
    if not file:
         return JsonResponse({"error": "No file provided"}, status=400)
    
    try:
        # Use orchestrator to save temp file + index (optional but good for consistency)
        file_path = orchestrator._process_document(file)
        
        # --- DEBUG LOGGING ---
        log_path = "c:/Users/nabde/OneDrive/Desktop/Digital-Twin-Project/server_debug.log"
        with open(log_path, "a") as f:
            f.write(f"\n\n[ANALYZE_VIEW] Request received.\n")
            f.write(f"Raw analysis_types: {analysis_types_raw}\n")
            f.write(f"Model: {model_name}, Target Lang: {target_language}\n")
        # ---------------------
        
        if not analysis_types_raw:
             return JsonResponse({"error": "No analysis_types provided"}, status=400)
             
        import json
        try:
            types_list = json.loads(analysis_types_raw)
        except:
            types_list = [analysis_types_raw] 
            
        with open(log_path, "a") as f:
            f.write(f"Parsed types_list: {types_list}\n")

        results = analysis_service.analyze_document(model_name, file_path, types_list, target_language)
        
        with open(log_path, "a") as f:
            f.write(f"Start of Results keys: {list(results.keys())}\n")

        return JsonResponse({"results": results, "file_path": file_path})
        
    except Exception as e:
        print(f"Error in analyze_view: {e}")
        log_path = "c:/Users/nabde/OneDrive/Desktop/Digital-Twin-Project/server_debug.log"
        with open(log_path, "a") as f:
            f.write(f"ERROR: {str(e)}\n")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def preview_document_view(request):
    if request.method != "POST":
         return JsonResponse({"error": "Only POST allowed"}, status=405)
         
    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No file provided"}, status=400)
        
    try:
        # Save temp file
        import os
        from tempfile import NamedTemporaryFile
        _, ext = os.path.splitext(file.name)
        tmp = NamedTemporaryFile(delete=False, suffix=ext)
        for chunk in file.chunks():
            tmp.write(chunk)
        tmp.close()
        
        # Load content using existing loader
        from rag.loader import load_any
        docs = load_any(tmp.name)
        
        # Clean up temp file? Ideally yes, but loader might need it? 
        # load_any reads immediately. 
        try:
            os.unlink(tmp.name)
        except:
             pass

        if not docs:
             return JsonResponse({"content": ""})

        # Combine content
        full_text = "\n\n".join([d["content"] for d in docs])
        
        return JsonResponse({"content": full_text})
        
    except Exception as e:
        print(f"Error in preview_document_view: {e}")
        return JsonResponse({"error": str(e)}, status=500)
