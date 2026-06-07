from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from ingest import ingest_document
from retriever import retrieve_chunks
from generator import generate_answer

app = FastAPI(title="RAG Document Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class QueryRequest(BaseModel):
    question: str

@app.get("/")
def root():
    return {"status": "RAG Document Assistant is running"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        ingest_document(file_path, file.filename)
        return {"message": f"{file.filename} uploaded and processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_document(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    try:
        chunks = retrieve_chunks(request.question, top_k=5)
        if not chunks:
            return {"answer": "No relevant documents found. Please upload a document first.", "citations": []}
        
        # TEMP DEBUG - check page numbers in terminal
        for c in chunks:
            print(f"CHUNK page_number: {c.get('page_number', 'MISSING')}")
        
        result = generate_answer(request.question, chunks)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    files = os.listdir(UPLOAD_DIR)
    pdfs = [f for f in files if f.endswith(".pdf")]
    return {"documents": pdfs}