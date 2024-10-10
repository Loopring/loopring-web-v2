import React from 'react'
import { SagaStatus } from '@loopring-web/common-resources'
import { useWalletLayer1, useWalletLayer2, useVaultLayer2,store } from '../../stores'

export const useUserWallets = (): {
  updateUserWallets: () => void
} => {
  const { updateWalletLayer1 } = useWalletLayer1()
  const { updateWalletLayer2 } = useWalletLayer2()
  const { updateVaultLayer2 } = useVaultLayer2()

  const updateUserWallets = React.useCallback(() => {
    const walletLayer1Status = store.getState().walletLayer1.status
    const walletLayer2Status = store.getState().walletLayer2.status
    const vaultLayer2Status = store.getState().vaultLayer2.status
    if (walletLayer1Status !== SagaStatus.PENDING) {
      updateWalletLayer1()
    }
    if (walletLayer2Status !== SagaStatus.PENDING) {
      updateWalletLayer2()
    }
    if (vaultLayer2Status !== SagaStatus.PENDING) {
      updateVaultLayer2({})
    }
  }, [
    updateWalletLayer1,
    updateWalletLayer2,
    updateVaultLayer2,
  ])

  return { updateUserWallets }
}
