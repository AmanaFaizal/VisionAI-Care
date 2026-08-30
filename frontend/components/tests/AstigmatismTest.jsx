import { useState, useCallback } from "react";
import { api } from "../../lib/api";

export default function AstigmatismTest({ sessionId, onComplete }) {
  const [phase, setPhase] = useState("right");
  const [responses, setResponses] = useState({ right: [], left: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAnswer = useCallback(
    async (answer) => {
      // answer is a boolean: true if they see darker lines (astigmatism), false if all look the same
      const eye = phase;
      const newResponses = { ...responses, [eye]: [answer] };
      setResponses(newResponses);

      setSubmitting(true);
      setError("");
      try {
        await api.submitResult(sessionId, {
          eye,
          responses: newResponses[eye],
          line_sizes: [1], // placeholder
        });

        if (eye === "right") {
          setPhase("left");
          setSubmitting(false);
        } else {
          onComplete();
        }
      } catch (e) {
        setError(e.message);
        setSubmitting(false);
      }
    },
    [phase, responses, sessionId, onComplete]
  );

  return (
    <div className="card max-w-lg mx-auto mt-12 text-center">
      <h3 className="font-serif text-2xl text-navy mb-4">Astigmatism Test</h3>
      <h4 className="font-semibold text-lg mb-2">
        Testing: {phase === "right" ? "Right eye" : "Left eye"} — cover your{" "}
        {phase === "right" ? "left" : "right"} eye
      </h4>
      <p className="text-gray-600 mb-8">
        Look at the center of the dial below. Do some of the lines appear significantly darker or thicker than the others?
      </p>

      {/* SVG Dial for Astigmatism */}
      <div className="flex justify-center mb-10">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="95" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 100 + Math.cos(angle) * 20;
            const y1 = 100 + Math.sin(angle) * 20;
            const x2 = 100 + Math.cos(angle) * 90;
            const y2 = 100 + Math.sin(angle) * 90;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="100" cy="100" r="5" fill="#1e293b" />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="btn bg-white text-navy border-2 border-navy hover:bg-gray-50"
          onClick={() => handleAnswer(false)}
          disabled={submitting}
        >
          No, they look the same
        </button>
        <button
          className="btn"
          onClick={() => handleAnswer(true)}
          disabled={submitting}
        >
          Yes, some are darker
        </button>
      </div>
      {error && <p className="error-text mt-4">{error}</p>}
    </div>
  );
}
