// middleware/x402.js
const { verifyPayment } = require("../services/paymentService");

// ==============================
// X402 Payment Middleware
//
// Intercepts requests and
// checks for valid payment
// before allowing access.
//
// Flow:
//   Request comes in
//     ↓
//   Check X-Payment header
//     ↓
//   No header → 402 response
//     ↓
//   Has header → verify on chain
//     ↓
//   Valid → continue to route
//   Invalid → 402 response
// ==============================

// ==============================
// Payment Config
// ==============================

const PAYMENT_CONFIG = {
  amount:   process.env.PAYMENT_AMOUNT   || "0.001",
  token:    process.env.PAYMENT_TOKEN    || "ETH",
  network:  process.env.NETWORK_NAME     || "sepolia",
  address:  process.env.PAYMENT_ADDRESS  || "",
  chainId:  process.env.PAYMENT_CHAIN_ID || "11155111",
};

// ==============================
// X402 Middleware
// ==============================

const x402 = async (req, res, next) => {
  try {

    // ==============================
    // Check Payment Header
    //
    // Client must send:
    // X-Payment: <tx hash>
    // ==============================

    const paymentHeader = req.headers["x-payment"];

    // ==============================
    // No Payment Header
    // Return 402 with instructions
    // ==============================

    if (!paymentHeader) {
      console.log(`[X402] Payment required for ${req.path}`);

      return res.status(402).json({
        success: false,
        error:   "Payment Required",
        code:    "PAYMENT_REQUIRED",

        // ==============================
        // Payment Instructions
        // Client reads this and pays
        // ==============================

        payment: {
          version:  "x402/1.0",
          amount:   PAYMENT_CONFIG.amount,
          token:    PAYMENT_CONFIG.token,
          network:  PAYMENT_CONFIG.network,
          chainId:  PAYMENT_CONFIG.chainId,
          address:  PAYMENT_CONFIG.address,
          memo:     `ArtChain verification — ${req.path}`,

          instructions: [
            `Send ${PAYMENT_CONFIG.amount} ${PAYMENT_CONFIG.token}`,
            `To address: ${PAYMENT_CONFIG.address}`,
            `On network: ${PAYMENT_CONFIG.network}`,
            `Then retry with header: X-Payment: <txHash>`,
          ],
        },
      });
    }

    // ==============================
    // Validate Header Format
    // Must be a tx hash
    // ==============================

    const txHash = paymentHeader.trim();

    if (!txHash.startsWith("0x") || txHash.length < 10) {
      return res.status(402).json({
        success: false,
        error:   "Invalid payment header. Must be a valid tx hash.",
        code:    "INVALID_PAYMENT_HEADER",
      });
    }

    console.log(`[X402] Verifying payment tx: ${txHash}`);

    // ==============================
    // Verify Payment on Chain
    // ==============================

    const verification = await verifyPayment({
      txHash,
      expectedAmount:  PAYMENT_CONFIG.amount,
      expectedToken:   PAYMENT_CONFIG.token,
      expectedAddress: PAYMENT_CONFIG.address,
    });

    // ==============================
    // Payment Invalid
    // ==============================

    if (!verification.valid) {
      console.warn(`[X402] Payment invalid: ${verification.reason}`);

      return res.status(402).json({
        success: false,
        error:   `Payment verification failed: ${verification.reason}`,
        code:    "PAYMENT_INVALID",

        payment: {
          txHash,
          reason: verification.reason,
        },
      });
    }

    // ==============================
    // Payment Already Used
    // Prevents replay attacks
    // ==============================

    if (verification.used) {
      console.warn(`[X402] Payment already used: ${txHash}`);

      return res.status(402).json({
        success: false,
        error:   "Payment already used. Each payment is single use.",
        code:    "PAYMENT_ALREADY_USED",
      });
    }

    // ==============================
    // Payment Valid
    // Attach to request + continue
    // ==============================

    console.log(`[X402] Payment verified ✓`);
    console.log(`[X402] Amount: ${verification.amount} ${verification.token}`);
    console.log(`[X402] From:   ${verification.from}`);

    req.payment = {
      txHash,
      amount:    verification.amount,
      token:     verification.token,
      from:      verification.from,
      network:   PAYMENT_CONFIG.network,
      verifiedAt: new Date().toISOString(),
    };

    next();

  } catch (error) {
    console.error("[X402] Middleware error:", error.message);

    return res.status(402).json({
      success: false,
      error:   "Payment verification error. Try again.",
      code:    "PAYMENT_ERROR",
    });
  }
};

// ==============================
// Free Routes
//
// Bypass x402 for these paths.
// Use this for public endpoints.
// ==============================

const x402Exempt = (req, res, next) => {
  next();
};

// ==============================
// Exports
// ==============================

module.exports = {
  x402,
  x402Exempt,
  PAYMENT_CONFIG,
};