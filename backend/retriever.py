import chromadb
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

chroma_client = chromadb.PersistentClient(path="./chroma_store")
collection = chroma_client.get_or_create_collection(name="documents")

def get_embedding(text: str) -> list[float]:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values

def retrieve_chunks(query: str, top_k: int = 5, source: str = None) -> list[dict]:
    query_embedding = get_embedding(query)

    where_filter = {"source": source} if source else None

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter,
        include=["documents", "metadatas", "distances"]
    )

    chunks = []
    for i in range(len(results["documents"][0])):
        raw_page = results["metadatas"][0][i].get("page_number", None)
        chunks.append({
            "text": results["documents"][0][i],
            "source": results["metadatas"][0][i]["source"],
            "chunk_id": results["metadatas"][0][i]["chunk_id"],
            "page_number": int(raw_page) if raw_page is not None else "?",
            "score": round(1 - results["distances"][0][i], 4)
        })
    return chunks