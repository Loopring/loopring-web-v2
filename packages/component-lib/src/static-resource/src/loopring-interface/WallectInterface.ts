export enum WalletStatus {
    disabled = 'disabled',
    loading = 'loading',
    unlock = 'unlock',
    connect = 'connect',
    noAccount = 'noAccount',
    accountPending = 'accountPending',
    noNetwork='noNetwork',
    default = 'default',
}

export interface GatewayItem {
    key: string
    imgSrc: string
    handleSelect?: (event: React.MouseEvent) => void
}