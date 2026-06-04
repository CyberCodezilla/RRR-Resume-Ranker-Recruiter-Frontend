# Resume Ranker — Frontend

> AI-powered recruiter UI — paste a Job Description, upload candidates, get an intelligently ranked shortlist.

Built for a hackathon. Deployed on Vercel.

---

## Tech Stack

- React + Vite
- Tailwind CSS
- Connects to [resume-ranker-backend](https://github.com/your-username/resume-ranker-backend)

---

## Getting Started

```bash
git clone https://github.com/your-username/resume-ranker-frontend
cd resume-ranker-frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
```

Run locally:

```bash
npm run dev
```

---

## How It Works

1. Paste a Job Description into the left panel
2. Upload a candidates JSON file (or paste JSON directly)
3. Hit **Rank Candidates**
4. View the ranked shortlist with score breakdowns on the right

Each candidate card shows:
- Overall score (0–100)
- Breakdown: Skill Match / Semantic Fit / Experience / Activity
- Top matching skills

---

## Project Structure

```
src/
├── components/
│   ├── InputPanel.jsx       # JD + file upload
│   ├── ResultsPanel.jsx     # Ranked list
│   ├── CandidateCard.jsx    # Individual candidate card
│   ├── CandidateModal.jsx   # Expanded detail view
│   └── ScoreBar.jsx         # Visual score breakdown
├── api/
│   └── rankApi.js           # API call to backend
├── App.jsx
└── main.jsx
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Deploy — every push to `main` auto-deploys

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Related

- [resume-ranker-backend](https://github.com/your-username/resume-ranker-backend) — FastAPI ranking engine
- 
