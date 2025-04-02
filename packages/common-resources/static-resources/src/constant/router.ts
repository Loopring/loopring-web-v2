import {
  AssetsIcon,
  ContactIcon,
  ImageIcon,
  L2MyLiquidityIcon,
  MintIcon,
  ProfileIcon,
  RewardIcon,
  SecurityIcon,
  VipIcon,
  AmmIcon,
  BlockTradeIcon,
  CreateNFTIcon,
  DualInvestIcon,
  ETHStakingIcon,
  FiatIcon,
  LRCStakingIcon,
  LeverageETHIcon,
  MyCollectionIcon,
  MyNFTIcon,
  OrderBookIcon,
  OverviewIcon,
  StopLimitIcon,
  SwapIcon,
  VaultHomeIcon,
  VaultDashboardIcon,
} from '../svg'
import { HeaderMenuItemInterface, HeaderMenuTabStatus, InvestAdvice } from '../loopring-interface'
import { AddAssetList, InvestAssetRouter, InvestMapType, SendAssetList } from './trade'
import { Earnlite, ExchangePro, WalletSite, LOOPRING_DOC, Explorer } from './setting'

export const FEED_BACK_LINK = 'https://desk.zoho.com/portal/loopring/en/home'
export const headerRoot = 'Landing-page'
export const SoursURL = 'https://static.loopring.io/assets/'
export const GUARDIAN_URL = 'https://guardian.loopring.io'
export const LoopringIPFSSite = 'ipfs.loopring.io'
export const LoopringIPFSSiteProtocol = 'https'
export const IPFS_LOOPRING_URL = `${LoopringIPFSSiteProtocol}://${LoopringIPFSSite}`
export const IPFS_HEAD_URL = 'ipfs://'
export const IPFS_HEAD_URL_REG = /^ipfs:\/\/(ipfs\/)?/i
export const IPFS_LOOPRING_SITE = 'https://ipfs.loopring.io/ipfs/' // sdk.LOOPRING_URLs.IPFS_META_URL; //`${IPFS_LOOPRING_URL}/ipfs/`;
export const BANXA_URLS = {
  1: 'https://loopring.banxa.com',
  11155111: 'https://loopring.banxa-sandbox.com',
}
export const LOOPRING_DOCUMENT = 'https://loopring.io/#/document/'

export enum RouterPath {
  trade = '/trade',
  lite = '/trade/lite',
  pro = '/trade/pro',
  stoplimit = '/trade/stoplimit',
  btrade = '/trade/btrade',
  fiat = '/trade/fiat',
  markets = '/markets',
  mining = '/mining',
  redPacket = '/redPacket',
  l2assets = '/l2assets',
  l2records = '/l2assets/history',
  l2assetsDetail = '/l2assets/assets',
  layer2 = '/layer2',
  nft = '/nft',
  invest = '/invest',
  investBalance = '/invest/balance',
  vault = '/portal',
  //404? loading
  loading = '/loading',
}

export enum InvestType {
  MyBalance = 0,
  AmmPool = 1,
  DeFi = 2,
  Overview = 3,
  Dual = 4,
  Stack = 5,
  LeverageETH = 6,
}
export const InvestRouter = [
  'balance',
  'ammpool',
  'defi',
  'overview',
  'dual',
  'stakelrc',
  'leverageETH',
]
//
//
export enum Layer2RouterID {
  security = 'security',
  vip = 'vip',
  contact = 'contact',
  referralrewards = 'referralrewards',
  forcewithdraw = 'forcewithdraw',
  notification = 'notification',
}
// export enum ProfileKey {
//   security = 'security',
//   vip = 'vip',
//   contact = 'contact',
//   referralrewards = 'referralrewards',
//   forcewithdraw = 'forcewithdraw',
//   notification = 'notification',
// }

export const Profile = {
  security: [
    {
      icon: SecurityIcon,
      router: { path: `${RouterPath.layer2}/${Layer2RouterID.security}` },
      label: {
        id: 'security',
        i18nKey: 'labelSecurity',
      },
    },
  ],
  vip: [
    {
      icon: VipIcon,
      router: { path: `${RouterPath.layer2}/${Layer2RouterID.vip}` },
      label: {
        id: 'vip',
        i18nKey: 'labelVipPanel',
      },
    },
  ],
  contact: [
    {
      icon: ContactIcon,
      router: { path: `${RouterPath.layer2}/${Layer2RouterID.contact}` },
      label: {
        id: 'contact',
        i18nKey: 'labelContactsPanel',
      },
    },
  ],
  referralrewards: [
    {
      icon: RewardIcon,
      router: { path: `${RouterPath.layer2}/${Layer2RouterID.referralrewards}` },
      label: {
        id: 'referralrewards',
        i18nKey: 'labelReferralReward',
      },
    },
  ],
}

export enum ButtonComponentsMap {
  Download = 'Download',
  Notification = 'Notification',
  Setting = 'Setting',
  ProfileMenu = 'ProfileMenu',
  WalletConnect = 'WalletConnect',
  TestNet = 'TestNet',
  ColorSwitch = 'ColorSwitch',
}

export const toolBarAvailableItem: ButtonComponentsMap[] = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.ProfileMenu,
  ButtonComponentsMap.WalletConnect,
  ButtonComponentsMap.TestNet,
]

// export enum GuardianToolBarComponentsMap {
//   Notification,
//   TestNet,
//   WalletConnect,
// }

export const GuardianToolBarAvailableItem: ButtonComponentsMap[] = [
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.TestNet,
  ButtonComponentsMap.WalletConnect,
]
export let headerGuardianToolBarData: {
  [key in ButtonComponentsMap]?: {
    buttonComponent: ButtonComponentsMap
    handleClick?: (props: any) => void
    [key: string]: any
  }
} = {
  [ButtonComponentsMap.Notification]: {
    buttonComponent: ButtonComponentsMap.Notification,
    label: 'labelNotification',
  },
  [ButtonComponentsMap.TestNet]: { buttonComponent: ButtonComponentsMap.TestNet },
  [ButtonComponentsMap.WalletConnect]: {
    buttonComponent: ButtonComponentsMap.WalletConnect,
    label: 'labelConnectWallet',
    accountState: undefined,
    handleClick: undefined,
  },
}
export let headerToolBarData: {
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

export let headerToolBarDataMobile: {
  [key in ButtonComponentsMap]?: {
    buttonComponent: ButtonComponentsMap
    handleClick?: (props: any) => void
    [key: string]: any
  }
} = {
  // [ButtonComponentsMap.Download]: {
  //   buttonComponent: ButtonComponentsMap.Download,
  //   url: WalletSite,
  // },
  // [ButtonComponentsMap.Notification]: {
  //   buttonComponent: ButtonComponentsMap.Notification,
  //   label: 'labelNotification',
  // },
  // [ButtonComponentsMap.Setting]: {
  //   buttonComponent: ButtonComponentsMap.Setting,
  //   label: 'labelSetting',
  // },
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

// export const toolBarMobileAvailableItem = [
//   ButtonComponentsMap.Download,
//   ButtonComponentsMap.Notification,
//   ButtonComponentsMap.Setting,
//   ButtonComponentsMap.WalletConnect,
// ]

export enum RouterMainKey {
  lite = 'lite',
  pro = 'pro',
  stoplimit = 'stoplimit',
  btrade = 'btrade',
  fiat = 'fiat',
  markets = 'markets',
  mining = 'mining',
  redPacket = 'redPacket',
  l2assets = 'l2assets',
  layer2 = 'layer2',
  nft = 'nft',
  invest = 'invest',
  earn = 'earn',
  vault = 'portal',
}

export enum NFTSubRouter {
  transactionNFT = 'transactionNFT',
  mintNFTLanding = 'mintNFTLanding',
  mintNFT = 'mintNFT',
  mintNFTAdvance = 'mintNFTAdvance',
  depositNFT = 'depositNFT',
  myCollection = 'myCollection',
  addCollection = 'addCollection',
  editCollection = 'editCollection',
  addLegacyCollection = 'addLegacyCollection',
  importLegacyCollection = 'importLegacyCollection',
  assetsNFT = 'assetsNFT',
}

export let layer2ItemData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'lite',
      i18nKey: 'labelClassic',
      description: 'labelClassicDescription',
      icon: SwapIcon,
    },
    router: { path: RouterPath.lite + '/${pair}' },
  },
  {
    label: {
      id: 'pro',
      i18nKey: 'labelAdvanced',
      description: 'labelAdvancedDescription',
      icon: OrderBookIcon,
    },
    router: { path: RouterPath.pro + '/${pair}' },
  },
  {
    label: {
      id: 'stopLimit',
      i18nKey: 'labelStopLimit',
      description: 'labelStopLimitDescription',
      icon: StopLimitIcon,
    },
    router: { path: RouterPath.stoplimit + '/${pair}' },
  },
  {
    label: {
      id: 'btrade',
      i18nKey: 'labelBtradeTrade',
      description: 'labelBtradeTradeDescription',
      icon: BlockTradeIcon,
    },
    router: { path: RouterPath.btrade + '/${pair}' },
  },

  {
    label: {
      id: 'fiat',
      i18nKey: 'labelFiat',
      description: 'labelFiatDescription',
      icon: FiatIcon,
    },
    router: { path: RouterPath.fiat },
  },
]

export enum VaultKey {
  VAULT_HOME = 'portalHome',
  VAULT_DASHBOARD = 'portalDashboard',
}

export let vaultItemData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: VaultKey.VAULT_HOME,
      i18nKey: 'labelVaultHome',
      description: 'labelVaultHomeDes',
      icon: VaultHomeIcon,
    },
    router: { path: RouterPath.vault + '' },
  },
  {
    label: {
      id: VaultKey.VAULT_DASHBOARD,
      i18nKey: 'labelVaultDashboard',
      description: 'labelVaultDashboardDes',
      icon: VaultDashboardIcon,
    },
    router: { path: RouterPath.vault + `/${VaultKey.VAULT_DASHBOARD}` },
  },
]

export const orderDisableList = ['Liquidity', 'Markets', 'Trading', 'Mining']
export const ammDisableList = ['Liquidity']

export const headerMenuLandingData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'loopringLite',
      i18nKey: 'labelNavEarn',
      description: 'labelNavEarnDes',
    },
    router: { path: Earnlite },
    logo: {
      dark: SoursURL + 'images/landing_page_nav_earn_dark.png',
      light: SoursURL + 'images/landing_page_nav_earn_light.png',
    }
  },
  {
    label: {
      id: 'loopringPro',
      i18nKey: 'labelNavPro',
      description: 'labelNavProDes',
    },
    router: { path: ExchangePro },
    logo: {
      dark: SoursURL + 'images/landing_page_nav_pro_dark.png',
      light: SoursURL + 'images/landing_page_nav_pro_light.png',
    }
  },
  {
    label: {
      id: 'wallet',
      i18nKey: 'labelNavWallet',
      description: 'labelNavWalletDes',
    },
    router: { path: WalletSite },
    logo: {
      dark: SoursURL + 'images/landing_page_nav_wallet_dark.png',
      light: SoursURL + 'images/landing_page_nav_wallet_light.png',
    }
  },
  {
    label: {
      id: 'doc',
      i18nKey: 'labelNavDoc',
      description: 'labelNavDocDes',
    },
    router: { path: LOOPRING_DOC },
    logo: {
      dark: SoursURL + 'images/landing_page_nav_doc_dark.png',
      light: SoursURL + 'images/landing_page_nav_doc_light.png',
    }
  },
]
export const subMenuLayer2 = {
  assetsGroup: [
    {
      icon: AssetsIcon,
      router: { path: RouterPath.l2assetsDetail },
      label: {
        id: 'assets',
        i18nKey: 'labelAssets',
      },
    },
  ],
  profileGroup: [
    {
      icon: ProfileIcon,
      router: { path: `${RouterPath.layer2}/${Layer2RouterID.security}` },
      label: {
        id: 'security',
        i18nKey: 'labelSecurity',
      },
    },
    {
      icon: VipIcon,
      router: { path: `${RouterPath.layer2}/${Layer2RouterID.vip}` },
      label: {
        id: 'vip',
        i18nKey: 'labelVipPanel',
      },
    },
  ],
}

export const subMenuInvest = [
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestRouter[InvestType.Overview]}` },
    label: {
      id: 'overview',
      i18nKey: 'labelInvestOverview',
      description: 'labelInvestOverviewDes',
      icon: OverviewIcon,
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.DUAL}` },
    label: {
      id: 'dual',
      i18nKey: 'labelInvestDual',
      description: 'labelInvestDualDes',
      icon: DualInvestIcon,
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.STAKE}` },
    label: {
      id: 'defi',
      i18nKey: 'labelInvestDefi',
      description: 'labelInvestDefiDes',
      icon: ETHStakingIcon,
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}` },
    label: {
      id: 'leverageeth',
      i18nKey: 'labelInvestLeverageETH',
      description: 'labelInvestLeverageETHDes',
      icon: LeverageETHIcon,
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.AMM}` },
    label: {
      id: 'ammpool',
      i18nKey: 'labelInvestAmm',
      description: 'labelInvestAmmDes',
      icon: AmmIcon,
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.STAKELRC}` },
    label: {
      id: 'stackonesided',
      i18nKey: 'labelInvestStakeLRC',
      description: 'labelInvestStakeLRCDes',
      icon: LRCStakingIcon,
    },
  },
]
// export enum INVEST_TAB {
//   pools = 'pools',
//   lido = 'lido',
//   staking = 'staking',
//   dual = 'dual',
//   leverageETH = 'leverageETH',
// }

export const INVEST_TABS = [
  { tab: InvestAssetRouter.DUAL, label: 'labelInvestDualTitle' },
  { tab: InvestAssetRouter.STAKE, label: 'labelInvestDefiTitle' },
  { tab: InvestAssetRouter.LEVERAGEETH, label: 'labelLeverageETHTitle' },
  { tab: InvestAssetRouter.AMM, label: 'labelLiquidityPageTitle' },
  { tab: InvestAssetRouter.STAKELRC, label: 'labelInvestLRCTitle' },
]


export const DEFI_CONFIG = {
  products: {
    TAIKOHEKLA: [] as string[],
    TAIKO: [] as string[],
    ETHEREUM: ['LIDO', 'ROCKETPOOL'],
    GOERLI: ['ROCKETPOOL'],
    SEPOLIA: ['LIDO'],
    ARBGOERLI: ['ROCKETPOOL'],
    BASE: ['LIDO'],
    BASESEPOLIA: ['LIDO'],
  },
  MARKETS: {
    TAIKOHEKLA: [] as string[],
    TAIKO: [] as string[],
    ETHEREUM: ['RETH-ETH', 'WSTETH-ETH'],
    GOERLI: ['RETH-ETH'],
    SEPOLIA: ['WSTETH-ETH'],
    ARBGOERLI: ['RETH-ETH'],
    BASE: ['WSTETH-ETH'],
    BASESEPOLIA: ['WSTETH-ETH'],
  },
}
export const LEVERAGE_ETH_CONFIG = {
  coins: {
    TAIKOHEKLA: [] as string[],
    TAIKO: [] as string[],
    ETHEREUM: ['CIETH'],
    GOERLI: ['WSTETH'],
    SEPOLIA: ['WSTETH'],
    ARBGOERLI: ['WSTETH'],
    BASE: ['WSTETH'],
    BASESEPOLIA: ['WSTETH'],
  },
  types: {
    TAIKOHEKLA: [] as string[],
    TAIKO: [] as string[],
    ETHEREUM: ['cian'],
    GOERLI: ['lido'],
    SEPOLIA: ['lido'],
    ARBGOERLI: ['lido'],
    BASE: ['lido'],
    BASESEPOLIA: ['lido'],
  },
  products: {
    TAIKOHEKLA: [] as string[],
    TAIKO: [] as string[],
    ETHEREUM: ['CIAN'],
    GOERLI: ['LIDO'],
    SEPOLIA: ['LIDO'],
    ARBGOERLI: ['LIDO'],
    BASE: ['LIDO'],
    BASESEPOLIA: ['LIDO'],
  },
  MARKETS: {
    TAIKOHEKLA: [] as string[],
    TAIKO: [] as string[],
    ETHEREUM: ['CIETH-ETH'],
    GOERLI: ['WSTETH-ETH'],
    SEPOLIA: ['WSTETH-ETH'],
    ARBGOERLI: ['WSTETH-ETH'],
    BASE: ['WSTETH-ETH'],
    BASESEPOLIA: ['WSTETH-ETH'],
  },
  // ['LIDO,ROCKETPOOL', 'CIAN'] : ['ROCKETPOOL', 'LIDO']
}

export const DUAL_CONFIG = {
  products: {
    TAIKOHEKLA: ['PIONEX'] as string[],
    TAIKO: ['PIONEX'] as string[],
    ETHEREUM: ['PIONEX'],
    GOERLI: ['PIONEX'],
    SEPOLIA: ['PIONEX'],
    ARBGOERLI: ['PIONEX'],
    BASE: ['PIONEX'],
    BASESEPOLIA: ['PIONEX'],
  },
}

export const subMenuNFT = {
  NFTGroup: [
    {
      icon: AssetsIcon,
      router: { path: `${RouterPath.nft}/${NFTSubRouter.assetsNFT}` },
      label: {
        id: 'assetsNFT',
        i18nKey: 'labelMyAssetsNFT',
        description: 'labelMyAssetsNFTDes',
        icon: MyNFTIcon,
      },
    },
    {
      icon: MintIcon,
      router: { path: `${RouterPath.nft}/${NFTSubRouter.mintNFTLanding}` },
      label: {
        id: 'mintNFT',
        i18nKey: 'labelMintNFT',
        description: 'labelMintNFTDes',
        icon: CreateNFTIcon,
      },
    },
    {
      icon: ImageIcon,
      router: { path: `${RouterPath.nft}/${NFTSubRouter.myCollection}` },
      label: {
        id: 'collection',
        i18nKey: 'labelMyCollection',
        description: 'labelMyCollectionDes',
        icon: MyCollectionIcon,
      },
    },
  ],
}
export const FOOTER_LIST_MAP = {
  About: [
    {
      linkName: 'Org', // loopring.org
      linkHref: 'https://loopring.org',
    },
    {
      linkName: 'Terms', //Terms of service
      linkHref: 'https://loopring.io/#/document/terms_en.md',
    },
    {
      linkName: 'Privacy', //Privacy policy
      linkHref: LOOPRING_DOCUMENT + 'privacy_en.md',
    },
    {
      linkName: 'Risks', //Risks Disclosure
      linkHref: LOOPRING_DOCUMENT + 'risks_en.md',
    },
  ],
  Platform: [
    {
      linkName: 'Fees', //Fees
      linkHref: LOOPRING_DOCUMENT + 'dex_fees_en.md',
    },
    {
      linkName: 'VIP', //VIP
      linkHref: 'https://medium.loopring.io/introducing-loopring-vip-tiers-c6f73d753bac',
    },
    {
      linkName: 'Referrals', //Referrals
      linkHref:
        'https://medium.loopring.io/loopring-exchange-launches-referral-program-c61777f072d1',
    },
  ],
  Support: [
    {
      linkName: 'Feedback', //❤️ Submit a Request
      linkHref: FEED_BACK_LINK,
    },
    {
      linkName: 'TokenListing',
      linkHref: 'https://loopringexchange.typeform.com/to/T0bgsodw?typeform-source=medium.com',
    },
    {
      linkName: 'Guardian',
      linkHref: GUARDIAN_URL,
    },
  ],
  Developers: [
    {
      linkName: 'SmartContract', // Smart Contract
      linkHref: LOOPRING_DOCUMENT + 'contracts_en.md',
    },

    {
      linkName: 'APIs', //APIs
      linkHref: `${LOOPRING_DOC}`,
    },
    {
      linkName: 'L2Explorer', //Layer2 Explorer
      linkHref: `${Explorer}`,
    },
    {
      linkName: 'BugBounty', //BugBounty
      linkHref: LOOPRING_DOCUMENT + 'bug_bounty_en.md',
    },
  ],
}

export const MEDIA_LIST = [
  {
    linkName: 'Discord', //color={"inherit"} fontSize={"large"}
    linkHref: 'https://discord.com/invite/KkYccYp',
  },
  {
    linkName: 'Twitter',
    linkHref: 'https://twitter.com/loopringorg',
  },
  {
    linkName: 'Youtube',
    linkHref: 'https://www.youtube.com/c/Loopring',
  },
  {
    linkName: 'Medium',
    linkHref: 'https://medium.com/loopring-protocol',
  },
]

export const headerMenuData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'home',
      i18nKey: 'labelHome',
    },
    router: { path: `/pro` },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'L2Assets',
      i18nKey: 'labelAssets',
    },
    router: { path: `${RouterPath.l2assets}` },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'Markets',
      i18nKey: 'labelMarkets',
    },
    router: { path: `${RouterPath.markets}` },
    status: HeaderMenuTabStatus.default,
  },
  {
    label: {
      id: 'Trade',
      i18nKey: 'labelTrade',
    },
    status: HeaderMenuTabStatus.default,
    child: layer2ItemData,
  },
  {
    label: {
      id: 'Invest',
      i18nKey: 'labelInvest',
    },
    router: { path: `${RouterPath.invest}/${InvestRouter[InvestType.Overview]}` },
    status: HeaderMenuTabStatus.default,
    child: subMenuInvest,
  },
  {
    label: {
      id: 'vault',
      i18nKey: 'labelVault',
      description: 'labelVaultDescription',
    },
    router: { path: `${RouterPath.vault}` },
    status: HeaderMenuTabStatus.default,
    child: vaultItemData,
  },
  {
    label: {
      id: 'NFT',
      i18nKey: 'labelNFT',
    },
    router: { path: `${RouterPath.nft}` },
    status: HeaderMenuTabStatus.default,
    child: subMenuNFT,
  },
]

export const ammAdvice: InvestAdvice = {
  type: InvestMapType.AMM,
  router: `${RouterPath.invest}/${InvestAssetRouter.AMM}`,
  banner: SoursURL + 'images/icon-amm.svg',
  titleI18n: 'labelInvestAmm',
  desI18n: 'labelInvestAmmDes',
  notification: '',
  enable: true,
}
export const defiAdvice: InvestAdvice = {
  type: InvestMapType.STAKE,
  router: `${RouterPath.invest}/${InvestAssetRouter.STAKE}`,
  notification: '',
  banner: SoursURL + 'images/icon-lido.svg',
  titleI18n: 'labelInvestDefi',
  desI18n: 'labelInvestDefiDes',
  enable: true,
}
export const defiWSTETHAdvice: InvestAdvice = {
  type: InvestMapType.STAKE,
  router: `${RouterPath.invest}/${InvestAssetRouter.STAKE}/WSTETH`,
  notification: '',
  banner: SoursURL + 'images/icon-lido2.svg',
  titleI18n: 'labelInvestWSTETH',
  desI18n: 'labelInvestWSTETHDes',
  enable: true,
  project: 'Lido',
  market: 'WSTETH-ETH',
}
export const defiRETHAdvice: InvestAdvice = {
  type: InvestMapType.STAKE,
  router: `${RouterPath.invest}/${InvestAssetRouter.STAKE}/RETH`,
  notification: '',
  banner: SoursURL + 'images/icon-pocket.svg',
  titleI18n: 'labelInvestRETH',
  desI18n: 'labelInvestRETHDes',
  enable: true,
  project: 'Rocket Pool',
  market: 'RETH-ETH',
}

export const dualAdvice: InvestAdvice = {
  type: InvestMapType.DUAL,
  router: `${RouterPath.invest}/${InvestAssetRouter.DUAL}`,
  notification: '',
  banner: SoursURL + 'images/icon-dual.svg',
  titleI18n: 'labelInvestDual',
  desI18n: 'labelInvestDualDes',
  enable: true,
}
export const stakeAdvice: InvestAdvice = {
  type: InvestMapType.STAKELRC,
  router: `${RouterPath.invest}/${InvestAssetRouter.STAKELRC}`,
  notification: '',
  banner: SoursURL + 'images/icon-stake-lrc.svg',
  titleI18n: 'labelInvestStakeLRC',
  desI18n: 'labelInvestStakeLRCDes',
  enable: true,
}
export const leverageETHAdvice: InvestAdvice = {
  type: InvestMapType.LEVERAGEETH,
  router: `${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}`,
  notification: '',
  banner: SoursURL + 'images/icon-leverage-ETH.svg',
  titleI18n: 'labelInvestLeverageETH',
  desI18n: 'labelInvestLeverageETHDes',
  enable: true,
  project: 'Leveraged ETH Staking',
  market: 'CIETH-ETH',
}
export const DEFI_ADVICE_MAP = {
  WSTETH: defiWSTETHAdvice,
  RETH: defiRETHAdvice,
  CIETH: leverageETHAdvice,
}

export enum RecordTabIndex {
  Transactions = 'Transactions',
  Trades = 'Trades',
  AmmRecords = 'AmmRecords',
  Orders = 'Orders',
  DefiRecords = 'DefiRecords',
  DualRecords = 'DualRecords',
  SideStakingRecords = 'SideStakingRecords',
  BtradeSwapRecords = 'BtradeSwapRecords',
  StopLimitRecords = 'StopLimitRecords',
  leverageETHRecords = 'leverageETHRecords',
  VaultRecords = 'VaultRecords',
  TaikoLockRecords = 'TaikoLockRecords',
}

export enum AssetTabIndex {
  Tokens = 'Tokens',
  Invests = 'Invests',
  RedPacket = 'RedPacket',
  Rewards = 'Rewards',
}

export enum RedPacketRouterIndex {
  create = 'create',
  records = 'records',
  markets = 'markets',
}
export enum RedPacketRecordsTabIndex {
  Received = 'Received',
  Send = 'Send',
  NFTReceived = 'NFTReceived',
  NFTSend = 'NFTSend',
  BlindBoxReceived = 'BlindBoxReceived',
  BlindBoxSend = 'BlindBoxSend',
  NFTsUnClaimed = 'NFTsUnClaimed',
  BlindBoxUnClaimed = 'BlindBoxUnClaimed',
}

export enum TabOrderIndex {
  orderOpenTable = 'orderOpenTable',
  orderHistoryTable = 'orderHistoryTable',
}

export const headerMenuDataMap: { [key: string]: HeaderMenuItemInterface[] } = {
  TAIKOHEKLA:[
    {
      label: {
        id: 'home',
        i18nKey: 'labelHome',
      },
      router: { path: `/pro` },
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: 'L2Assets',
        i18nKey: 'labelAssets',
      },
      router: { path: `${RouterPath.l2assets}` },
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: 'Markets',
        i18nKey: 'labelMarkets',
      },
      router: { path: `${RouterPath.markets}` },
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: 'Trade',
        i18nKey: 'labelTrade',
      },
      status: HeaderMenuTabStatus.default,
      child: [
        {
          label: {
            id: 'lite',
            i18nKey: 'labelClassic',
            description: 'labelClassicDescription',
            icon: SwapIcon,
          },
          router: { path: RouterPath.lite + '/${pair}' },
        },
        {
          label: {
            id: 'pro',
            i18nKey: 'labelAdvanced',
            description: 'labelAdvancedDescription',
            icon: OrderBookIcon,
          },
          router: { path: RouterPath.pro + '/${pair}' },
        },
        {
          label: {
            id: 'stopLimit',
            i18nKey: 'labelStopLimit',
            description: 'labelStopLimitDescription',
            icon: StopLimitIcon,
          },
          router: { path: RouterPath.stoplimit + '/${pair}' },
        },
        {
          label: {
            id: 'btrade',
            i18nKey: 'labelBtradeTrade',
            description: 'labelBtradeTradeDescription',
            icon: BlockTradeIcon,
          },
          router: { path: RouterPath.btrade + '/${pair}' },
        },
      ]
    },
    {
      label: {
        id: 'vault',
        i18nKey: 'labelVault',
        description: 'labelVaultDescription',
      },
      router: { path: `${RouterPath.vault}` },
      status: HeaderMenuTabStatus.default,
      child: vaultItemData,
    },
    {
      label: {
        id: 'Invest',
        i18nKey: 'labelInvest',
      },
      router: { path: `${RouterPath.invest}/${InvestRouter[InvestType.Overview]}` },
      status: HeaderMenuTabStatus.default,
      child: [
        // {
        //   icon: L2MyLiquidityIcon,
        //   router: { path: `${RouterPath.invest}/${InvestRouter[InvestType.Overview]}` },
        //   label: {
        //     id: 'overview',
        //     i18nKey: 'labelInvestOverview',
        //     description: 'labelInvestOverviewDes',
        //     icon: OverviewIcon,
        //   },
        // },
        {
          icon: L2MyLiquidityIcon,
          router: { path: `${RouterPath.invest}/${InvestAssetRouter.DUAL}` },
          label: {
            id: 'dual',
            i18nKey: 'labelInvestDual',
            description: 'labelInvestDualDes',
            icon: DualInvestIcon,
          },
        },
        {
          icon: L2MyLiquidityIcon,
          router: { path: `${RouterPath.invest}/${InvestAssetRouter.AMM}` },
          label: {
            id: 'ammpool',
            i18nKey: 'labelInvestAmm',
            description: 'labelInvestAmmDes',
            icon: AmmIcon,
          },
        },
      ] as HeaderMenuItemInterface[]
    },
  ],
  TAIKO:[
    {
      label: {
        id: 'home',
        i18nKey: 'labelHome',
      },
      router: { path: `/pro` },
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: 'L2Assets',
        i18nKey: 'labelAssets',
      },
      router: { path: `${RouterPath.l2assets}` },
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: 'Markets',
        i18nKey: 'labelMarkets',
      },
      router: { path: `${RouterPath.markets}` },
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: 'Trade',
        i18nKey: 'labelTrade',
      },
      status: HeaderMenuTabStatus.default,
      child: [
        {
          label: {
            id: 'lite',
            i18nKey: 'labelClassic',
            description: 'labelClassicDescription',
            icon: SwapIcon,
          },
          router: { path: RouterPath.lite + '/${pair}' },
        },
        {
          label: {
            id: 'pro',
            i18nKey: 'labelAdvanced',
            description: 'labelAdvancedDescription',
            icon: OrderBookIcon,
          },
          router: { path: RouterPath.pro + '/${pair}' },
        },
        {
          label: {
            id: 'stopLimit',
            i18nKey: 'labelStopLimit',
            description: 'labelStopLimitDescription',
            icon: StopLimitIcon,
          },
          router: { path: RouterPath.stoplimit + '/${pair}' },
        },
        {
          label: {
            id: 'btrade',
            i18nKey: 'labelBtradeTrade',
            description: 'labelBtradeTradeDescription',
            icon: BlockTradeIcon,
          },
          router: { path: RouterPath.btrade + '/${pair}' },
        },
      ]
    },
    {
      label: {
        id: 'vault',
        i18nKey: 'labelVault',
        description: 'labelVaultDescription',
      },
      router: { path: `${RouterPath.vault}` },
      status: HeaderMenuTabStatus.default,
      child: vaultItemData,
    },
    {
      label: {
        id: 'Invest',
        i18nKey: 'labelInvest',
      },
      router: { path: `${RouterPath.invest}/${InvestRouter[InvestType.Overview]}` },
      status: HeaderMenuTabStatus.default,
      child: [
        // {
        //   icon: L2MyLiquidityIcon,
        //   router: { path: `${RouterPath.invest}/${InvestRouter[InvestType.Overview]}` },
        //   label: {
        //     id: 'overview',
        //     i18nKey: 'labelInvestOverview',
        //     description: 'labelInvestOverviewDes',
        //     icon: OverviewIcon,
        //   },
        // },
        {
          icon: L2MyLiquidityIcon,
          router: { path: `${RouterPath.invest}/${InvestAssetRouter.DUAL}` },
          label: {
            id: 'dual',
            i18nKey: 'labelInvestDual',
            description: 'labelInvestDualDes',
            icon: DualInvestIcon,
          },
        },
        {
          icon: L2MyLiquidityIcon,
          router: { path: `${RouterPath.invest}/${InvestAssetRouter.AMM}` },
          label: {
            id: 'ammpool',
            i18nKey: 'labelInvestAmm',
            description: 'labelInvestAmmDes',
            icon: AmmIcon,
          },
        },
      ] as HeaderMenuItemInterface[]
    },
  ],
  ETHEREUM: headerMenuData,
  GOERLI: headerMenuData,
  SEPOLIA: headerMenuData,
  ARBGOERLI: headerMenuData,
  BASE: headerMenuData,
  BASESEPOLIA: headerMenuData,
}

export const TokenPriceBase = {
  TAIKOHEKLA: '0x931c7ada32c20b9d565cab616fe9976154e29809', 
  TAIKO: '0x07d83526730c7438048d55a4fc0b850e2aab6f0b', 
  ETHEREUM: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  GOERLI: '0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a',
  SEPOLIA: '0xa7bc5a2731803be668090125b5074555f91cbc9d',
  ARBGOERLI: '0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a',
  BASE: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  BASESEPOLIA: '0x5cc6b635bb68976e4ae3d0546ba0f20f66872a72',
}
export const RecordMap: { [key: string]: RecordTabIndex[] } = {
  TAIKOHEKLA: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
  TAIKO: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
  ETHEREUM: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
  GOERLI: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
  SEPOLIA: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
  ARBGOERLI: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
  BASE: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
  BASESEPOLIA: [
    RecordTabIndex.Transactions,
    RecordTabIndex.Trades,
    RecordTabIndex.Orders,
    RecordTabIndex.StopLimitRecords,
    RecordTabIndex.AmmRecords,
    RecordTabIndex.DefiRecords,
    RecordTabIndex.DualRecords,
    RecordTabIndex.SideStakingRecords,
    RecordTabIndex.BtradeSwapRecords,
    RecordTabIndex.leverageETHRecords,
    RecordTabIndex.VaultRecords,
  ],
}
export const AddAssetListMap = {
  TAIKOHEKLA: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
    AddAssetList.FromExchange.key,
  ],
  TAIKO: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
    AddAssetList.FromExchange.key,
  ],
  ETHEREUM: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
  ],
  GOERLI: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
  ],
  SEPOLIA: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
  ],
  ARBGOERLI: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
  ],
  BASE: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
  ],
  BASESEPOLIA: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
  ],
}
export const SendAssetListMap = {
  TAIKOHEKLA: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
  ],
  TAIKO: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
  ],
  ETHEREUM: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
    SendAssetList.SendAssetToTaikoAccount.key,
    SendAssetList.SendAssetToAnotherNet.key,
  ],
  SEPOLIA: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
    SendAssetList.SendAssetToTaikoAccount.key,
    SendAssetList.SendAssetToAnotherNet.key,
  ],
  BASE: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
    SendAssetList.SendAssetToTaikoAccount.key,
    SendAssetList.SendAssetToAnotherNet.key,
  ],
  BASESEPOLIA: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
    SendAssetList.SendAssetToTaikoAccount.key,
    SendAssetList.SendAssetToAnotherNet.key,
  ],
}
export const AssetL2TabIndex = {
  TAIKOHEKLA: [AssetTabIndex.Tokens],
  TAIKO: [AssetTabIndex.Tokens],
  ETHEREUM: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
    AssetTabIndex.Rewards,
  ],
  GOERLI: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
    AssetTabIndex.Rewards,
  ],
  SEPOLIA: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
    AssetTabIndex.Rewards,
  ],
  ARBGOERLI: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
    AssetTabIndex.Rewards,
  ],
  BASE: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
    AssetTabIndex.Rewards,
  ],
  BASESEPOLIA: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
    AssetTabIndex.Rewards,
  ],
}
export const RouterAllowIndex = {
  TAIKOHEKLA: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
    RouterMainKey.vault,
  ],
  TAIKO: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
    RouterMainKey.vault,
  ],
  ETHEREUM: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
    RouterMainKey.vault,
  ],
  GOERLI: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
    RouterMainKey.vault,
  ],
  SEPOLIA: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
    RouterMainKey.vault,
  ],
  ARBGOERLI: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
  ],
  BASE: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
    RouterMainKey.vault,
  ],
  BASESEPOLIA: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.stoplimit,
    RouterMainKey.btrade,
    RouterMainKey.fiat,
    RouterMainKey.markets,
    RouterMainKey.mining,
    RouterMainKey.redPacket,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
    RouterMainKey.nft,
    RouterMainKey.invest,
    RouterMainKey.vault,
  ],
}
export const ProfileIndex = {
  TAIKOHEKLA: [
    Layer2RouterID.security,
  ],
  TAIKO: [
    Layer2RouterID.security,
  ],
  ETHEREUM: [
    Layer2RouterID.security,
    Layer2RouterID.forcewithdraw,
    Layer2RouterID.vip,
    Layer2RouterID.contact,
    Layer2RouterID.referralrewards,
    Layer2RouterID.notification,
  ],
  GOERLI: [
    Layer2RouterID.security,
    Layer2RouterID.forcewithdraw,
    Layer2RouterID.vip,
    Layer2RouterID.contact,
    Layer2RouterID.referralrewards,
    Layer2RouterID.notification,
  ],
  SEPOLIA: [
    Layer2RouterID.security,
    Layer2RouterID.forcewithdraw,
    Layer2RouterID.vip,
    Layer2RouterID.contact,
    Layer2RouterID.referralrewards,
    Layer2RouterID.notification,
  ],
  ARBGOERLI: [
    Layer2RouterID.security,
    Layer2RouterID.forcewithdraw,
    Layer2RouterID.vip,
    Layer2RouterID.contact,
    Layer2RouterID.referralrewards,
  ],
  BASE: [
    Layer2RouterID.security,
    Layer2RouterID.forcewithdraw,
    Layer2RouterID.vip,
    Layer2RouterID.contact,
    Layer2RouterID.referralrewards,
    Layer2RouterID.notification,
  ],
  BASESEPOLIA: [
    Layer2RouterID.security,
    Layer2RouterID.forcewithdraw,
    Layer2RouterID.vip,
    Layer2RouterID.contact,
    Layer2RouterID.referralrewards,
    Layer2RouterID.notification,
  ],
}

export const L1L2_NAME_DEFINED = {
  TAIKOHEKLA: {
    layer2: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'Layer 3',
    l1ChainName: 'TAIKO HEKLA',
    loopringL2: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'Loopring L3',
    l2Symbol: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'L3',
    l1Symbol: 'TAIKO HEKLA',
    ethereumL1: 'TAIKO HEKLA',
    loopringLayer2: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'Loopring Layer 3',
    L1Token: 'ETH',
    L2Token: 'TAIKO',
  },
  TAIKO: {
    layer2: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'Layer 3',
    l1ChainName: 'TAIKO',
    loopringL2: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'Loopring L3',
    l2Symbol: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'L3',
    l1Symbol: 'TAIKO',
    ethereumL1: 'TAIKO',
    loopringLayer2: process.env.REACT_APP_NAME === 'loopring defi' ? 'Loopring DeFi' : 'Loopring Layer 3',
    L1Token: 'ETH',
    L2Token: 'TAIKO',
  },
  ETHEREUM: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
    L1Token: 'ETH',
    L2Token: 'LRC',
  },
  GOERLI: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
    L1Token: 'ETH',
    L2Token: 'LRC',
  },
  SEPOLIA: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
    L1Token: 'ETH',
    L2Token: 'LRC',
  },
  ARBGOERLI: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
    L1Token: 'ETH',
    L2Token: 'LRC',
  },
  BASE: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
    L1Token: 'ETH',
    L2Token: 'LRC',
  },
  BASESEPOLIA: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
    L1Token: 'ETH',
    L2Token: 'LRC',
  },
}
