
## PDF Q&A App (Internship Assignment)

### Task Requirements (Original)

**Objective:** Build a mini application in Next.js where a user can upload a PDF file and then ask questions based on its content using the OpenAI API.

#### Backend
- Create protected API routes in Next.js
- **Route 1:**
    - Accept a PDF file upload
    - Process and store the PDF's content (text extraction)
    - Generate vector embeddings using OpenAI API
    - Store these embeddings using any vector database
- **Route 2:**
    - Handle question input and return answers based on the PDF content using OpenAI’s retrieval-based approach (RAG)

#### Frontend
- Simple UI to:
    - Upload a PDF
    - Enter questions
    - Display answers from the backend
- The frontend should call the protected backend route securely

---

## What Was Implemented

Due to GPT token limits, I was unable to use the OpenAI API for embeddings and answering questions. Instead, I implemented the backend using the Cohere API for the question-answering functionality.

### Backend Explanation

- **Protected API Route (`/api/chat/route.ts`):**
    - Checks for a secret key in the request header for authentication.
    - Receives a question from the frontend.
    - Retrieves context from the uploaded PDF (via a retriever from `/api/upload/route.ts`).
    - Uses a prompt template to instruct the LLM to answer concisely based on the retrieved context.
    - Uses Cohere's Command model (via `@langchain/cohere`) to generate the answer.
    - Returns the answer as JSON.

- **Note:** The code is structured to allow switching between Cohere and OpenAI (commented out), but Cohere is used due to token limitations.

### What Was Not Implemented

- OpenAI API for embeddings and answering (due to token limits)
- Vector database storage for embeddings

### How to Run

1. Install dependencies:
     ```bash
     npm install
     ```
2. Set environment variables in a `.env` file:
     - `API_SECRET_KEY` (for route protection)
     - `COHERE_API_KEY` (for Cohere model)
3. Start the development server:
     ```bash
     npm run dev
     ```
4. Use the frontend to upload a PDF and ask questions.

---

## Approach

- Used Next.js API routes for backend logic and protection.
- Used LangChain for prompt templating and chaining.
- Used Cohere's Command model for answering questions based on PDF content.
- Designed code to be easily switchable to OpenAI if tokens are available.

---

**If you have any questions or need further clarification, feel free to reach out!**