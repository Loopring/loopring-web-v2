import React from "react";
import {
  AccountStatus,
  TradeStatus,
  TradeTypes,
} from "@loopring-web/common-resources";
import {
  OrderHistoryRawDataItem,
  OrderHistoryTableDetailItem,
} from "@loopring-web/component-lib";
import {
  LoopringAPI,
  store,
  useAccount,
  useWalletLayer2,
  volumeToCount,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import { GetOrdersRequest, Side } from "@loopring-web/loopring-sdk";
import BigNumber from "bignumber.js";
import { TFunction } from "react-i18next";
import { cloneDeep } from "lodash";

export const useOrderList = ({
  isStopLimit = false,
}: {
  isStopLimit?: boolean;
}) => {
  const [orderOriginalData, setOrderOriginalData] = React.useState<
    OrderHistoryRawDataItem[]
  >([]);
  const [orderDetailList, setOrderDetailList] = React.useState<
    OrderHistoryTableDetailItem[]
  >([]);
  const [totalNum, setTotalNum] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(false);
  const [showDetailLoading, setShowDetailLoading] = React.useState(false);
  // const [openOrderList, setOpenOrderList] = React.useState<OrderHistoryRawDataItem[]>([])
  const {
    account: { accountId, apiKey, readyState },
  } = useAccount();
  const {
    tokenMap: { marketArray, tokenMap, marketMap },
  } = store.getState();
  const {
    ammMap: { ammMap },
  } = store.getState().amm;
  const { sk: privateKey } = store.getState().account.eddsaKey;

  const { status, updateWalletLayer2 } = useWalletLayer2();

  const ammPairList = ammMap ? Object.keys(ammMap) : [];
  const jointPairs = (marketArray || []).concat(ammPairList);

  const getOrderList = React.useCallback(
    async (
      props: Omit<GetOrdersRequest, "accountId"> & { extraOrderTypes?: string }
    ) => {
      // const isOpenOrder = props.status && props.status === 'processing'
      setShowLoading(true);
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        const userOrders = await LoopringAPI.userAPI.getOrders(
          {
            limit: 50,
            ...props,
            accountId,
          },
          apiKey
        );
        if (userOrders && Array.isArray(userOrders.orders)) {
          setTotalNum(userOrders.totalNum);
          const data = userOrders.orders.map((order) => {
            const { baseAmount, quoteAmount, baseFilled, quoteFilled } =
              order.volumes;

            const marketList = order.market.split("-");
            if (marketList.length === 3) {
              marketList.shift();
            }
            // due to AMM case, we cannot use first index
            const side =
              order.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell;
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
                Number(order.price || 0);
            const baseVolume = volumeToCountAsBigNumber(
              baseToken,
              actualBaseFilled
            );
            const quoteVolume = volumeToCountAsBigNumber(
              quoteToken,
              actualQuoteFilled
            );
            const quotefilledValue = volumeToCount(
              quoteToken,
              actualQuoteFilled
            );

            const average = isBuy
              ? baseVolume?.div(quoteVolume || new BigNumber(1)).toNumber() || 0
              : quoteVolume?.div(baseVolume || new BigNumber(1)).toNumber() ||
                0;
            const completion = (quotefilledValue || 0) / (quoteValue || 1);

            const precisionFrom = tokenMap
              ? (tokenMap as any)[baseToken]?.precisionForOrder
              : undefined;
            const precisionTo = tokenMap
              ? (tokenMap as any)[quoteToken]?.precisionForOrder
              : undefined;
            const precisionMarket = marketMap
              ? marketMap[order.market]?.precisionForPrice
              : undefined;

            return {
              market: order.market,
              side: order.side === "BUY" ? TradeTypes.Buy : TradeTypes.Sell,
              orderType: order.orderType,
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
                value: Number(order.price),
              },
              time: order.validity.start * 1000,
              status: order.status as unknown as TradeStatus,
              hash: order.hash,
              orderId: order.clientOrderId,
              tradeChannel: order.tradeChannel,
              completion: completion,
              precisionMarket: precisionMarket,
              // @ts-ignore
              extraOrderInfo: order.extraOrderInfo,
              __raw__: order,
            };
          });
          setShowLoading(false);
          return data;
        }
        setShowLoading(false);
        return [];
      }
      setShowLoading(false);
      return [];
    },
    [accountId, apiKey, marketMap, tokenMap, isStopLimit]
  );

  React.useEffect(() => {
    (async () => {
      if (status === "UNSET") {
        const data = await getOrderList({
          limit: 50,
          status: ["processing"],
          extraOrderTypes: isStopLimit ? "STOP_LIMIT" : "TRADITIONAL_ORDER",
        });
        setOrderOriginalData(data);
      }
    })();
  }, [getOrderList, status]);

  const clearOrderDetail = React.useCallback(() => {
    setOrderDetailList([]);
  }, []);

  const isAtBottom = React.useCallback(
    ({ currentTarget }: React.UIEvent<HTMLDivElement>): boolean => {
      return (
        currentTarget.scrollTop + 10 >=
        currentTarget.scrollHeight - currentTarget.clientHeight
      );
    },
    []
  );

  const handleScroll = React.useCallback(
    async (event: React.UIEvent<HTMLDivElement>, isOpen: boolean = false) => {
      if (!isAtBottom(event) || (event.target as any)?.scrollTop === 0) return;

      const prevData = cloneDeep(orderOriginalData);

      const newData = await getOrderList({
        offset: prevData.length,
        status: isOpen
          ? ["processing"]
          : ["processed", "failed", "cancelled", "cancelling", "expired"],
        extraOrderTypes: isStopLimit ? "STOP_LIMIT" : "TRADITIONAL_ORDER",
      });
      const jointData = [...prevData, ...newData];
      setOrderOriginalData(jointData);
    },
    [getOrderList, isAtBottom, orderOriginalData, isStopLimit]
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
        await LoopringAPI.userAPI.cancelOrder(
          {
            accountId,
            orderHash,
            clientOrderId,
          },
          privateKey,
          apiKey
        );
        updateWalletLayer2();
      }
    },
    [accountId, apiKey, privateKey, updateWalletLayer2]
  );

  const cancelOrderByHashList = React.useCallback(
    async (orderHashList: string) => {
      if (
        LoopringAPI &&
        LoopringAPI.userAPI &&
        accountId &&
        privateKey &&
        apiKey
      ) {
        await LoopringAPI.userAPI.cancelMultiOrdersByHash(
          {
            accountId,
            orderHash: orderHashList,
          },
          privateKey,
          apiKey
        );
        updateWalletLayer2();
      }
    },
    [accountId, apiKey, privateKey, updateWalletLayer2]
  );

  const getOrderDetail = React.useCallback(
    async (orderHash: string, t: TFunction) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowDetailLoading(true);
        const response = await LoopringAPI.userAPI.getOrderDetails(
          {
            accountId,
            orderHash,
          },
          apiKey
        );
        const formattedData = [response.orderDetail].map((order: any) => {
          const { baseAmount, quoteAmount, baseFilled, quoteFilled, fee } =
            order.volumes;
          const marketList = order.market.split("-");
          if (marketList.length === 3) {
            marketList.shift();
          }
          // due to AMM case, we cannot use first index
          const side =
            order.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell;
          const isBuy = side === TradeTypes.Buy;
          const role = isBuy
            ? t("labelOrderDetailMaker")
            : t("labelOrderDetailTaker");
          const [tokenFirst, tokenLast] = marketList;
          const baseToken = isBuy ? tokenLast : tokenFirst;
          const quoteToken = isBuy ? tokenFirst : tokenLast;
          const baseValue = isBuy
            ? volumeToCount(baseToken, quoteAmount)
            : volumeToCount(baseToken, baseAmount);
          const quoteValue = isBuy
            ? volumeToCount(quoteToken, baseAmount)
            : (volumeToCount(baseToken, baseAmount) || 0) *
              Number(order.price || 0);
          const actualBaseFilled = isBuy ? quoteFilled : baseFilled;
          const actualQuoteFilled = isBuy ? baseFilled : quoteFilled;
          const baseVolume = volumeToCountAsBigNumber(
            baseToken,
            actualBaseFilled
          );
          const quoteVolume = volumeToCountAsBigNumber(
            quoteToken,
            actualQuoteFilled
          );
          const filledPrice =
            baseVolume?.div(quoteVolume || new BigNumber(1)).toNumber() || 0;
          const feeValue =
            volumeToCountAsBigNumber(quoteToken, fee)?.toNumber() || 0;

          const precisionFrom = tokenMap
            ? (tokenMap as any)[baseToken]?.precisionForOrder
            : undefined;
          const precisionTo = tokenMap
            ? (tokenMap as any)[quoteToken]?.precisionForOrder
            : undefined;
          const precisionMarket = marketMap
            ? marketMap[order.market]?.precisionForPrice
            : undefined;
          const precisionFee = tokenMap
            ? (tokenMap as any)[quoteToken]?.precisionForOrder
            : undefined;

          return {
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
            filledPrice: {
              value: filledPrice,
              precision: precisionMarket,
            },
            fee: {
              key: quoteToken,
              value: feeValue,
              precision: precisionFee,
            },
            role: role,
            time: order.validity.start * 1000,
            volume: quoteVolume?.toNumber(),
            orderId: order.clientOrderId,
            extraOrderInfo: order.extraOrderInfo,
            __raw__: order,
          };
        });
        setOrderDetailList(formattedData);
        setShowDetailLoading(false);
      }
    },
    [accountId, apiKey, marketMap, tokenMap]
  );

  const clearData = React.useCallback(() => {
    setOrderOriginalData([]);
  }, []);

  React.useEffect(() => {
    if (readyState !== AccountStatus.ACTIVATED) {
      clearData();
    }
  }, [status, readyState, clearData]);

  return {
    marketArray: jointPairs,
    getOrderList,
    setOrderOriginalData,
    rawData: orderOriginalData,
    clearRawData: clearData,
    totalNum,
    showLoading,
    showDetailLoading,
    getOrderDetail,
    orderDetailList,
    cancelOrder,
    handleScroll,
    clearOrderDetail,
    cancelOrderByHashList,
  };
};
