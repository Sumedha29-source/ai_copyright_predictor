import {
  verifyArtwork,
  verifyArtworkFromBuffer,
  verifyArtworkFromBase64,
  checkArtworkExists,
  getVerificationStatus,
} from "facinet-sdk";

// Verify from file path
const result = await verifyArtwork("./sunset.png");
console.log(result.data.score);       // 95
console.log(result.data.certified);   // true
console.log(result.data.txHash);      // 0xabc123...

// Verify from buffer
const buffer = fs.readFileSync("./sunset.png");
const result = await verifyArtworkFromBuffer(buffer, "sunset.png");

// Verify from base64
const base64 = fs.readFileSync("./sunset.png").toString("base64");
const result = await verifyArtworkFromBase64(base64, "sunset.png");

// Check if exists
const exists = await checkArtworkExists("abc123...");
console.log(exists.found);            // true or false

// Get status
const status = await getVerificationStatus("abc123...");
console.log(status.status);           // CERTIFIED / FLAGGED / NOT_FOUND