const { ethers } = require("hardhat");

async function main() {
    // Deploying MyNFT contract


        const MyNFT = await ethers.getContractFactory("MNFT");
        console.log("Deploying NFT and marketplace");

        const mynft = await MyNFT.deploy();

        console.log("MyNFT deployed at: ",mynft.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});



// //➜  backend git:(main) ✗ npx hardhat run scripts/deploy.js --network ethenaTestnet

// Compiled 19 Solidity files successfully (evm target: paris).
// Deploying NFT and marketplace
// MyNFT deployed at:  0x1f76ba87fa309A14027e5c9136d35EEB8414001E
