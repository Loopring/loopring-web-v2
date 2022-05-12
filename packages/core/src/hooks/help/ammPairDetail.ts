import { AmmDetailBase, AmmInData } from "@loopring-web/common-resources";

// import { volumeToCountAsBigNumber } from './volumeToCount';
// import BigNumber from 'bignumber.js';

export function ammPairInit({
  fee,
  pair,
  _ammCalcData,
  coinMap,
  walletMap,
  // tokenMap,
  ammMap,
  stob,
  btos,
}: // ammPoolSnapshot
any): AmmInData<string> {
  _ammCalcData.coinInfoMap = coinMap;

  // if (isNaN(_ammCalcData.AtoB) && ammPoolSnapshot) {
  //     const baseVol = volumeToCountAsBigNumber(pair.coinAInfo.simpleName, ammPoolSnapshot.pooled[ 0 ].volume);
  //     const quoteVol = volumeToCountAsBigNumber(pair.coinBInfo.simpleName, ammPoolSnapshot.pooled[ 1 ].volume);
  //     _ammCalcData.AtoB = quoteVol && baseVol && quoteVol.div(baseVol).toString()
  // }
  // _ammCalcData.AtoB = stob;
  // _ammCalcData.BtoS = btos;
  if (stob) {
    _ammCalcData.AtoB = stob;
    _ammCalcData.BtoA = btos;
  }
  // else if(ammPoolSnapshot){
  //     const poolATokenVol: TokenVolumeV3 = ammPoolSnapshot.pooled[0];
  //     const poolBTokenVol: TokenVolumeV3 = ammPoolSnapshot.pooled[1];
  //     stob = volumeToCountAsBigNumber(pair.coinAInfo.simpleName, poolBTokenVol.volume)?.div(
  //         volumeToCountAsBigNumber(pair.coinBInfo.simpleName, poolATokenVol.volume) || 1
  //     )
  //     // @ts-ignore
  //     _ammCalcData.BtoA = getValuePrecisionThousand(BigNumber(1).div(stob).toNumber(),tokenMap[pair.coinAInfo.simpleName].precision)// .toFixed(tokenMap[idIndex[poolATokenVol.tokenId]].precision))
  //     _ammCalcData.AtoB = getValuePrecisionThousand(stob?.toNumber(), tokenMap[pair.coinBInfo.simpleName].precision)
  // }

  let coinACount = 0,
    coinBCount = 0,
    percentage = 0;

  if (pair.coinAInfo) {
    _ammCalcData.myCoinA = {
      belong: pair.coinAInfo.simpleName,
      balance: walletMap ? walletMap[pair.coinAInfo.simpleName]?.count : 0,
      tradeValue: undefined,
    };
  }

  if (pair.coinBInfo) {
    _ammCalcData.fee =
      fee !== undefined
        ? fee.toString() + " " + pair.coinBInfo.simpleName
        : undefined;

    const feeReal = !!fee ? fee : 0;

    const balanceB = walletMap
      ? walletMap[pair.coinBInfo.simpleName]?.count - feeReal
      : 0;

    _ammCalcData.myCoinB = {
      belong: pair.coinBInfo.simpleName,
      balance: balanceB < 0 ? 0 : balanceB,
      tradeValue: undefined,
    };

    const key = `${pair.coinAInfo.simpleName}-${pair.coinBInfo.simpleName}`;
    const lpCoin = "LP-" + key;
    let balance = undefined;
    if (walletMap) {
      balance = walletMap && walletMap[lpCoin] ? walletMap[lpCoin].count : 0;
      const ammInfo = ammMap["AMM-" + key];
      const { totalLPToken, totalA, totalB }: AmmDetailBase<any> = ammInfo;

      if (totalA && totalLPToken && totalB) {
        percentage = totalLPToken ? balance / totalLPToken : 0;

        coinACount = totalA * percentage;

        coinBCount = totalB * percentage;
      }
    }

    _ammCalcData.lpCoin = { belong: lpCoin, balance };

    _ammCalcData.lpCoinA = {
      belong: pair.coinAInfo.simpleName,
      balance: coinACount,
    };
    _ammCalcData.lpCoinB = {
      belong: pair.coinBInfo.simpleName,
      balance: coinBCount,
    };

    _ammCalcData.percentage = percentage;
  }

  return _ammCalcData;
}
