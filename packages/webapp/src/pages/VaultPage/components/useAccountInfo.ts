import { store, useAccount, useBtnStatus, useSubmitBtn, useVaultLayer2 } from '@loopring-web/core'
import React from 'react'
import {
  AccountStatus,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  SagaStatus,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { useOpenModals, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'

export const useAccountInfo = () => {
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { status: accountStatus, account } = useAccount()

  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const [isLoading, setIsLoading] = React.useState(false)
  const {
    setShowVaultJoin,
    // setShowVaultExit
  } = useOpenModals()
  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  // const {
  //   btnStatus,
  //   btnInfo,
  //   enableBtn,
  //   disableBtn,
  //   setLoadingBtn,
  //   setLabelAndParams,
  //   resetBtnInfo,
  // } = useBtnStatus()
  // const updateBtnStatus = ()=>{
  //   const {account,} = store.getState()
  //   if(account.readyState === AccountStatus.ACTIVATED){
  //
  //   }else{
  //
  //   }
  //   setLabelAndParams()
  //
  // }
  // React.useEffect(() => {
  //   updateBtnStatus()
  // }, [
  //   // accountStatus,
  //   account.readyState,
  //   vaultAccountInfo?.accountStatus,
  //   // nftDepositValue?.tokenAddress,
  //   // nftDepositValue?.nftId,
  //   // nftDepositValue?.nftType,
  //   // nftDepositValue?.tradeValue,
  //   // nftDepositValue?.balance,
  //   // walletLayer1?.ETH?.count,
  // ])

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const { vaultAccountInfo } = store.getState().vaultLayer2
    if (vaultAccountInfoStatus === SagaStatus.UNSET && vaultAccountInfo) {
      // setIsLoading(false)
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_REDEEM:
          if (nodeTimer.current !== -1) {
            clearTimeout(nodeTimer.current as any)
          }
          nodeTimer.current = setTimeout(() => {
            updateVaultLayer2()
          }, 6000)
          return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelVaultPendingBtn|` }
        case sdk.VaultAccountStatus.IN_STAKING:
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultAddBtn|` }
        case sdk.VaultAccountStatus.FREE:
        default:
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultJoinBtn|` }
      }
    } else {
      // setIsLoading(true)
      return { tradeBtnStatus: TradeBtnStatus.LOADING, label: `labelVaultAddBtn|` }
    }
  }, [vaultAccountInfoStatus])
  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck,
    isLoading: false,
    submitCallback: async () => {
      const { vaultAccountInfo } = store.getState().vaultLayer2
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_REDEEM:
          break
        case sdk.VaultAccountStatus.IN_STAKING:
        case sdk.VaultAccountStatus.FREE:
        default:
          setShowVaultJoin({ isShow: true })
      }
    },
  })
  const label = React.useMemo(() => {
    const key = btnLabel.split('|')
    return t(key[0], {
      arg: key[1],
      // symbol: tradeCalcProData.coinBase,
      layer2: L1L2_NAME_DEFINED[network].layer2,
      loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    })
  }, [btnLabel])
  myLog('useAccountInfo', vaultAccountInfo)
  return {
    btnStatus,
    onBtnClick,
    btnLabel: label,
    vaultAccountInfo,
  }
}
