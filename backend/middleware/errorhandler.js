// backend/middleware/errorHandler.js
// middleware/errorHandler.js

// ==============================
// Error Handler Middleware
//
// Catches all errors passed
// via next(error) and returns
// a clean JSON error response.
//
// Must be registered LAST in
// Express app after all routes.
// ==============================

const errorHandler = (err, req, res, next) => {

  // ==============================
  // Log Error
  // ==============================

  console.error("[ERROR]", {
    message: err.message,
    stack:   process.env.NODE_ENV === "development"
      ? err.stack
      : undefined,
    path:    req.path,
    method:  req.method,
    ip:      req.ip,
  });

  // ==============================
  // Multer Errors
  // File upload related errors
  // ==============================

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error:   "File is too large. Maximum size is 50MB.",
      code:    "LIMIT_FILE_SIZE",
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      error:   "Too many files. Upload one file at a time.",
      code:    "LIMIT_FILE_COUNT",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error:   "Unexpected file field. Use field name 'artwork'.",
      code:    "LIMIT_UNEXPECTED_FILE",
    });
  }

  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      error:   "Invalid file type. Allowed: JPG, PNG, WEBP, SVG, GIF.",
      code:    "INVALID_FILE_TYPE",
    });
  }

  // ==============================
  // Validation Errors
  // ==============================

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error:   err.message || "Validation failed.",
      code:    "VALIDATION_ERROR",
    });
  }

  // ==============================
  // Authentication Errors
  // ==============================

  if (err.status === 401 || err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      error:   "Unauthorized. Valid credentials required.",
      code:    "UNAUTHORIZED",
    });
  }

  // ==============================
  // Forbidden Errors
  // ==============================

  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      error:   "Forbidden. You do not have permission.",
      code:    "FORBIDDEN",
    });
  }

  // ==============================
  // Not Found Errors
  // ==============================

  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error:   err.message || "Resource not found.",
      code:    "NOT_FOUND",
    });
  }

  // ==============================
  // Blockchain Errors
  // ethers.js related errors
  // ==============================

  if (
    err.message?.includes("AlreadyVerified") ||
    err.code === "AlreadyVerified"
  ) {
    return res.status(409).json({
      success: false,
      error:   "This artwork has already been verified on the blockchain.",
      code:    "ALREADY_VERIFIED",
    });
  }

  if (
    err.message?.includes("VerificationNotFound") ||
    err.code === "VerificationNotFound"
  ) {
    return res.status(404).json({
      success: false,
      error:   "Verification record not found on the blockchain.",
      code:    "VERIFICATION_NOT_FOUND",
    });
  }

  if (
    err.message?.includes("OwnableUnauthorizedAccount") ||
    err.code === "OwnableUnauthorizedAccount"
  ) {
    return res.status(403).json({
      success: false,
      error:   "Not authorized. Only the contract owner can perform this action.",
      code:    "CONTRACT_UNAUTHORIZED",
    });
  }

  if (
    err.message?.includes("EmptyImageHash") ||
    err.code === "EmptyImageHash"
  ) {
    return res.status(400).json({
      success: false,
      error:   "Image hash cannot be empty.",
      code:    "EMPTY_IMAGE_HASH",
    });
  }

  if (
    err.message?.includes("ScoreOutOfRange") ||
    err.code === "ScoreOutOfRange"
  ) {
    return res.status(400).json({
      success: false,
      error:   "Score must be between 0 and 100.",
      code:    "SCORE_OUT_OF_RANGE",
    });
  }

  if (
    err.message?.includes("IndexOutOfRange") ||
    err.code === "IndexOutOfRange"
  ) {
    return res.status(404).json({
      success: false,
      error:   "Record index is out of range.",
      code:    "INDEX_OUT_OF_RANGE",
    });
  }

  if (
    err.message?.includes("CALL_EXCEPTION") ||
    err.code === "CALL_EXCEPTION"
  ) {
    return res.status(502).json({
      success: false,
      error:   "Blockchain call failed. Check contract address and network.",
      code:    "CALL_EXCEPTION",
    });
  }

  if (
    err.message?.includes("NETWORK_ERROR") ||
    err.code === "NETWORK_ERROR"
  ) {
    return res.status(503).json({
      success: false,
      error:   "Blockchain network unavailable. Try again shortly.",
      code:    "NETWORK_ERROR",
    });
  }

  if (
    err.message?.includes("INSUFFICIENT_FUNDS") ||
    err.code === "INSUFFICIENT_FUNDS"
  ) {
    return res.status(402).json({
      success: false,
      error:   "Insufficient funds in wallet to pay gas fees.",
      code:    "INSUFFICIENT_FUNDS",
    });
  }

  if (
    err.message?.includes("REPLACEMENT_UNDERPRICED") ||
    err.code === "REPLACEMENT_UNDERPRICED"
  ) {
    return res.status(400).json({
      success: false,
      error:   "Transaction underpriced. Try again with higher gas.",
      code:    "REPLACEMENT_UNDERPRICED",
    });
  }

  if (
    err.message?.includes("TIMEOUT") ||
    err.code === "TIMEOUT"
  ) {
    return res.status(504).json({
      success: false,
      error:   "Blockchain transaction timed out. Try again.",
      code:    "TIMEOUT",
    });
  }

  // ==============================
  // OpenAI Errors
  // ==============================

  if (err.status === 429 || err.message?.includes("rate limit")) {
    return res.status(429).json({
      success: false,
      error:   "AI service rate limit reached. Please wait and try again.",
      code:    "RATE_LIMIT",
    });
  }

  if (err.status === 402 || err.message?.includes("quota")) {
    return res.status(402).json({
      success: false,
      error:   "AI service quota exceeded. Check your OpenAI billing.",
      code:    "QUOTA_EXCEEDED",
    });
  }

  if (
    err.message?.includes("invalid_api_key") ||
    err.message?.includes("Incorrect API key")
  ) {
    return res.status(500).json({
      success: false,
      error:   "AI service configuration error.",
      code:    "AI_CONFIG_ERROR",
    });
  }

  if (err.message?.includes("Could not process image")) {
    return res.status(400).json({
      success: false,
      error:   "AI could not process this image. Try a different file.",
      code:    "IMAGE_UNPROCESSABLE",
    });
  }

  // ==============================
  // Syntax / Parse Errors
  // ==============================

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      error:   "Invalid JSON in request body.",
      code:    "INVALID_JSON",
    });
  }

  // ==============================
  // Payload Too Large
  // ==============================

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error:   "Request payload too large. Maximum size is 50MB.",
      code:    "PAYLOAD_TOO_LARGE",
    });
  }

  // ==============================
  // Default — Internal Server Error
  // ==============================

  const statusCode = err.status || err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error:   process.env.NODE_ENV === "production"
      ? "An internal server error occurred."
      : err.message || "An internal server error occurred.",
    code:    "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

// ==============================
// Not Found Handler
//
// Catches requests to routes
// that do not exist.
//
// Must be registered AFTER
// all routes but BEFORE
// errorHandler.
// ==============================

const notFoundHandler = (req, res) => {
  console.warn(`[404] ${req.method} ${req.path} — not found`);

  return res.status(404).json({
    success: false,
    error:   `Route ${req.method} ${req.path} not found.`,
    code:    "ROUTE_NOT_FOUND",
  });
};

// ==============================
// Exports
// ==============================

module.exports = {
  errorHandler,
  notFoundHandler,
};
// ```

// ---

// ### What each part does
// ```
// ```
// errorHandler.js
// │
// ├── errorHandler()
// │   │
// │   ├── Log error
// │   │   ├── message
// │   │   ├── stack (dev only)
// │   │   ├── path
// │   │   ├── method
// │   │   └── ip
// │   │
// │   ├── Multer errors
// │   │   ├── LIMIT_FILE_SIZE       → 400
// │   │   ├── LIMIT_FILE_COUNT      → 400
// │   │   ├── LIMIT_UNEXPECTED_FILE → 400
// │   │   └── INVALID_FILE_TYPE     → 400
// │   │
// │   ├── Validation errors         → 400
// │   │
// │   ├── Auth errors
// │   │   ├── 401 Unauthorized      → 401
// │   │   └── 403 Forbidden         → 403
// │   │
// │   ├── Not found                 → 404
// │   │
// │   ├── Blockchain errors
// │   │   ├── AlreadyVerified       → 409
// │   │   ├── VerificationNotFound  → 404
// │   │   ├── OwnableUnauthorized   → 403
// │   │   ├── EmptyImageHash        → 400
// │   │   ├── ScoreOutOfRange       → 400
// │   │   ├── IndexOutOfRange       → 404
// │   │   ├── CALL_EXCEPTION        → 502
// │   │   ├── NETWORK_ERROR         → 503
// │   │   ├── INSUFFICIENT_FUNDS    → 402
// │   │   ├── REPLACEMENT_UNDERPRICED → 400
// │   │   └── TIMEOUT               → 504
// │   │
// │   ├── OpenAI errors
// │   │   ├── rate limit            → 429
// │   │   ├── quota exceeded        → 402
// │   │   ├── invalid_api_key       → 500
// │   │   └── unprocessable image   → 400
// │   │
// │   ├── Parse errors
// │   │   ├── Invalid JSON          → 400
// │   │   └── Payload too large     → 413
// │   │
// │   └── Default                   → 500
// │       └── hides message in prod
// │
// └── notFoundHandler()
//     └── catches unknown routes    → 404
// ```