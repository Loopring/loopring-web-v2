import { ConnectorNames } from 'loopring-sdk'

import {
    injected,
    network,
    walletconnect,
    walletlink,
    ledger,
    trezor,
    authereum,
} from 'networks/web3_connectors'

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
    [ConnectorNames.Unknown]: undefined,
    [ConnectorNames.Injected]: injected,
    [ConnectorNames.Network]: network,
    [ConnectorNames.WalletConnect]: walletconnect,
    [ConnectorNames.WalletLink]: walletlink,
    [ConnectorNames.Ledger]: ledger,
    [ConnectorNames.Trezor]: trezor,
    [ConnectorNames.Authereum]: authereum,
}
