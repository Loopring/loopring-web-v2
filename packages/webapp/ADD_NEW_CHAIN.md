# Way to add a new Chain

### step1:

.env.production

```.env
## part1 for connection  
# support chainId list eg:REACT_APP_RPC_OTHERS=167005,12345
REACT_APP_RPC_OTHERS=167005
# RPC URL for support chain eg:REACT_APP_RPC_URL_167005=https://rpc.test.taiko.xyz/
REACT_APP_RPC_URL_167005=https://rpc.test.taiko.xyz/
# Chian Name for show(if test use `|` split) eg:REACT_APP_RPC_CHAINNAME_167005=Taiko|test 
REACT_APP_RPC_CHAINNAME_167005=Taiko|test

## part2 for Dex & API  
# DEX API URL for chain eg: REACT_APP_API_URL_167005=taikodev.loopring.io
REACT_APP_API_URL_167005=taikodev.loopring.io
```

### step2: UI/View config

packages/common-resources/static-resources/src/constant/router.ts

#### navigation

```ts
export const headerMenuDataMap: { [ key: string ]: HeaderMenuItemInterface[] } = {
  TAIKO: [
    {
      label: {
        id: "L2Assets",
        i18nKey: "labelAssets",
      },
      router: {path: "/l2assets"},
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: "Markets",
        i18nKey: "labelMarkets",
      },
      router: {path: "/markets"},
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
          router: {path: RouterPath.lite + "/${pair}"},
        },
        {
          label: {
            id: "pro",
            i18nKey: "labelAdvanced",
            description: "labelAdvancedDescription",
          },
          router: {path: RouterPath.pro + "/${pair}"},
        },
      ],
    },
  ],
};
```

#### avaiable land page

```ts
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
```      

#### support send/receive assets way

```ts
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
```

#### support AssetL2 assets tab

```ts
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
```

#### support user Profile

```ts
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
```

#### 118n key name

```ts
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
```


