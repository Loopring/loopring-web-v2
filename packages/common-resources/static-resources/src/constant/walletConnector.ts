import { GatewayItem } from '../loopring-interface';
import { ConnectProviders } from './connect';
import { SoursURL } from './router';

export const gatewayList: GatewayItem[] = [
    {
        key: ConnectProviders.MetaMask,
        imgSrc: SoursURL+'svg/meta-mask.svg',
    },
    {
        key: ConnectProviders.WalletConnect,
        imgSrc: SoursURL+'svg/wallet-connect.svg',
    },
    // {
    //     key: 'Ledger',
    //     imgSrc: 'http://static.loopring.io/assets/svg/ledger.svg',
    // },
    // {
    //     key: 'Trezor',
    //     imgSrc: 'http://static.loopring.io/assets/svg/trezor.svg',
    // },
]
