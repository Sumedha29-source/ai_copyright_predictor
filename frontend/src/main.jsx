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
