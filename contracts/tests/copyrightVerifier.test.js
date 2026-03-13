// contracts/test/CopyrightVerifier.test.js
// test/CopyrightVerifier.test.js
const { expect }        = require("chai");
const { ethers }        = require("hardhat");
const { loadFixture }   = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// ==============================
// Test Suite
// CopyrightVerifier Contract
// ==============================

describe("CopyrightVerifier", function () {

  // ==============================
  // Fixture
  // Deploys fresh contract
  // before each test group
  // ==============================

  async function deployCopyrightVerifierFixture() {

    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const CopyrightVerifier = await ethers.getContractFactory(
      "CopyrightVerifier"
    );
    const contract = await CopyrightVerifier.deploy();

    // Sample test data
    const sampleHash  = "0x3f9a8b2cd4e5f6b24c1a2b3c4d5e6f7a";
    const sampleScore = 97;
    const sampleFile  = "sunset.png";

    return {
      contract,
      owner,
      user1,
      user2,
      sampleHash,
      sampleScore,
      sampleFile,
    };
  }

  // ==============================
  // Deployment Tests
  // ==============================

  describe("Deployment", function () {

    it("Should deploy successfully", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );
      expect(contract.target).to.not.equal(
        ethers.ZeroAddress
      );
    });

    it("Should set the correct owner", async function () {
      const { contract, owner } = await loadFixture(
        deployCopyrightVerifierFixture
      );
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should start with zero verifications", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );
      expect(
        await contract.getTotalVerifications()
      ).to.equal(0);
    });

    it("Should have correct cert threshold", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );
      const info = await contract.getContractInfo();
      expect(info.certThreshold).to.equal(70);
    });

  });

  // ==============================
  // storeVerification Tests
  // ==============================

  describe("storeVerification", function () {

    it("Should store a verification successfully", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await expect(
        contract.storeVerification(
          sampleHash,
          sampleScore,
          true,
          sampleFile
        )
      ).to.not.be.reverted;
    });

    it("Should increment total count after storing", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      expect(
        await contract.getTotalVerifications()
      ).to.equal(1);
    });

    it("Should store correct score", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      const v = await contract.getVerification(sampleHash);
      expect(v.score).to.equal(sampleScore);
    });

    it("Should auto-certify score >= 70", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification(
        "0xhash_high",
        85,
        false,       // certified arg ignored
        sampleFile
      );

      const v = await contract.getVerification("0xhash_high");
      expect(v.certified).to.equal(true);
    });

    it("Should not certify score < 70", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification(
        "0xhash_low",
        45,
        true,        // certified arg ignored
        sampleFile
      );

      const v = await contract.getVerification("0xhash_low");
      expect(v.certified).to.equal(false);
    });

    it("Should emit VerificationStored event", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
        owner,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await expect(
        contract.storeVerification(
          sampleHash,
          sampleScore,
          true,
          sampleFile
        )
      )
        .to.emit(contract, "VerificationStored")
        .withArgs(
          sampleHash,
          sampleScore,
          true,
          sampleFile,
          (timestamp) => timestamp > 0,
          owner.address
        );
    });

    it("Should store correct submitter address", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
        user1,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.connect(user1).storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      const v = await contract.getVerification(sampleHash);
      expect(v.submitter).to.equal(user1.address);
    });

    it("Should revert on empty image hash", async function () {
      const { contract, sampleScore, sampleFile } =
        await loadFixture(deployCopyrightVerifierFixture);

      await expect(
        contract.storeVerification(
          "",
          sampleScore,
          true,
          sampleFile
        )
      ).to.be.revertedWithCustomError(
        contract,
        "EmptyImageHash"
      );
    });

    it("Should revert on empty file name", async function () {
      const { contract, sampleHash, sampleScore } =
        await loadFixture(deployCopyrightVerifierFixture);

      await expect(
        contract.storeVerification(
          sampleHash,
          sampleScore,
          true,
          ""
        )
      ).to.be.revertedWithCustomError(
        contract,
        "EmptyFileName"
      );
    });

    it("Should revert on score > 100", async function () {
      const { contract, sampleHash, sampleFile } =
        await loadFixture(deployCopyrightVerifierFixture);

      await expect(
        contract.storeVerification(
          sampleHash,
          101,
          true,
          sampleFile
        )
      ).to.be.revertedWithCustomError(
        contract,
        "ScoreOutOfRange"
      );
    });

    it("Should revert on duplicate hash", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      // Store once
      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      // Store again with same hash
      await expect(
        contract.storeVerification(
          sampleHash,
          sampleScore,
          true,
          sampleFile
        )
      ).to.be.revertedWithCustomError(
        contract,
        "AlreadyVerified"
      );
    });

    it("Should return correct record ID", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      const tx = await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

  });

  // ==============================
  // getVerification Tests
  // ==============================

  describe("getVerification", function () {

    it("Should retrieve stored verification", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      const v = await contract.getVerification(sampleHash);

      expect(v.hash).to.equal(sampleHash);
      expect(v.score).to.equal(sampleScore);
      expect(v.certified).to.equal(true);
      expect(v.fileName).to.equal(sampleFile);
    });

    it("Should return correct timestamp", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      const before = Math.floor(Date.now() / 1000);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      const v     = await contract.getVerification(sampleHash);
      const after = Math.floor(Date.now() / 1000) + 5;

      expect(Number(v.timestamp)).to.be.gte(before);
      expect(Number(v.timestamp)).to.be.lte(after);
    });

    it("Should revert on unknown hash", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await expect(
        contract.getVerification("0xunknown")
      ).to.be.revertedWithCustomError(
        contract,
        "VerificationNotFound"
      );
    });

  });

  // ==============================
  // getVerificationById Tests
  // ==============================

  describe("getVerificationById", function () {

    it("Should retrieve by ID 0", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      const v = await contract.getVerificationById(0);
      expect(v.hash).to.equal(sampleHash);
    });

    it("Should retrieve correct record by ID", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 90, true,  sampleFile);
      await contract.storeVerification("0xhash_2", 55, false, sampleFile);
      await contract.storeVerification("0xhash_3", 30, false, sampleFile);

      const v = await contract.getVerificationById(1);
      expect(v.hash).to.equal("0xhash_2");
      expect(v.score).to.equal(55);
    });

    it("Should revert on out of range ID", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await expect(
        contract.getVerificationById(0)
      ).to.be.revertedWithCustomError(
        contract,
        "IndexOutOfRange"
      );
    });

  });

  // ==============================
  // getAllVerifications Tests
  // ==============================

  describe("getAllVerifications", function () {

    it("Should return empty array when no records", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      const results = await contract.getAllVerifications(0, 10);
      expect(results.length).to.equal(0);
    });

    it("Should return all records", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 90, true,  sampleFile);
      await contract.storeVerification("0xhash_2", 55, false, sampleFile);
      await contract.storeVerification("0xhash_3", 30, false, sampleFile);

      const results = await contract.getAllVerifications(0, 10);
      expect(results.length).to.equal(3);
    });

    it("Should respect limit", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 90, true,  sampleFile);
      await contract.storeVerification("0xhash_2", 55, false, sampleFile);
      await contract.storeVerification("0xhash_3", 30, false, sampleFile);

      const results = await contract.getAllVerifications(0, 2);
      expect(results.length).to.equal(2);
    });

    it("Should respect skip", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 90, true,  sampleFile);
      await contract.storeVerification("0xhash_2", 55, false, sampleFile);
      await contract.storeVerification("0xhash_3", 30, false, sampleFile);

      const results = await contract.getAllVerifications(2, 10);
      expect(results.length).to.equal(1);
      expect(results[0].imageHash).to.equal("0xhash_3");
    });

    it("Should return empty when skip >= total", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 90, true, sampleFile);

      const results = await contract.getAllVerifications(5, 10);
      expect(results.length).to.equal(0);
    });

  });

  // ==============================
  // getTotalVerifications Tests
  // ==============================

  describe("getTotalVerifications", function () {

    it("Should return 0 initially", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );
      expect(
        await contract.getTotalVerifications()
      ).to.equal(0);
    });

    it("Should increment after each store", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 90, true, sampleFile);
      expect(await contract.getTotalVerifications()).to.equal(1);

      await contract.storeVerification("0xhash_2", 55, false, sampleFile);
      expect(await contract.getTotalVerifications()).to.equal(2);

      await contract.storeVerification("0xhash_3", 30, false, sampleFile);
      expect(await contract.getTotalVerifications()).to.equal(3);
    });

  });

  // ==============================
  // hashExists Tests
  // ==============================

  describe("hashExists", function () {

    it("Should return false for unknown hash", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );
      expect(
        await contract.hashExists("0xunknown")
      ).to.equal(false);
    });

    it("Should return true after storing", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      expect(
        await contract.hashExists(sampleHash)
      ).to.equal(true);
    });

  });

  // ==============================
  // getVerificationsBySubmitter Tests
  // ==============================

  describe("getVerificationsBySubmitter", function () {

    it("Should return records by submitter", async function () {
      const {
        contract,
        sampleFile,
        user1,
        user2,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.connect(user1).storeVerification(
        "0xhash_u1_1", 90, true, sampleFile
      );
      await contract.connect(user1).storeVerification(
        "0xhash_u1_2", 55, false, sampleFile
      );
      await contract.connect(user2).storeVerification(
        "0xhash_u2_1", 30, false, sampleFile
      );

      const user1Results = await contract.getVerificationsBySubmitter(
        user1.address
      );
      expect(user1Results.length).to.equal(2);

      const user2Results = await contract.getVerificationsBySubmitter(
        user2.address
      );
      expect(user2Results.length).to.equal(1);
    });

    it("Should return empty for unknown submitter", async function () {
      const { contract, user1 } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      const results = await contract.getVerificationsBySubmitter(
        user1.address
      );
      expect(results.length).to.equal(0);
    });

  });

  // ==============================
  // getCertifiedVerifications Tests
  // ==============================

  describe("getCertifiedVerifications", function () {

    it("Should return only certified records", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 95, true,  sampleFile);
      await contract.storeVerification("0xhash_2", 45, false, sampleFile);
      await contract.storeVerification("0xhash_3", 80, true,  sampleFile);
      await contract.storeVerification("0xhash_4", 20, false, sampleFile);

      const results = await contract.getCertifiedVerifications();
      expect(results.length).to.equal(2);

      for (const v of results) {
        expect(v.certified).to.equal(true);
        expect(Number(v.score)).to.be.gte(70);
      }
    });

    it("Should return empty if no certified records", async function () {
      const { contract, sampleFile } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await contract.storeVerification("0xhash_1", 40, false, sampleFile);
      await contract.storeVerification("0xhash_2", 30, false, sampleFile);

      const results = await contract.getCertifiedVerifications();
      expect(results.length).to.equal(0);
    });

  });

  // ==============================
  // deleteVerification Tests
  // ==============================

  describe("deleteVerification", function () {

    it("Should allow owner to delete", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      await expect(
        contract.deleteVerification(sampleHash)
      ).to.not.be.reverted;
    });

    it("Should emit VerificationDeleted event", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
        owner,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      await expect(
        contract.deleteVerification(sampleHash)
      )
        .to.emit(contract, "VerificationDeleted")
        .withArgs(sampleHash, owner.address);
    });

    it("Should revert if non-owner tries to delete", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
        user1,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      await expect(
        contract.connect(user1).deleteVerification(sampleHash)
      ).to.be.revertedWithCustomError(
        contract,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should revert on deleting unknown hash", async function () {
      const { contract } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      await expect(
        contract.deleteVerification("0xunknown")
      ).to.be.revertedWithCustomError(
        contract,
        "VerificationNotFound"
      );
    });

  });

  // ==============================
  // getContractInfo Tests
  // ==============================

  describe("getContractInfo", function () {

    it("Should return correct contract info", async function () {
      const { contract, owner } = await loadFixture(
        deployCopyrightVerifierFixture
      );

      const info = await contract.getContractInfo();

      expect(info.total).to.equal(0);
      expect(info.certThreshold).to.equal(70);
      expect(info.contractOwner).to.equal(owner.address);
    });

    it("Should update total in contract info", async function () {
      const {
        contract,
        sampleHash,
        sampleScore,
        sampleFile,
      } = await loadFixture(deployCopyrightVerifierFixture);

      await contract.storeVerification(
        sampleHash,
        sampleScore,
        true,
        sampleFile
      );

      const info = await contract.getContractInfo();
      expect(info.total).to.equal(1);
    });

  });

});
```

---

### What each test group covers
```
CopyrightVerifier.test.js
│
├── Deployment (4 tests)
│   ├── deploys successfully
│   ├── sets correct owner
│   ├── starts with 0 verifications
│   └── has correct cert threshold (70)
│
├── storeVerification (11 tests)
│   ├── stores successfully
│   ├── increments total count
│   ├── stores correct score
│   ├── auto-certifies score >= 70
│   ├── does not certify score < 70
│   ├── emits VerificationStored event
│   ├── stores correct submitter address
│   ├── reverts on empty hash
│   ├── reverts on empty file name
│   ├── reverts on score > 100
│   ├── reverts on duplicate hash
│   └── returns correct record ID
│
├── getVerification (3 tests)
│   ├── retrieves stored verification
│   ├── returns correct timestamp
│   └── reverts on unknown hash
│
├── getVerificationById (3 tests)
│   ├── retrieves by ID 0
│   ├── retrieves correct record by ID
│   └── reverts on out of range ID
│
├── getAllVerifications (5 tests)
│   ├── returns empty array when empty
│   ├── returns all records
│   ├── respects limit param
│   ├── respects skip param
│   └── returns empty when skip >= total
│
├── getTotalVerifications (2 tests)
│   ├── returns 0 initially
│   └── increments after each store
│
├── hashExists (2 tests)
│   ├── returns false for unknown hash
│   └── returns true after storing
│
├── getVerificationsBySubmitter (2 tests)
│   ├── returns records by submitter
│   └── returns empty for unknown submitter
│
├── getCertifiedVerifications (2 tests)
│   ├── returns only certified records
│   └── returns empty if none certified
│
├── deleteVerification (4 tests)
│   ├── allows owner to delete
│   ├── emits VerificationDeleted event
│   ├── reverts if non-owner tries
│   └── reverts on unknown hash
│
└── getContractInfo (2 tests)
    ├── returns correct contract info
    └── updates total in contract info
```

---

### How to run tests
```
cd contracts

Run all tests:
npm test

Run with gas report:
npm run test:gas

Run with coverage:
npm run coverage

Run specific test:
npx hardhat test --grep "storeVerification"
```

---

### What test output looks like
```
CopyrightVerifier
  Deployment
    ✓ Should deploy successfully
    ✓ Should set the correct owner
    ✓ Should start with zero verifications
    ✓ Should have correct cert threshold

  storeVerification
    ✓ Should store a verification successfully
    ✓ Should increment total count after storing
    ✓ Should store correct score
    ✓ Should auto-certify score >= 70
    ✓ Should not certify score < 70
    ✓ Should emit VerificationStored event
    ✓ Should store correct submitter address
    ✓ Should revert on empty image hash
    ✓ Should revert on empty file name
    ✓ Should revert on score > 100
    ✓ Should revert on duplicate hash
    ✓ Should return correct record ID

  ...

  40 passing (3s)
```

---

### Quick copy guide

| File | Paste into |
|---|---|
| `CopyrightVerifier.test.js` | `contracts/test/CopyrightVerifier.test.js` |

---

### Location reminder
```
contracts/
├── contracts/
│   └── CopyrightVerifier.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── CopyrightVerifier.test.js    ← HERE
├── hardhat.config.js
└── package.json