// pages/Certificate.jsx
import { useState } from "react";
import OriginBar    from "../components/OriginBar.jsx";
import HexGrid      from "../components/HexGrid.jsx";

// ==============================
// Mock Certificate Data
// Replace with real API call
// from backend later
// ==============================

const MOCK_CERT = {
  id:          "CERT-2026-00142",
  title:       "Sunset Abstract #12",
  artist:      "Unknown Artist",
  hash:        "0x3f9a8b2cd4e5f6b24c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
  txHash:      "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1",
  score:       97,
  certified:   true,
  date:        "March 12, 2026",
  network:     "Ethereum Mainnet",
  block:       "19,842,301",
  issuedBy:    "ArtChain Protocol",
};

export default function Certificate() {

  const [cert]    = useState(MOCK_CERT);
  const [copied,   setCopied]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  // ==============================
  // Copy text to clipboard
  // ==============================

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // ==============================
  // Download certificate as JSON
  // ==============================

  const handleDownload = () => {
    setLoading(true);

    setTimeout(() => {
      const blob = new Blob(
        [JSON.stringify(cert, null, 2)],
        { type: "application/json" }
      );

      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `artchain-${cert.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setLoading(false);
    }, 800);
  };

  // ==============================
  // Share certificate link
  // ==============================

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/certificate/${cert.hash}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied("share");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding:   "40px 32px",
        position:  "relative",
      }}
    >

      {/* ==============================
          Page Header
          ============================== */}

      <div
        style={{
          textAlign:    "center",
          marginBottom: 32,
          animation:    "fadeUp 0.4s ease",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily:    "var(--font-display)",
            fontSize:      11,
            color:         "var(--accent)",
            letterSpacing: 4,
            marginBottom:  8,
          }}
        >
          CERTIFICATE OF VERIFICATION
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Issued by ArtChain Protocol · Stored on Ethereum
        </div>
      </div>

      {/* ==============================
          Certificate Card
          ============================== */}

      <div
        style={{
          maxWidth:  700,
          margin:    "0 auto",
          animation: "fadeUp 0.5s ease",
        }}
      >
        <div
          className="card"
          style={{
            padding:      40,
            border:       `1px solid ${
              cert.certified
                ? "rgba(0,255,200,0.3)"
                : "rgba(255,68,102,0.3)"
            }`,
            marginBottom: 24,
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
              fontSize:      70,
              fontFamily:    "var(--font-display)",
              fontWeight:    900,
              color:         cert.certified
                ? "rgba(0,255,200,0.03)"
                : "rgba(255,68,102,0.03)",
              letterSpacing: 8,
              whiteSpace:    "nowrap",
              pointerEvents: "none",
              userSelect:    "none",
            }}
          >
            {cert.certified ? "CERTIFIED" : "FLAGGED"}
          </div>

          {/* ==============================
              Card Header
              Logo + Status Badge
              ============================== */}

          <div
            className="flex-between"
            style={{ marginBottom: 32 }}
          >
            {/* Logo */}
            <div>
              <div
                style={{
                  fontFamily:    "var(--font-display)",
                  fontSize:      20,
                  fontWeight:    900,
                  color:         "var(--accent)",
                  letterSpacing: 3,
                  textShadow:    "0 0 20px rgba(0,255,200,0.3)",
                }}
              >
                ◈ ARTCHAIN
              </div>
              <div
                style={{
                  fontSize:      10,
                  color:         "var(--text-muted)",
                  letterSpacing: 2,
                  marginTop:     2,
                }}
              >
                COPYRIGHT VERIFICATION PROTOCOL
              </div>
            </div>

            {/* Status Badge */}
            <div
              style={{
                fontFamily:    "var(--font-display)",
                fontSize:      11,
                color:         cert.certified
                  ? "var(--accent)"
                  : "var(--danger)",
                border:        `1px solid ${
                  cert.certified
                    ? "rgba(0,255,200,0.3)"
                    : "rgba(255,68,102,0.3)"
                }`,
                padding:       "6px 14px",
                borderRadius:  4,
                letterSpacing: 2,
              }}
            >
              {cert.certified ? "✦ CERTIFIED" : "⚠ FLAGGED"}
            </div>
          </div>

          {/* ==============================
              Certificate ID
              ============================== */}

          <div
            style={{
              background:    "rgba(0,255,200,0.03)",
              border:        "1px solid rgba(0,255,200,0.08)",
              borderRadius:  8,
              padding:       "12px 16px",
              marginBottom:  24,
              fontFamily:    "var(--font-mono)",
              fontSize:      12,
              color:         "var(--accent)",
              letterSpacing: 2,
              display:       "flex",
              justifyContent: "space-between",
              alignItems:    "center",
            }}
          >
            <span>{cert.id}</span>

            {/* Copy ID button */}
            <button
              onClick={() => handleCopy(cert.id, "id")}
              style={{
                background:    "transparent",
                border:        "1px solid rgba(0,255,200,0.2)",
                borderRadius:  4,
                padding:       "2px 8px",
                color:         copied === "id"
                  ? "var(--accent)"
                  : "var(--text-muted)",
                fontSize:      10,
                cursor:        "pointer",
                fontFamily:    "var(--font-display)",
                letterSpacing: 1,
                transition:    "all 0.2s ease",
              }}
            >
              {copied === "id" ? "✓ COPIED" : "⎘ COPY"}
            </button>
          </div>

          {/* ==============================
              Details Grid
              ============================== */}

          <div
            style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 20,
              marginBottom:        24,
            }}
          >
            {[
              { label: "ARTWORK TITLE", value: cert.title   },
              { label: "ARTIST",        value: cert.artist  },
              { label: "DATE ISSUED",   value: cert.date    },
              { label: "NETWORK",       value: cert.network },
              { label: "BLOCK NUMBER",  value: cert.block   },
              { label: "ISSUED BY",     value: cert.issuedBy },
            ].map((item) => (
              <div key={item.label}>
                {/* Label */}
                <div
                  style={{
                    fontSize:      9,
                    color:         "var(--text-muted)",
                    letterSpacing: 2,
                    fontFamily:    "var(--font-display)",
                    marginBottom:  4,
                  }}
                >
                  {item.label}
                </div>

                {/* Value */}
                <div
                  style={{
                    fontSize: 13,
                    color:    "var(--text-primary)",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ==============================
              Image Hash
              ============================== */}

          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize:      9,
                color:         "var(--text-muted)",
                letterSpacing: 2,
                fontFamily:    "var(--font-display)",
                marginBottom:  6,
              }}
            >
              IMAGE HASH
            </div>

            <div
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                background:   "rgba(0,255,200,0.02)",
                border:       "1px solid rgba(0,255,200,0.08)",
                borderRadius: 6,
                padding:      "10px 14px",
              }}
            >
              <span
                style={{
                  fontFamily:   "var(--font-mono)",
                  fontSize:     11,
                  color:        "rgba(0,255,200,0.6)",
                  wordBreak:    "break-all",
                  flex:         1,
                }}
              >
                {cert.hash}
              </span>

              {/* Copy Hash Button */}
              <button
                onClick={() => handleCopy(cert.hash, "hash")}
                style={{
                  background:    "transparent",
                  border:        "1px solid rgba(0,255,200,0.2)",
                  borderRadius:  4,
                  padding:       "2px 8px",
                  color:         copied === "hash"
                    ? "var(--accent)"
                    : "var(--text-muted)",
                  fontSize:      10,
                  cursor:        "pointer",
                  fontFamily:    "var(--font-display)",
                  letterSpacing: 1,
                  transition:    "all 0.2s ease",
                  whiteSpace:    "nowrap",
                }}
              >
                {copied === "hash" ? "✓ COPIED" : "⎘ COPY"}
              </button>
            </div>
          </div>

          {/* ==============================
              Transaction Hash
              ============================== */}

          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize:      9,
                color:         "var(--text-muted)",
                letterSpacing: 2,
                fontFamily:    "var(--font-display)",
                marginBottom:  6,
              }}
            >
              TRANSACTION HASH
            </div>

            <div
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                background:   "rgba(0,255,200,0.02)",
                border:       "1px solid rgba(0,255,200,0.08)",
                borderRadius: 6,
                padding:      "10px 14px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize:   11,
                  color:      "rgba(0,255,200,0.6)",
                  wordBreak:  "break-all",
                  flex:       1,
                }}
              >
                {cert.txHash}
              </span>

              {/* Copy TX Hash Button */}
              <button
                onClick={() => handleCopy(cert.txHash, "txHash")}
                style={{
                  background:    "transparent",
                  border:        "1px solid rgba(0,255,200,0.2)",
                  borderRadius:  4,
                  padding:       "2px 8px",
                  color:         copied === "txHash"
                    ? "var(--accent)"
                    : "var(--text-muted)",
                  fontSize:      10,
                  cursor:        "pointer",
                  fontFamily:    "var(--font-display)",
                  letterSpacing: 1,
                  transition:    "all 0.2s ease",
                  whiteSpace:    "nowrap",
                }}
              >
                {copied === "txHash" ? "✓ COPIED" : "⎘ COPY"}
              </button>
            </div>
          </div>

          {/* ==============================
              Originality Score
              ============================== */}

          <OriginBar value={cert.score} />

          {/* ==============================
              Footer
              ============================== */}

          <div
            style={{
              marginTop:    24,
              paddingTop:   16,
              borderTop:    "1px solid rgba(0,255,200,0.08)",
              fontSize:     10,
              color:        "var(--text-muted)",
              textAlign:    "center",
              letterSpacing: 1,
              lineHeight:   1.6,
            }}
          >
            This certificate is immutably recorded on the Ethereum
            blockchain and cannot be altered or forged.
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
            disabled={loading}
          >
            {loading ? "PREPARING..." : "⬇ DOWNLOAD PDF"}
          </button>

          {/* Share Button */}
          <button
            className="btn-secondary"
            onClick={handleShare}
          >
            {copied === "share" ? "✓ LINK COPIED" : "⎘ COPY LINK"}
          </button>

          {/* Etherscan Button */}
          <button
            className="btn-ghost"
            onClick={() => window.open(
              `https://sepolia.etherscan.io/tx/${cert.txHash}`,
              "_blank"
            )}
          >
            ↗ ETHERSCAN
          </button>

        </div>

      </div>
    </div>
  );
}