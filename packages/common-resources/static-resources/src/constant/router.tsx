import {
  AssetsIcon,
  L2HistoryIcon,
  L2MyLiquidityIcon,
  L2OrderIcon,
  NFTIcon,
  RecordIcon,
  // NFTIcon,
  SecurityIcon,
  VipIcon,
  WaitApproveIcon,
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
    {
      icon: NFTIcon,
      router: { path: "/layer2/my-nft" },
      label: {
        id: "my-nft",
        i18nKey: "labelMyNFT",
      },
    },
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
export const subMenuHebao = {
  assetsGroup: [
    {
      icon: AssetsIcon,
      router: { path: "/guardian/guardian-protected" },
      label: {
        id: "guardian-protected",
        i18nKey: "labelWalletProtect",
      },
    },
    {
      icon: WaitApproveIcon,
      router: { path: "/guardian/guardian-validation-info" },
      label: {
        id: "guardian-validation",
        i18nKey: "labelWalletValidation",
      },
    },
    {
      icon: RecordIcon,
      router: { path: "/guardian/guardian-history" },
      label: {
        id: "guardian-history",
        i18nKey: "labelWalletHistory",
      },
    },
  ],
};

export const headerRoot = "Landing-page";
export const SoursURL = "https://static.loopring.io/assets/";
