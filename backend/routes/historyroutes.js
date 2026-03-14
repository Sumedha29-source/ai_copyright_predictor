// backend/routes/historyRoutes.js
const express = require("express");
const {
  getAllHistory,
  getHistoryById,
  searchHistory,
  deleteHistoryById,
} = require("../controllers/historycontroller");
const { errorHandler } = require("../middleware/errorhandler");

const router = express.Router();


// ==============================
// GET /api/history
// Get all verification records
// with pagination
// Example: /api/history?page=1&limit=10
// ==============================

router.get(
  "/",
  getAllHistory
);

// ==============================
// GET /api/history/search
// Search records by filename
// or image hash
// Example: /api/history/search?query=sunset
// ==============================

router.get(
  "/search",
  searchHistory
);

// ==============================
// GET /api/history/:id
// Get single verification
// record by ID
// Example: /api/history/123
// ==============================

router.get(
  "/:id",
  getHistoryById
);

// ==============================
// DELETE /api/history/:id
// Delete a single verification
// record by ID
// Example: DELETE /api/history/123
// ==============================

router.delete(
  "/:id",
  deleteHistoryById
);

// ==============================
// Error handler for this router
// ==============================

router.use(errorHandler);

module.exports = router;
// ```

// ---

// ### What each part does
// ```
// ```
// historyRoutes.js
// │
// ├── GET /api/history
// │   └── getAllHistory()
// │       └── returns all records + pagination
// │
// ├── GET /api/history/search?query=
// │   └── searchHistory()
// │       └── search by filename or hash
// │
// ├── GET /api/history/:id
// │   └── getHistoryById()
// │       └── returns single record
// │
// ├── DELETE /api/history/:id
// │   └── deleteHistoryById()
// │       └── deletes single record
// │
// └── errorHandler
//     └── catches any route errors
// ```