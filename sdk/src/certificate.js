// sdk/src/certificate.js
import { ethers } from "ethers";
import dotenv     from "dotenv";

dotenv.config();

// ==============================
// getCertificate()
// Fetches a verification
// certificate from blockchain
// by image hash
// ==============================

export const getCertificate = async (imageHash) => {
  try {

    console.log(`[CERTIFICATE] Fetching certificate for: ${imageHash}`);

    // Step 1 — Validate hash
    if (!imageHash || imageHash.trim() === "") {
      throw new Error("Image hash cannot be empty.");
    }

    // Step 2 — Connect to provider
    const provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );

    // Step 3 — Connect to contract
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider
    );

    // Step 4 — Fetch from blockchain
    const result = await contract.getVerification(imageHash);

    // Step 5 — Check if found
    if (!result || result.imageHash === "") {
      return {
        found:   false,
        message: "No certificate found for this image hash.",
        data:    null,
      };
    }

    // Step 6 — Format certificate
    const certificate = formatCertificate(result);

    console.log(`[CERTIFICATE] Found: ${certificate.id}`);

    return {
      found:       true,
      message:     "Certificate found successfully",
      data:        certificate,
    };

  } catch (error) {
    console.error("[CERTIFICATE] Error:", error.message);
    throw new Error(`Failed to fetch certificate: ${error.message}`);
  }
};

// ==============================
// getCertificateById()
// Fetches certificate by
// record ID number
// ==============================

export const getCertificateById = async (id) => {
  try {

    console.log(`[CERTIFICATE] Fetching by ID: ${id}`);

    // Validate ID
    if (!id) {
      throw new Error("Certificate ID cannot be empty.");
    }

    // Connect to provider
    const provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );

    // Connect to contract
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      provider
    );

    // Fetch from blockchain
    const result = await contract.getVerificationById(id);

    // Check if found
    if (!result || result.imageHash === "") {
      return {
        found:   false,
        message: `No certificate found with ID: ${id}`,
        data:    null,
      };
    }

    // Format and return
    const certificate = formatCertificate(result);

    return {
      found:   true,
      message: "Certificate found successfully",
      data:    certificate,
    };

  } catch (error) {
    console.error("[CERTIFICATE] Error:", error.message);
    throw new Error(`Failed to fetch certificate by ID: ${error.message}`);
  }
};

// ==============================
// verifyCertificate()
// Verifies if a certificate
// is valid and authentic on
// the blockchain
// ==============================

export const verifyCertificate = async (imageHash) => {
  try {

    console.log(`[CERTIFICATE] Verifying certificate: ${imageHash}`);

    // Fetch certificate
    const result = await getCertificate(imageHash);

    // Not found
    if (!result.found) {
      return {
        valid:   false,
        message: "Certificate not found on blockchain.",
        data:    null,
      };
    }

    const cert = result.data;

    // Check if certified
    if (!cert.certified) {
      return {
        valid:   false,
        message: "This artwork was flagged for similarity issues.",
        data:    cert,
      };
    }

    // Check score threshold
    if (cert.score < 70) {
      return {
        valid:   false,
        message: "Originality score is below certification threshold.",
        data:    cert,
      };
    }

    // All checks passed
    return {
      valid:   true,
      message: "Certificate is valid and authentic.",
      data:    cert,
    };

  } catch (error) {
    console.error("[CERTIFICATE] Verify error:", error.message);
    throw new Error(`Certificate verification failed: ${error.message}`);
  }
};

// ==============================
// downloadCertificate()
// Generates a certificate
// object ready for PDF export
// ==============================

export const downloadCertificate = async (imageHash) => {
  try {

    console.log(`[CERTIFICATE] Preparing download for: ${imageHash}`);

    // Fetch certificate data
    const result = await getCertificate(imageHash);

    if (!result.found) {
      throw new Error("Certificate not found. Cannot download.");
    }

    const cert = result.data;

    // Build download object
    const downloadData = {
      title:        "CERTIFICATE OF COPYRIGHT VERIFICATION",
      issuedBy:     "ArtChain Protocol",
      network:      process.env.NETWORK_NAME || "Ethereum Mainnet",
      id:           cert.id,
      imageHash:    cert.imageHash,
      txHash:       cert.txHash,
      fileName:     cert.fileName,
      score:        cert.score,
      certified:    cert.certified,
      status:       cert.certified ? "CERTIFIED ORIGINAL" : "SIMILARITY DETECTED",
      dateIssued:   cert.timestamp,
      blockNumber:  cert.blockNumber,
      qrData:       `https://artchain.io/certificate/${cert.imageHash}`,
      disclaimer:   "This certificate is immutably recorded on the Ethereum blockchain and cannot be altered or forged.",
    };

    console.log(`[CERTIFICATE] Download data prepared for: ${cert.id}`);

    return {
      success: true,
      data:    downloadData,
    };

  } catch (error) {
    console.error("[CERTIFICATE] Download error:", error.message);
    throw new Error(`Failed to prepare certificate download: ${error.message}`);
  }
};

// ==============================
// formatCertificate()
// Formats raw blockchain data
// into readable certificate
// ==============================

const formatCertificate = (raw) => {
  return {
    id:          `CERT-${new Date().getFullYear()}-${raw.id.toString().padStart(5, "0")}`,
    imageHash:   raw.imageHash,
    fileName:    raw.fileName,
    score:       Number(raw.score),
    certified:   raw.certified,
    status:      raw.certified ? "CERTIFIED" : "FLAGGED",
    timestamp:   new Date(Number(raw.timestamp) * 1000).toISOString(),
    dateIssued:  new Date(Number(raw.timestamp) * 1000).toLocaleDateString(
      "en-US", { year: "numeric", month: "long", day: "numeric" }
    ),
    blockNumber: raw.blockNumber.toString(),
    txHash:      raw.txHash || "",
    network:     process.env.NETWORK_NAME || "Ethereum Mainnet",
  };
};

// ==============================
// Contract ABI
// Minimum ABI needed for
// certificate functions
// ==============================

const contractABI = [
  {
    inputs:  [{ internalType: "string", name: "imageHash", type: "string" }],
    name:    "getVerification",
    outputs: [
      { internalType: "string",  name: "imageHash",   type: "string"  },
      { internalType: "uint256", name: "score",        type: "uint256" },
      { internalType: "bool",    name: "certified",    type: "bool"    },
      { internalType: "string",  name: "fileName",     type: "string"  },
      { internalType: "uint256", name: "timestamp",    type: "uint256" },
      { internalType: "uint256", name: "blockNumber",  type: "uint256" },
      { internalType: "uint256", name: "id",           type: "uint256" },
      { internalType: "string",  name: "txHash",       type: "string"  },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs:  [{ internalType: "uint256", name: "id", type: "uint256" }],
    name:    "getVerificationById",
    outputs: [
      { internalType: "string",  name: "imageHash",   type: "string"  },
      { internalType: "uint256", name: "score",        type: "uint256" },
      { internalType: "bool",    name: "certified",    type: "bool"    },
      { internalType: "string",  name: "fileName",     type: "string"  },
      { internalType: "uint256", name: "timestamp",    type: "uint256" },
      { internalType: "uint256", name: "blockNumber",  type: "uint256" },
      { internalType: "uint256", name: "id",           type: "uint256" },
      { internalType: "string",  name: "txHash",       type: "string"  },
    ],
    stateMutability: "view",
    type: "function",
  },
];