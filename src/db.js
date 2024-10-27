const checkIfExists = async (client, tableName, tokenAddress) => {
  const query = `
    SELECT token_address FROM ${tableName} where token_address = $1 
    `;
  const result = await client.query(query, [tokenAddress]);
  return result.rows.length > 0;
};

const insertIntoTable = async (
  client,
  tableName,
  tokenAddress,
  name,
  symbol,
  decimals,
  chain
) => {
  const query = `
    INSERT INTO ${tableName} (token_address, name, symbol, decimals, chain)
    VALUES ($1, $2, $3, $4, $5)`;
  await client.query(query, [tokenAddress, name, symbol, decimals, chain]);
  console.log(`Token ${name} inserted into ${tableName} table`);
  return tokenAddress, name, symbol, decimals, chain;
};

module.exports = { checkIfExists, insertIntoTable };
