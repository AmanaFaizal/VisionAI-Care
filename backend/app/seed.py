"""
Seeds a demo doctor and patient account so you can log in immediately
after a fresh `docker compose up`.

Run with:  python -m app.seed
"""
from app.db.session import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.core.security import hash_password
import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)

db = SessionLocal()

DEMO_ACCOUNTS = [
    dict(
        email="doctor@demo.visionai.care",
        password="Doctor123!",
        full_name="Dr. Asha Perera",
        role=UserRole.doctor,
        specialization="Ophthalmology",
        license_number="SLMC-00123",
    ),
    dict(
        email="patient@demo.visionai.care",
        password="Patient123!",
        full_name="Nadeesha Silva",
        role=UserRole.patient,
        age=27,
    ),
]

for acc in DEMO_ACCOUNTS:
    existing = db.query(User).filter(User.email == acc["email"]).first()
    if existing:
        print(f"skip (exists): {acc['email']}")
        continue
    user = User(
        email=acc["email"],
        hashed_password=hash_password(acc["password"]),
        full_name=acc["full_name"],
        role=acc["role"],
        age=acc.get("age"),
        specialization=acc.get("specialization"),
        license_number=acc.get("license_number"),
    )
    db.add(user)
    print(f"created: {acc['email']} / {acc['password']}")

db.commit()
db.close()
print("Seed complete.")
