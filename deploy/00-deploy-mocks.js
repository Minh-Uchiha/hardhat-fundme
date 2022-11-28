const { DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    if (chainId == 31337) {
        log("Local Network detected! Start deploying mocks...")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Finished deploying mocks")
        log("---------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
