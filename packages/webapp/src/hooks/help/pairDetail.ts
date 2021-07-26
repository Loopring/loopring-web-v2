import { AmmMap } from '../../stores/Amm/AmmMap';
import { AmmPoolSnapshot, getBaseQuote, LoopringMap, TickerData, TokenInfo, TokenVolumeV3 } from 'loopring-sdk';
import { LoopringAPI } from '../../stores/apis/api';
import { CoinMap, CustomError, ErrorMap } from '@loopring-web/common-resources';
import { volumeToCountAsBigNumber } from './volumeToCount';

export const pairDetailBlock = <C extends { [ key: string ]: any }, I extends { [ key: string ]: any }>({
                                                                                                           coinKey,
                                                                                                           ammKey,
                                                                                                           ammMap
                                                                                                       }: { coinKey: string, ammKey: string, ammMap: AmmMap<C, I> }):
    Promise<{
        ammPoolsBalance: AmmPoolSnapshot,
        tickMap:  LoopringMap<TickerData>
}> => {
    // const exchangeApi = exchangeAPI();
    // const ammpoolApi = ammpoolAPI();
    return new Promise((resolve, reject) => {
        if(LoopringAPI.ammpoolAPI && LoopringAPI.exchangeAPI ) {
            Promise.all([
                LoopringAPI.ammpoolAPI.getAmmPoolSnapshot({poolAddress: ammMap[ ammKey ].address}),
                LoopringAPI.exchangeAPI.getMixTicker({market: coinKey})])
                // exchangeApi.getMarketTrades({market:coinKey})])
                //{raw_data},
                .then(([{ammPoolSnapshot}, {tickMap}]) => {
                    resolve({
                        ammPoolsBalance: ammPoolSnapshot,
                        tickMap,
                    })
                })

        }else{
            reject(new CustomError(ErrorMap.NO_SDK))
        }
       
    })
}

export const pairDetailDone = <C>({coinKey, market,ammPoolsBalance, fee, tokenMap,tickerData, _tradeCalcData, coinMap, marketCoins}:any)=>{

    const [, coinSell, coinbuy] = coinKey.match(/(\w+)-(\w+)/i)
    let stob:number|undefined;
    if (tickerData.base === coinSell) {
        // const ticker: TickerData = tickMap[market]
        stob = Number(tickerData.close)

    } else{
        // const ticker: TickerData = tickMap[market]
        stob = Number(tickerData.close)!==0? 1/Number(tickerData.close): 0
    }
    if(isNaN(stob) && ammPoolsBalance){
        const {base, quote} = getBaseQuote(coinKey)

        // const baseToken: TokenInfo = getToken(tokenMap, base)
        // const quoteToken: TokenInfo = getToken(tokenMap, quote)
        // const baseVol = (fm.toBig(poolBaseTokenVol.volume).div(BIG10.pow(baseToken.decimals)))
        // const quoteVol = (fm.toBig(quoteBaseTokenVol.volume).div(BIG10.pow(quoteToken.decimals)))
        //
        // stob = volumeToCountAsBigNumber(base,poolBaseTokenVol.volume)?.div(
        //     volumeToCountAsBigNumber(quote,quoteBaseTokenVol.volume) || 1
        // ) .toNumber()
        // console.log('1', base, poolBaseTokenVol, quote, quoteBaseTokenVol)
        //baseToken.tokenId === quoteBaseTokenVol.tokenId && quoteToken.tokenId === poolBaseTokenVol.tokenId) {
        // const quoteVol = (fm.toBig(quoteBaseTokenVol.volume).div(BIG10.pow(baseToken.decimals)))
        // const baseVol = (fm.toBig(poolBaseTokenVol.volume).div(BIG10.pow(quoteToken.decimals)))
        //baseVol.div(quoteVol).toNumber()
        // console.log('2', base, poolBaseTokenVol, quote, quoteBaseTokenVol)
        //ErrorMap.NOTS
        const poolBaseTokenVol: TokenVolumeV3 = ammPoolsBalance.pooled[0];
        const quoteBaseTokenVol: TokenVolumeV3 = ammPoolsBalance.pooled[1];
        let poolVolumn:[baseVol:any, quoteVol:any];
        if ( base && quote && tokenMap[base].tokenId === poolBaseTokenVol.tokenId ) {
            poolVolumn =  [[base,poolBaseTokenVol.volume],[quote,quoteBaseTokenVol.volume]]
        } else if (base && quote && tokenMap[base].tokenId === quoteBaseTokenVol.tokenId){
            poolVolumn =  [[quote,quoteBaseTokenVol.volume],[base,poolBaseTokenVol.volume]]
        } else {
            throw new CustomError(ErrorMap.NO_SUPPORT_PAIR)
        }
        let [baseVol,quoteVol]  = poolVolumn
        if(baseVol && quoteVol){
            // stob = volumeToCountAsBigNumber(baseVol[0],baseVol[1])?.div(
            //     volumeToCountAsBigNumber(quoteVol[0],quoteVol[1]) || 1
            // ) .toNumber()
            stob = parseFloat(volumeToCountAsBigNumber(quoteVol[0],quoteVol[1])?.div(
                volumeToCountAsBigNumber(baseVol[0],baseVol[1]) || 1).toFixed(7, 0) as string)
        }
    }

    _tradeCalcData.StoB = stob;
    _tradeCalcData.BtoS = stob !== 0 && stob !== undefined? 1 / (stob * 1.0): 0;
    _tradeCalcData.sellCoinInfoMap = coinMap && marketCoins?.reduce((prev: any, item: string | number) => {
        return {...prev, [ item ]: coinMap[ item ]}
    }, {} as CoinMap<C>)
    _tradeCalcData.buyCoinInfoMap = coinMap && tokenMap && tokenMap[ _tradeCalcData.coinSell as string ].tradePairs?.reduce((prev: any, item: string | number) => {
        return {...prev, [ item ]: coinMap[ item ]}
    }, {} as CoinMap<C>);

    _tradeCalcData.fee = fee

    return {
        _tradeCalcData
    }
    //setPair();
}