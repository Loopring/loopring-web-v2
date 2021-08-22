import { AmmMap } from '../../stores/Amm/AmmMap';
import { AmmPoolSnapshot, getBaseQuote, LoopringMap, TickerData, TokenInfo, TokenVolumeV3 } from 'loopring-sdk';
import { LoopringAPI } from 'api_wrapper';
import { CoinMap, CustomError, ErrorMap } from '@loopring-web/common-resources';
import { volumeToCountAsBigNumber } from './volumeToCount';
import { myLog } from 'utils/log_tools';

export const pairDetailBlock = <C extends { [ key: string ]: any }, I extends { [ key: string ]: any }>({
                                                                                                           coinKey,
                                                                                                           ammKey,
                                                                                                           ammMap
                                                                                                       }: { coinKey: string, ammKey: string, ammMap: AmmMap<C, I> }):
    Promise<{
        ammPoolsBalance: AmmPoolSnapshot | undefined,
        tickMap:  LoopringMap<TickerData>,
}> => {
    return new Promise((resolve, reject) => {
        if(LoopringAPI.ammpoolAPI && LoopringAPI.exchangeAPI ) {
            Promise.all([
                LoopringAPI.ammpoolAPI.getAmmPoolSnapshot({poolAddress: ammMap[ammKey]?.address}),
                LoopringAPI.exchangeAPI.getMixTicker({market: coinKey})])
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

export const pairDetailDone = <C>({coinKey, market, ammPoolsBalance, fee, tokenMap,tickerData, _tradeCalcData, coinMap, marketCoins}:any)=>{

    const [, coinSell, coinBuy] = coinKey.match(/(\w+)-(\w+)/i)
    let stob:number|undefined = NaN;

    if (coinKey && tickerData?.symbol && coinKey === tickerData.symbol) {
        if (tickerData.base === coinSell) {
            stob = Number(tickerData.close)
        } else {
            stob = Number(tickerData.close) !== 0 ? 1 / Number(tickerData.close) : 0
        }
    }

    if(isNaN(stob) && ammPoolsBalance) {
        const {base, quote} = getBaseQuote(coinKey)
        
        const poolBaseTokenVol: TokenVolumeV3 = ammPoolsBalance.pooled[0];
        const quoteBaseTokenVol: TokenVolumeV3 = ammPoolsBalance.pooled[1];
        let poolVolume: [baseVol:any, quoteVol:any];
        if (base && quote && tokenMap[base].tokenId === poolBaseTokenVol.tokenId ) {
            poolVolume =  [[base, poolBaseTokenVol.volume],[quote, quoteBaseTokenVol.volume]]
        } else if (base && quote && tokenMap[base].tokenId === quoteBaseTokenVol.tokenId){
            poolVolume =  [[base, quoteBaseTokenVol.volume],[quote, poolBaseTokenVol.volume]]
        } else {
            throw new CustomError(ErrorMap.NO_SUPPORT_PAIR)
        }
        let [baseVol, quoteVol] = poolVolume
        if(baseVol && quoteVol) {
            stob = parseFloat(volumeToCountAsBigNumber(quoteVol[0], quoteVol[1])?.div(
                volumeToCountAsBigNumber(baseVol[0], baseVol[1]) || 1).toFixed(7, 0) as string)

                myLog('pairDetailDone stob from amm:', stob)
        }
    }

    const isValidS2B = (stob !== 0 && stob !== undefined && !isNaN(stob))
    _tradeCalcData.coinSell = coinSell
    _tradeCalcData.coinBuy= coinBuy
    _tradeCalcData.StoB = isValidS2B ? stob: 0
    _tradeCalcData.BtoS =  isValidS2B ? 1 / (stob * 1.0) : 0;
    _tradeCalcData.sellCoinInfoMap = marketCoins?.reduce((prev: any, item: string | number) => {
        return {...prev, [ item ]: coinMap[ item ]}
    }, {} as CoinMap<C>)
    _tradeCalcData.buyCoinInfoMap = tokenMap[ coinSell ].tradePairs?.reduce((prev: any, item: string | number) => {
        return {...prev, [ item ]: coinMap[ item ]}
    }, {} as CoinMap<C>);

    _tradeCalcData.fee = fee

    return {
        _tradeCalcData
    }
    //setPair();
}