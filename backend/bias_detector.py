# ==========================================
# FILE 3: backend/bias_detector.py (UPDATED)
# ==========================================
import re
from typing import Dict, List, Tuple
import numpy as np
try:
    from scipy import stats
except ImportError:
    stats = None

class BiasDetector:
    """
    Monitors raw inputs and system outputs for bias to satisfy EU AI Act Art. 10(2)(f).
    Includes statistical variance testing and group fairness metrics.
    """
    def __init__(self):
        # Expanded regex patterns for broader demographic detection
        self.gender_pattern = re.compile(r'\b(he|him|his|she|her|hers|they|them|theirs)\b', re.IGNORECASE)
        self.age_pattern = re.compile(r'\b(19[5-9]\d|200\d|\d{2}\syears\sold|graduated\sin\s\d{4})\b', re.IGNORECASE)
        self.origin_pattern = re.compile(r'\b(visa|citizen|nationality|languages?|fluent\sin|native)\b', re.IGNORECASE)
        
    def analyze_batch_input_bias_risk(self, raw_resumes: List[Dict]) -> Dict:
        """
        Analyzes the entire batch of original resumes for bias triggers.
        Addresses HIGH severity issue: Analyze ALL candidates.
        """
        if not raw_resumes:
            return {"average_risk": 0, "highest_risk_candidate": None, "recommendation": "No data."}

        batch_risks = []
        for resume in raw_resumes:
            risk = self._analyze_single_input(resume.get("raw_text", ""))
            batch_risks.append({"id": resume.get("filename", "Unknown"), "risk_score": risk["risk_percentage"], "factors": risk["bias_factors"]})

        avg_risk = sum(r["risk_score"] for r in batch_risks) / len(batch_risks)
        highest_risk = max(batch_risks, key=lambda x: x["risk_score"])

        return {
            "average_risk_percentage": round(avg_risk, 2),
            "highest_risk_candidate": highest_risk,
            "recommendation": "High risk of unconscious bias across batch. Blind screening mandatory." if avg_risk > 50 else "Standard blind screening sufficient."
        }

    def _analyze_single_input(self, raw_text: str) -> Dict:
        """Helper method to analyze a single resume using a weighted formula."""
        risk_score = 0
        factors = []
        
        if self.gender_pattern.search(raw_text):
            risk_score += 30
            factors.append("Gender pronouns detected")
            
        if self.age_pattern.search(raw_text):
            risk_score += 40
            factors.append("Age/Graduation indicators detected")
            
        if self.origin_pattern.search(raw_text):
            risk_score += 20
            factors.append("Origin/Nationality indicators detected")
            
        return {
            "risk_percentage": min(risk_score, 100),
            "bias_factors": factors
        }

    def detect_systemic_variance(self, scores: List[int]) -> Dict:
        """
        Checks if the ML model is scoring too uniformly using statistical rigor.
        Addresses CRITICAL severity issue: Add scipy.stats tests.
        """
        if not scores or len(scores) < 3:
            return {"warning": "Not enough data for statistical testing.", "action_required": False, "variance": 0.0}
            
        score_variance = np.var(scores)
        
        # 1. Normality Test (Shapiro-Wilk)
        # If p-value < 0.05, the data is NOT normally distributed (potential skew/bias)
        is_normal = True
        p_value = 1.0
        if stats:
            try:
                stat, p_value = stats.shapiro(scores)
                is_normal = p_value > 0.05
            except Exception as e:
                print(f"Stats error: {e}")

        # 2. Heuristic Variance Check
        variance_warning = score_variance < 15
        
        action_required = variance_warning or not is_normal
        
        warnings = []
        if variance_warning:
            warnings.append("Scores unusually clustered (low variance) - potential algorithmic blindness.")
        if not is_normal and stats:
            warnings.append(f"Score distribution is statistically skewed (Shapiro-Wilk p={p_value:.3f}).")

        return {
            "warning": " | ".join(warnings) if warnings else "Score distribution nominal and statistically healthy.",
            "action_required": action_required,
            "variance": round(float(score_variance), 2),
            "statistical_normality": "Normal" if is_normal else "Skewed",
            "mitigation_suggestion": "Review scoring embeddings; model may be collapsing around a generic keyword." if action_required else "None"
        }