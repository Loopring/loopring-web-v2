import { useOpenModals } from '@loopring-web/component-lib'
import { store } from '../../../stores'
import React from 'react'
import { VaultLoadType } from '@loopring-web/common-resources'
import { useVaultRepay } from './useVaultRepay'
import { useVaultBorrow } from './useVaultBorrow'

export const useVaultLoad = () => {
  const {
    modals: {
      istShowVaultLoad: { type, isShow, symbol },
    },
  } = useOpenModals()
  const [vaultLoadType, setVaultLoadType] = React.useState(type ?? VaultLoadType.Borrow)
  const handleTabChange = (index: VaultLoadType) => {
    setVaultLoadType(index)
  }
  React.useEffect(() => {
    if (isShow) {
      setVaultLoadType(() => {
        return store.getState().modals?.istShowVaultLoad?.type ?? VaultLoadType.Borrow
      })
      // const withdrawValue =
    }
  }, [isShow])
  return {
    vaultRepayProps: useVaultRepay(),
    vaultBorrowProps: useVaultBorrow(),
    vaultLoadType,
    handleTabChange,
  }
}
