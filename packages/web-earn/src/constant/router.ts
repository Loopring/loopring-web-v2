

import {
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  RecordTabIndex,
  WalletSite,
  ButtonComponentsMap,
  SecurityIcon,
} from '@loopring-web/common-resources'

export const toolBarAvailableEarnItem: number[] = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.WalletConnect,
  ButtonComponentsMap.TestNet,
]

export let headerToolBarEarnData: Array<{
  buttonComponent: number
  handleClick?: (props: any) => void
  [key: string]: any
}> = [
  {
    buttonComponent: ButtonComponentsMap.Download,
    url: WalletSite,
  },
  {
    buttonComponent: ButtonComponentsMap.Notification,
    label: 'labelNotification',
  },
  { buttonComponent: ButtonComponentsMap.Setting, label: 'labelSetting' },
  {
    buttonComponent: ButtonComponentsMap.WalletConnect,
    label: 'labelConnectWallet',
    accountState: undefined,
    handleClick: undefined,
  },
]

export const toolBarMobileAvailableEarnItem = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.WalletConnect,
]

export enum RouterPath {
  // lite = '/trade/lite',
  // pro = '/trade/pro',
  // stoplimit = '/trade/stoplimit',
  // btrade = '/trade/btrade',
  // fiat = '/trade/fiat',
  // markets = '/markets',
  // mining = '/mining',
  // redPacket = '/redPacket',
  l2assets = '/l2assets',
  layer2 = '/layer2',
  // nft = '/nft',
  invest = '/invest',
  dualIntro = '/dual-intro',
}

export enum RouterMainKey {
  l2assets = 'l2assets',
  dualIntro = 'dualIntro',
  invest = 'invest',
  layer2 = 'layer2',
}

export const headerMenuEartData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'dual-intro',
      i18nKey: 'labelDualInvest',
    },
    router: { path: '/dual-intro' },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'L2Assets',
      i18nKey: 'labelVault',
    },
    router: { path: '/l2assets' },
    status: HeaderMenuTabStatus.default,
  },
]

export const RouterAllowIndex = {
  TAIKO: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    // RouterMainKey.lite,
    // RouterMainKey.pro,
    // RouterMainKey.stoplimit,
    // RouterMainKey.btrade,
    // RouterMainKey.fiat,
    // RouterMainKey.markets,
    // RouterMainKey.mining,
    // RouterMainKey.redPacket,
    // RouterMainKey.l2assets,
    RouterMainKey.layer2,
    // RouterMainKey.nft,
    RouterMainKey.invest,
  ],
  ETHEREUM: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    // RouterMainKey.lite,
    // RouterMainKey.pro,
    // RouterMainKey.stoplimit,
    // RouterMainKey.btrade,
    // RouterMainKey.fiat,
    // RouterMainKey.markets,
    // RouterMainKey.mining,
    // RouterMainKey.redPacket,
    // RouterMainKey.l2assets,
    RouterMainKey.layer2,
    // RouterMainKey.nft,
    RouterMainKey.invest,
  ],
  GOERLI: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    // RouterMainKey.lite,
    // RouterMainKey.pro,
    // RouterMainKey.stoplimit,
    // RouterMainKey.btrade,
    // RouterMainKey.fiat,
    // RouterMainKey.markets,
    // RouterMainKey.mining,
    // RouterMainKey.redPacket,
    // RouterMainKey.l2assets,
    RouterMainKey.layer2,
    // RouterMainKey.nft,
    RouterMainKey.invest,
  ],
  ARBGOERLI: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    // RouterMainKey.lite,
    // RouterMainKey.pro,
    // RouterMainKey.stoplimit,
    // RouterMainKey.btrade,
    // RouterMainKey.fiat,
    // RouterMainKey.markets,
    // RouterMainKey.mining,
    // RouterMainKey.redPacket,
    // RouterMainKey.l2assets,
    // RouterMainKey.layer2,
    // RouterMainKey.nft,
    RouterMainKey.invest,
  ],
}

export const headerMenuDataEarnMap: { [key: string]: HeaderMenuItemInterface[] } = {
  TAIKO: [
    {
      label: {
        id: 'L2Assets',
        i18nKey: 'labelAssets',
      },
      router: { path: '/l2assets' },
      status: HeaderMenuTabStatus.default,
    },
  ],
  ETHEREUM: headerMenuEartData,
  GOERLI: headerMenuEartData,
  ARBGOERLI: headerMenuEartData,
}

export const RecordEarnMap: { [key: string]: RecordTabIndex[] } = {
  TAIKO: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords],
  ETHEREUM: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords],
  GOERLI: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords],
  ARBGOERLI: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords],
}
export enum AssetTabIndex {
  Tokens = 'Tokens',
  DualInvests = 'DualInvests',
}
export const AssetL2TabEarnIndex = {
  TAIKO: [AssetTabIndex.Tokens],
  ETHEREUM: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  GOERLI: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  ARBGOERLI: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  Arbitrum: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
}
export const RouterAllowEarnIndex = {
  TAIKO: [RouterMainKey.l2assets],
  ETHEREUM: [RouterMainKey.l2assets, RouterMainKey.invest],
  GOERLI: [RouterMainKey.l2assets, RouterMainKey.invest],
  ARBGOERLI: [RouterMainKey.l2assets, RouterMainKey.invest],
}

export const earnHeaderToolBarData: Array<{
  buttonComponent: number
  handleClick?: (props: any) => void
  [key: string]: any
}> = [
  {
    buttonComponent: ButtonComponentsMap.Download,
    url: WalletSite,
  },
  {
    buttonComponent: ButtonComponentsMap.Notification,
    label: 'labelNotification',
    hidden: true
  },
  { buttonComponent: ButtonComponentsMap.Setting, label: 'labelSetting' },
  {
    buttonComponent: ButtonComponentsMap.ProfileMenu,
    i18nDescription: 'labelProfile',
    readyState: undefined,
  },
  {
    buttonComponent: ButtonComponentsMap.WalletConnect,
    label: 'labelConnectWallet',
    accountState: undefined,
    handleClick: undefined,
  },
]

export enum EarnLayer2RouterID {
  security = 'security',
}

export const EarnProfile = {
  security: [
    {
      icon: SecurityIcon,
      router: { path: `${RouterPath.layer2}/${EarnLayer2RouterID.security}` },
      label: {
        id: 'security',
        i18nKey: 'labelSecurity',
      },
    },
  ],
}