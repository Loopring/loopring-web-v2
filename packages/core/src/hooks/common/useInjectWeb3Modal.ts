import { createWeb3Modal, defaultConfig, useWeb3Modal, useWeb3ModalEvents, useWeb3ModalTheme } from '@web3modal/ethers5/react'
import React from 'react'
import { SUPPORTING_NETWORKS, SagaStatus, myLog } from '@loopring-web/common-resources'
import { setDefaultNetwork, useSettings } from '@loopring-web/component-lib'

import { accountServices, checkAccount, store, useAccount, useSelectNetwork, useSystem, useWalletLayer1 } from '@loopring-web/core'
import { ConnectProviders, connectProvides, walletServices } from '@loopring-web/web3-provider'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { updateSystem } from '@loopring-web/core/src/stores/system/reducer'
import { updateAccountStatus, cleanAccountStatus } from '@loopring-web/core/src/stores/account/reducer'
import { useDispatch } from 'react-redux'
import { providers } from 'ethers'
import Web3 from 'web3'
import { useTheme } from '@emotion/react'
import { ChainId, toHex } from '@loopring-web/loopring-sdk'

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
    chainId: 167000,
    name: 'Taiko',
    currency: 'ETH',
    explorerUrl: 'https://explorer.taiko.xyz/',
    rpcUrl: process.env.REACT_APP_RPC_URL_167000!,
  },
  {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io/',
    rpcUrl: process.env.REACT_APP_RPC_URL_11155111!,
  },
  {
    chainId: 167009,
    name: 'Taiko Hekla',
    currency: 'ETH',
    explorerUrl: 'https://explorer.hekla.taiko.xyz/',
    rpcUrl: process.env.REACT_APP_RPC_URL_167009!,
  },
]

const metadata = {
  name: process.env.REACT_APP_NAME!,
  description: process.env.REACT_APP_NAME!,
  url: process.env.REACT_APP_DOMAIN!,
  icons: ['https://static.loopring.io/assets/svg/logo.svg'],
}
const chainIds = SUPPORTING_NETWORKS.map(Number)
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
  const { resetAccount, account: {accAddress} } = useAccount()
  const event = useWeb3ModalEvents()
  const dispatch = useDispatch()
  const { mode } = useTheme()
  const { setThemeMode } = useWeb3ModalTheme()
  const { updateWalletLayer1 } = useWalletLayer1()
  const { defaultNetwork } = useSettings()
  React.useEffect(() => {
    setThemeMode(mode)
  }, [mode])
  React.useEffect(() => {
    if (event.data.event === 'MODAL_CLOSE' && !event.data.properties.connected) {
      // 'DISCONNECT_SUCCESS' not work. Use `event.data.event === 'MODAL_CLOSE' && !event.data.properties.connected` instead.
      if (type === 'BRIDGE') {
        resetAccount()
        walletServices.sendDisconnect('', 'customer click disconnect')
        updateSystem({ chainId })
      } else {
        walletServices.sendDisconnect('', 'customer click disconnect')
        resetAccount()
      }
    } else if (event.data.event === 'CONNECT_SUCCESS' && type === 'EARN' && walletProvider) {
      new providers.Web3Provider(walletProvider).send('wallet_switchEthereumChain', [
        { chainId: toHex(ChainId.TAIKO) },
      ])
    }
    myLog('event', event)
  }, [event, walletProvider])
  React.useEffect(() => {
    ;(async () => {
      if (address && walletProvider) {
        if ((address.toLowerCase() !== accAddress.toLowerCase()) || (chainId !== defaultNetwork)) {
          store.dispatch(
            updateSystem({
              chainId,
            }),
          )
          store.dispatch(setDefaultNetwork(chainId))
        }
        if ((accAddress && address.toLowerCase() !== accAddress.toLowerCase()) || (defaultNetwork && chainId !== defaultNetwork)) { 
          accountServices.sendAccountLock()
          checkAccount(address, chainId)
        } else if (chainId && chainIds.includes(chainId)) {
          checkAccount(address, chainId)
        }
      } else {
        store.dispatch(setDefaultNetwork(undefined))
      }
      if (type === 'BRIDGE' && address && status === SagaStatus.DONE) {
        updateWalletLayer1()
      }
    })()
  }, [address, walletProvider, chainId, status, accAddress, defaultNetwork])
  React.useEffect(() => {
    if (type === 'BRIDGE' && address) {
      store.dispatch(
        updateSystem({
          chainId,
        }),
      )
      store.dispatch(setDefaultNetwork(chainId))
      checkAccount(address, chainId)
    }
  }, [address])
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
