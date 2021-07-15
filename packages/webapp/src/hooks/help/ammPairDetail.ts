import { AmmDetailBase } from '@loopring-web/common-resources';
import { volumeToCountAsBigNumber } from './volumeToCount';

export const ammPairInit = ({
                                   pair,
                                   _ammCalcData,
                                   ammType,
                                   tokenMap,
                                   coinMap,
                                   walletMap,
                                   ammMap,
                                   tickerData,
                                   ammPoolsBalance
                               }: any) => {
    _ammCalcData.coinInfoMap = coinMap;
    if (tickerData) {

        _ammCalcData.AtoB = Number(tickerData.close)
    }
    if (isNaN(_ammCalcData.AtoB) && ammPoolsBalance) {
        const baseVol = volumeToCountAsBigNumber(pair.coinAInfo.simpleName, ammPoolsBalance.pooled[ 0 ].volume);
        const quoteVol = volumeToCountAsBigNumber(pair.coinBInfo.simpleName, ammPoolsBalance.pooled[ 1 ].volume);
        _ammCalcData.AtoB = quoteVol && baseVol && quoteVol.div(baseVol).toNumber();

    }
    if (pair.coinAInfo) {
        // if(ammType === AmmPanelType.Deposit ) {
        _ammCalcData.myCoinA = {
            belong: pair.coinAInfo.simpleName,
            balance: walletMap ? walletMap[ pair.coinAInfo.simpleName ]?.count : 0,
        }
        _ammCalcData.myCoinB = {
            belong: pair.coinBInfo.simpleName,
            balance: walletMap ? walletMap[ pair.coinBInfo.simpleName ]?.count : 0,
        }
        // }else {
        const key = `${pair.coinAInfo.simpleName}-${pair.coinBInfo.simpleName}`;
        let coinACount = 0, coinBCount = 0;
        if (walletMap) {
            const balance = walletMap ? walletMap[ 'LP-' + key ]?.count : 0;
            const {totalLPToken, totalA, totalB}: AmmDetailBase<any> = ammMap[ 'AMM-' + key ];
            if (totalA && totalLPToken && totalB) {
                coinACount = totalA / totalLPToken * balance;
                coinBCount = totalB / totalLPToken * balance;
            }
            _ammCalcData.lpCoin = balance;
        }
        _ammCalcData.lpCoinA = {
            belong: pair.coinAInfo.simpleName,
            balance: coinACount,
        }
        _ammCalcData.lpCoinB = {
            belong: pair.coinBInfo.simpleName,
            balance: coinBCount,
        }
        // }
    }


    return _ammCalcData
}


