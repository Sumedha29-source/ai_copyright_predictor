// components/AnalyzingState.jsx
export default function AnalyzingState({ phase }) {
  const isAI = phase === "ai";

  return (
    <div className="card fade-up" style={{ padding: 60, textAlign: "center" }}>
      {isAI ? (

        // ==============================
        // AI Analysis Phase
        // Shows spinner and AI message
        // ==============================

        <>
          {/* Spinner */}
          <div className="spinner" style={{ marginBottom: 24 }} />

          {/* Title */}
          <div
            style={{
              fontFamily:   "var(--font-display)",
              fontSize:     16,
              color:        "var(--accent)",
              letterSpacing: 3,
              marginBottom: 8,
            }}
          >
            ANALYZING ARTWORK
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Running AI originality scan · Querying blockchain registry...
          </div>

          {/* Progress Steps */}
          <div style={{ marginTop: 32 }}>
            {[
              "Scanning image pixels...",
              "Checking AI similarity database...",
              "Querying blockchain registry...",
              "Calculating originality score...",
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  fontSize:      11,
                  color:         "var(--text-muted)",
                  padding:       "6px 0",
                  display:       "flex",
                  alignItems:    "center",
                  justifyContent: "center",
                  gap:           8,
                  animation:     `fadeUp 0.4s ease ${i * 0.2}s both`,
                }}
              >
                <span style={{ color: "var(--accent)" }}>▸</span>
                {step}
              </div>
            ))}
          </div>
        </>

      ) : (

        // ==============================
        // Blockchain Phase
        // Shows chain icon and tx message
        // ==============================

        <>
          {/* Chain Icon */}
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛓</div>

          {/* Title */}
          <div
            style={{
              fontFamily:    "var(--font-display)",
              fontSize:      16,
              color:         "var(--accent)",
              letterSpacing: 3,
              marginBottom:  8,
            }}
          >
            WRITING TO ETHEREUM
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Broadcasting transaction to mainnet...
          </div>

          {/* Pulse Dots */}
          <div
            style={{
              marginTop:      16,
              display:        "flex",
              justifyContent: "center",
              gap:            4,
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="pulse-dot"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          {/* Transaction Steps */}
          <div style={{ marginTop: 32 }}>
            {[
              "Connecting to Ethereum network...",
              "Signing transaction with wallet...",
              "Broadcasting to blockchain...",
              "Waiting for confirmation...",
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  fontSize:       11,
                  color:          "var(--text-muted)",
                  padding:        "6px 0",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            8,
                  animation:      `fadeUp 0.4s ease ${i * 0.2}s both`,
                }}
              >
                <span style={{ color: "var(--accent)" }}>▸</span>
                {step}
              </div>
            ))}
          </div>

          {/* Network Info */}
          <div
            style={{
              marginTop:    24,
              padding:      "12px 20px",
              background:   "rgba(0,255,200,0.03)",
              border:       "1px solid rgba(0,255,200,0.08)",
              borderRadius: 8,
              fontSize:     11,
              color:        "var(--text-muted)",
            }}
          >
            Network:{" "}
            <span
              style={{
                color:      "var(--accent)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Ethereum Sepolia Testnet
            </span>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### What each part does
// AnalyzingState.jsx
// 
// - props
//   - phase
//     - "ai"         -> shows AI analysis screen
//     - "blockchain" -> shows blockchain write screen
// 
// - AI phase
//   - spinner animation
//   - ANALYZING ARTWORK title
//   - subtitle text
//   - 4 progress steps
//     - Scanning image pixels
//     - Checking AI similarity
//     - Querying blockchain
//     - Calculating score
// 
// - Blockchain phase
//   - chain icon ⛓
//   - WRITING TO ETHEREUM title
//   - subtitle text
//   - 5 pulse dots animation
//   - 4 transaction steps
//     - Connecting to network
//     - Signing transaction
//     - Broadcasting
//     - Waiting for confirmation
//   - network info card
//     - Ethereum Sepolia Testnet
```
