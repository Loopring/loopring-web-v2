import { GatewayItem } from "../loopring-interface";
import { ConnectProviders } from "./connect";
import { SoursURL } from "./router";

export const gatewayList: GatewayItem[] = [
  {
    key: ConnectProviders.MetaMask,
    imgSrc: SoursURL + "svg/meta-mask.svg",
  },
  {
    key: ConnectProviders.GameStop,
    imgSrc: SoursURL + "svg/gs.svg",
  },
  {
    key: ConnectProviders.WalletConnect,
    imgSrc: SoursURL + "svg/wallet-connect.svg",
  },
  // {
  //     key: ConnectProviders.WalletLink,
  //     imgSrc: SoursURL+'svg/coinbase-wallet.svg',
  // },
  // {
  //     key: 'Ledger',
  //     imgSrc: 'https://static.loopring.io/assets/svg/ledger.svg',
  // },
  // {
  //     key: 'Trezor',
  //     imgSrc: 'https://static.loopring.io/assets/svg/trezor.svg',
  // },
];
