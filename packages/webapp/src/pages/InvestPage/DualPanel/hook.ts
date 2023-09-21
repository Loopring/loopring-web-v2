import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
  confirmation,
  findDualMarket,
  LoopringAPI,
  makeDualViewItem,
  useDualMap,
  useTokenMap,
  useTokenPrices,
} from '@loopring-web/core'
import React from 'react'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  DualCurrentPrice,
  DualViewInfo,
  DualViewType,
  myLog,
  SagaStatus,
} from '@loopring-web/common-resources'
const DUALLimit = 20
export const useDualHook = ({
  setConfirmDualInvest,
  viewType,
}: {
  viewType: DualViewType | undefined
  setConfirmDualInvest: (state: undefined | string) => void
}) => {
  const match: any = useRouteMatch('/invest/dual/:market?')
  const { search } = useLocation()
  const { tokenMap, idIndex } = useTokenMap()
  const [beginnerMode, setBeginnerMode] = React.useState<boolean>(
    new URLSearchParams(search).get('beginnerMode') === 'true',
  )
  const { marketArray, marketMap, tradeMap, status: dualStatus } = useDualMap()
  const { tokenPrices } = useTokenPrices()
  const [priceObj, setPriceObj] = React.useState<{
    symbol: any
    price: any
  }>({
    symbol: undefined,
    price: undefined,
  })
  const {
    confirmation: { confirmedDualInvestV2 },
  } = confirmation.useConfirmation()
  const history = useHistory()
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  setConfirmDualInvest(confirmedDualInvestV2 ? undefined : confirmation.DualInvestConfirmType.all)
  // const { tradeMap, marketMap } = useDualMap()

  const [isLoading, setIsLoading] = React.useState(true)
  const [currentPrice, setCurrentPrice] = React.useState<DualCurrentPrice | undefined>(undefined)
  const [, , coinA, coinB] =
    (match?.params?.market ? match.params.market : 'ETH-USDC').match(/(dual-)?(\w+)-(\w+)/i) ?? []

  const [pairASymbol, setPairASymbol] = React.useState(() =>
    tradeMap && tradeMap[coinA] ? coinA : 'ETH',
  )
  const [pairBSymbol, setPairBSymbol] = React.useState(
    coinB && tradeMap && tradeMap[pairASymbol]?.tokenList
      ? tradeMap[pairASymbol].tokenList.includes(coinB)
        ? coinB
        : tradeMap[pairASymbol].tokenList[0]
      : 'USDC',
  )
  const [pair, setPair] = React.useState(`${pairASymbol}-${pairBSymbol}`)
  const [market, setMarket] = React.useState(() =>
    marketArray?.length ? findDualMarket(marketArray, pairASymbol, pairBSymbol) : '',
  )
  const [[marketBase, marketQuote], setMarketPair] = React.useState(() => {
    // @ts-ignore
    const [, , coinA, coinB] = market ? market : 'ETH-USDC'.match(/(dual-)?(\w+)-(\w+)/i) ?? []
    return [coinA, coinB]
  })
  const onToggleBeginnerMode = React.useCallback(() => {
    const searchParams = new URLSearchParams(search)
    searchParams.set('beginnerMode', beginnerMode ? 'false' : 'true')
    history.push(`${match.url}?${searchParams.toString()}`)
    setBeginnerMode(!beginnerMode)
  }, [beginnerMode])

  const handleOnPairChange = React.useCallback(
    (
      prosp:
        | {
            pairA: string
          }
        | { pairB: string },
    ) => {
      let market: any
      let _pairBSymbol: string = ''
      let _pairASymbol = pairASymbol
      if (prosp.hasOwnProperty('pairA')) {
        _pairASymbol = (prosp as any).pairA
        _pairBSymbol = tradeMap[_pairASymbol]?.tokenList[0]
        setPairASymbol(_pairASymbol)
        setPairBSymbol(_pairBSymbol)
        market = findDualMarket(marketArray, _pairASymbol, _pairBSymbol)
      } else if (prosp.hasOwnProperty('pairB')) {
        _pairBSymbol = (prosp as any).pairB
        setPairBSymbol(_pairBSymbol)
        market = findDualMarket(marketArray, _pairASymbol, _pairBSymbol)
      }
      history.push(`/invest/dual/${_pairASymbol}-${_pairBSymbol}${search}`)

      if (market) {
        const [, , coinA, coinB] = market ?? ''.match(/(dual-)?(\w+)-(\w+)/i)
        setMarket(market)
        setPair(`${_pairASymbol}-${_pairBSymbol}`)
        setMarketPair([coinA, coinB])
        setPriceObj({
          symbol: coinA,
          price: tokenPrices[coinA],
        })
      }
    },
    [marketArray, pairASymbol, tradeMap],
  )

  const [dualProducts, setDualProducts] = React.useState<DualViewInfo[]>([])
  const [isDualBalanceSufficient, setIsDualBalanceSufficient] = React.useState<boolean | undefined>(
    undefined,
  )
  // const [productRawData,setProductRawData] = React.useState([])
  const getProduct = _.debounce(async () => {
    setIsLoading(true)
    setIsDualBalanceSufficient(undefined)
    const market = marketArray && findDualMarket(marketArray, pairASymbol, pairBSymbol)
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout)
    }
    // @ts-ignore
    const currency = market ? marketMap[market]?.currency : undefined
    if (pairASymbol && pairBSymbol && market) {
      // @ts-ignore
      const [, , marketSymbolA, marketSymbolB] = (market ?? '').match(/(dual-)?(\w+)-(\w+)/i)
      const dualType =
        marketSymbolA === pairASymbol ? sdk.DUAL_TYPE.DUAL_BASE : sdk.DUAL_TYPE.DUAL_CURRENCY
      const { quoteAlias } = marketMap[market]

      const response = await LoopringAPI.defiAPI?.getDualInfos({
        baseSymbol: marketSymbolA,
        quoteSymbol: quoteAlias ?? marketSymbolB,
        currency: currency ?? '',
        dualType,
        startTime: Date.now() + 1000 * 60 * 60,
        timeSpan: 1000 * 60 * 60 * 24 * 9,
        limit: DUALLimit,
      })

      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        setDualProducts([])
      } else {
        const {
          // totalNum,
          dualInfo: { infos, index, balance },
          raw_data: { rules },
        } = response as any
        const balanceCoin = pairASymbol === 'USDC' ? 'USDT' : pairASymbol
        const found = balance.find((_balance: any) => _balance.coin === balanceCoin)
        const sellToken = tokenMap[balanceCoin]
        if (dualType === sdk.DUAL_TYPE.DUAL_BASE) {
          var minSellVol = marketMap[market].baseLimitAmount
        } else {
          minSellVol = marketMap[market].quoteLimitAmount
        }
        setIsDualBalanceSufficient(
          found && sellToken
            ? sdk
                .toBig(found.free)
                .times('1e' + sellToken.decimals)
                .isGreaterThanOrEqualTo(minSellVol)
            : undefined,
        )
        setCurrentPrice({
          base: marketSymbolA,
          quote: marketSymbolB,
          currentPrice: index.index,
          precisionForPrice: marketMap[market].precisionForPrice,
        })

        const rule = rules[0]
        const rawData = infos.map((item: sdk.DualProductAndPrice) => {
          return makeDualViewItem(item, index, rule, pairASymbol, pairBSymbol, marketMap[market])
        })
        myLog('setDualProducts', rawData)
        setDualProducts(rawData)
      }
    }
    setIsLoading(false)
    nodeTimer.current = setTimeout(() => {
      getProduct()
    }, 60000)
  }, 100)
  React.useEffect(() => {
    if (dualStatus === SagaStatus.UNSET && pairBSymbol) {
      if (marketArray !== undefined && marketArray.length) {
        handleOnPairChange({ pairB: pairBSymbol })
      } else if (marketArray?.length == 0) {
        history.push('/invest')
      }
    }
  }, [dualStatus])
  React.useEffect(() => {
    if (dualStatus === SagaStatus.UNSET && pair) {
      getProduct.cancel()
      myLog('update pair', pair)
      getProduct()
    }
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }
      getProduct.cancel()
    }
  }, [pair, dualStatus])

  const [step1SelectedToken, setStep1SelectedToken] = React.useState<string | undefined>(undefined)
  const [step2BuyOrSell, setStep2BuyOrSell] = React.useState<'Buy' | 'Sell' | undefined>(undefined)
  const [step3Token, setStep3Token] = React.useState<string | undefined>(undefined)
  const onSelectStep1Token = React.useCallback(
    (token: string) => {
      setStep1SelectedToken(token)
      if (![DualViewType.DualGain, DualViewType.DualDip].includes(viewType)) {
        setStep2BuyOrSell(undefined)
      }
      setStep3Token(undefined)
    },
    [viewType],
  )
  React.useEffect(() => {
    switch (viewType) {
      case DualViewType.DualGain:
        setStep2BuyOrSell('Buy')
        break
      case DualViewType.DualDip:
        setStep2BuyOrSell('Sell')
        break
      case DualViewType.DualBegin:
      case DualViewType.All:
      default:
        setStep2BuyOrSell(undefined)
        break
    }
  }, [viewType])
  const onSelectStep2BuyOrSell = React.useCallback((which: 'Buy' | 'Sell') => {
    setStep2BuyOrSell(which)
    setStep3Token(undefined)
  }, [])
  const onSelectStep3Token = React.useCallback(
    (which: string) => {
      setStep3Token(which)
      if (step2BuyOrSell! === 'Sell') {
        var pairA = step1SelectedToken!
        var pairB = which
      } else {
        pairA = which
        pairB = step1SelectedToken!
      }
      setPairASymbol(pairA)
      setPairBSymbol(pairB)
      const market = findDualMarket(marketArray, pairA, pairB)
      history.push(`/invest/dual/${pairA}-${pairB}${search}`)
      if (market) {
        const [, , coinA, coinB] = market ?? ''.match(/(dual-)?(\w+)-(\w+)/i)
        setMarket(market)
        setPair(`${pairA}-${pairB}`)
        setMarketPair([coinA, coinB])
        setPriceObj({
          symbol: coinA,
          price: tokenPrices[coinA],
        })
      }
    },
    [step1SelectedToken, step2BuyOrSell, marketArray, tradeMap],
  )
  const baseTokenList = Reflect.ownKeys(marketMap ?? {}).reduce(
    (prev, key) => {
      if (!marketMap[key.toString()].enabled) {
        return prev
      }
      const baskSymbol = idIndex[marketMap[key.toString()].baseTokenId]
      let sortList = [marketMap[key.toString()].apy?.replace('%', '')]
      if (prev[baskSymbol]) {
        sortList = [...sortList, prev[baskSymbol].minAPY, prev[baskSymbol].maxAPY]
        sortList.sort(
          (a, b) => Number(a.toString().replace('%', '')) - Number(b.toString().replace('%', '')),
        )
        prev[baskSymbol] = {
          ...prev[baskSymbol],
          minAPY: sortList[0],
          maxAPY: sortList[sortList.length],
        }
      } else {
        prev[baskSymbol] = {
          tokenName: baskSymbol,
          minAPY: marketMap[key.toString()].apy?.replace('%', ''),
          maxAPY: marketMap[key.toString()].apy?.replace('%', ''),
          tokenList: tradeMap[baskSymbol]?.tokenList,
        }
      }
      return prev
    },
    {} as {
      tokenName: string
      minAPY: number
      maxAPY: number
    },
  )

  return {
    // dualWrapProps: undefined,
    currentPrice,
    pairASymbol,
    pairBSymbol,
    market,
    isLoading,
    dualProducts,
    handleOnPairChange,
    marketBase,
    marketQuote,
    priceObj,
    pair,
    beginnerMode,
    onToggleBeginnerMode,
    step1SelectedToken,
    step2BuyOrSell,
    step3Token,
    onSelectStep1Token,
    onSelectStep2BuyOrSell,
    onSelectStep3Token,
    isDualBalanceSufficient,
    baseTokenList,
  }
}
