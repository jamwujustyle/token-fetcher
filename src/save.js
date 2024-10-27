const ethers = require("ethers");
const { checkIfExists, insertIntoTable } = require("./db");

const bridgeAddresses = {
  gnosis: "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d",
};

const tokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function nativeTokenAddress(address _bridgedToken) public view returns (address)",
];

const insertTokenData = async (
  client,
  tokenAddress,
  gnosisProvider,
  ethProvider
) => {
  const bridgedAddress = bridgeAddresses["gnosis"];
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      tokenAbi,
      gnosisProvider
    );

    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    const gnosisExists = await checkIfExists(client, "gnosis", tokenAddress);

    if (!gnosisExists) {
      await insertIntoTable(
        client,
        "gnosis",
        tokenAddress,
        name,
        symbol,
        decimals,
        "Gnosis"
      );
    } else console.log(`Token ${name} already exists in Gnosis table`);

    const bridgeContract = new ethers.Contract(
      bridgedAddress,
      tokenAbi,
      gnosisProvider
    );
    const bridgedTokenAddress = await bridgeContract.nativeTokenAddress(
      tokenAddress
    );
    if (bridgedTokenAddress && bridgedTokenAddress !== ethers.AddressZero) {
      console.log("Token bridged to ethereum");

      const ethTokenContract = new ethers.Contract(
        bridgedTokenAddress,
        tokenAbi,
        ethProvider
      );
      const [ethName, ethSymbol, ethDecimals] = await Promise.all([
        ethTokenContract.name(),
        ethTokenContract.symbol(),
        ethTokenContract.decimals(),
      ]);

      const ethereumExists = await checkIfExists(
        client,
        "ethereum",
        bridgedTokenAddress
      );
      if (!ethereumExists) {
        await insertIntoTable(
          client,
          "Ethereum",
          bridgedTokenAddress,
          ethName,
          ethSymbol,
          ethDecimals,
          "Ethereum"
        );
      } else console.log(`Token ${ethName} already exists in Ethereum table`);
    }

    if (
      tokenAddress === ethers.AddressZero ||
      bridgedTokenAddress === ethers.AddressZero
    ) {
      console.log(`Address of the token is AddressZero`);

      const blockedExists = await checkIfExists(
        client,
        "blocked",
        tokenAddress
      );

      if (!blockedExists) {
        insertIntoTable(
          client,
          "blocked",
          tokenAddress,
          name,
          symbol,
          decimals,
          "gnosis"
        );
      } else {
        console.log(`Token ${name} already exists in Blocked table`);
      }
    }
  } catch (error) {
    console.error("Error inserting token data:", error.message);
    console.log(error);
  }
};

module.exports = insertTokenData;
