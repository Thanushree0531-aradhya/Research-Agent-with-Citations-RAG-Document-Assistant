# 
**Frontend (Netlify):**  
https://research-agent-with-citations.netlify.app/

## Backend API (Hugging Face Space)

https://huggingface.co/spaces/ThanushreeT/research-agent-backend

A Retrieval-Augmented Generation (RAG) research assistant that allows users to upload one or more PDF documents and ask natural language questions. The system retrieves semantically relevant content and generates grounded answers using **only the uploaded documents**, with **inline citations** pointing to the exact source file and page number. If the requested information is not present in the uploaded documents, the assistant explicitly states that instead of generating unsupported responses.

---

## Overview

This project was built as a document-grounded AI research assistant that combines semantic search, vector embeddings, and large language models to answer questions from uploaded PDF documents.

The application follows a complete Retrieval-Augmented Generation (RAG) pipeline:

1. Upload one or more PDF documents.
2. Extract and chunk document content.
3. Generate semantic embeddings.
4. Retrieve the most relevant document chunks.
5. Generate an answer strictly from retrieved context.
6. Return the answer together with document and page citations.

The system is designed to minimize hallucinations by refusing to answer questions that are unsupported by the uploaded documents.

---

# Key Features

* Upload one or more PDF documents
* Automatic text extraction using PyMuPDF
* OCR fallback using Tesseract OCR for scanned/image PDFs
* Page-level chunking with overlap for accurate citations
* Semantic embeddings using Google Gemini (`gemini-embedding-001`)
* ChromaDB vector similarity search
* Grounded answer generation using Groq LLaMA 3.3 70B
* Inline citations containing source document and page number
* Relevance score returned for every retrieved citation
* Optional document filtering during retrieval
* Hallucination prevention by answering only from retrieved context

---

# Tech Stack

| Layer        | Technology                     | Purpose                           |
| ------------ | ------------------------------ | --------------------------------- |
| Frontend     | React + Vite                   | Upload UI and chat interface      |
| Backend      | FastAPI                        | RAG pipeline orchestration        |
| Embeddings   | Gemini `gemini-embedding-001`  | Semantic embeddings               |
| Vector Store | ChromaDB                       | Similarity search                 |
| LLM          | Groq `llama-3.3-70b-versatile` | Answer generation                 |
| OCR          | Tesseract OCR + pdf2image      | Text extraction from scanned PDFs |

---

# Project Structure

```text
rag-document-assistant/

frontend/
├── src/
│   ├── App.jsx
│   ├── components/
│   └── services/
├── package.json

backend/
├── main.py
├── ingest.py
├── retriever.py
├── generator.py
├── requirements.txt
└── .env

samples/
├── transcript.md

questions.md

README.md
```

---

# Getting Started

## Prerequisites

* Python 3.9+
* Node.js 18+
* Google Gemini API Key
* Groq API Key

Optional (for scanned PDFs)

* Tesseract OCR
* Poppler

---

# Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory.

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Run the backend server.

```bash
uvicorn main:app --reload --port 8000
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

If necessary, update the backend API URL inside `src/App.jsx`.

```javascript
const API = "http://localhost:8000";
```

---

# Environment Variables

| Variable       | Required | Description                     |
| -------------- | -------- | ------------------------------- |
| GEMINI_API_KEY | Yes      | Google Gemini embedding API key |
| GROQ_API_KEY   | Yes      | Groq LLaMA API key              |

---

# How It Works

## 1. Document Ingestion

* User uploads one or more PDF documents.
* Text is extracted using PyMuPDF.
* If the document has no extractable text, OCR is performed using Tesseract.
* Each document is divided into overlapping chunks.
* Every chunk stores:

  * Source filename
  * Page number
  * Chunk text
* Gemini generates embeddings for each chunk.
* Embeddings are stored in ChromaDB.

---

## 2. Query Processing

* User submits a natural language question.
* The question is embedded using Gemini.
* ChromaDB retrieves the most relevant chunks.
* Retrieved context is passed to Groq LLaMA.
* The model generates an answer strictly from the retrieved context.
* Every factual statement is accompanied by inline citations.
* If no supporting information exists, the assistant returns a "not found" response.

---

# Sample Test Suite

The repository includes a reproducible evaluation set.

## Files Included

* `questions.md` – Contains 10 evaluation questions covering three sample PDF documents.
* `samples/transcript.md` – Contains the JSON responses generated by the application, including answers and citations.

## Sample Documents

* `oec_pec_application.pdf`
* `CMRIT_Internship_Placement_Policy.pdf`
* `UDEMY.pdf`

## Running the Test Suite

1. Start the backend server.
2. Upload the three sample PDF documents.
3. Run each question using:

```powershell
curl.exe -X POST http://localhost:8000/query ^
-H "Content-Type: application/json" ^
-d "{\"question\":\"<paste question here>\"}"
```

4. Compare the generated responses with `samples/transcript.md`.

---

# Design Decisions

## Page-Level Metadata

Each chunk stores its original page number so every generated answer can reference the exact page where the information was found.

## Chunking Strategy

Fixed-size overlapping chunks were selected because they preserve context while keeping retrieval efficient.

## Vector Database

ChromaDB was chosen because it provides persistent local storage, metadata filtering, and requires minimal configuration.

## Embedding Model

Google Gemini embeddings provide high-quality semantic representations while offering a generous free usage tier.

## Language Model

Groq-hosted LLaMA 3.3 70B was selected because it offers fast inference and strong instruction-following performance.

## OCR

OCR is used only when uploaded PDFs contain no selectable text.

---

# Tradeoffs

* Fixed-size chunking is simpler than semantic chunking but may occasionally split related information.
* ChromaDB is ideal for local development but a managed vector database such as Pinecone or Qdrant would be better for production.
* OCR accuracy depends on document quality and scan resolution.
* Retrieval quality depends on chunk size and embedding quality.
* The current implementation processes uploaded documents within a single backend session.

---

# Edge Cases Handled

* Empty PDF uploads
* Corrupted PDF files
* Scanned documents
* Questions with no supporting evidence
* Multiple uploaded PDFs
* Missing page metadata
* Hallucination prevention for unsupported queries

---

# Known Limitations

* Uploaded documents are not persisted permanently.
* ChromaDB is intended for local development.
* Very large PDF collections may increase indexing time.
* OCR quality varies depending on scan quality.

---






