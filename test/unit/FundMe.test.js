const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { expect, assert } = require("chai")

network.config.chainId === 5
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe, mockV3Aggragator, deployer
          const sentValue = ethers.utils.parseEther("1")
          beforeEach(async () => {
              await deployments.fixture(["all"])
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggragator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("contructor", async () => {
              it("MockAggregator is passed in", async () => {
                  assert.equal(
                      await fundMe.getPriceFeed(),
                      mockV3Aggragator.address
                  )
              })
          })

          describe("fund", async () => {
              it("Revert if send ether less than minimum value", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough!"
                  )
              })

              it("Set the amount sent to the sender's address", async () => {
                  await fundMe.fund({ value: sentValue })
                  const expectedAmount = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(expectedAmount.toString(), sentValue.toString())
              })

              it("Add the address of senders to the funders array", async () => {
                  await fundMe.fund({ value: sentValue })
                  assert.equal(await fundMe.s_funders(0), deployer)
              })
          })

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sentValue })
              })

              it("Withdraw with a single funder", async () => {
                  // Get starting balances of the contract and the contract's owner
                  const startingFundmeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } =
                      await transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Get ending balance of the contract and the contract's owner
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundmeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 0; i < 6; i++) {
                      const fundMeConnectedWithAcc = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedWithAcc.fund({ value: sentValue })
                  }

                  // Get starting balances of the contract and the contract's owner
                  const startingFundmeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } =
                      await transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Get ending balance of the contract and the contract's owner
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundmeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure the funders are set properly
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (let i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Revert if not an owner", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const fundMeConnectedToNotAnOwner = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      fundMeConnectedToNotAnOwner.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })

          describe("cheaperWithdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sentValue })
              })

              it("Withdraw with a single funder", async () => {
                  // Get starting balances of the contract and the contract's owner
                  const startingFundmeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } =
                      await transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Get ending balance of the contract and the contract's owner
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundmeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 0; i < 6; i++) {
                      const fundMeConnectedWithAcc = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedWithAcc.fund({ value: sentValue })
                  }

                  // Get starting balances of the contract and the contract's owner
                  const startingFundmeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } =
                      await transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Get ending balance of the contract and the contract's owner
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundmeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure the funders are set properly
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (let i = 0; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
