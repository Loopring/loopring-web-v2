import { GatewayItem } from "../loopring-interface";
import { ConnectProviders } from "./connect";
import { SoursURL } from "./router";

export const gatewayList: Partial<GatewayItem>[] = [
  {
    key: ConnectProviders.MetaMask,
    imgSrc: SoursURL + "svg/meta-mask.svg",
  },
  {
    key: ConnectProviders.WalletConnect,
    imgSrc: SoursURL + "svg/wallet-connect.svg",
  },
  {
    key: ConnectProviders.Coinbase,
    imgSrc: SoursURL + "svg/coinbase-wallet.svg",
  },
];
