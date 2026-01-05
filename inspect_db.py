
import chromadb
import os

DB_DIR = "db/chroma"

def inspect():
    if not os.path.exists(DB_DIR):
        print(f"❌ Database directory {DB_DIR} does not exist.")
        return

    try:
        client = chromadb.PersistentClient(path=DB_DIR)
        collections = client.list_collections()
        print(f"Found {len(collections)} collections: {[c.name for c in collections]}")
        
        for coll in collections:
            print(f"\n--- Collection: {coll.name} ---")
            count = coll.count()
            print(f"Total Count: {count}")
            if count > 0:
                peek = coll.peek(limit=5)
                print("Peek (first 5 items):")
                if peek['documents']:
                    for i, doc in enumerate(peek['documents']):
                         print(f"  [{i}] {doc[:100]}...") # Print first 100 chars
                else:
                    print("  No documents found in peek.")
            else:
                print("  Empty collection.")

    except Exception as e:
        print(f"❌ Error inspecting DB: {e}")

if __name__ == "__main__":
    inspect()
