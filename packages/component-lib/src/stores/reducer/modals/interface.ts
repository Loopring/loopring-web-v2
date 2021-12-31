import { NFTWholeINFO, TradeNFT } from "@loopring-web/common-resources";

export enum ModalType {
  transfer = "transfer",
  deposit = "deposit",
  withdraw = "withdraw",
}

export type ModalTypeKeys = keyof typeof ModalType;

export type ModalStatePlayLoad = {
  isShow: boolean;
};
export type Transaction = {
  symbol?: undefined | string;
};

export interface ModalState {
  isShowSupport: ModalStatePlayLoad;
  isShowTransfer: ModalStatePlayLoad & Transaction;
  isShowWithdraw: ModalStatePlayLoad & Transaction;
  isShowDeposit: ModalStatePlayLoad & Transaction & { partner?: boolean };
  isShowNFTTransfer: ModalStatePlayLoad & Partial<NFTWholeINFO>;
  isShowNFTWithdraw: ModalStatePlayLoad & Partial<NFTWholeINFO>;
  isShowNFTDeposit: ModalStatePlayLoad & Partial<TradeNFT<any>>;
  isShowNFTMint: ModalStatePlayLoad & Partial<TradeNFT<any>>;
  isShowResetAccount: ModalStatePlayLoad;
  isShowActiveAccount: ModalStatePlayLoad;
  isShowExportAccount: ModalStatePlayLoad;
  isShowSwap: ModalStatePlayLoad;
  isShowAmm: ModalStatePlayLoad;
  isShowConnect: ModalStatePlayLoad & { step: number };
  isShowAccount: ModalStatePlayLoad & { step: number };
  isShowFeeSetting: ModalStatePlayLoad;
  isShowIFrame: ModalStatePlayLoad & { url: string };
}
