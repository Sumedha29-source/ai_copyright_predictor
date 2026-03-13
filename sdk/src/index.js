// sdk/src/index.js
import dotenv from "dotenv";

dotenv.config();

// ==============================
// Import all SDK functions
// ==============================

import {
  verifyArtwork,
  verifyArtworkFromBuffer,
  verifyArtworkFromBase64,
  checkArtworkExists,
  getVerificationStatus,
} from "./verify.js";

import {
  getCertificate,
  getCertificateById,
  verifyCertificate,
  downloadCertificate,
} from "./certificate.js";

// ==============================
// SDK Version
// ==============================

export const VERSION = "1.0.0";
export const SDK_NAME = "facinet-sdk";

// ==============================
// Export all verify functions
// ==============================

export {
  // Verify functions
  verifyArtwork,
  verifyArtworkFromBuffer,
  verifyArtworkFromBase64,
  checkArtworkExists,
  getVerificationStatus,

  // Certificate functions
  getCertificate,
  getCertificateById,
  verifyCertificate,
  downloadCertificate,
};

// ==============================
// ArtChain SDK Class
// Use as a class if preferred
// ==============================

export class ArtChainSDK {

  constructor(config = {}) {
    this.version         = VERSION;
    this.name            = SDK_NAME;
    this.rpcUrl          = config.rpcUrl          || process.env.ETHEREUM_RPC_URL;
    this.contractAddress = config.contractAddress  || process.env.CONTRACT_ADDRESS;
    this.apiKey          = config.apiKey           || process.env.OPENAI_API_KEY;
    this.network         = config.network          || process.env.NETWORK_NAME || "Ethereum Mainnet";

    console.log(`[SDK] ${this.name} v${this.version} initialized`);
    console.log(`[SDK] Network: ${this.network}`);
    console.log(`[SDK] Contract: ${this.contractAddress}`);
  }

  // ==============================
  // Verify Methods
  // ==============================

  // Verify from file path
  async verify(filePath) {
    return await verifyArtwork(filePath);
  }

  // Verify from buffer
  async verifyBuffer(buffer) {
    return await verifyArtworkFromBuffer(buffer);
  }

  // Verify from base64
  async verifyBase64(base64String) {
    return await verifyArtworkFromBase64(base64String);
  }

  // Check if artwork exists
  async exists(imageHash) {
    return await checkArtworkExists(imageHash);
  }

  // Get verification status
  async status(imageHash) {
    return await getVerificationStatus(imageHash);
  }

  // ==============================
  // Certificate Methods
  // ==============================

  // Get certificate by hash
  async getCertificate(imageHash) {
    return await getCertificate(imageHash);
  }

  // Get certificate by ID
  async getCertificateById(id) {
    return await getCertificateById(id);
  }

  // Verify certificate
  async verifyCertificate(imageHash) {
    return await verifyCertificate(imageHash);
  }

  // Download certificate
  async downloadCertificate(imageHash) {
    return await downloadCertificate(imageHash);
  }

  // ==============================
  // Utility Methods
  // ==============================

  // Get SDK info
  getInfo() {
    return {
      name:            this.name,
      version:         this.version,
      network:         this.network,
      contractAddress: this.contractAddress,
      rpcUrl:          this.rpcUrl,
    };
  }

  // Check if SDK is configured
  isConfigured() {
    return !!(
      this.rpcUrl &&
      this.contractAddress &&
      this.apiKey
    );
  }

}

// ==============================
// Default export
// ==============================

export default ArtChainSDK;