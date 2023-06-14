import { GatewayItem } from "../loopring-interface";
import { SoursURL } from "./router";
import { ConnectProviders } from "@loopring-web/web3-provider";

export const gatewayList: Partial<GatewayItem>[] = [
  {
    key: ConnectProviders.MetaMask,
    keyi18n: ConnectProviders.MetaMask,
    imgSrc: SoursURL + "svg/meta-mask.svg",
  },
  {
    key: ConnectProviders.WalletConnect,
    keyi18n: ConnectProviders.WalletConnect,
    imgSrc: SoursURL + "svg/wallet-connect.svg",
  },
  {
    key: ConnectProviders.GameStop,
    keyi18n: ConnectProviders.GameStop,
    imgSrc: SoursURL + "svg/gs.svg",
  },
  {
    key: ConnectProviders.Coinbase,
    keyi18n: ConnectProviders.Coinbase,
    imgSrc: SoursURL + "svg/coinbase-wallet.svg",
  },
];
