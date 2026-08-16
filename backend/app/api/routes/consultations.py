from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.consultation import Consultation, ConsultationStatus
from app.models.vision_test import VisionTestSession, VisionTestResult
from app.schemas.consultation import ConsultationOut, ConsultationReview

router = APIRouter(prefix="/api/consultations", tags=["consultations"])


@router.get("/queue", response_model=list[ConsultationOut])
def get_queue(
    user: User = Depends(require_role(UserRole.doctor, UserRole.admin)),
    db: Session = Depends(get_db),
):
    return (
        db.query(Consultation)
        .filter(Consultation.status == ConsultationStatus.pending)
        .order_by(Consultation.created_at.asc())
        .all()
    )


@router.get("/mine", response_model=list[ConsultationOut])
def my_consultations(
    user: User = Depends(require_role(UserRole.patient)), db: Session = Depends(get_db)
):
    return (
        db.query(Consultation)
        .filter(Consultation.patient_id == user.id)
        .order_by(Consultation.created_at.desc())
        .all()
    )


@router.get("/{consultation_id}/detail")
def consultation_detail(
    consultation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role == UserRole.patient and str(c.patient_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    session = db.query(VisionTestSession).filter(VisionTestSession.id == c.session_id).first()
    results = db.query(VisionTestResult).filter(VisionTestResult.session_id == c.session_id).all()
    patient = db.query(User).filter(User.id == c.patient_id).first()

    return {
        "consultation": ConsultationOut.model_validate(c),
        "session": {
            "id": str(session.id),
            "status": session.status.value,
            "reliability_score": session.reliability_score,
            "reliability_flags": session.reliability_flags,
            "test_distance_cm": session.test_distance_cm,
        } if session else None,
        "results": [
            {
                "eye": r.eye.value,
                "acuity_score": r.acuity_score,
                "preliminary_flag": r.preliminary_flag,
                "correct_responses": r.correct_responses,
                "total_responses": r.total_responses,
            }
            for r in results
        ],
        "patient": {
            "full_name": patient.full_name,
            "age": patient.age,
            "email": patient.email,
        } if patient else None,
    }


@router.post("/{consultation_id}/claim", response_model=ConsultationOut)
def claim_consultation(
    consultation_id: str,
    doctor: User = Depends(require_role(UserRole.doctor)),
    db: Session = Depends(get_db),
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    if c.status != ConsultationStatus.pending:
        raise HTTPException(status_code=400, detail="Already claimed or reviewed")
    c.doctor_id = doctor.id
    c.status = ConsultationStatus.claimed
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.post("/{consultation_id}/review", response_model=ConsultationOut)
def review_consultation(
    consultation_id: str,
    payload: ConsultationReview,
    doctor: User = Depends(require_role(UserRole.doctor)),
    db: Session = Depends(get_db),
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    if c.doctor_id and str(c.doctor_id) != str(doctor.id):
        raise HTTPException(status_code=403, detail="Claimed by another doctor")

    c.doctor_id = doctor.id
    c.doctor_notes = payload.doctor_notes
    c.recommendation = payload.recommendation
    c.status = ConsultationStatus.reviewed
    c.reviewed_at = datetime.utcnow()
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
