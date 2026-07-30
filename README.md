# 🚀 DocuMind AI - Enterprise Full-Stack RAG Assistant

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-D33833?style=for-the-badge&logo=qdrant&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

DocuMind AI is a production-ready, full-stack Retrieval-Augmented Generation (RAG) system designed for enterprise document intelligence. It allows users to upload PDFs, process them using advanced vector embeddings, and interact with the data through a highly accurate, context-aware AI chat interface.

---

## ✨ Key Features

### 🧠 Advanced RAG Pipeline
*   **Context Expansion:** Automatically fetches "Neighbor Chunks" (previous and next paragraphs) to prevent context cut-offs.
*   **Smart LLM Retry Logic:** If the LLM detects insufficient context, the system automatically doubles the retrieval scope and re-prompts the AI behind the scenes.
*   **Hybrid Search Engine:** Combines dense vector search (Qdrant) with keyword regex search (MongoDB) for pin-point accuracy.
*   **Strict JSON Formatting:** Enforces Pydantic schemas on the Gemini LLM to guarantee structured responses and suggested follow-up questions.

### 💻 Frontend Excellence
*   **Interactive PDF Citations:** AI chat responses include source citations. Clicking a citation opens a modal that auto-scrolls exactly to the referenced page in the original PDF.
*   **Global Quick Search:** Debounced, instantly filtering search bar in the navigation for both documents and chat histories.
*   **User-Scoped Notifications:** Real-time event notifications stored locally, unique to individual logged-in users, with 2-second auto-deduplication and 48-hour expiration.
*   **Dark/Light Mode:** Full system-aware theming using Tailwind CSS.

### ⚙️ Bulletproof Backend
*   **OCR Fallback:** Uses PyMuPDF for text extraction, automatically falling back to Tesseract OCR for scanned documents.
*   **Seamless File Handling:** Bypasses standard CORS limits using native Fetch API for secure, boundary-perfect `multipart/form-data` PDF uploads.
*   **Automated Keep-Alive:** Includes a GitHub Actions CRON workflow to prevent the free-tier backend from sleeping.

---

## 🏗️ System Architecture & Pipeline

```mermaid
flowchart TD
    A[👤 User Question] --> B[🔢 Generate Query Embedding\n<small>gemini-embedding-001</small>]
    B --> C[🔍 Hybrid Search\n<small>Qdrant Vector DB + MongoDB Keyword</small>]
    C --> D[📑 Fetch Top 10 Best Chunks]
    D --> E[🔗 Fetch Neighbor Chunks\n<small>Prev + Next from MongoDB</small>]
    E --> F[⚡ Merge Contiguous Context & Enforce Token Budget]
    F --> G[🧠 LLM Evaluation\n<small>gemini-1.5-flash</small>]
    
    G -->|Context Insufficient| H[🔄 Retrieve Top 20 & Retry]
    H --> G
    
    G -->|Sufficient Context| I[🎯 Final Answer + Citations + Follow-Ups]

    classDef primary fill:#2563eb,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef step fill:#1e293b,stroke:#475569,color:#f8fafc;
    classDef decision fill:#7c3aed,stroke:#6d28d9,color:#fff;
    classDef endNode fill:#16a34a,stroke:#15803d,color:#fff;

    class A primary;
    class B,C,D,E,F step;
    class G,H decision;
    class I endNode;
```

---

# 🛠️ Tech Stack

## 🎨 Frontend
- ⚛️ React (Vite)
- 🎨 Tailwind CSS & Framer Motion
- 📄 React-PDF-Viewer & PDF.js
- 🎯 Lucide React (Icons)
- 🛣️ React Router DOM

## ⚙️ Backend
- 🚀 FastAPI (Python)
- 🤖 Google GenAI SDK
  - `gemini-3.6-flash`
  - `gemini-embedding-001`
- 📑 PyMuPDF & Tesseract (OCR)
- ✅ Pydantic (Data Validation)

## 🗄️ Databases & Storage
- **Qdrant** – Vector Database (768-dimensional embeddings)
- **MongoDB** – Document metadata, chat sessions, raw text chunks
- **Cloudinary** – Secure cloud PDF storage

---

# 🚀 Local Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/swaroop07p/RAG-Assistant.git
cd RAG-Assistant
```

---

## 2️⃣ Backend Setup

```bash
cd rag-backend

python -m venv venv

# Activate the virtual environment

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### Create a `.env` file inside the `backend` directory

```env
# =========================
# Application Settings
# =========================
PROJECT_NAME=RAG Assistant
ENVIRONMENT=development
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080 # 7 Days (7 * 24 * 60)

# =========================
# Database
# =========================
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/...
DATABASE_NAME=rag_enterprise_db

# =========================
# Vector Database
# =========================
QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION_NAME=document_chunks

# =========================
# AI / LLM
# =========================
GEMINI_API_KEY=your_google_gemini_api_key

# =========================
# Cloud Storage
# =========================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# =========================
# Security
# =========================
SECRET_KEY=your_jwt_secret_key
```

### Run the Backend Server

```bash
uvicorn app.main:app --reload
```

---

## 3️⃣ Frontend Setup

```bash
cd ../rag-frontend

npm install
```

### Create a `.env` file inside the `frontend` directory

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Run the Frontend Development Server

```bash
npm run dev
```

---

# 📂 Project Structure

```text
RAG-Assistant/
│
├── .github/
│   └── workflows/
│       └── keep_alive.yml          # GitHub Action to keep Render backend alive
│
├── rag-backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── chat.py
│   │   │       ├── documents.py
│   │   │       ├── search.py
│   │   │       └── summary.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── exceptions.py
│   │   │   ├── logging.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   ├── mongodb.py
│   │   │   └── qdrant.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── chat.py
│   │   │   ├── document.py
│   │   │   ├── search.py
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── pdf_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── storage_service.py
│   │   │   ├── summary_service.py
│   │   │   └── vector_service.py
│   │   │
│   │   ├── main.py
│   │   └── __init__.py
│   │
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
│
├── rag-frontend/
│   ├── public/
│   │   └── Blue_Bot.svg
│   │   
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   ├── document/
│   │   │   └── layout/
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── utils/
│   │   │   └── notifications.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── README.md
```

---

# 🌐 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/login` | User Login |
| POST | `/api/v1/auth/register` | User Registration |
| POST | `/api/v1/documents/upload` | Upload PDF |
| GET | `/api/v1/documents` | Fetch Documents |
| POST | `/api/v1/chat` | Ask Questions |
| POST | `/api/v1/search` | Search Documents |
| POST | `/api/v1/summary` | Generate Document Summary |

---

# 🔒 Authentication

The backend uses **JWT (JSON Web Tokens)** for authentication.

Protected API endpoints require:

Authorization: Bearer <JWT_TOKEN>

Users must authenticate before accessing chat history, document uploads, or AI-powered features.

---

# ☁️ Deployment

### Frontend
- Deployed on **Vercel**
- Native **GitHub CI/CD** integration for automatic deployments

### Backend
- Dockerized application
- Deployed as a **Render Web Service**

### Always-On Backend
A GitHub Actions workflow (`keep_alive.yml`) runs every **10 minutes** to ping the Render `/health` endpoint, ensuring the backend remains active and does not spin down due to inactivity.
