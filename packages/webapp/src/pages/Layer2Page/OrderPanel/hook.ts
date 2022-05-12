import React from "react";
import { TradeStatus, TradeTypes } from "@loopring-web/common-resources";
import { OrderHistoryRawDataItem } from "@loopring-web/component-lib";
import {
  LoopringAPI,
  useAccount,
  volumeToCount,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import { GetOrdersRequest, Side } from "@loopring-web/loopring-sdk";
import { store } from "@loopring-web/core";
import BigNumber from "bignumber.js";
import { useWalletLayer2 } from "@loopring-web/core";

export const useOrderList = () => {
  const [orderOriginalData, setOrderOriginalData] = React.useState<
    OrderHistoryRawDataItem[]
  >([]);
  const [totalNum, setTotalNum] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(false);
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const {
    tokenMap: { marketArray, tokenMap, marketMap },
  } = store.getState();
  const {
    ammMap: { ammMap },
  } = store.getState().amm;
  const { sk: privateKey } = store.getState().account.eddsaKey;
  const { updateWalletLayer2 } = useWalletLayer2();

  const ammPairList = ammMap ? Object.keys(ammMap) : [];
  const jointPairs = (marketArray || []).concat(ammPairList);

  const getOrderList = React.useCallback(
    async (props: Omit<GetOrdersRequest, "accountId">) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowLoading(true);
        const userOrders = await LoopringAPI.userAPI.getOrders(
          {
            ...props,
            accountId,
          },
          apiKey
        );
        if (userOrders && Array.isArray(userOrders.orders)) {
          setTotalNum(userOrders.totalNum);
          const data = userOrders.orders.map((o) => {
            const { baseAmount, quoteAmount, baseFilled, quoteFilled } =
              o.volumes;

            const marketList = o.market.split("-");
            if (marketList.length === 3) {
              marketList.shift();
            }
            const side = o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell;
            const isBuy = side === TradeTypes.Buy;
            const [tokenFirst, tokenLast] = marketList;
            const baseToken = isBuy ? tokenLast : tokenFirst;
            const quoteToken = isBuy ? tokenFirst : tokenLast;
            const actualBaseFilled = (isBuy ? quoteFilled : baseFilled) as any;
            const actualQuoteFilled = (isBuy ? baseFilled : quoteFilled) as any;
            const baseValue = isBuy
              ? volumeToCount(baseToken, quoteAmount)
              : volumeToCount(baseToken, baseAmount);
            const quoteValue = isBuy
              ? volumeToCount(quoteToken, baseAmount)
              : (volumeToCount(baseToken, baseAmount) || 0) *
                Number(o.price || 0);
            const baseVolume = volumeToCountAsBigNumber(
              baseToken,
              actualBaseFilled
            );
            const quoteVolume = volumeToCountAsBigNumber(
              quoteToken,
              actualQuoteFilled
            );
            const quoteFilledValue = volumeToCount(
              quoteToken,
              actualQuoteFilled
            );

            const average = isBuy
              ? baseVolume?.div(quoteVolume || new BigNumber(1)).toNumber() || 0
              : quoteVolume?.div(baseVolume || new BigNumber(1)).toNumber() ||
                0;
            const completion = (quoteFilledValue || 0) / (quoteValue || 1);

            const precisionFrom = tokenMap
              ? (tokenMap as any)[baseToken]?.precisionForOrder
              : undefined;
            const precisionTo = tokenMap
              ? (tokenMap as any)[quoteToken]?.precisionForOrder
              : undefined;
            const precisionMarket = marketMap
              ? marketMap[o.market]?.precisionForPrice
              : undefined;
            return {
              market: o.market,
              side: o.side === "BUY" ? TradeTypes.Buy : TradeTypes.Sell,
              orderType: o.orderType,
              amount: {
                from: {
                  key: baseToken,
                  value: baseValue as any,
                  precision: precisionFrom,
                },
                to: {
                  key: quoteToken,
                  value: quoteValue as any,
                  precision: precisionTo,
                },
              },
              average: average,

              price: {
                key: quoteToken,
                value: Number(o.price),
              },
              time: o.validity.start * 1000,
              status: o.status as unknown as TradeStatus,
              hash: o.hash,
              orderId: o.clientOrderId,
              tradeChannel: o.tradeChannel,
              completion: completion,
              precisionMarket: precisionMarket,
            };
          });

          setOrderOriginalData(data);
        }
        setShowLoading(false);
      }
    },
    [accountId, apiKey]
  );

  const cancelOrder = React.useCallback(
    async ({ orderHash, clientOrderId }) => {
      if (
        LoopringAPI &&
        LoopringAPI.userAPI &&
        accountId &&
        privateKey &&
        apiKey
      ) {
        setShowLoading(true);
        await LoopringAPI.userAPI.cancelOrder(
          {
            accountId,
            orderHash,
            clientOrderId,
          },
          privateKey,
          apiKey
        );
        setTimeout(() => {
          getOrderList({
            status: ["processing"],
          });
        }, 100);
        updateWalletLayer2();
      }
    },
    [accountId, apiKey, privateKey]
  );

  const clearData = React.useCallback(() => {
    setOrderOriginalData([]);
  }, []);

  return {
    marketArray: jointPairs,
    getOrderList,
    rawData: orderOriginalData,
    clearRawData: clearData,
    totalNum,
    showLoading,
    cancelOrder,
  };
};
