// services/paymentService.js
require("dotenv").config();
const { ethers } = require("ethers");

// ==============================
// Used Payments Set
//
// Tracks used tx hashes
// to prevent replay attacks.
//
// In production use Redis
// or a database instead.
// ==============================

const usedPayments = new Set();

// ==============================
// Provider
// ==============================

const getProvider = () => {
  const rpcUrl = process.env.ETHEREUM_RPC_URL;

  if (!rpcUrl) {
    throw new Error("ETHEREUM_RPC_URL is not configured.");
  }

  return new ethers.JsonRpcProvider(rpcUrl);
};

// ==============================
// Verify Payment
//
// Checks a transaction hash
// to confirm payment was made
// to the correct address
// with the correct amount.
//
// Params:
//   txHash          → tx to check
//   expectedAmount  → e.g. "0.001"
//   expectedToken   → "ETH"
//   expectedAddress → recipient
// ==============================

const verifyPayment = async ({
  txHash,
  expectedAmount,
  expectedToken,
  expectedAddress,
}) => {

  try {

    // ==============================
    // Check Replay Attack
    // ==============================

    if (usedPayments.has(txHash)) {
      return {
        valid:  false,
        used:   true,
        reason: "Transaction already used.",
      };
    }

    // ==============================
    // Get Transaction
    // ==============================

    const provider = getProvider();
    const tx       = await provider.getTransaction(txHash);

    // ==============================
    // Transaction Not Found
    // ==============================

    if (!tx) {
      return {
        valid:  false,
        used:   false,
        reason: "Transaction not found on chain.",
      };
    }

    // ==============================
    // Wait for Confirmation
    // ==============================

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        valid:  false,
        used:   false,
        reason: "Transaction not yet confirmed. Try again shortly.",
      };
    }

    // ==============================
    // Check Transaction Success
    // ==============================

    if (receipt.status !== 1) {
      return {
        valid:  false,
        used:   false,
        reason: "Transaction failed on chain.",
      };
    }

    // ==============================
    // Check Recipient Address
    // ==============================

    const toAddress = tx.to?.toLowerCase();
    const expected  = expectedAddress.toLowerCase();

    if (toAddress !== expected) {
      return {
        valid:  false,
        used:   false,
        reason: `Payment sent to wrong address. Expected ${expectedAddress}.`,
      };
    }

    // ==============================
    // Check Amount (ETH only)
    // ==============================

    if (expectedToken === "ETH") {
      const sentAmount     = ethers.formatEther(tx.value);
      const requiredAmount = parseFloat(expectedAmount);
      const sentFloat      = parseFloat(sentAmount);

      if (sentFloat < requiredAmount) {
        return {
          valid:  false,
          used:   false,
          reason: `Insufficient payment. Sent ${sentFloat} ETH, required ${requiredAmount} ETH.`,
        };
      }
    }

    // ==============================
    // Mark as Used
    // Prevent replay attacks
    // ==============================

    usedPayments.add(txHash);

    console.log(`[PAYMENT] Verified tx: ${txHash}`);
    console.log(`[PAYMENT] From:        ${tx.from}`);
    console.log(`[PAYMENT] Amount:      ${ethers.formatEther(tx.value)} ETH`);

    // ==============================
    // Payment Valid
    // ==============================

    return {
      valid:   true,
      used:    false,
      txHash,
      from:    tx.from,
      to:      tx.to,
      amount:  ethers.formatEther(tx.value),
      token:   expectedToken,
      block:   receipt.blockNumber,
    };

  } catch (error) {
    console.error("[PAYMENT] verifyPayment error:", error.message);

    return {
      valid:  false,
      used:   false,
      reason: `Verification error: ${error.message}`,
    };
  }
};

// ==============================
// Create Payment Record
//
// Stores payment details
// after successful verification.
// ==============================

const createPaymentRecord = (payment, requestPath) => {
  return {
    txHash:     payment.txHash,
    amount:     payment.amount,
    token:      payment.token,
    from:       payment.from,
    network:    payment.network,
    path:       requestPath,
    paidAt:     payment.verifiedAt,
    createdAt:  new Date().toISOString(),
  };
};

// ==============================
// Check Payment Used
// ==============================

const isPaymentUsed = (txHash) => {
  return usedPayments.has(txHash);
};

// ==============================
// Get Payment Stats
// ==============================

const getPaymentStats = () => {
  return {
    totalUsedPayments: usedPayments.size,
    payments:          Array.from(usedPayments),
  };
};

// ==============================
// Exports
// ==============================

module.exports = {
  verifyPayment,
  createPaymentRecord,
  isPaymentUsed,
  getPaymentStats,
};