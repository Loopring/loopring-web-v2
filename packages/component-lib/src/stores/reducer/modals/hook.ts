import { useDispatch, useSelector } from "react-redux";
import { ModalState, ModalStatePlayLoad, Transaction } from "./interface";
import {
  setShowAccount,
  setShowActiveAccount,
  setShowAmm,
  setShowConnect,
  setShowDeposit,
  setShowExportAccount,
  setShowFeeSetting,
  setShowIFrame,
  setShowNFTDeposit,
  setShowNFTTransfer,
  setShowNFTWithdraw,
  setShowNFTMint,
  setShowResetAccount,
  setShowSupport,
  setShowSwap,
  setShowTransfer,
  setShowWithdraw,
} from "./reducer";

import React from "react";
import { NFTWholeINFO, TradeNFT } from "@loopring-web/common-resources";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";

export const useOpenModals = () => {
  const dispatch = useDispatch();
  return {
    modals: useSelector((state: any) => state.modals) as ModalState,
    setShowSupport: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) =>
        dispatch(setShowSupport(state)),
      [dispatch]
    ),
    setShowTransfer: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) =>
        dispatch(setShowTransfer(state)),
      [dispatch]
    ),
    setShowDeposit: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) =>
        dispatch(setShowDeposit(state)),
      [dispatch]
    ),
    setShowWithdraw: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) =>
        dispatch(setShowWithdraw(state)),
      [dispatch]
    ),
    setShowNFTTransfer: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) =>
        dispatch(setShowNFTTransfer(state)),
      [dispatch]
    ),
    setShowNFTDeposit: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any>>) =>
        dispatch(setShowNFTDeposit(state)),
      [dispatch]
    ),
    setShowNFTMint: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any>>) =>
        dispatch(setShowNFTMint(state)),
      [dispatch]
    ),
    setShowNFTWithdraw: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) =>
        dispatch(setShowNFTWithdraw(state)),
      [dispatch]
    ),

    setShowResetAccount: React.useCallback(
      (state: ModalStatePlayLoad) => {
        dispatch(setShowResetAccount(state));
      },
      [dispatch]
    ),
    setShowActiveAccount: React.useCallback(
      (state: ModalStatePlayLoad) => {
        dispatch(setShowActiveAccount(state));
      },
      [dispatch]
    ),
    setShowAmm: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowAmm(state)),
      [dispatch]
    ),
    setShowSwap: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowSwap(state)),
      [dispatch]
    ),
    setShowAccount: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          step?: number;
          error?: RESULT_INFO;
          info?: { [key: string]: any };
        }
      ) => dispatch(setShowAccount(state)),
      [dispatch]
    ),
    setShowConnect: React.useCallback(
      (state: ModalStatePlayLoad & { step?: number; error?: RESULT_INFO }) =>
        dispatch(setShowConnect(state)),
      [dispatch]
    ),
    setShowIFrame: React.useCallback(
      (state: ModalStatePlayLoad & { url: string }) =>
        dispatch(setShowIFrame(state)),
      [dispatch]
    ),
    setShowExportAccount: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowExportAccount(state)),
      [dispatch]
    ),
    setShowFeeSetting: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowFeeSetting(state)),
      [dispatch]
    ),
  };
};
