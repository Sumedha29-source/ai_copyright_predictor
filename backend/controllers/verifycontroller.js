// controllers/verifyController.js
const fs                              = require("fs");
const { hashImageFile }               = require("../utils/hashImage");
const { analyzeImageWithAI }          = require("../services/aiService");
const { storeOnBlockchain, lookupHash } = require("../services/blockchainService");

// ==============================
// Verify Artwork
//
// Main verification endpoint.
// Accepts uploaded image file,
// runs AI analysis, stores
// result on blockchain.
//
// POST /api/verify
// Body: multipart/form-data
//   artwork → image file
// ==============================

const verifyArtwork = async (req, res, next) => {
  try {

    // ==============================
    // Check File Uploaded
    // ==============================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error:   "No artwork file uploaded. Please attach an image.",
      });
    }

    const { path: filePath, originalname, mimetype, size } = req.file;

    console.log(`[VERIFY] Starting verification`);
    console.log(`[VERIFY] File:     ${originalname}`);
    console.log(`[VERIFY] Type:     ${mimetype}`);
    console.log(`[VERIFY] Size:     ${(size / 1024).toFixed(1)} KB`);
    console.log(`[VERIFY] Path:     ${filePath}`);

    // ==============================
    // Step 1 — Hash the Image
    //
    // Generate SHA256 hash of
    // the uploaded file.
    // Used as unique identifier.
    // ==============================

    console.log(`[VERIFY] Step 1 — Hashing image...`);

    const imageHash = await hashImageFile(filePath);

    console.log(`[VERIFY] Hash: ${imageHash}`);

    // ==============================
    // Step 2 — Check for Duplicate
    //
    // If hash already exists on
    // blockchain, return existing
    // record instead of re-verifying.
    // ==============================

    console.log(`[VERIFY] Step 2 — Checking for duplicate...`);

    const existing = await lookupHash(imageHash);

    if (existing) {
      console.log(`[VERIFY] Duplicate found — returning existing record`);

      // Clean up uploaded file
      await deleteFile(filePath);

      return res.status(200).json({
        success:   true,
        duplicate: true,
        message:   "This artwork has already been verified.",
        data: {
          score:       Number(existing.score),
          certified:   Boolean(existing.certified),
          imageHash,
          fileName:    existing.fileName,
          txHash:      null,
          blockNumber: null,
          network:     process.env.NETWORK_NAME || "sepolia",
          timestamp:   Number(existing.timestamp),
          date:        new Date(
            Number(existing.timestamp) * 1000
          ).toISOString(),
          status:      existing.certified ? "CERTIFIED" : "FLAGGED",
        },
      });
    }

    // ==============================
    // Step 3 — AI Analysis
    //
    // Send image to GPT-4o Vision
    // for originality analysis.
    // Returns score 0-100.
    // ==============================

    console.log(`[VERIFY] Step 3 — Running AI analysis...`);

    const aiResult = await analyzeImageWithAI(filePath);

    console.log(`[VERIFY] AI score:     ${aiResult.score}`);
    console.log(`[VERIFY] AI certified: ${aiResult.certified}`);
    console.log(`[VERIFY] AI style:     ${aiResult.style}`);

    // ==============================
    // Step 4 — Store on Blockchain
    //
    // Write verification result
    // to CopyrightVerifier.sol.
    // Returns txHash + blockNumber.
    // ==============================

    console.log(`[VERIFY] Step 4 — Storing on blockchain...`);

    const chainResult = await storeOnBlockchain({
      imageHash,
      score:     aiResult.score,
      certified: aiResult.certified,
      fileName:  originalname,
    });

    console.log(`[VERIFY] TX Hash:     ${chainResult.txHash}`);
    console.log(`[VERIFY] Block:       ${chainResult.blockNumber}`);
    console.log(`[VERIFY] Gas used:    ${chainResult.gasUsed}`);

    // ==============================
    // Step 5 — Clean Up Temp File
    //
    // Delete uploaded file from
    // server after processing.
    // ==============================

    console.log(`[VERIFY] Step 5 — Cleaning up temp file...`);

    await deleteFile(filePath);

    console.log(`[VERIFY] Verification complete ✓`);

    // ==============================
    // Send Response
    // ==============================

    return res.status(200).json({
      success:   true,
      duplicate: false,
      data: {
        score:       aiResult.score,
        certified:   aiResult.certified,
        imageHash,
        fileName:    originalname,
        fileSize:    size,
        mimeType:    mimetype,
        txHash:      chainResult.txHash,
        blockNumber: chainResult.blockNumber,
        gasUsed:     chainResult.gasUsed,
        network:     chainResult.network,
        timestamp:   Math.floor(Date.now() / 1000),
        date:        new Date().toISOString(),
        status:      aiResult.certified ? "CERTIFIED" : "FLAGGED",
        details:     aiResult.details   ?? null,
        style:       aiResult.style     ?? null,
      },
    });

  } catch (error) {

    // ==============================
    // Clean up file on error
    // ==============================

    if (req.file?.path) {
      await deleteFile(req.file.path);
    }

    console.error("[VERIFY] verifyArtwork error:", error.message);
    next(error);
  }
};

// ==============================
// Check Hash
//
// Looks up a verification record
// by image hash.
//
// GET /api/verify/:hash
// ==============================

const checkHash = async (req, res, next) => {
  try {

    const { hash } = req.params;

    // ==============================
    // Validate Hash
    // ==============================

    if (!hash || hash.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error:   "Hash parameter is required.",
      });
    }

    if (hash.length < 8) {
      return res.status(400).json({
        success: false,
        error:   "Hash is too short. Provide full SHA256 hash.",
      });
    }

    console.log(`[VERIFY] checkHash hash=${hash}`);

    // ==============================
    // Lookup on Blockchain
    // ==============================

    const record = await lookupHash(hash);

    // ==============================
    // Not Found
    // ==============================

    if (!record) {
      return res.status(200).json({
        success: true,
        exists:  false,
        data:    null,
      });
    }

    // ==============================
    // Send Response
    // ==============================

    return res.status(200).json({
      success: true,
      exists:  true,
      data: {
        imageHash:  hash,
        score:      Number(record.score),
        certified:  Boolean(record.certified),
        fileName:   record.fileName,
        timestamp:  Number(record.timestamp),
        submitter:  record.submitter,
        date:       new Date(
          Number(record.timestamp) * 1000
        ).toISOString(),
        status:     record.certified ? "CERTIFIED" : "FLAGGED",
      },
    });

  } catch (error) {

    // Hash not found on chain
    if (error.message?.includes("VerificationNotFound")) {
      return res.status(200).json({
        success: true,
        exists:  false,
        data:    null,
      });
    }

    console.error("[VERIFY] checkHash error:", error.message);
    next(error);
  }
};

// ==============================
// Delete File Helper
//
// Safely deletes a file.
// Silently ignores if not found.
// ==============================

const deleteFile = (filePath) => {
  return new Promise((resolve) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.warn(`[VERIFY] Could not delete file: ${filePath}`);
        console.warn(`[VERIFY] ${err.message}`);
      }
      resolve();
    });
  });
};

// ==============================
// Exports
// ==============================

module.exports = {
  verifyArtwork,
  checkHash,
};
// ```

// ---

// ### What each part does
// ```
// ```
// verifyController.js
// │
// ├── verifyArtwork()
// │   │
// │   ├── Step 0 — Check file uploaded
// │   │   └── 400 if no file
// │   │
// │   ├── Step 1 — Hash the image
// │   │   └── SHA256 from disk
// │   │
// │   ├── Step 2 — Check duplicate
// │   │   ├── lookup hash on chain
// │   │   └── return existing if found
// │   │       skip AI + blockchain
// │   │
// │   ├── Step 3 — AI analysis
// │   │   ├── GPT-4o Vision
// │   │   └── returns score + style
// │   │
// │   ├── Step 4 — Store on blockchain
// │   │   ├── calls storeOnBlockchain()
// │   │   └── returns txHash + block
// │   │
// │   ├── Step 5 — Clean up file
// │   │   └── deletes from uploads/
// │   │
// │   └── Send response
// │       ├── score
// │       ├── certified
// │       ├── imageHash
// │       ├── txHash
// │       ├── blockNumber
// │       └── status
// │
// ├── checkHash()
// │   ├── validates hash param
// │   │   ├── required
// │   │   └── min 8 chars
// │   ├── looks up on blockchain
// │   └── returns exists + record
// │
// └── deleteFile()
//     ├── wraps fs.unlink in Promise
//     └── ignores ENOENT error
// ```

// ```

// ### Full verification flow
// ```
// ```
// POST /api/verify
//   (multipart/form-data, artwork=sunset.png)
//         ↓
// multer saves to uploads/timestamp-sunset.png
//         ↓
// hashImageFile()
//   → "0x3f9a8b2cd4e5f..."
//         ↓
// lookupHash("0x3f9a...")
//   → null (not duplicate)
//         ↓
// analyzeImageWithAI(filePath)
//   → { score: 97, certified: true, style: "abstract" }
//         ↓
// storeOnBlockchain({ imageHash, score, certified, fileName })
//   → { txHash: "0xabc1...", blockNumber: 5842301 }
//         ↓
// deleteFile(filePath)
//   → uploads/timestamp-sunset.png deleted
//         ↓
// res.json({ success: true, data: { ... } })
// ```

// ```

// ### API responses
// ```
// ```
// POST /api/verify — success

// {
//   "success":   true,
//   "duplicate": false,
//   "data": {
//     "score":       97,
//     "certified":   true,
//     "imageHash":   "0x3f9a...",
//     "fileName":    "sunset.png",
//     "fileSize":    2457600,
//     "mimeType":    "image/png",
//     "txHash":      "0xabc1...",
//     "blockNumber": 5842301,
//     "gasUsed":     88000,
//     "network":     "sepolia",
//     "timestamp":   1710000000,
//     "date":        "2026-03-12T10:00:00.000Z",
//     "status":      "CERTIFIED",
//     "details":     "Highly original abstract composition",
//     "style":       "abstract"
//   }
// }


// POST /api/verify — duplicate

// {
//   "success":   true,
//   "duplicate": true,
//   "message":   "This artwork has already been verified.",
//   "data": {
//     "score":     97,
//     "certified": true,
//     "imageHash": "0x3f9a...",
//     "status":    "CERTIFIED"
//   }
// }


// GET /api/verify/:hash — found

// {
//   "success": true,
//   "exists":  true,
//   "data": {
//     "imageHash":  "0x3f9a...",
//     "score":      97,
//     "certified":  true,
//     "fileName":   "sunset.png",
//     "timestamp":  1710000000,
//     "submitter":  "0xABC...123",
//     "date":       "2026-03-12T10:00:00.000Z",
//     "status":     "CERTIFIED"
//   }
// }


// GET /api/verify/:hash — not found

// {
//   "success": true,
//   "exists":  false,
//   "data":    null
// }
// ```

// ```

// ### Error responses
// ```
// ```
// No file uploaded:
// {
//   "success": false,
//   "error":   "No artwork file uploaded. Please attach an image."
// }

// Hash too short:
// {
//   "success": false,
//   "error":   "Hash is too short. Provide full SHA256 hash."
// }

// Hash missing:
// {
//   "success": false,
//   "error":   "Hash parameter is required."
// }
// ```

// ```

// ### Console log output
// ```
// ```
// [VERIFY] Starting verification
// [VERIFY] File:     sunset.png
// [VERIFY] Type:     image/png
// [VERIFY] Size:     2400.0 KB
// [VERIFY] Path:     uploads/1710000000-sunset.png
// [VERIFY] Step 1 — Hashing image...
// [VERIFY] Hash: 0x3f9a8b2cd4e5f6b24c...
// [VERIFY] Step 2 — Checking for duplicate...
// [VERIFY] Step 3 — Running AI analysis...
// [VERIFY] AI score:     97
// [VERIFY] AI certified: true
// [VERIFY] AI style:     abstract
// [VERIFY] Step 4 — Storing on blockchain...
// [VERIFY] TX Hash:     0xabc123...
// [VERIFY] Block:       5842301
// [VERIFY] Gas used:    88000
// [VERIFY] Step 5 — Cleaning up temp file...
// [VERIFY] Verification complete ✓
// ```