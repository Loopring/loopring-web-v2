import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
  confirmation,
  findDualMarket,
  LoopringAPI,
  makeDualViewItem,
  store,
  useDualMap,
  useTokenMap,
} from '@loopring-web/core'
import React from 'react'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  DUAL_CONFIG,
  DualBTCIcon,
  DualConvertIcon,
  DualCurrentPrice,
  DualDownIcon,
  DualUpIcon,
  DualViewInfo,
  DualViewType,
  InvestAssetRouter,
  MapChainId,
  myLog,
  RouterPath,
  SagaStatus,
} from '@loopring-web/common-resources'
import { useSettings } from '@loopring-web/component-lib'

const DUALLimit = 20
export type ChooseDualTypeContentType = {
  icon: JSX.Element
  type: DualViewType
  titleKey: string
  desKey: string
}
export const ChooseDualTypeContent: ChooseDualTypeContentType[] = [
  {
    icon: (
      <DualUpIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.DualGain,
    titleKey: 'labelCoverGain',
    desKey: 'labelCoverGainDes',
  },
  {
    icon: (
      <DualDownIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.DualDip,
    titleKey: 'labelDip',
    desKey: 'labelDipDes',
  },

  {
    icon: (
      <DualConvertIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.All,
    titleKey: 'labelDualMerge',
    desKey: 'labelDualMergeDes',
  },
  {
    icon: (
      <DualBTCIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.DualBTC,
    titleKey: 'labelDualBTC',
    desKey: 'labelDualBTCDes',
  },
]
const InvestRouterMatch = `${RouterPath.invest}/${InvestAssetRouter.DUAL}/:market?`
export const useDualHook = () => {
  const match: any = useRouteMatch(InvestRouterMatch)
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const viewType = searchParams.get('viewType')
  const { defaultNetwork } = useSettings()
  const { tokenMap, idIndex } = useTokenMap()
  const {
    marketArray: _marketArray,
    tradeMap: _tradeMap,
    marketMap,
    status: dualStatus,
  } = useDualMap()
  const {
    confirmation: { confirmedDualInvestV2 },
  } = confirmation.useConfirmation()
  const history = useHistory()
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentPrice, setCurrentPrice] = React.useState<DualCurrentPrice | undefined>(undefined)
  const [, , coinA, coinB] =
    (match?.params?.market ? match.params.market : 'ETH-USDC').match(/(dual-)?(\w+)-(\w+)/i) ?? []
  const [marketArray, setMarketArray] = React.useState(_marketArray)
  const [pairASymbol, setPairASymbol] = React.useState(() =>
    _tradeMap && _tradeMap[coinA] ? coinA : 'ETH',
  )
  const [pairBSymbol, setPairBSymbol] = React.useState(
    coinB && _tradeMap && _tradeMap[pairASymbol]?.tokenList
      ? _tradeMap[pairASymbol].tokenList.includes(coinB)
        ? coinB
        : _tradeMap[pairASymbol].tokenList[0]
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
  const chooseDualTypeContent = React.useMemo(() => {
    const index = marketArray.findIndex((item) => {
      return /(\w+)-(\w+)-\w?BTC/gi.test(item)
    })
    const list = _.cloneDeep(ChooseDualTypeContent)
    if (index == -1) {
      list.pop()
    }
    return list ?? []
  }, [ChooseDualTypeContent, marketArray])

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
      if (market) {
        history.push(
          `${RouterPath.invest}/${InvestAssetRouter.DUAL}/${_pairASymbol}-${_pairBSymbol}${search}`,
        )
        const [, , coinA, coinB] = market.match(/(dual-)?(\w+)-(\w+)/i)
        setMarket(market)
        setPair(`${_pairASymbol}-${_pairBSymbol}`)
        setMarketPair([coinA, coinB])
      }
    },
    [marketArray, pairASymbol, search],
  )
  const tradeMap = React.useMemo(() => {
    const { tradeMap, marketMap } = store.getState().invest.dualMap
    const { pairs } = sdk.makeInvestMarkets(
      { markets: marketArray.length ? marketArray?.map((item) => marketMap[item]) : [] },
      DUAL_CONFIG.products[network].join(','),
    )

    const _tradeMap =
      Reflect.ownKeys(pairs ?? {})?.reduce((prev, key) => {
        const tokenList = pairs[key as string]?.tokenList?.sort()
        prev[key] = {
          ...pairs[key as string],
          tokenList,
        }
        return prev
      }, {}) ?? tradeMap

    handleOnPairChange({
      pairB:
        coinB && tradeMap && tradeMap[pairASymbol]?.tokenList
          ? tradeMap[pairASymbol].tokenList.includes(coinB)
            ? coinB
            : tradeMap[pairASymbol].tokenList[0]
          : undefined,
    })
    return _tradeMap
  }, [marketArray])
  const baseTokenList = React.useMemo(() => {
    if (dualStatus === SagaStatus.UNSET) {
      const object = Reflect.ownKeys(marketMap ?? {}).reduce(
        (prev, key) => {
          if (!marketMap[key.toString()].enabled) {
            return prev
          }
          const baseSymbol = idIndex[marketMap[key.toString()].baseTokenId]
          prev[baseSymbol] = {
            tokenName: baseSymbol,
            tokenList: tradeMap[baseSymbol]?.tokenList,
          }
          if (viewType === DualViewType.DualGain) {
            prev[baseSymbol] = {
              ...prev[baseSymbol],
            }
          } else if (viewType === DualViewType.DualDip) {
            prev[baseSymbol] = {
              ...prev[baseSymbol],
            }
          } else {
            prev[baseSymbol] = {
              ...prev[baseSymbol],
            }
          }

          return prev
        },
        {} as any,
      )
      return _.mapValues(object, (token) => {
        const keys = Object.keys(marketMap).filter((key) => key.includes(token.tokenName))
        if (viewType === DualViewType.DualGain) {            
          var maxAPY = _.max(keys.map((key) => (marketMap[key] as any).baseTokenApy?.max as number))
          var minAPY = _.max(keys.map((key) => (marketMap[key] as any).baseTokenApy?.min as number))
        } else if (viewType === DualViewType.DualDip) {
          maxAPY = _.max(keys.map((key) => (marketMap[key] as any).quoteTokenApy?.max as number))
          minAPY = _.max(keys.map((key) => (marketMap[key] as any).quoteTokenApy?.min as number))
        } else {
          maxAPY = _.max([
            ...keys.map((key) => (marketMap[key] as any).quoteTokenApy?.max as number),
            ...keys.map((key) => (marketMap[key] as any).baseTokenApy?.max as number)
          ])
          minAPY = _.max([
            ...keys.map((key) => (marketMap[key] as any).quoteTokenApy?.min as number),
            ...keys.map((key) => (marketMap[key] as any).baseTokenApy?.min as number),
          ])
        }
        return {
          ...token,
          maxAPY,
          minAPY
        }
      })
    } else {
      return {}
    }
  }, [viewType, dualStatus])
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
          dualInfo: { infos, index, balance, rules },
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
          quoteUnit: marketSymbolB,
        })

        const rule = rules[0]
        const rawData = infos.map((item: sdk.DualProductAndPrice) => {
          return makeDualViewItem(item, index, rule, pairASymbol, pairBSymbol, marketMap[market])
        })
        myLog('setDualProducts', rawData)
        setDualProducts(rawData)
        // setIsLoading(false)
      }
      // }
    }
    setIsLoading(false)
    nodeTimer.current = setTimeout(() => {
      getProduct()
    }, 60000)
  }, 100)

  const [step1SelectedToken, setStep1SelectedToken] = React.useState<string | undefined>(undefined)
  const [step2BuyOrSell, setStep2BuyOrSell] = React.useState<'Buy' | 'Sell' | undefined>(undefined)
  const [step3Token, setStep3Token] = React.useState<string | undefined>(undefined)
  const onSelectStep1Token = React.useCallback(
    (token?: string) => {
      setStep1SelectedToken(token)
      //@ts-ignore
      if (![DualViewType.DualGain, DualViewType.DualDip].includes(viewType)) {
        setStep2BuyOrSell(undefined)
      }
      setStep3Token(undefined)
    },
    [viewType],
  )

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
      history.push(`${RouterPath.invest}/${InvestAssetRouter.DUAL}/${pairA}-${pairB}${search}`)
      if (market) {
        const [, , coinA, coinB] = market ?? ''.match(/(dual-)?(\w+)-(\w+)/i)
        setMarket(market)
        setPair(`${pairA}-${pairB}`)
        setMarketPair([coinA, coinB])
      }
    },
    [step1SelectedToken, step2BuyOrSell, marketArray, tradeMap],
  )
  React.useEffect(() => {
    // const { marketArray, marketMap, tradeMap, status: dualStatus, getDualMap } = useDualMap()
    const { marketArray } = store.getState().invest.dualMap
    switch (viewType) {
      case DualViewType.DualGain:
        setStep2BuyOrSell('Sell')
        setMarketArray(marketArray)
        break
      case DualViewType.DualDip:
        setStep2BuyOrSell('Buy')
        setMarketArray(marketArray)
        break
      case DualViewType.DualBegin:
        setStep2BuyOrSell(undefined)
        setMarketArray(marketArray)
        break
      case DualViewType.DualBTC:
        setMarketArray(marketArray.filter((item) => /(\w+)-(\w+)-\w?BTC/gi.test(item)))
        setStep2BuyOrSell(undefined)
        break
      case DualViewType.All:
      default:
        setMarketArray(marketArray)
        setStep2BuyOrSell(undefined)
        break
    }
  }, [viewType, dualStatus])

  React.useEffect(() => {
    if (dualStatus === SagaStatus.UNSET && pair) {
      getProduct.cancel()
      const [_, _pairASymbol, _pairBSymbol] = pair.match(/(\w+)-(\w+)/i)
      if (marketArray !== undefined && marketArray.length) {
        const market = findDualMarket(marketArray, _pairASymbol, _pairBSymbol)
        if (market) {
          setPairASymbol(_pairASymbol)
          setPairBSymbol(_pairBSymbol)
          getProduct()
          return
        } else {
          handleOnPairChange({ pairB: _pairBSymbol })
        }
        return
      }
      history.push(`${RouterPath.invest}/${InvestAssetRouter.DUAL}/${search}`)
      myLog('update pair', pair)
    }
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }
      getProduct.cancel()
    }
  }, [pair, dualStatus])

  return {
    currentPrice,
    pairASymbol,
    pairBSymbol,
    market,
    isLoading,
    dualProducts,
    handleOnPairChange,
    marketBase,
    marketQuote,
    // priceObj,
    pair,
    step1SelectedToken,
    step2BuyOrSell,
    step3Token,
    onSelectStep1Token,
    onSelectStep2BuyOrSell,
    onSelectStep3Token,
    isDualBalanceSufficient,
    baseTokenList,
    chooseDualTypeContent,
    marketArray,
    tradeMap,
  }
}
