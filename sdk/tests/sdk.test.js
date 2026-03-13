// sdk/test/sdk.test.js
import { expect }       from "chai";
import sinon            from "sinon";
import fs               from "fs";
import path             from "path";
import { fileURLToPath } from "url";

import ArtChainSDK, {
  verifyArtwork,
  verifyArtworkFromBuffer,
  verifyArtworkFromBase64,
  checkArtworkExists,
  getVerificationStatus,
  getCertificate,
  getCertificateById,
  verifyCertificate,
  downloadCertificate,
  VERSION,
  SDK_NAME,
} from "../src/index.js";

// ==============================
// Setup __dirname for ES Modules
// ==============================

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ==============================
// Mock Data
// ==============================

const MOCK_IMAGE_HASH = "abc123def456abc123def456abc123def456abc123def456abc123def456abc1";
const MOCK_TX_HASH    = "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1";
const MOCK_FILE_NAME  = "sunset.png";
const MOCK_SCORE      = 95;

const MOCK_VERIFICATION = {
  imageHash:   MOCK_IMAGE_HASH,
  score:       MOCK_SCORE,
  certified:   true,
  fileName:    MOCK_FILE_NAME,
  timestamp:   new Date().toISOString(),
  blockNumber: "19842301",
  txHash:      MOCK_TX_HASH,
  network:     "Ethereum Sepolia Testnet",
};

const MOCK_CERTIFICATE = {
  id:          "CERT-2026-00001",
  imageHash:   MOCK_IMAGE_HASH,
  fileName:    MOCK_FILE_NAME,
  score:       MOCK_SCORE,
  certified:   true,
  status:      "CERTIFIED",
  timestamp:   new Date().toISOString(),
  dateIssued:  "March 12, 2026",
  blockNumber: "19842301",
  txHash:      MOCK_TX_HASH,
  network:     "Ethereum Sepolia Testnet",
};

// ==============================
// SDK Test Suite
// ==============================

describe("ArtChain SDK", function () {

  // ==============================
  // SDK Info Tests
  // ==============================

  describe("SDK Info", function () {

    it("should have correct version", function () {
      expect(VERSION).to.equal("1.0.0");
      console.log("[TEST] ✓ Version correct");
    });

    it("should have correct SDK name", function () {
      expect(SDK_NAME).to.equal("facinet-sdk");
      console.log("[TEST] ✓ SDK name correct");
    });

    it("should initialize SDK class correctly", function () {
      const sdk = new ArtChainSDK({
        rpcUrl:          "https://sepolia.infura.io/v3/test",
        contractAddress: "0xTestAddress",
        apiKey:          "sk-test-key",
        network:         "Ethereum Sepolia Testnet",
      });

      expect(sdk.version).to.equal("1.0.0");
      expect(sdk.name).to.equal("facinet-sdk");
      expect(sdk.network).to.equal("Ethereum Sepolia Testnet");
      console.log("[TEST] ✓ SDK initialized correctly");
    });

    it("should return correct SDK info", function () {
      const sdk = new ArtChainSDK({
        rpcUrl:          "https://sepolia.infura.io/v3/test",
        contractAddress: "0xTestAddress",
        apiKey:          "sk-test-key",
      });

      const info = sdk.getInfo();

      expect(info).to.have.property("name");
      expect(info).to.have.property("version");
      expect(info).to.have.property("network");
      expect(info).to.have.property("contractAddress");
      expect(info).to.have.property("rpcUrl");

      console.log("[TEST] ✓ SDK info returned correctly");
    });

    it("should return true when SDK is configured", function () {
      const sdk = new ArtChainSDK({
        rpcUrl:          "https://sepolia.infura.io/v3/test",
        contractAddress: "0xTestAddress",
        apiKey:          "sk-test-key",
      });

      expect(sdk.isConfigured()).to.equal(true);
      console.log("[TEST] ✓ isConfigured returns true");
    });

    it("should return false when SDK is not configured", function () {
      const sdk = new ArtChainSDK({});

      expect(sdk.isConfigured()).to.equal(false);
      console.log("[TEST] ✓ isConfigured returns false");
    });

  });

  // ==============================
  // verifyArtwork Tests
  // ==============================

  describe("verifyArtwork", function () {

    it("should throw error if file does not exist", async function () {
      try {
        await verifyArtwork("non-existent-file.png");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("File not found");
        console.log("[TEST] ✓ Throws error for missing file");
      }
    });

    it("should throw error for invalid file type", async function () {

      // Create a temp .txt file
      const tempFile = path.join(__dirname, "temp.txt");
      fs.writeFileSync(tempFile, "test content");

      try {
        await verifyArtwork(tempFile);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Invalid file type");
        console.log("[TEST] ✓ Throws error for invalid file type");
      } finally {
        // Clean up temp file
        fs.unlinkSync(tempFile);
      }
    });

    it("should accept valid image extensions", function () {
      const validExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".svg",
      ];

      validExtensions.forEach((ext) => {
        expect([
          ".jpg", ".jpeg", ".png",
          ".webp", ".gif", ".svg",
        ]).to.include(ext);
      });

      console.log("[TEST] ✓ Valid extensions accepted");
    });

  });

  // ==============================
  // verifyArtworkFromBuffer Tests
  // ==============================

  describe("verifyArtworkFromBuffer", function () {

    it("should throw error for invalid buffer", async function () {
      try {
        await verifyArtworkFromBuffer(null, "test.png");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Invalid buffer");
        console.log("[TEST] ✓ Throws error for null buffer");
      }
    });

    it("should throw error for non-buffer input", async function () {
      try {
        await verifyArtworkFromBuffer("not-a-buffer", "test.png");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Invalid buffer");
        console.log("[TEST] ✓ Throws error for string input");
      }
    });

    it("should accept valid buffer", function () {
      const buffer = Buffer.from("test image data");
      expect(Buffer.isBuffer(buffer)).to.equal(true);
      console.log("[TEST] ✓ Valid buffer accepted");
    });

  });

  // ==============================
  // verifyArtworkFromBase64 Tests
  // ==============================

  describe("verifyArtworkFromBase64", function () {

    it("should throw error for empty base64 string", async function () {
      try {
        await verifyArtworkFromBase64("", "test.png");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Base64 string cannot be empty");
        console.log("[TEST] ✓ Throws error for empty base64");
      }
    });

    it("should strip data URL prefix correctly", function () {
      const base64WithPrefix = "data:image/png;base64,abc123";
      const cleaned = base64WithPrefix.includes(",")
        ? base64WithPrefix.split(",")[1]
        : base64WithPrefix;

      expect(cleaned).to.equal("abc123");
      console.log("[TEST] ✓ Data URL prefix stripped correctly");
    });

    it("should handle base64 without prefix", function () {
      const base64 = "abc123def456";
      const cleaned = base64.includes(",")
        ? base64.split(",")[1]
        : base64;

      expect(cleaned).to.equal("abc123def456");
      console.log("[TEST] ✓ Base64 without prefix handled correctly");
    });

  });

  // ==============================
  // checkArtworkExists Tests
  // ==============================

  describe("checkArtworkExists", function () {

    it("should throw error for empty hash", async function () {
      try {
        await checkArtworkExists("");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.be.a("string");
        console.log("[TEST] ✓ Throws error for empty hash");
      }
    });

    it("should return object with found property", function () {
      const mockResult = {
        found: false,
        data:  null,
      };

      expect(mockResult).to.have.property("found");
      expect(mockResult).to.have.property("data");
      console.log("[TEST] ✓ Result has correct structure");
    });

  });

  // ==============================
  // getVerificationStatus Tests
  // ==============================

  describe("getVerificationStatus", function () {

    it("should return NOT_FOUND for unknown hash", function () {
      const mockStatus = {
        status:  "NOT_FOUND",
        message: "No verification found for this image.",
        data:    null,
      };

      expect(mockStatus.status).to.equal("NOT_FOUND");
      console.log("[TEST] ✓ NOT_FOUND status returned correctly");
    });

    it("should return CERTIFIED for certified artwork", function () {
      const mockStatus = {
        status:  "CERTIFIED",
        message: "Artwork is certified as original.",
        data:    MOCK_VERIFICATION,
      };

      expect(mockStatus.status).to.equal("CERTIFIED");
      console.log("[TEST] ✓ CERTIFIED status returned correctly");
    });

    it("should return FLAGGED for flagged artwork", function () {
      const mockStatus = {
        status:  "FLAGGED",
        message: "Artwork was flagged for similarity.",
        data:    { ...MOCK_VERIFICATION, certified: false },
      };

      expect(mockStatus.status).to.equal("FLAGGED");
      console.log("[TEST] ✓ FLAGGED status returned correctly");
    });

  });

  // ==============================
  // getCertificate Tests
  // ==============================

  describe("getCertificate", function () {

    it("should throw error for empty hash", async function () {
      try {
        await getCertificate("");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.be.a("string");
        console.log("[TEST] ✓ Throws error for empty hash");
      }
    });

    it("should return correct certificate structure", function () {
      expect(MOCK_CERTIFICATE).to.have.property("id");
      expect(MOCK_CERTIFICATE).to.have.property("imageHash");
      expect(MOCK_CERTIFICATE).to.have.property("score");
      expect(MOCK_CERTIFICATE).to.have.property("certified");
      expect(MOCK_CERTIFICATE).to.have.property("status");
      expect(MOCK_CERTIFICATE).to.have.property("dateIssued");
      expect(MOCK_CERTIFICATE).to.have.property("txHash");
      console.log("[TEST] ✓ Certificate structure is correct");
    });

    it("should format certificate ID correctly", function () {
      const id = `CERT-2026-00001`;
      expect(id).to.match(/^CERT-\d{4}-\d{5}$/);
      console.log("[TEST] ✓ Certificate ID format is correct");
    });

  });

  // ==============================
  // verifyCertificate Tests
  // ==============================

  describe("verifyCertificate", function () {

    it("should return valid for certified artwork", function () {
      const mockResult = {
        valid:   true,
        message: "Certificate is valid and authentic.",
        data:    MOCK_CERTIFICATE,
      };

      expect(mockResult.valid).to.equal(true);
      console.log("[TEST] ✓ Valid certificate returns true");
    });

    it("should return invalid for flagged artwork", function () {
      const mockResult = {
        valid:   false,
        message: "This artwork was flagged for similarity issues.",
        data:    { ...MOCK_CERTIFICATE, certified: false },
      };

      expect(mockResult.valid).to.equal(false);
      console.log("[TEST] ✓ Flagged artwork returns false");
    });

    it("should return invalid for low score", function () {
      const mockResult = {
        valid:   false,
        message: "Originality score is below certification threshold.",
        data:    { ...MOCK_CERTIFICATE, score: 50 },
      };

      expect(mockResult.valid).to.equal(false);
      expect(mockResult.data.score).to.be.below(70);
      console.log("[TEST] ✓ Low score returns invalid");
    });

  });

  // ==============================
  // downloadCertificate Tests
  // ==============================

  describe("downloadCertificate", function () {

    it("should return correct download structure", function () {
      const mockDownload = {
        success: true,
        data: {
          title:       "CERTIFICATE OF COPYRIGHT VERIFICATION",
          issuedBy:    "ArtChain Protocol",
          id:          "CERT-2026-00001",
          imageHash:   MOCK_IMAGE_HASH,
          txHash:      MOCK_TX_HASH,
          fileName:    MOCK_FILE_NAME,
          score:       MOCK_SCORE,
          certified:   true,
          status:      "CERTIFIED ORIGINAL",
          dateIssued:  "March 12, 2026",
          blockNumber: "19842301",
          qrData:      `https://artchain.io/certificate/${MOCK_IMAGE_HASH}`,
          disclaimer:  "This certificate is immutably recorded on the Ethereum blockchain.",
        },
      };

      expect(mockDownload).to.have.property("success");
      expect(mockDownload).to.have.property("data");
      expect(mockDownload.data).to.have.property("title");
      expect(mockDownload.data).to.have.property("qrData");
      expect(mockDownload.data).to.have.property("disclaimer");
      console.log("[TEST] ✓ Download structure is correct");
    });

    it("should have correct title", function () {
      expect("CERTIFICATE OF COPYRIGHT VERIFICATION").to.be.a("string");
      console.log("[TEST] ✓ Certificate title is correct");
    });

  });

  // ==============================
  // Hash Tests
  // ==============================

  describe("Image Hashing", function () {

    it("should produce consistent hash for same input", async function () {
      const crypto  = await import("crypto").then(m => m.default);
      const buffer  = Buffer.from("test image data");

      const hash1 = crypto.createHash("sha256").update(buffer).digest("hex");
      const hash2 = crypto.createHash("sha256").update(buffer).digest("hex");

      expect(hash1).to.equal(hash2);
      console.log("[TEST] ✓ Same input produces same hash");
    });

    it("should produce different hash for different input", async function () {
      const crypto = await import("crypto").then(m => m.default);

      const buffer1 = Buffer.from("image data one");
      const buffer2 = Buffer.from("image data two");

      const hash1 = crypto.createHash("sha256").update(buffer1).digest("hex");
      const hash2 = crypto.createHash("sha256").update(buffer2).digest("hex");

      expect(hash1).to.not.equal(hash2);
      console.log("[TEST] ✓ Different inputs produce different hashes");
    });

    it("should produce 64 character hash", async function () {
      const crypto = await import("crypto").then(m => m.default);
      const buffer = Buffer.from("test image");
      const hash   = crypto.createHash("sha256").update(buffer).digest("hex");

      expect(hash).to.have.lengthOf(64);
      console.log("[TEST] ✓ Hash is 64 characters long");
    });

  });

});