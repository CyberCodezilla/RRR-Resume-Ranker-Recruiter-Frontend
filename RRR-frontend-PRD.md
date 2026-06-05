# PRD — RRR Frontend (Recruiter Dashboard)

**Repo:** `RRR-Resume-Ranker-Recruiter-Frontend`  
**Hackathon:** Hack2Skill — Intelligent Candidate Discovery & Ranking Challenge  
**Stack:** Next.js 14 (App Router), Tailwind CSS, Recharts  
**Deployment:** Vercel  
**Version:** 1.0

---

## 1. Overview

A recruiter-facing dashboard that accepts a job description and candidate pool, calls the backend ranking API, and displays an intelligently ranked shortlist with score breakdowns. Used as the live sandbox demo link in `submission_metadata.yaml`.

---

## 2. Goals

- Clean demo UI that judges can use live during evaluation
- Show all 5 scoring components visually — not just a final number
- Parse and display `reasoning` field as structured tags
- Responsive — works on both desktop and tablet (judges will test on various devices)
- Fully functional against mock data during development, real backend in production

---

## 3. Out of Scope

- Authentication / login
- Saving past rankings or history
- Editing candidate profiles
- Custom weight adjustment UI (hardcoded weights from PRD)

---

## 4. Pages & Views

### 4.1 Upload / Configure — `/`

- Textarea: "Paste Job Description"
- File upload: "Upload Candidates JSON" (accepts `.json`)
- Button: "Rank Candidates" → calls `/api/rank`
- Loading state with progress indicator (encoding 5000 candidates takes a moment)

### 4.2 Ranked Results Table — `/results`

Sortable table with columns:

| Column | Description |
|---|---|
| Rank | Badge (#1, #2, #3…) |
| Candidate | Name + current title |
| Score | `ScoreBar` component (0–1 as visual bar) |
| Experience | Years of experience |
| Top Skills | `SkillChips` — top 3 matching skills |
| Reasoning | `ReasoningTag` — parsed into structured inline badges |

Click any row → opens `CandidateDrawer` on the right.

### 4.3 Candidate Detail Drawer

Right-side slide-in panel showing:
- Full profile (headline, summary, location)
- Career timeline (all roles, most recent first)
- Skill list with proficiency levels
- `ScoreBreakdown` radar chart — all 5 scoring components
- Redrob signals (open to work, last active, GitHub score)

### 4.4 Score Breakdown Panel

Radar chart using `Recharts RadarChart` with 5 axes:
- Skill Match
- Career Fit
- Signal Modifier
- Education
- Availability

---

## 5. Component Architecture

```
app/
├── page.tsx                   ← Upload + Configure view
├── results/
│   └── page.tsx               ← Ranked Results Table
├── components/
│   ├── CandidateTable.tsx     ← Sortable results table
│   ├── ScoreBar.tsx           ← 0–1 score as progress bar
│   ├── SkillChips.tsx         ← Top matching skills as color chips
│   ├── CandidateDrawer.tsx    ← Right-side detail panel
│   ├── ScoreBreakdown.tsx     ← Recharts RadarChart
│   └── ReasoningTag.tsx       ← Parses reasoning string into badges
└── lib/
    ├── mockData.ts            ← Loads sample_submission.csv for dev
    └── api.ts                 ← Calls backend /rank endpoint
```

---

## 6. Reasoning Tag Parsing

The `reasoning` field from `submission.csv` is a semicolon-separated string:

```
"HR Manager with 6.1 yrs; 9 AI core skills; response rate 0.76."
```

Parse into structured badges — do not render as raw text:

```tsx
const parts = reasoning.split(";").map(s => s.trim());
// Renders: [HR Manager] [6.1 yrs exp] [9 AI skills] [76% response rate]
```

---

## 7. API Integration

**Production:** Calls FastAPI backend on HuggingFace Spaces  
**Development:** Uses `mockData.ts` with `sample_submission.csv`

Next.js API route `/api/rank` proxies the request to the Python backend:

```
NEXT_PUBLIC_API_URL=https://huggingface.co/spaces/YOUR_USERNAME/redrob-ranker
```

| Action | Method | Endpoint |
|---|---|---|
| Rank candidates | POST | `/rank` |
| Health check | GET | `/health` |

---

## 8. Development Workflow

1. Build all components against `mockData.ts` (sample_submission.csv + sample_candidates.json)
2. Test all views with mock data before touching the backend
3. Wire up `/api/rank` Next.js route to real backend last
4. Deploy to Vercel — set `NEXT_PUBLIC_API_URL` in environment variables

---

## 9. Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | HuggingFace Spaces backend URL |

---

## 10. Deployment (Vercel)

1. Push repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_API_URL` in Project → Settings → Environment Variables
4. Every push to `main` auto-deploys
5. Copy the Vercel URL → paste as `sandbox_link` in `submission_metadata.yaml`

---

## 11. Acceptance Criteria

- [ ] Upload JD + candidates JSON → triggers ranking → results render
- [ ] Ranked table shows score bar, skill chips, reasoning tags per candidate
- [ ] Clicking a candidate opens detail drawer with radar chart
- [ ] All 5 score components visible in breakdown
- [ ] Responsive at 768px+ (tablet)
- [ ] Works against mock data in dev and real backend in production
- [ ] Deployed live on Vercel with working sandbox URL
