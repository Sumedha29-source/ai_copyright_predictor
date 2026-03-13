// backend/server.js
// server.js — Express Entry Point
require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const morgan      = require("morgan");
const path        = require("path");
const rateLimit   = require("express-rate-limit");

const verifyRoutes  = require("./routes/verifyRoutes");
const historyRoutes = require("./routes/historyRoutes");

const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/errorhandler");

const {
  cleanUpOldFiles,
} = require("./middleware/upload");

// ==============================
// Environment Variables
// ==============================

const PORT       = process.env.PORT       || 5000;
const NODE_ENV   = process.env.NODE_ENV   || "development";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ==============================
// Create Express App
// ==============================

const app = express();

// ==============================
// Trust Proxy
//
// Required when running behind
// a reverse proxy like nginx,
// Railway, or Vercel.
// ==============================

app.set("trust proxy", 1);

// ==============================
// Security — Helmet
//
// Sets secure HTTP headers.
// Protects against common
// web vulnerabilities.
// ==============================

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy:     false,
  })
);

// ==============================
// CORS
//
// Allows requests only from
// the frontend CLIENT_URL.
// ==============================

app.use(
  cors({
    origin:      CLIENT_URL,
    methods:     ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
    credentials: true,
    maxAge:      86400,
  })
);

// ==============================
// Rate Limiting
//
// Limits each IP to 100
// requests per 15 minutes.
// Prevents abuse.
// ==============================

const limiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  skipSuccessfulRequests: false,

  message: {
    success: false,
    error:   "Too many requests. Please wait 15 minutes and try again.",
    code:    "RATE_LIMIT_EXCEEDED",
  },

  handler: (req, res, next, options) => {
    console.warn(
      `[RATE LIMIT] IP ${req.ip} exceeded limit on ${req.path}`
    );
    res.status(429).json(options.message);
  },
});

app.use(limiter);

// ==============================
// Stricter Rate Limit
// for Verify Endpoint
//
// Limits verify to 10 requests
// per 15 minutes per IP.
// AI + blockchain calls are
// expensive to process.
// ==============================

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,

  message: {
    success: false,
    error:   "Too many verification requests. Please wait 15 minutes.",
    code:    "VERIFY_RATE_LIMIT_EXCEEDED",
  },

  handler: (req, res, next, options) => {
    console.warn(
      `[RATE LIMIT] IP ${req.ip} exceeded verify limit`
    );
    res.status(429).json(options.message);
  },
});

// ==============================
// Request Logging — Morgan
//
// dev  → colorized + concise
// prod → combined Apache format
// ==============================

app.use(
  morgan(NODE_ENV === "production" ? "combined" : "dev")
);

// ==============================
// Body Parsers
// ==============================

// JSON bodies up to 10MB
app.use(express.json({
  limit: "10mb",
}));

// URL-encoded bodies
app.use(express.urlencoded({
  extended: true,
  limit:    "10mb",
}));

// ==============================
// Static Files
//
// Serves uploaded files from
// the uploads/ directory.
// ==============================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads"),
    {
      maxAge:  "1d",
      etag:    true,
    }
  )
);

// ==============================
// Health Check
//
// GET /
// Quick check that server is up
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ArtChain API is running.",
    version: "1.0.0",
    env:     NODE_ENV,
  });
});

// ==============================
// Detailed Health Check
//
// GET /api/health
// Returns server stats
// ==============================

app.get("/api/health", (req, res) => {

  const uptime  = process.uptime();
  const memory  = process.memoryUsage();

  res.status(200).json({
    success:   true,
    status:    "healthy",
    timestamp: new Date().toISOString(),

    server: {
      uptime:    `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      uptimeSec: uptime,
      nodeVersion: process.version,
      env:       NODE_ENV,
      port:      PORT,
    },

    memory: {
      heapUsed:  `${Math.round(memory.heapUsed  / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      rss:       `${Math.round(memory.rss       / 1024 / 1024)}MB`,
      external:  `${Math.round(memory.external  / 1024 / 1024)}MB`,
    },

    services: {
      openai:     !!process.env.OPENAI_API_KEY,
      blockchain: !!process.env.ETHEREUM_RPC_URL,
      contract:   !!process.env.CONTRACT_ADDRESS,
    },
  });
});

// ==============================
// API Routes
// ==============================

app.use(
  "/api/verify",
  verifyLimiter,
  verifyRoutes
);

app.use(
  "/api/history",
  historyRoutes
);

// ==============================
// Not Found Handler
//
// Catches unknown routes.
// Must be AFTER all routes.
// ==============================

app.use(notFoundHandler);

// ==============================
// Global Error Handler
//
// Catches all errors from
// next(error) calls.
// Must be registered LAST.
// ==============================

app.use(errorHandler);

// ==============================
// Start Server
// ==============================

const server = app.listen(PORT, () => {

  console.log("\n==============================");
  console.log("  ArtChain API Server");
  console.log("==============================\n");

  console.log(`  Status:   Running ✓`);
  console.log(`  Port:     ${PORT}`);
  console.log(`  Env:      ${NODE_ENV}`);
  console.log(`  Client:   ${CLIENT_URL}`);
  console.log(`  Node:     ${process.version}`);
  console.log("");

  console.log("  Endpoints:");
  console.log(`  GET  /`);
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/verify`);
  console.log(`  GET  /api/verify/:hash`);
  console.log(`  GET  /api/history`);
  console.log(`  GET  /api/history/search`);
  console.log(`  GET  /api/history/:id`);
  console.log(`  DELETE /api/history/:id`);
  console.log("");

  console.log("  Services:");
  console.log(`  OpenAI:     ${process.env.OPENAI_API_KEY     ? "✓ configured" : "✗ missing"}`);
  console.log(`  Blockchain: ${process.env.ETHEREUM_RPC_URL   ? "✓ configured" : "✗ missing"}`);
  console.log(`  Contract:   ${process.env.CONTRACT_ADDRESS   ? "✓ configured" : "✗ missing"}`);
  console.log("");

  console.log("==============================\n");

  // ==============================
  // Clean up old files on start
  // ==============================

  cleanUpOldFiles();

  // ==============================
  // Schedule cleanup every 6hrs
  // ==============================

  setInterval(() => {
    console.log("[CLEANUP] Running scheduled file cleanup...");
    cleanUpOldFiles(6 * 60 * 60 * 1000);
  }, 6 * 60 * 60 * 1000);

});

// ==============================
// Graceful Shutdown
//
// Handles SIGTERM + SIGINT
// signals cleanly.
// Waits for in-flight requests
// before closing.
// ==============================

const shutdown = (signal) => {
  console.log(`\n[SERVER] ${signal} received — shutting down...`);

  server.close(() => {
    console.log("[SERVER] All connections closed.");
    console.log("[SERVER] Goodbye ✓\n");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("[SERVER] Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ==============================
// Unhandled Promise Rejections
// ==============================

process.on("unhandledRejection", (reason, promise) => {
  console.error("[SERVER] Unhandled rejection at:", promise);
  console.error("[SERVER] Reason:", reason);
});

// ==============================
// Uncaught Exceptions
// ==============================

process.on("uncaughtException", (err) => {
  console.error("[SERVER] Uncaught exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});

// ==============================
// Export App
// For testing purposes
// ==============================

module.exports = app;
```

---

### What each part does
```
```
server.js
│
├── Environment Variables
│   ├── PORT       → 5000
│   ├── NODE_ENV   → development
│   └── CLIENT_URL → localhost:3000
│
├── app.set("trust proxy")
│   └── required for Railway/Vercel
│
├── helmet()
│   └── secure HTTP headers
│
├── cors()
│   ├── origin      → CLIENT_URL only
│   ├── methods     → GET POST DELETE
│   └── credentials → true
│
├── rateLimit (global)
│   ├── 100 req per 15 min per IP
│   └── logs when exceeded
│
├── verifyLimiter (strict)
│   └── 10 req per 15 min per IP
│       AI + blockchain are expensive
│
├── morgan()
│   ├── dev  → colorized logs
│   └── prod → Apache format
│
├── express.json()
│   └── 10MB limit
│
├── express.static()
│   └── serves /uploads directory
│
├── GET /
│   └── quick health check
│
├── GET /api/health
│   ├── uptime
│   ├── memory usage
│   └── services configured
│
├── Routes
│   ├── /api/verify  + verifyLimiter
│   └── /api/history
│
├── notFoundHandler
│   └── catches unknown routes
│
├── errorHandler
│   └── catches all next(error)
│
├── app.listen()
│   ├── prints startup info
│   ├── runs cleanUpOldFiles()
│   └── schedules cleanup every 6hrs
│
├── Graceful Shutdown
│   ├── SIGTERM → server.close()
│   ├── SIGINT  → server.close()
│   └── force exit after 10s
│
├── unhandledRejection
│   └── logs promise rejections
│
└── uncaughtException
    └── logs + exits process
```

```

### Startup console output
```
```
==============================
  ArtChain API Server
==============================

  Status:   Running ✓
  Port:     5000
  Env:      development
  Client:   http://localhost:3000
  Node:     v20.11.0

  Endpoints:
  GET  /
  GET  /api/health
  POST /api/verify
  GET  /api/verify/:hash
  GET  /api/history
  GET  /api/history/search
  GET  /api/history/:id
  DELETE /api/history/:id

  Services:
  OpenAI:     ✓ configured
  Blockchain: ✓ configured
  Contract:   ✓ configured

==============================
```

```

### Health check response

GET /api/health

{
  "success":   true,
  "status":    "healthy",
  "timestamp": "2026-03-12T10:00:00.000Z",

  "server": {
    "uptime":      "5m 32s",
    "uptimeSec":   332.4,
    "nodeVersion": "v20.11.0",
    "env":         "development",
    "port":        5000
  },

  "memory": {
    "heapUsed":  "48MB",
    "heapTotal": "64MB",
    "rss":       "82MB",
    "external":  "2MB"
  },

  "services": {
    "openai":     true,
    "blockchain": true,
    "contract":   true
  }
}
```

```

### Middleware order
```
```
Request comes in
      ↓
helmet()          → security headers
      ↓
cors()            → allow frontend origin
      ↓
rateLimit()       → 100 req / 15min
      ↓
morgan()          → log request
      ↓
express.json()    → parse body
      ↓
express.static()  → serve uploads/
      ↓
Routes
  GET  /
  GET  /api/health
  POST /api/verify   + verifyLimiter
  GET  /api/verify/:hash
  GET  /api/history
  ...
      ↓
notFoundHandler() → 404 for unknown routes
      ↓
errorHandler()    → catches all errors
```

```

### Graceful shutdown flow
```
```
User presses Ctrl+C
  → SIGINT signal sent
      ↓
shutdown("SIGINT") called
      ↓
server.close()
  → stops accepting new connections
  → waits for in-flight requests
      ↓
All connections drained
      ↓
[SERVER] All connections closed.
[SERVER] Goodbye ✓
      ↓
process.exit(0)

If takes > 10 seconds:
      ↓
Force exit → process.exit(1)
```

```

### Quick copy guide

| File | Paste into |

```
| `server.js` | `backend/server.js` |

```

### Location reminder
```
```
backend/
├── controllers/
│   ├── verifyController.js
│   └── historyController.js
├── middleware/
│   ├── errorHandler.js
│   └── upload.js
├── routes/
│   ├── verifyRoutes.js
│   └── historyRoutes.js
├── services/
│   ├── aiService.js
│   └── blockchainService.js
├── utils/
│   └── hashImage.js
├── uploads/
├── server.js              ← HERE
├── .env
└── package.json
```