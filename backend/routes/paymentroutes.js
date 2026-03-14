// routes/paymentRoutes.js
const express = require("express");

const {
  getPaymentInfo,
  getPaymentStatus,
  getStats,
} = require("../controllers/paymentController");

const router = express.Router();

// ==============================
// GET /api/payment/info
// Returns payment requirements
// ==============================

router.get("/info", getPaymentInfo);

// ==============================
// GET /api/payment/status/:txHash
// Check if payment is valid
// ==============================

router.get("/status/:txHash", getPaymentStatus);

// ==============================
// GET /api/payment/stats
// Payment stats
// ==============================

router.get("/stats", getStats);

module.exports = router;
