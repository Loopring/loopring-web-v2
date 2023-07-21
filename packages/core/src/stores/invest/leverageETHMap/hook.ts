import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { LeverageETHMap, RootState, useTokenMap } from '../../index'
import { updateLeverageETHMap } from './reducer'
import { LeverageETHMapStates } from './interface'
import { pickBy, toArray } from 'lodash'
import { LoopringAPI } from '../../../api_wrapper'

export const useLeverageETHMap = (): LeverageETHMapStates & {
  updateLeverageETHMap: (props: { leverageETHMap: LeverageETHMap }) => void
} => {
  const leverageETHMap: LeverageETHMapStates = useSelector(
    (state: RootState) => state.invest.leverageETHMap,
  )
  const dispatch = useDispatch()
  const {idIndex} = useTokenMap()
  React.useEffect(() => {
    ;(async () => {
      const response = await LoopringAPI.defiAPI?.getDefiMarkets({})
      if (response) {
        const arr = toArray(response?.markets)
        // @ts-ignore
        const marketArr = arr.filter(market => market.extra && market.extra.isLeverage).map(market => market.market)
        // @ts-ignore
        const tokenArr = arr.filter(market => market.extra && market.extra.isLeverage).map(market => idIndex[market.baseTokenId])
        // @ts-ignore
        const marketMap = pickBy(response?.markets, (market) => market.extra && market.extra.isLeverage)
        dispatch(
          updateLeverageETHMap({
            leverageETHMap: {
              marketArray: marketArr,
              marketCoins: tokenArr,
              marketMap: marketMap,
            },
          })
        )
      }
    })()
  }, [])
  return {
    ...leverageETHMap,
    updateLeverageETHMap: React.useCallback(
      ({ leverageETHMap }: { leverageETHMap: LeverageETHMap }) =>
        dispatch(updateLeverageETHMap({ leverageETHMap: leverageETHMap })),
      [dispatch],
    ),
  }
}
