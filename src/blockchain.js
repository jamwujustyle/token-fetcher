const ethers = require("ethers");

const fetchTokenDetails = async (tokenAddress, tokenAbi, provider) => {
  const tokenContract = await ethers.Contract(tokenAddress, tokenAbi, provider);
  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.deimals(),
  ]);
  return [name, symbol, decimals];
};

const fetchBridgedTokenAddress = async (
  provider,
  bridgeAddress,
  tokenAddress,
  tokenAbi
) => {
  const bridgeContract = new ethers.Contract(bridgeAddress, tokenAbi, provider);
  const bridgedTokenAddress = await bridgeContract.nativeTokenAddress(
    tokenAddress
  );
  return bridgedTokenAddress !== ethers.AddressZero
    ? bridgedTokenAddress
    : null;
};

module.exports = {
  fetchTokenDetails,
  fetchBridgedTokenAddress,
};
