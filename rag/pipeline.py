# rag/pipeline.py

from typing import List, Dict
from rag.loader import load_any
from rag.vectorstore import VectorStore


class RAGPipeline:
    def __init__(self, store_path="db/chroma"):
        self.vs = VectorStore(store_path)

    def index_document(self, file_path: str):
        print(f"DEBUG: Loading document from {file_path}")
        docs = load_any(file_path)
        print(f"DEBUG: Loaded {len(docs)} items.")
        self.vs.index(docs)
        print("DEBUG: VectorStore indexing complete.")
        
    def clear(self):
        self.vs.clear()

    def retrieve(self, query: str, k=4, filter: dict = None) -> List[str]:
        results = self.vs.search(query, k=k, filter=filter)
        return [r.page_content for r in results]

    def build_augmented_prompt(
        self, user_message: str, retrieved_docs: List[str]
    ) -> str:
        if not retrieved_docs:
            return user_message

        context_block = "\n\n".join(retrieved_docs)

        return f"""
[CONTEXT START]
{context_block}
[CONTEXT END]

User request:
{user_message}
"""

    def run(self, model, user_message: str, k=25) -> Dict:
        retrieved = self.retrieve(user_message, k=k)
        augmented_prompt = self.build_augmented_prompt(user_message, retrieved)

        response = model.generate(augmented_prompt)

        return {"response": response, "retrieved_docs": retrieved}
