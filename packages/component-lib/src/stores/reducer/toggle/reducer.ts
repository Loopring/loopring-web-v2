import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import { ToggleState } from "./interface";

const initialState: ToggleState = {
  order: { enable: true },
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
    },
  },
});
export const { updateToggleStatus } = toggleSlice.actions;
