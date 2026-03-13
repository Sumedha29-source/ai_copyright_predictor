# ◈ ArtChain — AI Copyright Verification Platform

> Upload your artwork. Verify originality with AI. Store the result forever on Ethereum.

---

## What is ArtChain?

ArtChain is a full-stack decentralized application that allows artists
to verify the originality of their artwork using AI, and permanently
record the result on the Ethereum blockchain.

Every verification produces a tamper-proof certificate stored on-chain,
giving artists provable proof of originality.

---

## How it Works
```
Artist uploads artwork
        ↓
GPT-4o Vision analyzes the image
        ↓
Originality score calculated (0-100)
        ↓
Result stored on Ethereum blockchain
        ↓
Certificate issued with tx hash
```

---

## Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React 18 + Vite                |
| Styling      | CSS Variables + Custom CSS     |
| Backend      | Node.js + Express              |
| AI           | OpenAI GPT-4o Vision           |
| Blockchain   | Ethereum (Sepolia Testnet)     |
| Contracts    | Solidity 0.8.24 + Hardhat      |
| SDK          | facinet-sdk (custom)           |
| File Upload  | Multer                         |
| Wallet       | ethers.js v6                   |

---

## Project Structure
```
artchain/
├── frontend/                        # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Logo + navigation
│   │   │   ├── HexGrid.jsx          # SVG background
│   │   │   ├── StepProgress.jsx     # 4-step tracker
│   │   │   ├── UploadZone.jsx       # Drag + drop upload
│   │   │   ├── AnalyzingState.jsx   # AI + blockchain loader
│   │   │   ├── ResultCard.jsx       # Verification result
│   │   │   ├── OriginBar.jsx        # Score progress bar
│   │   │   └── HistoryTab.jsx       # Past verifications
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Main upload page
│   │   │   └── Certificate.jsx      # Certificate viewer
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Node.js + Express API
│   ├── controllers/
│   │   ├── verifyController.js      # Verify artwork
│   │   └── historyController.js     # History CRUD
│   ├── routes/
│   │   ├── verifyRoutes.js          # POST /api/verify
│   │   └── historyRoutes.js         # GET  /api/history
│   ├── middleware/
│   │   ├── upload.js                # Multer config
│   │   └── errorHandler.js          # Global errors
│   ├── services/
│   │   ├── aiService.js             # OpenAI GPT-4o
│   │   └── blockchainService.js     # ethers.js + contract
│   ├── utils/
│   │   └── hashImage.js             # SHA256 hashing
│   ├── uploads/                     # Temp file storage
│   ├── server.js                    # Express entry point
│   ├── .env                         # Environment variables
│   └── package.json
│
├── contracts/                       # Solidity + Hardhat
│   ├── contracts/
│   │   └── CopyrightVerifier.sol    # Main contract
│   ├── scripts/
│   │   └── deploy.js                # Deploy script
│   ├── test/
│   │   └── CopyrightVerifier.test.js
│   ├── artifacts/                   # Auto-generated
│   ├── hardhat.config.js
│   └── package.json
│
├── sdk/                             # facinet-sdk
│   ├── src/
│   │   ├── index.js                 # SDK entry point
│   │   ├── verify.js                # Verify functions
│   │   └── certificate.js          # Certificate functions
│   ├── test/
│   │   └── sdk.test.js
│   ├── README.md
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask wallet
- OpenAI API key
- Alchemy or Infura account

---

### Step 1 — Clone the repo
```bash
git clone https://github.com/your-username/artchain.git
cd artchain
```

---

### Step 2 — Install dependencies
```bash
# Install all packages at once
npm run install:all

# Or install individually
cd frontend  && npm install && cd ..
cd backend   && npm install && cd ..
cd contracts && npm install && cd ..
cd sdk       && npm install && cd ..
```

---

### Step 3 — Set up environment variables

#### `backend/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-...

# Ethereum
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
NETWORK_NAME=sepolia

# Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads/
```

#### `contracts/.env`
```env
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=...
REPORT_GAS=false
```

---

### Step 4 — Deploy smart contract
```bash
# Start local Hardhat node
cd contracts
npm run node

# In a new terminal — deploy locally
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Copy the contract address into backend/.env
CONTRACT_ADDRESS=0x...
```

---

### Step 5 — Start the application
```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Running on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Running on http://localhost:3000

# Terminal 3 — Hardhat node (local only)
cd contracts
npm run node
# Running on http://localhost:8545
```

---

## API Endpoints

### Verify Artwork
```
POST /api/verify
Content-Type: multipart/form-data

Body:
  artwork  → image file (JPG, PNG, WEBP, SVG, GIF)

Response:
{
  "success": true,
  "data": {
    "score":       97,
    "certified":   true,
    "imageHash":   "0x3f9a...",
    "txHash":      "0xabc1...",
    "blockNumber": 5842301,
    "network":     "sepolia",
    "timestamp":   "2026-03-12T10:00:00Z"
  }
}
```

### Check Hash
```
GET /api/verify/:hash

Response:
{
  "success": true,
  "data": {
    "exists":    true,
    "score":     97,
    "certified": true,
    "fileName":  "sunset.png",
    "timestamp": 1710000000
  }
}
```

### Get History
```
GET /api/history?page=1&limit=10

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page":  1,
    "limit": 10,
    "total": 42
  }
}
```

### Search History
```
GET /api/history/search?query=sunset

Response:
{
  "success": true,
  "data": [...]
}
```

---

## Smart Contract Functions

| Function | Type | Description |
|---|---|---|
| `storeVerification()` | write | Store new verification |
| `getVerification()` | read | Get by image hash |
| `getVerificationById()` | read | Get by record ID |
| `getAllVerifications()` | read | Paginated list |
| `getTotalVerifications()` | read | Total count |
| `hashExists()` | read | Check duplicate |
| `getVerificationsBySubmitter()` | read | Filter by wallet |
| `getCertifiedVerifications()` | read | Certified only |
| `deleteVerification()` | write | Owner only |
| `getContractInfo()` | read | Contract stats |

---

## Running Tests
```bash
# Frontend lint
cd frontend && npm run lint

# Backend tests
cd backend && npm test

# Contract tests
cd contracts && npm test

# Contract tests with gas report
cd contracts && npm run test:gas

# Contract coverage
cd contracts && npm run coverage

# SDK tests
cd sdk && npm test

# Run all tests from root
npm run test:all
```

---

## Originality Score Guide

| Score    | Level  | Status    | Meaning                        |
|----------|--------|-----------|--------------------------------|
| 71 — 100 | High   | CERTIFIED | Original artwork               |
| 41 — 70  | Mid    | REVIEW    | Some similarity detected       |
| 0  — 40  | Low    | FLAGGED   | High similarity to known works |

---

## Deployment

### Frontend — Vercel
```bash
cd frontend
npm run build

# Deploy dist/ to Vercel
vercel deploy --prod
```

### Backend — Railway
```bash
# Push to GitHub
# Connect repo to Railway
# Set environment variables in Railway dashboard
# Railway auto-deploys on push
```

### Contract — Sepolia
```bash
cd contracts
npm run deploy:sepolia

# Verify on Etherscan
npm run verify
```

---

## Data Flow
```
User uploads image (PNG/JPG/WEBP)
        ↓
Multer saves to backend/uploads/
        ↓
SHA256 hash generated
        ↓
GPT-4o Vision analyzes image
        ↓
Originality score returned (0-100)
        ↓
ethers.js calls CopyrightVerifier.sol
        ↓
storeVerification() called on-chain
        ↓
Transaction hash returned
        ↓
Temp file deleted from server
        ↓
Result sent to frontend
        ↓
Certificate displayed + downloadable
```

---

## Security

- Private keys stored in `.env` — never committed
- Multer validates file type and size (50MB max)
- Rate limiting on all API endpoints (100 req / 15 min)
- Helmet.js sets secure HTTP headers
- ReentrancyGuard on all contract write functions
- Only owner can delete blockchain records
- SHA256 hashing prevents duplicate submissions
- CORS restricted to CLIENT_URL only

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `OPENAI_API_KEY` | backend | OpenAI API key |
| `ETHEREUM_RPC_URL` | backend | RPC endpoint URL |
| `PRIVATE_KEY` | backend | Deployer wallet key |
| `CONTRACT_ADDRESS` | backend | Deployed contract |
| `NETWORK_NAME` | backend | Network name |
| `PORT` | backend | Server port (5000) |
| `CLIENT_URL` | backend | Frontend URL |
| `SEPOLIA_RPC_URL` | contracts | Sepolia RPC |
| `MAINNET_RPC_URL` | contracts | Mainnet RPC |
| `ETHERSCAN_API_KEY` | contracts | Etherscan key |
| `REPORT_GAS` | contracts | Enable gas report |

---

## Contributing
```bash
# Fork the repo
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Run tests
npm run test:all

# Commit
git commit -m "feat: your feature description"

# Push and open PR
git push origin feature/your-feature
```

---

## License

MIT — see LICENSE file for details.

---

## Links

- Sepolia Faucet   → https://sepoliafaucet.com
- Etherscan        → https://sepolia.etherscan.io
- Alchemy          → https://alchemy.com
- OpenAI           → https://platform.openai.com
- Hardhat          → https://hardhat.org
- OpenZeppelin     → https://openzeppelin.com

---

*Built with ◈ ArtChain Protocol*
```

---

### What each section covers
```
README.md
│
├── Header
│   ├── project name + tagline
│   └── one-line description
│
├── What is ArtChain
│   └── plain English overview
│
├── How it Works
│   └── step by step flow diagram
│
├── Tech Stack
│   └── full table of technologies
│
├── Project Structure
│   └── full folder tree with comments
│
├── Getting Started
│   ├── prerequisites
│   ├── Step 1 — clone
│   ├── Step 2 — install
│   ├── Step 3 — env vars
│   │   ├── backend/.env
│   │   └── contracts/.env
│   ├── Step 4 — deploy contract
│   └── Step 5 — start app
│
├── API Endpoints
│   ├── POST /api/verify
│   ├── GET  /api/verify/:hash
│   ├── GET  /api/history
│   └── GET  /api/history/search
│
├── Smart Contract Functions
│   └── full function reference table
│
├── Running Tests
│   └── all test commands
│
├── Score Guide
│   └── 0-40 / 41-70 / 71-100
│
├── Deployment
│   ├── Frontend → Vercel
│   ├── Backend  → Railway
│   └── Contract → Sepolia
│
├── Data Flow
│   └── full pipeline diagram
│
├── Security
│   └── all security measures
│
├── Environment Variables
│   └── full reference table
│
├── Contributing
│   └── branch + PR guide
│
├── License
│   └── MIT
│
└── Links
    └── all external resources
```

---

### Quick copy guide

| File | Paste into |
|---|---|
| `README.md` | `artchain/README.md` |

---

### Location reminder
```
artchain/
├── README.md          ← HERE
├── package.json
├── .gitignore
├── frontend/
├── backend/
├── contracts/
└── sdk/