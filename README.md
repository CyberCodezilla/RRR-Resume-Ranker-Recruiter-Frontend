# RRR — Resume Ranker Recruiter (Frontend)

> **Hack2Skill Hackathon** — Recruiter dashboard for the Intelligent Candidate Discovery Challenge.

Upload a job description and candidate pool, get an intelligently ranked shortlist with score breakdowns across 5 signals.

---

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Recharts (RadarChart for score breakdown)
- Connects to [RRR Backend](https://github.com/your-username/RRR-Resume-Ranker-Recruiter-Backend) on HuggingFace Spaces

---

## Getting Started

```bash
git clone https://github.com/your-username/RRR-Resume-Ranker-Recruiter-Frontend
cd RRR-Resume-Ranker-Recruiter-Frontend
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run locally:

```bash
npm run dev
```

During development all components work against mock data (`lib/mockData.ts`) — no backend required.

---

## How It Works

1. Paste a Job Description or upload a `.docx` file
2. Upload the candidates JSON file
3. Hit **Rank Candidates** → calls the backend `/rank` endpoint
4. Ranked shortlist renders with score bars, skill chips, and reasoning tags
5. Click any candidate → detail drawer opens with radar chart breakdown

---

## Views

| View | Route | Description |
|---|---|---|
| Upload / Configure | `/` | JD input + candidate file upload |
| Ranked Results | `/results` | Sortable table with scores and reasoning |
| Candidate Drawer | (overlay) | Full profile + radar chart on row click |

---

## Score Breakdown

Each candidate shows a **radar chart** with 5 axes:

- Skill Match (35%)
- Career Fit (25%)
- Signal Modifier (15%)
- Education (15%)
- Availability (10%)

---

## Project Structure

```
app/
├── page.tsx                   ← Upload + Configure view
├── results/
│   └── page.tsx               ← Ranked Results Table
├── components/
│   ├── CandidateTable.tsx     ← Sortable results table
│   ├── ScoreBar.tsx           ← Visual 0–1 score bar
│   ├── SkillChips.tsx         ← Top matching skills as chips
│   ├── CandidateDrawer.tsx    ← Right-side detail panel
│   ├── ScoreBreakdown.tsx     ← Recharts RadarChart
│   └── ReasoningTag.tsx       ← Parses reasoning into structured badges
└── lib/
    ├── mockData.ts            ← sample_submission.csv for dev
    └── api.ts                 ← Backend API calls
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (HuggingFace Spaces in production) |

---

## Deployment (Vercel)

1. Push repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_API_URL` → your HuggingFace Spaces backend URL
4. Deploy — copy the Vercel URL and paste it as `sandbox_link` in `submission_metadata.yaml`

---

## Related

- [RRR-Resume-Ranker-Recruiter-Backend](https://github.com/your-username/RRR-Resume-Ranker-Recruiter-Backend) — Python ranking engine on HuggingFace Spaces
