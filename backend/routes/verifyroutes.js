// backend/routes/verifyRoutes.js
import express              from "express";
import { verifyArtwork, checkHash } from "../controllers/verifyController.js";
import { uploadMiddleware }  from "../middleware/upload.js";
import { errorHandler }      from "../middleware/errorhandler.js";

const router = express.Router();

// ==============================
// POST /api/verify
// Upload image and verify
// ==============================

router.post(
  "/",
  uploadMiddleware.single("artwork"),  // accept single file with field name "artwork"
  verifyArtwork                        // pass to controller
);

// ==============================
// GET /api/verify/:hash
// Check if hash exists on
// blockchain already
// ==============================

router.get(
  "/:hash",
  checkHash
);

// ==============================
// Error handler for this router
// ==============================

router.use(errorHandler);

export default router;
```

---

### What each part does
```
```
verifyRoutes.js
│
├── POST /api/verify
│   ├── uploadMiddleware.single("artwork")
│   │   └── multer saves file to uploads/
│   └── verifyArtwork()
│       └── runs AI + blockchain logic
│
├── GET /api/verify/:hash
│   └── checkHash()
│       └── looks up hash on blockchain
│
└── errorHandler
    └── catches any route errors
```