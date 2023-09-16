import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../index'
import { Confirmation, DualInvestConfirmType } from './interface'

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
} from './reducer'

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
    confirmDualAutoInvest: React.useCallback(() => {
      dispatch(confirmDualAutoInvest())
    }, [dispatch]),
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
  }
}
