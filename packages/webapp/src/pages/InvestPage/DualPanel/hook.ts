import { useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  confirmation,
  dualCurrentPrice,
  findDualMarket,
  LoopringAPI,
  makeDualViewItem,
  useDualMap,
  useTokenPrices,
} from "@loopring-web/core";
import React from "react";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  DualViewInfo,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";

export const useDualHook = ({
  setConfirmDualInvest,
}: {
  setConfirmDualInvest: (state: any) => void;
}) => {
  const { t } = useTranslation("common");
  const match: any = useRouteMatch("/invest/dual/:market?");
  const { marketArray, tradeMap, status: dualStatus } = useDualMap();
  const { tokenPrices } = useTokenPrices();
  const [priceObj, setPriceObj] = React.useState<{
    symbol: any;
    price: any;
  }>({
    symbol: undefined,
    price: undefined,
  });
  const {
    confirmation: { confirmedDualInvest },
  } = confirmation.useConfirmation();
  setConfirmDualInvest(!confirmedDualInvest);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPrice, setCurrentPrice] =
    React.useState<
      | {
          currentPrice: number;
          symbol: string;
        }
      | undefined
    >(undefined);
  const [, , coinA, coinB] = (
    match?.params?.market ? match.params.market : "DUAL-LRC-USDC"
  ).match(/(dual-)?(\w+)-(\w+)/i);

  const [pairASymbol, setPairASymbol] = React.useState(() =>
    tradeMap[coinA] ? coinA : "LRC"
  );
  const [pairBSymbol, setPairBSymbol] = React.useState(
    coinB && tradeMap[pairASymbol]?.tokenList
      ? tradeMap[pairASymbol].tokenList.includes(coinB)
        ? coinB
        : tradeMap[pairASymbol].tokenList[0]
      : "USDT"
  );
  const [market, setMarket] = React.useState(() =>
    findDualMarket(marketArray, pairASymbol, pairBSymbol)
  );
  const [pair, setPair] = React.useState(`${pairASymbol}-${pairBSymbol}`);

  const [[marketBase, marketQuote], setMarketPair] = React.useState(() => {
    // @ts-ignore
    const [, , coinA, coinB] = market
      ? market
      : "DUAL-LRC-USDC".match(/(dual-)?(\w+)-(\w+)/i);
    return [coinA, coinB];
  });

  const handleOnPairChange = React.useCallback(
    (
      prosp:
        | {
            pairA: string;
          }
        | { pairB: string }
    ) => {
      let market: any;
      let _pairBSymbol: string = "";
      let _pairASymbol = pairASymbol;
      if (prosp.hasOwnProperty("pairA")) {
        _pairASymbol = (prosp as any).pairA;
        _pairBSymbol = tradeMap[_pairASymbol]?.tokenList[0];
        setPairASymbol(_pairASymbol);
        setPairBSymbol(_pairBSymbol);
        market = findDualMarket(marketArray, _pairASymbol, _pairBSymbol);
      } else if (prosp.hasOwnProperty("pairB")) {
        _pairBSymbol = (prosp as any).pairB;
        setPairBSymbol(_pairBSymbol);
        market = findDualMarket(marketArray, _pairASymbol, _pairBSymbol);
      }
      if (market) {
        const [, , coinA, coinB] = market ?? "".match(/(dual-)?(\w+)-(\w+)/i);
        setMarket(market);
        setPair(`${_pairASymbol}-${_pairBSymbol}`);
        setMarketPair([coinA, coinB]);
        setPriceObj({
          symbol: coinA,
          price: tokenPrices[coinA],
        });
      }
    },
    [marketArray, pairASymbol, tradeMap]
  );

  const [dualProducts, setDualProducts] = React.useState<DualViewInfo[]>([]);
  // const [productRawData,setProductRawData] = React.useState([])
  const getProduct = _.debounce(async () => {
    setIsLoading(true);

    if (pairASymbol && pairBSymbol && market) {
      // @ts-ignore
      const [, , marketSymbolA, marketSymbolB] = (market ?? "").match(
        /(dual-)?(\w+)-(\w+)/i
      );
      const dualType =
        marketSymbolA === pairASymbol
          ? sdk.DUAL_TYPE.DUAL_BASE
          : sdk.DUAL_TYPE.DUAL_CURRENCY;
      const currentPrice = dualCurrentPrice(
        // pairASymbol,
        // pairBSymbol,
        market as any
      );
      setCurrentPrice(currentPrice);
      const response = await LoopringAPI.defiAPI?.getDualInfos({
        baseSymbol: marketSymbolA,
        quoteSymbol: marketSymbolB,
        currency: marketSymbolB,
        dualType,
        startTime: Date.now() + 1000 * 60 * 60,
        timeSpan: Date.now() + 1000 * 60 * 60 * 24 * 5,
        limit: 100,
        // limit: number;
      });
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message
      ) {
        setDualProducts([]);
      } else {
        const {
          // totalNum,
          dualInfo: { infos, index, balance },
          raw_data: { rules },
        } = response as any;

        // : {
        //   dualInfo: {
        //     infos: sdk.DualProductAndPrice[];
        //     index: sdk.DualIndex;
        //     balance: sdk.DualBalance[];
        //   };
        //   raw_data: { rule: sdk.DualRulesCoinsInfo[] };
        // }
        const rule = rules[0];
        const rawData = infos.reduce(
          (prev: any[], item: sdk.DualProductAndPrice) => {
            if (
              item?.dualPrice?.dualBid[0] &&
              ((dualType === sdk.DUAL_TYPE.DUAL_BASE &&
                sdk
                  .toBig(item.dualPrice.dualBid[0].baseQty)
                  .lt(rule.baseMin)) ||
                (dualType == sdk.DUAL_TYPE.DUAL_CURRENCY &&
                  sdk
                    .toBig(item.dualPrice.dualBid[0].baseQty)
                    .times(item.strike)
                    .lt(rule.currencyMax)))
            ) {
              prev.push(makeDualViewItem(item, index, rule, currentPrice));
              return prev;
            }
            return prev;
            //price.dualBid空数组，过滤；
            // 如果dualType == dual_base,price.dualBid.baseQty < rule.baseMin,过滤；
            // 如果dualType == dual_currency,price.dualBid.baseQty*strike < rule.currencyMax,过滤；
          },
          [] as any[]
        );
        myLog("setDualProducts", rawData);
        setDualProducts(rawData);
      }
    }
    setIsLoading(false);
  }, 100);
  React.useEffect(() => {
    if (
      dualStatus === SagaStatus.UNSET &&
      pairBSymbol &&
      marketArray !== undefined
    ) {
      handleOnPairChange({ pairB: pairBSymbol });
      // setMarket(findDualMarket(marketArray, pairASymbol, pairBSymbol);
    }
  }, [dualStatus]);
  React.useEffect(() => {
    if (pair) {
      getProduct.cancel();
      getProduct();
    }
    return () => getProduct.cancel();
  }, [pair]);

  //   [...(marketArray ? marketArray : [])].find(
  //   (_item) => {
  //     const value = match?.params?.market
  //       ?.replace(/null|-/gi, "")
  //       ?.toUpperCase();
  // const {
  //   confirmation: { confirmedDualInvest },
  // } = confirmation.useConfirmation();
  // setConfirmDualInvest(!confirmedDualInvest);
  // const { toastOpen, setToastOpen, closeToast } = useToast();
  // const { marketArray } = useDualMap();
  // myLog("isJoin", isJoin, "market", market);

  // const {
  //   dualWrapProps,
  //   confirmShowNoBalance,
  //   setConfirmShowNoBalance,
  //   serverUpdate,
  //   setServerUpdate,
  // } = useDefiTrade({
  //   isJoin,
  //   setToastOpen: setToastOpen as any,
  //   market: market ? market : marketArray[0], // marketArray[1] as MarketType,
  // });

  return {
    // dualWrapProps: undefined,
    currentPrice,
    pairASymbol,
    pairBSymbol,
    market,
    isLoading,
    dualProducts,
    handleOnPairChange,
    marketBase,
    marketQuote,
    priceObj,
    pair,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
  };
};
