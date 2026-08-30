from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.vision_test import VisionTestSession, VisionTestResult, TestStatus
from app.models.consultation import Consultation, ConsultationStatus
from app.schemas.vision_test import (
    SessionCreate,
    SessionOut,
    ResultSubmit,
    ResultOut,
    ReliabilitySubmit,
    SessionComplete,
)
from app.services.scoring_service import score_result
from app.services.ai_service import evaluate_screening

router = APIRouter(prefix="/api/vision-tests", tags=["vision-tests"])


@router.post("/sessions", response_model=SessionOut, status_code=201)
def start_session(
    session_data: SessionCreate,
    user: User = Depends(require_role(UserRole.patient)), 
    db: Session = Depends(get_db)
):
    session = VisionTestSession(patient_id=user.id, test_type=session_data.test_type, status=TestStatus.in_progress)
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


@router.post("/sessions/{session_id}/reliability", response_model=SessionOut)
def update_reliability(
    session_id: str,
    payload: ReliabilitySubmit,
    user: User = Depends(require_role(UserRole.patient)),
    db: Session = Depends(get_db),
):
    session = db.query(VisionTestSession).filter(VisionTestSession.id == session_id).first()
    if not session or str(session.patient_id) != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")

    session.reliability_score = payload.reliability_score
    session.reliability_flags = payload.flags
    db.add(session)
    db.commit()
    db.refresh(session)

    return session


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

    scored = score_result(payload.responses, payload.line_sizes, session.test_type)
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
    payload: SessionComplete,
    user: User = Depends(require_role(UserRole.patient)),
    db: Session = Depends(get_db),
):
    session = db.query(VisionTestSession).filter(VisionTestSession.id == session_id).first()
    if not session or str(session.patient_id) != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")

    reliable = (session.reliability_score or 1.0) >= 0.4
    session.status = TestStatus.completed if reliable else TestStatus.aborted_unreliable
    session.completed_at = datetime.utcnow()
    session.symptoms = payload.symptoms
    
    if reliable:
        results = db.query(VisionTestResult).filter(VisionTestResult.session_id == session.id).all()
        left_acuity = next((r.acuity_score for r in results if r.eye.value == 'left'), None)
        right_acuity = next((r.acuity_score for r in results if r.eye.value == 'right'), None)
        
        ai_res = evaluate_screening(left_acuity, right_acuity, payload.symptoms, session.test_type)
        session.ai_recommendation = ai_res["recommendation"]
        session.ai_factors = ai_res["contributing_factors"]
        session.ai_explanation = ai_res["explanation"]

    db.add(session)
    
    if reliable and session.ai_recommendation != "no immediate concern":
        consultation = Consultation(
            session_id=session.id,
            patient_id=session.patient_id,
            status=ConsultationStatus.pending,
        )
        db.add(consultation)

    db.commit()
    db.refresh(session)
    return session

