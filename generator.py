from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(query: str, chunks: list[dict]) -> dict:
    context = ""
    for i, chunk in enumerate(chunks):
        context += f"[{i+1}] (Source: {chunk['source']}, Chunk: {chunk['chunk_id']})\n{chunk['text']}\n\n"

    prompt = f"""You are a helpful document assistant. Answer the user's question based ONLY on the context provided below.

For every claim you make, cite the source using [1], [2], etc. based on the context numbers.
If the answer is not found in the context, say "I could not find relevant information in the uploaded documents."

Context:
{context}

Question: {query}

Answer (with citations):"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    citations = []
    for i, chunk in enumerate(chunks):
        citations.append({
            "index": i + 1,
            "source": chunk["source"],
            "chunk_id": chunk["chunk_id"],
            "score": chunk["score"],
            "text": chunk["text"][:200] + "..."
        })

    return {
        "answer": response.choices[0].message.content,
        "citations": citations
    }