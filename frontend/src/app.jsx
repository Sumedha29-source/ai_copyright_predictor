// App.jsx — Main Application Component
import { useState }  from "react";
import HexGrid       from "./components/HexGrid.jsx";
import Header        from "./components/Header.jsx";
import Home          from "./pages/Home.jsx";
import Certificate   from "./pages/certificate.jsx";

export default function App() {

  // ==============================
  // Page Routing State
  // ==============================

  const [page, setPage] = useState("home");

  // ==============================
  // Navigate to a page
  // ==============================

  const handleNavigate = (targetPage) => {
    setPage(targetPage);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        minHeight:  "100vh",
        background: "var(--bg-primary)",
        position:   "relative",
        overflow:   "hidden",
      }}
    >

      {/* ==============================
          Background Hex Grid
          Decorative background layer
          ============================== */}

      <HexGrid />

      {/* ==============================
          Header
          Logo + Navigation
          ============================== */}

      <Header
        onNavigate={handleNavigate}
        currentPage={page}
      />

      {/* ==============================
          Page Content
          Renders based on page state
          ============================== */}

      <div
        style={{
          position:  "relative",
          zIndex:    10,
          animation: "fadeUp 0.4s ease",
        }}
      >

        {/* Home Page */}
        {page === "home" && (
          <Home
            onNavigate={handleNavigate}
          />
        )}

        {/* Certificate Page */}
        {page === "certificate" && (
          <Certificate
            onNavigate={handleNavigate}
          />
        )}

        {/* 404 — Page not found */}
        {page !== "home" &&
         page !== "certificate" && (
          <div
            style={{
              textAlign:  "center",
              padding:    "100px 32px",
              animation:  "fadeUp 0.4s ease",
            }}
          >
            {/* 404 Icon */}
            <div
              style={{
                fontSize:     64,
                marginBottom: 16,
              }}
            >
              ◈
            </div>

            {/* 404 Title */}
            <div
              style={{
                fontFamily:    "var(--font-display)",
                fontSize:      24,
                color:         "var(--accent)",
                letterSpacing: 4,
                marginBottom:  8,
              }}
            >
              404
            </div>

            {/* 404 Message */}
            <div
              style={{
                fontSize:     13,
                color:        "var(--text-muted)",
                marginBottom: 24,
              }}
            >
              Page not found
            </div>

            {/* Go Home Button */}
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "12px 32px" }}
              onClick={() => handleNavigate("home")}
            >
              ← GO HOME
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
