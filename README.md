# DocMind - AI Chat with Document Search (RAG)
> Document-aware AI assistant built for the Lawyers Guild Internship Program � Assignment Round
**Live Demo:** https://timely-crisp-76d7ce.netlify.app
**Backend API:** https://huggingface.co/spaces/ThanushreeT/rag-backend
---
## Overview
A Retrieval-Augmented Generation (RAG) application that allows users to upload PDF documents and ask natural language questions. The assistant retrieves semantically relevant chunks and generates grounded answers with exact page number citations.
This project was built as part of the Lawyers Guild Internship Program Assignment Round, which evaluates:
- Technical fundamentals
- Problem-solving ability
- Practical implementation skills
- Code quality and system thinking
- Communication and ownership
---
## Key Features
- Upload PDF documents and process them for semantic search
- Chunk documents per page for accurate page-level citations
- Embed chunks using Google Gemini embedding model
- Retrieve relevant chunks using ChromaDB vector similarity search
- Generate AI answers with citations and page numbers using Groq LLaMA
- Clean responsive chat UI built with React
- Page number badge on every citation card
- Hallucination prevention - LLM answers only from document context
---
## Tech Stack
| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Document upload UI + chat interface |
| Backend | FastAPI (Python) | RAG pipeline orchestration |
| Embeddings | Gemini gemini-embedding-001 | Semantic text embeddings |
| Vector Store | ChromaDB | Chunk retrieval by similarity |
| LLM | Groq llama-3.3-70b-versatile | Answer generation with page citations |
| Hosting (FE) | Netlify | Static frontend deployment |
| Hosting (BE) | Hugging Face Spaces | Backend API deployment |
---
## Project Structure
rag-document-assistant/
- frontend/         React app
  - src/App.jsx     Main component with chat UI
  - public/
  - index.html
  - package.json
- backend/          Python backend
  - main.py         FastAPI entry point
  - ingest.py       PDF loading, chunking, embedding
  - retriever.py    ChromaDB vector store + search
  - generator.py    LLM prompt + answer generation
  - requirements.txt
- netlify.toml      Netlify build config
- README.md
---
## Getting Started
### Prerequisites
- Python 3.9+
- Node.js 18+
- Gemini API key (Google AI Studio)
- Groq API key (groq.com)
### Backend Setup
cd backend
pip install -r requirements.txt
Create .env file:
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
python -m uvicorn main:app --reload --port 8000
### Frontend Setup
cd frontend
npm install
npm run dev
Update API URL in src/App.jsx:
const API = 'http://localhost:8000';
---
## Environment Variables
| Variable | Required | Description |
|---|---|---|
| GEMINI_API_KEY | Yes | Google Gemini API key for embeddings |
| GROQ_API_KEY | Yes | Groq API key for LLaMA answer generation |
---
## How It Works - RAG Pipeline
### 1. Document Ingestion
1. PDF uploaded and extracted page by page using PyMuPDF
2. Each page chunked into overlapping word chunks (300 words, 30 overlap)
3. Chunks embedded using Gemini gemini-embedding-001
4. Vectors stored in ChromaDB with page number metadata
### 2. Query and Answer
1. User question embedded using Gemini
2. Top 5 most relevant chunks retrieved from ChromaDB
3. Chunks passed to Groq LLaMA with page numbers in prompt
4. LLM generates answer citing exact page numbers
5. Citation cards shown in UI with green page badge and relevance score
---
## Design Decisions and Trade-offs
### Chunking Strategy
Page-level chunking was chosen so each chunk carries its page number as metadata. This enables accurate page citations in answers. Fixed-size word chunking with overlap preserves context across chunk boundaries.
### Vector Store
ChromaDB persistent client was used instead of FAISS for built-in metadata support. This allows storing page numbers alongside vectors without a separate lookup table. For production, a hosted vector DB like Pinecone would be more appropriate.
### Embedding Model
Gemini gemini-embedding-001 provides high quality embeddings with generous free tier limits, suitable for interactive use.
### LLM
Groq with LLaMA 3.3 70B was chosen for fast inference and free tier availability. The prompt explicitly instructs the model to cite page numbers, reducing hallucination.
### Hosting
- Frontend on Netlify - Zero-config static hosting with GitHub auto-deploy
- Backend on Hugging Face Spaces - Free Docker-based hosting for ML workloads
---
## Edge Cases Handled
- Empty or corrupted PDF uploads return a clear error message
- Questions with no relevant context return not found response instead of hallucinating
- Old documents without page metadata gracefully show unknown page
- Large documents chunked safely without exceeding token limits
---
## Known Limitations
- ChromaDB resets when Hugging Face Space restarts - users need to re-upload PDF after cold start (~30s)
- Single shared vector store for all users in current implementation
---
## Deployment
### Frontend - Netlify
Connected to GitHub repo for auto-deploy on push.
netlify.toml configures base directory as frontend/.
### Backend - Hugging Face Spaces
Deployed as Docker Space at ThanushreeT/rag-backend.
Push changes to redeploy:
git remote add hf https://huggingface.co/spaces/ThanushreeT/rag-backend
git push hf main
---
## AI Usage Disclosure
AI tools (Claude) were used to assist with:
- Boilerplate code scaffolding
- Debugging assistance
- README drafting
All architectural decisions, retrieval pipeline design, prompt engineering, page number feature implementation, and deployment choices were made and are fully understood by the author.
