import React from "react";

import {
  useTokenPrices,
  useAmmMap,
  getRecentAmmTransaction,
  makeMyAmmMarketArray,
  volumeToCount,
  getUserAmmTransaction,
} from "../../index";

// import _ from "lodash";
import {
  AmmRecordRow,
  // useOpenModals
} from "@loopring-web/component-lib";
// import * as sdk from "@loopring-web/loopring-sdk";
// import { useAmmCommon } from "../../hooks/useractions/hookAmmCommon";
import { AmmPoolTx, UserAmmPoolTx } from "@loopring-web/loopring-sdk";
// import moment from "moment";

export type AwardItme = {
  start: string;
  end: string;
  market: string;
  accountId: number;
  awardList: {
    token?: string;
    volume?: number;
  }[];
};

export const useAmmRecord = <R extends { [key: string]: any }>({
  market,
}: {
  market: string;
}) => {
  const { ammMap } = useAmmMap();
  const [isMyAmmLoading, setIsMyAmmLoading] = React.useState(false);
  const [isRecentLoading, setIsRecentLoading] = React.useState(false);
  const [ammMarketArray, setAmmMarketArray] = React.useState<AmmRecordRow<R>[]>(
    []
  );
  const [ammTotal, setAmmTotal] = React.useState(0);
  const [ammUserTotal, setAmmUserTotal] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(14);
  const { tokenPrices } = useTokenPrices();
  const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<
    AmmRecordRow<R>[]
  >([]);
  const getUserAmmPoolTxs = React.useCallback(
    ({ limit = pageSize, offset = 0 }) => {
      // limit = pageSize;
      if (ammMap) {
        const addr = ammMap["AMM-" + market]?.address;
        if (addr) {
          setIsMyAmmLoading(true);
          getUserAmmTransaction({
            address: addr,
            limit: limit,
            offset,
            txStatus: "processed",
          })?.then(
            (res: {
              userAmmPoolTxs: UserAmmPoolTx[];
              totalNum: React.SetStateAction<number>;
            }) => {
              let _myTradeArray = makeMyAmmMarketArray(
                market,
                res.userAmmPoolTxs
              );

              const formattedArray = _myTradeArray.map((o: any) => {
                const market = `LP-${o.coinA.simpleName}-${o.coinB.simpleName}`;
                const formattedBalance = Number(
                  volumeToCount(market, o.totalBalance)
                );
                const price = tokenPrices && tokenPrices[market];
                const totalDollar = ((formattedBalance || 0) *
                  (price || 0)) as any;
                return {
                  ...o,
                  totalDollar: totalDollar,
                };
              });
              setMyAmmMarketArray(formattedArray || []);
              setAmmUserTotal(res.totalNum);
              setIsMyAmmLoading(false);
            }
          );
        }
      }
    },
    [ammMap, market, tokenPrices, pageSize]
  );

  const getRecentAmmPoolTxs = React.useCallback(
    ({ limit = 15, offset = 0 }) => {
      if (ammMap) {
        // const market = list[list.length - 1];
        const addr = ammMap["AMM-" + market]?.address;

        if (addr) {
          setIsRecentLoading(true);
          getRecentAmmTransaction({
            address: addr,
            limit: limit,
            offset,
          })?.then(
            ({
              ammPoolTrades,
              totalNum,
            }: {
              ammPoolTrades: AmmPoolTx[];
              totalNum: number;
            }) => {
              let _tradeArray = makeMyAmmMarketArray(market, ammPoolTrades);

              const formattedArray = _tradeArray.map((o: any) => {
                const market = `LP-${o.coinA.simpleName}-${o.coinB.simpleName}`;
                const formattedBalance = Number(
                  volumeToCount(market, o.totalBalance)
                );
                const price = tokenPrices && tokenPrices[market];
                const totalDollar = ((formattedBalance || 0) *
                  (price || 0)) as any;
                return {
                  ...o,
                  totalDollar: totalDollar,
                };
              });
              setAmmMarketArray(formattedArray || []);
              setAmmTotal(totalNum);
              setIsRecentLoading(false);
            }
          );
        }
      }
    },
    [ammMap, market, tokenPrices]
  );
  return {
    isMyAmmLoading,
    isRecentLoading,
    ammMarketArray,
    ammTotal,
    myAmmMarketArray,
    ammUserTotal,
    getUserAmmPoolTxs, //handle page change used
    getRecentAmmPoolTxs,
    pageSize,
    setPageSize,
  };
};
