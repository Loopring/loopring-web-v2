import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI, store, tradeItemToTableDataItem } from "../../index";
import {
  AmmRecordRow,
  AmmTradeType,
  RawDataTradeItem,
} from "@loopring-web/component-lib";
import { volumeToCount } from "./volumeToCount";
import { myError } from "@loopring-web/common-resources";

export const getUserTrades = (market: string) => {
  if (!LoopringAPI.userAPI) {
    return undefined;
  }
  const { accountId, apiKey } = store.getState().account;
  return LoopringAPI.userAPI
    .getUserTrades({ accountId, market }, apiKey)
    .then(
      (response: {
        totalNum: any;
        userTrades: sdk.UserTrade[];
        raw_data: any;
      }) => {
        return response.userTrades;
      }
    );
};
export const makeMarketArray = (
  _coinKey: any,
  marketTrades: sdk.MarketTradeInfo[]
): RawDataTradeItem[] => {
  let tradeArray: Array<Partial<RawDataTradeItem>> = [];

  const { tokenMap } = store.getState().tokenMap;

  marketTrades.forEach((item: sdk.MarketTradeInfo) => {
    try {
      // const {base, quote} = sdk.getBaseQuote(item.market)
      if (tokenMap) {
        tradeArray.push(tradeItemToTableDataItem(item));
      }
    } catch (error: any) {
      myError(error);
    }
  });
  return tradeArray as RawDataTradeItem[];
};

export const getUserAmmTransaction = ({
  address,
  offset,
  limit,
  txStatus,
}: any) => {
  const { accountId, apiKey } = store.getState().account;
  return LoopringAPI.ammpoolAPI
    ?.getUserAmmPoolTxs(
      {
        accountId,
        ammPoolAddress: address,
        limit,
        offset,
        txStatus,
      },
      apiKey
    )
    .then(({ userAmmPoolTxs, totalNum }) => {
      return {
        userAmmPoolTxs,
        totalNum,
      };
    });
  // }
};

// getAmmPoolTxs

export const getRecentAmmTransaction = ({
  address,
  offset,
  limit,
}: // txStatus,
any) => {
  // const {apiKey} = store.getState().account
  return LoopringAPI.ammpoolAPI
    ?.getAmmPoolTxs({
      poolAddress: address,
      limit,
      offset,
    })
    .then(({ transactions, totalNum }) => {
      return {
        ammPoolTrades: transactions,
        totalNum,
      };
    });
};

export const makeMyAmmMarketArray = <C extends { [key: string]: any }>(
  _coinKey: string | undefined,
  marketTransaction: sdk.UserAmmPoolTx[]
): AmmRecordRow<C>[] => {
  const tradeArray: Array<Partial<AmmRecordRow<C>> & { totalBalance: number }> =
    [];
  const { tokenMap, coinMap, idIndex } = store.getState().tokenMap;
  const { forex } = store.getState().system;

  // if (ammpool && ammpool.userAmmPoolTxs) {
  //     const result = ammpool.userAmmPoolTxs.map(o => ({
  //         side: o.txType === AmmTxType.JOIN ? AmmSideTypes.Join : AmmSideTypes.Exit,
  //         amount: {
  //             from: {
  //                 key: getTokenName(o.poolTokens[0]?.tokenId),
  //                 value: String(volumeToCount(getTokenName(o.poolTokens[0]?.tokenId), o.poolTokens[0]?.actualAmount))
  //             },
  //             to: {
  //                 key: getTokenName(o.poolTokens[1]?.tokenId),
  //                 value: String(volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.actualAmount))
  //             }
  //         },
  //         lpTokenAmount: String(volumeToCount(getTokenName(o.lpToken?.tokenId), o.lpToken?.actualAmount)),
  //         fee: {
  //             key: getTokenName(o.poolTokens[1]?.tokenId),
  //             value: volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.feeAmount)?.toFixed(6)
  //         },
  //         time: o.updatedAt
  //     }))
  //     setAmmRecordList(result)
  //     setShowLoading(false)
  // }

  if (marketTransaction) {
    marketTransaction.forEach((item: sdk.UserAmmPoolTx) => {
      try {
        if (
          coinMap &&
          tokenMap &&
          idIndex
          /* && !(coinKey && tokenMap['LP-'+coinKey].tokenId !== item.lpToken.tokenId) */
        ) {
          // @ts-ignore
          const [, coinA, coinB] =
            idIndex[item.lpToken.tokenId].match(/LP-(\w+)-(\w+)/i);
          const balance = item.lpToken.actualAmount;

          tradeArray.push({
            type:
              item.txType === sdk.AmmTxType.JOIN
                ? AmmTradeType.add
                : AmmTradeType.remove,
            totalDollar: 0,
            totalYuan: 0 / Number(forex),
            totalBalance: Number(balance),
            amountA: volumeToCount(coinA, item.poolTokens[0]?.actualAmount),
            amountB: volumeToCount(coinB, item.poolTokens[1]?.actualAmount),
            time: Number(item.updatedAt),
            // @ts-ignore
            coinA: coinMap[coinA],
            // @ts-ignore
            coinB: coinMap[coinB],
            status: item.txStatus,
          });
        }
        return tradeArray;
      } catch (error: any) {
        //CATCHERROR:
        console.log(error);
        // new CustomError()
      }
    });
  }
  return tradeArray as AmmRecordRow<C>[];
};
