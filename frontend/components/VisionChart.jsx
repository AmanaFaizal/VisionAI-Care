import { useMemo } from "react";

const ARROWS = {
  up: "⬆",
  down: "⬇",
  left: "⬅",
  right: "➡",
};

const DIRECTIONS = Object.keys(ARROWS);

const SNELLEN_DENOMINATORS = {
  1: 200,
  2: 160,
  3: 125,
  4: 100,
  5: 80,
  6: 63,
  7: 50,
  8: 40,
  9: 25,
  10: 20,
};

const LEGACY_SIZE_TO_PX = {
  1: 180, 2: 150, 3: 125, 4: 105, 5: 88, 6: 74, 7: 62, 8: 52, 9: 44, 10: 36,
};

export function randomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

export default function VisionChart({ sizeIndex, direction, pixelsPerMm }) {
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

  let px;
  if (pixelsPerMm) {
    // Exact Snellen math for 1 meter distance: 
    // Height = 2 * 1000mm * tan(5 arcmin / 2) -> ~1.454 * (denominator / 20)
    const denominator = SNELLEN_DENOMINATORS[sizeIndex] || 20;
    const heightMm = 1.454 * (denominator / 20);
    px = heightMm * pixelsPerMm;
  } else {
    px = LEGACY_SIZE_TO_PX[sizeIndex] || 60;
  }

  return (
    <div className="optotype" style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", margin: "20px 0" }}>
      <div style={{ fontSize: px, fontFamily: "monospace", fontWeight: 900, lineHeight: 1, userSelect: "none", transform: rotation }}>
        E
      </div>
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
