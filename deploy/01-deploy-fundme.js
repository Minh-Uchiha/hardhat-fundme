const { networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verfiy")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let priceFeedAddress
    if (network.config.chainId === 31337) {
        const mockAggregator = await deployments.get("MockV3Aggregator")
        priceFeedAddress = mockAggregator.address
    } else priceFeedAddress = networkConfig[network.config.chainId]["address"]
    const args = [priceFeedAddress]
    log("Deploying FundMe contract...")
    const fundMeContract = await deploy("FundMe", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("Finished deploying Fundme contract")
    log("----------------------------------------------")

    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY)
        await verify(fundMeContract.address, args)
}

module.exports.tags = ["all", "fundme"]
