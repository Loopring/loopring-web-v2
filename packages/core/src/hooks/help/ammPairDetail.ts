import { AmmDetailBase, AmmInData } from "@loopring-web/common-resources";

export function ammPairInit({
  fee,
  pair,
  _ammCalcData,
  coinMap,
  walletMap,
  ammMap,
  stob,
  btos,
}: any): AmmInData<string> {
  _ammCalcData = {
    ..._ammCalcData,
    coinInfoMap: coinMap,
  };
  if (stob) {
    _ammCalcData = {
      ..._ammCalcData,
      AtoB: stob,
      BtoA: btos,
    };
  }

  let coinACount = 0,
    coinBCount = 0,
    percentage = 0;

  if (pair.coinAInfo) {
    _ammCalcData = {
      ..._ammCalcData,
      myCoinA: {
        belong: pair.coinAInfo.simpleName,
        balance: walletMap ? walletMap[pair.coinAInfo.simpleName]?.count : 0,
        tradeValue: undefined,
      },
    };
  }

  if (pair.coinBInfo) {
    _ammCalcData = {
      ..._ammCalcData,
      fee:
        fee !== undefined
          ? fee.toString() + " " + pair.coinBInfo.simpleName
          : undefined,
    };

    const feeReal = !!fee ? fee : 0;

    const balanceB = walletMap
      ? walletMap[pair.coinBInfo.simpleName]?.count - feeReal
      : 0;

    _ammCalcData = {
      ..._ammCalcData,
      myCoinB: {
        belong: pair.coinBInfo.simpleName,
        balance: balanceB < 0 ? 0 : balanceB,
        tradeValue: undefined,
      },
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

    _ammCalcData = {
      ..._ammCalcData,
      lpCoin: { belong: lpCoin, balance },
    };

    _ammCalcData = {
      ..._ammCalcData,
      lpCoinA: {
        belong: pair.coinAInfo.simpleName,
        balance: coinACount,
      },
    };
    _ammCalcData = {
      ..._ammCalcData,
      lpCoinB: {
        belong: pair.coinBInfo.simpleName,
        balance: coinBCount,
      },
    };

    _ammCalcData = {
      ..._ammCalcData,
      percentage,
    };
  }

  return _ammCalcData;
}
