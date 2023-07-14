import { InvestMapType, InvestOpenType } from '@loopring-web/common-resources'
import { DepartmentRow, RowInvest } from '@loopring-web/component-lib'
import { InvestTokenTypeMap, store } from '../../stores'
import { LoopringAPI } from '../../api_wrapper'

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
