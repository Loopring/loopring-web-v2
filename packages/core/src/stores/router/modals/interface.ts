import * as sdk from "@loopring-web/loopring-sdk";
import { NFTTokenInfo, UserNFTBalanceInfo } from "@loopring-web/loopring-sdk";
import {
  FeeInfo,
  MintTradeNFT,
  NFTMETA,
  NFTWholeINFO,
  TradeNFT,
} from "@loopring-web/common-resources";
import { WalletLayer2Map } from "../../walletLayer2";

export type WithdrawData = {
  belong: string | undefined;
  tradeValue: number | undefined;
  balance: number | undefined;
  address: string | undefined;
  fee: FeeInfo | undefined;
};

export type TransferData = {
  belong: string | undefined;
  tradeValue: number | undefined;
  balance: number | undefined;
  address: string | undefined;
  memo: string | undefined;
  fee: FeeInfo | undefined;
};

export type DepositData = {
  belong: string | undefined;
  tradeValue: number | undefined;
  balance: number | undefined;
  referAddress?: string;
  toAddress?: string;
  addressError?: { error: boolean; message?: string | undefined };
};
export type MintData = {
  tokenAddress: string | undefined;
  tradeValue: number | undefined;
  memo: string | undefined;
  fee: FeeInfo | undefined;
};

export type ActiveAccountData = {
  chargeFeeList: FeeInfo[];
  fee?: FeeInfo;
  isFeeNotEnough?: boolean;
  walletLayer2: WalletLayer2Map<any> | undefined;
};
export type NFT_MINT_VALUE<I> = {
  mintData: Partial<MintTradeNFT<I>>;
  nftMETA: Partial<NFTMETA>;
  error?: undefined | sdk.RESULT_INFO;
};

export type ModalDataStatus = {
  lastStep: LAST_STEP;
  withdrawValue: WithdrawData;
  transferValue: TransferData;
  depositValue: DepositData;
  activeAccountValue: ActiveAccountData;
  nftWithdrawValue: WithdrawData &
    Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>;
  nftTransferValue: TransferData &
    Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>;
  nftDepositValue: TradeNFT<any>;
  nftMintAdvanceValue: TradeNFT<any>;
  nftMintValue: NFT_MINT_VALUE<any>;
  nftDeployValue: TradeNFT<any> & { broker: string };
};

export enum LAST_STEP {
  withdraw = "withdraw",
  transfer = "transfer",
  deposit = "deposit",
  nftWithdraw = "nftWithdraw",
  nftTransfer = "nftTransfer",
  nftDeposit = "nftDeposit",
  nftDeploy = "nftDeploy",
  nftMint = "nftMint",
  default = "default",
}
