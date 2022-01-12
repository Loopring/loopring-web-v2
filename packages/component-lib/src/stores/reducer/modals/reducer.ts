import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { ModalState, ModalStatePlayLoad, Transaction } from "./interface";
import { NFTWholeINFO, TradeNFT } from "@loopring-web/common-resources";

const initialState: ModalState = {
  isShowTransfer: { isShow: false, symbol: undefined },
  isShowWithdraw: { isShow: false, symbol: undefined },
  isShowDeposit: { isShow: false, symbol: undefined },
  isShowResetAccount: { isShow: false },
  isShowActiveAccount: { isShow: false },
  isShowExportAccount: { isShow: false },
  isShowSwap: { isShow: false },
  isShowAmm: { isShow: false },
  isShowConnect: { isShow: false, step: 0 },
  isShowAccount: { isShow: false, step: 0 },
  isShowSupport: { isShow: false },
  isShowFeeSetting: { isShow: false },
  isShowIFrame: { isShow: false, url: "" },
  isShowNFTTransfer: { isShow: false },
  isShowNFTWithdraw: { isShow: false },
  isShowNFTDeposit: { isShow: false },
  isShowNFTMint: { isShow: false },
};

export const modalsSlice: Slice<ModalState> = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setShowIFrame(
      state,
      action: PayloadAction<{ isShow: boolean; url: string }>
    ) {
      const { isShow, url } = action.payload;
      state.isShowIFrame = {
        isShow,
        url,
      };
    },
    setShowSupport(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isShowSupport.isShow = isShow;
    },
    setShowAmm(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isShowAmm.isShow = isShow;
    },
    setShowSwap(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isShowSwap.isShow = isShow;
    },
    setShowNFTTransfer(
      state,
      action: PayloadAction<ModalStatePlayLoad & NFTWholeINFO>
    ) {
      const { isShow, nftData, nftType, ...rest } = action.payload;
      state.isShowNFTTransfer = {
        isShow,
        nftData,
        nftType,
        ...rest,
      };
    },
    setShowNFTDeposit(
      state,
      action: PayloadAction<ModalStatePlayLoad & TradeNFT<any>>
    ) {
      const { isShow, nftData, nftType, ...rest } = action.payload;
      state.isShowNFTDeposit = {
        isShow,
        nftType,
        ...rest,
      };
    },
    setShowNFTMint(
      state,
      action: PayloadAction<ModalStatePlayLoad & TradeNFT<any>>
    ) {
      const { isShow, nftData, nftType, ...rest } = action.payload;
      state.isShowNFTMint = {
        isShow,
        nftData,
        nftType,
        ...rest,
      };
    },
    setShowNFTWithdraw(
      state,
      action: PayloadAction<ModalStatePlayLoad & NFTWholeINFO>
    ) {
      const { isShow, nftData, nftType, ...rest } = action.payload;
      state.isShowNFTWithdraw = {
        isShow,
        nftData,
        nftType,
        ...rest,
      };
    },
    setShowTransfer(
      state,
      action: PayloadAction<ModalStatePlayLoad & Transaction>
    ) {
      const { isShow, symbol } = action.payload;
      state.isShowTransfer = {
        isShow,
        symbol,
      };
    },
    setShowWithdraw(
      state,
      action: PayloadAction<ModalStatePlayLoad & Transaction>
    ) {
      const { isShow, symbol } = action.payload;
      state.isShowWithdraw = {
        isShow,
        symbol,
      };
    },
    setShowDeposit(
      state,
      action: PayloadAction<ModalStatePlayLoad & Transaction>
    ) {
      const { isShow, symbol } = action.payload;
      state.isShowDeposit = {
        isShow,
        symbol,
      };
    },
    setShowResetAccount(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isShowResetAccount.isShow = isShow;
    },
    setShowActiveAccount(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isShowActiveAccount.isShow = isShow;
    },
    setShowExportAccount(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isShowExportAccount.isShow = isShow;
    },
    setShowConnect(
      state,
      action: PayloadAction<{ isShow: boolean; step?: number }>
    ) {
      const { isShow, step } = action.payload;
      state.isShowConnect = {
        isShow,
        step: step ? step : 0,
      };
    },
    setShowAccount(
      state,
      action: PayloadAction<{ isShow: boolean; step?: number }>
    ) {
      const { isShow, step } = action.payload;
      state.isShowAccount = {
        isShow,
        step: step ? step : 0,
      };
    },
    setShowFeeSetting(state, action: PayloadAction<{ isShow: boolean }>) {
      const { isShow } = action.payload;
      state.isShowFeeSetting = {
        isShow,
      };
    },
  },
});
export const {
  setShowNFTTransfer,
  setShowNFTDeposit,
  setShowNFTWithdraw,
  setShowTransfer,
  setShowWithdraw,
  setShowDeposit,
  setShowResetAccount,
  setShowExportAccount,
  setShowSwap,
  setShowAmm,
  setShowConnect,
  setShowAccount,
  setShowSupport,
  setShowFeeSetting,
  setShowActiveAccount,
  setShowIFrame,
  setShowNFTMint,
} = modalsSlice.actions;
// export const { setTheme,setPlatform,setLanguage } = settingsSlice.actions
