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
  confirmedVault,
  setShowRETHStakignPopup,
  setShowWSTETHStakignPopup,
  setShowLRCStakignPopup,
  setShowLeverageETHPopup,
} from './reducer'
import { DualInvestConfirmType } from '@loopring-web/common-resources'

export const useConfirmation = () => {
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
    confirmedVault() {
      dispatch(confirmedVault(undefined))
    },
    setShowRETHStakignPopup: React.useCallback(
      (v) => dispatch(setShowRETHStakignPopup(v)),
      [dispatch],
    ),
    setShowWSTETHStakignPopup: React.useCallback(
      (v) => dispatch(setShowWSTETHStakignPopup(v)),
      [dispatch],
    ),
    setShowLRCStakignPopup: React.useCallback(
      (v) => dispatch(setShowLRCStakignPopup(v)),
      [dispatch],
    ),
    setShowLeverageETHPopup: React.useCallback(
      (v) => dispatch(setShowLeverageETHPopup(v)),
      [dispatch],
    ),
  }
}
