import { useState, useCallback } from "react";
import WebcamCapture from "../WebcamCapture";
import VisionChart, { DirectionPad, randomDirection } from "../VisionChart";
import { api } from "../../lib/api";

const TRIALS_PER_EYE = 8;
const START_SIZE = 3;
const MIN_SIZE = 1;
const MAX_SIZE = 10;

function nextSize(current, wasCorrect) {
  const step = wasCorrect ? 1 : -1;
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, current + step));
}

export default function AcuityTest({ sessionId, onComplete }) {
  const [phase, setPhase] = useState("calibration"); // calibration -> right -> left
  const [pixelsPerMm, setPixelsPerMm] = useState(300 / 85.6);
  const [sliderValue, setSliderValue] = useState(300);

  const [trialIndex, setTrialIndex] = useState(0);
  const [currentSize, setCurrentSize] = useState(START_SIZE);
  const [currentDirection, setCurrentDirection] = useState(() => randomDirection());
  const [responses, setResponses] = useState({ right: [], left: [] });
  const [lineSizes, setLineSizes] = useState({ right: [], left: [] });
  const [reliability, setReliability] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReliabilityReport = useCallback((report) => {
    setReliability(report);
  }, []);

  const saveCalibration = () => {
    setPixelsPerMm(sliderValue / 85.6);
    setPhase("right");
  };

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

      setSubmitting(true);
      setError("");
      try {
        await api.submitResult(sessionId, {
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
          onComplete(); // move to symptoms phase in parent
        }
      } catch (e) {
        setError(e.message);
        setSubmitting(false);
      }
    },
    [currentDirection, currentSize, lineSizes, phase, responses, sessionId, trialIndex, onComplete]
  );

  if (phase === "calibration") {
    return (
      <div className="card max-w-xl mx-auto mt-12 text-center">
        <h2 className="text-2xl font-serif text-navy mb-4">Step 1: Screen Calibration</h2>
        <p className="text-gray-600 mb-6">
          Hold a standard credit/ID card up to the screen. Adjust the slider until the blue rectangle matches the exact width of your card.
        </p>
        
        <div style={{ width: `${sliderValue}px`, height: `${sliderValue / 1.586}px` }} 
             className="bg-blue-500 rounded-xl mx-auto flex items-center justify-center text-white font-bold shadow-sm transition-all duration-75">
          Standard Card (85.6 mm)
        </div>
        
        <div className="mt-8 mb-8">
          <input 
            type="range" 
            min="150" 
            max="600" 
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            className="w-full max-w-sm"
          />
        </div>
        
        <button className="btn" onClick={saveCalibration}>Confirm & Start Test</button>
      </div>
    );
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>
          Testing: {phase === "right" ? "Right eye" : "Left eye"} — cover your{" "}
          {phase === "right" ? "left" : "right"} eye
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          Sit approximately <strong>1 meter (3.3 feet)</strong> away. Trial {trialIndex + 1} of {TRIALS_PER_EYE}. Click the arrow matching the direction the "E" is facing.
        </p>
        <VisionChart sizeIndex={currentSize} direction={currentDirection} pixelsPerMm={pixelsPerMm} />
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
  );
}
