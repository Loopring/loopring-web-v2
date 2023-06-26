import {
  AssetsIcon,
  ContactIcon,
  ImageIcon,
  L2MyLiquidityIcon,
  MintIcon,
  ProfileIcon,
  RecordIcon,
  RewardIcon,
  // RewardIcon,
  SecurityIcon,
  VipIcon,
  WaitApproveIcon,
} from "../svg";
// import * as sdk from "@loopring-web/loopring-sdk";
import {
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  InvestAdvice,
} from "../loopring-interface";
import { AddAssetList, InvestMapType, SendAssetList } from "./trade";
import { Exchange, WalletSite } from "./setting";

export const FEED_BACK_LINK = "https://desk.zoho.com/portal/loopring/en/home";
export const headerRoot = "Landing-page";
export const SoursURL = "https://static.loopring.io/assets/";
export const LoopringIPFSSite = "ipfs.loopring.io";
export const LoopringIPFSSiteProtocol = "https";
export const IPFS_LOOPRING_URL = `${LoopringIPFSSiteProtocol}://${LoopringIPFSSite}`;
export const IPFS_HEAD_URL = "ipfs://";
export const IPFS_HEAD_URL_REG = /^ipfs:\/\/(ipfs\/)?/i;
export const IPFS_LOOPRING_SITE = "https://ipfs.loopring.io/ipfs/"; // sdk.LOOPRING_URLs.IPFS_META_URL; //`${IPFS_LOOPRING_URL}/ipfs/`;
export const BANXA_URLS = {
  1: "https://loopring.banxa.com",
  5: "https://loopring.banxa-sandbox.com",
};
export const LOOPRING_DOCUMENT = "https://loopring.io/#/document/";

//
//
export enum Layer2RouterID {
  security = "security",
  vip = "vip",
  contact = "contact",
  referralrewards = "referralrewards",
  forcewithdraw = "forcewithdraw",
}

export const Profile = {
  security: [
    {
      icon: SecurityIcon,
      router: { path: "/layer2/security" },
      label: {
        id: "security",
        i18nKey: "labelSecurity",
      },
    },
  ],
  vip: [
    {
      icon: VipIcon,
      router: { path: "/layer2/vip" },
      label: {
        id: "vip",
        i18nKey: "labelVipPanel",
      },
    },
  ],
  contact: [
    {
      icon: ContactIcon,
      router: { path: "/layer2/contact" },
      label: {
        id: "contact",
        i18nKey: "labelContactsPanel",
      },
    },
  ],
  referralrewards: [
    {
      icon: RewardIcon,
      router: { path: "/layer2/referralrewards" },
      label: {
        id: "referralrewards",
        i18nKey: "labelReferralReward",
      },
    },
  ],
};

export enum ProfileKey {
  security = "security",
  vip = "vip",
  contact = "contact",
  referralrewards = "referralrewards",
  forcewithdraw = "forcewithdraw",
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
];

export enum GuardianToolBarComponentsMap {
  Notification,
  TestNet,
  WalletConnect,
}

export const GuardianToolBarAvailableItem = [
  GuardianToolBarComponentsMap.Notification,
  GuardianToolBarComponentsMap.TestNet,
  GuardianToolBarComponentsMap.WalletConnect,
];
export let headerGuardianToolBarData: Array<{
  buttonComponent: number;
  handleClick?: (props: any) => void;
  [key: string]: any;
}> = [
  {
    buttonComponent: GuardianToolBarComponentsMap.Notification,
    label: "labelNotification",
  },
  { buttonComponent: GuardianToolBarComponentsMap.TestNet },
  {
    buttonComponent: GuardianToolBarComponentsMap.WalletConnect,
    label: "labelConnectWallet",
    accountState: undefined,
    handleClick: undefined,
  },
];

export let headerToolBarData: Array<{
  buttonComponent: number;
  handleClick?: (props: any) => void;
  [key: string]: any;
}> = [
  {
    buttonComponent: ButtonComponentsMap.Download,
    url: WalletSite,
  },
  {
    buttonComponent: ButtonComponentsMap.Notification,
    label: "labelNotification",
  },
  { buttonComponent: ButtonComponentsMap.Setting, label: "labelSetting" },
  {
    buttonComponent: ButtonComponentsMap.ProfileMenu,
    i18nDescription: "labelProfile",
    readyState: undefined,
  },
  {
    buttonComponent: ButtonComponentsMap.WalletConnect,
    label: "labelConnectWallet",
    accountState: undefined,
    handleClick: undefined,
  },
];

export const toolBarMobileAvailableItem = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.WalletConnect,
];

export enum RouterPath {
  lite = "/trade/lite",
  pro = "/trade/pro",
  stoplimit = "/trade/stoplimit",
  btrade = "/trade/btrade",
  fiat = "/trade/fiat",
  markets = "/markets",
  mining = "/mining",
  redPacket = "/redPacket",
  l2assets = "/l2assets",
  layer2 = "/layer2",
  nft = "/nft",
  invest = "/invest",
}

export enum RouterMainKey {
  lite = "lite",
  pro = "pro",
  stoplimit = "stoplimit",
  btrade = "btrade",
  fiat = "fiat",
  markets = "markets",
  mining = "mining",
  redPacket = "redPacket",
  l2assets = "l2assets",
  layer2 = "layer2",
  nft = "nft",
  invest = "invest",
}

export let layer2ItemData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: "lite",
      i18nKey: "labelClassic",
      description: "labelClassicDescription",
    },
    router: { path: RouterPath.lite + "/${pair}" },
  },
  {
    label: {
      id: "pro",
      i18nKey: "labelAdvanced",
      description: "labelAdvancedDescription",
    },
    router: { path: RouterPath.pro + "/${pair}" },
  },
  {
    label: {
      id: "stopLimit",
      i18nKey: "labelStopLimit",
      description: "labelStopLimitDescription",
    },
    router: { path: RouterPath.stoplimit + "/${pair}" },
  },
  {
    label: {
      id: "btrade",
      i18nKey: "labelBtradeTrade",
      description: "labelBtradeTradeDescription",
    },
    router: { path: RouterPath.btrade + "/${pair}" },
  },

  {
    label: {
      id: "fiat",
      i18nKey: "labelFiat",
      description: "labelFiatDescription",
    },
    router: { path: RouterPath.fiat },
  },
];

export const orderDisableList = ["Liquidity", "Markets", "Trading", "Mining"];
export const ammDisableList = ["Liquidity"];

export const headerMenuLandingData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: "Landing-page",
      i18nKey: "labelZkRollupLayer2",
    },
    router: { path: Exchange },
  },
  {
    label: {
      id: "wallet",
      i18nKey: "labelWallet",
    },
    router: { path: WalletSite },
  },
  // {
  //   label: {
  //     id: "bridge",
  //     i18nKey: "labelBridge",
  //     description: "labelBridgeDes",
  //   },
  //   router: { path: "https://loopring.io/#/" },
  // },
  // {
  //   label: {
  //     id: "guardian",
  //     i18nKey: "labelGuardian",
  //     description: "labelGuardianDes",
  //   },
  //   router: { path: "https://loopring.io/#/" },
  // },
];
export const subMenuLayer2 = {
  assetsGroup: [
    {
      icon: AssetsIcon,
      router: { path: "/l2assets/assets" },
      label: {
        id: "assets",
        i18nKey: "labelAssets",
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

export const subMenuInvest = [
  {
    icon: L2MyLiquidityIcon,
    router: { path: "/invest/overview" },
    label: {
      id: "overview",
      i18nKey: "labelInvestOverview",
      description: "labelInvestOverviewDes",
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: "/invest/ammpool" },
    label: {
      id: "ammpool",
      i18nKey: "labelInvestAmm",
      description: "labelInvestAmmDes",
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: "/invest/defi" },
    label: {
      id: "defi",
      i18nKey: "labelInvestDefi",
      description: "labelInvestDefiDes",
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: "/invest/dual" },
    label: {
      id: "dual",
      i18nKey: "labelInvestDual",
      description: "labelInvestDualDes",
    },
  },
  {
    icon: L2MyLiquidityIcon,
    router: { path: "/invest/stakelrc" },
    label: {
      id: "stackonesided",
      i18nKey: "labelInvestStakeLRC",
      description: "labelInvestStakeLRCDes",
    },
  },
];

export const subMenuNFT = {
  NFTGroup: [
    {
      icon: AssetsIcon,
      router: { path: "/nft/assetsNFT" },
      label: {
        id: "assetsNFT",
        i18nKey: "labelMyAssetsNFT",
        description: "labelMyAssetsNFTDes",
      },
    },
    {
      icon: MintIcon,
      router: { path: "/nft/mintNFTLanding" },
      label: {
        id: "mintNFT",
        i18nKey: "labelMintNFT",
        description: "labelMintNFTDes",
      },
    },
    {
      icon: ImageIcon,
      router: { path: "/nft/myCollection" },
      label: {
        id: "collection",
        i18nKey: "labelMyCollection",
        description: "labelMyCollectionDes",
      },
    },
  ],
};
export const subMenuGuardian = {
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
export const FOOTER_LIST_MAP = {
  About: [
    {
      linkName: "Org", // loopring.org
      linkHref: "https://loopring.org",
    },
    {
      linkName: "Terms", //Terms of service
      linkHref: "https://www.iubenda.com/terms-and-conditions/74969935",
    },
    {
      linkName: "Privacy", //Privacy policy
      linkHref: LOOPRING_DOCUMENT + "privacy_en.md",
    },
    {
      linkName: "Risks", //Risks Disclosure
      linkHref: LOOPRING_DOCUMENT + "risks_en.md",
    },
  ],
  Platform: [
    {
      linkName: "Fees", //Fees
      linkHref: LOOPRING_DOCUMENT + "dex_fees_en.md",
    },
    {
      linkName: "VIP", //VIP
      linkHref:
        "https://medium.loopring.io/introducing-loopring-vip-tiers-c6f73d753bac",
    },
    {
      linkName: "Referrals", //Referrals
      linkHref:
        "https://medium.loopring.io/loopring-exchange-launches-referral-program-c61777f072d1",
    },
  ],
  Support: [
    {
      linkName: "Feedback", //❤️ Submit a Request
      // linkHref: 'https://loopring.io/#/newticket'
      linkHref: FEED_BACK_LINK,
    },
    {
      linkName: "CreatorGrants", // Creator Grants
      linkHref: "https://www.loopringgrants.org/",
    },
    {
      linkName: "TokenListing",
      linkHref:
        "https://loopringexchange.typeform.com/to/T0bgsodw?typeform-source=medium.com",
    },
    {
      linkName: "Guardian",
      linkHref: "./#/guardian",
    },
  ],
  Developers: [
    {
      linkName: "SmartContract", // Smart Contract
      linkHref: LOOPRING_DOCUMENT + "contracts_en.md",
    },

    {
      linkName: "APIs", //APIs
      linkHref: "https://docs.loopring.io/en/",
    },
    {
      linkName: "L2Explorer", //Layer2 Explorer
      linkHref: "https://explorer.loopring.io",
    },
    {
      linkName: "BugBounty", //BugBounty
      linkHref: LOOPRING_DOCUMENT + "bug_bounty_en.md",
    },
    {
      linkName: "Subgraph", //Subgraph
      linkHref:
        "https://thegraph.com/explorer/subgraph?id=HgnaENC2oG5hJFsWoHvULBbj7djTJ7TZnqa58iTWA3Rd",
    },
  ],
};

export const MEDIA_LIST = [
  {
    linkName: "Discord", //color={"inherit"} fontSize={"large"}
    linkHref: "https://discord.com/invite/KkYccYp",
  },
  {
    linkName: "Twitter",
    linkHref: "https://twitter.com/loopringorg",
  },
  {
    linkName: "Youtube",
    linkHref: "https://www.youtube.com/c/Loopring",
  },
  {
    linkName: "Medium",
    linkHref: "https://medium.com/loopring-protocol",
  },
];

export const headerMenuData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: "L2Assets",
      i18nKey: "labelAssets",
    },
    router: { path: "/l2assets" },
    status: HeaderMenuTabStatus.default,
  },
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
      id: "Invest",
      i18nKey: "labelInvest",
    },
    router: { path: "/invest/overview" },
    status: HeaderMenuTabStatus.default,
    child: subMenuInvest,
  },
  {
    label: {
      id: "NFT",
      i18nKey: "labelNFT",
    },
    router: { path: "/nft" },
    status: HeaderMenuTabStatus.default,
    child: subMenuNFT,
  },
];

export const ammAdvice: InvestAdvice = {
  type: InvestMapType.AMM,
  router: "/invest/ammpool",
  banner: SoursURL + "images/icon-amm.svg",
  titleI18n: "labelInvestAmm",
  desI18n: "labelInvestAmmDes",
  notification: "",
  enable: true,
};
export const defiAdvice: InvestAdvice = {
  type: InvestMapType.STAKE,
  router: "/invest/defi",
  notification: "",
  banner: SoursURL + "images/icon-lido.svg",
  titleI18n: "labelInvestDefi",
  desI18n: "labelInvestDefiDes",
  enable: true,
};
export const defiWSTETHAdvice: InvestAdvice = {
  type: InvestMapType.STAKE,
  router: "/invest/defi/WSTETH",
  notification: "",
  banner: SoursURL + "images/icon-lido2.svg",
  titleI18n: "labelInvestWSTETH",
  desI18n: "labelInvestWSTETHDes",
  enable: true,
  project: "Lido",
  market: "WSTETH-ETH",
};
export const defiRETHAdvice: InvestAdvice = {
  type: InvestMapType.STAKE,
  router: "/invest/defi/RETH",
  notification: "",
  banner: SoursURL + "images/icon-pocket.svg",
  titleI18n: "labelInvestRETH",
  desI18n: "labelInvestRETHDes",
  enable: true,
  project: "Rocket Pool",
  market: "RETH-ETH",
};

export const DEFI_ADVICE_MAP = {
  WSTETH: defiWSTETHAdvice,
  RETH: defiRETHAdvice,
};
export const dualAdvice: InvestAdvice = {
  type: InvestMapType.DUAL,
  router: "/invest/dual",
  notification: "",
  banner: SoursURL + "images/icon-dual.svg",
  titleI18n: "labelInvestDual",
  desI18n: "labelInvestDualDes",
  enable: true,
};
export const stakeAdvice: InvestAdvice = {
  type: InvestMapType.STAKELRC,
  router: "/invest/stakelrc",
  notification: "",
  banner: SoursURL + "images/icon-stake-lrc.svg",
  titleI18n: "labelInvestStakeLRC",
  desI18n: "labelInvestStakeLRCDes",
  enable: true,
};

export enum RecordTabIndex {
  transactions = "transactions",
  trades = "trades",
  ammRecords = "ammRecords",
  orders = "orders",
  defiRecords = "defiRecords",
  dualRecords = "dualRecords",
  sideStakingRecords = "sideStakingRecords",
  btradeSwapRecords = "BtradeSwap",
  stopLimitRecords = "stopLimitRecords",
}

export const headerMenuDataMap: { [key: string]: HeaderMenuItemInterface[] } = {
  TAIKO: [
    {
      label: {
        id: "L2Assets",
        i18nKey: "labelAssets",
      },
      router: { path: "/l2assets" },
      status: HeaderMenuTabStatus.default,
    },
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
      child: [
        {
          label: {
            id: "lite",
            i18nKey: "labelClassic",
            description: "labelClassicDescription",
          },
          router: { path: RouterPath.lite + "/${pair}" },
        },
        {
          label: {
            id: "pro",
            i18nKey: "labelAdvanced",
            description: "labelAdvancedDescription",
          },
          router: { path: RouterPath.pro + "/${pair}" },
        },
      ],
    },
  ],
};

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
};
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
};

export enum AssetTabIndex {
  Tokens = "Tokens",
  Invests = "Invests",
  RedPacket = "RedPacket",
}

export const AssetL2TabIndex = {
  TAIKO: [AssetTabIndex.Tokens],
  ETHEREUM: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
  ],
  GOERLI: [
    AssetTabIndex.Tokens,
    AssetTabIndex.Invests,
    AssetTabIndex.RedPacket,
  ],
};

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
};

export const ProfileIndex = {
  TAIKO: [ProfileKey.security, ProfileKey.referralrewards],
  ETHEREUM: [
    ProfileKey.security,
    ProfileKey.vip,
    ProfileKey.contact,
    ProfileKey.referralrewards,
  ],
  GOERLI: [
    ProfileKey.security,
    ProfileKey.vip,
    ProfileKey.contact,
    ProfileKey.referralrewards,
  ],
};

export const L1L2_NAME_DEFINED = {
  TAIKO: {
    layer2: "Layer 3",
    l1ChainName: "TAIKO",
    loopringL2: "Loopring L3",
    l2Symbol: "L3",
    l1Symbol: "TAIKO",
    ethereumL1: "TAIKO",
    loopringLayer2: "Loopring Layer 3",
  },
  ETHEREUM: {
    layer2: "Layer 2",
    l1ChainName: "Ethereum",
    loopringL2: "Loopring L2",
    l2Symbol: "L2",
    l1Symbol: "L1",
    ethereumL1: "Ethereum L1",
    loopringLayer2: "Loopring Layer 2",
  },
  GOERLI: {
    layer2: "Layer 2",
    l1ChainName: "Ethereum",
    loopringL2: "Loopring L2",
    l2Symbol: "L2",
    l1Symbol: "L1",
    ethereumL1: "Ethereum L1",
    loopringLayer2: "Loopring Layer 2",
  },
};
