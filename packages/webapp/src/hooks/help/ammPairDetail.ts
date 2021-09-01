import { AmmDetailBase } from '@loopring-web/common-resources';
import { volumeToCountAsBigNumber } from './volumeToCount';

export const ammPairInit = ({
                                fee,
                                pair,
                                _ammCalcData,
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
        _ammCalcData.AtoB = quoteVol && baseVol && parseFloat(quoteVol.div(baseVol).toFixed(7, 0) as string)
    }
    if (pair.coinAInfo) {
        const feeReal = fee ? fee : 0

        _ammCalcData.myCoinA = {
            belong: pair.coinAInfo.simpleName,
            balance: walletMap ? walletMap[ pair.coinAInfo.simpleName ]?.count : 0,
        }
        _ammCalcData.myCoinB = {
            belong: pair.coinBInfo.simpleName,
            balance: walletMap ? walletMap[ pair.coinBInfo.simpleName ]?.count - feeReal : 0,
        }

        const key = `${pair.coinAInfo.simpleName}-${pair.coinBInfo.simpleName}`;
        let coinACount = 0, coinBCount = 0;
        if (walletMap) {
            const balance = walletMap ? walletMap[ 'LP-' + key ]?.count : 0;
            const {totalLPToken, totalA, totalB}: AmmDetailBase<any> = ammMap[ 'AMM-' + key ];
            if (totalA && totalLPToken && totalB) {
                coinACount = totalA / totalLPToken * balance;
                coinBCount = totalB / totalLPToken * balance - feeReal;
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
    }


    return _ammCalcData
}


