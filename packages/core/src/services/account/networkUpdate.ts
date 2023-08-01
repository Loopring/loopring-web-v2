import { cleanLayer2, goErrorNetWork, store } from '../../index'

import { AvaiableNetwork } from '@loopring-web/web3-provider'
import { AccountStatus, SagaStatus } from '@loopring-web/common-resources'
import { updateAccountStatus } from '../../stores/account/reducer'
import { updateSystem } from '../../stores/system/reducer'
import * as sdk from '@loopring-web/loopring-sdk'
import { ChainId } from '@loopring-web/loopring-sdk'

export const networkUpdate = async (chainId?: ChainId | string): Promise<boolean> => {
  let { _chainId: accountChainId, readyState } = store.getState().account
  let { defaultNetwork } = store.getState().settings
  const { chainId: statusChainId, status: systemStatus } = store.getState().system
  let userSettingChainId
  if (chainId) {
    userSettingChainId = chainId as any
  } else {
    userSettingChainId = defaultNetwork
  }
  if (statusChainId.toString() !== userSettingChainId.toString()) {
    if (AvaiableNetwork.includes(userSettingChainId.toString())) {
      if (
        (readyState !== AccountStatus.UN_CONNECT &&
          chainId &&
          Number(defaultNetwork) !== Number(chainId)) ||
        (accountChainId && Number(defaultNetwork) !== Number(accountChainId))
      ) {
        cleanLayer2()
      }
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
    } else {
      store.dispatch(updateAccountStatus({ wrongChain: true }))
      goErrorNetWork()
      return false
    }
  } else if (readyState !== AccountStatus.UN_CONNECT && userSettingChainId !== accountChainId) {
    cleanLayer2()
    return true
  } else {
    return true
  }
}
