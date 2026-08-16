import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api } from "../../lib/api";

function statusBadge(status) {
  const map = {
    pending: "badge-warning",
    claimed: "badge-warning",
    reviewed: "badge-success",
  };
  return <span className={`badge ${map[status] || "badge-muted"}`}>{status}</span>;
}

function DashboardContent() {
  const router = useRouter();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myConsultations()
      .then(setConsultations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStartTest() {
    setStarting(true);
    setError("");
    try {
      const session = await api.startSession();
      router.push(`/patient/test?session=${session.id}`);
    } catch (e) {
      setError(e.message);
      setStarting(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Start a vision screening</h2>
          <p style={{ color: "var(--muted)" }}>
            A guided, camera-monitored screening for each eye. Takes about 3-5 minutes. Results
            are sent to a doctor for review afterward.
          </p>
          {error && <p className="error-text">{error}</p>}
          <button className="btn" onClick={handleStartTest} disabled={starting}>
            {starting ? "Starting..." : "Start new screening"}
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your consultations</h3>
          {loading && <p>Loading...</p>}
          {!loading && consultations.length === 0 && (
            <p style={{ color: "var(--muted)" }}>No screenings yet.</p>
          )}
          {consultations.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontSize: 14 }}>
                  Screening from {new Date(c.created_at).toLocaleString()}
                </div>
                {c.recommendation && (
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                    {c.recommendation}
                  </div>
                )}
              </div>
              {statusBadge(c.status)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <ProtectedRoute role="patient">
      <DashboardContent />
    </ProtectedRoute>
  );
}
