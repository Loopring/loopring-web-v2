import {
    Account,
    AccountStatus,
    AmmInData,
    CoinInfo,
    CoinMap, ConnectProviders,
    HeaderMenuItemInterface,
    TradeCalcData,
    WalletCoin,
    WalletMap
} from '@loopring-web/common-resources';
import { List } from 'immutable';
export const account:Account = {
    accAddress: 'xxxxxxxxxxxxxxxxxxx',
    readyState: AccountStatus.UN_CONNECT,
    accountId: -1,
    apiKey: '',
    eddsaKey: '',
    publicKey: {},
    level: '',
    nonce: undefined,
    keyNonce: undefined,
    connectName: ConnectProviders.Unknown,
}
export const coinMap: CoinMap<CoinType, CoinInfo<CoinType>> = {
    ETH: {
        icon: 'https://exchange.loopring.io/assets/images/ethereum/assets/0x9A0aBA393aac4dFbFf4333B06c407458002C6183/logo.png',
        name: 'ETH',
        simpleName: 'ETH',
        description: '',
        company: 'ETH'
    },
    LRC: {
        icon: 'https://exchange.loopring.io/assets/images/ethereum/assets/0x565aBA393aac4dFbFf4333B06c407458002C6183/logo.png',
        name: 'LRC',
        simpleName: 'LRC',
        description: '',
        company: 'LRC'
    },
    USDT: {
        icon: 'https://exchange.loopring.io/assets/images/ethereum/assets/0x565aBA393aac4dFbFf4333B06c407458002C6183/logo.png',
        name: 'USDT',
        simpleName: 'USDT',
        description: '',
        company: 'USDT'
    },
    USDC: {
        icon: 'https://exchange.loopring.io/assets/images/ethereum/assets/0x565aBA393aac4dFbFf4333B06c407458002C6183/logo.png',
        name: 'USDC',
        simpleName: 'USDC',
        description: '',
        company: 'USDC'
    },
    LRCA: {
        icon: 'red',
        name: 'LRCA',
        simpleName: 'LRCA',
        description: '',
        company: 'LRC'
    },
    LRCB: {
        icon: 'red',
        name: 'LRCA',
        simpleName: 'LRCB',
        description: '',
        company: 'LRC'
    },
    DPR: {
        icon: 'blue',
        name: 'DPR',
        simpleName: 'DPR',
        description: '',
        company: 'DPR'
    },
    CCB: {
        icon: 'blue',
        name: 'CCB',
        simpleName: 'CCB',
        description: '',
        company: 'ETH'
    },
    OKB: {
        icon: 'blue',
        name: 'OKB',
        simpleName: 'OKB',
        description: '',
        company: 'ETH'
    },
    CRV: {
        icon: 'blue',
        name: 'CRV',
        simpleName: 'CRV',
        description: '',
        company: 'CRV'
    },
    TEST: {
        icon: 'blue',
        name: 'TEST',
        simpleName: 'TEST',
        description: '',
        company: 'TEST'
    },
    TEST2: {
        icon: 'blue',
        name: 'TEST3',
        simpleName: 'TEST2',
        description: '',
        company: 'CRV'
    },
    TEST3: {
        icon: 'blue',
        name: 'TEST3',
        simpleName: 'TEST3',
        description: '',
        company: 'TEST3'
    },

}
export const walletMap = {
    ETH: {
        belong: 'ETH',
        count: 11,
    },
    LRC: {
        belong: 'LRC',
        count: 11111111111111,
    },
}

export enum ButtonComponentsMap {
    Download,
    Notification,
    Theme,
    Language
}

export const inputProps = {
    label: 'Enter Payment Token',
    subLabel: 'Max',
    emptyText: 'Select Token',
    placeholderText: '0.00',
    coinMap: coinMap,
}

export const coinType = {
    ETH: 'ETH',
    USDT: 'USDT',
    USDC: 'USDC',
    LRC: 'LRC',
    CRV: 'CRV',
    DPR: 'DPR',
    CCB: 'CCB',
    OKB: 'OKB',
    LRCA: 'LRCA',
    LRCB: 'LRCB',
    TEST: 'TEST',
    TEST2: 'TEST2',
    TEST3: 'TEST3',
}

export const tradeCalcData: TradeCalcData<CoinType> = {
    coinSell: 'ETH', //name
    coinBuy: 'LRC',
    BtoS: 0,
    StoB: 0,
    sellCoinInfoMap: coinMap,
    buyCoinInfoMap: coinMap,
    walletMap: walletMap as WalletMap<CoinType, WalletCoin<CoinType>>,
    slippage: 0.5,
    priceImpact: '12',
    minimumReceived: '1%',
    fee: '1%'
}
export const ammCalcData: AmmInData<CoinType> = {
    myCoinA: {belong: 'ETH', balance: 1000, tradeValue: 0},
    myCoinB: {belong: 'LRC', balance: 1000, tradeValue: 0},
    lpCoinA: {belong: 'ETH', balance: 1000, tradeValue: 0},
    lpCoinB: {belong: 'ETH', balance: 1000, tradeValue: 0},
    lpCoin: {belong: 'ETH', balance: 1000, tradeValue: 0},
    AtoB: 50,
    coinInfoMap: coinMap,
    slippage: 0.5,
    feeJoin: '1%',
    feeExit: '1%',
}


export const layer2ItemData = List<HeaderMenuItemInterface>([{
    label: {
        id: 'classic',
        i18nKey: 'labelClassic',
        description: 'Simple and easy-to-user interface',
    },
    router: {path: ''},
}, {
    label: {
        id: 'advanced',
        i18nKey: 'labelAdvanced',
        description: 'Full access to all trading tools',
    },
    router: {path: ''},
},
])

export type CoinType = typeof coinType;