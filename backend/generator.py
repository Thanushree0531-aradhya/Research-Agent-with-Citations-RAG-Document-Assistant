from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

NOT_FOUND_PHRASE = "I could not find relevant information in the uploaded documents."

def generate_answer(query: str, chunks: list[dict]) -> dict:
    context = ""
    for i, chunk in enumerate(chunks):
        context += f"[{i+1}] (Source: {chunk['source']}, Page: {chunk['page_number']})\n{chunk['text']}\n\n"

    prompt = f"""You are a helpful document assistant. Answer the user's question based ONLY on the context provided below.

Write your answer as natural, flowing prose — the way a knowledgeable person would explain it in conversation. Do not use bullet points or markdown tables unless the user explicitly asks for a list or table in their question.

Cite claims inline using only the bracket number, like [1] or [2], right after the fact it supports. Do not spell out "Page X" or the source filename inline in your answer text — the page and source are already tracked separately and shown to the user alongside your answer, so repeating them in your prose is redundant and cluttered.

Keep the answer as short as it can be while still fully answering the question. Do not restate the same information twice in different formats.

If the answer is not found in the context, say exactly: "I could not find relevant information in the uploaded documents."

Context:
{context}

Question: {query}

Answer (concise prose, inline [n] citations only, no page numbers or tables unless explicitly asked):"""

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
            "page_number": int(chunk["page_number"]) if chunk["page_number"] != "?" else "?",
            "text": chunk["text"],
            "score": chunk.get("score", 0)
        })

    return {
        "answer": response.choices[0].message.content,
        "citations": citations
    }