import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

from app.models.vision_test import TestStatus, EyeSide


class SessionCreate(BaseModel):
    pass


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    status: TestStatus
    test_distance_cm: Optional[float] = None
    reliability_score: Optional[float] = None
    reliability_flags: Optional[Dict[str, Any]] = None
    started_at: datetime
    completed_at: Optional[datetime] = None


class ResultSubmit(BaseModel):
    eye: EyeSide
    responses: List[bool]          # correctness of each optotype shown, in order
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


class ReliabilityFrame(BaseModel):
    image_base64: str
    expected_distance_cm: Optional[float] = 40.0


class ReliabilityReport(BaseModel):
    face_detected: bool
    eyes_detected: bool
    is_blinking: bool
    estimated_distance_cm: Optional[float]
    face_centered: bool
    reliability_score: float
    notes: List[str]
