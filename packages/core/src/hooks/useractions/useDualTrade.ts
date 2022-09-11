import React from "react";
import {
  DualChgData,
  DualWrapProps,
  TradeBtnStatus,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CalDualResult,
  CustomErrorWithCode,
  DualCalcData,
  DualViewInfo,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";

import {
  DAYS,
  getTimestampDaysLater,
  makeDualViewItem,
  makeWalletLayer2,
  TradeDual,
  useDualMap,
  useSubmitBtn,
  useToast,
  useWalletLayer2Socket,
} from "@loopring-web/core";
import _ from "lodash";

import * as sdk from "@loopring-web/loopring-sdk";
import {
  DefiMarketInfo,
  DUAL_TYPE,
  TokenInfo,
} from "@loopring-web/loopring-sdk";

import {
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useTradeDual } from "../../stores";
import { BigNumber } from "bignumber.js";

/**
 *
 * @param info
 * @param index
 * @param rule
 * @param balance
 * @param feeVol
 * @param sellToken
 * @param buyToken
 * @param sellAmount
 * @param currentPrice
 */
export function calDual<R = DualViewInfo>({
  info,
  index,
  rule,
  balance,
  feeVol,
  sellToken,
  buyToken,
  sellAmount,
  dualMarket,
}: {
  sellAmount: string | undefined;
  info: sdk.DualProductAndPrice;
  index: sdk.DualIndex;
  rule: sdk.DualRulesCoinsInfo;
  balance: { [key: string]: sdk.DualBalance };
  sellToken: TokenInfo;
  buyToken: TokenInfo;
  feeVol?: string | undefined;
  dualMarket: DefiMarketInfo;
}): CalDualResult<R> {
  const sellVol = sdk
    .toBig(sellAmount ? sellAmount : 0)
    .times("1e" + sellToken.decimals);
  const dualViewInfo = makeDualViewItem(info, index, rule);
  let lessEarnVol,
    lessEarnTokenSymbol,
    greaterEarnVol,
    greaterEarnTokenSymbol,
    maxSellAmount,
    miniSellVol,
    feeTokenSymbol,
    maxFeeBips;
  myLog("settleRatio", dualViewInfo.settleRatio, dualViewInfo, index);
  if (info.dualType === DUAL_TYPE.DUAL_BASE) {
    lessEarnVol = sellVol.times(1 + info.ratio); //dualViewInfo.strike);
    lessEarnTokenSymbol = sellToken.symbol;
    greaterEarnVol = sdk
      .toBig(sellAmount ?? 0)
      .times(1 + info.ratio)
      .times(dualViewInfo.strike)
      .times("1e" + buyToken.decimals);
    greaterEarnTokenSymbol = buyToken.symbol;
    // @ts-ignore
    miniSellVol = dualMarket.baseLimitAmount; // rule.baseMin;
    maxSellAmount = BigNumber.max(
      rule.baseMax ?? 0,
      info.dualPrice.dualBid[0].baseQty,
      balance ? balance[sellToken.symbol]?.free ?? 0 : 0
    );
    feeTokenSymbol = buyToken.symbol;
    maxFeeBips = 5;
  } else {
    lessEarnVol = sdk
      .toBig(sellAmount ?? 0)
      .times(1 + info.ratio)
      .div(dualViewInfo.strike)
      .times("1e" + buyToken.decimals);

    // sellVol.times(1 + info.ratio).div(dualViewInfo.strike); //.times(1 + dualViewInfo.settleRatio);
    lessEarnTokenSymbol = buyToken.symbol;
    greaterEarnVol = sellVol.times(1 + info.ratio);
    //.div(dualViewInfo.strike);
    greaterEarnTokenSymbol = sellToken.symbol;
    // @ts-ignore
    miniSellVol = dualMarket.quoteLimitAmount; // rule.baseMin;
    maxSellAmount = BigNumber.max(
      rule.currencyMax,
      sdk.toBig(info.dualPrice.dualBid[0].baseQty).times(dualViewInfo.strike),
      balance[sellToken.symbol].free
    );
    /** calc current maxFeeBips **/
    feeTokenSymbol = buyToken.symbol;
    maxFeeBips = 5;
  }

  return {
    sellVol: sellVol.toString(),
    lessEarnVol: lessEarnVol.toString(),
    lessEarnTokenSymbol,
    greaterEarnVol: greaterEarnVol.toString(),
    greaterEarnTokenSymbol,
    miniSellVol,
    sellToken,
    maxSellAmount: maxSellAmount?.toString() ?? "",
    maxFeeBips: maxFeeBips,
    dualViewInfo: dualViewInfo as unknown as R,
    feeVol,
    feeTokenSymbol,
  };
}

export const useDualTrade = <
  T extends IBData<I>,
  I,
  ACD extends DualCalcData<R>,
  R extends DualViewInfo
>() => {
  const refreshRef = React.useRef();
  const { exchangeInfo, allowTrade } = useSystem();
  const { tokenMap, marketArray } = useTokenMap();
  // const { amountMap, getAmount, status: amountStatus } = useAmount();
  const { marketMap: dualMarketMap } = useDualMap();

  const { account, status: accountStatus } = useAccount();

  const { toastOpen, setToastOpen, closeToast } = useToast();
  const {
    modals: { isShowDual },
    setShowSupport,
    setShowTradeIsFrozen,
  } = useOpenModals();
  const { tradeDual, updateTradeDual, resetTradeDual } = useTradeDual();
  const [serverUpdate, setServerUpdate] = React.useState(false);
  const { t } = useTranslation(["common"]);
  const {
    toggle: { dualInvest },
  } = useToggle();
  const [[coinSellSymbol, coinBuySymbol], setSellBuySymbol] = React.useState<
    [string | undefined, string | undefined]
  >([undefined, undefined]);
  // });
  const [isLoading, setIsLoading] = React.useState(false);
  const [productInfo, setProductInfo] = React.useState<R>(undefined as any);
  // const {
  //   marketMap: defiMarketMap,
  //   // status: defiMarketStatus,
  // } = useDualMap();

  const refreshDual = React.useCallback(
    ({
      dualInfo = productInfo,
      tradeData,
      balance,
    }: {
      dualInfo?: R;
      tradeData?: T;
      balance?: { [key: string]: sdk.DualBalance };
    }) => {
      let walletMap: any = {};
      // feeVol: string | undefined = undefined;
      let { info } = dualInfo.__raw__;
      const {
        tradeDual: { coinSell: _coinSell },
      } = store.getState()._router_tradeDual;
      let _updateInfo: Partial<TradeDual<R>> = {
        dualViewInfo: dualInfo,
      };
      if (productInfo?.productId === dualInfo.productId) {
        _updateInfo = {
          ...(tradeDual as TradeDual<R>),
          ..._updateInfo,
        };
      } else {
        // resetTradeDual();
        // info = _updateInfo.dualViewInfo.__raw__.info;
      }
      if (balance) {
        _updateInfo.balance = balance;
      }

      const [baseSymbol, quoteSymbol] =
        DUAL_TYPE.DUAL_BASE === info.dualType
          ? [info.base, info.quote]
          : [info.quote, info.base];
      setSellBuySymbol([baseSymbol, quoteSymbol]);
      // debugger;
      let coinSell: T =
        tradeData && tradeData.belong === baseSymbol
          ? tradeData
          : _coinSell?.belong === baseSymbol
          ? ({ ..._coinSell } as T)
          : ({
              balance: _updateInfo?.coinSell?.balance ?? 0,
              tradeValue: _updateInfo?.coinSell?.tradeValue ?? undefined,
              belong: baseSymbol,
            } as T);
      const existedMarket = sdk.getExistedMarket(
        marketArray,
        baseSymbol,
        quoteSymbol
      );
      if (account.readyState == AccountStatus.ACTIVATED && existedMarket) {
        walletMap = makeWalletLayer2(true).walletMap;
        // const amountMarket = amountMap[existedMarket.market];
        coinSell.balance = walletMap[baseSymbol]?.count;
        // dualCalcDataInit.coinSell.balance = walletMap[coinSellSymbol]?.count;
        // dualCalcDataInit.coinBuy.balance = walletMap[coinBuySymbol]?.count;
        // feeVol = amountMarket[quoteSymbol].tradeCost;
      }
      if (_updateInfo.balance) {
        const calDualValue: CalDualResult<R> = calDual({
          ...dualInfo.__raw__,
          balance: _updateInfo.balance,
          // feeVol,
          sellToken: tokenMap[baseSymbol],
          buyToken: tokenMap[quoteSymbol],
          sellAmount: coinSell.tradeValue?.toString() ?? undefined,
          dualMarket: dualMarketMap[`DUAL-${info.base}-${info.quote}`],
        });
        _updateInfo = {
          ..._updateInfo,
          ...(calDualValue as TradeDual<R>),
        };
      }
      updateTradeDual({ ..._updateInfo, coinSell });
    },
    [
      account.readyState,
      dualMarketMap,
      marketArray,
      productInfo,
      resetTradeDual,
      tokenMap,
      tradeDual,
      updateTradeDual,
    ]
  );

  const handleOnchange = ({ tradeData }: DualChgData<T>) => {
    refreshDual({ tradeData });
  };

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const tradeDual = store.getState()._router_tradeDual.tradeDual;

    if (
      account.readyState === AccountStatus.ACTIVATED &&
      coinSellSymbol &&
      tradeDual?.sellToken
    ) {
      const sellExceed = sdk
        .toBig(tradeDual.coinSell?.tradeValue ?? 0)
        .gt(tradeDual?.coinSell?.balance ?? 0);
      myLog("sellExceed", sellExceed, tradeDual.sellVol, tradeDual);
      if (
        tradeDual?.sellVol === undefined ||
        sdk.toBig(tradeDual?.sellVol).lte(0) ||
        tradeDual?.maxFeeBips === undefined ||
        tradeDual?.maxFeeBips === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk
          .toBig(tradeDual?.sellVol ?? 0)
          .minus(tradeDual?.miniSellVol ?? 0)
          .lt(0)
      ) {
        const sellMinVal = getValuePrecisionThousand(
          sdk
            .toBig(tradeDual?.miniSellVol)
            .div("1e" + tradeDual.sellToken?.decimals),
          tradeDual.sellToken.precision,
          tradeDual.sellToken.precision,
          tradeDual.sellToken.precision,
          false,
          { floor: false, isAbbreviate: true }
        );
        const mimOrderSize = sellMinVal + " " + tradeDual.sellToken.symbol;
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDualMin| ${mimOrderSize}`,
        };
      } else if (sellExceed) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDualNoEnough| ${coinSellSymbol}`,
        };
      } else if (
        tradeDual?.maxSellAmount &&
        tradeDual?.sellVol &&
        tradeDual.sellToken &&
        sdk
          .toBig(tradeDual?.coinSell?.tradeValue ?? 0)
          .gte(tradeDual?.maxSellAmount)
      ) {
        // baseLimitAmount / quoteLimitAmount;
        const sellMaxVal = getValuePrecisionThousand(
          tradeDual?.maxSellAmount,
          // sdk
          //   .toBig(tradeDual?.maxSellVol)
          //   .div("1e" + tradeDual.sellToken?.decimals),
          tradeDual.sellToken.precision,
          tradeDual.sellToken.precision,
          tradeDual.sellToken.precision,
          false,
          { floor: false, isAbbreviate: true }
        );
        const maxOrderSize = sellMaxVal + " " + tradeDual.sellToken.symbol;
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDualMax| ${maxOrderSize}`,
        };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [coinSellSymbol]);

  const refreshClick = React.useCallback(() => {
    if (refreshRef.current && tradeDual) {
      //@ts-ignore
      refreshRef.current.firstElementChild.click();
      myLog("should15sRefresh refreshRef.current click only");
      should15sRefresh(true);
    }
  }, [refreshRef, tradeDual]);
  React.useEffect(() => {
    if (isShowDual?.isShow && isShowDual?.dualInfo?.__raw__) {
      setProductInfo(isShowDual.dualInfo as R);
      refreshDual({ dualInfo: isShowDual.dualInfo as R });
    } else {
      resetTradeDual();
    }
    refreshClick();
    return () => {
      myLog("should15sRefresh cancel");
      resetTradeDual();
      should15sRefresh.cancel();
    };
  }, [isShowDual, refreshRef.current]);

  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    if (productInfo && coinSellSymbol && coinBuySymbol && LoopringAPI.defiAPI) {
      if (clearTrade) {
        setIsLoading(true);
      }

      Promise.all([
        LoopringAPI.defiAPI?.getDualPrices({
          baseSymbol: productInfo.__raw__.info.base,
          productIds: productInfo.productId,
        }),
        LoopringAPI.defiAPI?.getDualBalance(),
      ])
        .then(([dualPriceResponse, dualBalanceResponse]) => {
          const {
            tradeDual: { dualViewInfo },
          } = store.getState()._router_tradeDual;
          let dualInfo: R = _.cloneDeep(dualViewInfo) as R;
          let balance = undefined;
          if (
            (dualPriceResponse as sdk.RESULT_INFO).code ||
            (dualPriceResponse as sdk.RESULT_INFO).message
          ) {
          }
          if (dualInfo?.__raw__?.info) {
            dualInfo.__raw__.info = {
              ...dualInfo.__raw__.info,
              ...dualPriceResponse.infos[0],
            };
          }
          if (
            (dualBalanceResponse as sdk.RESULT_INFO).code ||
            (dualBalanceResponse as sdk.RESULT_INFO).message
          ) {
          } else {
            balance = dualBalanceResponse.raw_data.reduce(
              (prev: any, item: any) => {
                prev[item.coin] = item;
                return prev;
              },
              {} as any
            );
          }
          refreshDual({ dualInfo, balance });
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, globalSetup.wait);

  const walletLayer2Callback = React.useCallback(async () => {
    const {
      tradeDual: { coinSell },
    } = store.getState()._router_tradeDual;
    if (coinSell) {
      if (account.readyState === AccountStatus.ACTIVATED) {
        refreshDual({ tradeData: { ...coinSell } as T });
      } else {
        refreshDual({ tradeData: { ...coinSell, tradeValue: undefined } as T });
      }
    }
  }, [account.readyState, refreshDual]);

  useWalletLayer2Socket({ walletLayer2Callback });
  const sendRequest = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeDual.sellToken?.symbol &&
        tradeDual.maxFeeBips &&
        tradeDual.feeVol &&
        exchangeInfo
      ) {
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: tradeDual.sellToken?.tokenId ?? 0,
        };
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          req,
          account.apiKey
        );
        const {
          dualType,
          productId,
          dualPrice: { dualBid },
        } = tradeDual.dualViewInfo.__raw__.info;
        myLog("fee", tradeDual.feeVol);
        const request: sdk.DualOrderRequest = {
          clientOrderId: "",
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: tradeDual.sellToken?.tokenId ?? 0,
            volume: tradeDual.sellVol,
          },
          buyToken:
            dualType === DUAL_TYPE.DUAL_BASE
              ? {
                  tokenId: tradeDual.buyToken?.tokenId ?? 0,
                  volume: tradeDual.lessEarnVol,
                }
              : {
                  tokenId: tradeDual.buyToken?.tokenId ?? 0,
                  volume: tradeDual.greaterEarnVol,
                },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: tradeDual.maxFeeBips <= 5 ? 5 : tradeDual.maxFeeBips,
          fillAmountBOrS: false,
          fee: tradeDual.feeVol,
          baseProfit: dualBid[0].baseProfit,
          productId,
          settleRatio: tradeDual.dualViewInfo.settleRatio,
          expireTime: tradeDual.dualViewInfo.expireTime,
        };
        myLog("DualTrade request:", request);
        const response = await LoopringAPI.defiAPI.orderDual(
          request,
          account.eddsaKey.sk,
          account.apiKey
        );
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          const errorItem =
            SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
          throw new CustomErrorWithCode({
            id: ((response as sdk.RESULT_INFO)?.code ?? 700001).toString(),
            code: (response as sdk.RESULT_INFO)?.code ?? 700001,
            message:
              (response as sdk.RESULT_INFO)?.message ?? errorItem.message,
          });
        } else {
          setToastOpen({
            open: true,
            type: "success",
            content: t("labelDualSuccess", {
              symbol: coinBuySymbol,
            }),
          });
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: "error",
        content: t("labelDualFailed"), //+ ` error: ${(reason as any)?.message}`,
      });
    } finally {
      should15sRefresh(true);
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    coinBuySymbol,
    exchangeInfo,
    setToastOpen,
    should15sRefresh,
    t,
    tradeDual?.buyToken?.tokenId,
    tradeDual?.dualViewInfo?.__raw__.info,
    tradeDual?.dualViewInfo?.expireTime,
    tradeDual?.dualViewInfo?.settleRatio,
    tradeDual?.feeVol,
    tradeDual?.greaterEarnVol,
    tradeDual?.lessEarnVol,
    tradeDual?.maxFeeBips,
    tradeDual?.sellToken?.symbol,
    tradeDual?.sellToken?.tokenId,
    tradeDual?.sellVol,
  ]);

  // const isNoBalance = ;
  const onSubmitBtnClick = React.useCallback(async () => {
    const { tradeDual } = store.getState()._router_tradeDual;

    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeDual.sellVol)
    ) {
      if (!allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true });
      } else if (!dualInvest.enable) {
        setShowTradeIsFrozen({ isShow: true, type: "DualInvest" });
      } else {
        sendRequest();
      }
    } else {
      return false;
    }
  }, [tokenMap, coinSellSymbol, handleOnchange]);

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      walletLayer2Callback();
      //
    }
  }, [accountStatus]);

  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  });
  myLog("isLoading", isLoading);

  const dualTradeProps: DualWrapProps<T, I, ACD> = {
    refreshRef,
    disabled: false,
    btnInfo: {
      label: tradeMarketI18nKey,
      params: {},
    },
    isLoading,
    tokenMap: tokenMap as any,
    onRefreshData: should15sRefresh,
    onSubmitClick: onBtnClick as () => void,
    onChangeEvent: handleOnchange,
    tokenSellProps: {},
    dualCalcData: tradeDual as ACD,
    // maxSellVol: tradeDual.maxSellVol,
    tokenSell: tokenMap[coinSellSymbol ?? ""],
    btnStatus,
    accStatus: account.readyState as AccountStatus,
  }; // as ForceWithdrawProps<any, any>;
  return {
    dualTradeProps,
    serverUpdate,
    setServerUpdate,
    dualToastOpen: toastOpen,
    closeDualToast: closeToast,
  };
};
