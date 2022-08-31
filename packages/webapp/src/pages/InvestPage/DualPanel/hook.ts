import { useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  confirmation,
  findDualMarket,
  LoopringAPI,
  useDualMap,
  useSystem,
  useTokenPrices,
} from "@loopring-web/core";
import React from "react";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";

export const useDualHook = ({
  setConfirmDualInvest,
}: {
  setConfirmDualInvest: (state: any) => void;
}) => {
  const { t } = useTranslation("common");
  const match: any = useRouteMatch("/invest/dual/:market?");
  const { marketArray, tradeMap } = useDualMap();

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
      if (prosp.hasOwnProperty("pairA")) {
        const pairASymbol = (prosp as any).pairA;
        const pairBSymbol = tradeMap[pairASymbol]?.tokenList[0];
        setPairASymbol(pairASymbol);
        setPairBSymbol(pairBSymbol);
        market = findDualMarket(marketArray, pairASymbol, pairBSymbol);
      } else if (prosp.hasOwnProperty("pairB")) {
        const pairBSymbol = (prosp as any).pairB;
        market = findDualMarket(marketArray, pairASymbol, pairBSymbol);
      }
      const [, , coinA, coinB] = market
        ? market
        : "DUAL-LRC-USDC".match(/(dual-)?(\w+)-(\w+)/i);
      setMarket(market);
      setMarketPair([coinA, coinB]);
      setPriceObj({
        symbol: coinA,
        price: tokenPrices[coinA],
      });
    },
    [marketArray, pairASymbol, tradeMap]
  );

  const [dualProducts, setDualProducts] = React.useState([]);
  const getProduct = _.debounce(async () => {
    setIsLoading(true);
    // @ts-ignore
    const [, , marketSymbolA, marketSymbolB] = (market ?? "").match(
      /(dual-)?(\w+)-(\w+)/i
    );
    debugger;
    if (marketSymbolA && marketSymbolB && pairASymbol && pairBSymbol) {
      const response = await LoopringAPI.defiAPI?.getDualInfos({
        baseSymbol: marketSymbolA,
        quoteSymbol: marketSymbolB,
        currency: marketSymbolB,
        dualType:
          marketSymbolA === pairASymbol
            ? sdk.DUAL_TYPE.DUAL_BASE
            : sdk.DUAL_TYPE.DUAL_CURRENCY,
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
          dualInfo: { infos },
        } = response as any;
        // totalNum:number,
        //   dualInfo:{
        //   infos : loopring_defs.DualProductAndPrice[],
        //     index : loopring_defs.DualIndex,
        //     balance : loopring_defs.DualBalance[],
        // }
        setDualProducts(infos);
      }
    }
    setIsLoading(false);
  }, 100);
  React.useEffect(() => {
    if (market) {
      getProduct.cancel();
      getProduct();
    }
    return () => getProduct.cancel();
  }, [market]);
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
    pairASymbol,
    pairBSymbol,
    market,
    isLoading,
    dualProducts,
    handleOnPairChange,
    marketBase,
    marketQuote,
    priceObj,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
  };
};
