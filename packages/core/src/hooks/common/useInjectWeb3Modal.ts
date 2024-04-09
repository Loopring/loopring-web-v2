import { createWeb3Modal, defaultConfig, useWeb3Modal, useWeb3ModalEvents, useWeb3ModalTheme } from '@web3modal/ethers5/react'
import React from 'react'
import { SagaStatus, myLog } from '@loopring-web/common-resources'
import { setDefaultNetwork } from '@loopring-web/component-lib'

import { checkAccount, store, useAccount, useSelectNetwork, useSystem } from '@loopring-web/core'
import { ConnectProviders, connectProvides, walletServices } from '@loopring-web/web3-provider'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { updateSystem } from '@loopring-web/core/src/stores/system/reducer'
import { updateAccountStatus, cleanAccountStatus } from '@loopring-web/core/src/stores/account/reducer'
import { useDispatch } from 'react-redux'
import { providers } from 'ethers'
import Web3 from 'web3'
import { useTheme } from '@emotion/react'

const projectId = process.env.REACT_APP_WALLET_CONNECT_V2_ID!
const chains = [
  {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: process.env.REACT_APP_RPC_URL_1!,
  },
  {
    chainId: 5,
    name: 'Goerli',
    currency: 'ETH',
    explorerUrl: 'https://goeril.etherscan.io/',
    rpcUrl: process.env.REACT_APP_RPC_URL_5!,
  },
  {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io/',
    rpcUrl: process.env.REACT_APP_RPC_URL_11155111!,
  },
  {
    chainId: 167008,
    name: 'Taiko Katla',
    currency: 'ETH',
    explorerUrl: 'https://explorer.katla.taiko.xyz/',
    rpcUrl: process.env.REACT_APP_RPC_URL_167008!,
  },
]

const metadata = {
  name: process.env.REACT_APP_NAME!,
  description: process.env.REACT_APP_NAME!,
  url: process.env.REACT_APP_DOMAIN!,
  icons: ['https://static.loopring.io/assets/svg/logo.svg'],
}
const chainIds = process.env.REACT_APP_CHAIN_IDS!.split(',').map(Number)
export const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: chains.filter(chain => chainIds.includes(chain.chainId)),
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration,
  featuredWalletIds: [],
})

export const useInjectWeb3Modal = (type: 'MAIN' | 'EARN' | 'BRIDGE' | 'GUARDIAN') => {
  const { walletProvider } = useWeb3ModalProvider()
  const { status } = useSystem()
  const { address, chainId } = useWeb3ModalAccount()
  const { resetAccount } = useAccount()
  const event = useWeb3ModalEvents()
  const dispatch = useDispatch()
  const { mode } = useTheme()
  const { setThemeMode } = useWeb3ModalTheme()
  const { handleOnNetworkSwitch } = useSelectNetwork({})
  // const {  } = useWeb3Modal()
  React.useEffect(() => {
    setThemeMode(mode)
  }, [mode])
  React.useEffect(() => {
    if (event.data.event === 'SWITCH_NETWORK') {
      location.reload()
    } else if (event.data.event === 'MODAL_CLOSE' && !event.data.properties.connected) {
      // 'DISCONNECT_SUCCESS' not work. Use `event.data.event === 'MODAL_CLOSE' && !event.data.properties.connected` instead.
      if (type === 'BRIDGE') {
        resetAccount()
        walletServices.sendDisconnect('', 'customer click disconnect')
        updateSystem({ chainId })
      } else {
        walletServices.sendDisconnect('', 'customer click disconnect')
        resetAccount()
      }
    }
    myLog('event', event)
  }, [event])
  React.useEffect(() => {
    ;(async () => {
      if (address && walletProvider) {
        const { defaultNetwork } = store.getState().settings
        const accAddress = store.getState().account.accAddress
        if (address.toLowerCase() !== accAddress.toLowerCase() || chainId !== defaultNetwork) {
          store.dispatch(
            updateSystem({
              chainId,
            }),
          )
          store.dispatch(setDefaultNetwork(chainId))
        }
        checkAccount(address, chainId)
      }
    })()
  }, [address, walletProvider, chainId, status])
  React.useEffect(() => {
    if (walletProvider) {
      if (walletProvider.isMetaMask) {
        dispatch(
          updateAccountStatus({
            connectName: ConnectProviders.MetaMask,
          }),
        )
      } else if ((walletProvider as any).isWalletConnect) {
        dispatch(
          updateAccountStatus({
            connectName: ConnectProviders.WalletConnect,
          }),
        )
      } else if ((walletProvider as any).isCoinbaseWallet) {
        dispatch(
          updateAccountStatus({
            connectName: ConnectProviders.Coinbase,
          }),
        )
      } else {
        dispatch(
          updateAccountStatus({
            connectName: ConnectProviders.Unknown,
          }),
        )
      }
      connectProvides.usedProvide = new providers.Web3Provider(walletProvider as any)
      // @ts-ignore
      connectProvides.usedWeb3 = new Web3(walletProvider as any)
    } else {
      dispatch(
        updateAccountStatus({
          connectName: ConnectProviders.Unknown,
        }),
      )
    }
  }, [walletProvider])
}
