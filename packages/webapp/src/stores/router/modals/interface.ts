import { NFTTokenInfo, UserNFTBalanceInfo } from "@loopring-web/loopring-sdk";
import {
  FeeInfo,
  IBData,
  TradeNFT,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import { WalletLayer2Map } from "../../walletLayer2";

export type WithdrawData = {
  belong: string | undefined;
  tradeValue: number | undefined;
  balance: number | undefined;
  address: string | undefined;
};

export type TransferData = {
  belong: string | undefined;
  tradeValue: number | undefined;
  balance: number | undefined;
  address: string | undefined;
  memo: string | undefined;
};

export type DepositData = {
  belong: string | undefined;
  tradeValue: number | undefined;
  balance: number | undefined;
  reffer: string | undefined;
};

export type ActiveAccountData = {
  chargeFeeList: FeeInfo[];
  fee?: FeeInfo;
  walletLayer2: WalletLayer2Map<any> | undefined;
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
  nftMintValue: TradeNFT<any>;
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
