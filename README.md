# HireBlind - EU AI Act Compliant Resume Screening

## Demo Credentials
- **Email**: any@email.com
- **Password**: anything
- **Admin**: Select "Admin" role for PII access
- **Recruiter**: Select "Recruiter" role (limited access)

## Tech Stack
- Frontend: React + Vite
- Backend: FastAPI (Python)
- NLP: spaCy + sentence-transformers
- Scoring: Semantic + Keyword + Experience (50/30/20)

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- Anonymous resume screening (PII redacted)
- Role-based access control (Admin/Recruiter)
- 3-factor weighted scoring
- Bias detection
- Explainable AI results
- Audit logging for compliance

## EU AI Act Compliance
- Article 5: Human agency and oversight
- Article 10: Bias monitoring
- Article 12: Record-keeping
- Article 13: Transparency and explainability
- Article 14: Human oversight of decisions

## Scoring Formula
```
Final Score = (50% Semantic Similarity) + (30% Keyword Match) + (20% Experience)
```

### Score Breakdown
- **Semantic**: Dense embeddings (sentence-transformers) matching resume to job description
- **Keywords**: Overlapping technical skills between JD and resume
- **Experience**: Years of experience extracted from resume text

## Admin Features
- Reveal candidate PII with audit logging
- Manual ranking overrides
- View complete audit trail

## Recruiter Features
- View anonymized candidate rankings
- See matched skills and scores
- Cannot access candidate PII

## File Upload
- Supported formats: PDF, DOCX, TXT
- Max file size: 5MB per file
- Batch upload support

## API Endpoints

### POST /upload
Upload resume files
- Files: multipart/form-data

### POST /process
Process resumes and return rankings
```json
{
  "session_id": "string",
  "job_description": "string"
}
```

### POST /override
Log manual ranking override
```json
{
  "candidate_id": "string",
  "old_rank": "int",
  "new_rank": "int",
  "reason": "string"
}
```

## Project Structure
```
hireblind/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── login.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── main.py
│   ├── scoring_engine.py
│   ├── anonymizer.py
│   ├── bias_detector.py
│   ├── models.py
│   ├── requirements.txt
│   ├── schema.sql
│   └── __init__.py
└── README.md
```

## Dependencies

### Backend (Python 3.10+)
- FastAPI
- spaCy
- sentence-transformers
- scikit-learn
- PyPDF2
- python-docx
- pydantic

### Frontend (Node.js 18+)
- React 18
- Vite
- lucide-react

## Database
Optional Supabase PostgreSQL integration for audit log persistence.
Falls back to in-memory storage if database is unavailable.

## License
Educational/Hackathon Project

## Support
For issues or questions, check:
1. Backend logs at `http://localhost:8000/docs` (Swagger UI)
2. Frontend console for errors
3. README.md documentation
