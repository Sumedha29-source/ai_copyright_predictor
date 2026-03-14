// backend/middleware/upload.js
// middleware/upload.js
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ==============================
// Allowed File Types
// ==============================

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".svg",
  ".gif",
];

// ==============================
// Max File Size
// 50MB in bytes
// ==============================

const MAX_FILE_SIZE = parseInt(
  process.env.MAX_FILE_SIZE || "52428800"
);

// ==============================
// Upload Directory
// ==============================

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads/";

// ==============================
// Ensure Upload Directory Exists
// Creates it if not present
// ==============================

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`[UPLOAD] Created upload directory: ${UPLOAD_DIR}`);
}

// ==============================
// Disk Storage Config
//
// Saves files to disk rather
// than memory for large files.
// ==============================

const storage = multer.diskStorage({

  // ==============================
  // Destination Folder
  // ==============================

  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  // ==============================
  // File Name
  //
  // Format:
  //   timestamp-originalname
  //   1710000000000-sunset.png
  //
  // Prevents collisions between
  // files with same name.
  // ==============================

  filename: (req, file, cb) => {
    const timestamp    = Date.now();
    const originalName = file.originalname
      .replace(/\s+/g, "-")          // spaces → dashes
      .replace(/[^a-zA-Z0-9.\-_]/g, "") // remove special chars
      .toLowerCase();

    const fileName = `${timestamp}-${originalName}`;
    cb(null, fileName);
  },

});

// ==============================
// File Filter
//
// Validates file type before
// saving to disk.
//
// Checks both:
//   - MIME type from browser
//   - File extension
// ==============================

const fileFilter = (req, file, cb) => {

  // Check MIME type
  const mimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);

  // Check extension
  const ext        = path.extname(file.originalname).toLowerCase();
  const extAllowed = ALLOWED_EXTENSIONS.includes(ext);

  // ==============================
  // Both must pass
  // ==============================

  if (mimeAllowed && extAllowed) {
    console.log(`[UPLOAD] Accepted: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  } else {
    console.warn(
      `[UPLOAD] Rejected: ${file.originalname} — mime=${file.mimetype} ext=${ext}`
    );

    // Create custom error
    const err      = new Error(
      `Invalid file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP, SVG, GIF.`
    );
    err.code       = "INVALID_FILE_TYPE";
    err.statusCode = 400;
    cb(err, false);
  }
};

// ==============================
// Multer Instance
// ==============================

const uploadMiddleware = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:  MAX_FILE_SIZE,
    files:     1,
    fields:    10,
    fieldSize: 1024 * 1024,     // 1MB per field
  },
});

// ==============================
// Single File Upload
//
// Wraps multer in a Promise
// for async/await usage.
//
// Field name: "artwork"
// ==============================

const uploadSingle = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadMiddleware.single("artwork")(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(req.file);
      }
    });
  });
};

// ==============================
// Multiple File Upload
//
// Accepts up to 5 files.
// Field name: "artworks"
// ==============================

const uploadMultiple = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadMiddleware.array("artworks", 5)(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(req.files);
      }
    });
  });
};

// ==============================
// Clean Up Old Files
//
// Deletes files older than
// maxAgeMs from uploads dir.
//
// Run periodically to prevent
// disk filling up.
// ==============================

const cleanUpOldFiles = (maxAgeMs = 24 * 60 * 60 * 1000) => {
  try {
    const now   = Date.now();
    const files = fs.readdirSync(UPLOAD_DIR);

    let deleted = 0;

    files.forEach((file) => {
      const filePath = path.join(UPLOAD_DIR, file);

      try {
        const stats = fs.statSync(filePath);
        const age   = now - stats.mtimeMs;

        if (age > maxAgeMs) {
          fs.unlinkSync(filePath);
          deleted++;
          console.log(`[UPLOAD] Cleaned up old file: ${file}`);
        }
      } catch (fileErr) {
        console.warn(`[UPLOAD] Could not stat file: ${file}`);
      }
    });

    if (deleted > 0) {
      console.log(`[UPLOAD] Cleaned up ${deleted} old file(s)`);
    }

  } catch (err) {
    console.error("[UPLOAD] cleanUpOldFiles error:", err.message);
  }
};

// ==============================
// Get File Info
//
// Returns metadata about an
// uploaded file.
// ==============================

const getFileInfo = (file) => {
  if (!file) return null;

  return {
    originalName: file.originalname,
    savedName:    file.filename,
    path:         file.path,
    size:         file.size,
    sizeKB:       (file.size / 1024).toFixed(1),
    sizeMB:       (file.size / 1024 / 1024).toFixed(2),
    mimeType:     file.mimetype,
    extension:    path.extname(file.originalname).toLowerCase(),
    uploadedAt:   new Date().toISOString(),
  };
};

// ==============================
// Exports
// ==============================

module.exports = {
  uploadMiddleware,
  uploadSingle,
  uploadMultiple,
  cleanUpOldFiles,
  getFileInfo,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
// ```

// ---

// ### What each part does
// ```
// ```
// upload.js
// │
// ├── ALLOWED_MIME_TYPES
// │   ├── image/jpeg
// │   ├── image/jpg
// │   ├── image/png
// │   ├── image/webp
// │   ├── image/svg+xml
// │   └── image/gif
// │
// ├── ALLOWED_EXTENSIONS
// │   ├── .jpg .jpeg
// │   ├── .png
// │   ├── .webp
// │   ├── .svg
// │   └── .gif
// │
// ├── MAX_FILE_SIZE
// │   └── 50MB (from .env)
// │
// ├── UPLOAD_DIR
// │   └── uploads/ (from .env)
// │
// ├── Directory creation
// │   └── creates uploads/ if missing
// │
// ├── storage (diskStorage)
// │   ├── destination → uploads/
// │   └── filename
// │       ├── timestamp prefix
// │       ├── spaces → dashes
// │       ├── removes special chars
// │       └── lowercased
// │
// ├── fileFilter
// │   ├── checks MIME type
// │   ├── checks file extension
// │   ├── both must pass
// │   └── rejects with INVALID_FILE_TYPE
// │
// ├── uploadMiddleware (multer)
// │   ├── storage
// │   ├── fileFilter
// │   └── limits
// │       ├── fileSize  → 50MB
// │       ├── files     → 1
// │       ├── fields    → 10
// │       └── fieldSize → 1MB
// │
// ├── uploadSingle()
// │   ├── wraps multer in Promise
// │   ├── field name "artwork"
// │   └── async/await friendly
// │
// ├── uploadMultiple()
// │   ├── wraps multer in Promise
// │   ├── field name "artworks"
// │   └── max 5 files
// │
// ├── cleanUpOldFiles()
// │   ├── reads uploads/ dir
// │   ├── checks file age
// │   └── deletes files > maxAgeMs
// │       default 24 hours
// │
// └── getFileInfo()
//     ├── originalName
//     ├── savedName
//     ├── path
//     ├── size / sizeKB / sizeMB
//     ├── mimeType
//     ├── extension
//     └── uploadedAt
// ```

// ```

// ### How filename is generated
// ```
// ```
// Original:  "My Sunset Art!@#.PNG"
//         ↓
// spaces → dashes:   "My-Sunset-Art!@#.PNG"
//         ↓
// remove specials:   "My-Sunset-Art.PNG"
//         ↓
// lowercase:         "my-sunset-art.png"
//         ↓
// add timestamp:     "1710000000000-my-sunset-art.png"

// Result: uploads/1710000000000-my-sunset-art.png
// ```

// ```

// ### How fileFilter works
// ```
// ```
// File arrives with:
//   mimetype:  "image/png"
//   filename:  "sunset.png"

// Check 1 — MIME type:
//   ALLOWED_MIME_TYPES.includes("image/png") → true ✓

// Check 2 — Extension:
//   path.extname("sunset.png") → ".png"
//   ALLOWED_EXTENSIONS.includes(".png") → true ✓

// Both pass → file accepted ✓


// File arrives with:
//   mimetype:  "application/pdf"
//   filename:  "document.pdf"

// Check 1 — MIME type:
//   ALLOWED_MIME_TYPES.includes("application/pdf") → false ✗

// Rejected → INVALID_FILE_TYPE error
// ```