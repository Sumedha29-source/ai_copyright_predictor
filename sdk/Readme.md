# facinet-sdk

> JavaScript SDK for the ArtChain Copyright Verification Protocol.
> Verify artwork originality and retrieve certificates from the Ethereum blockchain.

---

## Installation
```bash
npm install facinet-sdk
```

---

## Requirements

- Node.js >= 18.0.0
- Ethereum RPC URL (Alchemy / Infura / public)
- Deployed CopyrightVerifier contract address

---

## Quick Start
```js
const { ArtChainSDK } = require("facinet-sdk");

const sdk = new ArtChainSDK({
  rpcUrl:          "https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY",
  contractAddress: "0x1234...abcd",
  network:         "sepolia",
});

// Verify an artwork file
const result = await sdk.verify("./sunset.png");

console.log(result.score);      // 97
console.log(result.certified);  // true
console.log(result.txHash);     // 0xabc1...
```

---

## Setup

### Step 1 — Install
```bash
npm install facinet-sdk
```

### Step 2 — Create `.env`
```env
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0x1234...abcd
NETWORK_NAME=sepolia
PRIVATE_KEY=0x...
```

### Step 3 — Initialize SDK
```js
const { ArtChainSDK } = require("facinet-sdk");

const sdk = new ArtChainSDK({
  rpcUrl:          process.env.ETHEREUM_RPC_URL,
  contractAddress: process.env.CONTRACT_ADDRESS,
  network:         process.env.NETWORK_NAME,
  apiKey:          process.env.OPENAI_API_KEY,
});
```

---

## Usage

### Verify from file path
```js
const result = await sdk.verify("./artwork.png");

console.log(result);
// {
//   score:       97,
//   certified:   true,
//   imageHash:   "0x3f9a...",
//   txHash:      "0xabc1...",
//   blockNumber: 5842301,
//   network:     "sepolia",
//   fileName:    "artwork.png",
//   timestamp:   1710000000
// }
```

---

### Verify from Buffer
```js
const fs     = require("fs");
const buffer = fs.readFileSync("./artwork.png");

const result = await sdk.verifyBuffer(buffer, "artwork.png");
console.log(result.score);
```

---

### Verify from Base64
```js
const base64 = "data:image/png;base64,iVBOR...";

const result = await sdk.verifyBase64(base64, "artwork.png");
console.log(result.certified);
```

---

### Check if artwork exists
```js
const exists = await sdk.exists("0x3f9a8b2c...");

console.log(exists); // true or false
```

---

### Get verification status
```js
const status = await sdk.status("0x3f9a8b2c...");

console.log(status);
// "CERTIFIED"  → score >= 70
// "FLAGGED"    → score <  70
// "NOT_FOUND"  → not on chain
```

---

### Get certificate by hash
```js
const cert = await sdk.getCertificate("0x3f9a8b2c...");

console.log(cert);
// {
//   id:          "CERT-2026-00142",
//   imageHash:   "0x3f9a...",
//   score:       97,
//   certified:   true,
//   fileName:    "artwork.png",
//   timestamp:   1710000000,
//   submitter:   "0xABC...123",
//   issuedBy:    "ArtChain Protocol"
// }
```

---

### Get certificate by ID
```js
const cert = await sdk.getCertificateById(0);

console.log(cert.id);        // CERT-2026-00001
console.log(cert.fileName);  // sunset.png
```

---

### Verify a certificate
```js
const isValid = await sdk.verifyCertificate("0x3f9a8b2c...");

console.log(isValid); // true or false
```

---

### Download certificate data
```js
const download = await sdk.downloadCertificate("0x3f9a8b2c...");

console.log(download);
// {
//   title:      "ArtChain Certificate of Originality",
//   issuedBy:   "ArtChain Protocol",
//   certId:     "CERT-2026-00142",
//   score:      97,
//   certified:  true,
//   fileName:   "artwork.png",
//   date:       "2026-03-12T10:00:00.000Z",
//   qrData:     "https://artchain.io/cert/0x3f9a...",
//   disclaimer: "This certificate is stored on Ethereum..."
// }
```

---

### Get SDK info
```js
const info = sdk.getInfo();

console.log(info);
// {
//   name:       "facinet-sdk",
//   version:    "1.0.0",
//   configured: true,
//   network:    "sepolia"
// }
```

---

### Check if SDK is configured
```js
const ready = sdk.isConfigured();

console.log(ready); // true or false
```

---

## API Reference

### Constructor
```js
new ArtChainSDK(config)
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `rpcUrl` | string | yes | Ethereum RPC endpoint |
| `contractAddress` | string | yes | Deployed contract address |
| `network` | string | no | Network name (default: sepolia) |
| `apiKey` | string | no | OpenAI API key |

---

### Methods

| Method | Params | Returns | Description |
|---|---|---|---|
| `verify()` | filePath | result | Verify from file path |
| `verifyBuffer()` | buffer, fileName | result | Verify from Buffer |
| `verifyBase64()` | base64, fileName | result | Verify from base64 string |
| `exists()` | imageHash | boolean | Check if hash exists on chain |
| `status()` | imageHash | string | Get verification status |
| `getCertificate()` | imageHash | certificate | Get certificate by hash |
| `getCertificateById()` | id | certificate | Get certificate by ID |
| `verifyCertificate()` | imageHash | boolean | Validate a certificate |
| `downloadCertificate()` | imageHash | download | Get downloadable cert data |
| `getInfo()` | — | info | Get SDK info |
| `isConfigured()` | — | boolean | Check SDK is ready |

---

## Result Object
```js
{
  score:       97,           // originality score 0-100
  certified:   true,         // true if score >= 70
  imageHash:   "0x3f9a...", // SHA256 of image
  txHash:      "0xabc1...", // blockchain tx hash
  blockNumber: 5842301,      // block it was stored in
  network:     "sepolia",    // network name
  fileName:    "artwork.png", // original file name
  timestamp:   1710000000    // unix timestamp
}
```

---

## Certificate Object
```js
{
  id:        "CERT-2026-00142",  // formatted cert ID
  imageHash: "0x3f9a...",        // image hash
  score:     97,                  // originality score
  certified: true,                // certified status
  fileName:  "artwork.png",       // file name
  timestamp: 1710000000,          // unix timestamp
  submitter: "0xABC...123",       // submitter wallet
  issuedBy:  "ArtChain Protocol"  // issuer
}
```

---

## Score Guide

| Score    | Status    | Meaning                        |
|----------|-----------|--------------------------------|
| 71 — 100 | CERTIFIED | Original — certificate issued  |
| 41 — 70  | REVIEW    | Some similarity detected       |
| 0  — 40  | FLAGGED   | High similarity to known works |

---

## Standalone Functions

Use individual functions without the class:
```js
const {
  verifyArtwork,
  verifyArtworkFromBuffer,
  verifyArtworkFromBase64,
  checkArtworkExists,
  getVerificationStatus,
  getCertificate,
  getCertificateById,
  verifyCertificate,
  downloadCertificate,
} = require("facinet-sdk");

// Verify directly
const result = await verifyArtwork("./artwork.png");
console.log(result.score);

// Check existence
const exists = await checkArtworkExists("0x3f9a...");
console.log(exists);
```

---

## Error Handling
```js
try {
  const result = await sdk.verify("./artwork.png");
  console.log(result);

} catch (error) {

  // File not found
  if (error.code === "ENOENT") {
    console.error("File not found");
  }

  // Invalid file type
  if (error.message.includes("Invalid file type")) {
    console.error("Only JPG, PNG, WEBP, SVG, GIF allowed");
  }

  // Already verified
  if (error.message.includes("AlreadyVerified")) {
    console.error("This artwork is already on the blockchain");
  }

  // Network error
  if (error.message.includes("network")) {
    console.error("Check your RPC URL");
  }

  console.error(error.message);
}
```

---

## Supported File Types

| Type | Extension | Notes |
|---|---|---|
| JPEG | .jpg .jpeg | Most common |
| PNG | .png | Supports transparency |
| WebP | .webp | Modern format |
| SVG | .svg | Vector graphics |
| GIF | .gif | First frame used |

Maximum file size: **50MB**

---

## Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run coverage

# Lint
npm run lint
```

---

## Test Output
```
facinet-sdk
  SDK Info
    ✓ should return correct version
    ✓ should return correct name
    ✓ should initialize with config
    ✓ should return sdk info object
    ✓ should report isConfigured true

  verifyArtwork
    ✓ should reject missing file
    ✓ should reject invalid file type
    ✓ should accept valid extensions

  verifyFromBuffer
    ✓ should reject null buffer
    ✓ should reject non-buffer
    ✓ should accept valid buffer

  verifyCertificate
    ✓ should return true for certified
    ✓ should return false for flagged
    ✓ should return false for low score

  ...

  31 passing (1s)
```

---

## SDK File Structure
```
sdk/
├── src/
│   ├── index.js          # Entry point + ArtChainSDK class
│   ├── verify.js         # Verification functions
│   └── certificate.js    # Certificate functions
├── test/
│   └── sdk.test.js       # 31 tests
├── README.md             # This file
└── package.json
```

---

## Version

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | March 2026 | Initial release |

---

## License

MIT — see LICENSE for details.

---

*Part of the ◈ ArtChain Protocol*
```

---

### What each section covers
```
sdk/README.md
│
├── Header
│   └── name + tagline
│
├── Installation
│   └── npm install facinet-sdk
│
├── Requirements
│   └── Node + RPC + contract
│
├── Quick Start
│   └── 10 line example
│
├── Setup
│   ├── Step 1 — install
│   ├── Step 2 — .env
│   └── Step 3 — initialize
│
├── Usage (10 examples)
│   ├── verify from file
│   ├── verify from buffer
│   ├── verify from base64
│   ├── check exists
│   ├── get status
│   ├── get certificate by hash
│   ├── get certificate by ID
│   ├── verify certificate
│   ├── download certificate
│   ├── get SDK info
│   └── check configured
│
├── API Reference
│   ├── constructor params table
│   └── all methods table
│
├── Result Object
│   └── full shape with comments
│
├── Certificate Object
│   └── full shape with comments
│
├── Score Guide
│   └── 0-40 / 41-70 / 71-100
│
├── Standalone Functions
│   └── use without class
│
├── Error Handling
│   └── all error types
│
├── Supported File Types
│   └── table of allowed formats
│
├── Running Tests
│   └── all test commands
│
├── Test Output
│   └── sample passing tests
│
├── SDK File Structure
│   └── folder tree
│
├── Version
│   └── changelog table
│
└── License
    └── MIT
```

---

### Quick copy guide

| File | Paste into |
|---|---|
| `README.md` | `sdk/README.md` |

---

### Location reminder
```
sdk/
├── src/
│   ├── index.js
│   ├── verify.js
│   └── certificate.js
├── test/
│   └── sdk.test.js
├── README.md          ← HERE
└── package.json