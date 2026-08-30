import { useState, useCallback } from "react";
import { api } from "../../lib/api";

const PLATES = [
  { id: 1, correct: "5", dotColor: "bg-green-600", numColor: "bg-orange-500" },
  { id: 2, correct: "2", dotColor: "bg-green-600", numColor: "bg-red-500" },
  { id: 3, correct: "7", dotColor: "bg-yellow-600", numColor: "bg-green-600" },
  { id: 4, correct: "8", dotColor: "bg-green-600", numColor: "bg-red-500" },
  { id: 5, correct: "6", dotColor: "bg-green-600", numColor: "bg-orange-500" },
];

const CHOICES = ["2", "3", "5", "6", "7", "8", "Nothing"];

export default function ColorTest({ sessionId, onComplete }) {
  const [phase, setPhase] = useState("testing"); // testing, summary
  const [plateIndex, setPlateIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAnswer = useCallback(async (answer) => {
    const isCorrect = answer === PLATES[plateIndex].correct;
    const newResponses = [...responses, isCorrect];
    setResponses(newResponses);

    const isLastPlate = plateIndex + 1 >= PLATES.length;

    if (!isLastPlate) {
      setPlateIndex(plateIndex + 1);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.submitResult(sessionId, {
        eye: "both",
        responses: newResponses,
        line_sizes: PLATES.map((p) => p.id),
      });
      setPhase("summary");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [plateIndex, responses, sessionId]);

  if (phase === "summary") {
    const correctCount = responses.filter(Boolean).length;
    return (
      <div className="card max-w-3xl mx-auto mt-12">
        <h2 className="text-3xl font-serif text-navy mb-6">Color Vision Test Complete</h2>
        <div className="bg-green-50 text-green-800 p-6 rounded-lg mb-8 border border-green-200">
          <h3 className="text-xl font-bold mb-2">Plates identified correctly: {correctCount} / {PLATES.length}</h3>
          <p>
            {correctCount >= 4 
              ? "Your responses are consistent with normal color vision." 
              : "Your responses suggest a possible color vision deficiency."}
          </p>
        </div>
        
        <div className="text-gray-700 space-y-4 mb-8">
          <p>
            Color blindness is usually inherited and affects more men than women. If this screening suggests a deficiency, an eye care professional can confirm the type and severity with clinical tests such as the Farnsworth D-15 or anomaloscope.
          </p>
          <h4 className="font-bold text-lg text-navy mt-6">What Is a Color Blindness Test?</h4>
          <p>
            A color blindness test, also called a color vision test, checks your ability to tell certain colors apart — most often shades of red and green. The best-known screening tool is the Ishihara test, a series of plates made up of colored dots. Within each plate, dots of one color form a number or shape against a background of differently colored dots. People with normal color vision see one number, while those with a color vision deficiency may see a different number, or none at all. This online version recreates that principle so you can screen your color vision from home.
          </p>
          <h4 className="font-bold text-lg text-navy mt-6">What Are Ishihara Plates?</h4>
          <p>
            The Ishihara plates were created by Japanese ophthalmologist Dr. Shinobu Ishihara in 1917 and remain the most widely used test for red-green color blindness. Each plate is a circle of dots in varying sizes, brightness, and colors. The dots are arranged so that a number is visible to people with normal color vision but blends into the background for those with a deficiency. The full clinical set contains 38 plates, while quick screenings use a smaller selection.
          </p>
          <h4 className="font-bold text-lg text-navy mt-6">How the Plates Work</h4>
          <p>
            The test relies on color contrast rather than brightness. By using colors that look similar to someone with red-green color blindness, the hidden number disappears for them — which is what makes the plates an effective screening tool.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="btn" onClick={onComplete}>Continue →</button>
          <button className="btn bg-white text-navy border-2 border-navy hover:bg-gray-50" onClick={() => {
            setPhase("testing");
            setPlateIndex(0);
            setResponses([]);
          }}>
            Retake Color Test
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = ((plateIndex) / PLATES.length) * 100;

  // Generate an Ishihara-like plate using SVG dots
  const renderIshiharaSVG = (correctNumber) => {
    // Generate static dots based on the correctNumber so it doesn't flicker
    const dots = [];
    // We use a simple seeded RNG based on the plate id to keep it consistent
    let seed = PLATES[plateIndex].id;
    const random = () => {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    const radius = 150;
    const padding = 10;
    
    // Draw text on a canvas to read pixel data for hit-testing
    let canvas, ctx;
    if (typeof window !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 320, 320);
      ctx.fillStyle = 'black';
      ctx.font = '900 220px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(correctNumber, 160, 175);
    }

    const isInsideText = (x, y) => {
      if (!ctx) return false;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      return pixel[0] < 150; 
    };

    const colorsBg = ['#7d9150', '#8a9b5a', '#6f8a4a', '#9aa86a'];
    const colorsText = ['#e89a4f', '#d97b2a', '#e08a3c'];

    const spacing = 14.5;
    const jitter = 2.5;
    const maxRadius = 145;

    // Generate hex grid
    for (let row = -15; row <= 15; row++) {
      for (let col = -15; col <= 15; col++) {
        const cx = 160 + col * spacing + (row % 2 === 0 ? spacing / 2 : 0) + (random() - 0.5) * jitter;
        const cy = 160 + row * (spacing * 0.866) + (random() - 0.5) * jitter;
        
        const dx = cx - 160;
        const dy = cy - 160;
        if (dx * dx + dy * dy < maxRadius * maxRadius) {
          const r = 3.5 + random() * 2.5; // Radius between 3.5 and 6
          
          const inText = isInsideText(cx, cy);
          const fill = inText 
            ? colorsText[Math.floor(random() * colorsText.length)]
            : colorsBg[Math.floor(random() * colorsBg.length)];
            
          dots.push({ cx, cy, r, fill });
        }
      }
    }

    return (
      <svg viewBox="0 0 320 320" width="300" height="300" style={{ borderRadius: "50%", background: "rgb(243, 234, 216)", border: "1px solid var(--line)" }}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />
        ))}
      </svg>
    );
  };

  return (
    <div className="card max-w-3xl mx-auto mt-12 p-8" style={{ backgroundColor: "#F7F3EB" }}>
      <h2 className="font-serif text-3xl text-navy mb-8 text-center font-bold">Color Blindness Test (Ishihara Plates)</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8 overflow-hidden">
          <div className="bg-brandOrange h-1.5 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        <p className="text-gray-500 text-sm text-center mb-6">
          Plate {plateIndex + 1} of {PLATES.length}
        </p>

        <div className="flex justify-center mb-8">
          {renderIshiharaSVG(PLATES[plateIndex].correct)}
        </div>

        <p className="text-center font-bold text-navy mb-6">What number do you see?</p>

        <div className="flex flex-wrap justify-center gap-3">
          {CHOICES.map(choice => (
            <button
              key={choice}
              className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-lg font-bold text-navy hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm disabled:opacity-50"
              onClick={() => handleAnswer(choice)}
              disabled={submitting}
            >
              {choice}
            </button>
          ))}
        </div>
        {error && <p className="error-text mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}
