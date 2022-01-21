import {
  AssetsIcon,
  L2HistoryIcon,
  L2MyLiquidityIcon,
  L2OrderIcon,
  NFTIcon,
  SecurityIcon,
  VipIcon,
} from "../svg";

import {
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
} from "../loopring-interface";

export enum ButtonComponentsMap {
  Download,
  Notification,
  Setting,
  WalletConnect,
}

export const ToolBarAvailableItem = [
  // ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.WalletConnect,
];

export let headerToolBarData: Array<{
  buttonComponent: number;
  handleClick?: (props: any) => void;
  [key: string]: any;
}> = [
  {
    buttonComponent: ButtonComponentsMap.Download,
    url: "https://loopring.io",
    i18nTitle: "labelDownloadAppTitle",
    i18nDescription: "labelDownloadBtn",
  },
  {
    buttonComponent: ButtonComponentsMap.Notification,
    label: "labelNotification",
  },
  { buttonComponent: ButtonComponentsMap.Setting, label: "labelSetting" },
  {
    buttonComponent: ButtonComponentsMap.WalletConnect,
    label: "labelConnectWallet",
    status: undefined,
    handleClick: undefined,
  },
];
export let layer2ItemData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: "Classic",
      i18nKey: "labelClassic",
      description: "labelClassicDescription",
    },
    router: { path: "/trade/lite/LRC-ETH" },
  },
  {
    label: {
      id: "Advanced",
      i18nKey: "labelAdvanced",
      //TODO: translate id
      description: "labelAdvancedDescription",
    },
    router: { path: "/trade/pro/LRC-ETH" },
  },
];

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
  layer2,
}

export const orderDisableList = ["Liquidity", "Markets", "Trading", "Mining"];
export const ammDisableList = ["Liquidity"];

export let headerMenuData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: "Markets",
      i18nKey: "labelMarkets",
    },
    router: { path: "/markets" },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: "Trade",
      i18nKey: "labelTrade",
    },
    status: HeaderMenuTabStatus.default,
    child: layer2ItemData,
  },
  {
    label: {
      id: "Liquidity",
      i18nKey: "labelLiquidity",
    },
    router: { path: "/liquidity" },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: "Mining",
      i18nKey: "labelMining",
    },
    router: { path: "/mining" },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: "Layer2",
      i18nKey: "labelLayer2",
    },
    router: { path: "/layer2" },
    status: HeaderMenuTabStatus.default,
  },
];

export const subMenuLayer2 = {
  assetsGroup: [
    {
      icon: AssetsIcon,
      router: { path: "/layer2/assets" },
      label: {
        id: "assets",
        i18nKey: "labelAssets",
      },
    },
    // {
    //   icon: NFTIcon,
    //   router: { path: "/layer2/my-nft" },
    //   label: {
    //     id: "my-nft",
    //     i18nKey: "labelMyNFT",
    //   },
    // },
    {
      icon: L2MyLiquidityIcon,
      router: { path: "/layer2/my-liquidity" },
      label: {
        id: "my-liquidity",
        i18nKey: "labelMyLiquidity",
      },
    },
  ],
  transactionsGroup: [
    {
      icon: L2HistoryIcon,
      router: { path: "/layer2/history" },
      label: {
        id: "history",
        i18nKey: "labelHistory",
      },
    },
    {
      icon: L2OrderIcon,
      router: { path: "/layer2/order" },
      label: {
        id: "order",
        i18nKey: "labelOrder",
      },
      // }, {
      //     icon: RewardIcon,
      //     router: {path: '/layer2/rewards'},
      //     label: {
      //         id: 'reward', i18nKey: 'labelReward',
      //     },
      // }, {
      //     icon: RedPockIcon,
      //     router: {path: '/layer2/redpock'},
      //     label: {
      //         id: 'redpock', i18nKey: 'labelRedPock',
      //     },
    },
  ],
  settingGroup: [
    {
      icon: SecurityIcon,
      router: { path: "/layer2/security" },
      label: {
        id: "security",
        i18nKey: "labelSecurity",
      },
    },
    {
      icon: VipIcon,
      router: { path: "/layer2/vip" },
      label: {
        id: "vip",
        i18nKey: "labelVipPanel",
      },
    },
  ],
};

// export const subMenuLiquidity = {
//     poolsGroup: [{
//         // icon: PoolsIcon,
//         router: {path: '/liquidity/pools'},
//         label: {
//             id: 'pools',
//             i18nKey: 'labelPools',
//         },
//     }, {
//         // icon: MiningIcon,
//         router: {path: '/liquidity/amm-mining'},
//         label: {
//             id: 'amm-mining',
//             i18nKey: 'labelAmmMining',
//         },
//     }, {
//         // icon: MyLiquidityIcon,
//         router: {path: '/liquidity/my-liquidity'},
//         label: {
//             id: 'my-liquidity',
//             i18nKey: 'labelMyLiquidity',
//         },
//     }],
//     // bookGroup: [{
//     //     icon: OrderMinIcon,
//     //     router: {path: '/liquidity/orderBook-Mining'},
//     //     label: {
//     //         id: 'orderBook-Mining',
//     //         i18nKey: 'labelOrderBookMining',
//     //     }
//     // },
//     //     {
//     //     icon: MakerRebatesIcon,
//     //     router: {path: '/liquidity/maker-rebates'},
//     //     label: {
//     //         id: 'maker-rebates',                                             a
//     //         i18nKey: 'labelMakerRebates',
//     //     },
//     // }
//     // ]
// }
export const headerRoot = "Landing-page";
export const SoursURL = "https://static.loopring.io/assets/";
