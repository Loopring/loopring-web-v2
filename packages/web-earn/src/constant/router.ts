import {
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  RecordTabIndex,
  WalletSite,
  ButtonComponentsMap,
  SecurityIcon,
} from '@loopring-web/common-resources'
import { ChainId, SoursURL } from '@loopring-web/loopring-sdk'

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
  taikoFarming = '/taiko-farming',
}

export enum RouterMainKey {
  l2assets = 'l2assets',
  dualIntro = 'dualIntro',
  invest = 'invest',
  layer2 = 'layer2',
  portal = 'portal',
  btrade = 'btrade',
  taikoFarming = 'taikoFarming',

}

export const headerMenuEartData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'L2Assets',
      i18nKey: 'labelVault2',
      description: 'labelAssetsDes',
    },
    router: { path: '/l2assets' },
    status: HeaderMenuTabStatus.default,
    logo: {
      dark: SoursURL + 'images/earn_nav_assets_dark.png',
      light: SoursURL + 'images/earn_nav_assets_light.png',
    }
  },
  {
    label: {
      id: 'dual',
      i18nKey: 'labelDualInvest',
      description: 'labelDualInvestDes',
    },
    router: { path: '/invest/dual' },
    status: HeaderMenuTabStatus.default,
    logo: {
      dark: SoursURL + 'images/earn_nav_dual_dark.png',
      light: SoursURL + 'images/earn_nav_dual_light.png',
    }
  },
  {
    label: {
      id: 'portal',
      i18nKey: 'labelVault',
      description: 'labelVaultDes',
    },
    router: { path: '/portal' },
    status: HeaderMenuTabStatus.default,
    logo: {
      dark: SoursURL + 'images/earn_nav_portal_dark.png',
      light: SoursURL + 'images/earn_nav_portal_light.png',
    }
  },
  {
    label: {
      id: 'btrade',
      i18nKey: 'labelBtradeTrade',
      description: 'labelBtradeTradeDes',
    },
    router: { path: '/trade/btrade' },
    status: HeaderMenuTabStatus.default,
    logo: {
      dark: SoursURL + 'images/earn_nav_btrade_dark.png',
      light: SoursURL + 'images/earn_nav_btrade_light.png',
    }
  },
  {
    label: {
      id: 'taikoFarming',
      i18nKey: 'labelTaikoFarming',
    },
    router: { path: '/taiko-farming' },
    status: HeaderMenuTabStatus.default,
  }
]

export const RouterAllowIndex = {
  TAIKOHEKLA: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
    RouterMainKey.taikoFarming,
  ],
  ETHEREUM: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
    RouterMainKey.taikoFarming,
  ],
  GOERLI: [],
  SEPOLIA: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
    RouterMainKey.taikoFarming,
  ],
  ARBGOERLI: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.invest,
  ],
  TAIKO: [
    RouterMainKey.l2assets,
    RouterMainKey.dualIntro,
    RouterMainKey.layer2,
    RouterMainKey.invest,
    RouterMainKey.portal,
    RouterMainKey.btrade,
    RouterMainKey.taikoFarming,
  ],
}

export const headerMenuDataEarnMap: { [key: string]: HeaderMenuItemInterface[] } = {
  TAIKOHEKLA: headerMenuEartData,
  TAIKO: headerMenuEartData,
  ETHEREUM: headerMenuEartData,
  GOERLI: headerMenuEartData,
  SEPOLIA: headerMenuEartData,
  ARBGOERLI: headerMenuEartData,
}

export const RecordEarnMap: { [key: string]: RecordTabIndex[] } = {
  TAIKO: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords, RecordTabIndex.TaikoLockRecords],
  ETHEREUM: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  GOERLI: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  SEPOLIA: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  ARBGOERLI: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords],
  TAIKOHEKLA: [RecordTabIndex.Transactions, RecordTabIndex.DualRecords, RecordTabIndex.VaultRecords, RecordTabIndex.BtradeSwapRecords, RecordTabIndex.TaikoLockRecords],
}
export enum AssetTabIndex {
  Tokens = 'Tokens',
  DefiPortfolio = 'DefiPortfolio',
}
export const AssetL2TabEarnIndex = {
  TAIKO: [AssetTabIndex.Tokens, AssetTabIndex.DefiPortfolio],
  ETHEREUM: [AssetTabIndex.Tokens, AssetTabIndex.DefiPortfolio],
  GOERLI: [AssetTabIndex.Tokens, AssetTabIndex.DefiPortfolio],
  SEPOLIA: [AssetTabIndex.Tokens, AssetTabIndex.DefiPortfolio],
  ARBGOERLI: [AssetTabIndex.Tokens, AssetTabIndex.DefiPortfolio],
  Arbitrum: [AssetTabIndex.Tokens, AssetTabIndex.DefiPortfolio],
  TAIKOHEKLA: [AssetTabIndex.Tokens, AssetTabIndex.DefiPortfolio],
}
export const RouterAllowEarnIndex = {
  TAIKOHEKLA: [RouterMainKey.l2assets, RouterMainKey.invest],
  TAIKO: [RouterMainKey.l2assets, RouterMainKey.invest],
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

export const earnHeaderToolBarDataMobile: {
  [key in ButtonComponentsMap]?: {
    buttonComponent: ButtonComponentsMap
    handleClick?: (props: any) => void
    [key: string]: any
  }
} = {
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
