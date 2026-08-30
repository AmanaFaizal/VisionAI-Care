import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api } from "../../lib/api";

import AcuityTest from "../../components/tests/AcuityTest";
import ColorTest from "../../components/tests/ColorTest";
import AstigmatismTest from "../../components/tests/AstigmatismTest";
import ContrastTest from "../../components/tests/ContrastTest";

function TestContent() {
  const router = useRouter();
  const { session, type } = router.query;
  const [sessionId, setSessionId] = useState(session);
  const [testType, setTestType] = useState(type || "acuity");
  
  const [phase, setPhase] = useState("test"); // test -> symptoms -> done
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [symptomsInput, setSymptomsInput] = useState("");

  useEffect(() => {
    if (session) {
      setSessionId(session);
    } else if (type && !sessionId) {
      // Auto-start a session if we arrived via a specific test link but have no session yet
      api.startSession(type).then(s => {
        setSessionId(s.id);
        setTestType(type);
      }).catch(e => setError(e.message));
    }
  }, [session, type, sessionId]);

  async function handleCompleteSession() {
    setSubmitting(true);
    setError("");
    try {
      const symptomsList = symptomsInput.split(',').map(s => s.trim()).filter(Boolean);
      const sessionData = await api.completeSession(sessionId, symptomsList);
      setSummary({ session: sessionData });
      setPhase("done");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !sessionId) {
    return (
      <div className="container mt-12">
        <p className="error-text">Error starting test: {error}</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="container mt-12 text-center">
        <p>Loading session...</p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Screening complete</h2>
            <p>
              Thanks — your results have been sent to a doctor for review. You'll see their notes
              on your dashboard once reviewed.
            </p>
            {summary && summary.session && (
              <div style={{ marginTop: 24, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border)" }}>
                <h3 style={{ marginTop: 0 }}>AI Screening Result</h3>
                <p><strong>Recommendation:</strong> {summary.session.ai_recommendation}</p>
                {summary.session.ai_explanation && (
                  <p style={{ fontStyle: "italic", color: "var(--text)", marginTop: 8 }}>
                    "{summary.session.ai_explanation}"
                  </p>
                )}
                {summary.session.ai_factors && summary.session.ai_factors.length > 0 && (
                  <ul style={{ fontSize: 13, color: "var(--muted)", paddingLeft: 18 }}>
                    {summary.session.ai_factors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                )}
                <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid var(--border)" }} />
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  Session reliability score: {summary.session.reliability_score ?? "n/a"} (based on
                  camera monitoring during the test)
                </p>
              </div>
            )}
            <button className="btn" style={{ marginTop: 16 }} onClick={() => router.push("/")}>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "symptoms") {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Report Symptoms</h2>
            <p style={{ color: "var(--muted)" }}>
              Please list any symptoms you are experiencing (e.g. blurred vision, headaches, eye pain), separated by commas.
              Leave blank if none.
            </p>
            <input 
              value={symptomsInput} 
              onChange={e => setSymptomsInput(e.target.value)} 
              placeholder="blurred vision, headaches..." 
              className="w-full mt-4 px-4 py-2 border rounded-lg"
            />
            {error && <p className="error-text">{error}</p>}
            <button className="btn mt-4" onClick={handleCompleteSession} disabled={submitting}>
              {submitting ? "Submitting..." : "Complete Screening"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Test Phase
  return (
    <div>
      <Navbar />
      <div className="container">
        {testType === "acuity" && <AcuityTest sessionId={sessionId} onComplete={() => setPhase("symptoms")} />}
        {testType === "color" && <ColorTest sessionId={sessionId} onComplete={() => setPhase("symptoms")} />}
        {testType === "astigmatism" && <AstigmatismTest sessionId={sessionId} onComplete={() => setPhase("symptoms")} />}
        {testType === "contrast" && <ContrastTest sessionId={sessionId} onComplete={() => setPhase("symptoms")} />}
      </div>
    </div>
  );
}

export default function PatientTest() {
  return (
    <ProtectedRoute role="patient">
      <TestContent />
    </ProtectedRoute>
  );
}
