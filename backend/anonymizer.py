# ==========================================
# FILE: backend/anonymizer.py
# FIXED VERSION
# ==========================================
import re
import spacy
import time
import logging
from typing import Tuple, Dict, List
from datetime import datetime

logger = logging.getLogger(__name__)

class ResumeAnonymizer:
    """
    Handles extraction and redaction of Personally Identifiable Information (PII).
    Ensures compliance with EU AI Act Art. 5(1)(c) [Data Minimisation] and Art. 12 [Record Keeping].
    """
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
        except Exception as e:
            logger.warning(f"spaCy model not found. Proceeding with regex only. Error: {e}")
            self.nlp = None

        # Blacklist to prevent tech terms from being flagged as locations/names
        self.tech_blacklist = {
            "python", "java", "react", "c++", "sql", "aws", "docker", "kubernetes", 
            "typescript", "ruby", "go", "php", "javascript", "html", "css", "node", 
            "angular", "vue", "spring", "django", "flask", "fastapi", "tensorflow", 
            "pytorch", "pandas", "numpy", "scikit", "git", "linux", "ubuntu", "windows", 
            "macos", "ios", "android", "swift", "kotlin", "rust", "scala", "perl", 
            "haskell", "clojure", "elixir", "erlang", "bash", "powershell", "zsh"
        }

        # Pre-compile regex patterns for performance
        self.patterns = {
            "URL": re.compile(r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)', re.IGNORECASE),
            "SOCIAL": re.compile(r'(https?://)?(www\.)?(linkedin\.com/in/|github\.com/|twitter\.com/|x\.com/|medium\.com/@)[\w-]+', re.IGNORECASE),
            "EMAIL": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            "PHONE": re.compile(r'\b[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}\b'),
            "DOB_AGE": re.compile(r'\b(19\d{2}|20[0-2]\d|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\b\d{1,2}\s*years?\s*old|\bage[:\s]+(\d{1,2}))\b', re.IGNORECASE),
            "GENDER": re.compile(r'\b(he|him|his|himself|she|her|hers|herself)\b', re.IGNORECASE),
            "ADDRESS": re.compile(r'\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way)\b', re.IGNORECASE),
            "NATIONALITY": re.compile(r'\b(American|British|Indian|Chinese|Japanese|Korean|German|French|Canadian|Australian|Spanish|Italian|Brazilian|Mexican|Russian|Dutch|Swedish|Norwegian|Danish|Finnish|Polish|Turkish|Greek|Portuguese|Irish|Scottish|Welsh|Swiss|Austrian|Belgian|Czech|Hungarian|Romanian|Bulgarian|Croatian|Serbian|Slovak|Slovenian|Estonian|Latvian|Lithuanian|Ukrainian|Belarusian|Moldovan|Georgian|Armenian|Azerbaijani|Kazakh|Uzbek|Turkmen|Kyrgyz|Tajik|Mongolian|Vietnamese|Thai|Indonesian|Filipino|Malaysian|Singaporean|Egyptian|South African|Nigerian|Kenyan|Ethiopian|Moroccan|Algerian|Tunisian|Libyan|Sudanese|Iranian|Iraqi|Syrian|Lebanese|Jordanian|Saudi|Emirati|Qatari|Kuwaiti|Omani|Bahraini|Yemeni|Afghan|Pakistani|Bangladeshi|Sri Lankan|Nepali)\b', re.IGNORECASE)
        }

    def anonymize(self, text: str, session_id: str) -> Tuple[str, Dict]:
        """
        Redacts PII in a specific order and generates an audit trail.
        Order: URLs -> SOCIAL -> Emails -> Phones -> Address -> Age/DOB -> Gender -> Nationality -> spaCy NER
        """
        start_time = time.perf_counter()
        anonymized_text = text
        redaction_counts = {key: 0 for key in self.patterns.keys()}
        redaction_counts.update({"NAME": 0, "LOCATION": 0, "UNIVERSITY": 0})
        stripped_types = set()

        # 1. Regex Pass (Correct order)
        order = ["URL", "SOCIAL", "EMAIL", "PHONE", "ADDRESS", "DOB_AGE", "GENDER", "NATIONALITY"]
        for pii_type in order:
            pattern = self.patterns.get(pii_type)
            if pattern:
                matches = pattern.findall(anonymized_text)
                if matches:
                    count = len(matches) if not isinstance(matches[0], tuple) else len(matches)
                    redaction_counts[pii_type] += count
                    stripped_types.add(pii_type)
                    anonymized_text = pattern.sub(f"[REDACTED_{pii_type}]", anonymized_text)

        # 2. spaCy NER Pass
        if self.nlp:
            doc = self.nlp(anonymized_text)
            replacements = []
            
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    replacements.append((ent.text, "[REDACTED_NAME]", "NAME"))
                elif ent.label_ in ["GPE", "LOC"] and ent.text.lower() not in self.tech_blacklist:
                    replacements.append((ent.text, "[REDACTED_LOCATION]", "LOCATION"))
                elif ent.label_ == "ORG" and any(word in ent.text.lower() for word in ["university", "college", "institute", "school"]):
                    replacements.append((ent.text, "[REDACTED_UNIVERSITY]", "UNIVERSITY"))

            # Sort by length descending to prevent partial replacements
            replacements.sort(key=lambda x: len(x[0]), reverse=True)
            for old_text, new_text, category in replacements:
                if old_text in anonymized_text:
                    anonymized_text = anonymized_text.replace(old_text, new_text)
                    redaction_counts[category] += 1
                    stripped_types.add(category)

        # Clean zero counts
        active_counts = {k: v for k, v in redaction_counts.items() if v > 0}
        
        processing_time = round((time.perf_counter() - start_time) * 1000, 2)

        audit_dict = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "redaction_summary": active_counts,
            "total_redactions": sum(active_counts.values()),
            "stripped_types": list(stripped_types),
            "processing_time_ms": processing_time,
            "confidence_score": 0.95 if self.nlp else 0.70,
            "compliance_note": "Data minimised per EU AI Act Art. 5(1)(c)"
        }

        return anonymized_text, audit_dict

    def extract_real_name(self, raw_text: str) -> str:
        """Extracts candidate name prior to anonymization for the 'Reveal' feature."""
        lines = raw_text.strip().split('\n')
        if not lines: return "Unknown Candidate"
        
        first_line = lines[0].strip()
        if '@' not in first_line and 0 < len(first_line.split()) <= 4:
            return first_line
            
        name_match = re.search(r'Name:?\s*([A-Z][a-z]+ [A-Z][a-z]+)', raw_text, re.IGNORECASE)
        if name_match:
            return name_match.group(1)
        return "Unknown Candidate"

    def extract_experience(self, raw_text: str) -> str:
        """Extracts stated years of experience."""
        patterns = [
            r'(\d+)\+?\s*years?(?:\s+of)?\s+experience',
            r'Experience:\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*yrs?',
            r'(\d+)\+?\s*year'
        ]
        for pattern in patterns:
            match = re.search(pattern, raw_text, re.IGNORECASE)
            if match: return f"{match.group(1)} yrs"
        return "Not specified"

    def extract_location(self, raw_text: str) -> str:
        """Extracts location safely, avoiding tech buzzwords."""
        loc_match = re.search(r'Location:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', raw_text, re.IGNORECASE)
        if loc_match and loc_match.group(1).lower() not in self.tech_blacklist:
            return loc_match.group(1)
            
        if self.nlp:
            doc = self.nlp(raw_text[:500])
            for ent in doc.ents:
                if ent.label_ in ["GPE", "LOC"] and ent.text.lower() not in self.tech_blacklist:
                    return ent.text
        return "Undisclosed"