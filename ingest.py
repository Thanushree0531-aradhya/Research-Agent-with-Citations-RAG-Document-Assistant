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

def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def get_embedding(text: str) -> list[float]:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values

def ingest_document(file_path: str, doc_name: str):
    print(f"Processing {doc_name}...")
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    print(f"Total chunks: {len(chunks)}")

    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[{"source": doc_name, "chunk_id": i}],
            ids=[f"{doc_name}_chunk_{i}"]
        )
    print(f"Ingestion complete for {doc_name}")