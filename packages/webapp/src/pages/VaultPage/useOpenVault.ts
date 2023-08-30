import { useSubmitBtn } from '@loopring-web/core'
import { L1L2_NAME_DEFINED, MapChainId, TradeBtnStatus } from '@loopring-web/common-resources'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@loopring-web/component-lib'

export const useJoinVault = () => {
  const { t } = useTranslation()
  const { defaultNetwork, isMobile } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const alreadyJoin = {}

  const submitJoinVault = () => {
    //TODO
  }
  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck: () => {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    },
    isLoading: false,
    submitCallback: async () => {
      submitJoinVault()
    },
  })
  const label = React.useMemo(() => {
    if (btnLabel) {
      const key = btnLabel.split('|')
      if (key) {
        return t(
          key[0],
          key && key[1]
            ? {
                arg: key[1],
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }
            : {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              },
        )
      } else {
        return t(btnLabel, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        })
      }
    } else {
      return t(`labelInvite`)
    }
  }, [t, btnLabel])

  return {
    joinBtnStatus: btnStatus,
    joinOnBtnClick: onBtnClick,
    joinBtnLabel: label,
    alreadyJoin,
  }
}
