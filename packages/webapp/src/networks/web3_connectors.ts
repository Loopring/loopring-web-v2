import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { AuthereumConnector } from '@web3-react/authereum-connector'
import { myLog } from 'utils/log_tools'

const POLLING_INTERVAL = 12000

const RPC_URLS: { [chainId: number]: string } = {
  1: process.env.REACT_APP_RPC_URL_1 as string,
  5: process.env.REACT_APP_RPC_URL_5 as string
}

const WALLET_CONNECT_BRIDGE = process.env.REACT_APP_WALLET_CONNECT_BRIDGE ?? 'https://bridge.walletconnect.org'

myLog('RPC_URLS 1:', RPC_URLS[1])
myLog('RPC_URLS 5:', RPC_URLS[5])

myLog('WALLET_CONNECT_BRIDGE:', WALLET_CONNECT_BRIDGE)

export const injected = new InjectedConnector({ supportedChainIds: [1, 5,] })

export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 1
})

export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  bridge: WALLET_CONNECT_BRIDGE,
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'Loopring DEX'
})

export const ledger = new LedgerConnector({ chainId: 1, url: RPC_URLS[1], pollingInterval: POLLING_INTERVAL })

export const trezor = new TrezorConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
  manifestEmail: 'dummy@abc.xyz',
  manifestAppUrl: 'http://localhost:1234'
})

export const authereum = new AuthereumConnector({ chainId: 42 })
