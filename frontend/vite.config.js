// vite.config.js
import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";
import path             from "path";

export default defineConfig({

  // ==============================
  // Plugins
  // ==============================

  plugins: [
    react(),
  ],

  // ==============================
  // Path Aliases
  // @ → src/
  // ==============================

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ==============================
  // Dev Server
  // ==============================

  server: {
    port: 3000,
    open: true,
    host: true,

    // ==============================
    // Proxy
    // Forwards /api calls to backend
    // Avoids CORS in development
    // ==============================

    proxy: {
      "/api": {
        target:       "http://localhost:5000",
        changeOrigin: true,
        secure:       false,

        // Log proxy activity
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("[PROXY] Error:", err.message);
          });
          proxy.on("proxyReq", (_, req) => {
            console.log("[PROXY] →", req.method, req.url);
          });
          proxy.on("proxyRes", (res, req) => {
            console.log("[PROXY] ←", res.statusCode, req.url);
          });
        },
      },
    },
  },

  // ==============================
  // Preview Server
  // Used after npm run build
  // ==============================

  preview: {
    port: 3000,
    open: true,
  },

  // ==============================
  // Build Options
  // ==============================

  build: {
    outDir:         "dist",
    sourcemap:      true,
    minify:         "esbuild",
    target:         "esnext",
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {

        // ==============================
        // Code Splitting
        // Splits vendor libs into
        // separate chunks for caching
        // ==============================

        manualChunks: {
          react:   ["react", "react-dom"],
          router:  ["react-router-dom"],
        },
      },
    },
  },

  // ==============================
  // CSS Options
  // ==============================

  css: {
    devSourcemap: true,
  },

  // ==============================
  // Environment Variables
  // Only VITE_ prefix exposed
  // to frontend code
  // ==============================

  envPrefix: "VITE_",

  // ==============================
  // Optimise Dependencies
  // Pre-bundles these for speed
  // ==============================

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
    ],
  },
});
// ```

// ---

// ### What each section does
// ```
// ```
// vite.config.js
// │
// ├── plugins
// │   └── react()
// │       enables JSX transforms
// │       fast refresh in dev
// │
// ├── resolve.alias
// │   └── @ → ./src
// │       import "@/components/Header"
// │       instead of
// │       import "../../components/Header"
// │
// ├── server
// │   ├── port  → 3000
// │   ├── open  → opens browser on start
// │   ├── host  → accessible on network
// │   └── proxy
// │       └── /api → localhost:5000
// │           ├── avoids CORS errors
// │           ├── logs proxy requests
// │           └── works in dev only
// │
// ├── preview
// │   └── port 3000
// │       used after npm run build
// │
// ├── build
// │   ├── outDir    → dist/
// │   ├── sourcemap → for debugging
// │   ├── minify    → esbuild (fast)
// │   ├── target    → esnext
// │   └── manualChunks
// │       ├── react  → react + react-dom
// │       └── router → react-router-dom
// │
// ├── css
// │   └── devSourcemap → CSS debugging
// │
// ├── envPrefix
// │   └── VITE_
// │       only vars starting with
// │       VITE_ are exposed to frontend
// │
// └── optimizeDeps
//     └── pre-bundles react + router
//         makes cold start faster
// ```

// ```

// ### How the proxy works
// ```
// ```
// Frontend fetch("/api/verify")
//         ↓
// Vite dev server (port 3000)
//         ↓
// Proxy intercepts /api/*
//         ↓
// Forwards to backend (port 5000)
//         ↓
// backend handles request
//         ↓
// Response sent back to frontend

// No CORS errors in development ✅
// ```

// ```

// ### How path alias works
// ```
// ```
// Without alias:
// import Header from "../../components/Header.jsx"

// With alias:
// import Header from "@/components/Header.jsx"

// @ always resolves to src/
// no matter how deep you are
// ```

// ```

// ### What proxy logs look like
// ```
// ```
// [PROXY] → POST /api/verify
// [PROXY] ← 200 /api/verify

// [PROXY] → GET /api/history
// [PROXY] ← 200 /api/history

// [PROXY] Error: connect ECONNREFUSED
//   → backend is not running
// ```

// ```

// ### Build output
// ```
// ```
// After npm run build:

// frontend/
// └── dist/
//     ├── index.html
//     └── assets/
//         ├── react-[hash].js      ← react chunk
//         ├── router-[hash].js     ← router chunk
//         ├── index-[hash].js      ← app code
//         └── index-[hash].css     ← styles
// ```

// ```

// ### Environment variables
// ```
// ```
// .env file:

// VITE_API_URL=https://api.artchain.io
// VITE_NETWORK=sepolia

// In component:

// const apiUrl = import.meta.env.VITE_API_URL;
// const network = import.meta.env.VITE_NETWORK;

// Never exposed to frontend:

// OPENAI_API_KEY=sk-...   ← no VITE_ prefix
// PRIVATE_KEY=0x...       ← stays server-side
// ```

// ```

// ### Quick copy guide

// | File | Paste into |
// ```
// | `vite.config.js` | `frontend/vite.config.js` |

// ```

// ### Location reminder
// ```
// ```
// frontend/
// ├── index.html
// ├── vite.config.js     ← HERE
// ├── package.json
// └── src/
//     ├── main.jsx
//     ├── App.jsx
//     ├── index.css
//     ├── components/
//     └── pages/
// ```