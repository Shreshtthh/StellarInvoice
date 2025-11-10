export const stellarNetwork = "FUTURENET";
export const networkPassphrase = "Test SDF Future Network ; October 2022";
export const rpcUrl = "https://rpc-futurenet.stellar.org";
export const horizonUrl = "https://horizon-futurenet.stellar.org";

export const network = {
  id: "futurenet" as const,
  label: "futurenet",
  passphrase: networkPassphrase,
  rpcUrl: rpcUrl,
  horizonUrl: horizonUrl,
};

const stellarEncode = (str: string) => {
  return str.replace(/\//g, "//").replace(/;/g, "/;");
};

export const labPrefix = () => {
  return `https://lab.stellar.org/transaction-dashboard?$=network$id=futurenet&label=Futurenet&horizonUrl=${stellarEncode(horizonUrl)}&rpcUrl=${stellarEncode(rpcUrl)}&passphrase=${stellarEncode(networkPassphrase)};`;
};
