// components/Header.jsx
export default function Header({ onNavigate, currentPage }) {
  return (
    <header
      style={{
        borderBottom:   "1px solid rgba(0,255,200,0.1)",
        padding:        "20px 32px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        position:       "relative",
        zIndex:         20,
      }}
    >

      {/* ==============================
          Logo
          ============================== */}

      <div
        onClick={() => onNavigate("home")}
        style={{ cursor: "pointer" }}
      >
        {/* Main Logo Text */}
        <div
          style={{
            fontFamily:    "var(--font-display)",
            fontSize:      20,
            fontWeight:    900,
            letterSpacing: 4,
            color:         "var(--accent)",
            textShadow:    "0 0 20px rgba(0,255,200,0.5)",
            transition:    "all 0.2s ease",
          }}
        >
          ◈ ARTCHAIN
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize:      10,
            color:         "#334455",
            letterSpacing: 3,
            marginTop:     2,
          }}
        >
          AI COPYRIGHT VERIFICATION PROTOCOL
        </div>
      </div>

      {/* ==============================
          Right Side
          ============================== */}

      <div
        style={{
          display:    "flex",
          gap:        16,
          alignItems: "center",
        }}
      >

        {/* Nav Links */}
        <nav
          style={{
            display: "flex",
            gap:     8,
          }}
        >
          {[
            { label: "HOME",        page: "home"        },
            { label: "CERTIFICATE", page: "certificate" },
          ].map((item) => (
            <button
              key={item.page}
              className={`tab ${currentPage === item.page ? "active" : ""}`}
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div
          style={{
            width:      1,
            height:     24,
            background: "rgba(0,255,200,0.1)",
          }}
        />

        {/* Network Status */}
        <div
          style={{
            display:    "flex",
            gap:        8,
            alignItems: "center",
          }}
        >
          {/* Pulse dot */}
          <div
            style={{
              width:        8,
              height:       8,
              borderRadius: "50%",
              background:   "var(--accent)",
              animation:    "pulse 2s infinite",
              boxShadow:    "0 0 6px var(--accent)",
            }}
          />

          {/* Live text */}
          <span
            style={{
              fontSize:      11,
              color:         "var(--accent)",
              letterSpacing: 2,
              fontFamily:    "var(--font-display)",
            }}
          >
            MAINNET LIVE
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width:      1,
            height:     24,
            background: "rgba(0,255,200,0.1)",
          }}
        />

        {/* Block Number */}
        <div
          style={{
            fontSize:   10,
            color:      "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          BLOCK{" "}
          <span style={{ color: "rgba(0,255,200,0.5)" }}>
            #19,842,301
          </span>
        </div>

      </div>
    </header>
  );
}