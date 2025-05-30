import { IsMobile } from '../utils'
import { NetworkItemInfo } from '../loopring-interface'
import * as sdk from '@loopring-web/loopring-sdk'
import { mainnet, sepolia, base, baseSepolia, taiko, taikoHekla, Chain } from 'viem/chains'

export enum UpColor {
  green = 'green',
  red = 'red',
}
export const SlippageTolerance: Array<0.1 | 0.5 | 1 | string> = [0.1, 0.5, 1]
export const SlippageBtradeTolerance: Array<0.1 | 0.5 | 1 | string> = [0.1, 0.5, 1]
export type RowConfigType = {
  rowHeight?: number
  rowHeaderHeight?: number
  minHeight?: number
}
export const RowConfig = {
  rowHeight: IsMobile.any() ? 48 : 44,
  rowHeaderHeight: IsMobile.any() ? 48 : 44,
  minHeight: 350,
}
export const RowInvestConfig = {
  rowHeight: IsMobile.any() ? 48 : 56,
  rowHeaderHeight: IsMobile.any() ? 48 : 56,
  minHeight: 350,
}
export const RowDualInvestConfig = {
  rowHeight: IsMobile.any() ? 48 : 72,
  rowHeaderHeight: IsMobile.any() ? 48 : 72,
  minHeight: 350,
}
export const DirectionTag = '\u2192'
export const FeeChargeOrderDefaultMap = new Map([
  [sdk.ChainId.MAINNET, ['ETH', 'USDT', 'LRC', 'DAI', 'USDC']],
  [sdk.ChainId.TAIKO, ['ETH', 'USDT', 'LRC', 'USDC', 'TAIKO']],
  [sdk.ChainId.SEPOLIA, ['ETH', 'USDT', 'LRC', 'DAI']],
  [sdk.ChainId.TAIKOHEKLA, ['ETH', 'USDT', 'LRC', 'TAIKO']],
  [sdk.ChainId.BASE, ['ETH', 'USDT', 'LRC', 'USDC']],
  [sdk.ChainId.BASESEPOLIA, ['ETH', 'USDT', 'LRC', 'USDC']],
])
export const HEADER_HEIGHT = 64
export const LandPageHeightConfig = {
  headerHeight: 64,
  whiteHeight: 32,
  maxHeight: 836,
  minHeight: 800,
}
export const Lang = {
  en_US: 'en',
  zh_CN: 'zh',
}
export const Explorer = 'https://explorer.loopring.io/'
export const Bridge = 'https://bridge.loopring.io/#/'
export const ExchangeIO = 'https://loopring.io'
export const Exchange = 'https://loopring.io/#/'
export const ExchangePro = window.location.origin + '/#/pro'
export const Earnlite = 'https://defi.loopring.io/#/'
export const WalletSite = 'https://wallet.loopring.io'
export const LOOPRING_DOC = 'https://docs.loopring.io'

export const YEAR_FROMATE = 'YYYY'
export const DAY_FORMAT = 'MM/DD'
export const MINUTE_FORMAT = 'HH:mm'
export const DAY_MINUTE_FORMAT = `${DAY_FORMAT} ${MINUTE_FORMAT}`
export const DAT_STRING_FORMAT = 'MMM DD [UTC]Z'
export const DAT_STRING_FORMAT_S = 'MMM DD'

export const SECOND_FORMAT = `${MINUTE_FORMAT}:ss`
export const YEAR_DAY_FORMAT = `${YEAR_FROMATE}/${DAY_FORMAT}`
export const YEAR_DAY_MINUTE_FORMAT = `${YEAR_DAY_FORMAT} ${MINUTE_FORMAT}`
export const YEAR_DAY_SECOND_FORMAT = `${YEAR_DAY_FORMAT} ${SECOND_FORMAT}`
export const MINT_STRING_FORMAT = `${MINUTE_FORMAT} ${DAT_STRING_FORMAT}`
export const UNIX_TIMESTAMP_FORMAT = 'x'
export const sizeNFTConfig = (size: 'large' | 'medium' | 'small') => {
  switch (size) {
    case 'large':
      return {
        wrap_xs: 12,
        wrap_md: 4,
        wrap_lg: 4,
        avatar: 40,
        contentHeight: 80,
      }
      break
    case 'small':
      return {
        wrap_xs: 6,
        wrap_md: 3,
        wrap_lg: 2,
        avatar: 28,
        contentHeight: 60,
      }
      break
    case 'medium':
      return {
        wrap_xs: 6,
        wrap_md: 3,
        wrap_lg: 3,
        avatar: 38,
        contentHeight: 72,
      }
      break
  }
}
export enum TradeBtnStatus {
  AVAILABLE = 'AVAILABLE',
  DISABLED = 'DISABLED',
  LOADING = 'LOADING',
}
export const { NetworkMap, ChainTests, MapChainId, ChainIdExtends } = (
  process.env.REACT_APP_RPC_OTHERS?.split(',') ?? []
).reduce(
  ({ NetworkMap, ChainTests, MapChainId, ChainIdExtends }, item: string, index: number) => {
    let [_name, isTest] = process.env[`REACT_APP_RPC_CHAINNAME_${item}`]?.split('|') ?? [
      `unknown${item}`,
    ]
    const name = _name.toUpperCase()
    ChainIdExtends[name] = Number(item)
    MapChainId[item] = name
    // MapChainIdMap.set(Number(item), name);
    // myLog("MapChainIdMap", item, MapChainIdMap);
    if (isTest) {
      ChainTests.push(Number(item))
    }
    NetworkMap[Number(item)] = {
      label: _name,
      chainId: index.toString(),
      // RPC: process.env[`REACT_APP_RPC_URL_${item}`] ?? "",
      isTest: isTest ? true : false,
      walletType: name,
    }
    return { NetworkMap, ChainTests, MapChainId, ChainIdExtends }
  },
  {
    MapChainId: {
      1: 'ETHEREUM',
      5: 'GOERLI',
      421613: 'ARBGOERLI',
      11155111: 'SEPOLIA',
      167009: 'TAIKOHEKLA',
      167000: 'TAIKO',
      8453: 'BASE',
      84532: 'BASESEPOLIA',
    },
    NetworkMap: {
      1: {
        label: 'Ethereum',
        chainId: '1',
        isTest: false,
        walletType: 'ETHEREUM',
      },
      5: {
        label: 'Görli',
        chainId: '5',
        isTest: true,
        walletType: 'GOERLI',
      },
      11155111: {
        label: 'Sepolia',
        chainId: '11155111',
        isTest: true,
        walletType: 'SEPOLIA',
      },
      167009: {
        label: 'Taiko Hekla',
        chainId: '167009',
        isTest: true,
        walletType: 'Taiko Hekla',
      },
      167000: {
        label: 'Taiko',
        chainId: '167000',
        isTest: false,
        walletType: 'TAIKO',
      },
      8453: {
        label: 'Base',
        chainId: '8453',
        isTest: false,
        walletType: 'BASE',
      },
      84532: {
        label: 'Base Sepolia',
        chainId: '84532',
        isTest: true,
        walletType: 'BASESEPOLIA',
      },
    },
    ChainTests: [11155111, 5, 167009, 84532],
    ChainIdExtends: {
      NONETWORK: 'unknown',
    },
  } as {
    ChainTests: number[]
    MapChainId: { [key: string]: string }
    NetworkMap: { [key: number]: NetworkItemInfo }
    ChainIdExtends: { [key: string]: number | string }
  },
)
if (window) {
  // @ts-ignore
  window.__ChainIdExtends = ChainIdExtends
  // @ts-ignore
  window.__MapChainId = MapChainId
}

export const HEBAO_CONTRACT_MAP = [
  ['V3_0_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_3_0_0],
  ['V2_2_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_2_0],
  ['V2_1_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0],
  ['V2_0_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0],
  ['V1_2_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0],
  ['V1_1_6', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6],
]

export type ContactType = Pick<sdk.GetContactsResponse, 'contacts'>['contacts'][0]

export type CoinSource = {
  x: number
  y: number
  w: number
  h: number
  offX: number
  offY: number
  sourceW: number
  sourceH: number
  simpleName?: string
}

export enum TableFilterParams {
  all = 'all',
  favourite = 'favourite',
  ranking = 'ranking',
}

export type Contact = {
  contactName: string
  // name?: string
  address?: string
  addressType?: (typeof sdk.AddressType)[sdk.AddressTypeKeys]
  ens?: string
} & Partial<sdk.CreateContactRequest>
export enum ToastType {
  success = 'success',
  error = 'error',
  warning = 'warning',
  info = 'info',
}

export const SEND_TO_TAIKO_NETWORK_MAP = new Map([
  [sdk.ChainId.SEPOLIA, sdk.ChainId.TAIKOHEKLA],
  [sdk.ChainId.MAINNET, sdk.ChainId.TAIKO],
])

export const CHAIN_ID_TO_VIEW_CHAIN = new Map<sdk.ChainId, Chain>([
  [sdk.ChainId.SEPOLIA, sepolia],
  [sdk.ChainId.MAINNET, mainnet],
  [sdk.ChainId.TAIKOHEKLA, taikoHekla],
  [sdk.ChainId.TAIKO, taiko],
  [sdk.ChainId.BASE, base],
  [sdk.ChainId.BASESEPOLIA, baseSepolia],
])

export const coinbaseSmartWalletChains = [sdk.ChainId.BASE, sdk.ChainId.BASESEPOLIA] 