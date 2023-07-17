import React from 'react'
import * as _ from 'lodash'
import { globalSetup, SagaStatus } from '@loopring-web/common-resources'
import { useWalletLayer1 } from '../../../stores/walletLayer1'
import { useWalletLayer2 } from '../../../stores/walletLayer2'
import { store, walletLayer2Service } from '../../../index'

export const useWalletLayer2Socket = ({
  throttleWait = globalSetup.throttleWait,
  walletLayer2Callback,
  walletLayer1Callback,
}: {
  throttleWait?: number
  walletLayer2Callback?: () => void
  walletLayer1Callback?: () => void
}) => {
  const { updateWalletLayer1, status: walletLayer1Status } = useWalletLayer1()
  const { updateWalletLayer2, status: walletLayer2Status } = useWalletLayer2()
  const subject = React.useMemo(() => walletLayer2Service.onSocket(), [])

  const socketUpdate = React.useCallback(
    _.throttle(({ walletLayer1Status, walletLayer2Status }) => {
      if (walletLayer1Status !== SagaStatus.PENDING) {
        updateWalletLayer1()
      }
      if (walletLayer2Status !== SagaStatus.PENDING) {
        updateWalletLayer2()
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
      _socketUpdate({ walletLayer2Status, walletLayer1Status })
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
    walletLayer2Callback && walletLayer2Callback()
    walletLayer1Callback && walletLayer1Callback()
  }, [])
}
