# Digital Twin Project – Technical Guide & Architecture Overview

This document provides a comprehensive overview of the **Digital Twin Project**, focusing on the backend architecture, the prompt engineering strategies that guide the Large Language Models (LLMs), and the frontend user interface structure.

---

## 1. Backend Principles & Concepts

The backend is built using **Django** (Python) and serves as the central intelligence hub for the application. It orchestrates the interaction between the user, documents, and various AI models.

### 1.1 Core Architecture: The Orchestrator
At the heart of the system is the **`LLMOrchestrator`** (located in `services/llm_orchestrator.py`). It acts as the "brain" of the application, managing the following responsibilities:

*   **Model Management**: It initializes and manages connections to different LLM providers (OpenAI, Mistral, DeepSeek) via a `ModelFactory`.
*   **Document Processing**:
    *   **Uploads**: Handles file uploads (PDF, DOCX, TXT) and saves them temporarily.
    *   **Indexing (RAG)**: For standard queries, it indexes documents into a vector database (using `rag.pipeline`) to enable **Retrieval-Augmented Generation (RAG)**. This allows the AI to "read" and cite specific parts of the document.
    *   **Full-Context Loading**: For specific tasks like **Translation** or **Summarization**, the orchestrator is smart enough to bypass the RAG system and load the *entire* document text into the model's context window to ensure no information is lost.
*   **Performance Tracking**: Every interaction is measured for execution time and token usage, allowing for performance monitoring.

### 1.2 "The Judge" System
A unique feature of this backend is the **AI Judge** (`services/JudgeService.py`).
*   **Purpose**: To objectively evaluate and compare the performance of different LLMs (e.g., OpenAI vs. Mistral).
*   **Mechanism**: When the user requests a comparison, the system runs the query through multiple models. Then, a separate "Judge" LLM acts as a referee, analyzing the answers based on strict criteria (Accuracy, Reasoning, Clarity) and declaring a winner.

### 1.3 Memory Service
The **`MemoryService`** ensures continuity in conversations. It stores the chat history, allowing the LLMs to recall previous context, making the interaction feel natural and coherent rather than a series of isolated Q&A exchanges.

---

## 2. Prompt Engineering Strategies

The intelligence of the system is governed by carefully crafted **Prompt Files** (Markdown files in the `prompts/` directory). These files act as the "operating system" for the AI models.

### 2.1 The Master Prompt (`master_prompt.md`)
This is the primary instruction set for the AI Assistant. It defines the persona, behavior, and output standards.

*   **Identity**: The AI is defined not as a generic bot, but as a **"Digital Twin – B2B Marketing AI Assistant"**. It adopts the persona of a senior-level expert (CMO + Data Scientist + Compliance Officer).
*   **Dynamic Mode Switching**:
    *   **Mode A (Casual)**: For greetings and small talk (warm, concise).
    *   **Mode B (Expert - Default)**: Triggered by work-related queries. The AI switches to a professional, analytical tone, using deep structure and authoritative language.
*   **Directives**:
    *   **Language Mirroring**: The AI must reply in the exact language of the user (e.g., French input -> French output).
    *   **Strategic Frameworks**: It is instructed to automatically apply frameworks like **SWOT**, **PESTLE**, or **AIDA** when analyzing strategies.
    *   **Compliance**: It strictly checks for GDPR/PII issues in documents, acting as a safety filter.
*   **Output Protocol**: Responses are forced into a specific Markdown structure:
    1.  **Executive Summary**: A high-level overview.
    2.  **Detailed Analysis**: Deep dive using tables and bullet points.
    3.  **Recommendations**: Actionable next steps.

### 2.2 The Judge Prompt (`judge_prompt.md`)
This prompt guides the "Referee" AI during model comparisons.

*   **Objective**: To compare answers from "Model A" and "Model B".
*   **Scoring Metric (0-10)**:
    1.  **Accuracy**: Fact correctness.
    2.  **Reasoning Quality**: Logical flow.
    3.  **Clarity & Structure**: Readability.
    4.  **Safety**: Absence of hallucinations/harm.
    5.  **Factuality**: Adherence to the source document.
*   **Output Format**: It enforces a strict **JSON** output, ensuring the backend can programmatically parse the scores and winner without error.

---

## 3. Frontend Architecture (Pages)

The frontend is a **React** application designed to provide a seamless interface for these complex backend operations.

### 3.1 **Home Page (`HomePage.jsx`)**
*   **Purpose**: The landing page.
*   **Features**: Welcomes the user and likely provides quick access to the main features (Chat, Compare, Upload). It sets the tone for the "Premium" user experience.

### 3.2 **Chat Page (`ChatPage.jsx`)**
*   **Purpose**: The main workspace for interacting with the Digital Twin.
*   **Features**:
    *   **Chat Interface**: A messaging UI where users converse with the AI.
    *   **Document Upload**: A zone to drag-and-drop files for analysis.
    *   **Streaming Responses**: Displays the AI's reply in real-time.

### 3.3 **Compare Page (`ComparePage.jsx`)**
*   **Purpose**: A powerful tool for "Arena" style testing.
*   **Features**:
    *   Allows the user to send a single prompt to **multiple models** simultaneously (e.g., OpenAI and Mistral).
    *   Displays the responses side-by-side for human evaluation.
    *   Triggers the "Judge" system to automatically score the responses.

### 3.4 **Judge Results Page (`JudgeResultsPage.jsx`)**
*   **Purpose**: Displays the analytical results of a comparison battle.
*   **Features**:
    *   **Visual Charts**: Radar charts or Bar graphs showing the scores (Accuracy, Reasoning, etc.) of each model.
    *   **Detailed Critique**: Shows the Judge's written explanation of why one model won over the other.

### 3.5 **Document Preview Page (`DocumentPreviewPage.jsx`)**
*   **Purpose**: Allows users to verify and read the documents they have uploaded.
*   **Features**:
    *   Renders PDFs, Images, or Text content directly in the browser.
    *   Ensures the user knows exactly what context the AI is analyzing.

### 3.6 **History / Arena Page (`HistoryPage.jsx` / `ArenaPage.jsx`)**
*   **Purpose**: A repository of past interactions or "Battles".
*   **Features**:
    *   Lists previous sessions or comparison results.
    *   May include an "Arena" view that tracks the overall win-rates of different models over time (e.g., "OpenAI has won 60% of battles").

---

*Note: You can proceed to add screenshots to the respective sections in the Frontend chapter to illustrate the UI elements described above.*

---

## 4. Frontend-Backend Communication

The system uses a standard **REST API** architecture for communication.

1.  **The Request (Frontend)**:
    *   When a user sends a message or uploads a file, the React application uses **`utils/api.js`** (likely using a library like `axios` or `fetch`) to send an HTTP request (POST/GET) to the Django server.
    *   **Format**: JSON. Example: `{ "message": "Analyze this", "model": "openai" }`.

2.  **The Routing (Backend)**:
    *   Django receives the request at `api/urls.py`, which routes it to the specific View function in `api/views.py`.

3.  **The Processing**:
    *   The View calls the `LLMOrchestrator` to do the heavy lifting (RAG, Model Generation).

4.  **The Response**:
    *   The Backend sends back a JSON response: `{ "response": "Here is the analysis...", "metrics": { "time": 1.2 } }`.
    *   The Frontend receives this and updates the React state to display the message in the `ChatPage`.

---

## 5. Other Project Files (Complete Inventory)

In addition to the core files mentioned above, the following files play crucial roles in the system's operation.

### 5.1 Backend Services & Logic
*   **`services/AnalysisService.py`**: Specialized logic for deep-dive analysis tasks, separate from general chat.
*   **`services/file_generation.py`**: Handles the creation of downloadable files (e.g., generating a `.md` file when a user asks for a translation download).
*   **`model/ModelFactory.py`**: A design pattern class that acts as a central place to create specific Model instances (OpenAI, Mistral, DeepSeek) based on a string name.
*   **`api/urls.py`**: The "Traffic Controller". Defines all the API endpoints (e.g., `/api/chat`, `/api/upload`).
*   **`api/views.py`**: The "Gatekeeper". Receives HTTP requests, extracts data, calls the services, and returns HTTP responses.

### 5.2 RAG (Retrieval-Augmented Generation) System
*   **`rag/loader.py`**: Responsible for reading different file formats (PDF, DOCX, TXT) and extracting raw text.
*   **`rag/enricher.py`**: Adds metadata or extra context to text chunks before they are saved.
*   **`rag/vectorstore.py`**: Manages the connection to the Vector Database, handling the saving and searching of "Embeddings" (neural memories).
*   **`rag/pipeline.py`**: Connects the Loader, VectorStore, and Retriever into a single easy-to-use pipeline.

### 5.3 Frontend Components (`frontend/src/components/`)
*   **`ChatRoom.jsx`**: The core component that renders the list of chat bubbles.
*   **`Sidebar.jsx`**: The navigation menu on the left side of the screen.
*   **`UploadZone.jsx`**: The drag-and-drop area for managing file uploads.
*   **`DocumentList.jsx`**: Displays the list of currently uploaded files in the sidebar or chat.
*   **`DocumentSelector.jsx`**: A UI element to select which uploaded documents should be active for the current context.
*   **`ModelTabs.jsx`**: The switcher buttons used in the Compare/Arena pages to toggle between model views.
*   **`PageBackground.jsx`**: A layout component that handles the visual theme and background styling.
*   **`InlineUploadButton.jsx`**: A smaller, button-based upload trigger (likely inside the chat input area).

