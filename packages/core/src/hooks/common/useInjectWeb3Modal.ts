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
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: process.env.REACT_APP_RPC_URL_1!
}
const goeril = {
  chainId: 5,
  name: 'GOERIL',
  currency: 'ETH',
  explorerUrl: 'https://goeril.etherscan.io/',
  rpcUrl: process.env.REACT_APP_RPC_URL_5!
}
const sepolia = {
  chainId: 11155111,
  name: 'SEPOLIA',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io/',
  rpcUrl: process.env.REACT_APP_RPC_URL_11155111!
}
const metadata = {
  name: 'loopring.io',
  description: 'loopring.io',
  url: 'https://loopring.io', // origin must match your domain & subdomain
  icons: ['https://static.loopring.io/assets/svg/logo.svg'],
}
// const { themeMode, themeVariables, setThemeMode, setThemeVariables } = useWeb3ModalTheme()

// setThemeMode('dark')
export const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration,
  featuredWalletIds: [],
})

export const useInjectWeb3Modal = () => {
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
      } else {
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
