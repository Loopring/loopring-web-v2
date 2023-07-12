import { accountReducer, store } from '../../stores'
import {
  AvaiableNetwork,
  ConnectProviders,
  connectProvides,
  ErrorType,
  walletServices,
} from '@loopring-web/web3-provider'
import { myLog, ThemeType } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { updateSystem } from '../../stores/system/reducer'
import { setDefaultNetwork } from '@loopring-web/component-lib'

const providerCallback = async () => {
  const { defaultNetwork } = store.getState().settings
  if (connectProvides.usedProvide) {
    let chainId: sdk.ChainId = Number(await connectProvides.usedWeb3?.eth.getChainId())
    if (!AvaiableNetwork.includes(chainId.toString())) {
      chainId = sdk.ChainId.MAINNET
    }

    if (chainId !== defaultNetwork) {
      store.dispatch(updateSystem({ chainId }))
      store.dispatch(setDefaultNetwork(chainId))
    }
    return
  }
}
export const metaMaskCallback = async () => {
  const { defaultNetwork, themeMode, isMobile } = store.getState().settings

  if (!isMobile) {
    store.dispatch(
      accountReducer.updateAccountStatus({
        connectName: ConnectProviders.MetaMask,
      }),
    )
  }

  await connectProvides.MetaMask({
    darkMode: themeMode === ThemeType.dark,
    chainId: defaultNetwork.toString(),
  })
  if (isMobile) {
    myLog('connectProvides', connectProvides)
    store.dispatch(
      accountReducer.updateAccountStatus({
        connectName: connectProvides.provideName,
      }),
    )
  }

  providerCallback()
}
export const CoinbaseCallback = async () => {
  const { defaultNetwork, themeMode } = store.getState().settings
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.Coinbase,
    }),
  )
  await connectProvides.Coinbase({
    darkMode: themeMode === ThemeType.dark,
    chainId: defaultNetwork.toString(),
  })

  providerCallback()
}
export const gameStopCallback = async () => {
  const { defaultNetwork, themeMode } = store.getState().settings
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.GameStop,
    }),
  )
  await connectProvides.GameStop({
    darkMode: themeMode === ThemeType.dark,
    chainId: defaultNetwork.toString(),
  })
  // statusAccountUnset();
  providerCallback()
}
export const walletConnectCallback = async () => {
  const { defaultNetwork, themeMode } = store.getState().settings
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.WalletConnect,
    }),
  )
  try {
    await connectProvides
      .WalletConnect({
        darkMode: themeMode === ThemeType.dark,
        chainId: defaultNetwork,
      })
      .catch((error) => {
        throw error
      })
  } catch (error) {
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.WalletConnect,
      error: (error as any)?.message ?? error,
    })
  }
  providerCallback()
}

export const walletConnectV1Callback = async () => {
  const { themeMode } = store.getState().settings
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.WalletConnectV1,
    }),
  )
  debugger
  await connectProvides.WalletConnectV1({
    darkMode: themeMode === ThemeType.dark,
    // chainId: defaultNetwork,
  })
  providerCallback()
}
