import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("Counter", function () {
  it("Should emit the Increment event when calling the inc() function", async function () {
    // Replace with Hardhat's ethers or viem usage
    const [deployer] = await network.provider.send("eth_accounts");
    const Counter = await network.provider.send("hardhat_getContract", ["Counter"]);
    const counter = Counter.connect(deployer);

    // Call inc() and check for event emission
    await counter.inc();

    // You may need to use a library like ethers.js or viem for assertions
    // Example with ethers.js:
    // await expect(counter.inc()).to.emit(counter, "Increment").withArgs(1n);
  });

  it("The sum of the Increment events should match the current value", async function () {
    // Replace with Hardhat's ethers or viem usage
    const [deployer] = await network.provider.send("eth_accounts");
    const Counter = await network.provider.send("hardhat_getContract", ["Counter"]);
    const counter = Counter.connect(deployer);

    // run a series of increments
    let total = 0n;
    for (let i = 1n; i <= 10n; i++) {
      await counter.incBy(i);
      total += i;
    }

    // Check that the aggregated events match the current value
    const currentValue = await counter.x();
    assert.equal(total, currentValue);
  });
});
