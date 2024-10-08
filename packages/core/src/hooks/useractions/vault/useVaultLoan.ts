import { useOpenModals } from '@loopring-web/component-lib'
import { store } from '../../../stores'
import React from 'react'
import { VaultLoanType } from '@loopring-web/common-resources'
import { useVaultRepay } from './useVaultRepay'
import { useVaultBorrow } from './useVaultBorrow'
import { useL2CommonSocket } from '../../../services'

export const useVaultLoan = () => {
  const {
    modals: {
      isShowVaultLoan: { type, isShow, info },
    },
  } = useOpenModals()

  const [vaultLoanType, setVaultLoanType] = React.useState(type ?? VaultLoanType.Borrow)
  const handleTabChange = (index: VaultLoanType) => {
    setVaultLoanType(index)
  }
  React.useEffect(() => {
    if (isShow) {
      setVaultLoanType(() => {
        return store.getState().modals?.isShowVaultLoan?.type ?? VaultLoanType.Borrow
      })
      // const withdrawValue =
    }
  }, [isShow])
  useL2CommonSocket({})

  return {
    vaultRepayProps: useVaultRepay(info?.symbol),
    vaultBorrowProps: useVaultBorrow(),
    vaultLoanType,
    handleTabChange,
  }
}
