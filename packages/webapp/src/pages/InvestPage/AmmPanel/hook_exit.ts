import React from "react";
import {
  AccountStatus,
  AmmExitData,
  CoinInfo,
  fnType,
  IBData,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import {
  TradeBtnStatus,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  IdMap,
  useTokenMap,
  useAmmMap,
  useAccount,
  store,
  LoopringAPI,
  useWalletLayer2Socket,
  walletLayer2Service,
  accountStaticCallBack,
  ammPairInit,
  btnClickMap,
  btnLabel,
  makeCache,
  makeWalletLayer2,
  initSlippage,
  usePageAmmPool,
  getTimestampDaysLater,
  DAYS,
} from "@loopring-web/core";
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
}: {
  stob: string;
  btos: string;
  getFee: (requestType: sdk.OffchainFeeReqType.AMM_EXIT) => any;
  setToastOpen: any;
  pair: {
    coinAInfo: CoinInfo<string> | undefined;
    coinBInfo: CoinInfo<string> | undefined;
  };
  snapShotData:
    | {
        tickerData: sdk.TickerData | undefined;
        ammPoolSnapshot: sdk.AmmPoolSnapshot | undefined;
      }
    | undefined;
}) => {
  const {
    ammExit: {
      fee,
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
  const { account, status: accountStatus } = useAccount();
  const { setShowTradeIsFrozen } = useOpenModals();
  const {
    toggle: { exitAmm },
  } = useToggle();
  const [baseToken, setBaseToken] = React.useState<sdk.TokenInfo>();
  const [quoteToken, setQuoteToken] = React.useState<sdk.TokenInfo>();
  const [baseMinAmt, setBaseMinAmt] = React.useState<any>();
  const [quoteMinAmt, setQuoteMinAmt] = React.useState<any>();
  const [lpMinAmt, setLpMinAmt] = React.useState<any>();

  React.useEffect(() => {
    if (account.readyState !== AccountStatus.ACTIVATED && pair) {
      const btnInfo = accountStaticCallBack(btnLabelNew);

      if (typeof btnInfo === "string") {
        updatePageAmmExitBtn({ btnI18nKey: btnInfo });
      }

      initAmmData(pair, undefined, true);
    }
  }, [account.readyState, pair, stob, updatePageAmmExitBtn]);

  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED && ammData) {
      const btnInfo = accountStaticCallBack(btnLabelNew, [
        { ammData, volA_show, volB_show },
      ]);
      updatePageAmmExitBtn(btnInfo);
    }
  }, [account.readyState, ammData, volA_show, volB_show, updatePageAmmExitBtn]);

  const initAmmData = React.useCallback(
    async (pair: any, walletMap: any, isReset: boolean = false) => {
      const feeInfo = await getFee(sdk.OffchainFeeReqType.AMM_EXIT);

      let fee = undefined;
      let fees = [];

      if (feeInfo?.fee && feeInfo?.fees) {
        fee = feeInfo?.fee.toNumber();
        fees = feeInfo?.fees;
      }

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
        tickerData: snapShotData?.tickerData,
        ammPoolSnapshot: snapShotData?.ammPoolSnapshot,
      });

      const feePatch = {
        fee,
        fees,
      };

      myLog("exit feePatch:", feePatch);

      if (isReset) {
        updatePageAmmExit({ ammCalcData: _ammCalcData, ...feePatch });
      } else {
        updatePageAmmExit({
          ammCalcData: { ...ammCalcData, ..._ammCalcData },
          ...feePatch,
        });
      }

      if (
        _ammCalcData.lpCoin &&
        _ammCalcData.myCoinA &&
        _ammCalcData.myCoinB &&
        tokenMap
      ) {
        const baseT = tokenMap[_ammCalcData.myCoinA.belong];

        const quoteT = tokenMap[_ammCalcData.myCoinB.belong];

        const lpToken = tokenMap[_ammCalcData.lpCoin.belong];

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
        setLpMinAmt(
          lpToken
            ? sdk
                .toBig(lpToken.orderAmounts.minimum)
                .div("1e" + lpToken.decimals)
                .toNumber()
            : undefined
        );

        const newAmmData = {
          coinA: _ammCalcData.myCoinA,
          coinB: _ammCalcData.myCoinB,
          coinLP: _ammCalcData.lpCoin,
          slippage: initSlippage,
        };

        updatePageAmmExit({ ammData: newAmmData });
      } else {
        myLog(
          "check:",
          _ammCalcData.lpCoin && _ammCalcData.myCoinA && _ammCalcData.myCoinB
        );
        myLog("tokenMap:", tokenMap);
      }
    },
    [
      snapShotData,
      coinMap,
      tokenMap,
      ammCalcData,
      ammMap,
      updatePageAmmExit,
      setBaseToken,
      setQuoteToken,
      setBaseMinAmt,
      setQuoteMinAmt,
    ]
  );

  const btnLabelActiveCheck = React.useCallback(
    ({
      ammData,
    }): { btnStatus?: TradeBtnStatus; btnI18nKey: string | undefined } => {
      const times = 1;

      const validAmt = ammData?.coinLP?.tradeValue
        ? sdk
            .toBig(ammData?.coinLP?.tradeValue)
            .gte(sdk.toBig(times * lpMinAmt))
        : false;

      if (isLoading) {
        return { btnStatus: TradeBtnStatus.LOADING, btnI18nKey: undefined };
      } else {
        if (account.readyState === AccountStatus.ACTIVATED) {
          if (
            ammData === undefined ||
            ammData?.coinLP?.tradeValue === undefined ||
            ammData?.coinLP?.tradeValue === 0
          ) {
            myLog("will DISABLED! ", ammData);

            return {
              btnStatus: TradeBtnStatus.DISABLED,
              btnI18nKey: "labelEnterAmount",
            };
          } else if (validAmt) {
            return {
              btnStatus: TradeBtnStatus.AVAILABLE,
              btnI18nKey: undefined,
            };
          } else {
            return {
              btnStatus: TradeBtnStatus.DISABLED,
              btnI18nKey: `labelLimitMin| ${times * lpMinAmt} ${
                ammData?.coinLP?.belong
              } `,
            };
          }
        } else {
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
      updatePageAmmExit,
    ]
  );

  const btnLabelNew = Object.assign(_.cloneDeep(btnLabel), {
    [fnType.ACTIVATED]: [btnLabelActiveCheck],
  });

  const updateExitFee = React.useCallback(async () => {
    if (pair?.coinBInfo?.simpleName && ammCalcData) {
      const feeInfo = await getFee(sdk.OffchainFeeReqType.AMM_EXIT);

      if (feeInfo?.fee && feeInfo?.fees) {
        const newAmmCalcData = {
          ...ammCalcData,
          fee: feeInfo?.fee.toString() + " " + pair.coinBInfo.simpleName,
        };

        updatePageAmmExit({
          fee: feeInfo?.fee.toNumber(),
          fees: feeInfo?.fees,
          ammCalcData: newAmmCalcData,
        });
      }
    }
  }, [updatePageAmmExit, ammCalcData, pair]);

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
        slippage: ammData.slippage,
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

        newAmmData["coinA"] = { ...ammData.coinA, tradeValue: volA_show };
        newAmmData["coinB"] = { ...ammData.coinB, tradeValue: volB_show };

        ammDataPatch = { request, volA_show, volB_show };
      }

      updatePageAmmExit({
        ...ammDataPatch,
        ammData: {
          ...ammData,
          ...newAmmData,
          coinLP: data.coinLP,
          slippage: data.slippage,
        },
      });
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

  const ammCalculator = React.useCallback(
    async function (props) {
      setIsLoading(true);
      updatePageAmmExitBtn({ btnStatus: TradeBtnStatus.LOADING });
      if (!exitAmm.enable) {
        setShowTradeIsFrozen({ isShow: true });
        setIsLoading(false);
      } else {
        if (
          !LoopringAPI.ammpoolAPI ||
          !LoopringAPI.userAPI ||
          !request ||
          !account?.eddsaKey?.sk
        ) {
          myLog(
            " onAmmJoin ammpoolAPI:",
            LoopringAPI.ammpoolAPI,
            "joinRequest:",
            request
          );

          setToastOpen({
            open: true,
            type: "success",
            content: t("labelJoinAmmFailed"),
          });
          setIsLoading(false);
          walletLayer2Service.sendUserUpdate();
          return;
        }

        let req = _.cloneDeep(request);

        const patch: sdk.AmmPoolRequestPatch = {
          chainId: store.getState().system.chainId as sdk.ChainId,
          ammName: ammInfo.__rawConfig__.name,
          poolAddress: ammInfo.address,
          eddsaKey: account.eddsaKey.sk,
        };

        const burnedReq: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: req.exitTokens.burned.tokenId as number,
        };
        const storageId0 = await LoopringAPI.userAPI.getNextStorageId(
          burnedReq,
          account.apiKey
        );

        req.storageId = storageId0.offchainId;

        try {
          myLog("---- try to exit req:", req);

          updatePageAmmExit({
            ammData: {
              ...ammData,
              ...{
                coinLP: { ...ammData.coinLP, tradeValue: 0 },
              },
            },
          });

          req.validUntil = getTimestampDaysLater(DAYS);

          myLog("exit ammpool req:", req);

          const response = await LoopringAPI.ammpoolAPI.exitAmmPool(
            req,
            patch,
            account.apiKey
          );

          myLog("exit ammpool response:", response);

          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (response as sdk.RESULT_INFO)?.code ?? 700001
              ];
            setToastOpen({
              open: true,
              type: "error",
              content:
                t("labelExitAmmFailed") +
                " error: " +
                (errorItem
                  ? t(errorItem.messageKey, { ns: "error" })
                  : (response as sdk.RESULT_INFO).message),
            });
          } else {
            setToastOpen({
              open: true,
              type: "success",
              content: t("labelExitAmmSuccess"),
            });
          }
        } catch (reason) {
          sdk.dumpError400(reason);
          setToastOpen({
            open: true,
            type: "error",
            content: t("labelExitAmmFailed"),
          });
        } finally {
          setIsLoading(false);
          updateExitFee();
          walletLayer2Service.sendUserUpdate();
        }

        if (props.__cache__) {
          makeCache(props.__cache__);
        }
      }
    },
    [request, ammData, account, t, updatePageAmmExit]
  );

  const onAmmClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.ACTIVATED]: [ammCalculator],
  });
  const onAmmClick = React.useCallback(
    (props: AmmExitData<IBData<any>>) => {
      accountStaticCallBack(onAmmClickMap, [props]);
    },
    [onAmmClickMap, updatePageAmmExitBtn]
  );

  const walletLayer2Callback = React.useCallback(async () => {
    if (pair?.coinBInfo?.simpleName && snapShotData?.ammPoolSnapshot) {
      const { walletMap } = makeWalletLayer2(false);
      initAmmData(pair, walletMap);
      setIsLoading(false);
    }
  }, [pair?.coinBInfo?.simpleName, snapShotData?.ammPoolSnapshot]);

  useWalletLayer2Socket({ walletLayer2Callback });

  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      LoopringAPI.userAPI &&
      pair.coinBInfo?.simpleName &&
      snapShotData?.ammPoolSnapshot &&
      account.readyState === AccountStatus.ACTIVATED &&
      tokenMap
    ) {
      walletLayer2Callback();
    }
  }, [
    accountStatus,
    account.readyState,
    pair?.coinBInfo?.simpleName,
    snapShotData?.ammPoolSnapshot,
    tokenMap,
  ]);

  return {
    ammCalcData,
    ammData,
    handleAmmPoolEvent,
    btnStatus,
    onAmmClick,
    btnI18nKey,
    updateExitFee,
  };
};
