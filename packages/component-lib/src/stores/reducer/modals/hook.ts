import { useDispatch, useSelector } from 'react-redux'
import { ModalState, ModalStatePlayLoad, Transaction } from './interface'
import {
  setNFTMetaNotReady,
  setShowAccount,
  setShowActiveAccount,
  setShowAmm,
  setShowAnotherNetworkNotice,
  setShowClaimWithdraw,
  setShowCollectionAdvance,
  setShowConnect,
  setShowDeposit,
  setShowDual,
  setShowExportAccount,
  setShowFeeSetting,
  setShowGlobalToast,
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
  setShowTargetRedpacketPop,
  setShowTradeIsFrozen,
  setShowTransfer,
  setShowWithdraw,
  setShowWrongNetworkGuide,
  setShowEditContact,
  setShowVaultJoin,
  setShowVaultExit,
  setShowVaultSwap,
  setShowVaultLoan,
  setShowNoVaultAccount,
  setShowConfirmedVault,
  setShowETHStakingApr,
  setShowTransferToTaikoAccount,
} from './reducer'

import React from 'react'
import {
  CLAIM_TYPE,
  ClaimToken,
  DualViewInfo,
  NFTWholeINFO,
  TradeNFT,
  AmmPanelType,
  CoinSource,
  Contact,
  VaultAction,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { ToggleState } from '../toggle'
import { ToastType } from '../../../components'

export const useOpenModals = () => {
  const dispatch = useDispatch()
  const toggle = useSelector((state: any) => state.toggle) as ToggleState
  return {
    modals: useSelector((state: any) => state.modals) as ModalState,
    setShowRedPacket: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          step?: number
          info?: { [key: string]: any }
        },
      ) => dispatch(setShowRedPacket(state)),
      [dispatch],
    ),
    setNFTMetaNotReady: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          step?: number
          info?: { [key: string]: any }
        },
      ) => dispatch(setNFTMetaNotReady(state)),
      [dispatch],
    ),
    setShowSupport: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => dispatch(setShowSupport(state)),
      [dispatch],
    ),
    setShowOtherExchange: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          agree?: boolean
        } & Transaction,
      ) => dispatch(setShowOtherExchange(state)),
      [dispatch],
    ),
    setShowWrongNetworkGuide: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => dispatch(setShowWrongNetworkGuide(state)),
      [dispatch],
    ),

    setShowTransfer: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & Contact) => {
        if (!toggle.transfer.enable && state.isShow) {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Transfer' }))
          return
        }
        dispatch(setShowTransfer(state))
      },
      [dispatch, toggle.transfer.enable],
    ),
    setShowTransferToTaikoAccount: React.useCallback(
      (state: ModalStatePlayLoad) => {
        if (toggle.transferToTaikoAccount.enable) {
          dispatch(setShowTransferToTaikoAccount(state))
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'TransferToTaikoAccount' }))
        }
      },
      [dispatch, toggle.transferToTaikoAccount.enable],
    ),
    setShowNFTDeploy: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => {
        dispatch(setShowNFTDeploy(state))
      },
      [dispatch],
    ),
    setShowDeposit: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & { partner?: boolean }) => {
        if (!toggle.deposit.enable && state.isShow) {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Deposit' }))
          return 
        }
        dispatch(setShowDeposit(state))
      },
      [dispatch, toggle.deposit.enable],
    ),
    setShowWithdraw: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & Contact) => {
        if (!toggle.withdraw.enable && state.isShow) {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Withdraw' }))
          return
        } 
        dispatch(setShowWithdraw(state))
      },
      [dispatch, toggle.withdraw.enable],
    ),
    setShowNFTDetail: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) => {
        dispatch(setShowNFTDetail(state))
      },
      [dispatch],
    ),
    setShowNFTTransfer: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) => {
        if (toggle.transferNFT.enable) {
          dispatch(setShowNFTTransfer(state))
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Transfer' }))
        }
      },
      [dispatch, toggle.transferNFT.enable],
    ),
    setShowNFTDeposit: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any, any>>) => {
        if (toggle.depositNFT.enable) {
          dispatch(setShowNFTDeposit(state))
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Deposit' }))
        }
      },
      [dispatch, toggle.depositNFT.enable],
    ),
    setShowCollectionAdvance: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any, any>>) => {
        if (toggle.collectionNFT.enable) {
          dispatch(setShowCollectionAdvance(state))
        } else {
          dispatch(setShowCollectionAdvance({ isShow: true, type: 'Collection' }))
        }
      },
      [dispatch, toggle.collectionNFT.enable],
    ),
    setShowNFTMintAdvance: React.useCallback(
      (state: ModalStatePlayLoad & Partial<TradeNFT<any, any>>) => {
        if (toggle.mintNFT.enable) {
          dispatch(setShowNFTMintAdvance(state))
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Mint' }))
        }
      },
      [dispatch, toggle.mintNFT.enable],
    ),
    setShowNFTWithdraw: React.useCallback(
      (state: ModalStatePlayLoad & Partial<NFTWholeINFO>) => {
        if (toggle.withdrawNFT.enable) {
          dispatch(setShowNFTWithdraw(state))
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Withdraw' }))
        }
      },
      [dispatch, toggle.withdrawNFT.enable],
    ),

    setShowResetAccount: React.useCallback(
      (state: ModalStatePlayLoad) => {
        if (!toggle.updateAccount.enable && state.isShow) {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'reset-account' }))
          return
        } 
        dispatch(setShowResetAccount(state))
      },
      [dispatch, toggle.updateAccount.enable],
    ),
    setShowActiveAccount: React.useCallback(
      (state: ModalStatePlayLoad) => {
        if (toggle.updateAccount.enable) {
          dispatch(setShowActiveAccount(state))
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'active-account' }))
        }
      },
      [dispatch, toggle.updateAccount.enable],
    ),
    setShowAmm: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & { type?: AmmPanelType }) =>
        dispatch(setShowAmm(state)),
      [dispatch],
    ),
    setShowSwap: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowSwap(state)),
      [dispatch],
    ),
    setShowAccount: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          step?: number
          error?: sdk.RESULT_INFO
          info?: { [key: string]: any }
        },
      ) => dispatch(setShowAccount(state)),
      [dispatch],
    ),
    setShowDual: React.useCallback(
      (state: ModalStatePlayLoad & { dualInfo: DualViewInfo | undefined }) =>
        dispatch(setShowDual(state)),
      [dispatch],
    ),
    setShowClaimWithdraw: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          claimToken?: ClaimToken
          claimType?: CLAIM_TYPE
        },
      ) => {
        if (toggle.claim.enable) {
          dispatch(setShowClaimWithdraw(state))
        } else {
          dispatch(setShowTradeIsFrozen({ isShow: true, type: 'Claim' }))
        }
      },
      [dispatch, toggle.claim.enable],
    ),
    setShowConnect: React.useCallback(
      (
        state: ModalStatePlayLoad & {
          step?: number
          error?: sdk.RESULT_INFO
          info?: { [key: string]: any }
        },
      ) => dispatch(setShowConnect(state)),
      [dispatch],
    ),
    setShowIFrame: React.useCallback(
      (state: ModalStatePlayLoad & { url: string }) => dispatch(setShowIFrame(state)),
      [dispatch],
    ),
    setShowExportAccount: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowExportAccount(state)),
      [dispatch],
    ),
    setShowFeeSetting: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowFeeSetting(state)),
      [dispatch],
    ),
    setShowLayerSwapNotice: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowLayerSwapNotice(state)),
      [dispatch],
    ),
    setShowAnotherNetworkNotice: React.useCallback(
      (state: ModalStatePlayLoad) => dispatch(setShowAnotherNetworkNotice(state)),
      [dispatch],
    ),
    setShowTradeIsFrozen: React.useCallback(
      (state: ModalStatePlayLoad & { type?: string; messageKey?: string }) =>
        dispatch(setShowTradeIsFrozen(state)),
      [dispatch],
    ),
    setShowSideStakingRedeem: React.useCallback(
      (state: ModalStatePlayLoad & { symbol?: string }) =>
        dispatch(setShowSideStakingRedeem(state)),
      [dispatch],
    ),
    setShowGlobalToast: React.useCallback(
      (state: {
        isShow: boolean
        info: {
          content?: string
          type: ToastType
          messageKey?: string
        }
      }) => dispatch(setShowGlobalToast(state)),
      [dispatch],
    ),
    setShowTargetRedpacketPop: React.useCallback(
      (state: {
        isShow: boolean
        info: {
          exclusiveRedPackets?: (sdk.LuckyTokenItemForReceive & {
            tokenIcon: CoinSource
            tokenName: string
          })[]
        }
      }) => dispatch(setShowTargetRedpacketPop(state)),
      [dispatch],
    ),
    setShowEditContact: React.useCallback(
      (state: { isShow: boolean; info?: any }) => dispatch(setShowEditContact(state)),
      [dispatch],
    ),
    setShowETHStakingApr: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => dispatch(setShowETHStakingApr(state)),
      [dispatch],
    ),
    setShowVaultExit: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => dispatch(setShowVaultExit(state)),
      [dispatch],
    ),
    setShowVaultJoin: React.useCallback(
      (state: ModalStatePlayLoad & Transaction) => dispatch(setShowVaultJoin(state)),
      [dispatch],
    ),
    setShowVaultSwap: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & {isSell?: boolean}) => dispatch(setShowVaultSwap(state)),
      [dispatch],
    ),
    setShowVaultLoan: React.useCallback(
      (state: ModalStatePlayLoad & Transaction & { type?: string }) =>
        dispatch(setShowVaultLoan(state)),
      [dispatch],
    ),
    setShowNoVaultAccount: React.useCallback(
      (
        state: ModalStatePlayLoad &
          Transaction & { whichBtn?: VaultAction | undefined; des?: string; title?: string },
      ) => dispatch(setShowNoVaultAccount(state)),
      [dispatch],
    ),
    setShowConfirmedVault(state: ModalStatePlayLoad) {
      dispatch(setShowConfirmedVault(state))
    },
  }
}
