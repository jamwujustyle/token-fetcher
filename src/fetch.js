const { ethers, keccak256, toUtf8Bytes } = require("ethers");
const insertTokenData = require("./save");

const bridgeAddresses = {
  gnosis: "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d",
};

const rpcUrls = {
  gnosis: "https://rpc.ankr.com/gnosis",
  ethereum: "https://rpc.ankr.com/eth",
};
const createProvider = (chain) => {
  const rpcUrl = rpcUrls[chain];
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return provider;
};
const transferTopic = keccak256(
  toUtf8Bytes("Transfer(address,address,uint256)")
);

const getLogs = async (chain, client) => {
  const gnosisProvider = createProvider("gnosis");
  const ethProvider = createProvider("ethereum");
  const currentBlock = await gnosisProvider.getBlockNumber();
  console.log(`Current block in gnosis ${currentBlock}`);

  const contractAddress = bridgeAddresses[chain];
  const blockRange = 1000;
  let fromBlock = currentBlock;
  const startBlock = 0;

  while (fromBlock > startBlock) {
    const toBlock = Math.max(fromBlock - blockRange + 1, startBlock);
    console.log(`Fetching logs from block ${fromBlock} to block ${toBlock}...`);

    const filter = {
      address: null,
      fromBlock: toBlock,
      toBlock: fromBlock,
      topics: [transferTopic, null, ethers.zeroPadValue(contractAddress, 32)],
    };
    try {
      const logs = await gnosisProvider.getLogs(filter);

      if (logs.length > 0) {
        console.log(`Found ${logs.length} logs in this range`);
      }
      for (const log of logs) {
        const tokenAddress = log.address;

        const tokenData = await insertTokenData(
          client,
          tokenAddress,
          gnosisProvider,
          ethProvider
        );
        if (tokenData) console.log(tokenData);
      }
    } catch (error) {
      console.error(
        `Error fetching blocks from ${fromBlock} to ${toBlock}`,
        error.message
      );
    }
    fromBlock -= blockRange;
  }
};

module.exports = getLogs;
