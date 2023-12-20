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
        id: 'L2Assets',
        i18nKey: 'labelAssets',
      },
      router: { path: '/l2assets' },
      status: HeaderMenuTabStatus.default,
    },
    {
      label: {
        id: 'Markets',
        i18nKey: 'labelMarkets',
      },
      router: { path: '/markets' },
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
}
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
}
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
}
```

#### support AssetL2 assets tab

```ts
export const AssetL2TabIndex = {
  TAIKO: [AssetTabIndex.Tokens],
  ETHEREUM: [AssetTabIndex.Tokens, AssetTabIndex.Invests, AssetTabIndex.RedPacket],
  GOERLI: [AssetTabIndex.Tokens, AssetTabIndex.Invests, AssetTabIndex.RedPacket],
}
```

#### support user Profile

```ts
export const ProfileIndex = {
  TAIKO: [Layer2RouterID.security, Layer2RouterID.referralrewards],
  ETHEREUM: [Layer2RouterID.security, Layer2RouterID.vip, Layer2RouterID.contact, Layer2RouterID.referralrewards],
  GOERLI: [Layer2RouterID.security, Layer2RouterID.vip, Layer2RouterID.contact, Layer2RouterID.referralrewards],
}
```

#### 118n key name

```ts
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
}
```

### U base token address

```ts
export const TokenPriceBase = {
  TAIKO: '0x0000000000000000000000000000000000000000',
  ETHEREUM: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  GOERLI: '0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a',
}
```

### Record history

```ts
export const RecordMap: { [ key: string ]: RecordTabIndex[] } = {
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
  ],
}

```
