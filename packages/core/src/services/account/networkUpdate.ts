import { accountServices, cleanLayer2, goErrorNetWork, store } from '../../index'

import { AccountStatus, myLog, SagaStatus } from '@loopring-web/common-resources'
import { updateAccountStatus } from '../../stores/account/reducer'
import { updateSystem } from '../../stores/system/reducer'
import * as sdk from '@loopring-web/loopring-sdk'
import { ChainId } from '@loopring-web/loopring-sdk'
import { setDefaultNetwork } from '@loopring-web/component-lib'

export const networkUpdate = async (chainId?: ChainId | string): Promise<boolean> => {
  let { defaultNetwork } = store.getState().settings
  const { status: systemStatus } = store.getState().system
  myLog('chainId,defaultNetwork', chainId, defaultNetwork)
  const { _chainId: accountChainId, accAddress, readyState } = store.getState().account
  if (chainId && chainId !== defaultNetwork) {
    let _chainId = Number(chainId)
    myLog('_chainId', chainId)
    if ( ['1', '5', '421613'].includes(_chainId.toString())) {
      store.dispatch(setDefaultNetwork(_chainId))
      if (systemStatus !== SagaStatus.UNSET) {
        await sdk.sleep(10)
      }
      store.dispatch(updateSystem({ chainId: Number(_chainId) }))
      if (readyState !== AccountStatus.UN_CONNECT && Number(accountChainId) !== chainId) {
        store.dispatch(
          updateAccountStatus({
            wrongChain: false,
          }),
        )
        cleanLayer2()
        accountServices.sendCheckAccount(accAddress, accountChainId as any)
      }
      return true
    } else {
      store.dispatch(updateAccountStatus({ wrongChain: true }))
      goErrorNetWork()
      return false
    }
  } else {
    if (['1', '5', '421613'].includes(defaultNetwork.toString())) {
      if (systemStatus !== SagaStatus.UNSET) {
        await sdk.sleep(10)
      }
      store.dispatch(updateSystem({ chainId: defaultNetwork }))
      store.dispatch(
        updateAccountStatus({
          wrongChain: false,
        }),
      )
      if (defaultNetwork !== accountChainId) {
        myLog('chainId,defaultNetwork', accountChainId, defaultNetwork)
        cleanLayer2()
      }
      return true
    } else {
      store.dispatch(updateAccountStatus({ wrongChain: true }))
      goErrorNetWork()
      return false
    }
  }
}
