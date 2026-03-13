// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ==============================
// OpenZeppelin Imports
// ==============================

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ==============================
// CopyrightVerifier Contract
//
// Stores artwork verification
// results permanently on chain.
//
// Each record contains:
//   - image hash  (SHA256)
//   - score       (0-100)
//   - certified   (score >= 70)
//   - file name
//   - timestamp
//   - submitter
// ==============================

contract CopyrightVerifier is Ownable, ReentrancyGuard {

    // ==============================
    // Structs
    // ==============================

    struct Verification {
        string  imageHash;      // SHA256 of image
        uint8   score;          // originality 0-100
        bool    certified;      // score >= 70
        string  fileName;       // original file name
        uint256 timestamp;      // block.timestamp
        address submitter;      // wallet address
        bool    exists;         // record exists flag
    }

    // ==============================
    // State Variables
    // ==============================

    // imageHash → Verification
    mapping(string => Verification) private verifications;

    // index → imageHash
    mapping(uint256 => string) private verificationIndex;

    // total stored records
    uint256 private totalCount;

    // ==============================
    // Constants
    // ==============================

    uint8 private constant MAX_SCORE       = 100;
    uint8 private constant CERT_THRESHOLD  = 70;

    // ==============================
    // Events
    // ==============================

    event VerificationStored(
        string  indexed imageHash,
        uint8           score,
        bool            certified,
        string          fileName,
        uint256         timestamp,
        address indexed submitter
    );

    event VerificationDeleted(
        string  indexed imageHash,
        address indexed deletedBy
    );

    // ==============================
    // Custom Errors
    //
    // Cheaper than require strings.
    // Saves gas on reverts.
    // ==============================

    error EmptyImageHash();
    error EmptyFileName();
    error ScoreOutOfRange(uint8 score);
    error AlreadyVerified(string imageHash);
    error VerificationNotFound(string imageHash);
    error IndexOutOfRange(uint256 index, uint256 total);

    // ==============================
    // Constructor
    // ==============================

    constructor() Ownable(msg.sender) {}

    // ==============================
    // Store Verification
    //
    // Stores a new artwork
    // verification record.
    //
    // Reverts if:
    //   - hash is empty
    //   - fileName is empty
    //   - score > 100
    //   - hash already stored
    //
    // Returns record ID (index)
    // ==============================

    function storeVerification(
        string memory imageHash,
        uint8         score,
        bool          certified,
        string memory fileName
    )
        external
        nonReentrant
        returns (uint256 recordId)
    {

        // ==============================
        // Validations
        // ==============================

        if (bytes(imageHash).length == 0) {
            revert EmptyImageHash();
        }

        if (bytes(fileName).length == 0) {
            revert EmptyFileName();
        }

        if (score > MAX_SCORE) {
            revert ScoreOutOfRange(score);
        }

        if (verifications[imageHash].exists) {
            revert AlreadyVerified(imageHash);
        }

        // ==============================
        // Store Record
        //
        // Note: certified is always
        // derived from score on chain.
        // The certified param is
        // ignored — score is truth.
        // ==============================

        verifications[imageHash] = Verification({
            imageHash:  imageHash,
            score:      score,
            certified:  score >= CERT_THRESHOLD,
            fileName:   fileName,
            timestamp:  block.timestamp,
            submitter:  msg.sender,
            exists:     true
        });

        // ==============================
        // Update Index
        // ==============================

        verificationIndex[totalCount] = imageHash;
        recordId                      = totalCount;
        totalCount++;

        // ==============================
        // Emit Event
        // ==============================

        emit VerificationStored(
            imageHash,
            score,
            score >= CERT_THRESHOLD,
            fileName,
            block.timestamp,
            msg.sender
        );

        return recordId;
    }

    // ==============================
    // Get Verification by Hash
    //
    // Returns full record for
    // a given image hash.
    //
    // Reverts if not found.
    // ==============================

    function getVerification(
        string memory imageHash
    )
        external
        view
        returns (
            string  memory hash,
            uint8          score,
            bool           certified,
            string  memory fileName,
            uint256        timestamp,
            address        submitter
        )
    {
        if (!verifications[imageHash].exists) {
            revert VerificationNotFound(imageHash);
        }

        Verification memory v = verifications[imageHash];

        return (
            v.imageHash,
            v.score,
            v.certified,
            v.fileName,
            v.timestamp,
            v.submitter
        );
    }

    // ==============================
    // Get Verification by ID
    //
    // Returns record by its
    // index number.
    //
    // Reverts if out of range.
    // ==============================

    function getVerificationById(
        uint256 id
    )
        external
        view
        returns (
            string  memory hash,
            uint8          score,
            bool           certified,
            string  memory fileName,
            uint256        timestamp,
            address        submitter
        )
    {
        if (id >= totalCount) {
            revert IndexOutOfRange(id, totalCount);
        }

        string memory imageHash = verificationIndex[id];
        Verification memory v   = verifications[imageHash];

        return (
            v.imageHash,
            v.score,
            v.certified,
            v.fileName,
            v.timestamp,
            v.submitter
        );
    }

    // ==============================
    // Get All Verifications
    //
    // Returns paginated list of
    // all stored verifications.
    //
    // Params:
    //   skip  → start index
    //   limit → max to return
    // ==============================

    function getAllVerifications(
        uint256 skip,
        uint256 limit
    )
        external
        view
        returns (Verification[] memory results)
    {
        // Empty state
        if (totalCount == 0) {
            return new Verification[](0);
        }

        // Skip past end
        if (skip >= totalCount) {
            return new Verification[](0);
        }

        // Calculate count
        uint256 remaining = totalCount - skip;
        uint256 count     = remaining < limit
            ? remaining
            : limit;

        // Build array
        results = new Verification[](count);

        for (uint256 i = 0; i < count; i++) {
            string memory h = verificationIndex[skip + i];
            results[i]      = verifications[h];
        }

        return results;
    }

    // ==============================
    // Get Total Verifications
    //
    // Returns total count of
    // stored records.
    // ==============================

    function getTotalVerifications()
        external
        view
        returns (uint256)
    {
        return totalCount;
    }

    // ==============================
    // Hash Exists
    //
    // Returns true if image hash
    // is already stored.
    // ==============================

    function hashExists(
        string memory imageHash
    )
        external
        view
        returns (bool)
    {
        return verifications[imageHash].exists;
    }

    // ==============================
    // Get Verifications by Submitter
    //
    // Returns all records from
    // a given wallet address.
    // ==============================

    function getVerificationsBySubmitter(
        address submitter
    )
        external
        view
        returns (Verification[] memory results)
    {
        // Count matches
        uint256 matchCount = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            if (verifications[h].submitter == submitter) {
                matchCount++;
            }
        }

        // Build array
        results           = new Verification[](matchCount);
        uint256 resultIdx = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            if (verifications[h].submitter == submitter) {
                results[resultIdx] = verifications[h];
                resultIdx++;
            }
        }

        return results;
    }

    // ==============================
    // Get Certified Verifications
    //
    // Returns only records where
    // certified == true.
    // ==============================

    function getCertifiedVerifications()
        external
        view
        returns (Verification[] memory results)
    {
        // Count certified
        uint256 certCount = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            if (verifications[h].certified) {
                certCount++;
            }
        }

        // Build array
        results           = new Verification[](certCount);
        uint256 resultIdx = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            if (verifications[h].certified) {
                results[resultIdx] = verifications[h];
                resultIdx++;
            }
        }

        return results;
    }

    // ==============================
    // Get Flagged Verifications
    //
    // Returns only records where
    // certified == false.
    // ==============================

    function getFlaggedVerifications()
        external
        view
        returns (Verification[] memory results)
    {
        // Count flagged
        uint256 flagCount = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            if (!verifications[h].certified) {
                flagCount++;
            }
        }

        // Build array
        results           = new Verification[](flagCount);
        uint256 resultIdx = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            if (!verifications[h].certified) {
                results[resultIdx] = verifications[h];
                resultIdx++;
            }
        }

        return results;
    }

    // ==============================
    // Get Score Range
    //
    // Returns records where score
    // is between min and max.
    //
    // Params:
    //   minScore → minimum score
    //   maxScore → maximum score
    // ==============================

    function getVerificationsByScoreRange(
        uint8 minScore,
        uint8 maxScore
    )
        external
        view
        returns (Verification[] memory results)
    {
        require(
            minScore <= maxScore,
            "minScore must be <= maxScore"
        );

        // Count matches
        uint256 matchCount = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            uint8  s        = verifications[h].score;
            if (s >= minScore && s <= maxScore) {
                matchCount++;
            }
        }

        // Build array
        results           = new Verification[](matchCount);
        uint256 resultIdx = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            string memory h = verificationIndex[i];
            uint8  s        = verifications[h].score;
            if (s >= minScore && s <= maxScore) {
                results[resultIdx] = verifications[h];
                resultIdx++;
            }
        }

        return results;
    }

    // ==============================
    // Delete Verification
    //
    // Removes a record by hash.
    // Only callable by owner.
    // ==============================

    function deleteVerification(
        string memory imageHash
    )
        external
        onlyOwner
        nonReentrant
    {
        if (!verifications[imageHash].exists) {
            revert VerificationNotFound(imageHash);
        }

        delete verifications[imageHash];

        emit VerificationDeleted(imageHash, msg.sender);
    }

    // ==============================
    // Get Contract Info
    //
    // Returns contract stats.
    // ==============================

    function getContractInfo()
        external
        view
        returns (
            uint256 total,
            uint8   certThreshold,
            address contractOwner
        )
    {
        return (
            totalCount,
            CERT_THRESHOLD,
            owner()
        );
    }

}


/*

### What each function does
```
CopyrightVerifier.sol
│
├── storeVerification()       WRITE
│   ├── validates hash, fileName, score
│   ├── checks no duplicate
│   ├── derives certified from score
│   ├── stores to mapping
│   ├── updates index
│   ├── emits VerificationStored
│   └── returns recordId
│
├── getVerification()         READ
│   ├── looks up by hash
│   ├── reverts if not found
│   └── returns full record
│
├── getVerificationById()     READ
│   ├── looks up by index
│   ├── reverts if out of range
│   └── returns full record
│
├── getAllVerifications()      READ
│   ├── skip + limit pagination
│   └── returns Verification[]
│
├── getTotalVerifications()   READ
│   └── returns totalCount
│
├── hashExists()              READ
│   └── returns bool
│
├── getVerificationsBySubmitter() READ
│   ├── loops all records
│   ├── filters by address
│   └── returns matches[]
│
├── getCertifiedVerifications() READ
│   ├── loops all records
│   ├── filters certified == true
│   └── returns matches[]
│
├── getFlaggedVerifications() READ
│   ├── loops all records
│   ├── filters certified == false
│   └── returns matches[]
│
├── getVerificationsByScoreRange() READ
│   ├── validates min <= max
│   ├── filters by score range
│   └── returns matches[]
│
├── deleteVerification()      WRITE
│   ├── onlyOwner
│   ├── checks exists
│   ├── deletes record
│   └── emits VerificationDeleted
│
└── getContractInfo()         READ
    └── returns total + threshold + owner
```

---

### Storage layout
```
verifications mapping:

  "0x3f9a..." → Verification {
    imageHash:  "0x3f9a...",
    score:      97,
    certified:  true,
    fileName:   "sunset.png",
    timestamp:  1710000000,
    submitter:  0xABC...123,
    exists:     true
  }

verificationIndex mapping:

  0 → "0x3f9a..."
  1 → "0x8c12..."
  2 → "0x1d04..."

totalCount:

  3
```

---

### Score → certified logic
```
score >= 70  →  certified = true   ✦
score <  70  →  certified = false  ⚠

Examples:
  100 → CERTIFIED ✦
   97 → CERTIFIED ✦
   70 → CERTIFIED ✦
   69 → FLAGGED   ⚠
   45 → FLAGGED   ⚠
    0 → FLAGGED   ⚠

The certified param passed to
storeVerification() is ignored.
Score is always the source of truth.
```

---

### Custom errors vs require
```
// Old way — string in bytecode
require(score <= 100, "Score out of range");

// New way — cheaper gas
error ScoreOutOfRange(uint8 score);
revert ScoreOutOfRange(score);

Benefits:
  ✓ smaller bytecode
  ✓ cheaper to deploy
  ✓ cheaper to revert
  ✓ typed params in error
```

---

### Security features
```
ReentrancyGuard
└── on storeVerification()
    and deleteVerification()
    prevents reentrancy attacks

Ownable
└── deleteVerification()
    only contract owner

private mappings
└── not directly readable
    only via view functions

Custom errors
└── no string interpolation
    safer + cheaper

exists flag
└── distinguishes empty
    struct from real record
```

---

### How to compile and deploy
```
Step 1 — Install deps
cd contracts
npm install

Step 2 — Compile
npm run compile

Step 3 — Run tests
npm test

Step 4 — Deploy local
npm run node          ← terminal 1
npm run deploy:local  ← terminal 2

Step 5 — Deploy Sepolia
npm run deploy:sepolia

Step 6 — Copy to backend/.env
CONTRACT_ADDRESS=0x...
```

---

### Quick copy guide

| File | Paste into |
|---|---|
| `CopyrightVerifier.sol` | `contracts/contracts/CopyrightVerifier.sol` |

---

### Location reminder
```
contracts/
├── contracts/
│   └── CopyrightVerifier.sol     ← HERE
├── scripts/
│   └── deploy.js
├── test/
│   └── CopyrightVerifier.test.js
├── hardhat.config.js
└── package.json
*/
