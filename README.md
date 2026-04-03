# HireBlind - EU AI Act Compliant Resume Screening System

## 🎯 Project Overview

**HireBlind** is an enterprise-grade, AI-powered resume screening system built with **FastAPI** (Python) and **React** (Vite) that prioritizes compliance with the **EU AI Act**.

The system anonymizes candidate resumes, performs semantic skill matching, detects bias, and provides explainable rankings—all while keeping personally identifiable information (PII) protected throughout the screening process.

### Key Differentiator
Unlike traditional ATS systems, HireBlind ensures:
- ✅ **No PII persistence** — Candidate identities destroyed after anonymization
- ✅ **Explainability** — Every ranking decision is transparent
- ✅ **Human oversight** — Admin approval required for PII reveal
- ✅ **Audit trails** — Immutable logs for compliance verification

---

## 🚀 Features

### 1. **Demo Authentication (No Backend Auth Required)**
- Accept any email/password combination
- Select role: **Admin** or **Recruiter**
- Role determines feature access and PII visibility
- Pure frontend login with session storage

### 2. **Role-Based Access Control (RBAC)**

| Feature | Admin | Recruiter |
|---------|:-----:|:---------:|
| Upload Resumes | ✓ | ✓ |
| View Anonymized Ranking | ✓ | ✓ |
| **Reveal Candidate PII** | ✓ | ✗ |
| **Manual Override** | ✓ | ✗ |
| View Audit Logs | ✓ | ✓ |

### 3. **File Upload with Validation**
- **Supported formats**: PDF, DOCX, TXT
- **Max file size**: 5MB per file
- **Per-file progress tracking** with visual progress bars
- Real-time validation feedback
- Batch upload support

### 4. **Advanced Scoring Engine (3-Factor Weighting)**
```
Final Score = (Semantic × 50%) + (Keywords × 30%) + (Experience × 20%)
```

- **Semantic Similarity** (50%): Using sentence-transformers embeddings
- **Keyword Matching** (30%): JD-resume skill overlap
- **Experience Years** (20%): Extracted via regex patterns

### 5. **PII Anonymization**
- Removes names, emails, phone numbers, addresses before scoring
- Maintains anonymized candidate IDs: A, B, C, D, ...
- Strips university names, dates (proxies for age)
- Stores PII mappings separately for authorized reveal only

### 6. **Admin-Only PII Reveal**
- Confirmation modal with legal warnings
- Immutable audit logging when PII is revealed
- Tracks who revealed what and when
- EU AI Act Article 14 compliance logging

### 7. **Bias Detection & Monitoring**
- Analyzes result variance to flag potential discriminatory patterns
- System-wide bias risk assessment
- Input bias analysis (resume source bias)
- Alerts when bias risk exceeds thresholds

### 8. **Explainability Tags**
Every candidate ranking includes:
- Matched skills (transparent to user)
- Similarity score with reasoning
- Experience level assessment
- Bias risk indicators

---

## 🔐 EU AI Act Compliance

### Covered Articles
| Article | Requirement | Implementation |
|---------|-------------|-----------------|
| **Art. 5** | High-risk AI transparency | Login screen explains role access |
| **Art. 10** | Bias monitoring | Systemic variance detection active |
| **Art. 12** | Record-keeping | Activity audit trail maintained |
| **Art. 13** | Explainability | Score breakdown: semantic, keyword, experience |
| **Art. 14** | Human oversight | Admin approval for PII reveal + overrides |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite** (fast dev server, modern bundling)
- **Lucide React** icons (500+ crisp SVG icons)
- **Axios** for HTTP requests with progress tracking
- **CSS-in-JS** with CSS variables (dark/light theme ready)

### Backend
- **FastAPI** (Python, async/await)
- **Sentence-Transformers** (dense embeddings for semantic matching)
- **spaCy** NLP (entity extraction for anonymization)
- **scikit-learn** (TF-IDF fallback, cosine similarity)
- **PyPDF2 + python-docx** (file parsing)
- **SQLAlchemy** (ORM, optional Supabase integration)

### Database (Optional)
- **Supabase PostgreSQL** for audit log persistence
- Graceful fallback to in-memory storage if offline

---

## 📋 Demo Credentials

### Login
```
Email: any@email.com (or any valid email)
Password: anything
```

### Test Accounts
```
Role 1 (Limited Access):
  Email: recruiter@demo.com
  Password: recruiter123
  Role: Recruiter ← Cannot see PII

Role 2 (Full Access):
  Email: admin@demo.com
  Password: admin123
  Role: Admin ← Can reveal PII & override
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **npm** or **yarn** (package manager)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server (dev mode with auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs (Swagger UI)

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The UI will be available at: http://localhost:5173

### 3. Test the System

1. Open http://localhost:5173
2. Login with demo credentials (any email + password)
3. Select role (Admin for full features)
4. Upload 2-3 PDF/DOCX files
5. Paste a sample job description
6. Click "Upload & Process"
7. View results with scores and matched skills
8. (Admin only) Click "Reveal PII" to see candidate names

---

## 📁 Project Structure

```
hireblind/
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main application (RBAC, upload, results)
│   │   ├── login.jsx         # Demo auth screen
│   │   ├── ConfirmModal.jsx  # Confirmation dialog for admin actions
│   │   ├── ProgressBar.jsx   # Per-file upload progress indicator
│   │   ├── main.jsx          # React entry point
│   │   └── styles.css        # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── main.py               # FastAPI routes & orchestration
│   ├── scoring_engine.py     # 3-factor weighted scoring + explainability
│   ├── anonymizer.py         # PII redaction with NLP
│   ├── bias_detector.py      # Systemic bias analysis
│   ├── models.py             # Pydantic schemas
│   ├── requirements.txt       # Python dependencies
│   └── schema.sql            # Database schema (optional)
│
└── README.md                 # This file
```

---

## 📊 Scoring Algorithm Deep Dive

### 3-Factor Weighted Scoring

```python
Final Score = (Semantic × 50%) + (Keyword × 30%) + (Experience × 20%)

Where:
  Semantic = Cosine similarity between JD and resume embeddings
  Keyword = # Matched skills / total possible skills (capped at 30%)
  Experience = Years extracted from resume / 15 years (capped at 20%)
```

### Example Calculation

**Candidate A:**
- Semantic Score: 0.76 → 0.76 × 50% = 38%
- Keyword Matches: 5 skills matched → 5 × 6% = 30% (capped)
- Experience: 8 years → (8/15) × 20% = 10.7%
- **Final: 38% + 30% + 10.7% = 78.7% → Displayed as 78%**

---

## 🔄 API Endpoints

### Upload Resumes
```
POST /upload
Content-Type: multipart/form-data

Response:
{
  "session_id": "uuid-here",
  "files_processed": 3,
  "filenames": ["resume1.pdf", "resume2.docx", "resume3.txt"],
  "message": "Successfully uploaded 3 resumes"
}
```

### Process & Rank
```
POST /process
Content-Type: application/json

Request:
{
  "session_id": "uuid-here",
  "job_description": "Senior Python Engineer with 5+ years ML experience..."
}

Response:
{
  "candidates": [
    {
      "id": "A",
      "rank": 1,
      "score": 85,
      "matchedSkills": ["Python", "Machine Learning", "FastAPI"],
      "realName": "[REDACTED]",
      "experience": 8,
      "location": "[REDACTED]"
    }
  ],
  "bias_check": {
    "variance": 12.3,
    "bias_percentage": 15,
    "status": "LOW_RISK"
  },
  "audit_log": { ... }
}
```

### Override & Log
```
POST /override
Content-Type: application/json

Request:
{
  "candidate_id": "A",
  "old_rank": 1,
  "new_rank": 3,
  "reason": "Additional interview feedback indicates better culture fit"
}

Response:
{
  "message": "Override immutably logged for compliance",
  "audit_entry": { ... },
  "status": "success"
}
```

---

## 📸 Screenshots

### 1. Login Screen
![Login Screen](/docs/screenshots/login-screen.png)
- Clean, minimalist interface
- Role selector: Admin / Recruiter
- EU AI Act compliance badge

### 2. Upload & Job Description
![Upload Screen](/docs/screenshots/upload-screen.png)
- Drag-and-drop file upload zone
- Job description textarea
- File list with sizes
- Per-file upload progress bars

### 3. Ranked Candidates
![Results Screen](/docs/screenshots/results-screen.png)
- Candidate cards with scores
- Matched skills badges
- Score ring visualization
- Bias risk gauge

### 4. Admin PII Reveal
![Reveal Modal](/docs/screenshots/reveal-modal.png)
- Confirmation dialog
- EU AI Act Article 14 notice
- Immutable audit logging

### 5. Audit Log
![Audit Log](/docs/screenshots/audit-log.png)
- Action timestamps
- User & role information
- Compliance trail
- Searchable entries

---

## 🔒 Security & Compliance Measures

1. **PII Protection**
   - Resume text anonymized before scoring
   - Names, emails, addresses stripped
   - Dates removed (no age discrimination)
   - Completely destroyed after anonymization

2. **Access Control**
   - Frontend role-based UI hiding
   - Backend role validation (can add)
   - Audit logs track who accessed what

3. **Audit Logging**
   - Every PII reveal logged immutably
   - Manual overrides documented
   - Timestamps, users, reasons captured
   - EU AI Act Article 14 compliant

4. **Explainability**
   - Scoring breakdown: semantic, keyword, experience
   - Tech skills list shown to justify matches
   - Bias risk indicators
   - Model used in processing logged

---

## ⚙️ Configuration

### Environment Variables

**.env (Backend)**
```bash
VITE_API_URL=http://localhost:8000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
LOG_LEVEL=INFO
```

**.env (Frontend)**
```bash
VITE_API_URL=http://localhost:8000
```

---

## 🧪 Testing

### Manual Testing Workflow

1. **Upload Test**
   - Upload 3 sample resumes
   - Verify progress bars show 0-100%
   - Check file size validation (>5MB rejected)
   - Verify file type validation (non-PDF rejected)

2. **Scoring Test**
   - Submit with a clear job description
   - Verify top candidate is most relevant
   - Check scores are between 0-99%
   - Verify matched skills are relevant

3. **RBAC Test**
   - Login as Recruiter → No "Reveal PII" button
   - Login as Admin → "Reveal PII" button visible
   - Click "Reveal PII" as Admin → Confirmation modal
   - Confirm → PII revealed with timestamp

4. **Audit Log Test**
   - Perform PII reveal
   - Check audit log entry appears
   - Verify timestamp, user email, action type

---

## 📚 Resources

### EU AI Act References
- [EU AI Act Full Text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)
- [Article 13 (Transparency)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689#d1e2435)
- [Article 14 (Human Oversight)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689#d1e2472)

### Technical Documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Sentence-Transformers](https://www.sbert.net/)
- [spaCy NLP](https://spacy.io/)

---

## 🤝 Contributing

This is a hackathon project. For contributions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is available for educational and hackathon purposes.

---

## 🎓 Hackathon Notes

- **Built in**: 24 Hours
- **Focus**: EU AI Act compliance + Clean UX
- **Status**: Production-ready core, extensible architecture
- **Future Work**: Database persistence, advanced bias detection, multi-language support

---

## 📞 Support

For questions or issues:
1. Check the [FAQ section](#faq)
2. Review [API documentation](http://localhost:8000/docs)
3. Check browser console for frontend errors
4. Check terminal for backend logs

---

## FAQ

### Q: Why accept any email/password in demo mode?
A: This is a hackathon project demonstrating the core AI/compliance features. In production, integrate with your auth system (OAuth, JWT, etc.).

### Q: Can I use this in production?
A: The core architecture is production-ready (async, error handling, logging). Add proper authentication, database, and monitoring before production deployment.

### Q: How does bias detection work?
A: Analyzes variance in scores across candidates and flags systemic patterns that might indicate demographic bias.

### Q: Can I customize the scoring weights?
A: Yes! Edit `scoring_engine.py` line ~120 to adjust the 50/30/20 formula to your needs.

### Q: Does it support multiple languages?
A: Currently English only. Could be extended using multilingual SBERT models.

### Q: What happens if the model fails to load?
A: Graceful fallback to TF-IDF scoring. Check logs for details.

---

**Built with ❤️ for EU AI Act Compliance · Happy screening! 🚀**
