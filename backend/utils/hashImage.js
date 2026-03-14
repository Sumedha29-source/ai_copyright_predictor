// backend/utils/hashImage.js
// utils/hashImage.js
const crypto = require("crypto");
const fs     = require("fs");
const path   = require("path");

// ==============================
// Hash Image File
//
// Reads file from disk and
// generates SHA256 hash.
//
// Returns hex string prefixed
// with 0x for blockchain use.
//
// Params:
//   filePath → absolute or
//              relative path
//              to image file
// ==============================

const hashImageFile = (filePath) => {
  return new Promise((resolve, reject) => {

    // ==============================
    // Validate File Path
    // ==============================

    if (!filePath) {
      return reject(new Error("File path is required."));
    }

    const absPath = path.resolve(filePath);

    // ==============================
    // Check File Exists
    // ==============================

    if (!fs.existsSync(absPath)) {
      return reject(
        new Error(`File not found: ${absPath}`)
      );
    }

    // ==============================
    // Create Hash Stream
    //
    // Streams file in chunks
    // rather than loading entire
    // file into memory.
    // Handles large files safely.
    // ==============================

    const hash       = crypto.createHash("sha256");
    const fileStream = fs.createReadStream(absPath);

    // ==============================
    // Stream Events
    // ==============================

    fileStream.on("data", (chunk) => {
      hash.update(chunk);
    });

    fileStream.on("end", () => {
      const digest = "0x" + hash.digest("hex");
      console.log(`[HASH] File:   ${path.basename(absPath)}`);
      console.log(`[HASH] SHA256: ${digest}`);
      resolve(digest);
    });

    fileStream.on("error", (err) => {
      console.error("[HASH] Stream error:", err.message);
      reject(err);
    });

  });
};

// ==============================
// Hash Image Buffer
//
// Generates SHA256 hash from
// an in-memory Buffer.
//
// Useful when file is already
// loaded into memory.
//
// Params:
//   buffer   → Buffer object
//   fileName → optional name
//              for logging
// ==============================

const hashImageBuffer = (buffer, fileName = "buffer") => {

  // ==============================
  // Validate Buffer
  // ==============================

  if (!buffer) {
    throw new Error("Buffer is required.");
  }

  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Input must be a Buffer.");
  }

  if (buffer.length === 0) {
    throw new Error("Buffer is empty.");
  }

  // ==============================
  // Generate Hash
  // ==============================

  const digest = "0x" + crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");

  console.log(`[HASH] Buffer: ${fileName}`);
  console.log(`[HASH] SHA256: ${digest}`);

  return digest;
};

// ==============================
// Hash Image Base64
//
// Converts base64 string to
// Buffer then generates hash.
//
// Strips data URI prefix if
// present before hashing.
//
// Params:
//   base64   → base64 string
//              with or without
//              data URI prefix
//   fileName → optional name
//              for logging
// ==============================

const hashImageBase64 = (base64, fileName = "base64") => {

  // ==============================
  // Validate Input
  // ==============================

  if (!base64) {
    throw new Error("Base64 string is required.");
  }

  if (typeof base64 !== "string") {
    throw new Error("Base64 input must be a string.");
  }

  // ==============================
  // Strip Data URI Prefix
  //
  // "data:image/png;base64,abc..."
  //  → "abc..."
  // ==============================

  let cleanBase64 = base64;

  if (base64.includes(",")) {
    cleanBase64 = base64.split(",")[1];
    console.log(`[HASH] Stripped data URI prefix`);
  }

  // ==============================
  // Convert to Buffer + Hash
  // ==============================

  const buffer = Buffer.from(cleanBase64, "base64");

  if (buffer.length === 0) {
    throw new Error("Base64 decoded to empty buffer.");
  }

  return hashImageBuffer(buffer, fileName);
};

// ==============================
// Compare Hashes
//
// Safely compares two hashes
// using timing-safe comparison
// to prevent timing attacks.
//
// Returns true if hashes match.
//
// Params:
//   hash1 → first hash string
//   hash2 → second hash string
// ==============================

const compareHashes = (hash1, hash2) => {

  // ==============================
  // Validate Inputs
  // ==============================

  if (!hash1 || !hash2) {
    return false;
  }

  if (typeof hash1 !== "string" || typeof hash2 !== "string") {
    return false;
  }

  // ==============================
  // Normalise Hashes
  // Strip 0x prefix if present
  // ==============================

  const clean1 = hash1.startsWith("0x")
    ? hash1.slice(2)
    : hash1;

  const clean2 = hash2.startsWith("0x")
    ? hash2.slice(2)
    : hash2;

  // ==============================
  // Must be same length to compare
  // ==============================

  if (clean1.length !== clean2.length) {
    return false;
  }

  // ==============================
  // Timing Safe Comparison
  // Prevents timing attacks
  // ==============================

  try {
    const buf1 = Buffer.from(clean1, "hex");
    const buf2 = Buffer.from(clean2, "hex");
    return crypto.timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
};

// ==============================
// Generate Short Hash
//
// Converts full SHA256 hash
// to shortened display version.
//
// "0x3f9a8b2cd4e5f6b24c..."
//  → "0x3f9a...b24c"
//
// Params:
//   fullHash  → full hash string
//   prefixLen → chars after 0x
//   suffixLen → chars at end
// ==============================

const generateShortHash = (
  fullHash,
  prefixLen = 6,
  suffixLen = 4
) => {

  if (!fullHash || typeof fullHash !== "string") {
    return "";
  }

  // Strip 0x for slicing
  const hex = fullHash.startsWith("0x")
    ? fullHash.slice(2)
    : fullHash;

  if (hex.length <= prefixLen + suffixLen) {
    return fullHash;
  }

  const prefix = hex.slice(0, prefixLen);
  const suffix = hex.slice(-suffixLen);

  return `0x${prefix}...${suffix}`;
};

// ==============================
// Validate Hash Format
//
// Checks if a string is a valid
// SHA256 hash (64 hex chars).
//
// Accepts with or without
// 0x prefix.
// ==============================

const isValidHash = (hash) => {

  if (!hash || typeof hash !== "string") {
    return false;
  }

  // Strip 0x prefix
  const clean = hash.startsWith("0x")
    ? hash.slice(2)
    : hash;

  // SHA256 is always 64 hex chars
  const hexRegex = /^[0-9a-fA-F]{64}$/;

  return hexRegex.test(clean);
};

// ==============================
// Hash Multiple Files
//
// Hashes multiple files in
// parallel using Promise.all.
//
// Params:
//   filePaths → array of paths
// ==============================

const hashMultipleFiles = async (filePaths) => {

  if (!Array.isArray(filePaths)) {
    throw new Error("filePaths must be an array.");
  }

  if (filePaths.length === 0) {
    return [];
  }

  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const hash = await hashImageFile(filePath);
        return {
          filePath,
          hash,
          error: null,
        };
      } catch (err) {
        return {
          filePath,
          hash:  null,
          error: err.message,
        };
      }
    })
  );

  return results;
};

// ==============================
// Exports
// ==============================

module.exports = {
  hashImageFile,
  hashImageBuffer,
  hashImageBase64,
  compareHashes,
  generateShortHash,
  isValidHash,
  hashMultipleFiles,
};
// ```

// ---

// ### What each part does
// ```
// ```
// hashImage.js
// │
// ├── hashImageFile()
// │   ├── validates file path
// │   ├── checks file exists
// │   ├── streams file in chunks
// │   │   └── safe for large files
// │   ├── updates SHA256 on each chunk
// │   └── returns "0x" + hex digest
// │
// ├── hashImageBuffer()
// │   ├── validates Buffer input
// │   ├── checks not empty
// │   └── returns "0x" + hex digest
// │
// ├── hashImageBase64()
// │   ├── validates string input
// │   ├── strips data URI prefix
// │   │   "data:image/png;base64,..."
// │   │    → strips before comma
// │   ├── converts to Buffer
// │   └── calls hashImageBuffer()
// │
// ├── compareHashes()
// │   ├── validates both inputs
// │   ├── strips 0x prefix
// │   ├── checks same length
// │   └── timing-safe comparison
// │       prevents timing attacks
// │
// ├── generateShortHash()
// │   ├── strips 0x for slicing
// │   ├── takes prefix chars
// │   ├── takes suffix chars
// │   └── "0x3f9a...b24c"
// │
// ├── isValidHash()
// │   ├── strips 0x prefix
// │   └── checks 64 hex chars
// │       /^[0-9a-fA-F]{64}$/
// │
// └── hashMultipleFiles()
//     ├── validates array input
//     ├── hashes all in parallel
//     └── returns results array
//         ├── filePath
//         ├── hash
//         └── error
// ```