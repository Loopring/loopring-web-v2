import {
  DualViewInfo,
  NFTWholeINFO,
  TradeNFT,
} from "@loopring-web/common-resources";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";
import { AmmPanelType } from "../../../components";

export enum ModalType {
  transfer = "transfer",
  deposit = "deposit",
  withdraw = "withdraw",
}

export type ModalTypeKeys = keyof typeof ModalType;

export type ModalStatePlayLoad = {
  isShow: boolean;
  info?: { [key: string]: any };
};
export type Transaction = {
  symbol?: undefined | string;
};

export interface ModalState {
  isShowSupport: ModalStatePlayLoad;
  isShowOtherExchange: ModalStatePlayLoad & {
    agree?: boolean;
  };
  isWrongNetworkGuide: ModalStatePlayLoad;
  isShowClaimWithdraw: ModalStatePlayLoad & Transaction;
  isShowTransfer: ModalStatePlayLoad & Transaction;
  isShowWithdraw: ModalStatePlayLoad & Transaction;
  isShowDeposit: ModalStatePlayLoad & Transaction & { partner?: boolean };
  isShowNFTDetail: ModalStatePlayLoad & Partial<NFTWholeINFO>;
  isShowNFTTransfer: ModalStatePlayLoad & Partial<TradeNFT<any, any>>;
  isShowNFTWithdraw: ModalStatePlayLoad & Partial<TradeNFT<any, any>>;
  isShowNFTDeploy: ModalStatePlayLoad & Partial<TradeNFT<any, any>>;
  isShowNFTDeposit: ModalStatePlayLoad & Partial<TradeNFT<any, any>>;
  isShowNFTMintAdvance: ModalStatePlayLoad & Partial<TradeNFT<any, any>>;
  isShowCollectionAdvance: ModalStatePlayLoad;
  isShowDual: ModalStatePlayLoad & { dualInfo: DualViewInfo | undefined };
  isShowResetAccount: ModalStatePlayLoad;
  isShowActiveAccount: ModalStatePlayLoad;
  isShowExportAccount: ModalStatePlayLoad;
  isShowLayerSwapNotice: ModalStatePlayLoad;
  isShowSwap: ModalStatePlayLoad;
  isShowAmm: ModalStatePlayLoad & Transaction & { type?: AmmPanelType };
  isShowTradeIsFrozen: ModalStatePlayLoad & {
    type?: string;
    messageKey?: string;
  };
  isShowConnect: ModalStatePlayLoad & { step: number; error?: RESULT_INFO };
  isShowAccount: ModalStatePlayLoad & {
    step: number;
    error?: RESULT_INFO;
    // info?: { [key: string]: any };
  };
  isShowRedPacket: ModalStatePlayLoad & {
    step: number;
    // info?: { [key: string]: any };
  };
  isShowFeeSetting: ModalStatePlayLoad;
  isShowIFrame: ModalStatePlayLoad & { url: string };
}
