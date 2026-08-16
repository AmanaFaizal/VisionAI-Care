import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { api } from "../../../lib/api";

function ReviewContent() {
  const router = useRouter();
  const { id } = router.query;
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .consultationDetail(id)
      .then((d) => {
        setDetail(d);
        setNotes(d.consultation.doctor_notes || "");
        setRecommendation(d.consultation.recommendation || "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.reviewConsultation(id, { doctor_notes: notes, recommendation });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <p className="error-text">{error || "Consultation not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Patient screening review</h2>
          <p>
            <strong>{detail.patient?.full_name}</strong>
            {detail.patient?.age ? `, age ${detail.patient.age}` : ""} —{" "}
            {detail.patient?.email}
          </p>

          <h4>Session reliability</h4>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Score: {detail.session?.reliability_score ?? "n/a"} · Est. distance:{" "}
            {detail.session?.test_distance_cm ?? "n/a"} cm · Status: {detail.session?.status}
          </p>

          <h4>Per-eye results</h4>
          {detail.results.map((r) => (
            <div key={r.eye} className="card" style={{ background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ textTransform: "capitalize" }}>{r.eye} eye</strong>
                <span>{r.acuity_score || "n/a"}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {r.correct_responses}/{r.total_responses} correct
              </div>
              {r.preliminary_flag && (
                <p style={{ fontSize: 13, color: "var(--warning)", marginBottom: 0 }}>
                  {r.preliminary_flag}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Doctor notes & recommendation</h3>
          {done ? (
            <div>
              <p className="badge badge-success">Review submitted</p>
              <button className="btn" onClick={() => router.push("/doctor/dashboard")}>
                Back to queue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>Clinical notes</label>
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} required />
              <label>Recommendation for patient</label>
              <textarea
                rows={3}
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                required
              />
              {error && <p className="error-text">{error}</p>}
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DoctorReview() {
  return (
    <ProtectedRoute role="doctor">
      <ReviewContent />
    </ProtectedRoute>
  );
}
