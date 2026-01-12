# System Architecture & Data Flow Diagram

## 1. Visual Diagram (Mermaid)
*(Note: If you do not see a chart below, you may need to install the **"Markdown Preview Mermaid Support"** extension in VS Code, or copy the code block into [Mermaid Live Editor](https://mermaid.live/).)*

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    %% Nodes
    User((User))
    
    subgraph FRONTEND ["FRONTEND (React)"]
        direction TB
        Pages[Pages<br/>(Chat, Compare, Arena)]:::frontend
        API_Utils[API Layer<br/>(api.js)]:::frontend
    end

    subgraph BACKEND ["BACKEND (Django)"]
        direction TB
        Views[API Views<br/>(api/views.py)]:::backend
        
        subgraph CORE_SERVICES ["Core Services"]
            Orchestrator[<b>LLM Orchestrator</b><br/>(Main Brain)]:::backend
            Judge[<b>Judge Service</b><br/>(Evaluator)]:::backend
            Memory[Memory Service<br/>(Context)]:::backend
        end
        
        subgraph RAG_SYSTEM ["RAG System"]
            RAG[RAG Pipeline]:::backend
            VectorDB[(Vector DB<br/>Embeddings)]:::data
        end

        Factory[Model Factory]:::backend
    end

    subgraph EXTERNAL_AI ["EXTERNAL LLMs"]
        OpenAI[OpenAI API]:::external
        Mistral[Mistral API]:::external
        DeepSeek[DeepSeek API]:::external
    end

    %% Flow Connections
    User <-->|Interacts| Pages
    Pages <-->|HTTP Requests| API_Utils
    API_Utils <-->|JSON Data| Views
    Views <-->|Calls| Orchestrator
    
    Orchestrator <-->|Reads/Writes| Memory
    Orchestrator -->|Retrieves Content| RAG
    RAG <-->|Index/Search| VectorDB
    
    Orchestrator -->|Delegates| Judge
    Orchestrator -->|Requests Model| Factory
    
    Factory <-->|API Call| OpenAI
    Factory <-->|API Call| Mistral
    Factory <-->|API Call| DeepSeek
```

---

## 2. Simplified Text Diagram (ASCII)

Here is a text-based naming convention and flow if the chart above is not visible:

```text
      [ USER ]
         |
         | (Clicks / Types)
         v
+=======================================+
|          FRONTEND (React)             |
|=======================================|
|  1. Chat Page                         |
|  2. Compare Page                      |
|  3. Judge Results Page                |
|                                       |
|      [ api.js (Data Carrier) ]        |
+=======================================+
         |
         | (sends JSON request)
         v
+=======================================+
|          BACKEND (Django)             |
|=======================================|
|  [ API Views (Gatekeeper) ]           |
|            |                          |
|            v                          |
|  [ LLM Orchestrator (The Brain) ]     |
|    |                                  |
|    +---> [ RAG Pipeline ] ------------> (Searches Documents)
|    |                                  |
|    +---> [ Judge Service ] -----------> (Scores Models)
|    |                                  |
|    +---> [ Memory Service ] ----------> (Remembers Context)
|    |                                  |
|    +---> [ Model Factory ]            |
+=======================================+
         |
         | (API Calls)
         v
+=======================================+
|        EXTERNAL AI MODELS             |
|=======================================|
|  [ OpenAI ]   [ Mistral ]   [ DeepSeek ]
+=======================================+
```

## 3. Nomenclature Legend

*   **Frontend**: The "Client-side" application. It's the visual interface running in the browser.
*   **Backend**: The "Server-side" logic. It processes data, handles security, and talks to databases.
*   **Orchestrator**: The central python class that coordinates all logic. It decides *what* to do with a user script.
*   **RAG (Retrieval-Augmented Generation)**: The system that specifically looks for information inside your uploaded PDFs.
*   **Judge**: A specialized AI function that acts as a quality referee between other AI models.
