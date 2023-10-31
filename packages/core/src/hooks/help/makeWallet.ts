import { BIGO, store } from '../../index'
import { AccountStatus, CoinKey, WalletCoin, WalletMap } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export const VaultBorrowFault = 0.9

export type WalletMapExtend<C> = {
  [K in CoinKey<C>]?: WalletCoin<C> & {
    detail: sdk.UserBalanceInfo
  }
}

export const makeWalletLayer2 = <
  C extends {
    [key: string]: any
  },
>({
  needFilterZero,
  isActive = false,
  _isToL1,
}: {
  needFilterZero: boolean
  isActive?: boolean
  _isToL1?: boolean
  _isTotal?: boolean
}): {
  walletMap: WalletMapExtend<C> | undefined
} => {
  const { walletLayer2 } = store.getState().walletLayer2
  const { tokenMap } = store.getState().tokenMap
  const { readyState } = store.getState().account
  let walletMap: WalletMapExtend<C> | undefined

  if (walletLayer2) {
    walletMap = Reflect.ownKeys(walletLayer2).reduce((prev, item) => {
      const { total, locked } = walletLayer2[item as string]
      const countBig = sdk.toBig(total).minus(sdk.toBig(locked))

      if (needFilterZero && countBig.eq(BIGO)) {
        return prev
      }
      if (_isToL1 && /^LP-/gi.test(item.toString())) {
        return prev
      }

      return {
        ...prev,
        [item]: {
          belong: item,
          count: sdk.fromWEI(tokenMap, item, countBig.toString()),
          detail: walletLayer2[item as string],
        },
      }
    }, {} as WalletMapExtend<C>)
  }
  if (isActive) {
    return { walletMap }
  } else if (readyState === AccountStatus.ACTIVATED) {
    return { walletMap }
  } else {
    return { walletMap: undefined }
  }
}

export const makeVaultLayer2 = <
  C extends {
    [key: string]: any
  },
  _I = WalletCoin<C> & {
    detail: any
  },
>({
  needFilterZero,
}: // _isTotal,
{
  needFilterZero: boolean
}): {
  vaultLayer2Map: WalletMap<C> | undefined
} => {
  const { vaultAccountInfo } = store.getState().vaultLayer2
  const { tokenMap, idIndex } = store.getState().invest.vaultMap
  const { readyState } = store.getState().account
  let vaultLayer2Map: WalletMap<C> | undefined
  if (vaultAccountInfo?.userAssets) {
    vaultLayer2Map = vaultAccountInfo?.userAssets.reduce((prev, item) => {
      const vaultAsset: sdk.VaultBalance = item
      const symbol = idIndex[item.tokenId]
      const countBig = sdk.toBig(vaultAsset.total) //.minus(sdk.toBig(locked))
      if (needFilterZero && countBig.eq(BIGO)) {
        return prev
      }
      return {
        ...prev,
        [symbol]: {
          belong: symbol,
          count: sdk.fromWEI(tokenMap, symbol, countBig.toString()),
          detail: item,
        },
      }
    }, {} as WalletMap<C>)
  }
  if (readyState === AccountStatus.ACTIVATED) {
    return { vaultLayer2Map }
  } else {
    return { vaultLayer2Map: undefined }
  }
}

export const makeVaultAvaiable2 = <
  C extends {
    [key: string]: any
  },
>({
  fault = VaultBorrowFault,
}: // needFilterZero,
{
  // needFilterZero: boolean
  fault?: number
}): {
  vaultAvaiable2Map: WalletMap<C> | undefined
} => {
  const {
    vaultLayer2: { vaultAccountInfo },
    tokenMap: {
      // tokenMap: erc20TokenMap,
      idIndex: erc20IdIndex,
    },
    tokenPrices: { tokenPrices },
    invest: {
      vaultMap: { tokenMap, marketCoins, idIndex: vaultIdIndex },
    },
  } = store.getState()
  //@ts-ignore
  const { maxBorrowableOfUsd, accountStatus } = vaultAccountInfo ?? {}
  if (accountStatus && accountStatus === sdk.VaultAccountStatus.IN_STAKING) {
    let vaultAvaiable2Map: WalletMap<C> | undefined = marketCoins?.reduce((prev, item) => {
      const erc20Symbol = erc20IdIndex[tokenMap[item]?.tokenId ?? '']
      const price = tokenPrices[erc20Symbol] ?? 0
      const vaultSymbol = vaultIdIndex[tokenMap[item].vaultTokenId]
      const tokenInfo = tokenMap[vaultSymbol]
      let walletCoin = {
        erc20Symbol,
        belong: vaultSymbol,
        count: sdk
          .toBig(maxBorrowableOfUsd ?? 0)
          .div(price)
          .times(fault)
          .toFixed(tokenInfo.precision, 0),
      }
      prev[item] = {
        ...walletCoin,
      }
      return prev
    }, {} as WalletMap<C>)
    return { vaultAvaiable2Map }
  } else {
    return { vaultAvaiable2Map: undefined }
  }
}

export const makeVaultRepay = <
  C extends {
    [key: string]: any
  },
>({
  needFilterZero,
}: {
  needFilterZero: boolean
}): {
  vaultAvaiable2Map: WalletMap<C> | undefined
} => {
  const {
    vaultLayer2: { vaultAccountInfo },
    tokenMap: {
      // tokenMap: erc20TokenMap,
      idIndex: erc20IdIndex,
    },
    tokenPrices: { tokenPrices },
    invest: {
      vaultMap: { tokenMap, idIndex: vaultIdIndex },
    },
  } = store.getState()
  //@ts-ignore
  const { maxBorrowableOfUsd, accountStatus, userAssets } = vaultAccountInfo ?? {}
  if (accountStatus && accountStatus === sdk.VaultAccountStatus.IN_STAKING) {
    let vaultAvaiable2Map: WalletMap<C> | undefined = userAssets?.reduce((prev, item) => {
      const vaultSymbol = vaultIdIndex[item?.tokenId ?? '']
      const erc20Symbol = erc20IdIndex[tokenMap[vaultSymbol]?.tokenId ?? '']
      // const price = tokenPrices[erc20Symbol] ?? 0
      const vaultToken = tokenMap[vaultSymbol]
      const tokenInfo = tokenMap[vaultSymbol]
      if ((vaultSymbol && needFilterZero && sdk.toBig(item.borrowed).gt(0)) || !needFilterZero) {
        const borrowed = sdk
          .toBig(item.borrowed)
          .div('1e' + vaultToken.decimals)
          .toFixed(tokenInfo.precision, 0)
        let walletCoin = {
          erc20Symbol,
          belong: vaultSymbol,
          count: sdk
            .toBig(item.total)
            .div('1e' + vaultToken.decimals)
            .toString(),
          borrowed,
          usd: sdk.toBig(borrowed).times(tokenPrices[erc20Symbol]).toString(),
        }
        // @ts-ignore
        prev[vaultSymbol] = {
          ...walletCoin,
        }
      }

      return prev
    }, {} as WalletMap<C>)
    return { vaultAvaiable2Map }
  } else {
    return { vaultAvaiable2Map: undefined }
  }
}
