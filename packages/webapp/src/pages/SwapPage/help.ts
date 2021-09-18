import React from 'react'
import store from '../../stores';
import {
    AmmPoolSnapshot,
    DepthData,
    LoopringMap,
    TickerData,
    TokenVolumeV3,
    toBig,
    SubmitOrderRequestV3,
    getExistedMarket, TokenInfo, TokenAmount, OrderType, TradeChannel
} from 'loopring-sdk';
import { LoopringAPI } from '../../api_wrapper';
import { CustomError, ErrorMap, getValuePrecisionThousand, MarketType } from '@loopring-web/common-resources';
import { volumeToCountAsBigNumber } from '../../hooks/help';
import BigNumber from 'bignumber.js';
import { updateTicker } from 'stores/ticker';

import { useAccount } from 'stores/account';
import { useTokenMap } from 'stores/token';
import { useSystem } from 'stores/system';
import { useAmmMap } from 'stores/Amm/AmmMap';
import { useAmount } from 'stores/amount';
import { getTimestampDaysLater } from '../../utils/dt_tools';

export const swapDependAsync = (market: MarketType): Promise<{
    ammPoolSnapshot: AmmPoolSnapshot | undefined,
    tickMap: LoopringMap<TickerData>,
    depth: DepthData
}> => {
    const {ammMap} = store.getState().amm.ammMap

    return new Promise((resolve, reject) => {
        const poolAddress = ammMap[ 'AMM-' + market ]?.address
        if (LoopringAPI.ammpoolAPI && LoopringAPI.exchangeAPI) {
            Promise.all([
                LoopringAPI.exchangeAPI.getMixDepth({market}),
                LoopringAPI.ammpoolAPI.getAmmPoolSnapshot({poolAddress,}),
                LoopringAPI.exchangeAPI.getMixTicker({market: market})])
                .then(([{depth}, {ammPoolSnapshot}, {tickMap}]) => {
                    store.dispatch(updateTicker(tickMap))
                    resolve({
                        ammPoolSnapshot: ammPoolSnapshot,
                        tickMap,
                        depth,
                    })
                })

        } else {
            reject(new CustomError(ErrorMap.NO_SDK))
        }

    })
}

export const calcPriceByAmmTickMapDepth = <C>(
    {
        market,
        tradePair,
        dependencyData: {tickMap, ammPoolSnapshot, depth}
    }: {
        market: MarketType,
        tradePair: MarketType
        dependencyData: { tickMap: any, ammPoolSnapshot: any, depth: any },
    }): {
    stob: string | undefined,
    btos: string | undefined
    close: string | undefined
} => {
    const {tokenMap, idIndex, marketMap} = store.getState().tokenMap
    // const  = store.getState().pageTradeLite.pageTradeLite;
    // @ts-ignore
    const [, coinSell] = tradePair.match(/(\w+)-(\w+)/i)
    // @ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i)
    let stob: number | string | undefined | BigNumber = undefined,
        btos: number | string | undefined | BigNumber = undefined,
        close: number | string | undefined = undefined;
    if (coinA && coinB && tokenMap && marketMap && idIndex) {
        //first getValue from  ammPoolSnapshot
        if (ammPoolSnapshot) {
            const poolATokenVol: TokenVolumeV3 = ammPoolSnapshot.pooled[ 0 ];
            const poolBTokenVol: TokenVolumeV3 = ammPoolSnapshot.pooled[ 1 ];
            stob = volumeToCountAsBigNumber(idIndex[ poolBTokenVol.tokenId ], poolBTokenVol.volume)?.div(
                volumeToCountAsBigNumber(idIndex[ poolATokenVol.tokenId ], poolATokenVol.volume) || 1
            )
            // @ts-ignore
            btos = getValuePrecisionThousand(BigNumber(1).div(stob).toNumber(),
                tokenMap[ coinA ].precision, tokenMap[ coinA ].precision, tokenMap[ coinA ].precision,true);// .toFixed(tokenMap[idIndex[poolATokenVol.tokenId]].precision))
            let precision = marketMap[ market ].precisionForPrice ? marketMap[ market ].precisionForPrice : tokenMap[ coinB ].precision;
            stob = getValuePrecisionThousand(stob, precision, precision, precision,true)

            // stob = Number(stob?.toFixed(tokenMap[idIndex[poolBTokenVol.tokenId]].precision))
            close = stob?.toString();
            if (coinSell !== coinA) {
                stob = btos;
                btos = close;
            }
            // myLog('pairDetailDone stob from amm:', stob)
        }

        //second getValue from tickerData
        if ((stob === '0.00' || !stob) && tickMap) {
            const tickerData = tickMap[ market ]
            if (!!tickerData) {
                let precision = marketMap[ market ].precisionForPrice ? marketMap[ market ].precisionForPrice : tokenMap[ coinB ].precision;
                close = getValuePrecisionThousand(tickerData.close, precision, precision, precision,true);
                stob = close;
                btos = Number(tickerData.close) !== 0 ?
                    getValuePrecisionThousand(1 / tickerData.close, tokenMap[ coinA ].precision, tokenMap[ coinA ].precision, tokenMap[ coinA ].precision,true) : 0
                if (!tickerData.base === coinSell) {
                    stob = btos;
                    btos = close;
                }
            }
        }

        //last check from depth
        if ((stob === '0.00' || !stob) && depth) {
            let precision = marketMap[ market ].precisionForPrice ? marketMap[ market ].precisionForPrice : tokenMap[ coinB ].precision;
            close = getValuePrecisionThousand(depth.mid_price, precision, precision, precision,true);
            stob = close;
            btos = Number(close) !== 0 ? getValuePrecisionThousand(1 / Number(close), tokenMap[ coinA ].precision, tokenMap[ coinA ].precision, tokenMap[ coinA ].precision,true) : 0;
            if (!tradePair === depth.symbol) {
                stob = btos;
                btos = close;
            }
        }
        // const isValidS2B = (stob !== 0 && stob !== undefined && !isNaN(stob))
        return {
            btos: btos as string,
            stob: stob as string,
            close: close as string,
        }
    }
    return {
        btos: undefined,
        stob: undefined,
        close: undefined
    }
}

export const marketInitCheck = (market: string, type?: 'sell' | 'buy'): { tradePair: MarketType } => {
    const {coinMap, tokenMap, marketMap, marketArray} = store.getState().tokenMap
    const {ammMap} = store.getState().amm
    if (coinMap && tokenMap && marketMap && marketArray && ammMap) {
        let coinA: string = '#null',
            coinB: string = '#null';
        const result = market.match(/([\w,#]+)-([\w,#]+)/i);
        if (market && result) {
            [, coinA, coinB] = result
        }
        let whichCoinIndex = [coinA, coinB].findIndex(item => item !== '#null');
        if (whichCoinIndex !== -1 && coinMap[ [coinA, coinB][ whichCoinIndex ] ] === undefined) {
            whichCoinIndex === 0 ? coinA = 'LRC' : coinB = 'LRC';
        }
        if (whichCoinIndex === -1) {
            whichCoinIndex = 0;
            coinA = 'LRC';
        }
        if (type === 'sell' && coinB !== '#null') {
            if (!tokenMap[ coinA ].tradePairs.includes(coinB as never)) {
                coinB = tokenMap[ coinA ].tradePairs[ 0 ]
            }
        } else if (coinB === '#null' || coinA === '#null') {
            if (!tokenMap[ [coinA, coinB][ whichCoinIndex ] ].tradePairs.includes([coinA, coinB][ whichCoinIndex ^ 1 ] as never)) {
                whichCoinIndex == 0 ? coinB = tokenMap[ [coinA, coinB][ whichCoinIndex ] ].tradePairs[ 0 ]
                    : coinA = tokenMap[ [coinA, coinB][ whichCoinIndex ] ].tradePairs[ 0 ];
            }
        }
        return {tradePair: `${coinA}-${coinB}`}
    }

    return {tradePair: 'LRC-ETH'};
}

export interface ReqParams {
    isBuy?: boolean,

    price: number,
    amount: number,
    base?: string,
    quote?: string,
    market?: string,
    tokenMap?: LoopringMap<TokenInfo>,

    exchangeAddress?: string,
    accountId?: number,
    storageId?: number,

    feeBips?: string,

    // key is ETH or USDT
    tokenAmtMap?: {[key: string]: TokenAmount},
}

export function makelimitReq({
    isBuy,

    price,
    amount,
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
         || accountId === undefined || storageId === undefined
         || !base || !quote) {
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

    const baseVol = toBig(amount).times('1e' + baseTokenInfo.decimals)
    const quoteVol = toBig(amount).times(toBig(price)).times('1e' + quoteTokenInfo.decimals)

    const baseTokenVol3: TokenVolumeV3 = {
        tokenId: baseTokenInfo.tokenId,
        volume: baseVol.toString()
    }

    const quoteTokenVol3: TokenVolumeV3 = {
        tokenId: quoteTokenInfo.tokenId,
        volume: quoteVol.toString()
    }

    const takerRate = tokenAmtMap[baseTokenInfo.symbol].userOrderInfo.takerRate

    const maxFeeBips = parseInt(toBig(feeBips).plus(toBig(takerRate)).toString())

    const request: SubmitOrderRequestV3 = {
        exchange: exchangeAddress,
        accountId,
        storageId,
        sellToken: isBuy ? quoteTokenVol3 : baseTokenVol3,
        buyToken: isBuy ? baseTokenVol3 :quoteTokenVol3,
        allOrNone: false,
        validUntil: getTimestampDaysLater(30),
        maxFeeBips,
        fillAmountBOrS: false, // amm only false
        orderType: OrderType.LimitOrder,
        tradeChannel: TradeChannel.MIXED,
        eddsaSignature: '',
    }

    return {
        request,
    }
}

//price = USDTVol / ETHVol

//buy eth(base). ETH-USDT reversed. sell:usdt buy:eth   calc: usdt<-eth/isAtoB=false
// fee(buyToken) -> eth(base)
// percentage -> change quote vol
export function marketBuy() {
}

//sell eth(base). ETH-USDT. sell:eth buy:usdt   calc: eth->usdt/isAtoB=true
// fee(buytoken) -> usdt(quote)
// percentage -> change base vol
export function marketSell() {
}

export function usePlaceOrder() {

    const { account } = useAccount()

    const { tokenMap, marketArray, } = useTokenMap()

    const { exchangeInfo, } = useSystem()

    const { amountMap, } = useAmount()

    const { ammMap, } = useAmmMap()

    //{isBuy, price, amount, (base, quote / market), feeBips, }
    const makelimitReqInHook = React.useCallback((params: ReqParams) => {

        if (!exchangeInfo || !ammMap || !amountMap || !marketArray) {
            return
        }

        let base = params.base

        let quote = params.quote

        let market = params.market

        let ammMarket = ''

        if (params.market) {

            const result = params.market.match(/([\w,#]+)-([\w,#]+)/i)

            if (result) {
                [ , base, quote, ] = result
            }

            const existedMarket = getExistedMarket(marketArray, base, quote)

            base = existedMarket.baseShow
            quote = existedMarket.quoteShow
            market = existedMarket.market
            ammMarket = existedMarket.amm as string
        }

        const tokenAmtMap = ammMap[ ammMarket ] ? amountMap[ ammMarket ] : amountMap[ market as string ]

        const fullParams: ReqParams  = {
            ...params,
            exchangeAddress: exchangeInfo.exchangeAddress,
            accountId: account.accountId,
            tokenMap,
            tokenAmtMap,
        }

        return makelimitReq(fullParams)

    }, [account, tokenMap, ammMap, amountMap, marketArray, exchangeInfo, ])

    return {
        makelimitReqInHook,
    }

}
