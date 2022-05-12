import { StateBase } from "@loopring-web/common-resources";
import { ChainId, ExchangeInfo } from "@loopring-web/loopring-sdk";

export enum ENV {
  DEV = "DEV",
  UAT = "UAT",
  PROD = "PROD",
}

export enum NETWORKEXTEND {
  NONETWORK = "unknown",
}

export type NETWORK = NETWORKEXTEND | ChainId;

export type System<C extends { [key: string]: any }> = {
  env: keyof typeof ENV;
  chainId: NETWORK;
  // network: keyof typeof NETWORK,
  etherscanBaseUrl: string;
  socketURL: string;
  baseURL: string;
  fiatPrices: { [k in keyof C]: { price: any; [key: string]: any } };
  gasPrice: number;
  forex: number;
  exchangeInfo: ExchangeInfo | undefined;
  allowTrade: {
    register: { enable: boolean; reason?: string };
    order: { enable: boolean; reason?: string };
    joinAmm: { enable: boolean; reason?: string };
    dAppTrade: { enable: boolean; reason?: string };
    legal: { enable: boolean; reason?: string; show?: boolean };
    raw_data?: any;
    exitAmm?: { enable: boolean; reason?: string };
    transfer?: { enable: boolean; reason?: string };
    transferNFT?: { enable: boolean; reason?: string };
    deposit?: { enable: boolean; reason?: string };
    depositNFT?: { enable: boolean; reason?: string };
    withdraw?: { enable: boolean; reason?: string };
    withdrawNFT?: { enable: boolean; reason?: string };
    mintNFT?: { enable: boolean; reason?: string };
    deployNFT?: { enable: boolean; reason?: string };
  };
};

export type SystemStatus = System<{ [key: string]: any }> & {
  // system:System | {}
  __timer__: NodeJS.Timeout | -1;
  topics: any[];
} & StateBase;
