import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

from app.models.vision_test import TestStatus, EyeSide, TestType


class SessionCreate(BaseModel):
    test_type: TestType = TestType.acuity


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    status: TestStatus
    test_type: TestType
    test_distance_cm: Optional[float] = None
    reliability_score: Optional[float] = None
    reliability_flags: Optional[Dict[str, Any]] = None
    symptoms: Optional[List[str]] = None
    ai_recommendation: Optional[str] = None
    ai_explanation: Optional[str] = None
    ai_factors: Optional[List[str]] = None
    started_at: datetime
    completed_at: Optional[datetime] = None


class ResultSubmit(BaseModel):
    eye: EyeSide
    responses: List[Any]           # correctness, or string responses for color/astigmatism
    line_sizes: List[int]          # optotype size index shown at each step (matches responses)


class ResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    eye: EyeSide
    acuity_score: Optional[str]
    smallest_line_read: Optional[int]
    correct_responses: int
    total_responses: int
    preliminary_flag: Optional[str]


class ReliabilitySubmit(BaseModel):
    reliability_score: float
    flags: Dict[str, Any]


class SessionComplete(BaseModel):
    symptoms: List[str]

