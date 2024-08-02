import {
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  RecordTabIndex,
  WalletSite,
  ButtonComponentsMap,
  SecurityIcon,
} from '@loopring-web/common-resources'
import { ChainId } from '@loopring-web/loopring-sdk'

export const toolBarAvailableEarnItem: number[] = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.WalletConnect,
  ButtonComponentsMap.TestNet,
]

export enum RouterPath {
  // lite = '/trade/lite',
  // pro = '/trade/pro',
  // stoplimit = '/trade/stoplimit',
  btrade = '/trade/btrade',
  // fiat = '/trade/fiat',
  // markets = '/markets',
  // mining = '/mining',
  // redPacket = '/redPacket',
  l2assets = '/l2assets',
  layer2 = '/layer2',
  // nft = '/nft',
  invest = '/invest',
  dualIntro = '/dual-intro',
  intro = '/intro',
  portal = '/portal',
}

export enum RouterMainKey {
  l2assets = 'l2assets',
  dualIntro = 'dualIntro',
  invest = 'invest',
  layer2 = 'layer2',
  portal = 'portal',
  btrade = 'btrade',
}

export const headerMenuEartData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'L2Assets',
      i18nKey: 'labelVault2',
    },
    router: { path: '/l2assets' },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'dual-intro',
      i18nKey: 'labelDualInvest',
    },
    router: { path: '/invest/dual' },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'portal',
      i18nKey: 'labelVault',
    },
    router: { path: '/portal' },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'blockTrade',
      i18nKey: 'labelBtradeTrade',
    },
    router: { path: '/trade/btrade' },
    status: HeaderMenuTabStatus.default,
  },
]
export const RouterAllowIndex = {
  TAIKO: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
  ],
  ETHEREUM: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
  ],
  GOERLI: [],
  SEPOLIA: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
  ],
  ARBGOERLI: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.invest,
  ],
  TAIKOHEKLA: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
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
  SEPOLIA: headerMenuEartData,
  ARBGOERLI: headerMenuEartData,
}

export const RecordEarnMap: { [key: string]: RecordTabIndex[] } = {
  TAIKO: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  ETHEREUM: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  GOERLI: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  SEPOLIA: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  ARBGOERLI: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
}
export enum AssetTabIndex {
  Tokens = 'Tokens',
  DualInvests = 'DualInvests',
}
export const AssetL2TabEarnIndex = {
  TAIKO: [AssetTabIndex.Tokens],
  ETHEREUM: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  GOERLI: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  SEPOLIA: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  ARBGOERLI: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  Arbitrum: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
}
export const RouterAllowEarnIndex = {
  TAIKO: [RouterMainKey.l2assets],
  ETHEREUM: [RouterMainKey.l2assets, RouterMainKey.invest],
  GOERLI: [RouterMainKey.l2assets, RouterMainKey.invest],
  SEPOLIA: [RouterMainKey.l2assets, RouterMainKey.invest],
  ARBGOERLI: [RouterMainKey.l2assets, RouterMainKey.invest],
}

export const earnHeaderToolBarData: {
  [key in ButtonComponentsMap]?: {
    buttonComponent: ButtonComponentsMap
    handleClick?: (props: any) => void
    [key: string]: any
  }
} = {
  [ButtonComponentsMap.Download]: {
    buttonComponent: ButtonComponentsMap.Download,
    url: WalletSite,
  },
  [ButtonComponentsMap.Notification]: {
    buttonComponent: ButtonComponentsMap.Notification,
    label: 'labelNotification',
    hidden: true,
  },
  [ButtonComponentsMap.Setting]: {
    buttonComponent: ButtonComponentsMap.Setting,
    label: 'labelSetting',
  },
  [ButtonComponentsMap.ProfileMenu]: {
    buttonComponent: ButtonComponentsMap.ProfileMenu,
    i18nDescription: 'labelProfile',
    readyState: undefined,
  },
  [ButtonComponentsMap.WalletConnect]: {
    buttonComponent: ButtonComponentsMap.WalletConnect,
    label: 'labelConnectWallet',
    accountState: undefined,
    handleClick: undefined,
  },
}
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
