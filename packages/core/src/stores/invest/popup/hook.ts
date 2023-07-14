import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'

import { PopupStates } from './interface'
import {
  setShowLRCStakignPopup,
  setShowRETHStakignPopup,
  setShowWSTETHStakignPopup,
} from './reducer'

export const usePopup = (): PopupStates & {
  setShowRETHStakignPopup: (v: { show: boolean; confirmationNeeded: boolean }) => void
  setShowWSTETHStakignPopup: (v: { show: boolean; confirmationNeeded: boolean }) => void
  setShowLRCStakignPopup: (v: { show: boolean; confirmationNeeded: boolean }) => void
} => {
  const popup: PopupStates = useSelector((state: RootState) => state.invest.popup)
  const dispatch = useDispatch()
  return {
    ...popup,
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
  }
}
