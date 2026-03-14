// components/resultcard.jsx
import { useState } from "react";
import OriginBar    from "./OriginBar.jsx";

export default function ResultCard({ result, onReset }) {

  const { score, hash, certified, filename } = result;

  const [copied, setCopied] = useState(false);

  // ==============================
  // Copy hash to clipboard
  // ==============================

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==============================
  // Download certificate
  // ==============================

  const handleDownload = () => {
    const certData = {
      id:        `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, "0")}`,
      filename,
      hash,
      score,
      certified,
      date:      new Date().toLocaleDateString("en-US", {
        year:  "numeric",
        month: "long",
        day:   "numeric",
      }),
      network:   "Ethereum Sepolia Testnet",
      issuedBy:  "ArtChain Protocol",
    };

    // Create downloadable JSON file
    const blob = new Blob(
      [JSON.stringify(certData, null, 2)],
      { type: "application/json" }
    );

    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `artchain-certificate-${certData.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-up">

      {/* ==============================
          Main Result Card
          ============================== */}

      <div
        className="card glow-card"
        style={{
          padding:      32,
          textAlign:    "center",
          marginBottom: 20,
          border:       `1px solid ${
            certified
              ? "rgba(0,255,200,0.4)"
              : "rgba(255,68,102,0.4)"
          }`,
          position:     "relative",
          overflow:     "hidden",
        }}
      >

        {/* ==============================
            Watermark
            ============================== */}

        <div
          style={{
            position:      "absolute",
            top:           "50%",
            left:          "50%",
            transform:     "translate(-50%, -50%) rotate(-30deg)",
            fontSize:      60,
            fontFamily:    "var(--font-display)",
            fontWeight:    900,
            color:         certified
              ? "rgba(0,255,200,0.04)"
              : "rgba(255,68,102,0.04)",
            letterSpacing: 8,
            whiteSpace:    "nowrap",
            pointerEvents: "none",
            userSelect:    "none",
          }}
        >
          {certified ? "CERTIFIED" : "FLAGGED"}
        </div>

        {/* ==============================
            Status Icon
            ============================== */}

        <div
          style={{
            fontSize:     56,
            marginBottom: 12,
            filter:       certified
              ? "drop-shadow(0 0 12px #00ffcc)"
              : "drop-shadow(0 0 12px #ff4466)",
          }}
        >
          {certified ? "✦" : "⚠"}
        </div>

        {/* ==============================
            Status Title
            ============================== */}

        <div
          style={{
            fontFamily:    "var(--font-display)",
            fontSize:      22,
            fontWeight:    900,
            color:         certified
              ? "var(--accent)"
              : "var(--danger)",
            letterSpacing: 4,
            marginBottom:  8,
          }}
        >
          {certified ? "CERTIFIED ORIGINAL" : "SIMILARITY DETECTED"}
        </div>

        {/* ==============================
            Subtitle
            ============================== */}

        <div
          style={{
            fontSize:     12,
            color:        "var(--text-muted)",
            marginBottom: 20,
          }}
        >
          {certified
            ? "This artwork has been verified as original and recorded on the blockchain."
            : "This artwork shows similarity to existing works. Review recommended."}
        </div>

        {/* ==============================
            File Name
            ============================== */}

        {filename && (
          <div
            style={{
              fontSize:     12,
              color:        "#556677",
              marginBottom: 12,
              padding:      "6px 14px",
              background:   "rgba(0,255,200,0.03)",
              border:       "1px solid rgba(0,255,200,0.08)",
              borderRadius: 6,
              display:      "inline-block",
            }}
          >
            📄 {filename}
          </div>
        )}

        {/* ==============================
            Blockchain Hash
            ============================== */}

        <div
          style={{
            fontSize:     11,
            color:        "#445566",
            marginBottom: 20,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            gap:          8,
          }}
        >
          <span>Blockchain Hash:</span>
          <span
            style={{
              color:      "rgba(0,255,200,0.6)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {hash}
          </span>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            style={{
              background:   "transparent",
              border:       "1px solid rgba(0,255,200,0.2)",
              borderRadius: 4,
              padding:      "2px 8px",
              color:        copied ? "var(--accent)" : "var(--text-muted)",
              fontSize:     10,
              cursor:       "pointer",
              fontFamily:   "var(--font-display)",
              letterSpacing: 1,
              transition:   "all 0.2s ease",
            }}
          >
            {copied ? "✓ COPIED" : "⎘ COPY"}
          </button>
        </div>

        {/* ==============================
            Originality Score Bar
            ============================== */}

        <OriginBar value={score} />

        {/* ==============================
            Stats Row
            ============================== */}

        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap:                 12,
            marginTop:           20,
            padding:             "16px 0",
            borderTop:           "1px solid rgba(0,255,200,0.08)",
          }}
        >
          {[
            {
              label: "SCORE",
              value: `${score}/100`,
            },
            {
              label: "STATUS",
              value: certified ? "CERTIFIED" : "FLAGGED",
            },
            {
              label: "NETWORK",
              value: "SEPOLIA",
            },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize:      9,
                  color:         "var(--text-muted)",
                  letterSpacing: 2,
                  fontFamily:    "var(--font-display)",
                  marginBottom:  4,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize:   13,
                  color:      "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ==============================
          Action Buttons
          ============================== */}

      <div style={{ display: "flex", gap: 12 }}>

        {/* Download Button */}
        <button
          className="btn-primary"
          onClick={handleDownload}
        >
          ⬇ DOWNLOAD CERTIFICATE
        </button>

        {/* Verify Another Button */}
        <button
          className="btn-secondary"
          onClick={onReset}
        >
          ↺ VERIFY ANOTHER
        </button>

      </div>

    </div>
  );
}


// What each part does
