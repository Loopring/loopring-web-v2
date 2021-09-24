import React from 'react'

import * as sdk from 'loopring-sdk'

import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS } from 'defs/common_defs';
import { useAccount } from 'stores/account';
import { useTokenMap } from 'stores/token';
import { useSystem } from 'stores/system';
import { useAmmMap } from 'stores/Amm/AmmMap';
import { myLog } from '@loopring-web/common-resources';
import store from 'stores'

export interface ReqParams {
    isBuy?: boolean,

    price?: number,
    amountBase?: number,
    amountQuote?: number,
    base?: string,
    quote?: string,
    market?: string,

    tokenMap?: sdk.LoopringMap<sdk.TokenInfo>,
    marketArray?: string[],
    marketMap?: any,

    exchangeAddress?: string,
    accountId?: number,
    storageId?: number,

    feeBips?: string,

    // key is ETH or USDT
    tokenAmtMap?: { [ key: string ]: sdk.TokenAmount },

    ammPoolSnapshot?: sdk.AmmPoolSnapshot,
    depth?: sdk.DepthData,
    slippage?: string,
}

export function makeMarketReq({
                                  isBuy,

                                  amountBase,
                                  amountQuote,
                                  base,
                                  quote,

                                  tokenMap,
                                  marketArray,
                                  marketMap,

                                  exchangeAddress,
                                  accountId,
                                  storageId,

                                  feeBips,
                                  tokenAmtMap,

                                  depth,
                                  ammPoolSnapshot,
                                  slippage,
                              }: ReqParams) {

    if (!tokenMap || !exchangeAddress || !marketArray
        || accountId === undefined || !base || !quote || (!depth && !ammPoolSnapshot)) {
        return {
            calcTradeParams: undefined,
            marketRequest: undefined,
        }
    }

    if (isBuy === undefined) {
        isBuy = true
    }

    if (feeBips === undefined) {
        feeBips = '0'
    }

    if (!storageId) {
        storageId = 0
    }

    const baseTokenInfo = tokenMap[ base ]
    const quoteTokenInfo = tokenMap[ quote ]

    const sellTokenInfo = isBuy ? quoteTokenInfo : baseTokenInfo
    const buyTokenInfo = isBuy ? baseTokenInfo : quoteTokenInfo

    const input = (amountBase !== undefined ? amountBase : amountQuote !== undefined ? amountQuote : '')?.toString()

    const sell = sellTokenInfo.symbol
    const buy = buyTokenInfo.symbol

    // buy. amountSell is not null.
    const isAtoB = (isBuy && amountQuote !== undefined) || (!isBuy && amountBase !== undefined)

    const takerRate = (tokenAmtMap && tokenAmtMap[ buyTokenInfo.symbol ]) ? tokenAmtMap[ buyTokenInfo.symbol ].userOrderInfo.takerRate : 0

    // myLog('makeMarketReq isBuy:', isBuy, ' sell:', sell, ' buy:', buy, ' isAtoB:', isAtoB, ' feeBips:', feeBips, ' takerRate:', takerRate)

    const maxFeeBips = parseInt(sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString())

    const calcTradeParams = sdk.getOutputAmount({
        input,
        sell,
        buy,
        isAtoB,
        marketArr: marketArray,
        tokenMap: tokenMap as any,
        marketMap: marketMap as any,
        depth: depth as sdk.DepthData,
        ammPoolSnapshot: ammPoolSnapshot,
        feeBips: feeBips ? feeBips.toString() : '0',
        takerRate: takerRate ? takerRate.toString() : '0',
        slipBips: slippage as string
    })

    myLog('makeMarketReq calcTradeParams:', calcTradeParams)

    const tradeChannel = calcTradeParams ? (calcTradeParams.exceedDepth ? sdk.TradeChannel.BLANK : sdk.TradeChannel.MIXED) : undefined
    const orderType = calcTradeParams ? (calcTradeParams.exceedDepth ? sdk.OrderType.ClassAmm : sdk.OrderType.TakerOnly) : undefined

    const sellTokenVol3: sdk.TokenVolumeV3 = {
        tokenId: sellTokenInfo.tokenId,
        volume: calcTradeParams?.amountS as string
    }

    const buyTokenVol3: sdk.TokenVolumeV3 = {
        tokenId: buyTokenInfo.tokenId,
        volume: calcTradeParams?.amountBOutSlip.minReceived as string
    }

    const marketRequest: sdk.SubmitOrderRequestV3 = {
        exchange: exchangeAddress,
        accountId,
        storageId,
        sellToken: sellTokenVol3,
        buyToken: buyTokenVol3,
        allOrNone: false,
        validUntil: getTimestampDaysLater(DAYS),
        maxFeeBips,
        fillAmountBOrS: false, // amm only false
        orderType,
        tradeChannel,
        eddsaSignature: '',
    }

    return {
        calcTradeParams,
        marketRequest,
    }
}

export function makeLimitReq({
                                 isBuy,

                                 depth,
                                 price,
                                 amountBase,
                                 amountQuote,
                                 base,
                                 quote,
                                 tokenMap,

                                 exchangeAddress,
                                 accountId,
                                 storageId,

                                 feeBips,
                                 tokenAmtMap,
                             }: ReqParams): {
    calcTradeParams: undefined | { [ key: string ]: any },
    limitRequest: undefined | { [ key: string ]: any },
} {

    if (!tokenMap || !exchangeAddress || !depth
        || accountId === undefined || !base || !quote || (!amountBase && !amountQuote)) {
        myLog('got empty input!')
        return {
            calcTradeParams: undefined,
            limitRequest: undefined,
        }
    }

    if (price === undefined) {
        price = 0
    }

    if (isBuy === undefined) {
        isBuy = true
    }

    if (feeBips === undefined) {
        feeBips = '0'
    }

    if (!storageId) {
        storageId = 0
    }

    const baseTokenInfo = tokenMap[ base ]
    const quoteTokenInfo = tokenMap[ quote ]

    let baseVol = undefined
    let quoteVol = undefined

    let baseVolShow = undefined
    let quoteVolShow = undefined

    if (amountBase !== undefined) {
        baseVolShow = amountBase
        baseVol = sdk.toBig(baseVolShow).times('1e' + baseTokenInfo.decimals)
        quoteVolShow = sdk.toBig(amountBase).times(sdk.toBig(price)).toFixed(quoteTokenInfo.precision)
        quoteVol = sdk.toBig(amountBase).times(sdk.toBig(price)).times('1e' + quoteTokenInfo.decimals)
    } else if (amountQuote !== undefined) {
        baseVolShow = sdk.toBig(amountQuote).div(sdk.toBig(price)).toFixed(baseTokenInfo.precision)
        baseVol = sdk.toBig(amountQuote).div(sdk.toBig(price)).times('1e' + baseTokenInfo.decimals)
        quoteVolShow = amountQuote
        quoteVol = sdk.toBig(amountQuote).times('1e' + quoteTokenInfo.decimals)
    } else {
        throw Error('no amount info!')
    }

    const baseTokenVol3: sdk.TokenVolumeV3 = {
        tokenId: baseTokenInfo.tokenId,
        volume: baseVol.toString()
    }

    const quoteTokenVol3: sdk.TokenVolumeV3 = {
        tokenId: quoteTokenInfo.tokenId,
        volume: quoteVol.toString()
    }

    const takerRate = (tokenAmtMap && tokenAmtMap[ baseTokenInfo.symbol ]) ? tokenAmtMap[ baseTokenInfo.symbol ].userOrderInfo.takerRate : 0

    const maxFeeBips = parseInt(sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString())

    const limitRequest: sdk.SubmitOrderRequestV3 = {
        exchange: exchangeAddress,
        accountId,
        storageId,
        sellToken: isBuy ? quoteTokenVol3 : baseTokenVol3,
        buyToken: isBuy ? baseTokenVol3 : quoteTokenVol3,
        allOrNone: false,
        validUntil: getTimestampDaysLater(DAYS),
        maxFeeBips,
        fillAmountBOrS: false, // amm only false
        orderType: sdk.OrderType.LimitOrder,
        tradeChannel: sdk.TradeChannel.MIXED,
        eddsaSignature: '',
    }

    let priceImpact = 0

    const ask1 = depth.asks_prices[ 0 ]
    const bid1 = depth.bids_prices[ depth.bids_prices.length - 1 ]

    if (isBuy && ask1 && price > ask1) {
        priceImpact = (price - ask1) / ask1
    } else if (!isBuy && bid1 && price < bid1) {
        priceImpact = (bid1 - price) / bid1
    }

    const calcTradeParams = {
        isBuy,
        priceImpact,
        baseVol: baseVol.toString(),
        baseVolShow,
        quoteVol: quoteVol.toString(),
        quoteVolShow,
    }

    return {
        calcTradeParams,
        limitRequest,
    }
}

//price = USDTVol / ETHVol

//buy eth(base). ETH-USDT reversed. sell:usdt buy:eth   calc: usdt<-eth/isAtoB=false
// fee(buyToken) -> eth(base)
// percentage -> change quote vol
export function makeMarketBuyReq() {
}

//sell eth(base). ETH-USDT. sell:eth buy:usdt   calc: eth->usdt/isAtoB=true
// fee(buytoken) -> usdt(quote)
// percentage -> change base vol
export function makeMarketSellReq() {
}

export function usePlaceOrder() {

    const {account} = useAccount()

    const {tokenMap, marketArray,} = useTokenMap()
    const {ammMap} = useAmmMap()


    const {exchangeInfo,} = useSystem()

    const getTokenAmtMap = React.useCallback((params: ReqParams) => {
        const {amountMap} = store.getState().amountMap
        if (ammMap && marketArray && amountMap) {
            let base = params.base

            let quote = params.quote

            let market = params.market

            let ammMarket = ''

            if (params.market) {

                const result = params.market.match(/([\w,#]+)-([\w,#]+)/i)

                if (result) {
                    [, base, quote,] = result
                }
            }

            const existedMarket = sdk.getExistedMarket(marketArray, base, quote)

            params.base = existedMarket.baseShow
            params.quote = existedMarket.quoteShow
            market = existedMarket.market
            ammMarket = existedMarket.amm as string

            const tokenAmtMap = amountMap ? ammMap[ ammMarket ] ? amountMap[ ammMarket ] : amountMap[ market as string ] : undefined

            const feeBips = ammMap[ ammMarket ] ? ammMap[ ammMarket ].__rawConfig__.feeBips : 0
            return {
                feeBips,
                tokenAmtMap,
            }
        } else {
            return {
                feeBips: undefined,
                tokenAmtMap: undefined,
            }
        }


    }, [marketArray,])

    // {isBuy, amountB or amountS, (base, quote / market), feeBips, takerRate, depth, ammPoolSnapshot, slippage, }
    const makeMarketReqInHook = React.useCallback((params: ReqParams): {
        calcTradeParams: undefined | { [ key: string ]: any },
        marketRequest: undefined | { [ key: string ]: any },
    } => {

        // if (!exchangeInfo) {
        //     return
        // }

        const {tokenAmtMap, feeBips} = getTokenAmtMap(params)

        myLog('makeMarketReqInHook tokenAmtMap:', tokenAmtMap)

        if (exchangeInfo) {
            const fullParams: ReqParams = {
                ...params,
                exchangeAddress: exchangeInfo.exchangeAddress,
                accountId: account.accountId,
                tokenMap,
                feeBips: feeBips ? feeBips.toString() : '0',
                tokenAmtMap: tokenAmtMap,
            }
            return makeMarketReq(fullParams)
        } else {
            return {
                calcTradeParams: undefined,
                marketRequest: undefined,
            }
        }


    }, [account, tokenMap, marketArray, exchangeInfo,])

    // {isBuy, price, amountB or amountS, (base, quote / market), feeBips, takerRate, }
    const makeLimitReqInHook = React.useCallback((params: ReqParams): { calcTradeParams: undefined | { [ key: string ]: any }; limitRequest: undefined | { [ key: string ]: any } } => {
        const {tokenAmtMap, feeBips} = getTokenAmtMap(params)
        if (exchangeInfo) {
            const fullParams: ReqParams = {
                ...params,
                exchangeAddress: exchangeInfo.exchangeAddress,
                accountId: account.accountId,
                tokenMap,
                feeBips: feeBips ? feeBips.toString() : '0',
                tokenAmtMap: tokenAmtMap,
            }
            return makeLimitReq(fullParams)
        } else {
            myLog('makeMarketReqInHook error no tokenAmtMap', tokenAmtMap)
            return {
                calcTradeParams: undefined,
                limitRequest: undefined,
            }
        }

    }, [account, tokenMap, marketArray, exchangeInfo,])

    return {
        makeMarketReqInHook,
        makeLimitReqInHook,
    }

}
