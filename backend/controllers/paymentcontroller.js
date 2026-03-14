// controllers/paymentController.js
const {
  verifyPayment,
  createPaymentRecord,
  getPaymentStats,
} = require("../services/paymentService");

const { PAYMENT_CONFIG } = require("../middleware/x402");

// ==============================
// Get Payment Info
//
// Returns payment requirements
// for the verify endpoint.
//
// GET /api/payment/info
// ==============================

const getPaymentInfo = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      version:  "x402/1.0",
      amount:   PAYMENT_CONFIG.amount,
      token:    PAYMENT_CONFIG.token,
      network:  PAYMENT_CONFIG.network,
      chainId:  PAYMENT_CONFIG.chainId,
      address:  PAYMENT_CONFIG.address,

      endpoints: {
        verify: {
          path:   "/api/verify",
          method: "POST",
          cost:   `${PAYMENT_CONFIG.amount} ${PAYMENT_CONFIG.token}`,
        },
      },

      instructions: [
        `1. Send ${PAYMENT_CONFIG.amount} ${PAYMENT_CONFIG.token} to ${PAYMENT_CONFIG.address}`,
        `2. Copy the transaction hash`,
        `3. Add header X-Payment: <txHash> to your request`,
        `4. Call POST /api/verify with your artwork`,
      ],
    },
  });
};

// ==============================
// Verify Payment Status
//
// Checks if a tx hash is valid
// and has been used.
//
// GET /api/payment/status/:txHash
// ==============================

const getPaymentStatus = async (req, res, next) => {
  try {

    const { txHash } = req.params;

    if (!txHash || !txHash.startsWith("0x")) {
      return res.status(400).json({
        success: false,
        error:   "Invalid tx hash.",
      });
    }

    console.log(`[PAYMENT] Checking status: ${txHash}`);

    const result = await verifyPayment({
      txHash,
      expectedAmount:  PAYMENT_CONFIG.amount,
      expectedToken:   PAYMENT_CONFIG.token,
      expectedAddress: PAYMENT_CONFIG.address,
    });

    return res.status(200).json({
      success: true,
      data: {
        txHash,
        valid:   result.valid,
        used:    result.used,
        reason:  result.reason  || null,
        amount:  result.amount  || null,
        from:    result.from    || null,
        network: PAYMENT_CONFIG.network,
      },
    });

  } catch (error) {
    console.error("[PAYMENT] getPaymentStatus error:", error.message);
    next(error);
  }
};

// ==============================
// Get Payment Stats
//
// Returns stats about payments.
// Owner/admin only in production.
//
// GET /api/payment/stats
// ==============================

const getStats = (req, res) => {
  const stats = getPaymentStats();

  return res.status(200).json({
    success: true,
    data:    stats,
  });
};

// ==============================
// Exports
// ==============================

module.exports = {
  getPaymentInfo,
  getPaymentStatus,
  getStats,
};