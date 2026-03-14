// backend/routes/verifyRoutes.js
const express = require("express");
const { verifyArtwork, checkHash } = require("../controllers/verifyController");
const { uploadMiddleware } = require("../middleware/upload");
const { errorHandler } = require("../middleware/errorhandler");

const router = express.Router();

// ==============================
// POST /api/verify
// Upload image and verify
// ==============================

router.post(
  "/",
  uploadMiddleware.single("artwork"),  // accept single file with field name "artwork"
  verifyArtwork                        // pass to controller
);

// ==============================
// GET /api/verify/:hash
// Check if hash exists on
// blockchain already
// ==============================

router.get(
  "/:hash",
  checkHash
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
// verifyRoutes.js
// │
// ├── POST /api/verify
// │   ├── uploadMiddleware.single("artwork")
// │   │   └── multer saves file to uploads/
// │   └── verifyArtwork()
// │       └── runs AI + blockchain logic
// │
// ├── GET /api/verify/:hash
// │   └── checkHash()
// │       └── looks up hash on blockchain
// │
// └── errorHandler
//     └── catches any route errors
// ```