import { AccountStatus } from 'state_machine/account_machine_spec'

import { ConnectorNames, PublicKey } from 'loopring-sdk'

export interface Lv2Account {
  accAddr: string
  status: AccountStatus
  accountId: number,
  publicKey: PublicKey,
  nonce: number,
  isContractAddress: boolean
  connectName: ConnectorNames
  connectNameTemp: ConnectorNames
  apiKey: string
  eddsaKey: any
}

export const POLLING_INTERVAL = 10000
