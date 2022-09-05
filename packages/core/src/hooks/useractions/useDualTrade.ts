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
  DualCalcData,
  DualViewInfo,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";

import {
  DefaultFeeBips,
  dualCurrentPrice,
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
import { DUAL_TYPE, toBig, TokenInfo } from "@loopring-web/loopring-sdk";

import {
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
  walletLayer2Service,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useDualMap, useTradeDual } from "../../stores";
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
  const [[coinSellSymbol, coinBuySymbol], setSellBuySymbol] =
    React.useState<[string, string] | undefined>(undefined);
  // });
  const [isLoading, setIsLoading] = React.useState(false);
  const [productInfo, setProductInfo] = React.useState<R>(undefined as any);
  const {
    marketMap: defiMarketMap,
    // status: defiMarketStatus,
  } = useDualMap();

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
      if (productInfo.productId === dualInfo.productId) {
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

      const coinSell: T =
        tradeData && tradeData.belong
          ? tradeData
          : {
              balance: 0,
              tradeValue: undefined,
              belong: baseSymbol,
            };
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
          sellAmount: tradeData ? tradeData.tradeValue?.toString() : undefined,
          currentPrice: dualCurrentPrice(`dual-${info.base}-${info.quote}`),
        });
        _updateInfo = {
          ..._updateInfo,
          ...(calDualValue as TradeDual<R>),
        };
      }
      updateTradeDual({ ..._updateInfo, coinSell });

      // myLog(`buyMinAmtInfo,sellMinAmtInfo: AMM-${market}, ${_tradeData[ 'buy' ].belong}`, buyMinAmtInfo, sellMinAmtInfo)

      // takerRate = buyMinAmtInfo ? buyMinAmtInfo.userOrderInfo.takerRate : 0;

      // let dualCalcDataInit: DualCalcData = {
      // 	dualInfo,
      // 	sellToken: tokenMap[ info.base ],
      // 	buyToken: tokenMap[ info.quote ],
      // 	maxSellVol
      // 	miniSellVol
      // 	dualInfo
      // 	sellVol
      // 	buyVol
      // 	sellToken
      // 	buyToken
      // 	fee
      // 	feeRaw
      // 	// request
      // 	//  sellVol:0,
      // 	//  buyVol:0
      // }
      // const type = info.dualType;
      // resetTradeDual({
      //   dualInfo,
      // });
      // const { marketMap: dualMarketMap } = store.getState().invest.dualMap;
      // const marketInfo = dualMarketMap[market];
      // let dualCalcDataInit: Partial<DualCalcData<any>> = {
      //   ...tradeDual.dualCalcData,
      //   coinSell: {
      //     belong: coinSellSymbol,
      //     balance: undefined,
      //     tradeValue:
      //       tradeDual.dualCalcData?.coinSell?.belong === coinSellSymbol
      //         ? tradeDual.dualCalcData?.coinSell?.tradeValue
      //         : undefined,
      //   },
      //   coinBuy: {
      //     belong: coinBuySymbol,
      //     balance: undefined,
      //     tradeValue:
      //       tradeDual.dualCalcData?.coinBuy?.belong === coinBuySymbol
      //         ? tradeDual.dualCalcData?.coinBuy?.tradeValue
      //         : undefined,
      //   },
      // };
      // let _feeInfo = feeInfo
      //   ? feeInfo
      //   : {
      //       fee: tradeDual.fee,
      //       feeRaw: tradeDual.feeRaw,
      //     };

      // if (account.readyState === AccountStatus.ACTIVATED) {
      //   if (clearTrade === true) {
      //     walletLayer2Service.sendUserUpdate();
      //   }
      //
      // }

      myLog(
        "resetDefault defi clearTrade",
        dualCalcDataInit.coinSell,
        tradeDual.dualCalcData?.coinSell?.tradeValue,
        clearTrade,
        feeInfo
      );
      if (
        tradeDual.market !== market ||
        clearTrade ||
        tradeDual.dualCalcData?.coinSell?.tradeValue === undefined
      ) {
        dualCalcDataInit.coinSell.tradeValue = undefined;
        dualCalcDataInit.coinBuy.tradeValue = undefined;

        updateTradeDual({});
        myLog("resetDefault defi clearTrade", dualCalcDataInit, marketInfo);
      } else {
        const type = DUAL_TYPE.DUAL_CURRENCY;
        const _tradeDual = {
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? "",
            [quoteSymbol]: marketInfo?.quoteVolume ?? "",
          } as any,
          fee: _feeInfo?.fee.toString(),
          feeRaw: _feeInfo?.feeRaw.toString(),
          depositPrice: marketInfo?.depositPrice ?? "0",
          withdrawPrice: marketInfo?.withdrawPrice ?? "0",
        };
        const tradeData = {
          ...dualCalcDataInit[type],
          tradeValue: tradeDual.dualCalcData[type]?.tradeValue ?? undefined,
        };
        handleOnchange({ tradeData, _tradeDual });
      }

      setIsLoading(false);
    },
    []
  );

  const handleOnchange = _.debounce(
    ({}: // tradeData,
    // _tradeDual = {},
    {
      tradeData: T;
      _tradeDual?: Partial<TradeDual>;
    }) => {
      // updateTradeDual({
      // 	// market,
      // 	// dualCalcData: {
      // 	//   ..._dualCalcData,
      // 	// },
      // });
    },
    globalSetup.wait
  );

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const tradeDual = store.getState()._router_tradeDual.tradeDual;

    if (account.readyState === AccountStatus.ACTIVATED) {
      // const sellExceed = sdk
      //   .toBig(tradeDual.dualCalcData?.coinSell?.tradeValue ?? 0)
      //   .gt(tradeDual.dualCalcData?.coinSell?.balance ?? 0);
      // myLog(
      //   "sellExceed",
      //   sellExceed,
      //   "sellVol",
      //   tradeDual.sellVol,
      //   "buyVol",
      //   tradeDual.buyVol,
      //   "feeRaw",
      //   tradeDual.feeRaw,
      //   "buy market balance",
      //   //@ts-ignore
      //   defiMarketMap && defiMarketMap[market]?.baseVolume
      // );
      // if (
      //   tradeDual?.sellVol === undefined ||
      //   sdk.toBig(tradeDual?.sellVol).lte(0) ||
      //   tradeDual?.buyVol === undefined ||
      //   sdk.toBig(tradeDual?.buyVol).lte(0) ||
      //   tradeDual?.maxFeeBips === undefined ||
      //   tradeDual?.maxFeeBips === 0
      // ) {
      //   return {
      //     tradeBtnStatus: TradeBtnStatus.DISABLED,
      //     label: "labelEnterAmount",
      //   };
      // } else if (
      //   sdk
      //     .toBig(tradeDual?.sellVol)
      //     .minus(tradeDual?.miniSellVol ?? 0)
      //     .lt(0)
      // ) {
      //   return {
      //     tradeBtnStatus: TradeBtnStatus.DISABLED,
      //     label: `labelDualMin| ${getValuePrecisionThousand(
      //       sdk
      //         .toBig(tradeDual?.miniSellVol ?? 0)
      //         .div("1e" + tokenMap[coinSellSymbol]?.decimals),
      //       tokenMap[coinSellSymbol].precision,
      //       tokenMap[coinSellSymbol].precision,
      //       tokenMap[coinSellSymbol].precision,
      //       false,
      //       { floor: false, isAbbreviate: true }
      //     )} ${coinSellSymbol}`,
      //   };
      // } else if (sellExceed) {
      //   return {
      //     tradeBtnStatus: TradeBtnStatus.DISABLED,
      //     label: `labelDualNoEnough| ${coinSellSymbol}`,
      //   };
      // } else {
      //   return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      // }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [defiMarketMap, tradeDual.dualCalcData, tokenMap, coinSellSymbol]);

  React.useEffect(() => {
    if (isShowDual.isShow && isShowDual.dualInfo?.__raw__) {
      setProductInfo(isShowDual.dualInfo);
      resetDefault(isShowDual.dualInfo);
    } else {
      resetTradeDual();
    }
  }, [isShowDual]);
  React.useEffect(() => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      amountStatus === SagaStatus.UNSET
    ) {
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
      Promise.all([
        LoopringAPI.defiAPI?.getDualPrices({
          baseSymbol: productInfo.__raw__.info.base,
          productIds: productInfo.productId,
        }),
        LoopringAPI.defiAPI?.getDualBalance(),
      ]).then(([dualProductAndPrices, dualBalanceMap]) => {
        let _shouldUpdate = {};
        if (
          (dualProductAndPrices as sdk.RESULT_INFO).code ||
          (dualProductAndPrices as sdk.RESULT_INFO).message
        ) {
        } else {
        }
        if (
          (dualBalanceMap as sdk.RESULT_INFO).code ||
          (dualBalanceMap as sdk.RESULT_INFO).message
        ) {
        } else {
        }
      });
      if (account.readyState === AccountStatus.ACTIVATED) {
        let { market } = sdk.getExistedMarket(
          marketArray,
          coinSellSymbol,
          coinBuySymbol
        );
        getAmount({ market });
      }
      // Promise.all([
      //   // LoopringAPI.defiAPI?.getDualPrices({
      //   //   baseSymbol,
      //   //   productIds,
      //   // }),
      //   // LoopringAPI.defiAPI?.getDualBalance(),
      //   //
      //   // account.readyState === AccountStatus.ACTIVATED
      //   //   ? getFee()
      //   //   : Promise.resolve(undefined),
      // ]).then(
      //   (
      //     [
      //       // dualPrice, dualBalance, _feeInfo
      //     ]
      //   ) => {
      //     //   if (
      //     //     (dualPrice as sdk.RESULT_INFO).code ||
      //     //     (dualPrice as sdk.RESULT_INFO).message
      //     //   ) {
      //     //     setServerUpdate(true);
      //     //   } else {
      //     //   }
      //     //   if (
      //     //     (dualBalance as sdk.RESULT_INFO).code ||
      //     //     (dualBalance as sdk.RESULT_INFO).message
      //     //   ) {
      //     //     setServerUpdate(true);
      //     //   } else {
      //     //   }
      //     //   resetDefault(clearTrade, {
      //     //     fee: tradeDual.fee,
      //     //     feeRaw: tradeDual.feeRaw,
      //     //     ..._feeInfo,
      //     //   });
      //   }
      // );
    }
  }, globalSetup.wait);

  const walletLayer2Callback = React.useCallback(async () => {
    let tradeValue: any = undefined;

    let dualCalcDataInit: Partial<DualCalcData> = {
      coinSell: {
        belong: coinSellSymbol,
        balance: undefined,
      },
      coinBuy: {
        belong: coinBuySymbol,
        balance: undefined,
      },
      ...(tradeDual?.dualCalcData ?? {}),
    };
    if (tradeDual.dualCalcData) {
      tradeValue = tradeDual?.dualCalcData[type]?.tradeValue ?? undefined;
    }
    if (dualCalcDataInit[type]?.belong) {
      let walletMap: any;
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2(true).walletMap;
        dualCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: walletMap[coinSellSymbol]?.count,
        };
        dualCalcDataInit.coinBuy = {
          belong: coinBuySymbol,
          balance: walletMap[coinBuySymbol]?.count,
        };
      } else {
        dualCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: undefined,
        };
        dualCalcDataInit.coinBuy = {
          belong: coinBuySymbol,
          balance: undefined,
        };
      }
      const tradeData = {
        ...dualCalcDataInit[type],
        tradeValue,
      };
      myLog("resetDefault Dual walletLayer2Callback", tradeData);
      handleOnchange({ tradeData });
    }
  }, [
    account.readyState,
    coinBuySymbol,
    coinSellSymbol,
    handleOnchange,
    tradeDual.dualCalcData,
  ]);

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
        // const request: sdk.DualOrderRequest = {
        //   exchange: exchangeInfo.exchangeAddress,
        //   storageId: storageId.orderId,
        //   accountId: account.accountId,
        //   sellToken: {
        //     tokenId: tradeDual.sellToken?.tokenId ?? 0,
        //     volume: tradeDual.sellVol,
        //   },
        //   buyToken: {
        //     tokenId: tradeDual.buyToken?.tokenId ?? 0,
        //     volume: tradeDual.buyVol,
        //   },
        //   validUntil: getTimestampDaysLater(DAYS),
        //   maxFeeBips: tradeDual.maxFeeBips <= 5 ? 5 : tradeDual.maxFeeBips,
        //   fillAmountBOrS: false,
        //   fee: tradeDual.feeRaw,
        //   taker: "",
        //   eddsaSignature: "",
        //   // taker:
        //   // new BN(ethUtil.toBuffer(request.taker)).toString(),
        // };
        // myLog("DualTrade request:", request);
        // const response = await LoopringAPI.defiAPI.orderDual(
        //   request,
        //   account.eddsaKey.sk,
        //   account.apiKey
        // );
        // if (
        //   (response as sdk.RESULT_INFO).code ||
        //   (response as sdk.RESULT_INFO).message
        // ) {
        //   const errorItem =
        //     SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
        //   throw new CustomErrorWithCode({
        //     id: ((response as sdk.RESULT_INFO)?.code ?? 700001).toString(),
        //     code: (response as sdk.RESULT_INFO)?.code ?? 700001,
        //     message:
        //       (response as sdk.RESULT_INFO)?.message ?? errorItem.message,
        //   });
        // } else {
        // setToastOpen({
        //   open: true,
        //   type: "success",
        //   content: t("labelInvestSuccess", {
        //     type: isJoin
        //       ? t("labelInvestDefDeposit")
        //       : t("labelInvestDefWithdraw"),
        //     symbol: coinBuySymbol,
        //   }),
        // });
        // }
      } else {
        throw new Error("api not ready");
      }
    } catch (reason) {
      // setToastOpen({
      //   open: true,
      //   type: "error",
      //   content: t("labelInvestFailed"), //+ ` error: ${(reason as any)?.message}`,
      // });
    } finally {
      setConfirmShowLimitBalance(false);
      should15sRefresh(true);
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    coinBuySymbol,
    exchangeInfo,
    should15sRefresh,
    t,
    tradeDual.buyToken?.tokenId,
    tradeDual.buyVol,
    tradeDual.feeRaw,
    tradeDual.maxFeeBips,
    tradeDual.sellToken?.symbol,
    tradeDual.sellToken?.tokenId,
    tradeDual.sellVol,
    tradeDual.type,
  ]);

  const handleSubmit = React.useCallback(async () => {
    const { tradeDual } = store.getState()._router_tradeDual;

    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeDual.buyVol)
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
  }, [
    account.readyState,
    account.eddsaKey?.sk,
    tokenMap,
    exchangeInfo,
    sendRequest,
    setToastOpen,
    t,
  ]);
  // const isNoBalance = ;
  const onSubmitBtnClick = React.useCallback(async () => {
    const tradeDual = store.getState()._router_tradeDual.tradeDual;
    if (
      tradeDual?.maxSellVol &&
      tradeDual?.sellVol &&
      sdk.toBig(tradeDual.sellVol).gte(tradeDual?.maxSellVol)
    ) {
      if (
        sdk
          .toBig(tradeDual?.maxSellVol ?? 0)
          .minus(tradeDual.miniSellVol ?? 0)
          .toString()
          .startsWith("-")
      ) {
        setConfirmShowNoBalance(true);
      } else {
        setConfirmShowLimitBalance(true);
        const tradeValue = getValuePrecisionThousand(
          sdk
            .toBig(tradeDual?.maxSellVol)
            .div("1e" + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: true }
        ).replace(",", "");
        // @ts-ignore
        const oldTrade = (tradeDual?.dualCalcData[type] ?? {}) as unknown as T;
        handleOnchange({
          tradeData: {
            ...oldTrade,
            tradeValue,
          },
        });
        // handleOnchange()
      }
    } else {
      handleSubmit();
    }
  }, [tokenMap, coinSellSymbol, handleOnchange, handleSubmit]);

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
      onConfirm: sendRequest,
      refreshRef,
      disabled:
        account.readyState === AccountStatus.ACTIVATED && !tradeDual?.feeRaw,
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isLoading,
      onRefreshData: should15sRefresh,
      onSubmitClick: onBtnClick as () => void,
      onChangeEvent: handleOnchange,
      tokenSellProps: {},
      dualCalcData: {
        ...tradeDual.dualCalcData,
      },
      maxSellVol: tradeDual.maxSellVol,
      confirmShowLimitBalance,
      tokenSell: tokenMap[coinSellSymbol],
      btnStatus,
      accStatus: account.readyState,
    };
  }, []); // as ForceWithdrawProps<any, any>;
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
