import React from 'react'
import { SUPPORTING_NETWORKS, SagaStatus, SoursURL, myLog } from '@loopring-web/common-resources'
import { setDefaultNetwork, useSettings } from '@loopring-web/component-lib'

import { accountServices, checkAccount, store, useAccount, useSelectNetwork, useSystem, useWalletLayer1 } from '@loopring-web/core'
import { ConnectProviders, connectProvides, walletServices } from '@loopring-web/web3-provider'
import { clearSystem, updateSystem } from '@loopring-web/core/src/stores/system/reducer'
import { updateAccountStatus, cleanAccountStatus } from '@loopring-web/core/src/stores/account/reducer'
import { useDispatch } from 'react-redux'
import { providers } from 'ethers'
import Web3 from 'web3'
import { useTheme } from '@emotion/react'
import { ChainId, toHex } from '@loopring-web/loopring-sdk'
import { createAppKit, useAppKitEvents, useAppKitTheme, useAppKitAccount, useAppKitProvider, useAppKitNetwork } from "@reown/appkit/react";
import { mainnet, sepolia, base, baseSepolia, taiko, taikoHekla } from "@reown/appkit/networks";

import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
const projectId = process.env.REACT_APP_WALLET_CONNECT_V2_ID!

const networks = [mainnet, sepolia, base, baseSepolia, taiko, taikoHekla]

const metadata = {
  name: process.env.REACT_APP_NAME!,
  description: process.env.REACT_APP_NAME!,
  url: process.env.REACT_APP_DOMAIN!,
  icons: ['https://static.loopring.io/assets/svg/logo.svg'],
}
const chainIds = SUPPORTING_NETWORKS.map(Number)

export const web3Modal = createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: networks,
  // .filter(network => chainIds.includes(network.id)),
  projectId,
  chainImages: {
    167000: `${SoursURL}earn/taiko.svg`,
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    
  },
});


export const useInjectWeb3Modal = (type: 'MAIN' | 'EARN' | 'BRIDGE' | 'GUARDIAN') => {
  
  const { status } = useSystem()
  const { currency } = useSettings()
  const { address } = useAppKitAccount()
  const { chainId: _chainId } = useAppKitNetwork()
  const chainId = typeof _chainId === 'number' ? _chainId : Number(_chainId)
  const { walletProvider } = useAppKitProvider('eip155')
  const { resetAccount, account: {accAddress} } = useAccount()

  const event = useAppKitEvents()
  const dispatch = useDispatch()
  const { mode } = useTheme()
  const { setThemeMode } = useAppKitTheme()
  const { updateWalletLayer1 } = useWalletLayer1()
  const { defaultNetwork } = useSettings()
  React.useEffect(() => {
    setThemeMode(mode)
  }, [mode])
  React.useEffect(() => {
    console.log('asdkajwked', event)
    if (event.data.event === 'DISCONNECT_SUCCESS') {
      if (type === 'BRIDGE') {
        resetAccount()
        walletServices.sendDisconnect('', 'customer click disconnect')
        updateSystem({ chainId })
      } else {
        walletServices.sendDisconnect('', 'customer click disconnect')
        resetAccount()
      }
    } 
  }, [event, walletProvider])
  React.useEffect(() => {
    ;(async () => {
      console.log('ahj2j3h', walletProvider, address, accAddress, chainId, defaultNetwork)
      
      if (address && walletProvider) {
        if ((address.toLowerCase() !== accAddress.toLowerCase()) || (chainId !== defaultNetwork)) {
          store.dispatch(
            clearSystem(undefined)
          );
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
