import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import WebcamCapture from "../../components/WebcamCapture";
import VisionChart, { DirectionPad, randomDirection } from "../../components/VisionChart";
import { api } from "../../lib/api";

const TRIALS_PER_EYE = 8;
const START_SIZE = 3;
const MIN_SIZE = 1;
const MAX_SIZE = 10;

function nextSize(current, wasCorrect) {
  const step = wasCorrect ? 1 : -1;
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, current + step));
}

function TestContent() {
  const router = useRouter();
  const { session: sessionId } = router.query;

  const [phase, setPhase] = useState("right"); // right -> left -> done
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentSize, setCurrentSize] = useState(START_SIZE);
  const [currentDirection, setCurrentDirection] = useState(() => randomDirection());
  const [responses, setResponses] = useState({ right: [], left: [] });
  const [lineSizes, setLineSizes] = useState({ right: [], left: [] });
  const [reliability, setReliability] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  const handleReliabilityReport = useCallback((report) => {
    setReliability(report);
  }, []);

  const handleAnswer = useCallback(
    async (answer) => {
      const wasCorrect = answer === currentDirection;
      const eye = phase;

      const newResponses = { ...responses, [eye]: [...responses[eye], wasCorrect] };
      const newSizes = { ...lineSizes, [eye]: [...lineSizes[eye], currentSize] };
      setResponses(newResponses);
      setLineSizes(newSizes);

      const isLastTrial = trialIndex + 1 >= TRIALS_PER_EYE;

      if (!isLastTrial) {
        setCurrentSize(nextSize(currentSize, wasCorrect));
        setCurrentDirection(randomDirection());
        setTrialIndex(trialIndex + 1);
        return;
      }

      // finished this eye: submit its result
      setSubmitting(true);
      setError("");
      try {
        const result = await api.submitResult(sessionId, {
          eye,
          responses: newResponses[eye],
          line_sizes: newSizes[eye],
        });

        if (eye === "right") {
          setPhase("left");
          setTrialIndex(0);
          setCurrentSize(START_SIZE);
          setCurrentDirection(randomDirection());
          setSubmitting(false);
        } else {
          const session = await api.completeSession(sessionId);
          setSummary({ leftResult: result, session });
          setPhase("done");
          setSubmitting(false);
        }
      } catch (e) {
        setError(e.message);
        setSubmitting(false);
      }
    },
    [currentDirection, currentSize, lineSizes, phase, responses, sessionId, trialIndex]
  );

  if (!sessionId) {
    return (
      <div className="container">
        <p>No active session. Go back to the dashboard and start a new screening.</p>
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
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                Session reliability score: {summary.session.reliability_score ?? "n/a"} (based on
                camera monitoring during the test)
              </p>
            )}
            <button className="btn" onClick={() => router.push("/patient/dashboard")}>
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>
              Testing: {phase === "right" ? "Right eye" : "Left eye"} — cover your{" "}
              {phase === "right" ? "left" : "right"} eye
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Trial {trialIndex + 1} of {TRIALS_PER_EYE}. Click the arrow matching the direction
              the "E" is facing.
            </p>
            <VisionChart sizeIndex={currentSize} direction={currentDirection} />
            <DirectionPad onAnswer={handleAnswer} disabled={submitting} />
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Camera monitoring</h3>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              We check face position and eye visibility periodically to flag unreliable results.
              Nothing is stored except a reliability score.
            </p>
            <WebcamCapture sessionId={sessionId} onReport={handleReliabilityReport} />
            {reliability && (
              <div style={{ marginTop: 12, fontSize: 13 }}>
                <div>
                  Face detected:{" "}
                  <span className={reliability.face_detected ? "badge badge-success" : "badge badge-danger"}>
                    {reliability.face_detected ? "yes" : "no"}
                  </span>
                </div>
                <div style={{ marginTop: 4 }}>
                  Reliability score:{" "}
                  <strong>{(reliability.reliability_score * 100).toFixed(0)}%</strong>
                </div>
                {reliability.notes && reliability.notes.length > 0 && (
                  <ul style={{ fontSize: 12, color: "var(--muted)", paddingLeft: 18 }}>
                    {reliability.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
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
