import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, Integer, Float, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class TestStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"
    aborted_unreliable = "aborted_unreliable"


class EyeSide(str, enum.Enum):
    left = "left"
    right = "right"
    both = "both"


class TestType(str, enum.Enum):
    acuity = "acuity"
    color = "color"
    astigmatism = "astigmatism"
    contrast = "contrast"


class VisionTestSession(Base):
    __tablename__ = "vision_test_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(TestStatus), default=TestStatus.in_progress)
    test_type = Column(Enum(TestType), default=TestType.acuity, nullable=False)
    test_distance_cm = Column(Float, nullable=True)
    reliability_score = Column(Float, nullable=True)  # 0-1, from CV monitoring
    reliability_flags = Column(JSON, nullable=True)  # e.g. {"blinks": 3, "off_center_frames": 2}
    symptoms = Column(JSON, nullable=True) # list of strings
    ai_recommendation = Column(String, nullable=True)
    ai_explanation = Column(String, nullable=True)
    ai_factors = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    results = relationship("VisionTestResult", back_populates="session", cascade="all, delete-orphan")
    consultation = relationship("Consultation", back_populates="session", uselist=False)



class VisionTestResult(Base):
    __tablename__ = "vision_test_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("vision_test_sessions.id"), nullable=False)
    eye = Column(Enum(EyeSide), nullable=False)
    acuity_score = Column(String, nullable=True)  # e.g. "20/25"
    smallest_line_read = Column(Integer, nullable=True)  # optotype size index resolved
    correct_responses = Column(Integer, default=0)
    total_responses = Column(Integer, default=0)
    preliminary_flag = Column(String, nullable=True)  # rule-based heuristic, e.g. "possible myopia - refer"
    raw_responses = Column(JSON, nullable=True)

    session = relationship("VisionTestSession", back_populates="results")
