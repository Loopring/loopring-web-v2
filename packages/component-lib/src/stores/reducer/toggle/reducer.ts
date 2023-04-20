import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import { ToggleState } from "./interface";

const initialState: ToggleState = {
  order: { enable: true },
  btradeOrder: { enable: true },
  joinAmm: { enable: true },
  exitAmm: { enable: true },
  transfer: { enable: true },
  transferNFT: { enable: true },
  deposit: { enable: true },
  depositNFT: { enable: true },
  withdraw: { enable: true },
  withdrawNFT: { enable: true },
  mintNFT: { enable: true },
  deployNFT: { enable: true },
  updateAccount: { enable: true },
  collectionNFT: { enable: true },
  WSTETHInvest: { enable: true },
  RETHInvest: { enable: true },
  defiInvest: { enable: true },
  dualInvest: { enable: true },
  claim: { enable: true },
  redPacketNFTV1: { enable: true },
  LRCStackInvest: { enable: true },
};

export const toggleSlice: Slice<ToggleState> = createSlice<
  ToggleState,
  SliceCaseReducers<ToggleState>
>({
  name: "toggle",
  initialState: initialState,
  reducers: {
    updateToggleStatus(state, action: PayloadAction<Partial<ToggleState>>) {
      const {
        order,
        joinAmm,
        WSTETHInvest,
        RETHInvest,
        exitAmm,
        transfer,
        transferNFT,
        deposit,
        depositNFT,
        withdraw,
        withdrawNFT,
        mintNFT,
        deployNFT,
        updateAccount,
        collectionNFT,
        claim,
      } = action.payload;
      if (order !== undefined) {
        state.order = order;
      }

      if (joinAmm !== undefined) {
        state.joinAmm = joinAmm;
      }
      if (exitAmm !== undefined) {
        state.exitAmm = exitAmm;
      }
      if (transfer !== undefined) {
        state.transfer = transfer;
      }
      if (transferNFT !== undefined) {
        state.transferNFT = transferNFT;
      }
      if (deposit !== undefined) {
        state.deposit = deposit;
      }
      if (depositNFT !== undefined) {
        state.depositNFT = depositNFT;
      }
      if (withdraw !== undefined) {
        state.withdraw = withdraw;
      }
      if (withdrawNFT !== undefined) {
        state.withdrawNFT = withdrawNFT;
      }
      if (mintNFT !== undefined) {
        state.mintNFT = mintNFT;
      }
      if (deployNFT !== undefined) {
        state.deployNFT = deployNFT;
      }
      if (updateAccount !== undefined) {
        state.updateAccount = updateAccount;
      }

      if (WSTETHInvest !== undefined) {
        state.WSTETHInvest = WSTETHInvest;
      }
      if (RETHInvest !== undefined) {
        state.RETHInvest = RETHInvest;
      }
      if (collectionNFT !== undefined) {
        state.collectionNFT = collectionNFT;
      }
      if (claim !== undefined) {
        state.claim = claim;
      }
    },
  },
});
export const { updateToggleStatus } = toggleSlice.actions;
