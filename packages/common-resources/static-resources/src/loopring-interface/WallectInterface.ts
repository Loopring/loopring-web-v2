import { ConnectProviders } from '@loopring-web/web3-provider'

export enum WalletStatus {
  disabled = 'disabled',
  loading = 'loading',
  unlock = 'unlock',
  connect = 'connect',
  noAccount = 'noAccount',
  accountPending = 'accountPending',
  noNetwork = 'noNetwork',
  default = 'default',
}

export interface GatewayItem {
  key: keyof typeof ConnectProviders
  keyi18n: string
  imgSrc: string
  handleSelect?: (event?: React.MouseEvent) => void
}
