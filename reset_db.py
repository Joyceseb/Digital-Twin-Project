
import chromadb
import os
import shutil

DB_DIR = "db/chroma"

def reset_db():
    print(f"Reseting database at {DB_DIR}...")
    
    if os.path.exists(DB_DIR):
        try:
            # Close any open connections by just removing the dir (safest way to full reset)
            # But chromadb might have a lock. 
            # Trying client.delete_collection first.
            client = chromadb.PersistentClient(path=DB_DIR)
            try:
                client.delete_collection("digital_twin_docs")
                print("✅ Deleted collection 'digital_twin_docs'")
            except ValueError:
                print("Collection 'digital_twin_docs' did not exist.")
                
            # verify it's gone
            cols = client.list_collections()
            print(f"Collections remaining: {[c.name for c in cols]}")
            
        except Exception as e:
            print(f"❌ Error during reset: {e}")
            print("Attempting force delete of directory...")
            try:
                shutil.rmtree(DB_DIR)
                print("✅ Force deleted db directory.")
            except Exception as e2:
                print(f"❌ Failed to delete directory: {e2}")
    else:
        print("Database directory does not exist. Nothing to reset.")

if __name__ == "__main__":
    reset_db()
