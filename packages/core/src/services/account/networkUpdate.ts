import { cleanLayer2, goErrorNetWork, store } from '../../index'

import { AvaiableNetwork } from '@loopring-web/web3-provider'
import { AccountStatus, SagaStatus } from '@loopring-web/common-resources'
import { updateAccountStatus } from '../../stores/account/reducer'
import { updateSystem } from '../../stores/system/reducer'
import { setDefaultNetwork } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'

export const networkUpdate = async (): Promise<boolean> => {
  // const { _chainId: accountChainId, readyState } = store.getState().account
  const { defaultNetwork: userSettingChainId } = store.getState().settings
  const { chainId: statusChainId, status: systemStatus } = store.getState().system
  if (statusChainId.toString() !== userSettingChainId.toString()) {
    if (AvaiableNetwork.includes(userSettingChainId.toString())) {
      if (systemStatus !== SagaStatus.UNSET) {
        await sdk.sleep(0)
      }
      console.log('unconnected: networkUpdate updateSystem', userSettingChainId)
      store.dispatch(updateSystem({ chainId: userSettingChainId }))
      store.dispatch(
        updateAccountStatus({
          wrongChain: false,
          // _chainId: userSettingChainId
        }),
      )
      return true
    }

    store.dispatch(updateAccountStatus({ wrongChain: true }))
    return false
  }
  return true
  // accountChainId
  // if (readyState !== AccountStatus.UN_CONNECT) {
  //   if (accountChainId !== undefined && AvaiableNetwork.includes(accountChainId.toString())) {
  //     store.dispatch(updateAccountStatus({ wrongChain: false }))
  //     store.dispatch(setDefaultNetwork(accountChainId))
  //     console.log('connected: networkUpdate updateSetting', accountChainId)
  //     if (statusChainId !== accountChainId) {
  //       console.log('connected: networkUpdate updateSystem', accountChainId)
  //       store.dispatch(updateSystem({ chainId: accountChainId }))
  //       if (systemStatus == SagaStatus.UNSET || userSettingChainId !== accountChainId) {
  //         cleanLayer2()
  //       }
  //     }
  //     console.log('connected: networkUpdate')
  //     return true
  //   } else {
  //     store.dispatch(updateAccountStatus({ wrongChain: true }))
  //     goErrorNetWork()
  //     return false
  //   }
  // } else {
  //   if (statusChainId.toString() !== userSettingChainId.toString()) {
  //     if (AvaiableNetwork.includes(userSettingChainId.toString())) {
  //       if (systemStatus !== SagaStatus.UNSET) {
  //         await sdk.sleep(0)
  //       }
  //       console.log('unconnected: networkUpdate updateSystem', userSettingChainId)
  //       store.dispatch(updateSystem({ chainId: userSettingChainId }))
  //       store.dispatch(
  //         updateAccountStatus({
  //           wrongChain: false,
  //           // _chainId: userSettingChainId
  //         }),
  //       )
  //       return true
  //     }
  //
  //     store.dispatch(updateAccountStatus({ wrongChain: true }))
  //     return false
  //   }
  //   return true
  // }
}
