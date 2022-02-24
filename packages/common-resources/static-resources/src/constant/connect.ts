export enum ConnectProviders {
  unknown = "unknown",
  MetaMask = "MetaMask",
  WalletConnect = "WalletConnect",
  WalletLink = "WalletLink",
  GameStop = "GameStop",
}
export const RPC_URLS: { [chainId: number]: string } = {
  1: process.env.REACT_APP_RPC_URL_1 as string,
  5: process.env.REACT_APP_RPC_URL_5 as string,
};
