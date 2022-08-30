import { useRouteMatch } from "react-router-dom";
import { useTranslation, WithTranslation } from "react-i18next";
import {
  confirmation,
  findDualMarket,
  LoopringAPI,
  useDualMap,
} from "@loopring-web/core";
import React from "react";
import _ from "lodash";

export const useDualHook = ({
  setConfirmDualInvest,
}: WithTranslation & {
  setConfirmDualInvest: (state: any) => void;
}) => {
  const { t } = useTranslation("common");
  const match: any = useRouteMatch("/invest/dual/:market?");
  const { marketArray, tradeMap } = useDualMap();
  const [, , coinA, coinB] =
    match.params?.market?.match(/(dual-)?(\w+)-(\w+)/i);

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
  const handleOnPairChange = React.useCallback(
    (
      prosp:
        | {
            pairA: string;
          }
        | { pairB: string }
    ) => {
      if (prosp.hasOwnProperty("pairA")) {
        const pairASymbol = (prosp as any).pairA;
        const pairBSymbol = tradeMap[pairASymbol]?.tokenList[0];
        setPairASymbol(pairASymbol);
        setPairBSymbol(pairBSymbol);
        setMarket(() => findDualMarket(marketArray, pairASymbol, pairBSymbol));
      } else if (prosp.hasOwnProperty("pairB")) {
        const pairBSymbol = (prosp as any).pairB;
        setMarket(() => findDualMarket(marketArray, pairASymbol, pairBSymbol));
      }
    },
    [marketArray, pairASymbol, tradeMap]
  );

  const [dualProduct, setDualProduct] = React.useState([]);
  const getProduct = _.debounce(async () => {
    await LoopringAPI.defiAPI?.getDualInfos({
      // baseSymbol: string;
      // quoteSymbol: string;
      // currency: string;
      // dualType: string;
      // minStrike? : string;
      // maxStrike? : string;
      // startTime? : number;
      // timeSpan? : number;
      // limit: number;
    });
  });
  React.useEffect(() => {
    getProduct();
    return () => getProduct.cancel();
  }, [pairASymbol, pairBSymbol]);
  //   [...(marketArray ? marketArray : [])].find(
  //   (_item) => {
  //     const value = match?.params?.market
  //       ?.replace(/null|-/gi, "")
  //       ?.toUpperCase();
  const {
    confirmation: { confirmedDualInvest },
  } = confirmation.useConfirmation();
  setConfirmDualInvest(!confirmedDualInvest);
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
    dualWrapProps: undefined,
    pairASymbol,
    pairBSymbol,
    market,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
  };
};
