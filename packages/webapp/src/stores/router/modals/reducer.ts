import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import {
  ActiveAccountData,
  DepositData,
  LAST_STEP,
  ModalDataStatus,
  TransferData,
  WithdrawData,
} from "./interface";
import { UserNFTBalanceInfo } from "@loopring-web/loopring-sdk";
import { NFTWholeINFO, TradeNFT } from "@loopring-web/common-resources";

const initialWithdrawState: WithdrawData = {
  belong: undefined,
  tradeValue: 0,
  balance: 0,
  address: undefined,
};

const initialTransferState: TransferData = {
  belong: undefined,
  tradeValue: 0,
  balance: 0,
  address: undefined,
  memo: undefined,
};

const initialDepositState: DepositData = {
  belong: undefined,
  tradeValue: 0,
  balance: 0,
  reffer: undefined,
};

const initialTradeNFT: TradeNFT<any> = {
  belong: undefined,
  tradeValue: 0,
  balance: 0,
};
const initialActiveAccountState: ActiveAccountData = {
  chargeFeeList: [],
  walletLayer2: undefined,
};

const initialState: ModalDataStatus = {
  lastStep: LAST_STEP.default,
  withdrawValue: initialWithdrawState,
  transferValue: initialTransferState,
  depositValue: initialDepositState,
  nftWithdrawValue: initialWithdrawState,
  nftTransferValue: initialTransferState,
  nftDepositValue: initialTradeNFT,
  nftMintValue: initialTradeNFT,
  nftDeployValue: { ...initialTradeNFT, broker: "" },
  activeAccountValue: initialActiveAccountState,
};

const modalDataSlice: Slice<ModalDataStatus> = createSlice({
  name: "_router_modalData",
  initialState,
  reducers: {
    resetAll(state) {
      this.resetWithdrawData(state);
      this.resetTransferData(state);
      this.resetDepositData(state);
      this.resetNFTWithdrawData(state);
      this.resetNFTTransferData(state);
      this.resetNFTDepositData(state);
      this.resetActiveAccountData(state);
      this.resetNFTMintData(state);
      this.resetNFTDeployData(state);
    },

    resetWithdrawData(state) {
      state.lastStep = LAST_STEP.default;
      state.withdrawValue = initialWithdrawState;
    },
    resetActiveAccountData(state) {
      state.lastStep = LAST_STEP.default;
      state.activeAccountValue = initialActiveAccountState;
    },
    resetTransferData(state) {
      state.lastStep = LAST_STEP.default;
      state.transferValue = initialTransferState;
    },
    resetDepositData(state) {
      state.lastStep = LAST_STEP.default;
      state.depositValue = initialDepositState;
    },
    resetNFTWithdrawData(state) {
      state.lastStep = LAST_STEP.default;
      state.nftWithdrawValue = initialWithdrawState;
    },
    resetNFTTransferData(state) {
      state.lastStep = LAST_STEP.default;
      state.nftTransferValue = initialTransferState;
    },
    resetNFTDepositData(state) {
      state.lastStep = LAST_STEP.default;
      state.nftDepositValue = initialDepositState;
    },
    resetNFTMintData(state) {
      state.lastStep = LAST_STEP.default;
      state.nftMintValue = initialWithdrawState;
    },
    resetNFTDeployData(state) {
      state.lastStep = LAST_STEP.default;
      state.nftDeployValue = { ...initialTradeNFT, broker: "" };
    },
    updateActiveAccountData(
      state,
      action: PayloadAction<Partial<ActiveAccountData>>
    ) {
      const { chargeFeeList, walletLayer2 } = action.payload;
      state.lastStep = LAST_STEP.default;
      if (chargeFeeList) {
        state.activeAccountValue.chargeFeeList = chargeFeeList;
        state.activeAccountValue.walletLayer2 = walletLayer2;
      }
    },

    updateWithdrawData(state, action: PayloadAction<Partial<WithdrawData>>) {
      const { belong, balance, tradeValue, address } = action.payload;
      state.lastStep = LAST_STEP.withdraw;
      if (belong) {
        state.withdrawValue.belong = belong;
      }

      if (balance === undefined || balance >= 0) {
        state.withdrawValue.balance = balance;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.withdrawValue.tradeValue = tradeValue;
      }

      if (address === undefined || address !== "*") {
        state.withdrawValue.address = address;
      }
    },
    updateTransferData(state, action: PayloadAction<Partial<TransferData>>) {
      const { belong, balance, tradeValue, address } = action.payload;
      state.lastStep = LAST_STEP.transfer;
      if (belong) {
        state.transferValue.belong = belong;
      }

      if (balance === undefined || balance >= 0) {
        state.transferValue.balance = balance;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.transferValue.tradeValue = tradeValue;
      }

      if (address === undefined || address !== "*") {
        state.transferValue.address = address;
      }
    },
    updateDepositData(state, action: PayloadAction<Partial<DepositData>>) {
      const { belong, balance, tradeValue, reffer } = action.payload;
      state.lastStep = LAST_STEP.nftDeposit;
      if (belong) {
        state.depositValue.belong = belong;
      }

      if (balance === undefined || balance >= 0) {
        state.depositValue.balance = balance;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.depositValue.tradeValue = tradeValue;
      }

      if (reffer === undefined || reffer !== "*") {
        state.depositValue.reffer = reffer;
      }
    },
    updateNFTWithdrawData(
      state,
      action: PayloadAction<
        Partial<WithdrawData & UserNFTBalanceInfo & NFTWholeINFO>
      >
    ) {
      const { belong, balance, tradeValue, address, ...rest } = action.payload;
      state.lastStep = LAST_STEP.nftWithdraw;
      if (belong) {
        state.nftWithdrawValue.belong = belong;
      }

      if (balance === undefined || balance >= 0) {
        state.nftWithdrawValue.balance = balance;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftWithdrawValue.tradeValue = tradeValue;
      }

      if (address === undefined || address !== "*") {
        state.nftWithdrawValue.address = address;
      }
      state.nftWithdrawValue = {
        ...state.nftWithdrawValue,
        ...rest,
      };
    },
    updateNFTTransferData(
      state,
      action: PayloadAction<
        Partial<TransferData & UserNFTBalanceInfo & NFTWholeINFO>
      >
    ) {
      const { belong, balance, tradeValue, address, ...rest } = action.payload;
      state.lastStep = LAST_STEP.nftTransfer;

      if (belong) {
        state.nftTransferValue.belong = belong;
      }

      if (balance === undefined || balance >= 0) {
        state.nftTransferValue.balance = balance;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftTransferValue.tradeValue = tradeValue;
      }

      if (address === undefined || address !== "*") {
        state.nftTransferValue.address = address;
      }
      state.nftTransferValue = {
        ...state.nftTransferValue,
        ...rest,
      };
    },
    updateNFTDepositData(state, action: PayloadAction<Partial<TradeNFT<any>>>) {
      const { balance, tradeValue, ...rest } = action.payload;
      state.lastStep = LAST_STEP.nftDeposit;

      if (balance === undefined || balance >= 0) {
        state.nftDepositValue.balance = balance;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftDepositValue.tradeValue = tradeValue;
      }

      state.nftDepositValue = {
        ...state.nftDepositValue,
        ...rest,
      };
    },
    updateNFTMintData(state, action: PayloadAction<Partial<TradeNFT<any>>>) {
      const { balance, tradeValue, ...rest } = action.payload;
      state.lastStep = LAST_STEP.nftMint;

      if (balance === undefined || balance >= 0) {
        state.nftMintValue.balance = balance;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftMintValue.tradeValue = tradeValue;
      }

      state.nftMintValue = {
        ...state.nftMintValue,
        ...rest,
      };
    },
    updateNFTDeployData(
      state,
      action: PayloadAction<Partial<TradeNFT<any> & { broker: string }>>
    ) {
      const { balance, tradeValue, broker, ...rest } = action.payload;
      state.lastStep = LAST_STEP.nftDeploy;

      if (balance === undefined || balance >= 0) {
        state.nftDeployValue.balance = balance;
      }
      if (broker) {
        state.nftDeployValue.broker = broker;
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftDeployValue.tradeValue = tradeValue;
      }

      state.nftDeployValue = {
        ...state.nftDeployValue,
        ...rest,
      };
    },
  },
});

export { modalDataSlice };

export const {
  updateActiveAccountData,
  updateWithdrawData,
  updateTransferData,
  updateDepositData,
  updateNFTWithdrawData,
  updateNFTTransferData,
  updateNFTDepositData,
  updateNFTMintData,
  updateNFTDeployData,
  resetNFTWithdrawData,
  resetNFTTransferData,
  resetNFTDepositData,
  resetNFTMintData,
  resetWithdrawData,
  resetTransferData,
  resetDepositData,
  resetActiveAccountData,
  resetNFTDeployData,
  resetAll,
} = modalDataSlice.actions;
