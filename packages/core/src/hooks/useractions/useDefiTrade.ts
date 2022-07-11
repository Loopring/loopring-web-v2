import React from "react";
import {
  DeFiChgType,
  DeFiWrapProps,
  TradeBtnStatus,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  DeFiCalcData,
  globalSetup,
  IBData,
  MarketType,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";

import {
  useSubmitBtn,
  makeWalletLayer2,
  useWalletLayer2Socket,
  useWalletLayer2,
} from "@loopring-web/core";
import _ from "lodash";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  useTokenMap,
  useAccount,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  walletLayer2Service,
  useSystem,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useDefiMap, useTradeDefi } from "../../stores";

export const useDefiTrade = <
  T extends IBData<I>,
  I,
  ACD extends DeFiCalcData<T>
>({
  isJoin = true,
  setToastOpen,
  market = "",
}: {
  market: string;
  isJoin: boolean;
  setToastOpen: (props: {
    open: boolean;
    content: JSX.Element | string;
    type: "success" | "error" | "warning" | "info";
  }) => void;
}) => {
  const { t } = useTranslation(["common"]);
  // const history = useHistory();
  // const { search } = useLocation();

  const { marketMap: defiMarketMap } = useDefiMap();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStoB, setIsStoB] = React.useState(true);
  const [confirmShow, setConfirmShow] = React.useState<boolean>(false);
  const { tokenMap, coinMap } = useTokenMap();
  const { account } = useAccount();
  const { walletLayer2, status: walletLayer2Status } = useWalletLayer2();
  const { exchangeInfo } = useSystem();
  const { tradeDefi, updateTradeDefi } = useTradeDefi();
  const [{ coinSellSymbol, coinBuySymbol }, setSymbol] = React.useState(() => {
    if (isJoin) {
      const [, coinBuySymbol, coinSellSymbol] =
        market.match(/(\w+)-(\w+)/i) ?? [];
      return { coinBuySymbol, coinSellSymbol };
    } else {
      const [, coinSellSymbol, coinBuySymbol] =
        market.match(/(\w+)-(\w+)/i) ?? [];
      return { coinBuySymbol, coinSellSymbol };
    }
  });

  const getFee = React.useCallback(
    async (
      requestType:
        | sdk.OffchainFeeReqType.DEFI_JOIN
        | sdk.OffchainFeeReqType.DEFI_EXIT
    ): Promise<{ fee: string; feeRaw: string } | undefined> => {
      if (
        LoopringAPI.userAPI &&
        coinSellSymbol &&
        account.readyState === AccountStatus.ACTIVATED &&
        tokenMap
      ) {
        const feeToken: sdk.TokenInfo = tokenMap[coinBuySymbol];

        const request: sdk.GetOffchainFeeAmtRequest = {
          accountId: account.accountId,
          requestType,
          market,
        };

        const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(
          request,
          account.apiKey
        );

        const feeRaw = fees[coinBuySymbol] ? fees[coinBuySymbol].fee : "0";
        const fee = sdk
          .toBig(feeRaw)
          .div("1e" + feeToken.decimals)
          .toString();

        myLog("new fee:", fee.toString());
        return {
          fee: fee,
          feeRaw: feeRaw,
          // fees,
        };
      }
    },
    [
      coinSellSymbol,
      account.readyState,
      account.accountId,
      account.apiKey,
      tokenMap,
      coinBuySymbol,
      market,
    ]
  );

  const walletLayer2Callback = React.useCallback(async () => {}, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const handleOnchange = React.useCallback(
    ({ tradeData, type }: { type: DeFiChgType; tradeData: T }) => {
      const marketInfo = defiMarketMap[market];
      let _deFiCalcData: DeFiCalcData<any> | undefined = tradeDefi.deFiCalcData;
      let calcValue;
      if (
        tradeData &&
        tradeDefi.defiBalances &&
        coinBuySymbol &&
        tradeDefi?.defiBalances[coinBuySymbol]
      ) {
        const inputValue =
          type === DeFiChgType.coinSell
            ? {
                sellAmount: tradeData?.tradeValue?.toString() ?? "0",
              }
            : {
                buyAmount: tradeData?.tradeValue?.toString() ?? "0",
              };
        calcValue = sdk.calcDefi({
          isJoin,
          isInputSell: type === DeFiChgType.coinSell ? true : false,
          ...inputValue,
          feeVol: tradeDefi.feeRaw,
          marketInfo,
          tokenSell: tokenMap[coinSellSymbol],
          tokenBuy: tokenMap[coinBuySymbol],
          buyTokenBalanceVol: sdk
            .toBig(tradeDefi?.defiBalances[coinBuySymbol]?.total ?? 0)
            .minus(tradeDefi?.defiBalances[coinBuySymbol]?.locked ?? 0)
            .toString(),
        });
        const sellAmount = sdk
          .toBig(calcValue?.sellVol ?? 0)
          .div("1e" + tokenMap[coinSellSymbol]?.decimals)
          .toFixed(tokenMap[coinSellSymbol]?.precision);
        const buyAmount = sdk
          .toBig(calcValue?.sellVol ?? 0)
          .div("1e" + tokenMap[coinBuySymbol]?.decimals)
          .toFixed(tokenMap[coinBuySymbol]?.precision);
        // @ts-ignore
        _deFiCalcData = {
          ..._deFiCalcData,
          coinSell:
            type === DeFiChgType.coinSell
              ? tradeData
              : { ..._deFiCalcData?.coinSell, tradeValue: sellAmount },
          coinBuy:
            type === DeFiChgType.coinBuy
              ? tradeData
              : { ..._deFiCalcData?.coinBuy, tradeValue: buyAmount },
        };
        if (type === DeFiChgType.coinSell) {
        }
      }
      updateTradeDefi({
        ...tradeDefi,
        ...calcValue,
        deFiCalcData: _deFiCalcData,
      });
    },
    [
      defiMarketMap,
      market,
      tradeDefi.defiBalances,
      tradeDefi.feeRaw,
      updateTradeDefi,
      isJoin,
      tokenMap,
      coinSellSymbol,
      coinBuySymbol,
    ]
  );
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi;

    if (account.readyState === AccountStatus.ACTIVATED) {
      // const type = limitTradeData.type === TradeProType.sell ? 'quote' : 'base';
      if (
        tradeDefi?.sellVol === undefined ||
        tradeDefi?.buyVol === undefined ||
        tradeDefi?.sellCoin ||
        tradeDefi?.buyCoin
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk
          .toBig(tradeDefi?.deFiCalcData?.coinSell?.tradeValue ?? "")
          .gt(tradeDefi?.deFiCalcData?.coinSell?.balance ?? 0)
      ) {
        return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: "" };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [tradeDefi, tokenMap]);
  const resetDefault = _.debounce(async (shouldFeeUpdate?: boolean) => {
    let feeInfo,
      // defiBalances,
      // userBalances: any = {},
      walletMap: any = {};
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i) ?? [];
    const marketInfo = defiMarketMap[market];
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      (shouldFeeUpdate || market !== tradeDefi.market)
    ) {
      walletMap = makeWalletLayer2(true).walletMap;
      [feeInfo] = await Promise.all([
        getFee(
          isJoin
            ? sdk.OffchainFeeReqType.DEFI_JOIN
            : sdk.OffchainFeeReqType.DEFI_EXIT
        ),
      ]);
    }
    const deFiCalcDataInit = tradeDefi.deFiCalcData;

    const [AtoB, BtoA] = marketInfo
      ? isJoin
        ? [marketInfo.depositPrice, marketInfo.withdrawPrice]
        : [marketInfo.withdrawPrice, marketInfo.depositPrice]
      : ["0", "0"];
    myLog();

    updateTradeDefi({
      type: "LIDO",
      market: market as MarketType,
      isStoB,
      sellVol: "0",
      buyVol: "0",
      sellCoin: coinMap[coinSellSymbol],
      buyCoin: coinMap[coinBuySymbol],
      deFiCalcData: {
        ...deFiCalcDataInit,
        coinSell: {
          belong: coinSellSymbol,
          balance: walletMap[coinSellSymbol]?.count,
          tradeValue: undefined,
        },
        coinBuy: {
          belong: coinBuySymbol,
          balance: walletMap[coinBuySymbol]?.count,
          tradeValue: undefined,
        },
        AtoB,
        BtoA,
        fee: feeInfo?.fee?.toString() ?? "",
      },
      defiBalances: {
        [baseSymbol]: marketInfo?.baseVolume ?? "",
        [quoteSymbol]: marketInfo?.quoteVolume ?? "",
      } as any,
      fee: feeInfo?.fee.toString(),
      feeRaw: feeInfo?.feeRaw.toString(),
      depositPrice: marketInfo?.depositPrice ?? "0",
      withdrawPrice: marketInfo?.withdrawPrice ?? "0",
    });
  }, globalSetup.wait);

  const sendRequest = React.useCallback(async () => {
    try {
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeDefi.sellCoin.name &&
        exchangeInfo
      ) {
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: tokenMap[tradeDefi.sellCoin.name]?.tokenId ?? 0,
        };
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          req,
          account.apiKey
        );
        const request: sdk.DefiOrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: tokenMap[tradeDefi.sellCoin.name]?.tokenId ?? 0,
            volume: tradeDefi.sellVol,
          },
          buyToken: {
            tokenId: tokenMap[tradeDefi.buyCoin.name]?.tokenId ?? 0,
            volume: tradeDefi.buyVol,
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: Math.ceil(
            sdk
              .toBig(tradeDefi.fee)
              .times(10000)
              .div(tradeDefi.buyVol)
              .toNumber()
          ),
          fillAmountBOrS: 0,
          taker: "",
          eddsaSignature: "",
          // taker:
          // new BN(ethUtil.toBuffer(request.taker)).toString(),
        };
        myLog("DefiTrade request:", request);
        const response = await LoopringAPI.defiAPI.orderDefi(
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
          setToastOpen({
            open: true,
            type: "error",
            content:
              t("labelInvestFailed") +
              " error: " +
              (errorItem
                ? t(errorItem.messageKey, { ns: "error" })
                : (response as sdk.RESULT_INFO).message),
          });
        } else {
          setToastOpen({
            open: true,
            type: "success",
            content: t("labelInvestSuccess"),
          });
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (reason) {
      sdk.dumpError400(reason);
      setToastOpen({
        open: true,
        type: "error",
        content: t("labelInvestFailed"),
      });
    } finally {
      setIsLoading(false);
      resetDefault(false);
      walletLayer2Service.sendUserUpdate();
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    resetDefault,
    setToastOpen,
    t,
    tokenMap,
    tradeDefi,
  ]);

  const handleSubmit = React.useCallback(async () => {
    const { tradeDefi } = store.getState()._router_tradeDefi;
    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeDefi.buyVol)
      //TODO: is samll than MAX
    ) {
      try {
        sendRequest();
      } catch (e: any) {
        // const errorItem = sdk.dumpError400(e);
        setToastOpen({
          open: true,
          type: "error",
          content: t("labelExitAmmFailed") + ` error: ${e.message}`,
        });
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

  const onSubmitBtnClick = React.useCallback(async () => {
    setIsLoading(true);
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi;
    //TODO is firstTime  is gte than max trade vaule
    if (
      tradeDefi?.sellVol === undefined ||
      tradeDefi?.buyVol === undefined ||
      tradeDefi?.sellCoin ||
      tradeDefi?.buyCoin
    )
      handleSubmit();
  }, [handleSubmit]);

  // useWalletLayer2Socket({ walletLayer2Callback });

  React.useEffect(() => {
    if (
      market &&
      market !== "" &&
      walletLayer2Status === SagaStatus.UNSET &&
      isJoin !== undefined
    ) {
      resetDefault.cancel();
      setSymbol(() => {
        if (isJoin) {
          const [, coinBuySymbol, coinSellSymbol] =
            market.match(/(\w+)-(\w+)/i) ?? [];
          return { coinBuySymbol, coinSellSymbol };
        } else {
          const [, coinSellSymbol, coinBuySymbol] =
            market.match(/(\w+)-(\w+)/i) ?? [];
          return { coinBuySymbol, coinSellSymbol };
        }
      });
      resetDefault(account.readyState === AccountStatus.ACTIVATED);
    }
    return () => {
      return resetDefault.cancel();
    };
  }, [market, isJoin, walletLayer2Status, walletLayer2, account.readyState]);

  const {
    btnStatus,
    onBtnClick: toalHandleSubmit,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  });

  // const tokenA = tokenMap["WSTETH"];
  // const tokenB = tokenMap["ETH"];
  // @ts-ignore
  const deFiWrapProps: DeFiWrapProps<T, I, ACD> = React.useMemo(() => {
    return {
      isStoB,
      disabled: false,
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isLoading,
      switchStobEvent: (_isStoB) => {
        setIsStoB(_isStoB);
      },
      // btnStatus: keyof typeof TradeBtnStatus | undefined;
      onSubmitClick: toalHandleSubmit,
      onChangeEvent: handleOnchange,
      // handleError?: (data: T) => void;
      tokenAProps: {},
      tokenBProps: {},
      deFiCalcData: tradeDefi.deFiCalcData,
      tokenSell: tokenMap[coinSellSymbol],
      tokenBuy: tokenMap[coinBuySymbol],
      btnStatus,
      accStatus: account.readyState,
    };
  }, [
    account.readyState,
    btnStatus,
    coinBuySymbol,
    coinSellSymbol,
    handleOnchange,
    isLoading,
    toalHandleSubmit,
    tokenMap,
    tradeDefi.deFiCalcData,
    tradeMarketI18nKey,
  ]); // as ForceWithdrawProps<any, any>;

  return {
    deFiWrapProps,
    confirmShow,
    setConfirmShow,
  };
};
