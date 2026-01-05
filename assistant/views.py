from django.shortcuts import render

# Create your views here.
from services.llm_orchestrator import LLMOrchestrator

orchestrator = LLMOrchestrator()

def home(request):
    return render(request, "home.html")

def assistant_view(request):
    if request.method == "POST":
        message = request.POST.get("message")
        model_name = request.POST.get("model_name")
        uploaded_file = request.FILES.get("document")

        response = orchestrator.run_single(model_name, message, uploaded_file)

        return render(request, "assistant.html", {
            "response": response,
            "model": model_name
        })

    return render(request, "assistant.html")

def compare_view(request):
    if request.method == "POST":
        message = request.POST.get("message")
        uploaded_file = request.FILES.get("document")

        results = orchestrator.run_all(message, uploaded_file)

        return render(request, "compare.html", {"results": results})

    return render(request, "compare.html")
