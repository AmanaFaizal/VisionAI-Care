"""
Computer-vision monitoring service for vision-test sessions.

Uses MediaPipe Face Mesh to check, per submitted frame:
  - a face is present and roughly centered
  - both eyes are visible / open (not blinking) at capture time
  - a rough estimate of camera-to-face distance, from interpupillary
    pixel distance and a fixed average adult IPD (~63mm), used only as
    a *reliability* signal (are they sitting at a consistent distance),
    not as a medical measurement.

This never produces a diagnosis. It only flags whether a given test
frame/session looks reliable enough to trust the patient's responses.
"""
import base64
import binascii
from typing import Optional

import cv2
import numpy as np

try:
    import mediapipe as mp

    _mp_face_mesh = mp.solutions.face_mesh
    _face_mesh = _mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
    )
    _MEDIAPIPE_AVAILABLE = True
except Exception:  # pragma: no cover - mediapipe not installed / no model assets
    _MEDIAPIPE_AVAILABLE = False
    _face_mesh = None

# Face Mesh landmark indices we care about
LEFT_EYE_OUTER, LEFT_EYE_INNER = 33, 133
RIGHT_EYE_OUTER, RIGHT_EYE_INNER = 362, 263
LEFT_EYE_TOP, LEFT_EYE_BOTTOM = 159, 145
RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM = 386, 374
NOSE_TIP = 1

AVERAGE_ADULT_IPD_MM = 63.0
ASSUMED_FOCAL_PX = 700.0  # rough webcam focal-length assumption for the distance heuristic


def _decode_image(image_base64: str) -> Optional[np.ndarray]:
    try:
        if "," in image_base64 and image_base64.strip().startswith("data:"):
            image_base64 = image_base64.split(",", 1)[1]
        raw = base64.b64decode(image_base64)
        arr = np.frombuffer(raw, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img
    except (binascii.Error, ValueError, cv2.error):
        return None


def _eye_aspect_ratio(top, bottom, outer, inner) -> float:
    vertical = abs(top[1] - bottom[1])
    horizontal = abs(outer[0] - inner[0]) or 1e-6
    return vertical / horizontal


def analyze_frame(image_base64: str, expected_distance_cm: float = 40.0) -> dict:
    notes = []
    img = _decode_image(image_base64)
    if img is None:
        return {
            "face_detected": False,
            "eyes_detected": False,
            "is_blinking": False,
            "estimated_distance_cm": None,
            "face_centered": False,
            "reliability_score": 0.0,
            "notes": ["Could not decode image frame."],
        }

    h, w = img.shape[:2]

    if not _MEDIAPIPE_AVAILABLE:
        # Fallback: OpenCV Haar cascade face detection only (no landmark/gaze detail).
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = cascade.detectMultiScale(gray, 1.1, 5)
        face_detected = len(faces) > 0
        centered = False
        if face_detected:
            x, y, fw, fh = faces[0]
            cx = x + fw / 2
            centered = abs(cx - w / 2) < w * 0.2
        return {
            "face_detected": face_detected,
            "eyes_detected": face_detected,
            "is_blinking": False,
            "estimated_distance_cm": None,
            "face_centered": centered,
            "reliability_score": 0.6 if face_detected and centered else 0.2,
            "notes": ["MediaPipe unavailable; used basic Haar-cascade face detection fallback."],
        }

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    result = _face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        return {
            "face_detected": False,
            "eyes_detected": False,
            "is_blinking": False,
            "estimated_distance_cm": None,
            "face_centered": False,
            "reliability_score": 0.0,
            "notes": ["No face detected in frame."],
        }

    landmarks = result.multi_face_landmarks[0].landmark

    def pt(idx):
        lm = landmarks[idx]
        return (lm.x * w, lm.y * h)

    left_outer, left_inner = pt(LEFT_EYE_OUTER), pt(LEFT_EYE_INNER)
    right_outer, right_inner = pt(RIGHT_EYE_OUTER), pt(RIGHT_EYE_INNER)
    left_top, left_bottom = pt(LEFT_EYE_TOP), pt(LEFT_EYE_BOTTOM)
    right_top, right_bottom = pt(RIGHT_EYE_TOP), pt(RIGHT_EYE_BOTTOM)
    nose = pt(NOSE_TIP)

    left_ear = _eye_aspect_ratio(left_top, left_bottom, left_outer, left_inner)
    right_ear = _eye_aspect_ratio(right_top, right_bottom, right_outer, right_inner)
    avg_ear = (left_ear + right_ear) / 2
    is_blinking = avg_ear < 0.15

    # interpupillary distance in pixels (using inner-eye corners as a stable proxy)
    ipd_px = np.hypot(left_inner[0] - right_inner[0], left_inner[1] - right_inner[1]) or 1e-6
    estimated_distance_cm = (AVERAGE_ADULT_IPD_MM * ASSUMED_FOCAL_PX) / (ipd_px * 10.0)

    face_center_x = nose[0]
    face_centered = abs(face_center_x - w / 2) < w * 0.15

    score = 1.0
    if is_blinking:
        score -= 0.4
        notes.append("Eyes appear closed/blinking in this frame.")
    if not face_centered:
        score -= 0.3
        notes.append("Face is not centered in frame.")
    if estimated_distance_cm and abs(estimated_distance_cm - expected_distance_cm) > 15:
        score -= 0.3
        notes.append(
            f"Estimated distance ~{estimated_distance_cm:.0f}cm differs from expected "
            f"{expected_distance_cm:.0f}cm."
        )
    score = max(0.0, min(1.0, score))

    return {
        "face_detected": True,
        "eyes_detected": True,
        "is_blinking": bool(is_blinking),
        "estimated_distance_cm": round(float(estimated_distance_cm), 1),
        "face_centered": bool(face_centered),
        "reliability_score": round(score, 2),
        "notes": notes or ["Frame looks reliable."],
    }
