import React from 'react'
import { LoopringAPI, useAccount } from '../../index'
import { NetworkWallet } from '@loopring-web/loopring-sdk'
import { MapChainId, NetworkMap } from '@loopring-web/common-resources'
import { useSettings } from '@loopring-web/component-lib'

export const useIsHebao = () => {
  const [isHebao, setIsHebao] = React.useState<boolean | undefined>(undefined)
  const {
    account: { accAddress },
  } = useAccount()
  const { defaultNetwork } = useSettings()
  React.useEffect(() => {
    setIsHebao(undefined)
    LoopringAPI.walletAPI
      ?.getWalletType({
        wallet: accAddress,
        network: MapChainId[defaultNetwork] as NetworkWallet
      })
      .then((walletType) => {
        const isHebao = walletType?.walletType?.loopringWalletContractVersion !== ''
        setIsHebao(isHebao)
      })
  }, [accAddress])
  return {
    isHebao,
  }
}
