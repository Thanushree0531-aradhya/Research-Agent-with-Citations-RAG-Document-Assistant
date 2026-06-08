<<<<<<< HEAD
﻿# 📄 AI Chat with Document Search (RAG)
> Document-aware AI assistant built for the Lawyers Guild Internship Program — Assignment Round
**Live Demo:** [timely-crisp-76d7ce.netlify.app](https://timely-crisp-76d7ce.netlify.app)
---
## 🧠 Overview
This project is a Retrieval-Augmented Generation (RAG) application that allows users to upload documents and ask natural language questions about them. The assistant retrieves semantically relevant chunks from the uploaded documents and uses an LLM to generate grounded, cited answers.
### Key Capabilities
- Upload PDF/text documents and process them for semantic search
- Chunk documents intelligently for retrieval quality
- Embed chunks using a sentence-transformer embedding model
- Retrieve the most relevant chunks using vector similarity search
- Generate AI answers grounded in the retrieved context, with citations
- Clean, responsive chat UI for seamless interaction
---
## 🏗️ Architecture
\\\
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Netlify)                  │
│              timely-crisp-76d7ce.netlify.app             │
│                                                         │
│   Upload UI ──► Chat Interface ──► Citation Display     │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────┐
│               Backend (Hugging Face Spaces)              │
│     ThanushreeT/rag-backend (FastAPI / Gradio)          │
│                                                         │
│  Document Ingestion                                     │
│    └── Text Extraction ──► Chunking ──► Embedding       │
│                                          └── Vector Store│
│                                                         │
│  Query Pipeline                                         │
│    └── Embed Query ──► Similarity Search ──► LLM Answer │
└─────────────────────────────────────────────────────────┘
\\\
### Component Breakdown
| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML/CSS/JS or React | Document upload UI + chat interface |
| Backend | FastAPI / Gradio (Python) | RAG pipeline orchestration |
| Embeddings | sentence-transformers | Semantic text embeddings |
| Vector Store | FAISS / in-memory | Chunk retrieval by similarity |
| LLM | Hugging Face Inference API | Answer generation |
| Hosting (FE) | Netlify | Static frontend deployment |
| Hosting (BE) | Hugging Face Spaces | Backend API deployment |
---
## 🚀 Getting Started
### Prerequisites
- Python 3.9+
- Node.js 18+ (if running frontend locally)
- A Hugging Face account (free) for model access
---
### Backend Setup
\\\ash
# Clone the repository
git clone https://github.com/Thanushree0531-aradhya/rag-document-assistant.git
cd rag-document-assistant/backend
# Create a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
# Install dependencies
pip install -r requirements.txt
# Set environment variables
cp .env.example .env
# Edit .env and add your Hugging Face API token:
# HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
# Run the backend locally
uvicorn app:app --reload --port 8000
\\\
The backend will be available at http://localhost:8000.
---
### Frontend Setup
\\\ash
cd ../frontend
# Install dependencies (if using a JS framework)
npm install
# Start the development server
npm run dev
\\\
Or simply open index.html in your browser if it is a plain HTML/JS frontend.
Update the API base URL in the frontend config to point to your local backend:
\\\js
const API_BASE_URL = "http://localhost:8000";
\\\
---
### Environment Variables
| Variable | Required | Description |
|---|---|---|
| HF_TOKEN | Yes | Hugging Face API token for model inference |
| MODEL_NAME | No | LLM model ID (default: mistralai/Mistral-7B-Instruct-v0.2) |
| EMBEDDING_MODEL | No | Embedding model (default: sentence-transformers/all-MiniLM-L6-v2) |
| CHUNK_SIZE | No | Token size per chunk (default: 512) |
| CHUNK_OVERLAP | No | Overlap between chunks (default: 64) |
---
## 📦 Project Structure
\\\
.
├── frontend/
│   ├── index.html          # Main UI
│   ├── style.css           # Styling
│   ├── app.js              # Chat logic, file upload, API calls
│   └── config.js           # API base URL config
│
├── backend/
│   ├── app.py              # FastAPI/Gradio entry point
│   ├── ingest.py           # Document loading, chunking, embedding
│   ├── retriever.py        # FAISS vector store + similarity search
│   ├── generator.py        # LLM prompt construction + answer generation
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
│
└── README.md
\\\
---
## 🔄 RAG Pipeline — How It Works
### 1. Document Ingestion
When a user uploads a document:
1. Text Extraction — Raw text is extracted from the uploaded file (PDF, TXT, DOCX)
2. Chunking — Text is split into overlapping fixed-size chunks (default: 512 tokens, 64 overlap)
3. Embedding — Each chunk is embedded using sentence-transformers/all-MiniLM-L6-v2
4. Indexing — Vectors are stored in a FAISS index for fast similarity retrieval
### 2. Query and Answer
When a user asks a question:
1. Query Embedding — The question is embedded using the same model
2. Similarity Search — Top-k most relevant chunks are retrieved from FAISS (default k=5)
3. Prompt Construction — Retrieved chunks are assembled into a context-grounded prompt
4. Answer Generation — The LLM generates a response using only the provided context
5. Citation Display — Relevant source chunks are surfaced alongside the answer
---
## 🎯 Design Decisions and Trade-offs
### Chunking Strategy
Fixed-size chunking with overlap was chosen for simplicity and reliability. Semantic chunking would improve retrieval quality but adds latency and complexity — a reasonable trade-off for this scope.
### Vector Store
FAISS (in-memory) was used instead of a hosted vector DB (Pinecone, Weaviate) to avoid API keys and cold-start complexity for the demo. For production, a persistent vector DB would be appropriate.
### Embedding Model
all-MiniLM-L6-v2 provides a strong quality/speed balance — fast enough for interactive use and performant for general English text retrieval.
### LLM
Hugging Face Inference API was used to avoid OpenAI costs and keep the stack open. The prompt explicitly instructs the model to answer only from the provided context, reducing hallucination.
### Hosting
- Frontend on Netlify — Zero-config static hosting with instant deploys
- Backend on Hugging Face Spaces — Free GPU-backed hosting well-suited for ML workloads
---
## 🧪 Edge Cases Handled
- Empty or corrupted document uploads return a clear error
- Questions with no relevant context produce a not found in document response rather than hallucinating
- Large documents are chunked safely without exceeding token limits
- Duplicate uploads are detected and de-duplicated before re-indexing
---
## 🔗 Deployment
| Service | URL |
|---|---|
| Frontend | timely-crisp-76d7ce.netlify.app |
| Backend API | huggingface.co/spaces/ThanushreeT/rag-backend |
### Deploying Frontend to Netlify
\\\ash
npm install -g netlify-cli
netlify deploy --prod --dir=frontend
\\\
### Deploying Backend to Hugging Face Spaces
\\\ash
git remote add space https://huggingface.co/spaces/ThanushreeT/rag-backend
git push space main
\\\
---
## 📋 Dependencies
### Backend
\\\
fastapi
uvicorn
python-multipart
sentence-transformers
faiss-cpu
PyMuPDF
python-docx
huggingface-hub
transformers
python-dotenv
\\\
---
## ⚠️ Known Limitations
- The FAISS index is in-memory and resets when the backend restarts
- Only text-based PDFs are supported; scanned/image PDFs require OCR (not yet implemented)
- Concurrent multi-user sessions share the same vector store in the current implementation
---
## 🤖 AI Usage Disclosure
AI tools (Claude) were used to assist with boilerplate code scaffolding and README drafting. All architectural decisions, retrieval pipeline design, prompt engineering, and implementation choices were made and are fully understood by the author.
---
## 👤 Author
**Thanushree T**
Lawyers Guild Internship Program — Assignment Round
=======
﻿---
title: rag-backend
emoji: 🤖
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
---
>>>>>>> b54a6c2e6cdd6fa33fc3ba3b487464e8e6095e0b
