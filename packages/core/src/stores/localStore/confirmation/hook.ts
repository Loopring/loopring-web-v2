import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../index'
import { Confirmation } from './interface'

import {
  confirm,
  confirmedRETHDefiInvest,
  confirmedWSETHDefiInvest,
  showDualBeginnerHelp,
  hidDualBeginnerHelp,
  confirmedLRCStakeInvest,
  confirmedBtradeSwap,
  confirmDualInvestV2,
  confirmDualAutoInvest,
  confirmedLeverageETHInvest,
  confirmDualDipInvest,
  confirmDualGainInvest,
  setShowRETHStakePopup,
  setShowWSTETHStakePopup,
  setShowLRCStakePopup,
  setShowLeverageETHPopup,
  setShowAutoDefault,
  setConfirmedOpenVaultPosition,
  setShowTaikoLaunchBanner,
  setShowTaikoLockDescription,
  setShowTaikoLaunchBanner2,
  setShowVaultTradeHint,
} from './reducer'
import { DualInvestConfirmType } from '@loopring-web/common-resources'

export const useConfirmation = (): {
  confirmation: Confirmation
  confirmWrapper: () => void
  confirmedRETHDefiInvest: () => void
  confirmedWSETHDefiInvest: () => void
  confirmedLRCStakeInvest: () => void
  confirmDualInvest: (level: DualInvestConfirmType | undefined) => void
  confirmDualAutoInvest: () => void
  confirmedBtradeSwap: () => void
  confirmedLeverageETHInvest: () => void
  confirmDualDipInvest: () => void
  confirmDualGainInvest: () => void
  setShowRETHStakePopup: (data: { isShow: boolean; confirmationNeeded: boolean }) => void
  setShowWSTETHStakePopup: (data: { isShow: boolean; confirmationNeeded: boolean }) => void
  setShowLRCStakePopup: (data: { isShow: boolean; confirmationNeeded: boolean }) => void
  setShowLeverageETHPopup: (data: { isShow: boolean; confirmationNeeded: boolean }) => void
  setShowAutoDefault: (show: boolean) => void
  setConfirmedOpenVaultPosition: () => void
  setShowTaikoLaunchBanner: (show: boolean) => void
  setShowTaikoLockDescription: (show: boolean) => void
  setShowTaikoLaunchBanner2: (show: boolean) => void
  setShowVaultTradeHint: (show: boolean) => void
} => {
  const confirmation: Confirmation = useSelector(
    (state: RootState) => state.localStore.confirmation,
  )
  const dispatch = useDispatch()

  return {
    confirmation,
    confirmWrapper: React.useCallback(() => {
      dispatch(confirm(undefined))
    }, [dispatch]),
    confirmDualInvest: React.useCallback(
      (level: DualInvestConfirmType | undefined) => {
        dispatch(confirmDualInvestV2({ level }))
        dispatch(showDualBeginnerHelp(undefined))
        setTimeout(() => {
          dispatch(hidDualBeginnerHelp(undefined))
        }, 5 * 1000)
      },
      [dispatch],
    ),
    confirmedRETHDefiInvest: React.useCallback(() => {
      dispatch(confirmedRETHDefiInvest(undefined))
    }, [dispatch]),
    confirmedWSETHDefiInvest: React.useCallback(() => {
      dispatch(confirmedWSETHDefiInvest(undefined))
    }, [dispatch]),
    confirmedLRCStakeInvest: React.useCallback(() => {
      dispatch(confirmedLRCStakeInvest(undefined))
    }, [dispatch]),
    confirmedBtradeSwap: React.useCallback(() => {
      dispatch(confirmedBtradeSwap(undefined))
    }, [dispatch]),
    confirmedLeverageETHInvest: React.useCallback(() => {
      dispatch(confirmedLeverageETHInvest(undefined))
    }, [dispatch]),
    confirmDualAutoInvest: React.useCallback(() => {
      dispatch(confirmDualAutoInvest(undefined))
    }, [dispatch]),
    confirmDualDipInvest: React.useCallback(() => {
      dispatch(confirmDualDipInvest(undefined))
    }, [dispatch]),
    confirmDualGainInvest: React.useCallback(() => {
      dispatch(confirmDualGainInvest(undefined))
    }, [dispatch]),
    setShowRETHStakePopup: React.useCallback(
      (data: { isShow: boolean; confirmationNeeded: boolean }) =>
        dispatch(setShowRETHStakePopup(data)),
      [dispatch],
    ),
    setShowWSTETHStakePopup: React.useCallback(
      (data: { isShow: boolean; confirmationNeeded: boolean }) =>
        dispatch(setShowWSTETHStakePopup(data)),
      [dispatch],
    ),
    setShowLRCStakePopup: React.useCallback(
      (data: { isShow: boolean; confirmationNeeded: boolean }) =>
        dispatch(setShowLRCStakePopup(data)),
      [dispatch],
    ),
    setShowLeverageETHPopup: React.useCallback(
      (data: { isShow: boolean; confirmationNeeded: boolean }) =>
        dispatch(setShowLeverageETHPopup(data)),
      [dispatch],
    ),
    setShowAutoDefault: React.useCallback(
      (show: boolean) => dispatch(setShowAutoDefault({ show })),
      [dispatch],
    ),
    setConfirmedOpenVaultPosition: React.useCallback(() => {
      dispatch(setConfirmedOpenVaultPosition(undefined))
    }, [dispatch]),
    setShowTaikoLaunchBanner: React.useCallback((show: boolean) => {
      dispatch(setShowTaikoLaunchBanner({show}))
    }, [dispatch]),
    setShowTaikoLockDescription: React.useCallback((show: boolean) => {
      dispatch(setShowTaikoLockDescription({show}))
    }, [dispatch]),
    setShowTaikoLaunchBanner2: React.useCallback((show: boolean) => {
      dispatch(setShowTaikoLaunchBanner2({show}))
    }, [dispatch]),
    setShowVaultTradeHint: React.useCallback((show: boolean) => {
      dispatch(setShowVaultTradeHint({show}))
    }, [dispatch]),
  }
}
