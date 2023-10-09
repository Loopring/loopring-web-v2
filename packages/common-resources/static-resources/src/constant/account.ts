import { StateBase } from './sagaStatus'
import { ConnectProviders } from '@loopring-web/web3-provider'
import { TokenType } from '../loopring-interface'

export enum AccountStatus {
  UN_CONNECT = 'UN_CONNECT',
  // CONNECT = 'CONNECT',
  NO_ACCOUNT = 'NO_ACCOUNT',
  DEPOSITING = 'DEPOSITING',
  NOT_ACTIVE = 'NOT_ACTIVE',
  LOCKED = 'LOCKED',
  ACTIVATED = 'ACTIVATED',
  ERROR_NETWORK = 'ERROR_NETWORK',
}

export enum fnType {
  UN_CONNECT = 'UN_CONNECT',
  NO_ACCOUNT = 'NO_ACCOUNT',
  NOT_ACTIVE = 'NOT_ACTIVE',
  LOCKED = 'LOCKED',
  ACTIVATED = 'ACTIVATED',
  DEFAULT = 'DEFAULT',
  DEPOSITING = 'DEPOSITING',
  CONNECT = 'CONNECT',
  ERROR_NETWORK = 'ERROR_NETWORK',
}

export type Account = {
  accAddress: string
  qrCodeUrl: string
  readyState: keyof typeof AccountStatus | 'unknown'
  accountId: number
  level: string
  apiKey: string
  frozen: boolean | undefined
  eddsaKey: any
  publicKey: any
  keySeed: string
  nonce: number | undefined
  keyNonce: number | undefined
  connectName: ConnectProviders
  wrongChain?: boolean | undefined
  isInCounterFactualStatus?: boolean
  isContract1XAddress?: boolean
  isContractAddress?: boolean
  isCFAddress?: boolean
  isContract?: boolean
  _chainId?: 1 | 5 | 'unknown'
  _accountIdNotActive?: number
  _userOnModel?: boolean | undefined
  __timer__: NodeJS.Timer | -1
  hasUnknownCollection: undefined | boolean
}
export type AccountState = Account & StateBase
export type AccountFull = {
  account: Account
  resetAccount: () => void
  updateAccount: (account: Partial<Account>) => void
} & StateBase

export type AssetsRawDataItem = {
  token: {
    type: TokenType
    value: string
  }
  amount: string
  available: string
  locked: string
  smallBalance: boolean
  tokenValueDollar: number
  name: string
  withdrawAmount?: string
  depositAmount?: string
}
export const ContactLimit = 1500
