// components/StepProgress.jsx
import { useState, useEffect } from "react";

// ==============================
// Step Data
// ==============================

const STEPS = [
  {
    id:    1,
    label: "Upload",
    icon:  "⬆",
    desc:  "Submit your artwork",
  },
  {
    id:    2,
    label: "Analyze",
    icon:  "🔍",
    desc:  "AI checks originality",
  },
  {
    id:    3,
    label: "Verify",
    icon:  "⛓",
    desc:  "Stored on blockchain",
  },
  {
    id:    4,
    label: "Certified",
    icon:  "✦",
    desc:  "Certificate issued",
  },
];

export default function StepProgress({ currentStep }) {

  const [animated, setAnimated] = useState(false);

  // ==============================
  // Trigger animation on mount
  // ==============================

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        marginBottom: 40,
        padding:      "20px 24px",
        background:   "rgba(0,255,200,0.02)",
        border:       "1px solid rgba(0,255,200,0.08)",
        borderRadius: 12,
        opacity:      animated ? 1 : 0,
        transform:    animated ? "translateY(0)" : "translateY(10px)",
        transition:   "all 0.4s ease",
      }}
    >
      {STEPS.map((s, i) => (
        <div
          key={s.id}
          style={{
            display:    "flex",
            alignItems: "center",
            flex:       i < STEPS.length - 1 ? 1 : "none",
          }}
        >

          {/* ==============================
              Step Item
              ============================== */}

          <div style={{ textAlign: "center" }}>

            {/* ==============================
                Step Dot
                ============================== */}

            <div
              className={`step-dot
                ${currentStep === i ? "active" : ""}
                ${currentStep > i  ? "done"   : ""}
              `}
              style={{
                position: "relative",
              }}
            >

              {/* Pulse ring for active step */}
              {currentStep === i && (
                <div
                  style={{
                    position:     "absolute",
                    top:          -4,
                    left:         -4,
                    right:        -4,
                    bottom:       -4,
                    borderRadius: "50%",
                    border:       "1px solid rgba(0,255,200,0.3)",
                    animation:    "pulse 2s infinite",
                  }}
                />
              )}

              {/* Icon or checkmark */}
              {currentStep > i ? "✓" : s.icon}

            </div>

            {/* ==============================
                Step Label
                ============================== */}

            <div
              style={{
                fontSize:      10,
                color:         currentStep >= i
                  ? "var(--accent)"
                  : "var(--text-muted)",
                letterSpacing: 1,
                fontFamily:    "var(--font-display)",
                marginBottom:  2,
                transition:    "color 0.3s ease",
              }}
            >
              {s.label}
            </div>

            {/* ==============================
                Step Description
                Only shows for active step
                ============================== */}

            <div
              style={{
                fontSize:   9,
                color:      currentStep === i
                  ? "rgba(0,255,200,0.5)"
                  : "transparent",
                fontFamily: "var(--font-body)",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
            >
              {s.desc}
            </div>

          </div>

          {/* ==============================
              Connector Line
              Between steps
              ============================== */}

          {i < STEPS.length - 1 && (
            <div
              style={{
                flex:       1,
                height:     1,
                margin:     "0 12px",
                marginBottom: 20,
                position:   "relative",
                background: "#1a2a3a",
                overflow:   "hidden",
              }}
            >
              {/* Filled portion */}
              <div
                style={{
                  position:   "absolute",
                  top:        0,
                  left:       0,
                  height:     "100%",
                  width:      currentStep > i ? "100%" : "0%",
                  background: "linear-gradient(90deg, var(--accent), rgba(0,255,200,0.5))",
                  transition: "width 0.8s ease",
                  boxShadow:  "0 0 6px var(--accent)",
                }}
              />
            </div>
          )}

        </div>
      ))}
    </div>
  );
}