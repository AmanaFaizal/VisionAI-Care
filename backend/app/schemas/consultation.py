import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.consultation import ConsultationStatus


class ConsultationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    status: ConsultationStatus
    doctor_notes: Optional[str] = None
    recommendation: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None


class ConsultationReview(BaseModel):
    doctor_notes: str
    recommendation: str
