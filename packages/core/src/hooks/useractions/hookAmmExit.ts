import React from "react";
import {
  AccountStatus,
  AmmExitData,
  CoinInfo,
  ErrorMap,
  fnType,
  getValuePrecisionThousand,
  IBData,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { useOpenModals, useToggle } from "@loopring-web/component-lib";
import {
  accountStaticCallBack,
  ammPairInit,
  btnClickMap,
  btnLabel,
  DAYS,
  getTimestampDaysLater,
  IdMap,
  initSlippage,
  LoopringAPI,
  makeCache,
  makeWalletLayer2,
  store,
  useAccount,
  useAmmMap,
  usePageAmmPool,
  useTokenMap,
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTranslation } from "react-i18next";
import _ from "lodash";

export const useAmmExit = ({
  getFee,
  setToastOpen,
  pair,
  snapShotData,
  stob,
  btos,
  setConfirmExitSmallOrder,
}: {
  stob: string;
  btos: string;
  getFee: (requestType: sdk.OffchainFeeReqType.AMM_EXIT) => any;
  setToastOpen: any;
  pair: {
    coinAInfo: CoinInfo<string> | undefined;
    coinBInfo: CoinInfo<string> | undefined;
  };
  setConfirmExitSmallOrder: (props: {
    open: boolean;
    type: "Disabled" | "Mini";
  }) => void;
  snapShotData:
    | {
        tickerData: sdk.TickerData | undefined;
        ammPoolSnapshot: sdk.AmmPoolSnapshot | undefined;
      }
    | undefined;
}) => {
  const { tickerData } = snapShotData ?? {};
  const {
    ammExit: {
      fees,
      request,
      btnI18nKey,
      btnStatus,
      ammCalcData,
      ammData,
      volA_show,
      volB_show,
    },
    updatePageAmmExit,
    updatePageAmmExitBtn,
    common: { ammInfo, ammPoolSnapshot },
  } = usePageAmmPool();

  const { t } = useTranslation(["common", "error"]);

  const [isLoading, setIsLoading] = React.useState(false);
  const { idIndex, marketArray, marketMap, coinMap, tokenMap } = useTokenMap();
  const { ammMap } = useAmmMap();
  const { account } = useAccount();
  const { setShowTradeIsFrozen } = useOpenModals();
  const {
    toggle: { exitAmm },
  } = useToggle();
  const [baseToken, setBaseToken] = React.useState<sdk.TokenInfo>();
  const [quoteToken, setQuoteToken] = React.useState<sdk.TokenInfo>();
  const [baseMinAmt, setBaseMinAmt] = React.useState<any>();
  const [quoteMinAmt, setQuoteMinAmt] = React.useState<any>();
  const [lpMinAmt, setLpMinAmt] = React.useState<any>(undefined);

  const {
    modals: {
      isShowAmm: { isShow },
    },
    // setShowAmm,
  } = useOpenModals();

  React.useEffect(() => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      ammData?.coinA?.belong &&
      ammData?.coinB?.belong
    ) {
      updatePageAmmExitBtn(accountStaticCallBack(btnLabelNew, [{ ammData }]));
    } else if (account.readyState !== AccountStatus.ACTIVATED) {
      const btnInfo = accountStaticCallBack(btnLabelNew);
      updatePageAmmExitBtn({
        btnStatus: TradeBtnStatus.AVAILABLE,
        btnI18nKey: typeof btnInfo === "string" ? btnInfo : btnI18nKey,
      });
    }
  }, [
    account.readyState,
    isLoading,
    fees,
    ammData,
    volA_show,
    volB_show,
    lpMinAmt,
  ]);
  const updateMiniTradeValue = React.useCallback(() => {
    const {
      ammExit: {
        fees,
        ammCalcData,
        ammData: { slippage },
      },
      common: { ammPoolSnapshot },
    } = store.getState()._router_pageAmmPool;

    if (ammCalcData && ammCalcData.lpCoin?.belong && ammPoolSnapshot) {
      const lpToken = tokenMap[ammCalcData.lpCoin.belong];
      const { miniLpVal } = sdk.makeExitAmmPoolMini(
        "0",
        ammPoolSnapshot,
        tokenMap as any,
        idIndex as IdMap
      );
      let miniFeeLpWithSlippageVal = "";

      const slippageReal = sdk
        .toBig(slippage ?? 0.1)
        .div(100)
        .toString();
      if (fees && ammPoolSnapshot) {
        const result = sdk.makeExitAmmCoverFeeLP(
          fees,
          ammPoolSnapshot,
          tokenMap,
          idIndex,
          slippageReal
        );
        miniFeeLpWithSlippageVal = result.miniFeeLpWithSlippageVal;
      }
      setLpMinAmt(() => {
        const miniVal = sdk
          .toBig(
            sdk.toBig(miniFeeLpWithSlippageVal ?? 0).gte(miniLpVal)
              ? miniFeeLpWithSlippageVal
              : miniLpVal
          )
          .times(1.1);
        myLog(
          "updateMiniTradeValue: miniFeeLpWithSlippage, miniLpVal, miniVal = great one * 1.1 ",
          miniFeeLpWithSlippageVal.toString(),
          miniLpVal.toString(),
          miniVal.toString()
        );
        return getValuePrecisionThousand(
          miniVal,
          lpToken.precision,
          lpToken.precision,
          lpToken.precision,
          false,
          { floor: false }
        );
      });
    }
  }, [tokenMap, idIndex]);
  React.useEffect(() => {
    // const quote: TokenVolumeV3 = ammPoolSnapshot.pooled[1];
    if (
      isShow &&
      pair.coinAInfo &&
      pair.coinBInfo &&
      ammPoolSnapshot?.poolAddress &&
      ammPoolSnapshot.pooled &&
      ammPoolSnapshot.poolAddress.toLowerCase() ===
        tokenMap[
          `LP-${pair.coinAInfo.simpleName}-${pair.coinBInfo.simpleName}`
        ].address.toLowerCase() &&
      fees &&
      ammData.slippage
    ) {
      myLog(
        "updateMiniTradeValue: fees, slippage, ammPoolSnapshot",
        fees,
        ammData.slippage,
        ammPoolSnapshot.pooled,
        ammPoolSnapshot.lp
      );
      updateMiniTradeValue();
    }
  }, [pair, ammPoolSnapshot?.lp.volume, fees, isShow, ammData.slippage]);
  React.useEffect(() => {
    if (
      ammPoolSnapshot?.lp.tokenId &&
      idIndex[ammPoolSnapshot?.lp?.tokenId] === ammCalcData?.lpCoin?.belong
    ) {
      updateExitFee();
    }
  }, [ammPoolSnapshot?.lp.volume, ammCalcData?.lpCoin?.belong]);

  const initAmmData = React.useCallback(
    (pair: any, walletMap: any, isReset: boolean = false) => {
      const { ammData, fee } = store.getState()._router_pageAmmPool.ammExit;

      const _ammCalcData = ammPairInit({
        fee,
        pair,
        _ammCalcData: {},
        coinMap,
        tokenMap,
        walletMap,
        ammMap,
        stob,
        btos,
        tickerData: tickerData,
        ammPoolSnapshot: ammPoolSnapshot,
      });

      let newAmmData: any = isReset
        ? {
            coinA: { belong: undefined } as any,
            coinB: { belong: undefined } as any,
            coinLP: { belong: undefined } as any,
            slippage: initSlippage,
          }
        : { ...ammData };
      if (
        _ammCalcData.lpCoin &&
        _ammCalcData.myCoinA &&
        _ammCalcData.myCoinB &&
        tokenMap
      ) {
        const baseT = tokenMap[_ammCalcData.myCoinA.belong];
        const quoteT = tokenMap[_ammCalcData.myCoinB.belong];
        setBaseToken(baseT);
        setQuoteToken(quoteT);
        setBaseMinAmt(
          baseT
            ? sdk
                .toBig(baseT.orderAmounts.minimum)
                .div("1e" + baseT.decimals)
                .toNumber()
            : undefined
        );
        setQuoteMinAmt(
          quoteT
            ? sdk
                .toBig(quoteT.orderAmounts.minimum)
                .div("1e" + quoteT.decimals)
                .toNumber()
            : undefined
        );

        newAmmData = {
          ...newAmmData,
          coinA: _ammCalcData.myCoinA,
          coinB: _ammCalcData.myCoinB,
          coinLP: isReset
            ? {
                ..._ammCalcData.lpCoin,
                tradeValue: undefined,
              }
            : {
                ..._ammCalcData.lpCoin,
                tradeValue: ammData?.coinLP?.tradeValue,
              },
          slippage: initSlippage,
        };
        updatePageAmmExit({
          ammData: newAmmData,
          ammCalcData: { ...ammCalcData, ..._ammCalcData },
          // ...feePatch,
        });
      } else {
        updatePageAmmExit({
          ammCalcData: { ...ammCalcData, ..._ammCalcData },
        });
      }
      myLog("newAmmData:", newAmmData);
    },
    [
      ammPoolSnapshot,
      tickerData,
      coinMap,
      tokenMap,
      ammCalcData,
      ammMap,
      setBaseToken,
      setQuoteToken,
      setBaseMinAmt,
      setQuoteMinAmt,
    ]
  );

  const btnLabelActiveCheck = React.useCallback(
    ({}): { btnStatus?: TradeBtnStatus; btnI18nKey: string | undefined } => {
      const { ammData, fee } = store.getState()._router_pageAmmPool.ammExit;

      const validAmt = ammData?.coinLP?.tradeValue
        ? sdk
            .toBig(ammData?.coinLP?.tradeValue ?? 0)
            .gte(sdk.toBig(lpMinAmt?.replaceAll(sdk.SEP, "") ?? 0))
        : false;
      myLog(
        "updateMiniTradeValue validAmt: fee, lpMinAmt",
        fee,
        lpMinAmt?.toString()
      );
      if (isLoading) {
        return { btnStatus: TradeBtnStatus.LOADING, btnI18nKey: undefined };
      } else if (account.readyState === AccountStatus.ACTIVATED) {
        if (
          ammData === undefined ||
          ammData?.coinLP?.tradeValue === undefined ||
          ammData?.coinLP?.tradeValue === 0 ||
          fee === undefined ||
          !lpMinAmt ||
          fee === 0
        ) {
          myLog("will DISABLED! ", ammData, fee);
          return {
            btnStatus: TradeBtnStatus.DISABLED,
            btnI18nKey: "labelEnterAmount",
          };
        } else if (!validAmt) {
          return {
            btnStatus: TradeBtnStatus.DISABLED,
            btnI18nKey: `labelLimitMin| ${lpMinAmt} ${ammData?.coinLP?.belong} `,
          };
        }
      }

      return {
        btnStatus: TradeBtnStatus.AVAILABLE,
        btnI18nKey: undefined,
      };
    },
    [
      account.readyState,
      baseToken,
      quoteToken,
      baseMinAmt,
      quoteMinAmt,
      lpMinAmt,
      isLoading,
    ]
  );

  const btnLabelNew = Object.assign(_.cloneDeep(btnLabel), {
    [fnType.ACTIVATED]: [btnLabelActiveCheck],
  });

  const updateExitFee = React.useCallback(async () => {
    const account = store.getState().account;
    const ammExit = store.getState()._router_pageAmmPool.ammExit;
    if (
      ammExit.ammCalcData?.lpCoinB?.belong &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      // if (ammExit.fees === undefined) {
      //   setIsLoading(true);
      // }

      try {
        const feeInfo = await getFee(sdk.OffchainFeeReqType.AMM_EXIT);
        // const ammExit = store.getState()._router_pageAmmPool.ammExit;
        if (feeInfo?.fee && feeInfo?.fees) {
          updatePageAmmExit({
            fee: feeInfo?.fee.toString(),
            fees: feeInfo?.fees,
          });
        }
      } catch (error) {
        console.log(error);
        setToastOpen({
          open: true,
          type: "error",
          content: t(ErrorMap.NO_NETWORK_ERROR.messageKey, { ns: "error" }),
        });
      }
      setIsLoading(false);
    } else {
      updatePageAmmExit({
        fee: 0,
        fees: undefined,
      });
    }
  }, []);

  const handleExit = React.useCallback(
    async ({ data, ammData, fees, ammPoolSnapshot, tokenMap, account }) => {
      if (
        !tokenMap ||
        !ammMap ||
        !baseToken ||
        !quoteToken ||
        !ammPoolSnapshot
      ) {
        return;
      }

      const ammExit = store.getState()._router_pageAmmPool.ammExit;
      const { slippage } = data;

      const slippageReal = sdk.toBig(slippage).div(100).toString();

      const { market, amm } = sdk.getExistedMarket(
        marketArray,
        baseToken.symbol,
        quoteToken.symbol
      );

      if (!market || !amm || !marketMap) {
        return;
      }

      let newAmmData = {
        ...ammData,
        ...ammExit.ammData,
      };

      let rawVal = data.coinLP.tradeValue;

      let ammDataPatch = {};

      if (rawVal === undefined) {
        rawVal = "0";
      }

      if (rawVal) {
        const { volA_show, volB_show, request } = sdk.makeExitAmmPoolRequest2(
          rawVal.toString(),
          slippageReal,
          account.accAddress,
          fees as sdk.LoopringMap<sdk.OffchainFeeInfo>,
          ammPoolSnapshot,
          tokenMap as any,
          idIndex as IdMap,
          0
        );

        newAmmData.coinA = { ...ammData.coinA, tradeValue: volA_show };
        newAmmData.coinB = { ...ammData.coinB, tradeValue: volB_show };
        ammDataPatch = { request, volA_show, volB_show };
        updatePageAmmExit({
          ...ammDataPatch,
          ammData: {
            ...newAmmData,
            coinLP: data.coinLP,
            slippage: data.slippage,
          },
        });
      } else {
      }
    },
    [updatePageAmmExit, idIndex, marketArray, marketMap, baseToken, quoteToken]
  );

  const handleAmmPoolEvent = (
    data: AmmExitData<IBData<any>>,
    _type: "coinA" | "coinB"
  ) => {
    handleExit({
      data,
      requestOut: request,
      ammData,
      type: _type,
      fees,
      ammPoolSnapshot,
      tokenMap,
      account,
    });
  };
  const sendRequest = React.useCallback(async () => {
    const ammExit = store.getState()._router_pageAmmPool.ammExit;
    try {
      if (
        LoopringAPI.ammpoolAPI &&
        LoopringAPI.userAPI &&
        ammExit.request &&
        account?.eddsaKey?.sk &&
        ammInfo?.domainSeparator
      ) {
        // let req = _.cloneDeep(request);
        const patch: sdk.AmmPoolRequestPatch = {
          chainId: store.getState().system.chainId as sdk.ChainId,
          ammName: ammInfo?.__rawConfig__.name ?? "",
          poolAddress: ammInfo?.address ?? "",
          eddsaKey: account.eddsaKey.sk,
        };
        const burnedReq: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: ammExit.request.exitTokens.burned.tokenId as number,
        };
        const storageId0 = await LoopringAPI.userAPI.getNextStorageId(
          burnedReq,
          account.apiKey
        );
        // updatePageAmmExit({
        //   ammData: {
        //     ...ammData,
        //     ...{
        //       coinLP: { ...ammData.coinLP, tradeValue: 0 },
        //     },
        //   },
        // });
        myLog("exit ammpool request:", {
          ...ammExit.request,
          domainSeparator: ammInfo.domainSeparator,
          storageId: storageId0.offchainId,
          validUntil: getTimestampDaysLater(DAYS),
        });

        const response = await LoopringAPI.ammpoolAPI
          .exitAmmPool(
            {
              ...ammExit.request,
              domainSeparator: ammInfo.domainSeparator,
              storageId: storageId0.offchainId,
              validUntil: getTimestampDaysLater(DAYS),
            },
            patch,
            account.apiKey
          )
          .finally();
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          throw response;
        } else {
          setToastOpen({
            open: true,
            type: "success",
            content: t("labelExitAmmSuccess"),
          });
        }

        if (ammExit.ammData?.__cache__) {
          makeCache(ammExit.ammData?.__cache__);
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (error: any) {
      if (error?.message === "api not ready") {
        setToastOpen({
          open: true,
          type: "error",
          content: t("labelExitAmmFailed"),
        });
      } else if ((error as sdk.RESULT_INFO)?.code) {
        const errorItem =
          SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001];
        if (
          [102024, 102025, 114001, 114002].includes(
            (error as sdk.RESULT_INFO)?.code || 0
          )
        ) {
          await updateExitFee();
        }
        setToastOpen({
          open: true,
          type: "error",
          content:
            t("labelExitAmmFailed") +
            " error: " +
            (errorItem
              ? t(errorItem.messageKey, { ns: "error" })
              : (error as sdk.RESULT_INFO).message),
        });
      } else if (error?.message) {
        sdk.dumpError400(error);
        setToastOpen({
          open: true,
          type: "error",
          content: t("labelExitAmmFailed"),
        });
      }
    }
    setIsLoading(false);
    updatePageAmmExit({
      ammData: {
        ...ammData,
        ...{
          coinLP: { ...ammData.coinLP, tradeValue: 0 },
        },
      },
    });
    walletLayer2Service.sendUserUpdate();
    await updateExitFee();
  }, [ammData, account, ammInfo]);
  const submitAmmExit = React.useCallback(async () => {
    setIsLoading(true);
    updatePageAmmExitBtn({ btnStatus: TradeBtnStatus.LOADING });

    if (ammInfo?.exitDisable) {
      setShowTradeIsFrozen({
        isShow: true,
        messageKey: "labelNoticeForMarketFrozen",
        type: t("labelAmmExit") + ` ${ammInfo?.__rawConfig__.name}`,
      });
      setIsLoading(false);
    } else if (!exitAmm.enable) {
      setShowTradeIsFrozen({
        isShow: true,
        type: t("labelAmmExit") + ` ${ammInfo?.__rawConfig__.name}`,
      });
      setIsLoading(false);
    } else {
      sendRequest();
    }
  }, [request, account, t, updatePageAmmExit]);

  const onSubmitBtnClick = React.useCallback(
    async (_props) => {
      const ammExit = store.getState()._router_pageAmmPool.ammExit;
      if (ammExit.ammData.coinLP.tradeValue && ammExit.volB_show) {
        // quoteValue < feeValue
        const validAmt =
          ammData?.coinLP?.tradeValue && ammExit.volB_show
            ? sdk.toBig(ammExit.volB_show).gte(ammExit.fee)
            : false;
        // Lp value 15% will be charge for Fee should confirm, so for quote token is 15%*2 = 0.3
        const validMiniAmt =
          ammData?.coinLP?.tradeValue && ammExit.volB_show
            ? sdk.toBig(ammExit.volB_show * 0.3).gte(ammExit.fee)
            : false;
        if (!validAmt) {
          // quoteValue < feeValue
          setConfirmExitSmallOrder({ open: true, type: "Disabled" });
        } else if (!validMiniAmt) {
          // Lp value 15% will be charge for Fee should confirm, so for quote token is 15%*2 = 0.3
          setConfirmExitSmallOrder({ open: true, type: "Mini" });
        } else {
          submitAmmExit();
        }
      }
    },
    [tokenMap, submitAmmExit]
  );

  const onAmmClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.ACTIVATED]: [onSubmitBtnClick],
  });
  const onAmmClick = React.useCallback(
    (props: AmmExitData<IBData<any>>) => {
      accountStaticCallBack(onAmmClickMap, [props]);
    },
    [onAmmClickMap, updatePageAmmExitBtn]
  );

  const walletLayer2Callback = React.useCallback(async () => {
    const { walletMap } = makeWalletLayer2(false);
    if (
      pair?.coinAInfo?.simpleName &&
      pair?.coinBInfo?.simpleName &&
      ammPoolSnapshot &&
      ammPoolSnapshot.poolAddress.toLowerCase() ===
        tokenMap[
          `LP-${pair.coinAInfo.simpleName}-${pair.coinBInfo.simpleName}`
        ].address.toLowerCase()
    ) {
      const { ammData } = store.getState()._router_pageAmmPool.ammExit;
      if (
        ammData?.coinLP?.belong ===
        `LP-${pair.coinAInfo.simpleName}-${pair.coinBInfo.simpleName}`
      ) {
        initAmmData(pair, walletMap);
      } else {
        setIsLoading(true);
        initAmmData(pair, walletMap, true);
      }
      await updateExitFee();
    }
  }, [pair?.coinBInfo?.simpleName, ammPoolSnapshot]);

  useWalletLayer2Socket({ walletLayer2Callback });
  // React.useEffect(() => {
  // }, [isShow]);

  return {
    ammCalcData,
    ammData: {
      ...ammData,
      // ...isLoading,
    },
    handleAmmPoolEvent,
    btnStatus,
    onAmmClick,
    btnI18nKey,
    // updateExitFee,
    exitSmallOrderCloseClick: (isAgree = false) => {
      if (isAgree) {
        submitAmmExit();
      }
    },
  };
};
