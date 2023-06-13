import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import {
  Contact,
  ModalState,
  ModalStatePlayLoad,
  Transaction,
} from "./interface";
import {
  CLAIM_TYPE,
  ClaimToken,
  DualViewInfo,
  NFTWholeINFO,
  TradeNFT,
} from "@loopring-web/common-resources";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";
import { AmmPanelType } from "../../../components";

const initialState: ModalState = {
  isShowNFTMetaNotReady: { isShow: false },
  isShowRedPacket: { isShow: false, step: 0 },
  isShowSupport: { isShow: false },
  isShowOtherExchange: { isShow: false },
  isWrongNetworkGuide: { isShow: false },
  isShowTransfer: { isShow: false, symbol: undefined },
  isShowWithdraw: { isShow: false, symbol: undefined },
  isShowDeposit: { isShow: false, symbol: undefined },
  isShowResetAccount: { isShow: false },
  isShowActiveAccount: { isShow: false },
  isShowExportAccount: { isShow: false },
  isShowSwap: { isShow: false },
  isShowAmm: { isShow: false, type: AmmPanelType.Join },
  isShowConnect: { isShow: false, step: 0 },
  isShowAccount: { isShow: false, step: 0 },
  isShowLayerSwapNotice: { isShow: false },
  isShowAnotherNetwork: { isShow: false },
  isShowFeeSetting: { isShow: false },
  isShowTradeIsFrozen: { isShow: false, type: "" },
  isShowIFrame: { isShow: false, url: "" },
  isShowNFTTransfer: { isShow: false },
  isShowNFTWithdraw: { isShow: false },
  isShowNFTDeposit: { isShow: false },
  isShowNFTMintAdvance: { isShow: false },
  isShowDual: { isShow: false, dualInfo: undefined },
  isShowCollectionAdvance: { isShow: false },
  isShowNFTDeploy: { isShow: false },
  isShowNFTDetail: { isShow: false },
  isShowClaimWithdraw: {
    isShow: false,
    claimToken: undefined,
    claimType: undefined,
  },
  isShowSideStakingRedeem: { isShow: false, symbol: undefined },
};

export const modalsSlice: Slice<ModalState> = createSlice({
  name: "modals",
  initialState,
  reducers: {
    setNFTMetaNotReady(
      state,
      action: PayloadAction<{
        isShow: boolean;
        step?: number;
        info?: { [key: string]: any };
      }>
    ) {
      const { isShow, info } = action.payload;
      state.isShowNFTMetaNotReady = {
        isShow,
        info,
      };
    },
    setShowRedPacket(
      state,
      action: PayloadAction<{
        isShow: boolean;
        step?: number;
        info?: { [key: string]: any };
      }>
    ) {
      const { isShow, step, info } = action.payload;
      state.isShowRedPacket = {
        isShow,
        step: step ? step : 0,
        info,
      };
    },
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
    setShowOtherExchange(
      state,
      action: PayloadAction<
        ModalStatePlayLoad & {
          agree?: boolean;
        }
      >
    ) {
      const { isShow, agree, ...rest } = action.payload;
      state.isShowOtherExchange = {
        isShow,
        agree: isShow ? false : agree,
        ...rest,
      };
    },
    setShowWrongNetworkGuide(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isWrongNetworkGuide.isShow = isShow;
    },
    setShowAmm(
      state,
      action: PayloadAction<
        ModalStatePlayLoad & Transaction & { type: AmmPanelType }
      >
    ) {
      const { isShow, symbol, info, type } = action.payload;
      state.isShowAmm = {
        isShow,
        symbol,
        info,
        type,
      };
    },
    setShowSwap(state, action: PayloadAction<ModalStatePlayLoad>) {
      const { isShow } = action.payload;
      state.isShowSwap.isShow = isShow;
    },
    setShowNFTDetail(
      state,
      action: PayloadAction<ModalStatePlayLoad & Partial<NFTWholeINFO>>
    ) {
      const { isShow, ...rest } = action.payload;
      state.isShowNFTDetail = {
        isShow,

        ...rest,
      };
    },
    setShowNFTTransfer(
      state,
      action: PayloadAction<ModalStatePlayLoad & NFTWholeINFO>
    ) {
      const { isShow, nftData, nftType, total, locked, info, ...rest } =
        action.payload;
      state.isShowNFTTransfer = {
        isShow,
        nftData,
        nftType,
        info,
        ...rest,
        balance: total ? Number(total) - Number(locked ?? 0) : 0,
      };
    },
    setShowNFTDeploy(
      state,
      action: PayloadAction<ModalStatePlayLoad & NFTWholeINFO>
    ) {
      const { isShow, nftData, nftType, total, locked, info, ...rest } =
        action.payload;
      state.isShowNFTDeploy = {
        isShow,
        nftData,
        nftType,
        info,
        ...rest,
        balance: total ? Number(total) - Number(locked ?? 0) : 0,
      };
    },

    setShowNFTDeposit(
      state,
      action: PayloadAction<ModalStatePlayLoad & TradeNFT<any, any>>
    ) {
      const { isShow, nftData, nftType, ...rest } = action.payload;
      state.isShowNFTDeposit = {
        isShow,
        nftType,
        ...rest,
      };
    },
    setShowCollectionAdvance(
      state,
      action: PayloadAction<ModalStatePlayLoad & any>
    ) {
      const { isShow, info } = action.payload;
      state.isShowCollectionAdvance = {
        isShow,
        info,
      };
    },
    setShowNFTMintAdvance(
      state,
      action: PayloadAction<ModalStatePlayLoad & TradeNFT<any, any>>
    ) {
      const { isShow, nftData, nftType, ...rest } = action.payload;
      state.isShowNFTMintAdvance = {
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
      const { isShow, nftData, nftType, total, locked, info, ...rest } =
        action.payload;
      state.isShowNFTWithdraw = {
        isShow,
        nftData,
        nftType,
        info,
        ...rest,
        balance: total ? Number(total) - Number(locked ?? 0) : 0,
      };
    },
    setShowTransfer(
      state,
      action: PayloadAction<ModalStatePlayLoad & Transaction & Contact>
    ) {
      const { isShow, symbol, info, name, address, addressType } =
        action.payload;
      state.isShowTransfer = {
        isShow,
        symbol,
        info,
        name,
        address,
        addressType,
      };
    },
    setShowWithdraw(
      state,
      action: PayloadAction<ModalStatePlayLoad & Transaction & Contact>
    ) {
      const { isShow, symbol, info, name, address, addressType } =
        action.payload;
      state.isShowWithdraw = {
        isShow,
        symbol,
        info,
        name,
        address,
        addressType,
      };
    },
    setShowDeposit(
      state,
      action: PayloadAction<
        ModalStatePlayLoad & Transaction & { partner: boolean }
      >
    ) {
      const { isShow, symbol, partner } = action.payload;
      state.isShowDeposit = {
        isShow,
        symbol,
        partner,
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
    setShowDual(
      state,
      action: PayloadAction<
        ModalStatePlayLoad & { dualInfo: DualViewInfo | undefined }
      >
    ) {
      const { isShow, dualInfo } = action.payload;
      if (dualInfo) {
        state.isShowDual = {
          isShow,
          dualInfo,
        };
      } else {
        state.isShowDual.isShow = false;
        state.isShowDual.dualInfo = undefined;
      }
    },
    setShowConnect(
      state,
      action: PayloadAction<{
        isShow: boolean;
        step?: number;
        error?: RESULT_INFO;
      }>
    ) {
      const { isShow, step, error } = action.payload;
      state.isShowConnect = {
        isShow,
        step: step ? step : 0,
        error: error ?? undefined,
      };
    },
    setShowAccount(
      state,
      action: PayloadAction<{
        isShow: boolean;
        step?: number;
        error?: RESULT_INFO;
        info?: { [key: string]: any };
      }>
    ) {
      const { isShow, step, error, info } = action.payload;
      state.isShowAccount = {
        isShow,
        step: step ? step : 0,
        error: error ?? undefined,
        info: info ?? undefined,
      };
    },
    setShowFeeSetting(state, action: PayloadAction<{ isShow: boolean }>) {
      const { isShow } = action.payload;
      state.isShowFeeSetting = {
        isShow,
      };
    },
    setShowLayerSwapNotice(state, action: PayloadAction<{ isShow: boolean }>) {
      const {isShow} = action.payload;
      state.isShowLayerSwapNotice = {
        isShow,
      };
    },
    setShowAnotherNetworkNotice(
      state,
      action: PayloadAction<{ isShow: boolean }>
    ) {
      const {isShow} = action.payload;
      state.isShowAnotherNetwork = {
        isShow,
      };
    },
    setShowTradeIsFrozen(
      state,
      action: PayloadAction<{
        isShow: boolean;
        type: string;
        messageKey?: string;
      }>
    ) {
      const {isShow, type, messageKey} = action.payload;
      state.isShowTradeIsFrozen = {
        isShow,
        type,
        messageKey,
      };
    },
    setShowClaimWithdraw(
      state,
      action: PayloadAction<
        ModalStatePlayLoad & {
          claimToken: ClaimToken;
          claimType: CLAIM_TYPE;
          successCallback?: () => void;
        }
      >
    ) {
      const { isShow, claimToken, claimType, successCallback } = action.payload;
      state.isShowClaimWithdraw = {
        isShow,
        claimToken,
        claimType,
        successCallback,
      };
    },
    setShowSideStakingRedeem(
      state,
      action: PayloadAction<ModalStatePlayLoad & { symbol?: string }>
    ) {
      const { isShow, symbol } = action.payload;
      state.isShowSideStakingRedeem = {
        isShow,
        symbol,
      };
    },
  },
});
export const {
  setShowNFTDeploy,
  setShowNFTDetail,
  setShowNFTTransfer,
  setShowNFTDeposit,
  setShowNFTWithdraw,
  setShowNFTMintAdvance,
  setShowCollectionAdvance,
  setShowTransfer,
  setShowWithdraw,
  setShowDeposit,
  setShowResetAccount,
  setShowExportAccount,
  setShowDual,
  setShowSwap,
  setShowAmm,
  setShowConnect,
  setShowAccount,
  setShowFeeSetting,
  setShowActiveAccount,
  setShowIFrame,
  setShowTradeIsFrozen,
  setShowSupport,
  setShowWrongNetworkGuide,
  setShowOtherExchange,
  setShowLayerSwapNotice,
  setShowClaimWithdraw,
  setShowRedPacket,
  setNFTMetaNotReady,
  setShowSideStakingRedeem,
  setShowAnotherNetworkNotice,
} = modalsSlice.actions;
