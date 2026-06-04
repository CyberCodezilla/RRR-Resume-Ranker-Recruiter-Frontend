# Resume Ranker — Frontend PRD

**Repo:** `resume-ranker-frontend`  
**Stack:** React + Vite, Tailwind CSS  
**Deployment:** Vercel  
**Version:** 1.0 (Hackathon)

---

## 1. Overview

A single-page web app that lets a recruiter paste a Job Description and upload candidate JSON data, then displays an intelligently ranked shortlist with score breakdowns — powered by the backend ranking API.

---

## 2. Goals

- Simple, fast UI that works end-to-end in a hackathon demo
- Show ranked candidates with explainable scores (not just a number)
- No login, no database — stateless, demo-ready

---

## 3. Out of Scope

- Authentication
- Saving/history of past rankings
- Editing candidate profiles
- Mobile optimization (desktop demo is fine)

---

## 4. Pages & Components

### 4.1 Home Page `/`

Single page layout with two panels:

**Left Panel — Input**
- Textarea: "Paste Job Description"
- File upload OR paste area: "Upload Candidates JSON"
- Button: "Rank Candidates"
- Loading spinner while API call is in progress

**Right Panel — Results**
- Ranked list of candidates (Card per candidate)
- Each card shows:
  - Rank badge (#1, #2, #3…)
  - Name + Headline
  - Overall Score (0–100)
  - Score breakdown bar: Skill Match, Experience, Activity Signal
  - Tags for top matching skills
- Empty state: "Paste a JD and upload candidates to get started"

### 4.2 Candidate Detail (Modal / Expandable)

On clicking a candidate card:
- Full skill list with proficiency
- Career history summary
- Behavioral signals (open to work, last active, github score)
- Why ranked here (short text from API)

---

## 5. API Integration

**Base URL:** `VITE_API_URL` environment variable (points to backend on Render)

| Action | Method | Endpoint | Payload |
|--------|--------|----------|---------|
| Rank candidates | POST | `/rank` | `{ job_description: string, candidates: [...] }` |
| Health check | GET | `/health` | — |

**Error handling:**
- Show toast on API failure
- Validate that JSON is valid before sending

---

## 6. State Management

Plain `useState` / `useContext` — no Redux needed for hackathon scope.

```
appState {
  jobDescription: string
  candidates: Candidate[]
  rankedResults: RankedCandidate[]
  isLoading: boolean
  error: string | null
}
```

---

## 7. Environment Variables

```
VITE_API_URL=https://your-backend.onrender.com
```

Set in Vercel dashboard under Project → Settings → Environment Variables.

---

## 8. Folder Structure

```
resume-ranker-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── InputPanel.jsx
│   │   ├── ResultsPanel.jsx
│   │   ├── CandidateCard.jsx
│   │   ├── CandidateModal.jsx
│   │   └── ScoreBar.jsx
│   ├── api/
│   │   └── rankApi.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 9. Deployment (Vercel)

1. Push repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` in environment variables
4. Vercel auto-detects Vite — deploy with default settings
5. Every push to `main` triggers auto-deploy

---

## 10. Acceptance Criteria

- [ ] User can paste a JD and upload a JSON file
- [ ] Ranked list renders with scores and skill tags
- [ ] Score breakdown visible per candidate
- [ ] API errors shown gracefully
- [ ] Deployed live on Vercel with working backend URL
