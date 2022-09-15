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
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useTradeDual } from "../../stores";
import { useHistory } from "react-router-dom";
import { sleep } from "@loopring-web/loopring-sdk";

export const useDualTrade = <
  T extends IBData<I>,
  I,
  ACD extends DualCalcData<R>,
  R extends DualViewInfo
>() => {
  const refreshRef = React.useRef();
  const { exchangeInfo, allowTrade } = useSystem();
  const { tokenMap, marketArray } = useTokenMap();
  const history = useHistory();
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
        sdk.DUAL_TYPE.DUAL_BASE === info.dualType
          ? [info.base, info.currency]
          : [info.currency, info.base];
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
        coinSell.balance = walletMap[baseSymbol]?.count;
      }
      const dualViewInfo = makeDualViewItem(
        info,
        dualInfo.__raw__.index,
        dualInfo.__raw__.rule
      );

      if (_updateInfo.balance) {
        const calDualValue: sdk.CalDualResult = sdk.calcDual({
          ...dualInfo.__raw__,
          balance: _updateInfo.balance,
          // feeVol,
          sellToken: tokenMap[baseSymbol],
          buyToken: tokenMap[quoteSymbol],
          sellAmount: coinSell.tradeValue?.toString() ?? undefined,
          dualMarket: dualMarketMap[`DUAL-${info.base}-${info.currency}`],
        });
        _updateInfo = {
          ..._updateInfo,
          ...(calDualValue as TradeDual<R>),
        };
      }
      updateTradeDual({ ..._updateInfo, dualViewInfo, coinSell });
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
      // myLog("sellExceed", sellExceed, tradeDual.sellVol, tradeDual);
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
        const sellMaxVal = getValuePrecisionThousand(
          tradeDual?.maxSellAmount,
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
            dualType === sdk.DUAL_TYPE.DUAL_BASE
              ? {
                  tokenId:
                    tokenMap[tradeDual.greaterEarnTokenSymbol]?.tokenId ?? 0,
                  volume: tradeDual.greaterEarnVol,
                }
              : {
                  tokenId:
                    tokenMap[tradeDual.lessEarnTokenSymbol]?.tokenId ?? 0,
                  volume: tradeDual.lessEarnVol,
                },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: tradeDual.maxFeeBips,
          fillAmountBOrS: false,
          fee: tradeDual.feeVol ?? "0",
          baseProfit: dualBid[0].baseProfit,
          productId,
          settleRatio: tradeDual.dualViewInfo.settleRatio.replace(sdk.SEP, ""), //sdk.toBig(tradeDual.dualViewInfo.settleRatio).f,
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
          const errorItem = /DUAL_PRODUCT_STOPPED/gi.test(
            (response as sdk.RESULT_INFO).message ?? ""
          )
            ? SDK_ERROR_MAP_TO_UI[115003]
            : SDK_ERROR_MAP_TO_UI[700001];
          throw new CustomErrorWithCode({ ...response, ...errorItem } as any);
        } else {
          setToastOpen({
            open: true,
            type: "success",
            content: t("labelDualSuccess", {
              symbol: coinBuySymbol,
            }),
          });
          await sleep(2000);
          history.push("/invest/balance");
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: "error",
        content:
          t("labelDualFailed") + (reason as CustomErrorWithCode)?.messageKey ??
          ` error: ${t((reason as CustomErrorWithCode)?.messageKey)}`,
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
