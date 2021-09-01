import { GatewayItem } from '../loopring-interface';
import { ConnectProviders } from './connect';

export const gatewayList: GatewayItem[] = [
    {
        key: ConnectProviders.MetaMask,
        imgSrc: 'static/svg/meta-mask.svg',
    },
    {
        key: ConnectProviders.WalletConnect,
        imgSrc: 'static/svg/wallet-connect.svg',
    },
    // {
    //     key: 'Ledger',
    //     imgSrc: 'static/svg/ledger.svg',
    // },
    // {
    //     key: 'Trezor',
    //     imgSrc: 'static/svg/trezor.svg',
    // },
]
