//
//
// export enum Layer2RouterID {
//   security = 'security',
//   vip = 'vip',
//   contact = 'contact',
//   referralrewards = 'referralrewards',
//   forcewithdraw = 'forcewithdraw',
// }

// export const Profile = {
//   security: [
//     {
//       icon: SecurityIcon,
//       router: { path: '/layer2/security' },
//       label: {
//         id: 'security',
//         i18nKey: 'labelSecurity',
//       },
//     },
//   ],
//   vip: [
//     {
//       icon: VipIcon,
//       router: { path: '/layer2/vip' },
//       label: {
//         id: 'vip',
//         i18nKey: 'labelVipPanel',
//       },
//     },
//   ],
//   contact: [
//     {
//       icon: ContactIcon,
//       router: { path: '/layer2/contact' },
//       label: {
//         id: 'contact',
//         i18nKey: 'labelContactsPanel',
//       },
//     },
//   ],
//   referralrewards: [
//     {
//       icon: RewardIcon,
//       router: { path: '/layer2/referralrewards' },
//       label: {
//         id: 'referralrewards',
//         i18nKey: 'labelReferralReward',
//       },
//     },
//   ],
// }

// export enum ProfileKey {
//   security = 'security',
//   vip = 'vip',
//   contact = 'contact',
//   referralrewards = 'referralrewards',
//   forcewithdraw = 'forcewithdraw',
// }

import {
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  RecordTabIndex,
  RouterMainKey,
  WalletSite,
  ButtonComponentsMap,
  subMenuInvest,
  RouterPath,
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

export const headerMenuEartData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'L2Assets',
      i18nKey: 'labelAssets',
    },
    router: { path: '/l2assets' },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'Invest',
      i18nKey: 'labelInvest',
    },
    router: { path: '/invest/overview' },
    status: HeaderMenuTabStatus.default,
    child: subMenuInvest,
  },
]

// export const DEFI_ADVICE_MAP = {
//   WSTETH: defiWSTETHAdvice,
//   RETH: defiRETHAdvice,
// }

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
}

export const RecordEarnMap: { [key: string]: RecordTabIndex[] } = {
  TAIKO: [RecordTabIndex.Transactions],
  ETHEREUM: [RecordTabIndex.DualRecords],
  GOERLI: [RecordTabIndex.DualRecords],
}
export enum AssetTabIndex {
  Tokens = 'Tokens',
  DualInvests = 'DualInvests',
}
export const AssetL2TabEarnIndex = {
  TAIKO: [AssetTabIndex.Tokens],
  ETHEREUM: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  GOERLI: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
  Arbitrum: [AssetTabIndex.Tokens, AssetTabIndex.DualInvests],
}
export const RouterAllowEarnIndex = {
  TAIKO: [RouterMainKey.l2assets],
  ETHEREUM: [RouterMainKey.l2assets, RouterMainKey.invest],
  GOERLI: [RouterMainKey.l2assets, RouterMainKey.invest],
}
