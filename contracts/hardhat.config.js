// contracts/hardhat.config.js
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// ==============================
// Environment Variables
// ==============================

const PRIVATE_KEY        = process.env.PRIVATE_KEY        || "0x" + "0".repeat(64);
const ETHEREUM_RPC_URL   = process.env.ETHEREUM_RPC_URL   || "";
const SEPOLIA_RPC_URL    = process.env.SEPOLIA_RPC_URL    || ETHEREUM_RPC_URL;
const MAINNET_RPC_URL    = process.env.MAINNET_RPC_URL    || "";
const ETHERSCAN_API_KEY  = process.env.ETHERSCAN_API_KEY  || "";
const COINMARKETCAP_KEY  = process.env.COINMARKETCAP_KEY  || "";
const REPORT_GAS         = process.env.REPORT_GAS         === "true";

// ==============================
// Validate Private Key
// Prevents accidental deploy
// with empty key
// ==============================

if (
  PRIVATE_KEY !== "0x" + "0".repeat(64) &&
  !PRIVATE_KEY.startsWith("0x")
) {
  throw new Error(
    "[hardhat.config] PRIVATE_KEY must start with 0x"
  );
}

// ==============================
// Hardhat Config
// ==============================

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  // ==============================
  // Solidity Compiler
  // ==============================

  solidity: {
    version: "0.8.24",

    settings: {
      optimizer: {
        enabled: true,
        runs:    200,
      },

      viaIR: false,

      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "evm.methodIdentifiers",
            "metadata",
          ],
        },
      },
    },
  },

  // ==============================
  // Networks
  // ==============================

  networks: {

    // ==============================
    // Hardhat — In-memory
    // Default test network
    // ==============================

    hardhat: {
      chainId: 31337,

      mining: {
        auto:     true,
        interval: 0,
      },

      accounts: {
        count:              20,
        accountsBalance:    "10000000000000000000000",  // 10000 ETH
      },

      gas:        "auto",
      gasPrice:   "auto",
      blockGasLimit: 30000000,
    },

    // ==============================
    // Localhost — Hardhat Node
    // Run: npx hardhat node
    // ==============================

    localhost: {
      url:     "http://127.0.0.1:8545",
      chainId: 31337,

      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64)
        ? [PRIVATE_KEY]
        : [],

      gas:      "auto",
      gasPrice: "auto",
      timeout:  60000,
    },

    // ==============================
    // Sepolia — Test Network
    // ChainID: 11155111
    // ==============================

    sepolia: {
      url:     SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      chainId: 11155111,

      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64)
        ? [PRIVATE_KEY]
        : [],

      gas:      "auto",
      gasPrice: "auto",
      timeout:  120000,

      // Retry failed requests
      httpHeaders: {},
    },

    // ==============================
    // Mainnet — Production
    // ChainID: 1
    // USE WITH CAUTION
    // ==============================

    mainnet: {
      url:     MAINNET_RPC_URL || "https://eth.llamarpc.com",
      chainId: 1,

      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64)
        ? [PRIVATE_KEY]
        : [],

      gas:      "auto",
      gasPrice: "auto",
      timeout:  120000,
    },

  },

  // ==============================
  // Etherscan Verification
  // ==============================

  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
    },

    customChains: [],
  },

  // ==============================
  // Gas Reporter
  // npm run test:gas
  // ==============================

  gasReporter: {
    enabled:       REPORT_GAS,
    currency:      "USD",
    coinmarketcap: COINMARKETCAP_KEY,
    outputFile:    "gas-report.txt",
    noColors:      true,

    reportFormat:  "terminal",

    showTimeSpent:     true,
    showMethodSig:     true,
    excludeContracts:  [],

    token: "ETH",
  },

  // ==============================
  // Contract Sizer
  // Shows bytecode size
  // ==============================

  contractSizer: {
    alphaSort:       true,
    disambiguatePaths: false,
    runOnCompile:    true,
    strict:          false,
  },

  // ==============================
  // Paths
  // ==============================

  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },

  // ==============================
  // Mocha Test Options
  // ==============================

  mocha: {
    timeout:  40000,
    reporter: "spec",
    bail:     false,
  },

};
```

---

### What each section does
```
```
hardhat.config.js
│
├── Environment Variables
│   ├── PRIVATE_KEY        → deployer wallet
│   ├── ETHEREUM_RPC_URL   → RPC endpoint
│   ├── SEPOLIA_RPC_URL    → sepolia RPC
│   ├── MAINNET_RPC_URL    → mainnet RPC
│   ├── ETHERSCAN_API_KEY  → for verification
│   ├── COINMARKETCAP_KEY  → for gas USD price
│   └── REPORT_GAS         → enable gas report
│
├── solidity
│   ├── version    → 0.8.24
│   ├── optimizer
│   │   ├── enabled → true
│   │   └── runs    → 200
│   │       lower  = smaller bytecode
│   │       higher = cheaper calls
│   └── outputSelection
│       └── abi, bytecode, metadata
│
├── networks
│   ├── hardhat    → in-memory
│   │   ├── chainId    31337
│   │   ├── 20 accounts
│   │   └── 10000 ETH each
│   │
│   ├── localhost  → hardhat node
│   │   ├── port   8545
│   │   └── chainId 31337
│   │
│   ├── sepolia    → testnet
│   │   ├── chainId  11155111
│   │   └── timeout  120s
│   │
│   └── mainnet    → production
│       ├── chainId  1
│       └── timeout  120s
│
├── etherscan
│   └── apiKey for verification
│
├── gasReporter
│   ├── currency  USD
│   ├── output    gas-report.txt
│   └── showTimeSpent + MethodSig
│
├── contractSizer
│   └── shows bytecode size
│
├── paths
│   ├── sources   ./contracts
│   ├── tests     ./test
│   ├── cache     ./cache
│   └── artifacts ./artifacts
│
└── mocha
    ├── timeout   40000ms
    ├── reporter  spec
    └── bail      false
```

```

### Required `.env` file
```
```
# contracts/.env

PRIVATE_KEY=0x...
ETHEREUM_RPC_URL=https://...
SEPOLIA_RPC_URL=https://...
MAINNET_RPC_URL=https://...
ETHERSCAN_API_KEY=...
COINMARKETCAP_KEY=...
REPORT_GAS=false
```

```

### Where to get RPC URLs
```
```
Free RPC providers:

Alchemy   → https://alchemy.com
Infura    → https://infura.io
QuickNode → https://quicknode.com

Free public RPCs:

Sepolia:
  https://rpc.sepolia.org
  https://sepolia.infura.io/v3/YOUR_KEY

Mainnet:
  https://eth.llamarpc.com
  https://cloudflare-eth.com
```

```

### Where to get Etherscan API key
```
```
1. Go to https://etherscan.io
2. Create account
3. Go to API Keys
4. Create new API key
5. Copy to .env

ETHERSCAN_API_KEY=your_key_here
```

```

### Gas report output
```
```
After npm run test:gas:

·-----------------------------------------|---------------------------|-------------|-----------------------------·
|  Solidity and Network Configuration     ·  Max Deployments          ·             ·  Network: hardhat           │
·············|···························|···············|·············|·············|·····························
|  Contract  ·  Method                  ·  Min          ·  Max        ·  Avg        ·  # calls      ·  usd (avg) │
·············|···························|···············|·············|·············|·····························
|  Copyright ·  storeVerification       ·  85,000       ·  92,000     ·  88,000     ·  12           ·  $2.40     │
|  Verifier  ·  deleteVerification      ·  28,000       ·  28,000     ·  28,000     ·  2            ·  $0.76     │
·············|···························|···············|·············|·············|·····························
```

```

### All available commands
```
```
Compile:
npx hardhat compile

Test:
npx hardhat test

Test with gas:
REPORT_GAS=true npx hardhat test

Coverage:
npx hardhat coverage

Start local node:
npx hardhat node

Deploy local:
npx hardhat run scripts/deploy.js --network localhost

Deploy sepolia:
npx hardhat run scripts/deploy.js --network sepolia

Verify on Etherscan:
npx hardhat verify --network sepolia CONTRACT_ADDRESS

Clean:
npx hardhat clean

Console:
npx hardhat console --network localhost
```

```

### Quick copy guide

| File | Paste into |

```
| `hardhat.config.js` | `contracts/hardhat.config.js` |

```

### Location reminder
```
```
contracts/
├── contracts/
│   └── CopyrightVerifier.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── CopyrightVerifier.test.js
├── hardhat.config.js              ← HERE
└── package.json
```