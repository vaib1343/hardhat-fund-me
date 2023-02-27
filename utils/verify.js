const { run } = require("hardhat");

const verify = async (contractAddress, args) => {

    try {
        await run("verify:verify", {
            address: contractAddress,
             constructorArguments: args,
        })
    } catch (error) {
        if (error.message.includes("already verified")) {
            console.log("Already verified !");
        } else {
            console.log(error);
        }
    }

    console.log('verified')
};



module.exports = {verify};
