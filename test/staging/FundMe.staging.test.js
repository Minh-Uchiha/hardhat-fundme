const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { assert } = require("chai")

network.config.chainId !== 5
    ? describe.skip
    : describe("FundMe", async () => {
          let deployer, fundMe
          const SEND_ETH = ethers.utils.parseEther("1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("Allows users to fund and withdraw ether", async () => {
              const fundTxResponse = await fundMe.fund({ value: SEND_ETH })
              await fundTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
