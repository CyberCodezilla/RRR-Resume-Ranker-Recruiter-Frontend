# RRR — Resume Ranker Recruiter (Workspace)

This workspace contains two main projects and documentation:

- `RRR-Resume-Ranker-Recruiter-Frontend/` — Vite + React frontend (implemented)
- `RRR-Resume-Ranker-Recruiter-Backend/` — Backend spec and lightweight stub (FastAPI)
- `docs/` — PRDs and documentation (backend & frontend PRDs)

Quick commands

Frontend (development):

```powershell
cd RRR-Resume-Ranker-Recruiter-Frontend
npm install
npm run dev
# open http://localhost:5173/
```

Frontend (production build):

```powershell
cd RRR-Resume-Ranker-Recruiter-Frontend
npm run build
```

Backend (local stub using virtualenv):

```powershell
cd RRR-Resume-Ranker-Recruiter-Backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
# health: http://localhost:8000/health
# rank: POST http://localhost:8000/rank
```

Notes

- The frontend is fully implemented and builds successfully.
- The backend now includes a minimal FastAPI stub at `RRR-Resume-Ranker-Recruiter-Backend/app/main.py`. Replace the stub with the full ranking pipeline when ready.
- See `docs/` for PRDs and the intended API contract.
