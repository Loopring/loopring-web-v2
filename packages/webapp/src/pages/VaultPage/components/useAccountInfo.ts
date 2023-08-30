import { useSubmitBtn, useVaultLayer2 } from '@loopring-web/core'
import React from 'react'
import { L1L2_NAME_DEFINED, MapChainId, TradeBtnStatus } from '@loopring-web/common-resources'
import { VaultAccountStatus } from '@loopring-web/loopring-sdk/dist/defs/loopring_defs'
import { useOpenModals, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

export const useAccountInfo = () => {
  const { vaultAccountInfo, updateVaultLayer2 } = useVaultLayer2()
  const [isLoading, setIsLoading] = React.useState(false)
  const {
    setShowVaultJoin,
    // setShowVaultExit
  } = useOpenModals()
  const { t } = useTranslation()
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const onSubmitBtnClick = () => {
    switch (vaultAccountInfo?.accountStatus) {
      case VaultAccountStatus.IN_REDEEM:
        break
      case VaultAccountStatus.IN_STAKING:
      case VaultAccountStatus.FREE:
      default:
        setShowVaultJoin({ isShow: true })
    }
  }
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    if (vaultAccountInfo) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
    switch (vaultAccountInfo?.accountStatus) {
      case VaultAccountStatus.FREE:
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultJoinBtn|` }

      case VaultAccountStatus.IN_REDEEM:
        if (nodeTimer.current !== -1) {
          clearTimeout(nodeTimer.current as any)
        }
        nodeTimer.current = setTimeout(() => {
          updateVaultLayer2()
        }, 6000)

        return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelVaultPendingBtn|` }
      case VaultAccountStatus.IN_STAKING:
      default:
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultAddBtn|` }
    }
  }, [vaultAccountInfo, nodeTimer])
  const {
    btnStatus,
    onBtnClick,
    btnLabel: i18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  })
  const btnLabel = React.useMemo(() => {
    const key = i18nKey.split('|')
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
  }, [t, i18nKey])
  return {
    btnStatus,
    onBtnClick,
    btnLabel,
    vaultAccountInfo,
  }
}
