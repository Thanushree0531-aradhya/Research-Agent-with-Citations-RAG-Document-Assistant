import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API = "https://thanushreet-rag-backend.hf.space";
const HEADERS = {};

const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d0d0f;
    color: #e8e6f0;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2835; border-radius: 4px; }
  .app {
    display: grid;
    grid-template-columns: 280px 1fr;
    height: 100vh;
    overflow: hidden;
  }
  .sidebar {
    background: #0a0a0c;
    border-right: 1px solid #1e1c2a;
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    overflow: hidden;
  }
  .sidebar-header {
    padding: 0 20px 24px;
    border-bottom: 1px solid #1e1c2a;
  }
  .logo {
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    color: #e8e6f0;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .logo-dot {
    width: 8px; height: 8px;
    background: #7c5cfc;
    border-radius: 50%;
    box-shadow: 0 0 12px #7c5cfc;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }
  .sidebar-section {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  }
  .section-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #4a4760;
    margin-bottom: 12px;
  }
  .upload-zone {
    border: 1.5px dashed #2a2835;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    margin-bottom: 12px;
  }
  .upload-zone:hover { border-color: #7c5cfc; background: rgba(124,92,252,0.04); }
  .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .upload-icon { font-size: 22px; margin-bottom: 6px; }
  .upload-text { font-size: 12px; color: #6b6880; }
  .upload-text strong { color: #9d8cfc; display: block; font-size: 13px; margin-bottom: 2px; }
  .btn-upload {
    width: 100%;
    background: linear-gradient(135deg, #7c5cfc, #5b3fd4);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn-upload:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(124,92,252,0.4); }
  .btn-upload:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .upload-status {
    font-size: 12px;
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .upload-status.success { background: rgba(52,211,153,0.1); color: #34d399; }
  .upload-status.error { background: rgba(248,113,113,0.1); color: #f87171; }
  .divider { height: 1px; background: #1e1c2a; margin: 20px 0; }
  .doc-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 7px;
    margin-bottom: 4px;
    font-size: 12px;
    color: #8b88a0;
    background: #111118;
    border: 1px solid #1e1c2a;
    transition: all 0.15s;
    cursor: pointer;
  }
  .doc-item:hover { border-color: #2e2b40; color: #c4c0d8; }
  .doc-item.active {
    border-color: #7c5cfc;
    background: rgba(124,92,252,0.08);
    color: #c4b8ff;
  }
  .doc-icon { font-size: 14px; flex-shrink: 0; }
  .doc-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .doc-check { font-size: 12px; color: #7c5cfc; flex-shrink: 0; }
  .active-doc-banner {
    font-size: 11px;
    color: #7c5cfc;
    background: rgba(124,92,252,0.08);
    border: 1px solid rgba(124,92,252,0.2);
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .clear-doc {
    margin-left: auto;
    cursor: pointer;
    color: #4a4760;
    font-size: 13px;
    background: none;
    border: none;
    padding: 0;
  }
  .clear-doc:hover { color: #c4c0d8; }
  .main {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #0d0d0f;
  }
  .chat-header {
    padding: 18px 28px;
    border-bottom: 1px solid #1e1c2a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #0a0a0c;
    flex-shrink: 0;
  }
  .chat-title {
    font-family: 'Instrument Serif', serif;
    font-size: 18px;
    color: #e8e6f0;
    letter-spacing: -0.2px;
  }
  .chat-meta {
    font-size: 12px;
    color: #4a4760;
    font-family: 'DM Mono', monospace;
  }
  .chat-history {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #2e2b40;
    padding: 60px 20px;
  }
  .empty-icon { font-size: 48px; filter: grayscale(1) opacity(0.3); }
  .empty-text {
    font-family: 'Instrument Serif', serif;
    font-size: 20px;
    color: #2e2b40;
  }
  .empty-sub {
    font-size: 13px;
    color: #1e1c2a;
    text-align: center;
    max-width: 280px;
    line-height: 1.6;
  }
  .message { display: flex; flex-direction: column; gap: 6px; animation: fadeUp 0.3s ease; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .message-q {
    align-self: flex-end;
    max-width: 70%;
    background: linear-gradient(135deg, #7c5cfc22, #5b3fd422);
    border: 1px solid #7c5cfc44;
    border-radius: 14px 14px 4px 14px;
    padding: 12px 16px;
    font-size: 14px;
    color: #c4b8ff;
    line-height: 1.6;
  }
  .message-a {
    align-self: flex-start;
    max-width: 85%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .answer-bubble {
    background: #111118;
    border: 1px solid #1e1c2a;
    border-radius: 4px 14px 14px 14px;
    padding: 16px 18px;
    font-size: 14px;
    line-height: 1.75;
    color: #c8c5d8;
  }
  .answer-bubble p { margin-bottom: 8px; }
  .answer-bubble p:last-child { margin-bottom: 0; }
  .answer-bubble table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 13px;
  }
  .answer-bubble th {
    background: #1a1828;
    color: #9d8cfc;
    padding: 8px 12px;
    text-align: left;
    border: 1px solid #2a2835;
    font-weight: 500;
  }
  .answer-bubble td {
    padding: 7px 12px;
    border: 1px solid #1e1c2a;
    color: #c8c5d8;
  }
  .answer-bubble tr:nth-child(even) td { background: #0f0f16; }
  .answer-bubble tr:hover td { background: #1a1828; }
  .answer-bubble ul, .answer-bubble ol {
    padding-left: 20px;
    margin: 8px 0;
  }
  .answer-bubble li { margin-bottom: 4px; }
  .answer-bubble strong { color: #e8e6f0; font-weight: 500; }
  .answer-bubble code {
    background: #1a1828;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #9d8cfc;
  }
  .answer-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #4a4760;
    margin-bottom: 4px;
    font-family: 'DM Mono', monospace;
  }
  .citations-toggle {
    background: none;
    border: 1px solid #2a2835;
    border-radius: 6px;
    padding: 6px 12px;
    color: #7c5cfc;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
    width: fit-content;
  }
  .citations-toggle:hover { background: rgba(124,92,252,0.08); border-color: #7c5cfc; }
  .citations-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: fadeUp 0.2s ease;
  }
  .citation-card {
    background: #0a0a0c;
    border: 1px solid #1e1c2a;
    border-left: 3px solid #7c5cfc;
    border-radius: 0 8px 8px 0;
    padding: 10px 14px;
    font-size: 12px;
  }
  .citation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    gap: 8px;
    flex-wrap: wrap;
  }
  .citation-source {
    color: #9d8cfc;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
  }
  .citation-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .citation-page {
    background: rgba(52, 211, 153, 0.12);
    color: #34d399;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    white-space: nowrap;
  }
  .citation-score {
    background: rgba(124,92,252,0.15);
    color: #7c5cfc;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
  }
  .citation-text {
    color: #6b6880;
    line-height: 1.6;
    font-size: 11.5px;
  }
  .thinking {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 18px;
    background: #111118;
    border: 1px solid #1e1c2a;
    border-radius: 4px 14px 14px 14px;
    width: fit-content;
    color: #4a4760;
    font-size: 13px;
    font-style: italic;
  }
  .dots { display: flex; gap: 4px; }
  .dot {
    width: 5px; height: 5px;
    background: #7c5cfc;
    border-radius: 50%;
    animation: bounce 1.2s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  .input-area {
    padding: 16px 28px 20px;
    border-top: 1px solid #1e1c2a;
    background: #0a0a0c;
    flex-shrink: 0;
  }
  .input-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    background: #111118;
    border: 1px solid #2a2835;
    border-radius: 12px;
    padding: 10px 12px;
    transition: border-color 0.2s;
  }
  .input-row:focus-within { border-color: #7c5cfc44; }
  .input-row textarea {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #e8e6f0;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    max-height: 120px;
    min-height: 24px;
  }
  .input-row textarea::placeholder { color: #2e2b40; }
  .btn-send {
    background: linear-gradient(135deg, #7c5cfc, #5b3fd4);
    border: none;
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s;
    color: white;
    font-size: 15px;
  }
  .btn-send:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 16px rgba(124,92,252,0.4); }
  .btn-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
  .input-hint {
    font-size: 11px;
    color: #2e2b40;
    margin-top: 8px;
    font-family: 'DM Mono', monospace;
    text-align: center;
  }
`;
document.head.appendChild(style);

export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [openCitations, setOpenCitations] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { fetchDocuments(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/upload`, formData, { headers: HEADERS });
      setUploadMsg({ type: "success", text: res.data.message });
      fetchDocuments();
    } catch (err) {
      setUploadMsg({ type: "error", text: "Upload failed: " + (err.response?.data?.detail || err.message) });
    }
    setUploading(false);
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API}/documents`, { headers: HEADERS });
      setDocuments(res.data.documents);
    } catch {}
  };

  const handleQuery = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");
    setLoading(true);
    setChatHistory(prev => [...prev, { type: "q", text: q }]);
    try {
      const payload = { question: q };
      if (selectedDoc) payload.source = selectedDoc;
      const res = await axios.post(`${API}/query`, payload, { headers: HEADERS });
      setChatHistory(prev => [...prev, { type: "a", ...res.data }]);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        type: "a",
        answer: "❌ " + (err.response?.data?.detail || "Something went wrong."),
        citations: []
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const toggleCitations = (idx) => {
    setOpenCitations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const answerCount = chatHistory.filter(m => m.type === "a").length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-dot" />
            DocMind
          </div>
        </div>
        <div className="sidebar-section">
          <div className="section-label">Upload Document</div>
          <div className="upload-zone">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => { setFile(e.target.files[0]); setUploadMsg(""); }}
            />
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              <strong>{file ? file.name : "Choose a PDF"}</strong>
              {!file && "click to browse"}
            </div>
          </div>
          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <><span>Processing</span><div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div></>
            ) : (
              <><span>⬆</span> Upload & Process</>
            )}
          </button>
          {uploadMsg && (
            <div className={`upload-status ${uploadMsg.type}`}>
              {uploadMsg.type === "success" ? "✓" : "✕"} {uploadMsg.text}
            </div>
          )}
          {documents.length > 0 && (
            <>
              <div className="divider" />
              <div className="section-label">Indexed Documents</div>
              {selectedDoc && (
                <div className="active-doc-banner">
                  <span>🎯</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedDoc}
                  </span>
                  <button className="clear-doc" onClick={() => setSelectedDoc(null)}>✕</button>
                </div>
              )}
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className={`doc-item ${selectedDoc === doc ? "active" : ""}`}
                  onClick={() => setSelectedDoc(prev => prev === doc ? null : doc)}
                  title={selectedDoc === doc ? "Click to deselect" : "Click to filter by this doc"}
                >
                  <span className="doc-icon">📎</span>
                  <span className="doc-name">{doc}</span>
                  {selectedDoc === doc && <span className="doc-check">✓</span>}
                </div>
              ))}
              {!selectedDoc && (
                <div style={{ fontSize: 11, color: "#2e2b40", marginTop: 8, textAlign: "center" }}>
                  Click a doc to filter queries
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      <main className="main">
        <div className="chat-header">
          <div className="chat-title">Ask your documents</div>
          <div className="chat-meta">
            {selectedDoc
              ? `Searching: ${selectedDoc}`
              : answerCount > 0
                ? `${answerCount} response${answerCount > 1 ? "s" : ""}`
                : "Ready"}
          </div>
        </div>
        <div className="chat-history">
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-text">No questions yet</div>
              <div className="empty-sub">
                {selectedDoc
                  ? `Asking about: ${selectedDoc}`
                  : "Upload a PDF and start asking questions. Click a document to filter."}
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} className="message">
                {msg.type === "q" ? (
                  <div className="message-q">{msg.text}</div>
                ) : (
                  <div className="message-a">
                    <div className="answer-label">Answer</div>
                    <div className="answer-bubble">
                      <ReactMarkdown>{msg.answer}</ReactMarkdown>
                    </div>
                    {msg.citations?.length > 0 && (
                      <>
                        <button
                          className="citations-toggle"
                          onClick={() => toggleCitations(idx)}
                        >
                          📎 {openCitations[idx] ? "Hide" : "Show"} {msg.citations.length} citation{msg.citations.length > 1 ? "s" : ""}
                          <span style={{ marginLeft: 2 }}>{openCitations[idx] ? "▲" : "▼"}</span>
                        </button>
                        {openCitations[idx] && (
                          <div className="citations-list">
                            {msg.citations.map((c, ci) => (
                              <div key={ci} className="citation-card">
                                <div className="citation-header">
                                  <span className="citation-source">[{c.index}] {c.source}</span>
                                  <div className="citation-meta">
                                    {c.page_number && c.page_number !== "?" && (
                                      <span className="citation-page">pg {Math.floor(Number(c.page_number))}</span>
                                    )}
                                    <span className="citation-score">{Number(c.score).toFixed(4)}</span>
                                  </div>
                                </div>
                                <div className="citation-text">{c.text}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="message">
              <div className="thinking">
                <div className="dots">
                  <div className="dot"/><div className="dot"/><div className="dot"/>
                </div>
                {selectedDoc ? `Searching ${selectedDoc}…` : "Searching documents…"}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="input-area">
          <div className="input-row">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={selectedDoc ? `Ask about ${selectedDoc}…` : "Ask anything about your documents…"}
              rows={1}
            />
            <button className="btn-send" onClick={handleQuery} disabled={!question.trim() || loading}>
              ↑
            </button>
          </div>
          <div className="input-hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </main>
    </div>
  );
}