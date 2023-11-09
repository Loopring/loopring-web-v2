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
} from '../svg'
import { HeaderMenuItemInterface, HeaderMenuTabStatus, InvestAdvice } from '../loopring-interface'
import { AddAssetList, InvestAssetRouter, InvestMapType, SendAssetList } from './trade'
import { WalletSite } from './setting'

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
  5: 'https://loopring.banxa-sandbox.com',
}
export const LOOPRING_DOCUMENT = 'https://loopring.io/#/document/'
export const LOOPRING_DOC = 'https://docs.loopring.io'

export enum RouterPath {
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
  vault = '/vault',
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
}
export enum ProfileKey {
  security = 'security',
  vip = 'vip',
  contact = 'contact',
  referralrewards = 'referralrewards',
  forcewithdraw = 'forcewithdraw',
}

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
  Download,
  Notification,
  Setting,
  ProfileMenu,
  WalletConnect,
  TestNet,
}

export const toolBarAvailableItem: number[] = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.ProfileMenu,
  ButtonComponentsMap.WalletConnect,
  ButtonComponentsMap.TestNet,
]

export enum GuardianToolBarComponentsMap {
  Notification,
  TestNet,
  WalletConnect,
}

export const GuardianToolBarAvailableItem = [
  GuardianToolBarComponentsMap.Notification,
  GuardianToolBarComponentsMap.TestNet,
  GuardianToolBarComponentsMap.WalletConnect,
]
export let headerGuardianToolBarData: Array<{
  buttonComponent: number
  handleClick?: (props: any) => void
  [key: string]: any
}> = [
  {
    buttonComponent: GuardianToolBarComponentsMap.Notification,
    label: 'labelNotification',
  },
  { buttonComponent: GuardianToolBarComponentsMap.TestNet },
  {
    buttonComponent: GuardianToolBarComponentsMap.WalletConnect,
    label: 'labelConnectWallet',
    accountState: undefined,
    handleClick: undefined,
  },
]

export let headerToolBarData: Array<{
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

export const toolBarMobileAvailableItem = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.WalletConnect,
]

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
  vault = 'vault',
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
    },
    router: { path: RouterPath.lite + '/${pair}' },
  },
  {
    label: {
      id: 'pro',
      i18nKey: 'labelAdvanced',
      description: 'labelAdvancedDescription',
    },
    router: { path: RouterPath.pro + '/${pair}' },
  },
  {
    label: {
      id: 'stopLimit',
      i18nKey: 'labelStopLimit',
      description: 'labelStopLimitDescription',
    },
    router: { path: RouterPath.stoplimit + '/${pair}' },
  },
  {
    label: {
      id: 'btrade',
      i18nKey: 'labelBtradeTrade',
      description: 'labelBtradeTradeDescription',
    },
    router: { path: RouterPath.btrade + '/${pair}' },
  },

  {
    label: {
      id: 'fiat',
      i18nKey: 'labelFiat',
      description: 'labelFiatDescription',
    },
    router: { path: RouterPath.fiat },
  },
]

export const orderDisableList = ['Liquidity', 'Markets', 'Trading', 'Mining']
export const ammDisableList = ['Liquidity']

export const headerMenuLandingData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: 'wallet',
      i18nKey: 'labelWallet',
    },
    router: { path: WalletSite },
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
  // transactionsGroup: [
  //   {
  //     icon: L2HistoryIcon,
  //     router: { path: "/layer2/history" },
  //     label: {
  //       id: "history",
  //       i18nKey: "labelHistory",
  //     },
  //   },
  // ],
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
      router: { path: '/layer2/vip' },
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
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.DUAL}` },
    label: {
      id: 'dual',
      i18nKey: 'labelInvestDual',
      description: 'labelInvestDualDes',
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.STAKE}` },
    label: {
      id: 'defi',
      i18nKey: 'labelInvestDefi',
      description: 'labelInvestDefiDes',
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}` },
    label: {
      id: 'leverageeth',
      i18nKey: 'labelInvestLeverageETH',
      description: 'labelInvestLeverageETHDes',
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.AMM}` },
    label: {
      id: 'ammpool',
      i18nKey: 'labelInvestAmm',
      description: 'labelInvestAmmDes',
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: `${RouterPath.invest}/${InvestAssetRouter.STAKELRC}` },
    label: {
      id: 'stackonesided',
      i18nKey: 'labelInvestStakeLRC',
      description: 'labelInvestStakeLRCDes',
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
    TAIKO: [] as string[],
    ETHEREUM: ['LIDO', 'ROCKETPOOL'],
    GOERLI: ['ROCKETPOOL'],
    ARBGOERLI: ['ROCKETPOOL'],
  },
  MARKETS: {
    TAIKO: [] as string[],
    ETHEREUM: ['RETH-ETH', 'WSTETH-ETH'],
    GOERLI: ['RETH-ETH'],
    ARBGOERLI: ['RETH-ETH'],
  },
}

export const DUAL_CONFIG = {
  products: {
    TAIKO: [] as string[],
    ETHEREUM: ['PIONEX'],
    GOERLI: ['PIONEX'],
    ARBGOERLI: ['PIONEX'],
  },
}
export const LEVERAGE_ETH_CONFIG = {
  coins: {
    TAIKO: [] as string[],
    ETHEREUM: ['CIETH'],
    GOERLI: ['WSTETH'],
    ARBGOERLI: ['WSTETH'],
  },
  types: {
    TAIKO: [] as string[],
    ETHEREUM: ['cian'],
    GOERLI: ['lido'],
    ARBGOERLI: ['lido'],
  },
  products: {
    TAIKO: [] as string[],
    ETHEREUM: ['CIAN'],
    GOERLI: ['LIDO'],
    ARBGOERLI: ['LIDO'],
  },
  // ['LIDO,ROCKETPOOL', 'CIAN'] : ['ROCKETPOOL', 'LIDO']
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
      },
    },
    {
      icon: MintIcon,
      router: { path: `${RouterPath.nft}/${NFTSubRouter.mintNFTLanding}` },
      label: {
        id: 'mintNFT',
        i18nKey: 'labelMintNFT',
        description: 'labelMintNFTDes',
      },
    },
    {
      icon: ImageIcon,
      router: { path: `${RouterPath.nft}/${NFTSubRouter.myCollection}` },
      label: {
        id: 'collection',
        i18nKey: 'labelMyCollection',
        description: 'labelMyCollectionDes',
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
      linkHref: 'https://www.iubenda.com/terms-and-conditions/74969935',
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
      linkName: 'CreatorGrants', // Creator Grants
      linkHref: 'https://www.loopringgrants.org/',
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
      linkHref: 'https://explorer.loopring.io',
    },
    {
      linkName: 'BugBounty', //BugBounty
      linkHref: LOOPRING_DOCUMENT + 'bug_bounty_en.md',
    },
    {
      linkName: 'Subgraph', //Subgraph
      linkHref:
        'https://thegraph.com/explorer/subgraph?id=HgnaENC2oG5hJFsWoHvULBbj7djTJ7TZnqa58iTWA3Rd',
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

export const DEFI_ADVICE_MAP = {
  WSTETH: defiWSTETHAdvice,
  RETH: defiRETHAdvice,
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
  project: 'CIETH Pool',
  market: 'CIETH-ETH',
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
}

export enum AmmPanelType {
  Join = 0,
  Exit = 1,
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
  TAIKO: [
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
          },
          router: { path: RouterPath.lite + '/${pair}' },
        },
        {
          label: {
            id: 'pro',
            i18nKey: 'labelAdvanced',
            description: 'labelAdvancedDescription',
          },
          router: { path: RouterPath.pro + '/${pair}' },
        },
      ],
    },
  ],
  ETHEREUM: headerMenuData,
  GOERLI: headerMenuData,
  ARBGOERLI: headerMenuData,
}

export const TokenPriceBase = {
  TAIKO: '0x0000000000000000000000000000000000000000',
  ETHEREUM: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  GOERLI: '0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a',
  ARBGOERLI: '0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a',
}
export const RecordMap: { [key: string]: RecordTabIndex[] } = {
  TAIKO: [RecordTabIndex.Transactions, RecordTabIndex.Trades, RecordTabIndex.Orders],
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
  ],
}

export const AddAssetListMap = {
  TAIKO: [
    AddAssetList.FromMyL1.key,
    AddAssetList.FromOtherL2.key,
    // AddAssetList.FromExchange.key,
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
  ARBGOERLI: [
    AddAssetList.FromMyL1.key,
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromOtherL2.key,
    AddAssetList.FromOtherL1.key,
    AddAssetList.FromExchange.key,
    AddAssetList.FromAnotherNet.key,
  ],
}
export const SendAssetListMap = {
  TAIKO: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
  ],
  ETHEREUM: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
    SendAssetList.SendAssetToAnotherNet.key,
  ],
  GOERLI: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
    SendAssetList.SendAssetToAnotherNet.key,
  ],
  ARBGOERLI: [
    SendAssetList.SendAssetToMyL1.key,
    SendAssetList.SendAssetToL2.key,
    SendAssetList.SendAssetToOtherL1.key,
    SendAssetList.SendAssetToAnotherNet.key,
  ],
}
export const AssetL2TabIndex = {
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
  ARBGOERLI: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
    AssetTabIndex.Rewards,
  ],
}
export const RouterAllowIndex = {
  TAIKO: [
    RouterMainKey.lite,
    RouterMainKey.pro,
    RouterMainKey.markets,
    RouterMainKey.l2assets,
    RouterMainKey.layer2,
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
}

export const ProfileIndex = {
  TAIKO: [ProfileKey.security, ProfileKey.referralrewards],
  ETHEREUM: [
    ProfileKey.security,
    ProfileKey.forcewithdraw,
    ProfileKey.vip,
    ProfileKey.contact,
    ProfileKey.referralrewards,
  ],
  GOERLI: [
    ProfileKey.security,
    ProfileKey.forcewithdraw,
    ProfileKey.vip,
    ProfileKey.contact,
    ProfileKey.referralrewards,
  ],
  ARBGOERLI: [
    ProfileKey.security,
    ProfileKey.forcewithdraw,
    ProfileKey.vip,
    ProfileKey.contact,
    ProfileKey.referralrewards,
  ],
}

export const L1L2_NAME_DEFINED = {
  TAIKO: {
    layer2: 'Layer 3',
    l1ChainName: 'TAIKO',
    loopringL2: 'Loopring L3',
    l2Symbol: 'L3',
    l1Symbol: 'TAIKO',
    ethereumL1: 'TAIKO',
    loopringLayer2: 'Loopring Layer 3',
  },
  ETHEREUM: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
  },
  GOERLI: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
  },
  ARBGOERLI: {
    layer2: 'Layer 2',
    l1ChainName: 'Ethereum',
    loopringL2: 'Loopring L2',
    l2Symbol: 'L2',
    l1Symbol: 'L1',
    ethereumL1: 'Ethereum L1',
    loopringLayer2: 'Loopring Layer 2',
  },
}
