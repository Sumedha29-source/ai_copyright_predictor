// main.jsx — React Entry Point
import React       from "react";
import ReactDOM    from "react-dom/client";
import App         from "./app.jsx";
import "./index.css";

// ==============================
// Mount React App
// Finds <div id="root"> in
// index.html and renders
// the App inside it
// ==============================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### What each part does
```
```
main.jsx
│
├── import React
│   └── needed for JSX
│
├── import ReactDOM
│   └── renders React to browser
│
├── import App
│   └── your entire application
│
├── import index.css
│   └── global styles
│       loaded once here
│       applies everywhere
│
└── ReactDOM.createRoot()
    ├── finds <div id="root">
    │   in index.html
    └── renders <App />
        inside it
```

```

### How it connects to other files
```
```App.jsx
index.html
    ↓
<div id="root">    ← empty at first
    ↓
main.jsx fills it
    ↓
<App />
    ↓
<Header />
<HexGrid />
<Home />
    or
<Certificate />
```

```

### What React.StrictMode does
```
```
React.StrictMode
│
├── Only runs in development
├── Does NOT affect production
│
├── Helps find:
│   ├── deprecated API usage
│   ├── unexpected side effects
│   └── missing cleanup in hooks
│
└── Renders components twice
    in development to catch bugs
```

```

### Quick copy guide

| File | Paste into |

```
| `main.jsx` | `src/main.jsx` |

```
```
```
### Location reminder
```
```
frontend/
└── src/
    ├── main.jsx      ← HERE
    ├── App.jsx
    ├── index.css
    ├── components/
    └── pages/
```