import React from 'react'
import { BtnInfo } from '@loopring-web/component-lib'
import { TradeBtnStatus } from '@loopring-web/common-resources'

export function useBtnStatus() {
  const [btnStatus, setBtnStatus] = React.useState<TradeBtnStatus>(TradeBtnStatus.AVAILABLE)

  const [btnInfo, setBtnInfo] = React.useState<BtnInfo | undefined>(undefined)

  const setLabelAndParams = React.useCallback(
    (label: string, params: { [key: string]: string }) => {
      setBtnInfo({ label, params })
    },
    [setBtnInfo],
  )

  const resetBtnInfo = React.useCallback(() => {
    setBtnInfo(undefined)
  }, [setBtnInfo])

  const enableBtn = React.useCallback(() => {
    setBtnStatus(TradeBtnStatus.AVAILABLE)
  }, [setBtnStatus])

  const disableBtn = React.useCallback(() => {
    setBtnStatus(TradeBtnStatus.DISABLED)
  }, [setBtnStatus])

  const setLoadingBtn = React.useCallback(() => {
    setBtnStatus(TradeBtnStatus.LOADING)
  }, [setBtnStatus])

  React.useEffect(() => {
    enableBtn()
  }, [])

  return {
    btnInfo,
    btnStatus,
    setLabelAndParams,
    resetBtnInfo,
    enableBtn,
    disableBtn,
    setLoadingBtn,
  }
}
