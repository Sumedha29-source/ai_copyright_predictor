// backend/services/blockchainService.js
const { ethers } = require("ethers");
const fs         = require("fs");
const path       = require("path");

require("dotenv").config();

// ==============================
// Load Contract ABI
// ==============================

const abiPath = path.resolve(
  "../artifacts/contracts/CopyrightVerifier.sol/CopyrightVerifier.json"
);

const contractJSON = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const contractABI  = contractJSON.abi;

// ==============================
// Provider & Signer Setup
// ==============================

const provider = new ethers.JsonRpcProvider(
  process.env.ETHEREUM_RPC_URL
);

const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

// ==============================
// Contract Instance
// ==============================

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  signer
);

// ==============================
// storeOnBlockchain()
// ==============================

const storeOnBlockchain = async ({ imageHash, score, certified, fileName }) => {
  try {

    console.log("[BLOCKCHAIN] Storing verification on chain...");

    const tx = await contract.storeVerification(imageHash, score, certified, fileName);

    console.log(`[BLOCKCHAIN] Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();

    console.log(`[BLOCKCHAIN] Mined in block: ${receipt.blockNumber}`);

    return {
      success:     true,
      txHash:      tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed:     receipt.gasUsed.toString(),
      network:     process.env.NETWORK_NAME || "Ethereum Mainnet",
    };

  } catch (error) {
    if (error.code === "INSUFFICIENT_FUNDS") throw new Error("blockchain: Insufficient funds to pay gas fees.");
    if (error.code === "NONCE_EXPIRED")      throw new Error("blockchain: Transaction nonce expired. Please retry.");
    if (error.code === "NETWORK_ERROR")      throw new Error("blockchain: Network error. Check your RPC URL.");

    console.error("[BLOCKCHAIN] Store error:", error.message);
    throw new Error(`blockchain: Failed to store on chain: ${error.message}`);
  }
};

// ==============================
// lookupHash()
// ==============================

const lookupHash = async (imageHash) => {
  try {

    console.log(`[BLOCKCHAIN] Looking up hash: ${imageHash}`);

    const result = await contract.getVerification(imageHash);

    if (!result || result.imageHash === "") {
      return null;
    }

    return {
      imageHash:   result.imageHash,
      score:       result.score.toString(),
      certified:   result.certified,
      fileName:    result.fileName,
      timestamp:   result.timestamp.toString(),
      blockNumber: result.blockNumber.toString(),
    };

  } catch (error) {
    console.error("[BLOCKCHAIN] Lookup error:", error.message);
    throw new Error(`blockchain: Lookup failed: ${error.message}`);
  }
};

// ==============================
// getVerificationHistory()
// ==============================

const getVerificationHistory = async ({ skip = 0, limit = 10, search = "" }) => {
  try {

    console.log("[BLOCKCHAIN] Fetching history...");

    const records = await contract.getAllVerifications();

    let list = records.map((r) => ({
      id:          r.id.toString(),
      imageHash:   r.imageHash,
      score:       r.score.toString(),
      certified:   r.certified,
      fileName:    r.fileName,
      timestamp:   new Date(r.timestamp.toNumber() * 1000).toISOString(),
      blockNumber: r.blockNumber.toString(),
    }));

    if (search) {
      list = list.filter(
        (r) =>
          r.fileName.toLowerCase().includes(search.toLowerCase()) ||
          r.imageHash.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = list.length;
    list = list.slice(skip, skip + limit);

    return { list, total };

  } catch (error) {
    console.error("[BLOCKCHAIN] History error:", error.message);
    throw new Error(`blockchain: Failed to fetch history: ${error.message}`);
  }
};

// ==============================
// getVerificationById()
// ==============================

const getVerificationById = async (id) => {
  try {

    console.log(`[BLOCKCHAIN] Fetching record by ID: ${id}`);

    const record = await contract.getVerificationById(id);

    if (!record || record.imageHash === "") {
      return null;
    }

    return {
      id:          record.id.toString(),
      imageHash:   record.imageHash,
      score:       record.score.toString(),
      certified:   record.certified,
      fileName:    record.fileName,
      timestamp:   new Date(record.timestamp.toNumber() * 1000).toISOString(),
      blockNumber: record.blockNumber.toString(),
      txHash:      record.txHash,
      network:     process.env.NETWORK_NAME || "Ethereum Mainnet",
    };

  } catch (error) {
    console.error("[BLOCKCHAIN] Fetch by ID error:", error.message);
    throw new Error(`blockchain: Failed to fetch record: ${error.message}`);
  }
};

// ==============================
// Exports
// ==============================

module.exports = {
  storeOnBlockchain,
  lookupHash,
  getVerificationHistory,
  getVerificationById,
};