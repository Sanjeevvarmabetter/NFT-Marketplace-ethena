require("@nomiclabs/hardhat-ethers"); 
require("dotenv").config(); 

module.exports = {
  solidity: "0.8.20", 
  networks: {
    ethenaTestnet: {
      url: "https://testnet.rpc.ethena.fi", 
      chainId: 52085143, 
      accounts: [process.env.PRIVATE_KEY], 
    },
  },
};


