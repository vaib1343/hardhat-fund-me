const { network } = require("hardhat");
const { developmentChain } = require("../helper-hardhat-config");

module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;
    console.log(chainId)
    if (developmentChain.includes(network.name)) {
        log("mock contract deploying");
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [8, 200000000000],
            blockConfirmation: 6
        });
    }
    log('Mocks deployed!')
    log('----------------------------------------------------------------')
};

module.exports.tags = ['all', 'mocks'] 