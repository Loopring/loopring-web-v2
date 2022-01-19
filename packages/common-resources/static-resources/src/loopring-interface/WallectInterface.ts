import { ConnectProviders } from '../constant';

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
    imgSrc: string
    handleSelect?: (event?: React.MouseEvent) => void
}



export interface GatewayItem {
    key: keyof typeof ConnectProviders
    imgSrc: string
    handleSelect?: (event?: React.MouseEvent) => void
}