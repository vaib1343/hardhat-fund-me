const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChain } = require("../../helper-hardhat-config");

developmentChain.includes(network.name)
    ? describe("Fund Me", async () => {
          let FundMe;
          let deployer;
          let MockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");
          beforeEach(async () => {
              await deployments.fixture(["all"]);
              deployer = (await getNamedAccounts()).deployer;
              FundMe = await ethers.getContract("FundMe", deployer);
              MockV3Aggregator = await ethers.getContract("MockV3Aggregator");
          });

          describe("contructor", async () => {
              it("sets the aggregator address correclty", async () => {
                  const response = await FundMe.priceFeed();
                  assert.equal(response, MockV3Aggregator.address);
              });

              it("owner check", async () => {
                  const response = await FundMe.i_owner();
                  expect(response).to.be.equal(deployer);
              });
          });

          describe("fund", async () => {
              it("should revert when fund is less than minimum required", async () => {
                  await expect(FundMe.fund()).to.be.revertedWith(
                      "Atleast fund 50 dollar"
                  );
              });

              it("should update addressToAmountFunded when pass 1ETH", async () => {
                  await FundMe.fund({
                      value: sendValue,
                  });
                  const response = await FundMe.addressToAmountFunded(deployer);
                  expect(response.toString()).to.be.equal(sendValue.toString());
              });

              it("should add funder to funders", async () => {
                  await FundMe.fund({
                      value: sendValue,
                  });
                  const response = await FundMe.funders("0");
                  assert.equal(response.toString(), deployer.toString());
              });
          });

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await FundMe.fund({
                      value: sendValue,
                  });
              });
              it("should transfer the money to owner", async () => {
                  const startingFundMebalance =
                      await FundMe.provider.getBalance(FundMe.address);
                  const srartingDeployerBalance =
                      await FundMe.provider.getBalance(deployer);

                  const transactionResponse = await FundMe.withdraw();
                  const transtionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transtionReceipt;

                  const endingFundMebalance = await FundMe.provider.getBalance(
                      FundMe.address
                  );
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer);

                  assert(endingFundMebalance, 0);
                  assert(
                      startingFundMebalance
                          .add(srartingDeployerBalance)
                          .toString(),
                      endingDeployerBalance
                          .add(gasUsed.mul(effectiveGasPrice))
                          .toString()
                  );
              });

              it("should withdraw from multiple account", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundmeContractConnected = await FundMe.connect(
                          accounts[i]
                      );
                      fundmeContractConnected.fund({
                          value: sendValue,
                      });
                  }

                  const startingFundMebalance =
                      await FundMe.provider.getBalance(FundMe.address);
                  const srartingDeployerBalance =
                      await FundMe.provider.getBalance(deployer);

                  const transactionResponse = await FundMe.withdraw();
                  const transtionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transtionReceipt;

                  const endingFundMebalance = await FundMe.provider.getBalance(
                      FundMe.address
                  );
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer);

                  assert(endingFundMebalance, 0);
                  assert(
                      startingFundMebalance
                          .add(srartingDeployerBalance)
                          .toString(),
                      endingDeployerBalance
                          .add(gasUsed.mul(effectiveGasPrice))
                          .toString()
                  );

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("should only allow owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerContract = await FundMe.connect(attacker);
                  await expect(attackerContract.withdraw()).to.be.reverted;
              });
          });
      })
    : describe.skip;
