import store from '../../stores';
import { AmmPoolSnapshot, DepthData, LoopringMap, TickerData, TokenVolumeV3 } from 'loopring-sdk';
import { LoopringAPI } from '../../api_wrapper';
import { CustomError, ErrorMap, getValuePrecisionThousand } from '@loopring-web/common-resources';
import { volumeToCountAsBigNumber } from '../../hooks/help';
import { myLog } from "@loopring-web/common-resources";
import { PairFormat } from '../../stores/router';
import BigNumber from 'bignumber.js';

export const swapDependAsync = (market: PairFormat): Promise<{
    ammPoolSnapshot: AmmPoolSnapshot | undefined,
    tickMap: LoopringMap<TickerData>,
    depth: DepthData
}> => {
    const { ammMap } = store.getState().amm.ammMap

    return new Promise((resolve, reject) => {
        const poolAddress = ammMap['AMM-' + market]?.address
        if (LoopringAPI.ammpoolAPI && LoopringAPI.exchangeAPI) {
            Promise.all([
                LoopringAPI.exchangeAPI.getMixDepth({ market }),
                LoopringAPI.ammpoolAPI.getAmmPoolSnapshot({ poolAddress, }),
                LoopringAPI.exchangeAPI.getMixTicker({ market: market })])
                .then(([{ depth }, { ammPoolSnapshot }, { tickMap }]) => {
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
        dependencyData: { tickMap, ammPoolSnapshot, depth }
    }: {
        market: PairFormat,
        tradePair: PairFormat
        dependencyData: { tickMap: any, ammPoolSnapshot: any, depth: any },
    }): {
    stob: string | undefined,
    btos: string | undefined
    close: string | undefined } => {
    const { tokenMap, idIndex } = store.getState().tokenMap
    // const  = store.getState().pageTradeLite.pageTradeLite;
    // @ts-ignore
    const [, coinSell] = tradePair.match(/(\w+)-(\w+)/i)
    // @ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i)
    let stob: number |string| undefined | BigNumber = undefined,
        btos: number |string| undefined | BigNumber = undefined,
        close: number |string| undefined = undefined;
    if (coinA && coinB && tokenMap && idIndex) {
        //first getValue from  ammPoolSnapshot
        if (ammPoolSnapshot) {
            const poolATokenVol: TokenVolumeV3 = ammPoolSnapshot.pooled[0];
            const poolBTokenVol: TokenVolumeV3 = ammPoolSnapshot.pooled[1];
            stob = volumeToCountAsBigNumber(idIndex[poolBTokenVol.tokenId], poolBTokenVol.volume)?.div(
                volumeToCountAsBigNumber(idIndex[poolATokenVol.tokenId], poolATokenVol.volume) || 1
            )
            // @ts-ignore
            btos = getValuePrecisionThousand(BigNumber(1).div(stob).toNumber(),tokenMap[coinA].precision)// .toFixed(tokenMap[idIndex[poolATokenVol.tokenId]].precision))
            stob = getValuePrecisionThousand(stob?.toNumber(), tokenMap[coinB].precision)

            // stob = Number(stob?.toFixed(tokenMap[idIndex[poolBTokenVol.tokenId]].precision))
            close = stob?.toString();
            if (coinSell !== coinA) {
                stob = btos;
                btos = close;
            }
            // myLog('pairDetailDone stob from amm:', stob)
        }

        //second getValue from tickerData
        if (( stob === '0.00' || !stob) && tickMap) {
            const tickerData = tickMap[market]
            if (!!tickerData) {
                close = getValuePrecisionThousand(tickerData.close,tokenMap[coinB].precision);
                stob = close;
                btos = Number(tickerData.close) !== 0 ? getValuePrecisionThousand(1 / tickerData.close,tokenMap[coinA].precision) : 0
                if (!tickerData.base === coinSell) {
                    stob = btos;
                    btos = close;
                }
            }
        }

        //last check from depth
        if (( stob === '0.00' || !stob) && depth) {
            close = depth.mid_price;
            stob =  depth.mid_price;
            btos =  Number(close) !== 0 ?  getValuePrecisionThousand( 1/Number(close), tokenMap[ coinA ].precision):0;
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

export const marketInitCheck = (market: string, type?: 'sell' | 'buy'): { tradePair: PairFormat } => {
    const { coinMap, tokenMap, marketMap, marketArray } = store.getState().tokenMap
    const { ammMap } = store.getState().amm
    if (coinMap && tokenMap && marketMap && marketArray && ammMap) {
        let coinA: string = '#null',
            coinB: string = '#null';
        const result = market.match(/([\w,#]+)-([\w,#]+)/i);
        if (market && result) {
            [, coinA, coinB] = result
        }
        let whichCoinIndex = [coinA, coinB].findIndex(item => item !== '#null');
        if (whichCoinIndex !== -1 && coinMap[[coinA, coinB][whichCoinIndex]] === undefined) {
            whichCoinIndex === 0 ? coinA = 'LRC' : coinB = 'LRC';
        }
        if (whichCoinIndex === -1) {
            whichCoinIndex = 0;
            coinA = 'LRC';
        }
        if (type === 'sell' && coinB !== '#null') {
            if (!tokenMap[coinA].tradePairs.includes(coinB as never)) {
                coinB = tokenMap[coinA].tradePairs[0]
            }
        } else if (coinB === '#null' || coinA === '#null') {
            if (!tokenMap[[coinA, coinB][whichCoinIndex]].tradePairs.includes([coinA, coinB][whichCoinIndex ^ 1] as never)) {
                whichCoinIndex == 0 ? coinB = tokenMap[[coinA, coinB][whichCoinIndex]].tradePairs[0]
                    : coinA = tokenMap[[coinA, coinB][whichCoinIndex]].tradePairs[0];
            }
        }
        return { tradePair: `${coinA}-${coinB}` }
    }

    return { tradePair: 'LRC-ETH' };
}
