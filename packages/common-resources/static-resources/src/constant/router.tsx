import {
    AssetsIcon,
    MiningIcon,
    MyLiquidityIcon,
    // OrderIcon,
    // PoolsIcon,
    // SettingIcon,
    L2MyLiquidityIcon,
    L2HistoryIcon,
    L2OrderIcon,
} from '../svg';

import { HeaderMenuItemInterface, HeaderMenuTabStatus } from '../loopring-interface';

export enum ButtonComponentsMap {
    Download,
    Notification ,
    Setting,
    WalletConnect,
}

export const ToolBarAvailableItem = [
    ButtonComponentsMap.Download,
    // ButtonComponentsMap.Notification,
    ButtonComponentsMap.Setting,
    ButtonComponentsMap.WalletConnect
]

export let headerToolBarData: Array<{ buttonComponent: number, handleClick?: (props: any) => void, [ key: string ]: any }> = [
    {
        buttonComponent: ButtonComponentsMap.Download,
        url: 'https://apps.apple.com/us/app/loopring-smart-wallet/id1550921126',
        i18nTitle: 'labelDownloadAppTitle',
        i18nDescription: 'labelDownloadBtn',
    },
    {buttonComponent: ButtonComponentsMap.Notification, label: 'labelNotification',},
    {buttonComponent: ButtonComponentsMap.Setting, label: 'labelSetting'},
    {
        buttonComponent: ButtonComponentsMap.WalletConnect,
        label: 'labelConnectWallet',
        status: undefined,
        notificationList: [],
        handleClick: undefined
    }];
export let layer2ItemData: Array<HeaderMenuItemInterface> = [{
    label: {
        id: 'Classic', i18nKey: 'labelClassic',
        description: 'labelClassicDescription',
    },
    router: {path: '/trading/lite'},
},
// {
//     label: {
//         id: 'Advanced', i18nKey: 'labelAdvanced',
//         //TODO: translate id
//         description: 'labelAdvancedDescription',
//     },
//     router: { path: '/trading/pro' },
// },
]


export enum HeadMenuTabKey {
    markets,
    trade,
    liquidity,
    Layer2,
}

export enum NavListIndex {
    markets,
    trade,
    liquidity,
    layer2
}

export let headerMenuData: Array<HeaderMenuItemInterface> = [
    {
        label: {
            id: 'Markets', i18nKey: 'labelMarkets',
        },
        router: {path: '/markets'},
        status: HeaderMenuTabStatus.default,
    },
    {
        label: {
            id: 'Trading', i18nKey: 'labelTrade',
        },
        // router: {path: '/trading'},
        router: {path: '/trading/lite'},
        // child: layer2ItemData,
        status: HeaderMenuTabStatus.default,
    },
    {
        label: {
            id: 'Liquidity', i18nKey: 'labelLiquidity',
        },
        router: {path: '/liquidity'},
        status: HeaderMenuTabStatus.default,
    },
    {
        label: {
            id: 'Mining', i18nKey: 'labelMining',
        },
        router: {path: '/mining'},
        status: HeaderMenuTabStatus.default,
    },
    {
        label: {
            id: 'Layer2', i18nKey: 'labelLayer2',
        },
        router: {path: '/layer2'},
        status: HeaderMenuTabStatus.default,

    }
];

export const subMenuLayer2 = {
    assetsGroup: [{
        icon: AssetsIcon,
        router: {path: '/layer2/assets'},
        label: {
            id: 'assets', i18nKey: 'labelAssets',
        },
    }, {
        icon: L2MyLiquidityIcon,
        router: {path: '/layer2/my-liquidity'},
        label: {
            id: 'my-liquidity', i18nKey: 'labelMyLiquidity',
        }
    }],
    transactionsGroup: [{
        icon: L2HistoryIcon,
        router: {path: '/layer2/history'},
        label: {
            id: 'history', i18nKey: 'labelHistory',
        },
    }, {
        icon: L2OrderIcon,
        router: {path: '/layer2/order'},
        label: {
            id: 'order', i18nKey: 'labelOrder',
        },
    },
]
    /* {
        icon: TransactionsIcon,
        router: {path: '/layer2/transactions'},
        label: {
            id: 'transactions', i18nKey: 'labelTransactions',
        },
    }, {
        icon: TradeIcon,
        router: {path: '/layer2/trades'},
        label: {
            id: 'trades', i18nKey: 'labelTrades',
        },
    },
        {
            icon: AmmIcon,
            router: {path: '/layer2/ammRecords'},
            label: {
                id: 'AmmRecords', i18nKey: 'labelAmmRecords',
                description: 'labelAmmRecordsDes',
            },
        } 
    ],
    // countInfoGroup: [{
    //     icon: OrderIcon,
    //     router: {path: '/layer2/orders'},
    //     label: {
    //         id: 'orders', i18nKey: 'labelOrders',
    //     },
    // },

    // ],
    // settingGroup: [{
    //     icon: SettingIcon,
    //     router: {path: '/layer2/setting'},
    //     label: {
    //         id: 'setting',
    //         i18nKey: 'labelSetting',
    //     },
    // },
    //]
    */
}


export const subMenuLiquidity = {
    poolsGroup: [{
        // icon: PoolsIcon,
        router: {path: '/liquidity/pools'},
        label: {
            id: 'pools',
            i18nKey: 'labelPools',
        },
    }, {
        icon: MiningIcon,
        router: {path: '/liquidity/amm-mining'},
        label: {
            id: 'amm-mining',
            i18nKey: 'labelAmmMining',
        },
    }, {
        icon: MyLiquidityIcon,
        router: {path: '/liquidity/my-liquidity'},
        label: {
            id: 'my-liquidity',
            i18nKey: 'labelMyLiquidity',
        },
    }],
    // bookGroup: [{
    //     icon: OrderMinIcon,
    //     router: {path: '/liquidity/orderBook-Mining'},
    //     label: {
    //         id: 'orderBook-Mining',
    //         i18nKey: 'labelOrderBookMining',
    //     }
    // },
    //     {
    //     icon: MakerRebatesIcon,
    //     router: {path: '/liquidity/maker-rebates'},
    //     label: {
    //         id: 'maker-rebates',
    //         i18nKey: 'labelMakerRebates',
    //     },
    // }
    // ]
}
export const headerRoot = 'Trading'
