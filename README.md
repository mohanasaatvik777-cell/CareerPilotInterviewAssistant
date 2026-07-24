# CareerPilot AI — AI-Powered Interview Practice Platform

A full-stack Generative AI web application built with **React.js (Vite)**, **Node.js (Express)**, **Supabase (PostgreSQL + Auth + Realtime)**, and the **Google Gemini API** (`@google/generative-ai`) to help job candidates rehearse role-specific interview questions, receive real-time STAR-structured feedback, generate role-preparation flashcards, and track long-term interview performance.

> **Disclaimer Notice:** CareerPilot AI provides simulated mock interview scenarios, AI scoring metrics, and answer improvement recommendations for practice and preparation purposes only. The platform does **not** guarantee hiring outcomes, job offers, or employment placements.

---

## Key Features

- **Candidate Authentication & Access Control:** User registration, login, JWT token authentication, `bcryptjs` password encryption, protected routes, and profile management.
- **Supabase PostgreSQL Data Persistence:** Full integration with Supabase PostgreSQL tables (`users`, `interview_sessions`, `questions`, `answers`, `feedback`, `prep_cards`, `session_shares`, `practice_plans`) and Row Level Security (RLS) policies.
- **Interview Setup & Job Description Analyzer:** Choose target role, experience level (Entry, Mid, Senior, Lead/Executive), industry domain, and interview format (`Behavioural`, `Technical`, `Managerial`, `Case Study`, `HR`). Paste custom job descriptions to tailor interview questions.
- **Simulated One-Question-at-a-Time Room:** Interactive interview interface with live answer timer, verbal/written response input, simulated voice recording, and self-assessment confidence rating (1-5 stars).
- **Real-Time Gemini AI STAR Feedback:** Instant evaluation of candidate responses providing Relevance %, Clarity %, Evidence & Metrics %, STAR Structure %, and Confidence % along with exemplar improved STAR model answers (Situation, Task, Action, Result).
- **Adaptive Follow-Up Questions:** Generates deep-dive follow-up questions based on the candidate's previous response to test trade-offs and edge-case judgment.
- **Preparation Flashcards:** Automatically generates role prep cards for top achievements, project talking points, key strengths, and domain knowledge cheat-sheets.
- **Side-by-Side Performance Comparison:** Select any two practice sessions from history to compare relevance, clarity, evidence, and STAR scores side-by-side.
- **Invited Mentor Review Hub:** Candidates can generate private share links/codes (e.g. `SHARE-9X82A`) for invited mentors to review interview responses and AI feedback.
- **7-Day Personalized Improvement Plan:** Generates step-by-step 7-day action plans upon session completion to target identified weak areas.

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, Tailwind CSS, Lucide Icons, Axios.
- **Backend:** Node.js, Express.js, JWT, `bcryptjs`, Zod input validation, Centralized Error Handler.
- **Database & Auth:** Supabase (PostgreSQL + RLS + Realtime) & Backend Database Adapter.
- **Generative AI:** Google Gemini API (`@google/generative-ai`) via Node.js backend.

---

## Supabase Database Setup & Migration

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Run the contents of [`supabase/migrations/0001_init.sql`](file:///c:/Users/T.saatvik/Desktop/AI-Interview-Assistant/supabase/migrations/0001_init.sql).
4. Copy your credentials from **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
5. Paste these credentials into `backend/.env`.

---

## Google Gemini API Integration Overview

The Google Gemini API is called **exclusively from the Node.js backend** (`backend/src/services/geminiService.js`). 

- **Security Guarantee:** The `GEMINI_API_KEY` is stored in `backend/.env` and is **never** sent to or exposed in the React frontend or committed to source control.
- **Gemini Features Implemented:**
  1. `explainRoleAndFormat`: Generates role expectation breakdowns, key competencies, and format advice.
  2. `generateQuestions`: Generates 5 role-specific interview questions calibrated to the candidate's experience tier and job description.
  3. `evaluateAnswer`: Evaluates candidate answers, scores STAR organization, relevance, clarity, and evidence, and drafts exemplar improved STAR answers.
  4. `generateFollowUpQuestion`: Contextual follow-up prompt generation.
  5. `generatePrepCards`: Flashcard generation for project talking points and achievements.
  6. `generateSessionSummary`: Executive performance summary and 7-day action plan.

---

## Local Setup & Startup Instructions

### 1. Environment Setup

Copy `.env.example` to `.env` in both backend and frontend directories:

**Backend (`backend/.env`):**
```env
PORT=5000
JWT_SECRET=super_secret_jwt_key_interview_assistant_2026
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 2. Backend Startup

```bash
cd backend
npm install
npm run db:init
npm run dev
```

The backend server will start at **`http://localhost:5000`**. Health check: `http://localhost:5000/api/health`.

Default Demo User created during `db:init`:
- **Email:** `alex@example.com`
- **Password:** `Password123!`

---

### 3. Frontend Startup

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.
