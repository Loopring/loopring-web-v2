import { BIGO, store } from '../../index'
import { AccountStatus, CoinKey, WalletCoin, WalletMap } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type WalletMapExtend<C> = {
  [K in CoinKey<C>]?: WalletCoin<C> & {
    detail: sdk.UserBalanceInfo
  }
}

export const makeWalletLayer2 = <C extends { [key: string]: any }>({
  needFilterZero,
  isActive = false,
  _isToL1,
}: {
  needFilterZero: boolean
  isActive?: boolean
  _isToL1?: boolean
  _isTotal?: boolean
}): { walletMap: WalletMapExtend<C> | undefined } => {
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

export const makeVaultLayer2 = <C extends { [key: string]: any }>({
  needFilterZero,
}: // _isTotal,
{
  needFilterZero: boolean
}): {
  vaultLayer2Map: WalletMap<C> | undefined
} => {
  const { vaultLayer2 } = store.getState().vaultLayer2
  const { tokenMap } = store.getState().invest.vaultMap
  const { readyState } = store.getState().account
  let vaultLayer2Map: WalletMap<C> | undefined
  if (vaultLayer2) {
    vaultLayer2Map = Reflect.ownKeys(vaultLayer2).reduce((prev, item) => {
      const vaultAsset: sdk.VaultBalance = vaultLayer2[item as string]
      const countBig = sdk.toBig(vaultAsset.total) //.minus(sdk.toBig(locked))
      if (needFilterZero && countBig.eq(BIGO)) {
        return prev
      }
      return {
        ...prev,
        [item]: {
          belong: item,
          count: sdk.fromWEI(tokenMap, item, countBig.toString()),
          detail: vaultLayer2[item as string],
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

export const makeVaultAvaiable2 = <C extends { [key: string]: any }>({}: // needFilterZero,
// _isTotal,
{
  needFilterZero: boolean
}): {
  vaultAvaiable2Map: WalletMap<C> | undefined
} => {
  // const { vaultLayer2 } = store.getState().vaultLayer2
  // const { tokenMap } = store.getState().invest.vaultMap
  const { readyState } = store.getState().account
  let vaultAvaiable2Map: WalletMap<C> | undefined = {}
  // if (vaultLayer2) {
  //     vaultLayer2Map = Reflect.ownKeys(vaultLayer2).reduce((prev, item) => {
  //       const vaultAsset: sdk.VaultBalance = vaultLayer2[item as string]
  //       const countBig = sdk.toBig(vaultAsset.total) //.minus(sdk.toBig(locked))
  //       if (needFilterZero && countBig.eq(BIGO)) {
  //         return prev
  //       }
  //       return {
  //         ...prev,
  //         [item]: {
  //           belong: item,
  //           count: sdk.fromWEI(tokenMap, item, countBig.toString()),
  //           detail: vaultLayer2[item as string],
  //         },
  //       }
  //     }, {} as WalletMap<C>)
  //   }
  //TODO:
  if (readyState === AccountStatus.ACTIVATED) {
    return { vaultAvaiable2Map }
  } else {
    return { vaultAvaiable2Map: undefined }
  }
}
