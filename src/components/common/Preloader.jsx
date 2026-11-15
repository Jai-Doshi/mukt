import React, { useState, useEffect, useRef } from "react";

const RELATABLE_PHRASES = [
  "Tracking every rupee borrowed and repaid...",
  "Calibrating dual currencies and daily exchange rates...",
  "Forecasting your debt-free milestone...",
  "Keeping your financial ledger 100% private...",
];

export function Preloader({ onFinish, minDuration = 1200 }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    // Rotate through relatable phrases
    const phraseInterval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % RELATABLE_PHRASES.length);
    }, 600);

    // Minimum display time for smooth experience
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onFinishRef.current?.();
      }, 400);
    }, minDuration);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(timer);
    };
  }, [minDuration]);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinishRef.current?.();
    }, 150);
  };

  return (
    <div
      role="status"
      aria-label="Loading Mukt"
      onClick={handleDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#080a0e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? "scale(1.03)" : "scale(1)",
        pointerEvents: isFadingOut ? "none" : "auto",
        userSelect: "none",
        cursor: "pointer",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "preloaderPulse 2.4s ease-in-out infinite",
        }}
      />

      {/* Main Animated Mukt Emblem */}
      <div
        style={{
          position: "relative",
          width: "76px",
          height: "76px",
          borderRadius: "22px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 12px 36px rgba(16, 185, 129, 0.35)",
          marginBottom: "24px",
          animation: "preloaderBounce 2s ease-in-out infinite",
        }}
      >
        <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
          <path
            className="preloader-ring"
            d="M24 13 A11 11 0 1 1 13 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: "76",
              strokeDashoffset: "76",
              animation: "preloaderRing 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards",
            }}
          />
          <circle
            className="preloader-dot"
            cx="16.2"
            cy="16.2"
            r="2.6"
            fill="#ffffff"
            style={{
              animation: "preloaderDot 0.4s 0.8s ease-out forwards",
              opacity: 0,
            }}
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#f8fafc",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        mukt
      </div>

      <div
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.45)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "24px",
        }}
      >
        Education Loan Tracker
      </div>

      {/* Dynamic Relatable Status Text */}
      <div
        key={phraseIdx}
        style={{
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--accent, #10b981)",
          textAlign: "center",
          maxWidth: "300px",
          height: "24px",
          animation: "fadeInPhrase 0.35s ease forwards",
        }}
      >
        {RELATABLE_PHRASES[phraseIdx]}
      </div>
      <br></br>

      {/* Slim indeterminate progress track */}
      <div
        style={{
          width: "140px",
          height: "3px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "999px",
          marginTop: "16px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "50%",
            backgroundColor: "#10b981",
            borderRadius: "999px",
            animation: "preloaderShimmer 1.2s infinite ease-in-out",
          }}
        />
      </div>

      <style>{`
        @keyframes preloaderRing {
          to { stroke-dashoffset: 0; }
        }
        @keyframes preloaderDot {
          from { opacity: 0; transform: scale(0.2); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes preloaderPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes preloaderBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes preloaderShimmer {
          0% { left: -50%; }
          100% { left: 100%; }
        }
        @keyframes fadeInPhrase {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
