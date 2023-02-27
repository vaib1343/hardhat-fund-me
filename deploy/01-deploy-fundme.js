const { networkConfig, developmentChain } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy, log, get } = deployments;
    let priceFeedAddress;

    if (developmentChain.includes(network.name)) {
        const MockV3Aggregator = await get("MockV3Aggregator");
        priceFeedAddress = MockV3Aggregator.address;
    } else {
        priceFeedAddress =
            networkConfig[network.config.chainId].priceFeedAddress;
    }
    const args = [priceFeedAddress];
    const fundme = await deploy("FundMe", {
        from: deployer,
        log: true,
        args: args,
    });

    if (!developmentChain.includes(network.name) && process.env.ETHERSCAN) {
        await verify(fundme.address, args);
    }
};

module.exports.tags = ["fundme", "all"];
