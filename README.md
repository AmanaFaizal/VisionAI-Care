# VisionAI-Care 👁️🤖

### AI-Powered Vision Screening and Eye-Care Platform

VisionAI-Care is an AI-assisted vision-screening and online eye-care platform designed to support preliminary vision assessment through interactive digital eye tests, computer vision, machine learning, and doctor-guided follow-up care.

The platform aims to bridge the gap between **automated vision screening and professional eye-care consultation** by allowing patients to perform guided vision tests and providing doctors with structured screening results for review.

> **Note:** VisionAI-Care is intended as a screening and decision-support system, not a replacement for professional eye examinations or clinical diagnosis.

---

## 🎯 Project Objectives

- Develop an interactive platform for preliminary vision screening.
- Implement adaptive digital vision tests for different screening scenarios.
- Use computer vision to monitor test conditions and improve screening reliability.
- Explore machine-learning approaches for preliminary refractive-error classification.
- Provide structured screening results for doctor review.
- Support online doctor consultations and follow-up care.
- Maintain patient screening history and relevant medical records securely.

---

## ✨ Key Features

### 👤 Patient Portal

- Patient registration and authentication
- Guided vision-screening workflow
- Interactive digital vision tests
- Right-eye and left-eye testing
- Near and distance vision assessment
- Screening result visualization
- Previous screening history
- Online consultation requests

### 👁️ Computer Vision

Computer vision techniques are used to support reliable screening by monitoring factors such as:

- Face position
- Viewing distance
- Head orientation
- Eye visibility
- Eye coverage
- Test conditions
- Screening reliability

The project explores **OpenCV** and **MediaPipe** for computer-vision-based analysis.

### 🧠 Machine Learning

The ML component is intended to investigate preliminary classification of refractive-error patterns using features extracted from vision-screening results.

Potential models include:

- XGBoost
- Random Forest
- Support Vector Machine (SVM)
- Other suitable machine-learning models based on experimental evaluation

The ML output is treated as a **preliminary screening result**, not a clinical diagnosis.

### 👨‍⚕️ Doctor Portal

The doctor dashboard is designed to allow healthcare professionals to:

- View patient screening results
- Review vision history
- Examine AI-generated summaries
- Review screening reliability
- Add consultation notes
- Provide professional recommendations
- Manage follow-up consultations

### 📋 Reports

The platform is planned to support structured screening reports containing:

- Patient information
- Test results
- Screening reliability indicators
- Preliminary AI/ML results
- Doctor observations
- Consultation information

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │        Next.js          │
                    │        Frontend         │
                    │                         │
                    │  Patient Portal          │
                    │  Vision Tests            │
                    │  Results                 │
                    │  Doctor Dashboard        │
                    └────────────┬────────────┘
                                 │
                            REST API / JSON
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        FastAPI          │
                    │        Backend          │
                    │                         │
                    │  Authentication         │
                    │  Screening APIs         │
                    │  Doctor APIs            │
                    │  Consultation APIs      │
                    │  Report APIs             │
                    └──────────┬───────┬──────┘
                               │       │
                     ┌─────────┘       └──────────┐
                     ▼                            ▼
          ┌──────────────────┐          ┌──────────────────┐
          │   PostgreSQL     │          │   AI / CV Engine │
          │                  │          │                  │
          │ Users            │          │ OpenCV           │
          │ Tests            │          │ MediaPipe        │
          │ Results          │          │ ML Models        │
          │ Doctors          │          │ AI Assistant     │
          │ Consultations   │          │                  │
          │ Prescriptions   │          │                  │
          └──────────────────┘          └──────────────────┘
```

---

## 🛠️ Technology Stack

| Component            | Technology               |
| -------------------- | ------------------------ |
| Frontend             | Next.js, TypeScript      |
| UI                   | Tailwind CSS             |
| Backend              | FastAPI                  |
| Programming Language | Python                   |
| Database             | PostgreSQL / Supabase    |
| Authentication       | Supabase Auth            |
| Computer Vision      | OpenCV, MediaPipe        |
| Machine Learning     | Scikit-learn, XGBoost    |
| Data Processing      | NumPy, Pandas            |
| Speech Input         | Web Speech API / Whisper |
| AI Assistant         | LLM / Gemini API         |
| PDF Reports          | ReportLab                |
| Deployment           | Docker                   |

---

## 🔄 Proposed Workflow

```text
Patient Registration
        │
        ▼
Patient Login
        │
        ▼
Vision Screening
        │
        ├── Distance Vision
        ├── Near Vision
        ├── Right Eye
        ├── Left Eye
        └── Additional Tests
        │
        ▼
Computer Vision
        │
        ├── Face Detection
        ├── Distance Monitoring
        ├── Head Pose
        └── Test Reliability
        │
        ▼
Feature Extraction
        │
        ▼
Machine Learning Model
        │
        ▼
Preliminary Screening Result
        │
        ▼
Doctor Review
        │
        ▼
Online Consultation
        │
        ▼
Professional Recommendation
```

---

## 🔬 AI Architecture

The project separates **machine-learning prediction** from **AI-generated explanations**.

```text
Vision Test Results
        │
        ▼
Feature Extraction
        │
        ▼
ML Model
(XGBoost / SVM / Random Forest)
        │
        ▼
Preliminary Classification
        │
        ├───────────────┐
        │               │
        ▼               ▼
   Patient Data     Test Results
        │               │
        └───────┬───────┘
                ▼
          AI Assistant
                │
                ▼
       Structured Summary
                │
                ▼
          Doctor Review
```

The machine-learning model performs the predictive component, while the LLM is intended to assist with **summarization and communication**, rather than making independent clinical decisions.

---

## 🔐 Privacy and Safety

VisionAssist AI is designed with privacy and responsible AI principles in mind.

Key considerations include:

- Secure authentication
- Role-based access control
- Structured storage of patient data
- Minimizing unnecessary transmission of webcam data
- Processing real-time computer-vision tasks locally where practical
- Separating AI-generated outputs from professional medical decisions
- Clearly communicating that screening results do not replace professional eye examinations

---


## 🎓 Project Context

VisionAssist AI is being developed as an academic project focusing on the application of:

- Computer Vision
- Machine Learning
- Artificial Intelligence
- Full-Stack Software Engineering
- Healthcare Technology

The project combines these areas into a single platform to investigate how AI-assisted screening can support more accessible preliminary vision assessment while keeping healthcare professionals involved in the final decision-making process.

---
