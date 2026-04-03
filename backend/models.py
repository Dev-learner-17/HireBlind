from pydantic import BaseModel
from typing import List


class ProcessRequest(BaseModel):
    session_id: str
    job_description: str


class OverrideRequest(BaseModel):
    candidate_id: str
    old_rank: int
    new_rank: int
    reason: str


class CandidateResult(BaseModel):
    id: str
    rank: int
    score: int
    skills: int
    matchedSkills: List[str]
    strippedData: List[str]
    realName: str
    experience: str
    location: str