import {
  AssetsIcon,
  ImageIcon,
  L2MyLiquidityIcon,
  MintIcon,
  ProfileIcon,
  RecordIcon,
  SecurityIcon,
  VipIcon,
  WaitApproveIcon,
} from "../svg";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  InvestAdvice,
} from "../loopring-interface";
import { InvestMapType } from "./trade";

export const FEED_BACK_LINK = "https://desk.zoho.com/portal/loopring/en/home";
export const headerRoot = "Landing-page";
export const SoursURL = "https://static.loopring.io/assets/";
export const LoopringIPFSSite = "d1vjs0p75nt8te.cloudfront.net";
export const LoopringIPFSSiteProtocol = "https";
export const IPFS_LOOPRING_URL = `${LoopringIPFSSiteProtocol}://${LoopringIPFSSite}`;
export const IPFS_LOOPRING_SITE = sdk.LOOPRING_URLs.IPFS_META_URL; //`${IPFS_LOOPRING_URL}/ipfs/`;

export const profile = {
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
};

export enum ButtonComponentsMap {
  Download,
  Notification,
  Setting,
  ProfileMenu,
  WalletConnect,
}

export const toolBarAvailableItem = [
  ButtonComponentsMap.Download,
  ButtonComponentsMap.Notification,
  ButtonComponentsMap.Setting,
  ButtonComponentsMap.ProfileMenu,
  ButtonComponentsMap.WalletConnect,
];

export let headerToolBarData: Array<{
  buttonComponent: number;
  handleClick?: (props: any) => void;
  [key: string]: any;
}> = [
  {
    buttonComponent: ButtonComponentsMap.Download,
    url: "https://loopring.io/#/wallet",
    i18nTitle: "labelDownloadAppTitle",
    // handleClick: undefined,
    // i18nDescription: "labelDownloadBtn",
  },
  {
    buttonComponent: ButtonComponentsMap.Notification,
    label: "labelNotification",
  },
  { buttonComponent: ButtonComponentsMap.Setting, label: "labelSetting" },
  {
    buttonComponent: ButtonComponentsMap.ProfileMenu,
    i18nDescription: "labelProfile",
    subMenu: profile,
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

export let layer2ItemData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: "Classic",
      i18nKey: "labelClassic",
      description: "labelClassicDescription",
    },
    router: { path: "/trade/lite/${pair}" },
  },
  {
    label: {
      id: "Advanced",
      i18nKey: "labelAdvanced",
      description: "labelAdvancedDescription",
    },
    router: { path: "/trade/pro/${pair}" },
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

export const headerMenuLandingData: Array<HeaderMenuItemInterface> = [
  {
    label: {
      id: "Landing-page",
      i18nKey: "labelZkRollupLayer2",
    },
    router: { path: "/" },
  },
  {
    label: {
      id: "wallet",
      i18nKey: "labelWallet",
    },
    router: { path: "/wallet" },
  },
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
    router: { path: "/invest" },
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
      linkHref: "https://loopring.io/#/document/privacy_en.md",
    },
    {
      linkName: "Risks", //Risks Disclosure
      linkHref: "https://loopring.io/#/document/risks_en.md",
    },
  ],
  Platform: [
    {
      linkName: "Fees", //Fees
      linkHref: "https://loopring.io/#/document/dex_fees_en.md",
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
      linkHref: "https://loopring.io/#/document/contracts_en.md",
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
    router: { path: "/invest" },
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
  banner: SoursURL + "images/icon-amm.png",
  titleI18n: "labelInvestAmm",
  desI18n: "labelInvestAmmDes",
  notification: "",
  enable: true,
};
export const defiAdvice: InvestAdvice = {
  type: InvestMapType.STAKE,
  router: "/invest/defi",
  notification: "",
  banner: SoursURL + "images/icon-lido.png",
  titleI18n: "labelInvestDefi",
  desI18n: "labelInvestDefiDes",
  enable: true,
};
