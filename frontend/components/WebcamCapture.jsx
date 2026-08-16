import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "../lib/api";

/**
 * Captures webcam frames on an interval, sends them to the backend
 * CV reliability endpoint (OpenCV + MediaPipe face/eye monitoring),
 * and reports the latest reliability reading up to the parent via
 * onReport. Purely a monitoring signal - never blocks the test.
 */
export default function WebcamCapture({ sessionId, intervalMs = 4000, onReport }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setActive(true);
      } catch (err) {
        setError(
          "Could not access the camera. Check browser permissions and try again. (" +
            err.message +
            ")"
        );
      }
    }

    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureAndSend = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !sessionId) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const base64 = dataUrl.split(",")[1];

    try {
      const report = await api.reliabilityCheck(sessionId, base64, 40.0);
      onReport && onReport(report);
    } catch (err) {
      // Non-fatal: monitoring hiccup shouldn't interrupt the test.
      console.warn("reliability check failed", err.message);
    }
  }, [sessionId, onReport]);

  useEffect(() => {
    if (!active || !sessionId) return;
    const id = setInterval(captureAndSend, intervalMs);
    // fire one right away too
    const t = setTimeout(captureAndSend, 800);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [active, sessionId, intervalMs, captureAndSend]);

  return (
    <div>
      <div className="webcam-wrap">
        <video ref={videoRef} autoPlay playsInline muted />
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
