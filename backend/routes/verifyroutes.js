// backend/routes/verifyRoutes.js
const express            = require("express");
const { verifyArtwork, checkHash } = require("../controllers/verifyController");
const { uploadMiddleware }  = require("../middleware/upload");
const { errorHandler }      = require("../middleware/errorhandler");

const router = express.Router();

// ==============================
// POST /api/verify
// ==============================

router.post(
  "/",
  uploadMiddleware.single("artwork"),
  verifyArtwork
);

// ==============================
// GET /api/verify/:hash
// ==============================

router.get(
  "/:hash",
  checkHash
);

// ==============================
// Error handler
// ==============================

router.use(errorHandler);

module.exports = router;