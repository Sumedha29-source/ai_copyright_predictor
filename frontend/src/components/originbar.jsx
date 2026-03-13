// components/OriginBar.jsx

export default function OriginBar({ value }) {

  // ==============================
  // Determine level and color
  // based on score value
  // ==============================

  const level  =
    value > 70 ? "high" :
    value > 40 ? "mid"  :
    "low";

  const color  =
    value > 70 ? "var(--accent)"  :
    value > 40 ? "var(--warning)" :
    "var(--danger)";

  const label  =
    value > 70 ? "ORIGINAL"   :
    value > 40 ? "REVIEW"     :
    "FLAGGED";

  const emoji  =
    value > 70 ? "✦" :
    value > 40 ? "⚠" :
    "✕";

  return (
    <div style={{ marginTop: 6 }}>

      {/* ==============================
          Top Row
          Label + Score + Status
          ============================== */}

      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          fontSize:       11,
          marginBottom:   6,
          color:          "#778899",
        }}
      >
        {/* Left — Label */}
        <span>Originality Score</span>

        {/* Right — Score + Status */}
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        8,
          }}
        >
          {/* Status Badge */}
          <span
            style={{
              fontSize:      9,
              padding:       "2px 8px",
              borderRadius:  3,
              fontFamily:    "var(--font-display)",
              letterSpacing: 1,
              background:    value > 70
                ? "rgba(0,255,200,0.1)"
                : value > 40
                ? "rgba(255,204,0,0.1)"
                : "rgba(255,68,102,0.1)",
              color,
              border: `1px solid ${
                value > 70
                  ? "rgba(0,255,200,0.2)"
                  : value > 40
                  ? "rgba(255,204,0,0.2)"
                  : "rgba(255,68,102,0.2)"
              }`,
            }}
          >
            {emoji} {label}
          </span>

          {/* Score Number */}
          <span
            style={{
              color,
              fontWeight:    700,
              fontFamily:    "var(--font-display)",
              fontSize:      12,
            }}
          >
            {value}%
          </span>
        </div>
      </div>

      {/* ==============================
          Progress Bar Track
          ============================== */}

      <div className="origin-bar-track">

        {/* ==============================
            Progress Bar Fill
            ============================== */}

        <div
          className={`origin-bar-fill ${level}`}
          style={{ width: `${value}%` }}
        />
      </div>

      {/* ==============================
          Bottom Row
          Score range description
          ============================== */}

      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          marginTop:      4,
          fontSize:       9,
          color:          "var(--text-dim)",
          fontFamily:     "var(--font-display)",
          letterSpacing:  1,
        }}
      >
        <span>0</span>
        <span
          style={{
            color: "rgba(255,68,102,0.5)",
          }}
        >
          LOW
        </span>
        <span
          style={{
            color: "rgba(255,204,0,0.5)",
          }}
        >
          MID
        </span>
        <span
          style={{
            color: "rgba(0,255,200,0.5)",
          }}
        >
          HIGH
        </span>
        <span>100</span>
      </div>

    </div>
  );
}
// ---
// The following is documentation for OriginBar component.
// Move this block to a separate Markdown file if needed.
// ---

/*
OriginBar.jsx

props:
  value       -> number 0-100

level:
  high        -> value > 70
  mid         -> value > 40
  low         -> value 0-40

color:
  #00ffcc     -> high (green)
  #ffcc00     -> mid  (yellow)
  #ff4466     -> low  (red)

label:
  ORIGINAL    -> high
  REVIEW      -> mid
  FLAGGED     -> low

Top Row:
  "Originality Score"  -> left
  status badge         -> right
    - ORIGINAL
    - REVIEW
    - FLAGGED
  score number         -> right
    - e.g. 97%

Progress Bar:
  track     -> grey background
  fill      -> colored bar
    - width = value%
    - color based on level

Bottom Row:
    0
    LOW  (red)
    MID  (yellow)
    HIGH (green)
    100

Example appearance:
High score (97):
Originality Score              ORIGINAL  97%
[green bar]
// 0    LOW      MID      HIGH    100

Mid score (55):
Originality Score              REVIEW  55%
[yellow bar]
0    LOW      MID      HIGH    100

Low score (28):
Originality Score              FLAGGED  28%
[red bar]
0    LOW      MID      HIGH    100
*/

// What each part does
```
OriginBar.jsx
│
├── props
│   └── value       → number 0-100
│
├── level
│   ├── high        → value > 70
│   ├── mid         → value > 40
│   └── low         → value 0-40
│
├── color
│   ├── #00ffcc     → high (green)
│   ├── #ffcc00     → mid  (yellow)
│   └── #ff4466     → low  (red)
│
├── label
│   ├── ORIGINAL    → high
│   ├── REVIEW      → mid
│   └── FLAGGED     → low
│
├── Top Row
│   ├── "Originality Score"  → left
│   ├── status badge         → right
│   │   ├── ✦ ORIGINAL
│   │   ├── ⚠ REVIEW
│   │   └── ✕ FLAGGED
│   └── score number         → right
│       └── e.g. 97%
│
├── Progress Bar
│   ├── track     → grey background
│   └── fill      → colored bar
│       ├── width = value%
│       └── color based on level
│
└── Bottom Row
    ├── 0
    ├── LOW  (red)
    ├── MID  (yellow)
    ├── HIGH (green)
    └── 100
```



// What it looks like
```
High score (97):
Originality Score              ✦ ORIGINAL  97%
████████████████████████████░░  ← green bar
0    LOW      MID      HIGH    100

Mid score (55):
Originality Score              ⚠ REVIEW  55%
█████████████░░░░░░░░░░░░░░░░░  ← yellow bar
0    LOW      MID      HIGH    100

Low score (28):
Originality Score              ✕ FLAGGED  28%
███████░░░░░░░░░░░░░░░░░░░░░░░  ← red bar
0    LOW      MID      HIGH    100
```