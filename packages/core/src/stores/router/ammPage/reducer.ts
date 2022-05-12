import {
  AmmExitData,
  AmmJoinData,
  IBData,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "@loopring-web/component-lib";
import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { PageAmmCommon } from "./index";
import { PageAmmExit, PageAmmJoin, PageAmmPoolStatus } from "./interface";
import * as sdk from "@loopring-web/loopring-sdk";
import { BIGO } from "../../../defs";

export const initSlippage = 0.5;

const initJoinState: PageAmmJoin = {
  fees: {},
  fee: 0,
  request: undefined,
  btnI18nKey: undefined,
  btnStatus: TradeBtnStatus.AVAILABLE,
  ammCalcData: undefined,
  ammData: {
    coinA: { belong: undefined } as unknown as IBData<string>,
    coinB: { belong: undefined } as unknown as IBData<string>,
    slippage: initSlippage,
  } as AmmJoinData<IBData<string>, string>,
};

const initExitState: PageAmmExit = {
  volA_show: undefined,
  volB_show: undefined,
  fees: {},
  fee: 0,
  request: undefined,
  btnI18nKey: undefined,
  btnStatus: TradeBtnStatus.AVAILABLE,
  ammCalcData: undefined,
  ammData: {
    coinLP: { belong: undefined } as unknown as IBData<string>,
    slippage: initSlippage,
  } as AmmExitData<IBData<string>, string>,
};

const initCommonState: PageAmmCommon = {
  ammInfo: undefined,
  ammPoolSnapshot: undefined,
};

const initialState: PageAmmPoolStatus = {
  ammJoin: initJoinState,
  ammExit: initExitState,
  common: initCommonState,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};

const pageAmmPoolSlice: Slice<PageAmmPoolStatus> = createSlice({
  name: "_router_pageAmmPool",
  initialState,
  reducers: {
    resetAmmPool(state) {
      state.ammJoin = initJoinState;
      state.ammExit = initExitState;
      state.common = initCommonState;
    },

    updatePageAmmCommon(state, action: PayloadAction<Partial<PageAmmCommon>>) {
      const { ammInfo, ammPoolSnapshot } = action.payload;

      if (ammInfo) {
        state.common.ammInfo = ammInfo;
      }

      if (ammPoolSnapshot) {
        state.common.ammPoolSnapshot = ammPoolSnapshot;
      }
    },

    updatePageAmmJoinBtn(state, action: PayloadAction<Partial<PageAmmJoin>>) {
      const { btnI18nKey, btnStatus } = action.payload;

      state.ammJoin.btnI18nKey = btnI18nKey;

      if (btnStatus) {
        state.ammJoin.btnStatus = btnStatus;
      }
    },

    updatePageAmmJoin(state, action: PayloadAction<Partial<PageAmmJoin>>) {
      const { fee, fees, request, ammCalcData, ammData } = action.payload;

      if (fee) {
        state.ammJoin.fee = fee;
      }

      if (fees) {
        state.ammJoin.fees = fees;
      }

      if (request) {
        state.ammJoin.request = request;
      }

      if (ammCalcData) {
        state.ammJoin.ammCalcData = ammCalcData;
      }

      if (ammData) {
        state.ammJoin.ammData = ammData;
      }
    },

    updatePageAmmExitBtn(state, action: PayloadAction<Partial<PageAmmExit>>) {
      const { btnI18nKey, btnStatus } = action.payload;

      state.ammExit.btnI18nKey = btnI18nKey;

      if (btnStatus) {
        state.ammExit.btnStatus = btnStatus;
      }
    },

    updatePageAmmExit(state, action: PayloadAction<Partial<PageAmmExit>>) {
      const {
        fee,
        fees,
        request,
        ammCalcData,
        ammData,

        volA_show,
        volB_show,
      } = action.payload;

      if (fee) {
        state.ammExit.fee = fee;
      }

      if (fees) {
        state.ammExit.fees = fees;
      }

      if (request) {
        state.ammExit.request = request;
      }

      if (ammCalcData) {
        state.ammExit.ammCalcData = ammCalcData;
      }

      if (ammData) {
        state.ammExit.ammData = ammData;
      }

      if (volA_show !== undefined && sdk.toBig(volA_show).gte(BIGO)) {
        state.ammExit.volA_show = volA_show;
      }

      if (volB_show !== undefined && sdk.toBig(volB_show).gte(BIGO)) {
        state.ammExit.volB_show = volB_show;
      }
    },
  },
});

export { pageAmmPoolSlice };

export const {
  updatePageAmmJoin,
  updatePageAmmJoinBtn,
  updatePageAmmExit,
  updatePageAmmExitBtn,
  updatePageAmmCommon,
  resetAmmPool,
} = pageAmmPoolSlice.actions;
