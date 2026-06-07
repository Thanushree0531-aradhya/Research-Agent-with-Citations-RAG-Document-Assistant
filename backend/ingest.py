import fitz  # PyMuPDF
import chromadb
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API KEY LOADED: {api_key[:10] if api_key else 'NOT FOUND'}")
client = genai.Client(api_key=api_key)

chroma_client = chromadb.PersistentClient(path="./chroma_store")
collection = chroma_client.get_or_create_collection(name="documents")

def extract_chunks_with_pages(file_path: str, chunk_size: int = 300, overlap: int = 30) -> list[dict]:
    doc = fitz.open(file_path)
    chunks = []
    for page_num, page in enumerate(doc, start=1):  # 1-indexed pages
        text = page.get_text()
        if not text.strip():
            continue
        words = text.split()
        i = 0
        while i < len(words):
            chunk_text = " ".join(words[i:i+chunk_size])
            chunks.append({"text": chunk_text, "page_number": page_num})
            i += chunk_size - overlap
    return chunks

def get_embeddings_batch(texts: list[str], batch_size: int = 20) -> list[list[float]]:
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=batch
        )
        all_embeddings.extend([e.values for e in result.embeddings])
        print(f"  Embedded {min(i+batch_size, len(texts))}/{len(texts)} chunks...")
    return all_embeddings

def ingest_document(file_path: str, doc_name: str):
    print(f"Processing {doc_name}...")
    chunk_dicts = extract_chunks_with_pages(file_path)
    texts = [c["text"] for c in chunk_dicts]
    print(f"Total chunks: {len(texts)}")

    embeddings = get_embeddings_batch(texts)

    collection.add(
        documents=texts,
        embeddings=embeddings,
        metadatas=[{
            "source": doc_name,
            "chunk_id": i,
            "page_number": chunk_dicts[i]["page_number"]  # ← stored here
        } for i in range(len(texts))],
        ids=[f"{doc_name}_chunk_{i}" for i in range(len(texts))]
    )
    print(f"Ingestion complete for {doc_name}")