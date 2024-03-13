import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'

const projectId = process.env.REACT_APP_WALLET_CONNECT_V2_ID!
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com',
}
const goeril = {
  chainId: 5,
  name: 'GOERIL',
  currency: 'ETH',
  explorerUrl: 'https://goerli.etherscan.io/',
  rpcUrl: 'https://cloudflare-eth.com', // todo
}
const metadata = {
  name: 'loopring.io',
  description: 'loopring.io',
  url: 'https://loopring.io', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/'], // todo
}

export const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet, goeril],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration,
  featuredWalletIds: [],
})