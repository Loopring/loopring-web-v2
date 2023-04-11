import { useDispatch, useSelector } from "react-redux";
import {
  Contact,
  ModalState,
  ModalStatePlayLoad,
  Transaction,
} from "./interface";
import {
  setNFTMetaNotReady,
  setShowAccount,
  setShowActiveAccount,
  setShowAmm,
  setShowClaimWithdraw,
  setShowCollectionAdvance,
  setShowConnect,
  setShowDeposit,
  setShowDual,
  setShowExportAccount,
  setShowFeeSetting,
  setShowIFrame,
  setShowLayerSwapNotice,
  setShowNFTDeploy,
  setShowNFTDeposit,
  setShowNFTDetail,
  setShowNFTMintAdvance,
  setShowNFTTransfer,
  setShowNFTWithdraw,
  setShowOtherExchange,
  setShowRedPacket,
  setShowResetAccount,
  setShowSideStakingRedeem,
  setShowSupport,
  setShowSwap,
  setShowTradeIsFrozen,
  setShowTransfer,
  setShowWithdraw,
  setShowWrongNetworkGuide,
} from "./reducer";

import React from "react";
import {
  CLAIM_TYPE,
  ClaimToken,
  DualViewInfo,
  NFTWholeINFO,
  TradeNFT,
} from "@loopring-web/common-resources";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";
import { ToggleState } from "../toggle";
import { AmmPanelType } from "../../../components";

export const useOpenModals = () => {
  const dispatch = useDispatch();
  const toggle = useSelector((state: any) => state.toggle) as ToggleState;
  return {
    modals: useSelector((state: any) => state.modals) as ModalState,
    setShowRedPacket: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          step?: number;
          info?: { [key: string]: any };
        }
      ) => dispatch(setShowRedPacket(state)),
      [dispatch]
    ),
    setNFTMetaNotReady: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          step?: number;
          info?: { [key: string]: any };
        }
      ) => dispatch(setNFTMetaNotReady(state)),
      [dispatch]
    ),
    setShowSupport: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) =>
        dispatch(setShowSupport(state)),
      [dispatch]
    ),
    setShowOtherExchange: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          agree?: boolean;
        } & Transaction
      ) => dispatch(setShowOtherExchange(state)),
      [dispatch]
    ),
    setShowWrongNetworkGuide: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) =>
        dispatch(setShowWrongNetworkGuide(state)),
      [dispatch]
    ),

    setShowTransfer: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & Contact) => {
        if (toggle.transfer.enable) {
          dispatch(setShowTransfer(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Transfer" }));
        }
      },
      [dispatch]
    ),
    setShowNFTDeploy: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => {
        dispatch(setShowNFTDeploy(state));
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
      (state: ModalStatePlayLoad & Transaction & Contact) => {
        if (toggle.withdraw.enable) {
          dispatch(setShowWithdraw(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Withdraw" }));
        }
      },
      [dispatch]
    ),
    setShowNFTDetail: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) => {
        dispatch(setShowNFTDetail(state));
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
      (state: ModalStatePlayLoad & Partial<TradeNFT<any, any>>) => {
        if (toggle.depositNFT.enable) {
          dispatch(setShowNFTDeposit(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Deposit" }));
        }
      },
      [dispatch]
    ),
    setShowCollectionAdvance: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any, any>>) => {
        if (toggle.collectionNFT.enable) {
          dispatch(setShowCollectionAdvance(state));
        } else {
          dispatch(
            setShowCollectionAdvance({ isShow: true, type: "Collection" })
          );
        }
      },
      [dispatch]
    ),
    setShowNFTMintAdvance: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any, any>>) => {
        if (toggle.mintNFT.enable) {
          dispatch(setShowNFTMintAdvance(state));
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
      (state: ModalStatePlayLoad & Transaction & { type?: AmmPanelType }) =>
        dispatch(setShowAmm(state)),
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
    setShowDual: React.useCallback(
      (state: ModalStatePlayLoad & { dualInfo: DualViewInfo | undefined }) =>
        dispatch(setShowDual(state)),
      [dispatch]
    ),
    setShowClaimWithdraw: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          claimToken?: ClaimToken;
          claimType?: CLAIM_TYPE;
        }
      ) => {
        if (toggle.claim.enable) {
          dispatch(setShowClaimWithdraw(state));
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: "Claim" }));
        }
      },
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
    setShowLayerSwapNotice: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowLayerSwapNotice(state)),
      [dispatch]
    ),
    setShowTradeIsFrozen: React.useCallback(
      (state: ModalStatePlayLoad & { type?: string; messageKey?: string }) =>
        dispatch(setShowTradeIsFrozen(state)),
      [dispatch]
    ),
    setShowSideStakingRedeem: React.useCallback(
      (state: ModalStatePlayLoad & { symbol?: string }) =>
        dispatch(setShowSideStakingRedeem(state)),
      [dispatch]
    ),
  };
};
