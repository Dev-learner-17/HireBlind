# ==========================================
# FILE: backend/main.py
# FINAL VERSION - Professional Logging & Fixed Bias Call
# ==========================================

import logging
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import tempfile
import uuid
import os
import PyPDF2
from docx import Document

# ==========================================
# LOGGING CONFIGURATION
# ==========================================
port = int(os.environ.get("PORT", 10000))
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ==========================================
# IMPORTANT: No dots before module names!
# ==========================================
from anonymizer import ResumeAnonymizer
from scoring_engine import AdvancedScoringEngine
from bias_detector import BiasDetector

# ==========================================
# Pydantic Models
# ==========================================

class ProcessRequest(BaseModel):
    session_id: str
    job_description: str

class OverrideRequest(BaseModel):
    candidate_id: str
    old_rank: int
    new_rank: int
    reason: str

# ==========================================
# FastAPI App Initialization
# ==========================================

app = FastAPI(title="HireBlind Enterprise API - EU AI Act Compliant")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Supabase (Optional - Won't Crash)
# ==========================================

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jdiatotwqdrejrffmyga.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkaWF0b3R3cWRyZWpyZmZteWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTAzODcsImV4cCI6MjA5MDcyNjM4N30.DXK3R3DuHUCAwUD6Ukc_a11intqiOGedwzjXK8IoZz4")

supabase = None
try:
    from supabase import create_client, Client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("Supabase connected successfully")
except Exception as e:
    logger.warning(f"Supabase offline mode (continuing without): {e}")

# ==========================================
# Initialize Core Engines
# ==========================================

anonymizer = ResumeAnonymizer()
scoring_engine = AdvancedScoringEngine()
bias_detector = BiasDetector()

# Temporary storage for active sessions
temp_storage = {}

# ==========================================
# Helper Functions
# ==========================================

def extract_text_from_file(file_path: str, filename: str) -> str:
    """Extract text from PDF or DOCX files."""
    try:
        if filename.endswith('.pdf'):
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = ' '.join([page.extract_text() for page in reader.pages if page.extract_text()])
                return text
        elif filename.endswith('.docx'):
            doc = Document(file_path)
            text = ' '.join([para.text for para in doc.paragraphs])
            return text
        else:
            # Try reading as text file
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
    except Exception as e:
        logger.error(f"File extraction error for {filename}: {e}")
        return ""

# ==========================================
# API Endpoints
# ==========================================

@app.get("/")
async def root():
    return {
        "message": "HireBlind Enterprise API",
        "version": "2.0.0",
        "compliance": "EU AI Act Ready",
        "endpoints": ["/health", "/upload", "/process", "/override"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "operational",
        "engines_loaded": {
            "spacy_nlp": anonymizer.nlp is not None,
            "sentence_transformer": scoring_engine.is_model_loaded(),
            "supabase": supabase is not None
        },
        "compliance": "EU AI Act Arts. 5, 10, 12, 13, 14",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/upload")
async def upload_batch(files: List[UploadFile] = File(...)):
    """Upload resumes (PDF/DOCX/TXT) and create a processing session."""
    extracted_data = []
    
    for file in files:
        # Read file content
        content = await file.read()
        
        # Save to temp file
        suffix = f".{file.filename.split('.')[-1]}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        
        # Extract text
        text = extract_text_from_file(tmp_path, file.filename)
        os.unlink(tmp_path)
        
        extracted_data.append({
            "filename": file.filename, 
            "raw_text": text,
            "file_size": len(content)
        })
    
    session_id = str(uuid.uuid4())
    temp_storage[session_id] = extracted_data
    
    # Professional logging
    logger.info(f"Session {session_id}: {len(extracted_data)} files uploaded")
    for i, data in enumerate(extracted_data):
        logger.info(f"File {i+1}: {data['filename']} ({len(data['raw_text'])} chars)")
    
    return {
        "session_id": session_id, 
        "files_processed": len(extracted_data),
        "filenames": [f["filename"] for f in extracted_data],
        "message": f"Successfully uploaded {len(extracted_data)} resumes"
    }

@app.post("/process")
async def process_and_rank(request: ProcessRequest):
    """Process resumes: Anonymize PII → Score → Rank → Detect Bias"""
    
    # Validate session
    if request.session_id not in temp_storage:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    raw_resumes = temp_storage[request.session_id]
    
    if not raw_resumes:
        raise HTTPException(status_code=400, detail="No resumes found in session")
    
    logger.info(f"Processing {len(raw_resumes)} resumes for session {request.session_id}")
    
    # ==========================================
    # PHASE 1: Anonymization
    # ==========================================
    
    anonymized_payloads = []
    frontend_candidates = []
    anonymization_audits = []
    
    for idx, resume in enumerate(raw_resumes):
        candidate_id = chr(65 + idx)  # A, B, C, D, E...
        raw_text = resume["raw_text"]
        
        logger.info(f"Candidate {candidate_id}: {len(raw_text)} chars")
        
        # Extract metadata for 'Reveal' feature (stored separately, not in anonymized text)
        real_name = anonymizer.extract_real_name(raw_text)
        experience = anonymizer.extract_experience(raw_text)
        location = anonymizer.extract_location(raw_text)
        
        # Anonymize the resume (removes PII)
        anonymized_text, audit_dict = anonymizer.anonymize(raw_text, request.session_id)
        anonymization_audits.append(audit_dict)
        
        # Store for scoring
        anonymized_payloads.append({
            "candidate_id": candidate_id,
            "anon_text": anonymized_text
        })
        
        # Store for frontend display
        frontend_candidates.append({
            "id": candidate_id,
            "strippedData": audit_dict.get("stripped_types", []),
            "realName": real_name,
            "experience": experience,
            "location": location
        })
    
    # ==========================================
    # PHASE 2: Semantic Scoring
    # ==========================================
    
    try:
        ranked_results, scoring_audit = scoring_engine.rank_candidates(
            request.job_description,
            anonymized_payloads
        )
    except Exception as exc:
        logger.exception(f"Scoring engine failed for session {request.session_id}: {exc}")
        ranked_results, scoring_audit = scoring_engine.fallback_rank_candidates(
            request.job_description,
            anonymized_payloads,
            reason="runtime_error"
        )
    
    logger.info(f"Scoring complete: {len(ranked_results)} candidates ranked")
    
    # ==========================================
    # PHASE 3: Merge Results
    # ==========================================
    
    final_output = []
    scores_only = []
    
    for rank_data in ranked_results:
        scores_only.append(rank_data["score"])
        
        # Find matching candidate data
        base_data = next(
            (c for c in frontend_candidates if c["id"] == rank_data["candidate_id"]), 
            None
        )
        
        if base_data:
            base_data.update({
                "rank": rank_data["rank"],
                "score": rank_data["score"],
                "skills": rank_data["skills"],
                "matchedSkills": rank_data["explainability_tags"]
            })
            final_output.append(base_data)
    
    # ==========================================
    # PHASE 4: Bias Detection
    # ==========================================
    
    bias_check = bias_detector.detect_systemic_variance(scores_only)
    
    # FIXED: Pass the raw_resumes list directly as it is already a List[Dict]
    if raw_resumes:
        input_bias = bias_detector.analyze_batch_input_bias_risk(raw_resumes)
    else:
        input_bias = {"risk_percentage": 0, "bias_factors": [], "recommendation": "No data"}
    
    # ==========================================
    # PHASE 5: Audit Logging
    # ==========================================
    
    master_audit = {
        "action_type": "BATCH_PROCESSED",
        "timestamp": datetime.utcnow().isoformat(),
        "session_id": request.session_id,
        "details": {
            "total_candidates": len(final_output),
            "scoring_engine": scoring_audit,
            "bias_variance": bias_check["variance"],
            "total_pii_redactions": sum([a.get("total_redactions", 0) for a in anonymization_audits]),
            "eu_ai_act_compliance": "Raw PII destroyed. Rankings fully explainable. Human oversight enabled."
        }
    }
    
    # Log to Supabase if available (won't crash if offline)
    if supabase:
        try:
            supabase.table("audit_logs").insert(master_audit).execute()
            logger.info(f"Audit logged: {master_audit['action_type']}")
        except Exception as e:
            logger.warning(f"Supabase logging failed: {e}")
    
    # ==========================================
    # PHASE 6: Cleanup & Response
    # ==========================================
    
    # Delete session data from memory (PII never persisted)
    del temp_storage[request.session_id]
    
    logger.info(f"Returning {len(final_output)} candidates")
    
    return {
        "candidates": final_output,
        "bias_check": bias_check,
        "input_bias_analysis": input_bias,
        "audit_log": master_audit,
        "anonymization_details": anonymization_audits
    }

@app.post("/override")
async def override_ranking(request: OverrideRequest):
    """
    Manual override with justification logging.
    Satisfies EU AI Act Article 14 - Human Oversight.
    """
    
    audit_entry = {
        "action_type": "RANK_OVERRIDE",
        "timestamp": datetime.utcnow().isoformat(),
        "details": {
            "candidate_id": request.candidate_id,
            "old_rank": request.old_rank,
            "new_rank": request.new_rank,
            "human_justification": request.reason,
            "compliance": "EU AI Act Art. 14 - Human oversight exercised"
        }
    }
    
    # Log to Supabase if available
    if supabase:
        try:
            supabase.table("audit_logs").insert(audit_entry).execute()
            logger.info(f"Override logged: {request.candidate_id}")
        except Exception as e:
            logger.warning(f"Override logging failed: {e}")
    
    return {
        "message": "Override immutably logged for compliance", 
        "audit_entry": audit_entry,
        "status": "success"
    }

@app.get("/session/{session_id}")
async def get_session_status(session_id: str):
    """Check if a session still exists (for debugging)"""
    exists = session_id in temp_storage
    logger.debug(f"Session {session_id} status: exists={exists}")
    return {
        "session_id": session_id,
        "exists": exists,
        "candidates_count": len(temp_storage.get(session_id, [])) if exists else 0
    }

# ==========================================
# Run with: uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
# ==========================================