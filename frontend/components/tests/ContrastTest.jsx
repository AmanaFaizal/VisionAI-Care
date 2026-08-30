import { useState, useCallback } from "react";
import { api } from "../../lib/api";

const OPACITY_LEVELS = [
  { level: 1, value: "opacity-100", letter: "C" },
  { level: 2, value: "opacity-75", letter: "O" },
  { level: 3, value: "opacity-50", letter: "D" },
  { level: 4, value: "opacity-25", letter: "E" },
  { level: 5, value: "opacity-10", letter: "R" },
];

const CHOICES = ["C", "O", "D", "E", "R", "S", "T", "P"];

export default function ContrastTest({ sessionId, onComplete }) {
  const [phase, setPhase] = useState("right");
  const [levelIndex, setLevelIndex] = useState(0);
  const [responses, setResponses] = useState({ right: [], left: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAnswer = useCallback(
    async (answer) => {
      const isCorrect = answer === OPACITY_LEVELS[levelIndex].letter;
      const eye = phase;
      const newResponses = { ...responses, [eye]: [...responses[eye], isCorrect] };
      setResponses(newResponses);

      const isLastLevel = levelIndex + 1 >= OPACITY_LEVELS.length;

      if (!isLastLevel) {
        setLevelIndex(levelIndex + 1);
        return;
      }

      setSubmitting(true);
      setError("");
      try {
        await api.submitResult(sessionId, {
          eye,
          responses: newResponses[eye],
          line_sizes: OPACITY_LEVELS.map(l => l.level),
        });

        if (eye === "right") {
          setPhase("left");
          setLevelIndex(0);
          setSubmitting(false);
        } else {
          onComplete();
        }
      } catch (e) {
        setError(e.message);
        setSubmitting(false);
      }
    },
    [levelIndex, phase, responses, sessionId, onComplete]
  );

  return (
    <div className="card max-w-lg mx-auto mt-12 text-center">
      <h3 className="font-serif text-2xl text-navy mb-4">Contrast Sensitivity Test</h3>
      <h4 className="font-semibold text-lg mb-2">
        Testing: {phase === "right" ? "Right eye" : "Left eye"} — cover your{" "}
        {phase === "right" ? "left" : "right"} eye
      </h4>
      <p className="text-gray-600 mb-8">
        Select the letter you see in the box. The letters will become fainter.
      </p>

      <div className="w-48 h-48 mx-auto mb-8 flex items-center justify-center border border-gray-200 bg-white shadow-sm rounded-xl">
        <span className={`text-8xl font-bold text-gray-900 ${OPACITY_LEVELS[levelIndex].value}`}>
          {OPACITY_LEVELS[levelIndex].letter}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            className="btn bg-gray-100 text-gray-800 border-none hover:bg-gray-200 text-xl font-bold"
            onClick={() => handleAnswer(choice)}
            disabled={submitting}
          >
            {choice}
          </button>
        ))}
      </div>
      {error && <p className="error-text mt-4">{error}</p>}
    </div>
  );
}
