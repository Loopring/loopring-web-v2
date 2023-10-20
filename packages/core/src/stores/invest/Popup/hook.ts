import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'

import {
  setShowLRCStakignPopup,
  setShowLeverageETHPopup,
  setShowRETHStakignPopup,
  setShowWSTETHStakignPopup,
  setShowVaultPopup,
} from './reducer'

export const usePopup = () => {
  const popup = useSelector((state: RootState) => state.invest.popup)
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
    setShowLeverageETHPopup: React.useCallback(
      (v) => dispatch(setShowLeverageETHPopup(v)),
      [dispatch],
    ),
    setShowVaultPopup: React.useCallback((v) => dispatch(setShowVaultPopup(v)), [dispatch]),
  }
}
