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
```

---

### What each part does
```
```
App.jsx
│
├── state
│   └── page        → current page name
│       ├── "home"
│       └── "certificate"
│
├── handleNavigate()
│   ├── sets page state
│   └── scrolls to top
│
├── HexGrid
│   └── decorative background
│       behind everything
│
├── Header
│   ├── onNavigate  → page switcher
│   └── currentPage → highlights active tab
│
├── Page Content
│   ├── Home          → page === "home"
│   ├── Certificate   → page === "certificate"
│   └── 404           → unknown page
│       ├── ◈ icon
│       ├── 404 title
│       ├── Page not found
│       └── GO HOME button
```

```

### How page routing works
```
```
User clicks HOME tab
        ↓
Header calls onNavigate("home")
        ↓
handleNavigate("home")
        ↓
setPage("home")
        ↓
page === "home" → renders <Home />


User clicks CERTIFICATE tab
        ↓
Header calls onNavigate("certificate")
        ↓
handleNavigate("certificate")
        ↓
setPage("certificate")
        ↓
page === "certificate" → renders <Certificate />
```

```

### How all files connect to App.jsx
```
```
App.jsx
│
├── HexGrid.jsx
│   └── background decoration
│
├── Header.jsx
│   └── logo + nav tabs
│
├── pages/Home.jsx
│   ├── StepProgress.jsx
│   ├── UploadZone.jsx
│   ├── AnalyzingState.jsx
│   ├── ResultCard.jsx
│   │   └── OriginBar.jsx
│   └── HistoryTab.jsx
│       └── OriginBar.jsx
│
└── pages/Certificate.jsx
    └── OriginBar.jsx
```

```

### Full file connection diagram
```
```
main.jsx
    ↓
App.jsx
    ↓
┌───────────┬──────────────────────────┐
│           │                          │
HexGrid   Header                  Pages
           │                      │
        onNavigate            ┌───┴────────┐
        currentPage           │            │
                            Home      Certificate
                              │
                    ┌─────────┼──────────┐
                    │         │          │
               StepProgress  UploadZone  │
                         AnalyzingState  │
                              ResultCard │
                              HistoryTab │
                                    └────┘
                                  OriginBar
```

```

### What it looks like
```
```
┌──────────────────────────────────────────────┐
│  ◈ ARTCHAIN    HOME  CERTIFICATE  ● MAINNET  │  ← Header
└──────────────────────────────────────────────┘
  ⬡  ⬡  ⬡  ⬡  ⬡  ⬡  ⬡  ⬡  ← HexGrid background
  ⬡  ⬡  ⬡  ⬡  ⬡  ⬡  ⬡  ⬡
┌──────────────────────────────────────────────┐
│                                              │
│   UPLOAD    HISTORY                          │  ← Tab nav
│                                              │
│   ⬆ ──── 🔍 ──── ⛓ ──── ✦                  │  ← StepProgress
│                                              │
│   ┌──────────────┐  ┌──────────────┐        │
│   │  DROP        │  │  FILE INFO   │        │  ← UploadZone
│   │  ARTWORK     │  │  VERIFY      │        │
│   │  HERE        │  │  INCLUDES    │        │
│   └──────────────┘  └──────────────┘        │
│                                              │
└──────────────────────────────────────────────┘
```

```

### Quick copy guide

| File | Paste into |
|---|---|
| 'App.jsx' | 'src/App.jsx' |

```

```
### Location reminder
```
```
frontend/
└── src/
    ├── App.jsx           ← HERE
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── Header.jsx
    │   ├── HexGrid.jsx
    │   ├── StepProgress.jsx
    │   ├── UploadZone.jsx
    │   ├── AnalyzingState.jsx
    │   ├── ResultCard.jsx
    │   ├── OriginBar.jsx
    │   └── HistoryTab.jsx
    └── pages/
        ├── Home.jsx
        └── Certificate.jsx
```