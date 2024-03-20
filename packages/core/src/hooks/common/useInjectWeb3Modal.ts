import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import React from 'react'
import { SagaStatus } from '@loopring-web/common-resources'
import { setDefaultNetwork } from '@loopring-web/component-lib'

import { checkAccount, store, useAccount, useSystem } from '@loopring-web/core'
import { ConnectProviders, connectProvides, walletServices } from '@loopring-web/web3-provider'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { updateSystem } from '@loopring-web/core/src/stores/system/reducer'
import { updateAccountStatus } from '@loopring-web/core/src/stores/account/reducer'
import { useDispatch } from 'react-redux'
import { providers } from 'ethers'
import Web3 from 'web3'

const projectId = process.env.REACT_APP_WALLET_CONNECT_V2_ID!
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: process.env.REACT_APP_RPC_URL_1!
}
const goeril = {
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

export const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet, goeril],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration,
  featuredWalletIds: [],
})

export const useInjectWeb3Modal = () => {
  const { walletProvider } = useWeb3ModalProvider()
  const { status } = useSystem()
  const { address, chainId } = useWeb3ModalAccount()
  const { resetAccount } = useAccount()
  const dispatch = useDispatch()
  React.useEffect(() => {
    ;(async () => {
      if (address) {
        dispatch(
          updateAccountStatus({
            connectName: ConnectProviders.MetaMask,
          }),
        )
        const { defaultNetwork } = store.getState().settings
        if (chainId !== defaultNetwork || status === SagaStatus.PENDING) {
          store.dispatch(
            updateSystem({
              chainId,
            }),
          )
          store.dispatch(setDefaultNetwork(chainId))
        }
        checkAccount(address, chainId)
      } else {
        walletServices.sendDisconnect('', 'customer click disconnect')
        resetAccount()
      }
    })()
  }, [address, walletProvider, status, chainId])
  React.useEffect(() => {
    const provider = web3Modal.getWalletProvider()
    if (provider) {
      connectProvides.usedProvide = new providers.Web3Provider(provider as any)
      // @ts-ignore
      connectProvides.usedWeb3 = new Web3(provider as any)
    }
    web3Modal.subscribeProvider(async (pro) => {
      connectProvides.usedProvide = new providers.Web3Provider(pro.provider as any)
      // @ts-ignore
      connectProvides.usedWeb3 = new Web3(pro.provider as any)
    })
  }, [])

}
