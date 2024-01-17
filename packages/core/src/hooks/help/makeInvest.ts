import {
  CoinMap,
  InvestMapType,
  InvestOpenType,
  VaultMarketExtends,
} from '@loopring-web/common-resources'
import { DepartmentRow, RowInvest } from '@loopring-web/component-lib'
import { InvestTokenTypeMap, store, btradeReducer } from '../../stores'
import { LoopringAPI } from '../../api_wrapper'
import * as sdk from '@loopring-web/loopring-sdk'

export const makeInvestRow = <R extends RowInvest>(
  investTokenTypeMap: InvestTokenTypeMap,
  key: string,
): R => {
  const { coinMap } = store.getState().tokenMap
  const info = investTokenTypeMap[key].detail
  const coinInfo = coinMap[info.token.symbol]

  let item = {
    ...investTokenTypeMap[key].detail,
    coinInfo,
    i18nKey: '' as any,
    children: [],
    isExpanded: false,
    type: InvestMapType.Token,
  } as unknown as R
  const children = InvestOpenType.reduce((prev, type) => {
    if (investTokenTypeMap[key][type]) {
      let _row: any = investTokenTypeMap[key][type]
      const coinInfo = coinMap[item.token.symbol]
      _row = { ..._row, coinInfo, token: item.token }
      prev.push(_row as DepartmentRow)
    }
    return prev
  }, [] as DepartmentRow[])
  item.children = children
  return item
}

export const makeDefiInvestReward = async () => {
  const { apiKey, accountId } = store.getState().account
  if (LoopringAPI.defiAPI && apiKey && accountId) {
    // @ts-ignore
    const { totalRewards } = await LoopringAPI.defiAPI.getDefiReward({ accountId }, apiKey)
    return totalRewards ?? 0
  }
  return '0'
}

export const findDualMarket = (marketArray: string[], pairASymbol: string, pairBSymbol: string) =>
  marketArray.find((item) => {
    const regExp = new RegExp(
      `^(\\w+-)?(${pairASymbol}-${pairBSymbol}|${pairBSymbol}-${pairASymbol})$`,
      'i',
    )
    return regExp.test(item)
  })

export const makeBtrade = (btradeMarkets: any) => {
  if (btradeMarkets) {
    const {
      markets: marketMap,
      pairs,
      marketArr: marketArray,
      tokenArr: marketCoins,
    } = sdk.makeMarkets({ markets: btradeMarkets })
    const tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
      const tradePairs = pairs[key as string]?.tokenList?.sort()
      prev[key] = {
        ...pairs[key as string],
        tradePairs,
      }
      return prev
    }, {})
    if (!marketArray?.length) {
      store.dispatch(
        btradeReducer.getBtradeMapStatus({
          marketArray,
          marketCoins,
          marketMap,
          tradeMap,
        }),
      )
    }
  }
}

/**
 * @property vaultTokenAmounts.status
 *  show: bit 0
 *  join: bit 1
 *  exit: bit 2
 *  loan: bit 3
 *  repay:bit 4
 * @param vaultTokenMap
 * @param vaultMarkets
 * @param enabled
 */
export const makeVault = (
  vaultTokenMap: sdk.VaultToken[] | undefined,
  vaultMarkets: sdk.VaultMarket[] | undefined,
  enabled?: 'isFormLocal' | undefined,
) => {
  const {
    idIndex: erc20IdIndex,
    // tokenMap:erc20TokenMap
  } = store.getState().tokenMap
  if (vaultTokenMap && vaultMarkets && erc20IdIndex) {
    let { tokensMap, coinMap, idIndex, addressIndex } = sdk.makeMarket(vaultTokenMap as any)
    let erc20Array = [],
      erc20Map = {}

    const reformat: VaultMarketExtends[] = vaultMarkets.reduce((prev, ele) => {
      if (/-/gi.test(ele.market) && ele.enabled) {
        const item = {
          ...ele,
          enabled: enabled ?? ele.enabled,
          vaultMarket: ele.market,
          market: ele.market.replace(/(\w+)-(\w+)-(\w+)/, '$2-$3'),
          originalBaseSymbol: erc20IdIndex[tokensMap[idIndex[ele.baseTokenId]].tokenId],
          originalQuoteSymbol: erc20IdIndex[tokensMap[idIndex[ele.quoteTokenId]].tokenId],
        }
        prev.push(item)
        // const erc20Symbol = erc20IdIndex[tokensMap[idIndex[ele.baseTokenId]]?.tokenId]
        // @ts-ignore
        return prev
      } else {
        return prev as VaultMarketExtends[]
      }
    }, [] as VaultMarketExtends[])
    const joinTokenMap = Reflect.ownKeys(tokensMap).reduce((prev, key) => {
      const status = (
        tokensMap[key.toString()] as sdk.VaultToken
      )?.vaultTokenAmounts?.status?.toString(2)
      if (status[0] == '1' && status[1] == '1') {
        prev = {
          ...prev,
          [key]: tokensMap[key.toString()] as sdk.VaultToken,
        }
      }
      const erc20Symbol = erc20IdIndex[tokensMap[key.toString()]?.tokenId]
      // @ts-ignore
      erc20Array.push(erc20Symbol)
      erc20Map[erc20Symbol] = {
        ...tokensMap[key.toString()],
      }
      return prev
    }, {} as { [key: string]: sdk.VaultToken & sdk.TokenInfo })
    const {
      markets: marketMap,
      pairs,
      marketArr: marketArray,
      tokenArr: marketCoins,
    } = sdk.makeMarkets({ markets: reformat })
    let tokenMap: any = tokensMap
    const tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
      const tradePairs = pairs[key as string]?.tokenList?.sort()
      prev[key] = {
        ...pairs[key as string],
        tradePairs,
      }
      tokenMap[key.toString()] = {
        ...tokensMap[key.toString()],
        tradePairs: pairs[key.toString()].tokenList,
      }
      return prev
    }, {})
    const _coinMap = Reflect.ownKeys(coinMap).reduce((prev, ele) => {
      prev[ele.toString()] = {
        ...coinMap[ele.toString()],
        erc20Symbol: erc20IdIndex[tokensMap[ele.toString()].tokenId],
      }
      return prev
    }, {} as CoinMap<any, any>)
    return {
      marketArray,
      marketCoins,
      marketMap,
      tradeMap,
      coinMap: _coinMap,
      pairs,
      idIndex,
      addressIndex,
      tokenMap,
      joinTokenMap,
      erc20Array,
      erc20Map,
    }
    // }
  } else {
    return {
      marketMap: undefined,
      pairs: undefined,
      marketArray: undefined,
      marketCoins: undefined,
      tokenMap: undefined,
      coinMap: undefined,
      idIndex: undefined,
      addressIndex: undefined,
      erc20Array: undefined,
      erc20Map: undefined,
    }
  }
}
