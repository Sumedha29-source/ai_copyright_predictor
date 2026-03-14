// backend/controllers/historyController.js
// controllers/historyController.js
const { getVerificationHistory, getVerificationById } =
  require("../services/blockchainService");

// ==============================
// Get All History
//
// Returns paginated list of
// all verification records
// from the blockchain.
//
// Query params:
//   page  → page number (default 1)
//   limit → records per page (default 10)
// ==============================

const getAllHistory = async (req, res, next) => {
  try {

    // ==============================
    // Parse Query Params
    // ==============================

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    console.log(
      `[HISTORY] getAllHistory page=${page} limit=${limit} skip=${skip}`
    );

    // ==============================
    // Fetch from Blockchain
    // ==============================

    const { records, total } = await getVerificationHistory({
      skip,
      limit,
    });

    // ==============================
    // Format Records
    // ==============================

    const formatted = records.map((r) => formatRecord(r));

    // ==============================
    // Build Pagination Meta
    // ==============================

    const totalPages  = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // ==============================
    // Send Response
    // ==============================

    return res.status(200).json({
      success: true,
      data:    formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });

  } catch (error) {
    console.error("[HISTORY] getAllHistory error:", error.message);
    next(error);
  }
};

// ==============================
// Get History By ID
//
// Returns a single verification
// record by its blockchain ID.
//
// Params:
//   id → record index on chain
// ==============================

const getHistoryById = async (req, res, next) => {
  try {

    const { id } = req.params;

    // ==============================
    // Validate ID
    // ==============================

    const recordId = parseInt(id);

    if (isNaN(recordId) || recordId < 0) {
      return res.status(400).json({
        success: false,
        error:   "Invalid record ID. Must be a non-negative integer.",
      });
    }

    console.log(`[HISTORY] getHistoryById id=${recordId}`);

    // ==============================
    // Fetch from Blockchain
    // ==============================

    const record = await getVerificationById(recordId);

    // ==============================
    // Handle Not Found
    // ==============================

    if (!record) {
      return res.status(404).json({
        success: false,
        error:   `Record with ID ${recordId} not found.`,
      });
    }

    // ==============================
    // Send Response
    // ==============================

    return res.status(200).json({
      success: true,
      data:    formatRecord(record),
    });

  } catch (error) {

    // Blockchain index out of range
    if (error.message?.includes("IndexOutOfRange")) {
      return res.status(404).json({
        success: false,
        error:   `Record with ID ${req.params.id} not found.`,
      });
    }

    console.error("[HISTORY] getHistoryById error:", error.message);
    next(error);
  }
};

// ==============================
// Search History
//
// Searches verification records
// by title or image hash.
//
// Query params:
//   query → search string
//   page  → page number
//   limit → records per page
// ==============================

const searchHistory = async (req, res, next) => {
  try {

    const query = (req.query.query || "").trim();
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    // ==============================
    // Validate Query
    // ==============================

    if (!query) {
      return res.status(400).json({
        success: false,
        error:   "Query parameter is required.",
      });
    }

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        error:   "Query must be at least 2 characters.",
      });
    }

    console.log(`[HISTORY] searchHistory query="${query}"`);

    // ==============================
    // Fetch and Filter
    // ==============================

    const { records, total } = await getVerificationHistory({
      skip:   0,
      limit:  1000,
      search: query,
    });

    // ==============================
    // Paginate Results
    // ==============================

    const totalPages  = Math.ceil(records.length / limit);
    const paginated   = records.slice(skip, skip + limit);
    const formatted   = paginated.map((r) => formatRecord(r));

    // ==============================
    // Send Response
    // ==============================

    return res.status(200).json({
      success: true,
      query,
      data:    formatted,
      pagination: {
        page,
        limit,
        total:      records.length,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error("[HISTORY] searchHistory error:", error.message);
    next(error);
  }
};

// ==============================
// Delete History By ID
//
// Deletes a verification record
// from the blockchain.
// Owner wallet only.
//
// Params:
//   id → record index on chain
// ==============================

const deleteHistoryById = async (req, res, next) => {
  try {

    const { id } = req.params;

    // ==============================
    // Validate ID
    // ==============================

    const recordId = parseInt(id);

    if (isNaN(recordId) || recordId < 0) {
      return res.status(400).json({
        success: false,
        error:   "Invalid record ID. Must be a non-negative integer.",
      });
    }

    console.log(`[HISTORY] deleteHistoryById id=${recordId}`);

    // ==============================
    // Fetch Record First
    // Need hash to delete
    // ==============================

    const record = await getVerificationById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        error:   `Record with ID ${recordId} not found.`,
      });
    }

    // ==============================
    // Delete from Blockchain
    // ==============================

    const { deleteVerification } =
      require("../services/blockchainService");

    await deleteVerification(record.imageHash);

    // ==============================
    // Send Response
    // ==============================

    return res.status(200).json({
      success: true,
      message: `Record ${recordId} deleted successfully.`,
      data: {
        id:        recordId,
        imageHash: record.imageHash,
        deletedAt: new Date().toISOString(),
      },
    });

  } catch (error) {

    // Not authorized
    if (error.message?.includes("OwnableUnauthorizedAccount")) {
      return res.status(403).json({
        success: false,
        error:   "Not authorized. Only the contract owner can delete records.",
      });
    }

    // Not found on chain
    if (
      error.message?.includes("IndexOutOfRange") ||
      error.message?.includes("VerificationNotFound")
    ) {
      return res.status(404).json({
        success: false,
        error:   `Record with ID ${req.params.id} not found.`,
      });
    }

    console.error("[HISTORY] deleteHistoryById error:", error.message);
    next(error);
  }
};

// ==============================
// Format Record Helper
//
// Converts raw blockchain data
// into clean API response shape.
// ==============================

const formatRecord = (record) => {
  return {
    id:          record.id           ?? null,
    imageHash:   record.imageHash    ?? "",
    score:       Number(record.score ?? 0),
    certified:   Boolean(record.certified),
    fileName:    record.fileName     ?? "",
    timestamp:   Number(record.timestamp ?? 0),
    submitter:   record.submitter    ?? "",
    date:        record.timestamp
      ? new Date(
          Number(record.timestamp) * 1000
        ).toISOString()
      : null,
    status:      record.certified
      ? "CERTIFIED"
      : "FLAGGED",
    certId:      record.id !== undefined
      ? formatCertId(record.id)
      : null,
  };
};

// ==============================
// Format Cert ID Helper
//
// Converts numeric ID to
// human readable cert ID.
//
// 142 → CERT-2026-00142
// ==============================

const formatCertId = (id) => {
  const year    = new Date().getFullYear();
  const padded  = String(id).padStart(5, "0");
  return `CERT-${year}-${padded}`;
};

// ==============================
// Exports
// ==============================

module.exports = {
  getAllHistory,
  getHistoryById,
  searchHistory,
  deleteHistoryById,
};
// ```

// ---

// ### What each part does
// ```
// ```
// historyController.js
// │
// ├── getAllHistory()
// │   ├── parses page + limit params
// │   ├── calculates skip offset
// │   ├── fetches from blockchain
// │   ├── formats each record
// │   └── returns paginated response
// │       ├── data
// │       └── pagination meta
// │
// ├── getHistoryById()
// │   ├── validates ID is integer >= 0
// │   ├── fetches single record by ID
// │   ├── handles IndexOutOfRange error
// │   └── returns formatted record
// │
// ├── searchHistory()
// │   ├── validates query param
// │   │   ├── required
// │   │   └── min 2 chars
// │   ├── fetches all records
// │   ├── filters by query
// │   ├── paginates results
// │   └── returns matches + meta
// │
// ├── deleteHistoryById()
// │   ├── validates ID
// │   ├── fetches record for hash
// │   ├── calls deleteVerification()
// │   ├── handles not authorized error
// │   └── returns deleted record info
// │
// ├── formatRecord()
// │   ├── converts BigInt → Number
// │   ├── adds human readable date
// │   ├── adds CERTIFIED/FLAGGED status
// │   └── adds formatted cert ID
// │
// └── formatCertId()
//     └── 142 → CERT-2026-00142
// ```

// ```

// ### API responses
// ```
// ```
// GET /api/history

// {
//   "success": true,
//   "data": [
//     {
//       "id":        0,
//       "imageHash": "0x3f9a...",
//       "score":     97,
//       "certified": true,
//       "fileName":  "sunset.png",
//       "timestamp": 1710000000,
//       "submitter": "0xABC...123",
//       "date":      "2026-03-12T10:00:00.000Z",
//       "status":    "CERTIFIED",
//       "certId":    "CERT-2026-00001"
//     }
//   ],
//   "pagination": {
//     "page":        1,
//     "limit":       10,
//     "total":       42,
//     "totalPages":  5,
//     "hasNextPage": true,
//     "hasPrevPage": false
//   }
// }


// GET /api/history/search?query=sunset

// {
//   "success": true,
//   "query":   "sunset",
//   "data":    [...],
//   "pagination": { ... }
// }


// DELETE /api/history/0

// {
//   "success": true,
//   "message": "Record 0 deleted successfully.",
//   "data": {
//     "id":        0,
//     "imageHash": "0x3f9a...",
//     "deletedAt": "2026-03-12T10:00:00.000Z"
//   }
// }
// ```

// ```

// ### Error responses
// ```
// ```
// Invalid ID:
// {
//   "success": false,
//   "error":   "Invalid record ID. Must be a non-negative integer."
// }

// Not found:
// {
//   "success": false,
//   "error":   "Record with ID 99 not found."
// }

// Not authorized:
// {
//   "success": false,
//   "error":   "Not authorized. Only the contract owner can delete records."
// }

// Empty search:
// {
//   "success": false,
//   "error":   "Query parameter is required."
// }

// Short search:
// {
//   "success": false,
//   "error":   "Query must be at least 2 characters."
// }
// ```

// ```

// ### Pagination logic
// ```
// ```
// page  = 1, limit = 10
// skip  = (1 - 1) * 10 = 0
// fetch records 0 → 9

// page  = 2, limit = 10
// skip  = (2 - 1) * 10 = 10
// fetch records 10 → 19

// page  = 3, limit = 5
// skip  = (3 - 1) * 5 = 10
// fetch records 10 → 14

// max limit capped at 50
// min page  clamped to 1
// ```