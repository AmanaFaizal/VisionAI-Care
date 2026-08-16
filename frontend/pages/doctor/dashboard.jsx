import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api } from "../../lib/api";

function DashboardContent() {
  const router = useRouter();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState(null);

  function load() {
    setLoading(true);
    api
      .consultationQueue()
      .then(setQueue)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleClaim(id) {
    setClaimingId(id);
    try {
      await api.claimConsultation(id);
      router.push(`/doctor/review/${id}`);
    } catch (e) {
      setError(e.message);
      setClaimingId(null);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Pending consultations</h2>
          <p style={{ color: "var(--muted)" }}>
            Patient vision-screening results awaiting doctor review.
          </p>
          {error && <p className="error-text">{error}</p>}
          {loading && <p>Loading...</p>}
          {!loading && queue.length === 0 && (
            <p style={{ color: "var(--muted)" }}>No pending consultations right now.</p>
          )}
          {queue.map((c) => (
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
              <div style={{ fontSize: 14 }}>
                Submitted {new Date(c.created_at).toLocaleString()}
              </div>
              <button
                className="btn"
                onClick={() => handleClaim(c.id)}
                disabled={claimingId === c.id}
              >
                {claimingId === c.id ? "Claiming..." : "Review"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <ProtectedRoute role="doctor">
      <DashboardContent />
    </ProtectedRoute>
  );
}
