import fitz  # PyMuPDF
import chromadb
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

# OCR support is optional. If pytesseract/pdf2image/Tesseract/Poppler aren't
# installed, we skip OCR gracefully instead of crashing the whole app on import.
try:
    import pytesseract
    from pdf2image import convert_from_path

    # Only set these if you're on Windows and the binaries aren't on PATH.
    # Leave unset on Linux/Mac where tesseract/pdftoppm are usually already on PATH.
    _tesseract_cmd = os.getenv("TESSERACT_CMD")
    if _tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = _tesseract_cmd
    POPPLER_PATH = os.getenv("POPPLER_PATH")  # None is fine on Linux/Mac

    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    POPPLER_PATH = None

api_key = os.getenv("GEMINI_API_KEY")
print(f"API KEY LOADED: {api_key[:10] if api_key else 'NOT FOUND'}")
client = genai.Client(api_key=api_key)

chroma_client = chromadb.PersistentClient(path="./chroma_store")
collection = chroma_client.get_or_create_collection(name="documents")

def extract_chunks_with_pages(file_path: str, chunk_size: int = 300, overlap: int = 30) -> list[dict]:
    doc = fitz.open(file_path)
    chunks = []

    needs_ocr = all(not page.get_text().strip() for page in doc)

    if needs_ocr:
        if not OCR_AVAILABLE:
            print("Scanned PDF detected, but OCR dependencies (pytesseract/pdf2image) "
                  "are not installed. Skipping OCR — no text will be extracted from this file.")
            return chunks
        print("Scanned PDF detected — using OCR...")
        images = convert_from_path(file_path, poppler_path=POPPLER_PATH)
        for page_num, image in enumerate(images, start=1):
            text = pytesseract.image_to_string(image)
            if not text.strip():
                continue
            words = text.split()
            i = 0
            while i < len(words):
                chunk_text = " ".join(words[i:i+chunk_size])
                chunks.append({"text": chunk_text, "page_number": page_num})
                i += chunk_size - overlap
    else:
        print("Text-based PDF detected — using normal extraction...")
        for page_num, page in enumerate(doc, start=1):
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
        print(f"  Sending batch of {len(batch)} texts to Gemini embed API...")
        print(f"  Sample text (first 100 chars): {batch[0][:100]!r}")
        try:
            result = client.models.embed_content(
                model="gemini-embedding-001",
                contents=batch
            )
        except Exception as e:
            print(f"  GEMINI API CALL RAISED AN EXCEPTION: {type(e).__name__}: {e}")
            raise RuntimeError(f"Gemini embedding API call failed: {e}") from e

        print(f"  Raw result.embeddings length: {len(result.embeddings) if result.embeddings else 0}")

        if not result.embeddings:
            raise RuntimeError(
                f"Gemini API returned ZERO embeddings for a batch of {len(batch)} texts. "
                f"This usually means an invalid/expired GEMINI_API_KEY, a quota issue, "
                f"or the model name is wrong. Full API response: {result}"
            )

        all_embeddings.extend([e.values for e in result.embeddings])
        print(f"  Embedded {min(i+batch_size, len(texts))}/{len(texts)} chunks...")
    return all_embeddings

def ingest_document(file_path: str, doc_name: str):
    print(f"Processing {doc_name}...")
    chunk_dicts = extract_chunks_with_pages(file_path)
    texts = [c["text"] for c in chunk_dicts]
    print(f"Total chunks: {len(texts)}")

    if not texts:
        raise ValueError("No text could be extracted from the PDF. File may be corrupted or empty.")

    embeddings = get_embeddings_batch(texts)

    collection.add(
        documents=texts,
        embeddings=embeddings,
        metadatas=[{
            "source": doc_name,
            "chunk_id": i,
            "page_number": chunk_dicts[i]["page_number"]
        } for i in range(len(texts))],
        ids=[f"{doc_name}_chunk_{i}" for i in range(len(texts))]
    )
    print(f"Ingestion complete for {doc_name}")