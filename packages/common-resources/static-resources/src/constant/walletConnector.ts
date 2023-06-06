import { GatewayItem } from "../loopring-interface";
import { SoursURL } from "./router";
import { ConnectProviders } from "@loopring-web/web3-provider";

export enum GatewaySort {
  MetaMask,
  WalletConnect,
  GameStop,
  Coinbase,
}

const gatewayMap = new Map<GatewaySort, GatewayItem>(); // = [
gatewayMap.set(GatewaySort.MetaMask, {
  key: ConnectProviders.MetaMask,
  keyi18n: ConnectProviders.MetaMask,
  imgSrc: SoursURL + "svg/meta-mask.svg",
});
gatewayMap.set(GatewaySort.WalletConnect, {
  key: ConnectProviders.WalletConnect,
  keyi18n: ConnectProviders.WalletConnect,
  imgSrc: SoursURL + "svg/wallet-connect.svg",
});
gatewayMap.set(GatewaySort.GameStop, {
  key: ConnectProviders.GameStop,
  keyi18n: ConnectProviders.GameStop,
  imgSrc: SoursURL + "svg/gs.svg",
});

gatewayMap.set(GatewaySort.Coinbase, {
  key: ConnectProviders.Coinbase,
  keyi18n: ConnectProviders.Coinbase,
  imgSrc: SoursURL + "svg/coinbase-wallet.svg",
});
export const gatewayList: GatewayItem[] = [...gatewayMap.keys()].reduce(
  (prev, key) => {
    // @ts-ignore
    prev[key as any] = gatewayMap.get(key as any);
    return prev;
  },
  [] as GatewayItem[]
);
