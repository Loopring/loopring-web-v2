import { useRouteMatch } from "react-router-dom";
import { WithTranslation } from "react-i18next";
import { confirmation, useDefiMap, useDualMap } from "@loopring-web/core";
import { MarketType } from "@loopring-web/common-resources";

export const useDualHook = ({
  t,
  setConfirmDualInvest,
}: WithTranslation & {
  setConfirmDualInvest: (state: any) => void;
}) => {
  const match: any = useRouteMatch("/invest/dual/:market?");
  const { marketArray, tradeMap } = useDualMap();
  const [, , coinA, coinB] =
    match.params?.market?.match(/(dual-)?(\w+)-(\w+)/i);
  const pairASymbol = tradeMap[coinA] ? coinA : "LRC";
  const pairBSymbol =
    coinB && tradeMap[pairASymbol]?.tokenList
      ? tradeMap[pairASymbol].tokenList.includes(coinB)
        ? coinB
        : tradeMap[pairASymbol].tokenList[0]
      : "USDT";

  const market = marketArray.find((item) => {
    const regExp = new RegExp(
      `^(\\w+-)?(${pairASymbol}-${pairBSymbol}|${pairBSymbol}-${pairASymbol})$`,
      "i"
    );
    return regExp.test(item);
  });
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
