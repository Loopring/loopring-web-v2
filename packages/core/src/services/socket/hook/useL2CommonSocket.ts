import React from 'react'
import * as _ from 'lodash'
import { globalSetup, SagaStatus } from '@loopring-web/common-resources'
import { useWalletLayer1, useWalletLayer2, store, useVaultLayer2 } from '../../../stores'
import { l2CommonService } from '../services/l2CommonService'

export const useL2CommonSocket = ({
  throttleWait = globalSetup.throttleWait,
  walletLayer2Callback,
  walletLayer1Callback,
  vaultLayer2Callback,
}: {
  throttleWait?: number
  walletLayer2Callback?: () => void
  walletLayer1Callback?: () => void
  vaultLayer2Callback?: () => void
}) => {
  const { updateWalletLayer1, status: walletLayer1Status } = useWalletLayer1()
  const { updateWalletLayer2, status: walletLayer2Status } = useWalletLayer2()
  const { updateVaultLayer2, status: vaultLayer2Status } = useVaultLayer2()

  const subject = React.useMemo(() => l2CommonService.onSocket(), [])

  const socketUpdate = React.useCallback(
    _.throttle(({ walletLayer1Status, walletLayer2Status, vaultLayer2Status }) => {
      if (walletLayer1Status !== SagaStatus.PENDING) {
        updateWalletLayer1()
      }
      if (walletLayer2Status !== SagaStatus.PENDING) {
        updateWalletLayer2()
      }
      if (vaultLayer2Status !== SagaStatus.PENDING) {
        updateVaultLayer2({})
      }
    }, throttleWait),
    [],
  )
  const _socketUpdate = ({ walletLayer2Status, walletLayer1Status }: any) => {
    socketUpdate({ walletLayer2Status, walletLayer1Status })
  }

  // const  _socketUpdate = React.useCallback(socketUpdate({updateWalletLayer1,updateWalletLayer2,walletLayer1Status,walletLayer2Status}),[]);
  React.useEffect(() => {
    const subscription = subject.subscribe(() => {
      const walletLayer2Status = store.getState().walletLayer2.status
      const walletLayer1Status = store.getState().walletLayer1.status
      const vaultLayer2Status = store.getState().vaultLayer2.status
      _socketUpdate({ walletLayer2Status, walletLayer1Status, vaultLayer2Status })
    })
    return () => subscription.unsubscribe()
  }, [subject])
  React.useEffect(() => {
    if (walletLayer2Callback && walletLayer2Status === SagaStatus.UNSET) {
      walletLayer2Callback()
    }
  }, [walletLayer2Status])
  React.useEffect(() => {
    if (walletLayer1Callback && walletLayer1Status === SagaStatus.UNSET) {
      walletLayer1Callback()
    }
  }, [walletLayer1Status])
  React.useEffect(() => {
    if (vaultLayer2Callback && vaultLayer2Status === SagaStatus.UNSET) {
      vaultLayer2Callback()
    }
  }, [vaultLayer2Status])
  React.useEffect(() => {
    walletLayer2Callback && walletLayer2Callback()
    walletLayer1Callback && walletLayer1Callback()
    vaultLayer2Callback && vaultLayer2Callback()
  }, [])
}
