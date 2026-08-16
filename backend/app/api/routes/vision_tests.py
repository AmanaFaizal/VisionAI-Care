from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.vision_test import VisionTestSession, VisionTestResult, TestStatus
from app.models.consultation import Consultation, ConsultationStatus
from app.schemas.vision_test import (
    SessionOut,
    ResultSubmit,
    ResultOut,
    ReliabilityFrame,
    ReliabilityReport,
)
from app.services.cv_service import analyze_frame
from app.services.scoring_service import score_result

router = APIRouter(prefix="/api/vision-tests", tags=["vision-tests"])


@router.post("/sessions", response_model=SessionOut, status_code=201)
def start_session(
    user: User = Depends(require_role(UserRole.patient)), db: Session = Depends(get_db)
):
    session = VisionTestSession(patient_id=user.id, status=TestStatus.in_progress)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{session_id}", response_model=SessionOut)
def get_session(session_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(VisionTestSession).filter(VisionTestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if user.role == UserRole.patient and str(session.patient_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not your session")
    return session


@router.post("/sessions/{session_id}/reliability-check", response_model=ReliabilityReport)
def reliability_check(
    session_id: str,
    frame: ReliabilityFrame,
    user: User = Depends(require_role(UserRole.patient)),
    db: Session = Depends(get_db),
):
    session = db.query(VisionTestSession).filter(VisionTestSession.id == session_id).first()
    if not session or str(session.patient_id) != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")

    report = analyze_frame(frame.image_base64, frame.expected_distance_cm or 40.0)

    # roll the frame's reliability into the session's running average
    prev = session.reliability_score
    session.reliability_score = report["reliability_score"] if prev is None else round(
        (prev + report["reliability_score"]) / 2, 2
    )
    if report.get("estimated_distance_cm"):
        session.test_distance_cm = report["estimated_distance_cm"]
    flags = session.reliability_flags or {}
    if report["is_blinking"]:
        flags["blinks"] = flags.get("blinks", 0) + 1
    if not report["face_centered"]:
        flags["off_center_frames"] = flags.get("off_center_frames", 0) + 1
    session.reliability_flags = flags

    db.add(session)
    db.commit()

    return ReliabilityReport(**report)


@router.post("/sessions/{session_id}/results", response_model=ResultOut, status_code=201)
def submit_eye_result(
    session_id: str,
    payload: ResultSubmit,
    user: User = Depends(require_role(UserRole.patient)),
    db: Session = Depends(get_db),
):
    session = db.query(VisionTestSession).filter(VisionTestSession.id == session_id).first()
    if not session or str(session.patient_id) != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")

    scored = score_result(payload.responses, payload.line_sizes)
    result = VisionTestResult(
        session_id=session.id,
        eye=payload.eye,
        acuity_score=scored["acuity_score"],
        smallest_line_read=scored["smallest_line_read"],
        correct_responses=scored["correct_responses"],
        total_responses=scored["total_responses"],
        preliminary_flag=scored["preliminary_flag"],
        raw_responses={"responses": payload.responses, "line_sizes": payload.line_sizes},
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.post("/sessions/{session_id}/complete", response_model=SessionOut)
def complete_session(
    session_id: str,
    user: User = Depends(require_role(UserRole.patient)),
    db: Session = Depends(get_db),
):
    session = db.query(VisionTestSession).filter(VisionTestSession.id == session_id).first()
    if not session or str(session.patient_id) != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")

    reliable = (session.reliability_score or 0) >= 0.4
    session.status = TestStatus.completed if reliable else TestStatus.aborted_unreliable
    session.completed_at = datetime.utcnow()
    db.add(session)

    consultation = Consultation(
        session_id=session.id,
        patient_id=session.patient_id,
        status=ConsultationStatus.pending,
    )
    db.add(consultation)
    db.commit()
    db.refresh(session)
    return session
