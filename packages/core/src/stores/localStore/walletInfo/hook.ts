import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../index'
import { WalletInfo } from './interface'
import { clearAll, updateWallet } from './reducer'

export const useWalletInfo = () => {
  const walletInfo: WalletInfo = useSelector((state: RootState) => state.localStore.walletInfo)
  const dispatch = useDispatch()

  const clearAllWrapper = React.useCallback(() => {
    dispatch(clearAll(undefined))
  }, [dispatch])

  const updateHW = React.useCallback(
    ({ wallet, isHWAddr }: { wallet: string; isHWAddr: boolean }) => {
      dispatch(updateWallet({ address: wallet, isHW: isHWAddr }))
    },
    [dispatch],
  )

  const checkHWAddr = React.useCallback(
    (address: string) => {
      if (!address) {
        return false
      }
      const wInfo = walletInfo.walletTypeMap[address]
      return !!wInfo
    },
    [walletInfo],
  )

  return {
    checkHWAddr,
    walletInfo,
    clearAllWrapper,
    updateHW,
  }
}
