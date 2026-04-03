# ==========================================
# FILE: backend/scoring_engine.py
# FIXED VERSION - 3-Factor Weighted Scoring
# ==========================================
import time
import logging
import re
from typing import List, Dict, Tuple
from functools import lru_cache

logger = logging.getLogger(__name__)

try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    SENTENCE_TRANSFORMER_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMER_AVAILABLE = False
    SentenceTransformer = None
    cosine_similarity = None
    logger.warning("sentence-transformers not available, using fallback")

class AdvancedScoringEngine:
    """
    Handles semantic matching using Dense Embeddings.
    Satisfies EU AI Act Art. 13 [Transparency and Provision of Information] via Explainability Tags.
    """
    def __init__(self):
        self.model_name = 'all-MiniLM-L6-v2'
        self.model = None
        self.fallback_mode = False
        
        if SENTENCE_TRANSFORMER_AVAILABLE:
            try:
                self.model = SentenceTransformer(self.model_name)
                logger.info(f"SentenceTransformer model '{self.model_name}' loaded")
            except Exception as e:
                logger.warning(f"SentenceTransformer failed to load: {e}, using fallback")
                self.fallback_mode = True
        else:
            logger.warning("sentence-transformers not installed, using TF-IDF fallback")
            self.fallback_mode = True

        # Knowledge base for explainability extraction
        self.tech_skills = {
            "python": ["python", "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow"],
            "ml": ["machine learning", "deep learning", "nlp", "transformers", "llm", "mlops"],
            "data": ["sql", "bigquery", "spark", "hadoop", "airflow"],
            "cloud": ["aws", "gcp", "azure", "docker", "kubernetes"],
            "stats": ["statistics", "a/b testing", "experimentation", "regression"]
        }

    def _extract_key_concepts(self, jd_text: str, resume_text: str) -> List[str]:
        """Identifies overlapping concrete skills to provide transparent explainability."""
        jd_lower = jd_text.lower()
        resume_lower = resume_text.lower()
        matched = []
        
        for category, skills in self.tech_skills.items():
            for skill in skills:
                if skill in jd_lower and skill in resume_lower:
                    matched.append(skill.title())
        
        return list(dict.fromkeys(matched))

    def _extract_experience_years(self, text: str) -> int:
        """Extracts numerical years of experience from resume text."""
        patterns = [
            r'(\d+)\+?\s*years?(?:\s+of)?\s+experience',
            r'experience:\s*(\d+)',
            r'(\d+)\s*yrs?',
            r'(\d+)\s*year',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return min(int(match.group(1)), 20)
        return 3  # default

    def _fallback_scoring(self, job_description: str, anonymized_resumes: List[Dict]) -> Tuple[List[Dict], Dict]:
        """TF-IDF fallback when sentence-transformers is unavailable."""
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        
        resume_texts = [r["anon_text"] for r in anonymized_resumes]
        all_texts = [job_description] + resume_texts
        
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        results = []
        for idx, score in enumerate(similarities):
            normalized_score = min(int(score * 100), 99)
            matched_skills = self._extract_key_concepts(job_description, resume_texts[idx])
            skill_percent = min(int((len(matched_skills) / max(1, len(self.tech_skills))) * 100) * 4, 99)
            
            results.append({
                "candidate_id": anonymized_resumes[idx]["candidate_id"],
                "score": normalized_score,
                "skills": skill_percent if skill_percent > 0 else 25,
                "explainability_tags": matched_skills if matched_skills else ["General Match"],
            })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        for rank, res in enumerate(results):
            res["rank"] = rank + 1
        
        return results, {"model_used": "TF-IDF (fallback)", "candidates_processed": len(results)}

    @lru_cache(maxsize=128)
    def _encode_text(self, text: str):
        """Cached encoding for repeated texts."""
        if self.model:
            return self.model.encode([text])
        return None

    def rank_candidates(self, job_description: str, anonymized_resumes: List[Dict]) -> Tuple[List[Dict], Dict]:
        """
        Calculates semantic similarity between JD and resumes via batch encoding.
        Returns ranked results and performance audit dict.
        """
        start_time = time.perf_counter()
        
        if not anonymized_resumes:
            return [], {"error": "No resumes provided"}

        # Use fallback if model not available
        if self.fallback_mode or not self.model:
            return self._fallback_scoring(job_description, anonymized_resumes)

        # Extract texts for batch encoding
        resume_texts = [r["anon_text"] for r in anonymized_resumes]
        
        # Batch encoding for performance
        jd_embedding = self.model.encode([job_description])
        resume_embeddings = self.model.encode(resume_texts, batch_size=32, show_progress_bar=False)
        
        # Calculate Cosine Similarity
        similarities = cosine_similarity(jd_embedding, resume_embeddings)[0]
        
        results = []
        for idx, score in enumerate(similarities):
            base_score = max(0, float(score))
            matched_skills = self._extract_key_concepts(job_description, resume_texts[idx])
            exp_years = self._extract_experience_years(resume_texts[idx])
            
            exp_component   = min(exp_years / 15, 0.20)   # max 20%
            keyword_component = min(len(matched_skills) * 0.08, 0.30)  # max 30%
            semantic_component = base_score * 0.50          # 50%
            
            final_score = (semantic_component + keyword_component + exp_component) * 100
            normalized_score = min(int(final_score), 99)
            
            skill_percent = min(int((len(matched_skills) / max(1, len(self.tech_skills))) * 100) * 4, 99)
            
            results.append({
                "candidate_id": anonymized_resumes[idx]["candidate_id"],
                "score": normalized_score,
                "skills": skill_percent if skill_percent > 0 else 25,
                "explainability_tags": matched_skills if matched_skills else ["General Conceptual Match"],
            })

        # Sort and assign ranks
        results.sort(key=lambda x: x["score"], reverse=True)
        for rank, res in enumerate(results):
            res["rank"] = rank + 1

        processing_time = round((time.perf_counter() - start_time) * 1000, 2)
        
        audit_dict = {
            "model_used": self.model_name,
            "processing_time_ms": processing_time,
            "candidates_processed": len(results),
            "batch_size": 32,
            "weighting": "50% semantic, 30% keyword, 20% experience",
            "compliance_note": "Scoring logic explained per EU AI Act Art. 13"
        }

        return results, audit_dict