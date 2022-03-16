import { GatewayItem } from "../loopring-interface";
import { SoursURL } from "./router";
import { ConnectProviders } from "@loopring-web/web3-provider";
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
  {
    key: ConnectProviders.GameStop,
    imgSrc: SoursURL + "svg/gs.svg",
  },
];
