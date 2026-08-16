import { useMemo } from "react";

const ARROWS = {
  up: "⬆",
  down: "⬇",
  left: "⬅",
  right: "➡",
};

const DIRECTIONS = Object.keys(ARROWS);

// Tumbling-E style test: size index 1 (largest/easiest) .. 10 (smallest/hardest).
// Font size in px per index - roughly halves in visual size across the range,
// approximating a logMAR-style staircase without needing a licensed eye chart.
const SIZE_TO_PX = {
  1: 180,
  2: 150,
  3: 125,
  4: 105,
  5: 88,
  6: 74,
  7: 62,
  8: 52,
  9: 44,
  10: 36,
};

export function randomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

export default function VisionChart({ sizeIndex, direction }) {
  const rotation = useMemo(() => {
    switch (direction) {
      case "up":
        return "rotate(-90deg)";
      case "down":
        return "rotate(90deg)";
      case "left":
        return "rotate(180deg)";
      default:
        return "rotate(0deg)";
    }
  }, [direction]);

  const px = SIZE_TO_PX[sizeIndex] || 60;

  return (
    <div className="optotype" style={{ fontSize: px }}>
      <span style={{ display: "inline-block", transform: rotation }}>E</span>
    </div>
  );
}

export function DirectionPad({ onAnswer, disabled }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 64px)",
        gridTemplateRows: "repeat(3, 64px)",
        gap: 8,
        justifyContent: "center",
        margin: "24px auto",
      }}
    >
      <div />
      <button className="btn" disabled={disabled} onClick={() => onAnswer("up")}>
        {ARROWS.up}
      </button>
      <div />
      <button className="btn" disabled={disabled} onClick={() => onAnswer("left")}>
        {ARROWS.left}
      </button>
      <div />
      <button className="btn" disabled={disabled} onClick={() => onAnswer("right")}>
        {ARROWS.right}
      </button>
      <div />
      <button className="btn" disabled={disabled} onClick={() => onAnswer("down")}>
        {ARROWS.down}
      </button>
      <div />
    </div>
  );
}
