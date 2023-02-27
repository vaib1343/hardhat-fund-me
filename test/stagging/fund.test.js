const {} = require("chai");
const { network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");

developmentChain.includes(network.name)
    ? describe.skip
    : describe("constructor",async () => {
        it("should have owner")
    });
