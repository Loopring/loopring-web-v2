import React from "react";
import {
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
  dualCurrentPrice,
  getTimestampDaysLater,
  makeDualViewItem,
  makeWalletLayer2,
  TradeDual,
  useAmount,
  useSubmitBtn,
  useToast,
  useWalletLayer2Socket,
} from "@loopring-web/core";
import _ from "lodash";

import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE, TokenInfo } from "@loopring-web/loopring-sdk";

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
  currentPrice,
}: {
  sellAmount: string | undefined;
  info: sdk.DualProductAndPrice;
  index: sdk.DualIndex;
  rule: sdk.DualRulesCoinsInfo;
  balance: { [key: string]: sdk.DualBalance };
  sellToken: TokenInfo;
  buyToken: TokenInfo;
  feeVol: string | undefined;
  currentPrice: {
    symbol: string;
    currentPrice: number;
  };
}): CalDualResult<R> {
  const sellVol = sdk
    .toBig(sellAmount ? sellAmount : 0)
    .times("1e" + sellToken.decimals);
  const dualViewInfo = makeDualViewItem(info, index, rule, currentPrice);
  // const lessBuyUnit = sdk.toBig(strike).div(10000).plus(1);//.times(targetPrice);
  // dualViewInfo.settleRatio
  let lessEarnVol,
    lessEarnTokenSymbol,
    greaterEarnVol,
    greaterEarnTokenSymbol,
    maxSellVol,
    miniSellVol,
    feeTokenSymbol,
    maxFeeBips;
  myLog("settleRatio", dualViewInfo.settleRatio, dualViewInfo);
  if (info.dualType === DUAL_TYPE.DUAL_BASE) {
    lessEarnVol = sellVol
      .times(1 + dualViewInfo.settleRatio)
      .times(dualViewInfo.strike);
    lessEarnTokenSymbol = buyToken.symbol;
    greaterEarnVol = sellVol.times(1 + dualViewInfo.settleRatio);
    greaterEarnTokenSymbol = sellToken.symbol;
    miniSellVol = rule.baseMin;
    maxSellVol = BigNumber.max(
      rule.baseMax,
      info.dualPrice.dualBid[0].baseQty,
      balance[sellToken.symbol].free
    );
    /** calc current maxFeeBips **/
    // feeVol = sdk.toBig(lessEarnVol).times(feeBips);//.div(10000);
    feeTokenSymbol = buyToken.symbol;
    maxFeeBips = BigNumber.max(
      sdk
        .toBig(feeVol ?? 0)
        .times(10000)
        .div(lessEarnVol)
        .toNumber(),
      5
    );
    // BigNumber.max(sdk.toBig(feeBips)
    // .times(10000),5)
    /** calc current maxFeeBips **/
    // maxFeeBips = Math.ceil(
    // 	sdk.toBig(feeVol).times(10000).div(lessEarnVol).toNumber()
    // );
  } else {
    lessEarnVol = sellVol.times(1 + dualViewInfo.settleRatio);
    lessEarnTokenSymbol = sellToken.symbol;
    greaterEarnVol = sellVol
      .times(1 + dualViewInfo.settleRatio)
      .div(dualViewInfo.strike);
    greaterEarnTokenSymbol = buyToken.symbol;
    miniSellVol = rule.currencyMin;
    maxSellVol = BigNumber.max(
      rule.currencyMax,
      sdk.toBig(info.dualPrice.dualBid[0].baseQty).times(dualViewInfo.strike),
      balance[sellToken.symbol].free
    );
    /** calc current maxFeeBips **/
    feeTokenSymbol = buyToken.symbol;
    maxFeeBips = BigNumber.max(
      sdk
        .toBig(feeVol ?? 0)
        .times(10000)
        .div(greaterEarnVol)
        .toNumber(),
      5
    );
  }
  return {
    sellVol: sellVol.toString(),
    lessEarnVol: lessEarnVol.toString(),
    lessEarnTokenSymbol,
    greaterEarnVol: greaterEarnVol.toString(),
    greaterEarnTokenSymbol,
    miniSellVol,
    maxSellVol: maxSellVol.toString(),
    maxFeeBips: maxFeeBips.toNumber(),
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
  const { exchangeInfo, allowTrade } = useSystem();
  const { tokenMap, marketArray } = useTokenMap();
  const { amountMap, getAmount, status: amountStatus } = useAmount();
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
  const refreshRef = React.createRef();
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
    async ({
      dualInfo = productInfo,
      tradeData,
      balance,
    }: {
      dualInfo?: R;
      tradeData?: T;
      balance?: { [key: string]: sdk.DualBalance };
    }) => {
      let walletMap: any = {},
        feeVol: string | undefined = undefined;
      const { info } = dualInfo.__raw__;

      let _updateInfo: Partial<TradeDual<R>> = {
        dualViewInfo: dualInfo,
      };
      if (productInfo?.productId === dualInfo.productId) {
        _updateInfo = {
          ...(tradeDual as TradeDual<R>),
          ..._updateInfo,
        };
      } else {
        resetTradeDual();
      }
      if (balance) {
        _updateInfo.balance = balance;
      }

      const [baseSymbol, quoteSymbol] = DUAL_TYPE.DUAL_BASE
        ? [info.base, info.quote]
        : [info.quote, info.base];
      setSellBuySymbol([baseSymbol, quoteSymbol]);

      let coinSell: T =
        tradeData && tradeData.belong
          ? tradeData
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
      if (
        account.readyState == AccountStatus.ACTIVATED &&
        amountMap &&
        existedMarket
      ) {
        walletMap = makeWalletLayer2(true).walletMap;
        const amountMarket = amountMap[existedMarket.market];
        coinSell.balance = walletMap[baseSymbol]?.count;
        // dualCalcDataInit.coinSell.balance = walletMap[coinSellSymbol]?.count;
        // dualCalcDataInit.coinBuy.balance = walletMap[coinBuySymbol]?.count;
        feeVol = amountMarket[quoteSymbol].tradeCost;
      }
      if (_updateInfo.balance) {
        const calDualValue = calDual({
          ...dualInfo.__raw__,
          balance: _updateInfo.balance,
          feeVol,
          sellToken: tokenMap[baseSymbol],
          buyToken: tokenMap[quoteSymbol],
          sellAmount: coinSell.tradeValue?.toString() ?? undefined,
          currentPrice: dualCurrentPrice(`dual-${info.base}-${info.quote}`),
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
      amountMap,
      marketArray,
      productInfo,
      resetTradeDual,
      tokenMap,
      tradeDual,
      updateTradeDual,
    ]
  );

  const handleOnchange = _.debounce(({ tradeData }: { tradeData: T }) => {
    refreshDual({ tradeData });
  }, globalSetup.wait);

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
      myLog("sellExceed", sellExceed, "sellVol", tradeDual.sellVol, tradeDual);
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
          .toBig(tradeDual?.sellVol)
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
        tradeDual?.maxSellVol &&
        tradeDual?.sellVol &&
        tradeDual.sellToken &&
        sdk.toBig(tradeDual.sellVol).gte(tradeDual?.maxSellVol)
      ) {
        const sellMaxVal = getValuePrecisionThousand(
          sdk
            .toBig(tradeDual?.maxSellVol)
            .div("1e" + tradeDual.sellToken?.decimals),
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

  React.useEffect(() => {
    if (isShowDual.isShow && isShowDual.dualInfo?.__raw__) {
      setProductInfo(isShowDual.dualInfo as R);
      refreshDual({ dualInfo: isShowDual.dualInfo as R });
    } else {
      resetTradeDual();
    }
  }, [isShowDual]);
  React.useEffect(() => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      amountStatus === SagaStatus.UNSET
    ) {
      refreshDual({});
    }
  }, [account.readyState, amountStatus]);
  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    myLog("should15sRefresh", clearTrade);
    if (productInfo && coinSellSymbol && coinBuySymbol && LoopringAPI.defiAPI) {
      // updateDepth()
      // getDualMap();
      if (clearTrade) {
        setIsLoading(true);
      }
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        coinSellSymbol &&
        coinBuySymbol
      ) {
        let { market } = sdk.getExistedMarket(
          marketArray,
          coinSellSymbol,
          coinBuySymbol
        );
        getAmount({ market });
      }
      Promise.all([
        LoopringAPI.defiAPI?.getDualPrices({
          baseSymbol: productInfo.__raw__.info.base,
          productIds: productInfo.productId,
        }),
        LoopringAPI.defiAPI?.getDualBalance(),
      ]).then(([dualPrices, dualBalanceMap]) => {
        const {
          tradeDual: { dualViewInfo },
        } = store.getState()._router_tradeDual;
        let dualInfo: R = {
          ...dualViewInfo,
        } as R;
        let balance = undefined;
        if (
          (dualPrices as sdk.RESULT_INFO).code ||
          (dualPrices as sdk.RESULT_INFO).message
        ) {
        } else {
          dualInfo.__raw__.info.dualPrice = dualPrices;
        }
        if (
          (dualBalanceMap as sdk.RESULT_INFO).code ||
          (dualBalanceMap as sdk.RESULT_INFO).message
        ) {
        } else {
          balance = dualBalanceMap;
        }
        refreshDual({ dualInfo, balance });
        setIsLoading(false);
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
    if (accountStatus === SagaStatus.UNSET && coinSellSymbol && coinBuySymbol) {
      walletLayer2Callback();
      if (account.readyState === AccountStatus.ACTIVATED) {
        let { market } = sdk.getExistedMarket(
          marketArray,
          coinSellSymbol,
          coinBuySymbol
        );
        getAmount({ market });
      }
    }
  }, [coinSellSymbol, coinBuySymbol, account.readyState, accountStatus]);

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
  const dualTradeProps = React.useMemo(() => {
    return {
      refreshRef,
      disabled:
        account.readyState === AccountStatus.ACTIVATED && !tradeDual?.feeVol,
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isLoading,
      onRefreshData: should15sRefresh,
      onSubmitClick: onSubmitBtnClick,
      onChangeEvent: handleOnchange,
      tokenSellProps: {},
      dualCalcData: tradeDual,
      // maxSellVol: tradeDual.maxSellVol,
      tokenSell: tokenMap[coinSellSymbol ?? ""],
      btnStatus,
      accStatus: account.readyState,
    };
  }, [
    account.readyState,
    btnStatus,
    coinSellSymbol,
    handleOnchange,
    isLoading,
    onBtnClick,
    refreshRef,
    sendRequest,
    should15sRefresh,
    tokenMap,
    tradeDual,
    tradeMarketI18nKey,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    dualTradeProps: dualTradeProps as unknown as DualWrapProps<T, I, ACD>,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    serverUpdate,
    setServerUpdate,
    dualToastOpen: toastOpen,
    // setDualTostOpen: setToastOpen,
    closeDualToast: closeToast,
  };
};
