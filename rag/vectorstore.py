# rag/vectorstore.py

import os
from dotenv import load_dotenv
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

from pathlib import Path

import chromadb

# Load .env explicitly from root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class VectorStore:
    def __init__(self, persist_directory="db/chroma"):
        self.persist_directory = str(BASE_DIR / persist_directory)

        # Load OpenAI key FROM ENV
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise ValueError("❌ OPENAI_API_KEY is missing in your .env file")

        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=api_key
        )
        
        # Initialize ONE persistent Chroma client to prevent SQLite locking/threading issues
        self.client = chromadb.PersistentClient(path=self.persist_directory)

        self.vectorstore = Chroma(
            client=self.client,
            embedding_function=self.embeddings,
            collection_name="digital_twin_docs"
        )

    def split_documents(self, docs_with_meta: List[dict]) -> List[dict]:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
            length_function=len,
        )
        
        split_chunks = []
        for item in docs_with_meta:
            content = item["content"]
            meta = item["metadata"]
            
            texts = text_splitter.split_text(content)
            for t in texts:
                split_chunks.append({"content": t, "metadata": meta})
                
        return split_chunks

    def clear(self):
        """Clears the entire vector store."""
        print("DEBUG: Clearing VectorStore...")
        try:
            self.vectorstore.delete_collection()
            # Re-initialize
            self.vectorstore = Chroma(
                client=self.client,
                embedding_function=self.embeddings,
                collection_name="digital_twin_docs"
            )
            print("DEBUG: VectorStore cleared.")
        except Exception as e:
            print(f"Error clearing vector store: {e}")

    def index(self, docs_with_meta: List[dict]):
        print(f"DEBUG: VectorStore.index called with {len(docs_with_meta)} documents")
        
        # Split docs preserving metadata
        chunks = self.split_documents(docs_with_meta)
        
        print(f"DEBUG: Split into {len(chunks)} chunks. Adding to Chroma...")
        if chunks:
            batch_size = 10
            total_chunks = len(chunks)
            
            for i in range(0, total_chunks, batch_size):
                batch = chunks[i : i + batch_size]
                
                texts = [c["content"] for c in batch]
                metadatas = [c["metadata"] for c in batch]
                
                try:
                    self.vectorstore.add_texts(texts=texts, metadatas=metadatas)
                except Exception as e:
                    print(f"❌ ERROR indexing batch: {e}")
                    raise e
                
            print("DEBUG: Successfully added all batches to Chroma.")

    def search(self, query: str, k: int = 4, filter: dict = None):
        return self.vectorstore.similarity_search(query, k=k, filter=filter)
