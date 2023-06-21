import React from 'react'
import { LoopringAPI, useAccount } from '../../index'

export const useIsHebao = () => {
  const [isHebao, setIsHebao] = React.useState<boolean | undefined>(undefined)
  const {
    account: { accAddress },
  } = useAccount()
  React.useEffect(() => {
    setIsHebao(undefined)
    LoopringAPI.walletAPI
      ?.getWalletType({
        wallet: accAddress,
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
