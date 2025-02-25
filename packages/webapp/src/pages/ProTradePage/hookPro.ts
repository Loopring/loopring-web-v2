import React from 'react'
import {
  AccountStatus,
  CoinMap,
  MarketType,
  myLog,
  PrecisionTree,
  RouterPath,
  SagaStatus,
  WalletMap,
} from '@loopring-web/common-resources'

import {
  makeWalletLayer2,
  marketInitCheck,
  store,
  useAccount,
  useAmount,
  usePageTradePro,
  usePairMatch,
  useTokenMap,
  useWalletLayer2,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'
// import { useOrderList } from './panel/orderTable/hookTable'
import { useProSocket, useSocketProService } from './proService'
import { useHistory } from 'react-router-dom'
import { useGetAssets } from '../AssetPage/AssetPanel/hook'
import { useOrderList } from '../AssetPage'

export const usePro = <C extends { [key: string]: any }>({
  path = '/trade/pro',
}: {
  path?: string
}): {
  [key: string]: any
  market: MarketType | undefined
  resetTradeCalcData: (props: { tradeData?: any; market: MarketType | string }) => void
  // marketTicker: MarketBlockProps<C> |undefined,
} => {
  //High: No not Move!!!!!!
  let { realMarket } = usePairMatch({ path })
  const history = useHistory()
  const { updatePageTradePro } = usePageTradePro()
  const [market, setMarket] = React.useState<MarketType>(realMarket as MarketType)
  const { getAmount } = useAmount()
  const { account, status: accountStatus } = useAccount()
  const { status: walletLayer2Status } = useWalletLayer2()
  const { assetBtnStatus } = useGetAssets()
  const { getOrderList } = useOrderList({ isOrderBookScroll: true })
  const { coinMap, tokenMap, marketArray, marketCoins, marketMap } = useTokenMap()
  useProSocket({ market })
  React.useEffect(() => {
    myLog('account.status', accountStatus, account.readyState)
    if (account.readyState !== AccountStatus.ACTIVATED && accountStatus === SagaStatus.UNSET) {
      userInfoUpdateCallback()
    }
  }, [accountStatus])
  const updateWalletLayer2Balance = React.useCallback(
    (_tradeCalcProData?, _market?: MarketType) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
      const account = store.getState().account
      // @ts-ignore
      let tradeCalcProData = _tradeCalcProData ? _tradeCalcProData : pageTradePro.tradeCalcProData
      let market: MarketType = _market ? _market : pageTradePro.market
      let walletMap: WalletMap<any> | undefined
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2({ needFilterZero: false }).walletMap ?? {}
      }
      tradeCalcProData = {
        ...pageTradePro.tradeCalcProData,
        ...tradeCalcProData,
        walletMap,
        priceImpact: '',
        priceImpactColor: 'inherit',
        minimumReceived: '',
      }
      updatePageTradePro({ market, tradeCalcProData })
    },
    [market, walletLayer2Status],
  )

  const userInfoUpdateCallback = React.useCallback(() => {
    updateWalletLayer2Balance()
    getOrderList({})
  }, [updateWalletLayer2Balance, getOrderList])

  useSocketProService({
    market,
    userInfoUpdateCallback,
  })
  React.useEffect(() => {
    resetTradeCalcData({ market })
    precisionList(market)
  }, [market, account.readyState])

  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED && accountStatus === SagaStatus.UNSET) {
      getAmount({ market })
    }
  }, [market, accountStatus, account.readyState])

  const handleOnMarketChange = React.useCallback(async (newMarket: MarketType) => {
    setMarket(newMarket)
    history.push(`${path}/${newMarket}`)
  }, [])

  const precisionList = React.useCallback((market: MarketType) => {
    const precisionForPrice = marketMap[market]?.precisionForPrice
    const orderbookAggLevels = marketMap[market]?.orderbookAggLevels
    let precisionLevels: { value: number; label: string }[] = []
    for (let i = 0; i < orderbookAggLevels; i++) {
      if (PrecisionTree[precisionForPrice - i]) {
        precisionLevels.push({
          value: precisionForPrice - i,
          label: PrecisionTree[precisionForPrice - i],
        })
      }
    }
    updatePageTradePro({
      market,
      precisionLevels: precisionLevels,
      depthLevel: precisionForPrice,
    })
  }, [])

  const resetTradeCalcData = React.useCallback(
    (props: { tradeData?: any; market: MarketType | string }) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
      if (coinMap && tokenMap && marketMap && marketArray) {
        const { tradePair } = marketInitCheck({
          market: props.market as string,
        })
        // @ts-ignore
        let [, coinA, coinB] = tradePair.match(/([\w]+)-([\w]+)/i)
        let { market: _market } = sdk.getExistedMarket(marketArray, coinA, coinB)
        if (_market !== market) {
          setMarket(_market)
          history.push(`${RouterPath.pro}/${_market}`)
        }
        // @ts-ignore
        ;[, coinA, coinB] = _market?.match(/([\w]+)-([\w]+)/i)
        let tradeCalcProData = pageTradePro.tradeCalcProData
        tradeCalcProData = {
          ...tradeCalcProData,
          coinBase: coinA,
          coinQuote: coinB,
          fee: undefined,
          minimumReceived: undefined,
          priceImpact: undefined,
          priceImpactColor: 'inherit',
          coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
            return { ...prev, [item]: coinMap ? coinMap[item] : {} }
          }, {} as CoinMap<C>),
        }
        updateWalletLayer2Balance(tradeCalcProData, _market)
      }
    },
    [coinMap, tokenMap, marketMap, marketArray, market],
  )
  return {
    market,
    assetBtnStatus,
    handleOnMarketChange,
    resetTradeCalcData,
  }
}
