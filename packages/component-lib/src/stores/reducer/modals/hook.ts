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
  setShowTradeIsFrozen,
} from "./reducer";

import React from "react";
import { NFTWholeINFO, TradeNFT } from "@loopring-web/common-resources";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";
import { ToggleState } from "../toggle";

export const useOpenModals = () => {
  const dispatch = useDispatch();
  const toggle = useSelector((state: any) => state.toggle) as ToggleState;
  return {
    modals: useSelector((state: any) => state.modals) as ModalState,
    setShowSupport: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) =>
        dispatch(setShowSupport(state)),
      [dispatch]
    ),
    setShowTransfer: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => {
        if (toggle.transfer.enable) {
          dispatch(setShowTransfer(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Transfer" }));
        }
      },
      [dispatch]
    ),
    setShowDeposit: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & { partner?: boolean }) => {
        if (toggle.deposit.enable) {
          dispatch(setShowDeposit(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Deposit" }));
        }
      },
      [dispatch]
    ),
    setShowWithdraw: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => {
        if (toggle.withdraw.enable) {
          dispatch(setShowWithdraw(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Withdraw" }));
        }
      },
      [dispatch]
    ),
    setShowNFTTransfer: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) => {
        if (toggle.transferNFT.enable) {
          dispatch(setShowNFTTransfer(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Transfer" }));
        }
      },
      [dispatch]
    ),
    setShowNFTDeposit: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any>>) => {
        if (toggle.depositNFT.enable) {
          dispatch(setShowNFTDeposit(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Deposit" }));
        }
      },
      [dispatch]
    ),
    setShowNFTMint: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any>>) => {
        if (toggle.mintNFT.enable) {
          dispatch(setShowNFTMint(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Mint" }));
        }
      },
      [dispatch]
    ),
    setShowNFTWithdraw: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) => {
        if (toggle.withdrawNFT.enable) {
          dispatch(setShowNFTWithdraw(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Withdraw" }));
        }
      },
      [dispatch]
    ),

    setShowResetAccount: React.useCallback(
      (state: ModalStatePlayLoad) => {
        if (toggle.updateAccount.enable) {
          dispatch(setShowResetAccount(state));
        } else {
          dispatch(
            setShowTradeIsFrozen({ isShow: true, type: "reset-account" })
          );
        }
      },
      [dispatch]
    ),
    setShowActiveAccount: React.useCallback(
      (state: ModalStatePlayLoad) => {
        if (toggle.updateAccount.enable) {
          dispatch(setShowActiveAccount(state));
        } else {
          dispatch(
            setShowTradeIsFrozen({ isShow: true, type: "active-account" })
          );
        }
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
    setShowTradeIsFrozen: React.useCallback(
      (state: ModalStatePlayLoad & { type?: string }) =>
        dispatch(setShowTradeIsFrozen(state)),
      [dispatch]
    ),
  };
};
