import React from "react";
import { DeFiWrapProps, coinMap } from "@loopring-web/component-lib";
import {
  AccountStatus,
  DeFiCalcData,
  IBData,
  MarketType,
  myLog,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import { useTradeDefi, useWalletLayer2Socket } from "@loopring-web/core";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  useTokenMap,
  useAccount,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  useBtnStatus,
  walletLayer2Service,
  useSystem,
} from "../../index";
import { useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDefiMap } from "../../stores";

export const useDefiTrade = <
  T extends IBData<I>,
  I,
  ACD extends DeFiCalcData<T>
>({
  isJoin,
  setToastOpen,
  market,
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
  const { marketMap } = useDefiMap();
  // @ts-ignore
  const [, coinSellSymbol, coinBuySymbol] = market.match(/(\w+)-(\w+)/i);
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmShow, setConfirmShow] = React.useState<boolean>(true);
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo } = useSystem();
  const match = useRouteMatch("/layer2/:forceWithdraw");
  const { tradeDefi, updateTradeDefi } = useTradeDefi();

  // const {
  //   chargeFeeTokenList,
  //   isFeeNotEnough,
  //   handleFeeChange,
  //   feeInfo,
  //   checkFeeIsEnough,
  // } = useChargeFees({
  //   requestType: isJoin
  //     ? sdk.OffchainFeeReqType.DEFI_JOIN
  //     : sdk.OffchainFeeReqType.DEFI_EXIT,
  //   updateData: ({ fee }) => {
  //     const { tradeDefi } = store.getState()._router_tradeDefi;
  //     store.dispatch(updateTradeDefiReduce({ ...tradeDefi, fee }));
  //   },
  // });
  const getFee = React.useCallback(
    async (
      requestType:
        | sdk.OffchainFeeReqType.DEFI_JOIN
        | sdk.OffchainFeeReqType.DEFI_EXIT
    ) => {
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
          tokenSymbol: coinBuySymbol as string,
        };

        const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(
          request,
          account.apiKey
        );

        const feeRaw = fees[coinBuySymbol] ? fees[coinBuySymbol].fee : 0;
        const fee = sdk.toBig(feeRaw).div("1e" + feeToken.decimals);

        myLog("new fee:", fee.toString());
        return {
          fee,
          fees,
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
    ]
  );

  const { btnStatus, enableBtn, disableBtn, btnInfo } = useBtnStatus();

  const walletLayer2Callback = React.useCallback(
    async () => {
      // let walletMap: WalletMap<any> | undefined = undefined;
      // const { tradeDefi } = store.getState()._router_tradeDefi;
      // if (account.readyState === AccountStatus.ACTIVATED) {
      //   walletMap = makeWalletLayer2(true).walletMap;
      //   const _deFiCalcData = {
      //     ...tradeDefi.deFiCalcData,
      //     coinA:
      //     coinB: T;
      //     AtoB: number;
      //     BtoA: number;
      //     fee: string;
      //     coinMap: totalCoinMap,
      //   };
      //   // myLog('--ACTIVATED tradeCalcData:', tradeCalcData)
      //   //
      //   // setTradeCalcData(() => {
      //   //   return { ...tradeCalcData, walletMap } as TradeCalcData<C>;
      //   // });
      // } else {
      //   if (tradeCalcData.coinSell && tradeCalcData.coinBuy) {
      //     setTradeData((state) => {
      //       return {
      //         ...state,
      //         sell: { belong: tradeCalcData.coinSell },
      //         buy: { belong: tradeCalcData.coinBuy },
      //       } as SwapTradeData<IBData<C>>;
      //     });
      //   }
      //   updatePageTradeLite({
      //     market: market as MarketType,
      //     feeBips: 0,
      //     totalFee: 0,
      //     takerRate: 0,
      //     priceImpactObj: undefined,
      //   });
      //   // setFeeBips('0')
      //   // setTotalFee('0')
      //   // setTakerRate('0')
      //   setTradeCalcData((state) => {
      //     return {
      //       ...state,
      //       minimumReceived: undefined,
      //       priceImpact: undefined,
      //       fee: undefined,
      //     };
      //   });
      // }
    },
    [
      // tradeData,
      // market,
      // tradeCalcData,
      // marketArray,
      // ammMap,
      // account.readyState,
    ]
  );

  useWalletLayer2Socket({ walletLayer2Callback });

  const handleOnchange = React.useCallback(() => {}, []);
  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      // forceWithdrawValue?.fee?.belong &&
      // forceWithdrawValue.fee?.feeRaw &&
      // forceWithdrawValue.belong &&
      // forceWithdrawValue.balance &&
      // !!forceWithdrawValue?.withdrawAddress &&
      tradeDefi.fee
    ) {
      enableBtn();
      myLog("enableBtn");
      return;
    }
    disableBtn();
  }, [
    tokenMap,
    // forceWithdrawValue.fee?.belong,
    // forceWithdrawValue.fee?.feeRaw,
    // forceWithdrawValue.belong,
    // forceWithdrawValue.balance,
    // forceWithdrawValue?.withdrawAddress,
    tradeDefi.fee,
    disableBtn,
    enableBtn,
  ]);

  React.useEffect(
    () => {
      checkBtnStatus();
    },
    [
      // address,
      // addrStatus,
      // forceWithdrawValue.fee?.belong,
      // forceWithdrawValue.fee?.feeRaw,
      // forceWithdrawValue.belong,
      // isLoopringAddress,
      // isActiveAccount,
    ]
  );
  const [isStoB, setIsStoB] = React.useState(true);
  // useWalletLayer2Socket({ walletLayer2Callback });
  const resetDefault = React.useCallback(async () => {
    const { fee } = (await getFee(
      isJoin
        ? sdk.OffchainFeeReqType.DEFI_JOIN
        : sdk.OffchainFeeReqType.DEFI_EXIT
    )) ?? { fee: 0 };
    const deFiCalcDataInit = tradeDefi.deFiCalcData;
    const marketInfo = marketMap[market];
    const [AtoB, BtoA] = marketInfo
      ? isJoin
        ? [marketInfo.depositPrice, marketInfo.withdrawPrice]
        : [marketInfo.withdrawPrice, marketInfo.depositPrice]
      : ["0", "0"];
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
        coinSell: coinMap[coinSellSymbol],
        coinBuy: coinMap[coinBuySymbol],
        AtoB,
        BtoA,
        fee: fee.toString(),
        coinMap: coinMap as any,
      },
      fee: fee.toString(),
      depositPrice: marketInfo?.depositPrice ?? "0",
      withdrawPrice: marketInfo?.withdrawPrice ?? "0",
    });
  }, [
    coinBuySymbol,
    coinSellSymbol,
    marketMap,
    getFee,
    isJoin,
    isStoB,
    market,
    tradeDefi.deFiCalcData,
    updateTradeDefi,
  ]);

  React.useEffect(() => {
    // @ts-ignore
    if (match?.params?.forcewithdraw?.toLowerCase() === "forcewithdraw") {
      resetDefault();
    }
  }, [match?.params]);

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
      resetDefault();
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
    tradeDefi.buyCoin.name,
    tradeDefi.buyVol,
    tradeDefi.fee,
    tradeDefi.sellCoin.name,
    tradeDefi.sellVol,
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

  // const retryBtn = React.useCallback(
  //   (isHardwareRetry: boolean = false) => {
  //     setShowAccount({
  //       isShow: true,
  //       step: AccountStep.ForceWithdraw_WaitForAuth,
  //     });
  //     handleSubmit(
  //       {
  //         belong: forceWithdrawValue.belong,
  //         balance: forceWithdrawValue.balance,
  //         tradeValue: forceWithdrawValue.tradeValue,
  //       } as R,
  //       !isHardwareRetry
  //     );
  //   },
  //   [ handleSubmit, setShowAccount]
  // );
  // myLog("walletItsMap", walletItsMap);
  const tokenA = tokenMap["WSTETH"];
  const tokenB = tokenMap["ETH"];
  // @ts-ignore
  const deFiWrapProps: DeFiWrapProps<T, I, ACD> = React.useMemo(() => {
    return {
      isStoB: true,
      disabled: false,
      btnInfo,
      isLoading,
      switchStobEvent: (_isStoB) => {
        setIsStoB(!_isStoB);
      },
      // btnStatus: keyof typeof TradeBtnStatus | undefined;
      onSubmitClick: sendRequest,
      onConfirm: handleSubmit,
      onChangeEvent: handleOnchange,
      // handleError?: (data: T) => void;
      tokenAProps: {},
      tokenBProps: {},
      deFiCalcData: tradeDefi.deFiCalcData,
      tokenA,
      tokenB,
      btnStatus,
      accStatus: account.readyState,
    };
  }, [
    account.readyState,
    btnInfo,
    btnStatus,
    handleOnchange,
    handleSubmit,
    isLoading,
    sendRequest,
    tokenA,
    tokenB,
    tradeDefi.deFiCalcData,
  ]); // as ForceWithdrawProps<any, any>;

  return {
    deFiWrapProps,
    confirmShow,
    setConfirmShow,
  };
};
