import { NFTWholeINFO, TradeNFT } from "@loopring-web/common-resources";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";

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
  isShowTransfer: ModalStatePlayLoad & Transaction;
  isShowWithdraw: ModalStatePlayLoad & Transaction;
  isShowDeposit: ModalStatePlayLoad & Transaction & { partner?: boolean };
  isShowNFTTransfer: ModalStatePlayLoad & Partial<TradeNFT<any>>;
  isShowNFTWithdraw: ModalStatePlayLoad & Partial<TradeNFT<any>>;
  isShowNFTDeposit: ModalStatePlayLoad & Partial<TradeNFT<any>>;
  isShowNFTMintAdvance: ModalStatePlayLoad & Partial<TradeNFT<any>>;
  isShowResetAccount: ModalStatePlayLoad;
  isShowActiveAccount: ModalStatePlayLoad;
  isShowExportAccount: ModalStatePlayLoad;
  isShowSwap: ModalStatePlayLoad;
  isShowAmm: ModalStatePlayLoad;
  isShowTradeIsFrozen: ModalStatePlayLoad & { type?: string };
  isShowConnect: ModalStatePlayLoad & { step: number; error?: RESULT_INFO };
  isShowAccount: ModalStatePlayLoad & {
    step: number;
    error?: RESULT_INFO;
    // info?: { [key: string]: any };
  };
  isShowNFTDetail: ModalStatePlayLoad & Partial<NFTWholeINFO>;
  isShowFeeSetting: ModalStatePlayLoad;
  isShowIFrame: ModalStatePlayLoad & { url: string };
}
