import React from 'react'

import * as sdk from 'loopring-sdk'

import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS } from 'defs/common_defs';
import { useAccount } from 'stores/account';
import { useTokenMap } from 'stores/token';
import { useSystem } from 'stores/system';
import { useAmmMap } from 'stores/Amm/AmmMap';
import { useAmount } from 'stores/amount';
import { usePageTradeLite } from 'stores/router';
import { myLog } from '@loopring-web/common-resources';

export interface ReqParams {
    isBuy?: boolean,

    price: number,
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
    tokenAmtMap?: { [key: string]: sdk.TokenAmount },

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

    if (!tokenMap || !tokenAmtMap || !exchangeAddress || !marketArray
        || accountId === undefined || !base || !quote || (!depth && !ammPoolSnapshot)) {
        return undefined
    }

    if (isBuy === undefined) {
        isBuy = true
    }

    if (!storageId) {
        storageId = 0
    }

    const baseTokenInfo = tokenMap[base]
    const quoteTokenInfo = tokenMap[quote]

    const sellTokenInfo = isBuy ? baseTokenInfo : quoteTokenInfo
    const buyTokenInfo = isBuy ? quoteTokenInfo : baseTokenInfo

    const input = (amountBase !== undefined ? amountBase : amountQuote !== undefined ? amountQuote : '')?.toString()

    const sell = sellTokenInfo.symbol
    const buy = buyTokenInfo.symbol

    // buy. amountSell is not null.
    const isAtoB = (isBuy && amountQuote !== undefined) || (!isBuy && amountBase !== undefined)

    const takerRate = tokenAmtMap[buyTokenInfo.symbol].userOrderInfo.takerRate

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
        marketRequest,
    }
}

export function makelimitReq({
    isBuy,

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
}: ReqParams) {

    if (!tokenMap || !tokenAmtMap || !exchangeAddress
        || accountId === undefined || !base || !quote) {
        return undefined
    }

    if (isBuy === undefined) {
        isBuy = true
    }

    if (!storageId) {
        storageId = 0
    }

    const baseTokenInfo = tokenMap[base]
    const quoteTokenInfo = tokenMap[quote]

    let baseVol = undefined
    let quoteVol = undefined

    if (amountBase !== undefined) {
        baseVol = sdk.toBig(amountBase).times('1e' + baseTokenInfo.decimals)
        quoteVol = sdk.toBig(amountBase).times(sdk.toBig(price)).times('1e' + quoteTokenInfo.decimals)
    } else if (amountQuote !== undefined) {
        baseVol = sdk.toBig(amountQuote).div(sdk.toBig(price)).times('1e' + baseTokenInfo.decimals)
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

    const takerRate = tokenAmtMap[baseTokenInfo.symbol].userOrderInfo.takerRate

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

    return {
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

    const { account } = useAccount()

    const { coinMap, tokenMap, marketArray, marketCoins, marketMap, } = useTokenMap()

    const { exchangeInfo, } = useSystem()

    const { amountMap, } = useAmount()

    const { ammMap, } = useAmmMap()

    const {
        pageTradeLite,
        pageTradeLite: { ammPoolSnapshot, depth, tradePair, },
        updatePageTradeLite,
        __SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__,
    } = usePageTradeLite()

    const getTokenAmtMap = React.useCallback((params: ReqParams) => {

        if (!ammMap || !amountMap || !marketArray) {
            return undefined
        }

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

        const tokenAmtMap = ammMap[ammMarket] ? amountMap[ammMarket] : amountMap[market as string]

        return {
            tokenAmtMap,
        }

    }, [ammMap, amountMap, marketArray,])

    // {isBuy, amountB or amountS, (base, quote / market), feeBips, takerRate, depth, ammPoolSnapshot, slippage, }
    const makeMarketReqInHook = React.useCallback((params: ReqParams) => {

        if (!exchangeInfo) {
            return
        }

        const tokenAmtMap = getTokenAmtMap(params)

        if (!tokenAmtMap?.tokenAmtMap) {
            return
        }

        const fullParams: ReqParams = {
            ...params,
            exchangeAddress: exchangeInfo.exchangeAddress,
            accountId: account.accountId,
            tokenMap,
            tokenAmtMap: tokenAmtMap.tokenAmtMap,
        }

        return makeMarketReq(fullParams)

    }, [account, tokenMap, ammMap, amountMap, marketArray, exchangeInfo,])

    // {isBuy, price, amountB or amountS, (base, quote / market), feeBips, takerRate, }
    const makelimitReqInHook = React.useCallback((params: ReqParams) => {

        if (!exchangeInfo) {
            return
        }

        const tokenAmtMap = getTokenAmtMap(params)

        if (!tokenAmtMap?.tokenAmtMap) {
            return
        }

        const fullParams: ReqParams = {
            ...params,
            exchangeAddress: exchangeInfo.exchangeAddress,
            accountId: account.accountId,
            tokenMap,
            tokenAmtMap: tokenAmtMap.tokenAmtMap,
        }

        myLog('fullParams:', fullParams)

        return makelimitReq(fullParams)

    }, [account, tokenMap, ammMap, amountMap, marketArray, exchangeInfo,])

    return {
        makeMarketReqInHook,
        makelimitReqInHook,
    }

}
