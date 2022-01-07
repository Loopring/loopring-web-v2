import { NFTTokenInfo, UserNFTBalanceInfo } from "@loopring-web/loopring-sdk";
import { FeeInfo, NFTWholeINFO } from "@loopring-web/common-resources";
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
  nftDepositValue: DepositData &
    Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>;
};

export enum LAST_STEP {
  withdraw = "withdraw",
  transfer = "transfer",
  deposit = "deposit",
  nftWithdraw = "nftWithdraw",
  nftTransfer = "nftTransfer",
  nftDeposit = "nftDeposit",
  default = "default",
}
