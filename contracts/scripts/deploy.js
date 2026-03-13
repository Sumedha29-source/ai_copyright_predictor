// contracts/scripts/deploy.js
// scripts/deploy.js
const hre = require("hardhat");

// ==============================
// Deploy Script
//
// Deploys CopyrightVerifier.sol
// to the selected network.
//
// Usage:
//   local:   npm run deploy:local
//   sepolia: npm run deploy:sepolia
//   mainnet: npm run deploy:mainnet
// ==============================

async function main() {

  console.log("\n==============================");
  console.log("  ArtChain Deploy Script");
  console.log("==============================\n");

  // ==============================
  // Get Network Info
  // ==============================

  const network     = hre.network.name;
  const chainId     = hre.network.config.chainId;

  console.log(`Network:  ${network}`);
  console.log(`Chain ID: ${chainId}`);
  console.log("");

  // ==============================
  // Get Deployer Account
  // ==============================

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployer address:");
  console.log(" ", deployer.address);
  console.log("");

  // ==============================
  // Check Deployer Balance
  // ==============================

  const balance    = await hre.ethers.provider.getBalance(
    deployer.address
  );
  const balanceEth = hre.ethers.formatEther(balance);

  console.log("Deployer balance:");
  console.log(` ${balanceEth} ETH`);
  console.log("");

  // ==============================
  // Warn if balance is low
  // ==============================

  if (parseFloat(balanceEth) < 0.01) {
    console.warn("⚠  WARNING: Balance is low.");
    console.warn("   Deployment may fail.");
    console.warn("   Get Sepolia ETH from:");
    console.warn("   https://sepoliafaucet.com\n");
  }

  // ==============================
  // Get Contract Factory
  // ==============================

  console.log("Compiling contract...");

  const CopyrightVerifier = await hre.ethers.getContractFactory(
    "CopyrightVerifier"
  );

  console.log("Contract compiled ✓\n");

  // ==============================
  // Deploy Contract
  // ==============================

  console.log("Deploying CopyrightVerifier...");

  const contract = await CopyrightVerifier.deploy();

  console.log("Waiting for deployment...");

  await contract.waitForDeployment();

  // ==============================
  // Get Deployment Info
  // ==============================

  const contractAddress = await contract.getAddress();
  const deployTx        = contract.deploymentTransaction();
  const txHash          = deployTx?.hash;
  const blockNumber     = deployTx?.blockNumber;

  // ==============================
  // Print Results
  // ==============================

  console.log("\n==============================");
  console.log("  Deployment Successful ✓");
  console.log("==============================\n");

  console.log("Contract Address:");
  console.log(` ${contractAddress}`);
  console.log("");

  console.log("Transaction Hash:");
  console.log(` ${txHash}`);
  console.log("");

  if (blockNumber) {
    console.log("Block Number:");
    console.log(` ${blockNumber}`);
    console.log("");
  }

  console.log("Deployer:");
  console.log(` ${deployer.address}`);
  console.log("");

  // ==============================
  // Print .env Instructions
  // ==============================

  console.log("==============================");
  console.log("  Add to backend/.env:");
  console.log("==============================\n");

  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NETWORK_NAME=${network}`);
  console.log("");

  // ==============================
  // Print Etherscan Link
  // ==============================

  if (network === "sepolia") {
    console.log("==============================");
    console.log("  View on Etherscan:");
    console.log("==============================\n");

    console.log(
      `https://sepolia.etherscan.io/address/${contractAddress}`
    );
    console.log("");
    console.log(
      `https://sepolia.etherscan.io/tx/${txHash}`
    );
    console.log("");
  }

  if (network === "mainnet") {
    console.log("==============================");
    console.log("  View on Etherscan:");
    console.log("==============================\n");

    console.log(
      `https://etherscan.io/address/${contractAddress}`
    );
    console.log("");
    console.log(
      `https://etherscan.io/tx/${txHash}`
    );
    console.log("");
  }

  // ==============================
  // Verify Contract Source
  // Only on live networks
  // ==============================

  if (network !== "hardhat" && network !== "localhost") {

    console.log("==============================");
    console.log("  Verifying on Etherscan...");
    console.log("==============================\n");

    // Wait for extra blocks before verifying
    console.log("Waiting 30 seconds for indexing...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address:              contractAddress,
        constructorArguments: [],
      });

      console.log("\nContract verified ✓");
      console.log(
        `https://sepolia.etherscan.io/address/${contractAddress}#code`
      );

    } catch (error) {

      // Already verified is OK
      if (error.message.includes("Already Verified")) {
        console.log("Contract already verified ✓");
      } else {
        console.warn("\n⚠  Verification failed:");
        console.warn(`   ${error.message}`);
        console.warn("\n   Verify manually:");
        console.warn(
          `   npx hardhat verify --network ${network} ${contractAddress}`
        );
      }
    }
  }

  // ==============================
  // Run Quick Smoke Test
  // Confirms contract is working
  // ==============================

  console.log("\n==============================");
  console.log("  Running Smoke Test...");
  console.log("==============================\n");

  try {

    // Check total verifications
    const total = await contract.getTotalVerifications();
    console.log(`Total verifications: ${total} ✓`);

    // Check contract info
    const info = await contract.getContractInfo();
    console.log(`Cert threshold:      ${info.certThreshold} ✓`);
    console.log(`Contract owner:      ${info.contractOwner} ✓`);

    // Check hash does not exist
    const exists = await contract.hashExists("0xtest");
    console.log(`Hash exists check:   ${exists} ✓`);

    console.log("\nSmoke test passed ✓\n");

  } catch (error) {
    console.warn("\n⚠  Smoke test failed:");
    console.warn(`   ${error.message}\n`);
  }

  console.log("==============================");
  console.log("  Deploy Complete");
  console.log("==============================\n");
}

// ==============================
// Run Main
// Handle errors gracefully
// ==============================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n✕ Deploy failed:");
    console.error(error);
    process.exit(1);
  });
```

---

### What each part does
```
```
deploy.js
│
├── Get Network Info
│   ├── network name  → hardhat/localhost/sepolia/mainnet
│   └── chainId       → 31337/8545/11155111/1
│
├── Get Deployer Account
│   └── first account from hardhat signers
│       uses PRIVATE_KEY from .env
│
├── Check Balance
│   ├── formats balance in ETH
│   └── warns if below 0.01 ETH
│
├── Get Contract Factory
│   └── compiles CopyrightVerifier.sol
│
├── Deploy Contract
│   ├── CopyrightVerifier.deploy()
│   └── waitForDeployment()
│
├── Print Results
│   ├── contract address
│   ├── transaction hash
│   ├── block number
│   └── deployer address
│
├── Print .env Instructions
│   ├── CONTRACT_ADDRESS=
│   └── NETWORK_NAME=
│
├── Print Etherscan Links
│   ├── sepolia.etherscan.io  → sepolia
│   └── etherscan.io          → mainnet
│
├── Verify on Etherscan
│   ├── waits 30s for indexing
│   ├── runs verify:verify
│   └── handles already verified
│
└── Smoke Test
    ├── getTotalVerifications()
    ├── getContractInfo()
    └── hashExists()
```

```

### What the output looks like
```
```
==============================
  ArtChain Deploy Script
==============================

Network:  sepolia
Chain ID: 11155111

Deployer address:
  0xABC...123

Deployer balance:
  0.5 ETH

Compiling contract...
Contract compiled ✓

Deploying CopyrightVerifier...
Waiting for deployment...

==============================
  Deployment Successful ✓
==============================

Contract Address:
  0x1234...abcd

Transaction Hash:
  0xdef5...6789

Block Number:
  5842301

Deployer:
  0xABC...123

==============================
  Add to backend/.env:
==============================

CONTRACT_ADDRESS=0x1234...abcd
NETWORK_NAME=sepolia

==============================
  View on Etherscan:
==============================

https://sepolia.etherscan.io/address/0x1234...abcd
https://sepolia.etherscan.io/tx/0xdef5...6789

==============================
  Verifying on Etherscan...
==============================

Waiting 30 seconds for indexing...
Contract verified ✓

==============================
  Running Smoke Test...
==============================

Total verifications: 0 ✓
Cert threshold:      70 ✓
Contract owner:      0xABC...123 ✓
Hash exists check:   false ✓

Smoke test passed ✓

==============================
  Deploy Complete
==============================
```

```

### How to run it
```
```
Step 1 — Set up .env in contracts/
PRIVATE_KEY=0x...
ETHEREUM_RPC_URL=https://...
ETHERSCAN_API_KEY=...

Step 2 — Compile first
cd contracts
npm run compile

Step 3 — Deploy

Local Hardhat node:
npm run deploy:local

Sepolia testnet:
npm run deploy:sepolia

Mainnet:
npm run deploy:mainnet

Step 4 — Copy output to backend/.env
CONTRACT_ADDRESS=0x1234...abcd
NETWORK_NAME=sepolia
```

```

### Network chain IDs
```
```
hardhat   → 31337  (in-memory)
localhost → 8545   (hardhat node)
sepolia   → 11155111
mainnet   → 1
```

```

### Get free Sepolia ETH
```
```
https://sepoliafaucet.com
https://faucet.sepolia.dev
https://sepolia-faucet.pk910.de

Need at least 0.01 ETH to deploy
```

```

### Quick copy guide

| File | Paste into |

```
| `deploy.js` | `contracts/scripts/deploy.js` |

```

### Location reminder
```
```
contracts/
├── contracts/
│   └── CopyrightVerifier.sol
├── scripts/
│   └── deploy.js              ← HERE
├── test/
│   └── CopyrightVerifier.test.js
├── hardhat.config.js
└── package.json
```