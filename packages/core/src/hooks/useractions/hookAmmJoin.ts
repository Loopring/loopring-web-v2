import React from "react";
import {
  AccountStatus,
  AmmJoinData,
  CoinInfo,
  ErrorMap,
  fnType,
  getValuePrecisionThousand,
  IBData,
  myLog,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import {
  TradeBtnStatus,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  accountStaticCallBack,
  ammPairInit,
  btnClickMap,
  btnLabel,
  makeCache,
  makeWalletLayer2,
  useAmmMap,
  IdMap,
  useTokenMap,
  useAccount,
  LoopringAPI,
  store,
  useSystem,
  DAYS,
  getTimestampDaysLater,
  initSlippage,
  usePageAmmPool,
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";

import { useTranslation } from "react-i18next";

import _ from "lodash";

// ----------calc hook -------

export const useAmmJoin = ({
  getFee,
  setToastOpen,
  pair,
  snapShotData,
  stob,
  btos,
}: {
  stob: string;
  btos: string;
  getFee: (requestType: sdk.OffchainFeeReqType.AMM_JOIN) => any;
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
    ammJoin: {
      // fee,
      fees,
      request,
      btnStatus,
      btnI18nKey,
      ammCalcData,
      ammData,
    },
    updatePageAmmJoin,
    updatePageAmmJoinBtn,
    common: { ammInfo, ammPoolSnapshot },
  } = usePageAmmPool();

  const { t } = useTranslation(["common", "error"]);

  const [isLoading, setIsLoading] = React.useState(false);
  const { coinMap, tokenMap, idIndex } = useTokenMap();
  const { allowTrade } = useSystem();
  const { ammMap } = useAmmMap();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const {
    toggle: { joinAmm },
  } = useToggle();
  const { account } = useAccount();
  const [baseToken, setBaseToken] = React.useState<sdk.TokenInfo>();
  const [quoteToken, setQuoteToken] = React.useState<sdk.TokenInfo>();
  const [baseMinAmt, setBaseMinAmt] = React.useState<any>();
  const [quoteMinAmt, setQuoteMinAmt] = React.useState<any>();

  React.useEffect(() => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      ammData?.coinA.belong &&
      ammData.coinB.belong
    ) {
      updatePageAmmJoinBtn(accountStaticCallBack(btnLabelNew, [{ ammData }]));
    } else if (account.readyState !== AccountStatus.ACTIVATED) {
      const btnInfo = accountStaticCallBack(btnLabelNew);
      if (typeof btnInfo === "string") {
        updatePageAmmJoinBtn({
          btnStatus: TradeBtnStatus.AVAILABLE,
          btnI18nKey: btnInfo,
        });
      }
    }
  }, [
    account.readyState,
    ammData,
    ammData?.coinA.tradeValue,
    ammData?.coinB.tradeValue,
    isLoading,
    fees,
  ]);

  const btnLabelActiveCheck = React.useCallback(
    ({
      ammData,
    }): { btnStatus?: TradeBtnStatus; btnI18nKey: string | undefined } => {
      const times = 10;

      const validAmt1 = ammData?.coinA?.tradeValue
        ? ammData?.coinA?.tradeValue >= times * baseMinAmt
        : false;
      const validAmt2 = ammData?.coinB?.tradeValue
        ? ammData?.coinB?.tradeValue >= times * quoteMinAmt
        : false;

      myLog(
        "btnLabelActiveCheck validAmt1:",
        validAmt1,
        " validAmt2:",
        validAmt2
      );

      if (isLoading) {
        return { btnStatus: TradeBtnStatus.LOADING, btnI18nKey: undefined };
      } else {
        if (account.readyState === AccountStatus.ACTIVATED) {
          if (
            ammData === undefined ||
            ammData?.coinA.tradeValue === undefined ||
            ammData?.coinB.tradeValue === undefined ||
            ammData?.coinA.tradeValue === 0 ||
            ammData?.coinB.tradeValue === 0
          ) {
            return {
              btnStatus: TradeBtnStatus.DISABLED,
              btnI18nKey: "labelEnterAmount",
            };
          } else if (validAmt1 && validAmt2) {
            return {
              btnStatus: TradeBtnStatus.AVAILABLE,
              btnI18nKey: undefined,
            };
          } else {
            const viewBaseMintAmt = getValuePrecisionThousand(
              times * baseMinAmt,
              tokenMap[ammData?.coinA]?.precisionForOrder ?? 4,
              tokenMap[ammData?.coinA]?.precisionForOrder ?? 4,
              tokenMap[ammData?.coinA]?.precisionForOrder ?? 2,
              false,
              { floor: false, isAbbreviate: true }
            );
            const viewQuoteMintAmt = getValuePrecisionThousand(
              times * quoteMinAmt,
              tokenMap[ammData?.coinB]?.precisionForOrder ?? 4,
              tokenMap[ammData?.coinB]?.precisionForOrder ?? 4,
              tokenMap[ammData?.coinB]?.precisionForOrder ?? 2,
              false,
              { floor: false, isAbbreviate: true }
            );
            return {
              btnStatus: TradeBtnStatus.DISABLED,
              btnI18nKey: `labelLimitMin| ${viewBaseMintAmt} ${
                ammData?.coinA.belong
              }  ${t("labelAmmMinAnd")} ${viewQuoteMintAmt} ${
                ammData?.coinB.belong
              }`,
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
      isLoading,

      updatePageAmmJoin,
    ]
  );

  const btnLabelNew = Object.assign(_.cloneDeep(btnLabel), {
    [fnType.ACTIVATED]: [btnLabelActiveCheck],
  });

  const initAmmData = React.useCallback(
    async (pair: any, walletMap: any, isReset: boolean = false) => {
      const { fee } = store.getState()._router_pageAmmPool.ammJoin;
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

      if (isReset) {
        updatePageAmmJoin({ ammCalcData: _ammCalcData, ...feePatch });
      } else {
        updatePageAmmJoin({
          ammCalcData: { ...ammCalcData, ..._ammCalcData },
          ...feePatch,
        });
      }

      if (_ammCalcData.myCoinA && tokenMap) {
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

        const newAmmData = {
          coinA: { ..._ammCalcData.myCoinA, tradeValue: undefined },
          coinB: { ..._ammCalcData.myCoinB, tradeValue: undefined },
          slippage: initSlippage,
        };

        updatePageAmmJoin({ ammData: newAmmData });
      }
    },
    [
      snapShotData,
      coinMap,
      tokenMap,
      ammCalcData,
      ammMap,
      getFee,
      updatePageAmmJoin,
      setBaseToken,
      setQuoteToken,
      setBaseMinAmt,
      setQuoteMinAmt,
    ]
  );

  const updateJoinFee = React.useCallback(async () => {
    const account = store.getState().account;
    const ammJoin = store.getState()._router_pageAmmPool.ammJoin;
    if (
      ammJoin.ammCalcData?.lpCoinB?.belong &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      // if (ammJoin.fees === undefined) {
      //   setIsLoading(true);
      // }
      try {
        const feeInfo = await getFee(sdk.OffchainFeeReqType.AMM_JOIN);
        if (feeInfo?.fee && feeInfo?.fees) {
          updatePageAmmJoin({
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
      updatePageAmmJoin({
        fee: 0,
        fees: undefined,
      });
    }
  }, []);
  React.useEffect(() => {
    if (
      ammPoolSnapshot?.lp.tokenId &&
      idIndex[ammPoolSnapshot?.lp?.tokenId] === ammCalcData?.lpCoin?.belong
    ) {
      updateJoinFee();
    }
  }, [ammPoolSnapshot?.lp.volume, ammCalcData?.lpCoin?.belong]);
  const handleJoin = React.useCallback(
    async ({ data, type, fees, ammPoolSnapshot, tokenMap, account }) => {
      if (
        !data ||
        !tokenMap ||
        !data.coinA.belong ||
        !data.coinB.belong ||
        !ammPoolSnapshot
      ) {
        myLog("handleJoin return ", data, ammPoolSnapshot);
        return;
      }

      const { slippage } = data;

      const slippageReal = sdk.toBig(slippage).div(100).toString();

      const isAtoB = type === "coinA";

      const { idIndex, marketArray, marketMap } = store.getState().tokenMap;

      // const {ammMap} = store.getState().amm.ammMap

      const { market, amm } = sdk.getExistedMarket(
        marketArray,
        data.coinA.belong as string,
        data.coinB.belong as string
      );

      if (!market || !amm || !marketMap) {
        return;
      }

      const marketInfo: sdk.MarketInfo = marketMap[market];

      const coinA = tokenMap[data.coinA.belong as string];
      const coinB = tokenMap[data.coinB.belong as string];

      const rawA = data.coinA.tradeValue ? data.coinA.tradeValue.toString() : 0;
      const rawB = data.coinB.tradeValue ? data.coinB.tradeValue.toString() : 0;
      const rawVal = isAtoB ? rawA : rawB;
      const rawValMatchForRawVal = isAtoB ? rawB : rawA;
      const { request } = sdk.makeJoinAmmPoolRequest(
        rawVal,
        isAtoB,
        slippageReal,
        account.accAddress,
        fees,
        ammPoolSnapshot,
        tokenMap as any,
        idIndex as IdMap,
        0,
        0,
        rawValMatchForRawVal
      );

      const newData = _.cloneDeep(data);

      if (ammPoolSnapshot.lp && ammPoolSnapshot.lp.volume !== "0") {
        if (isAtoB) {
          newData.coinB.tradeValue = parseFloat(
            sdk
              .toBig(request.joinTokens.pooled[1].volume)
              .div("1e" + coinB.decimals)
              .toFixed(marketInfo.precisionForPrice)
          );
        } else {
          newData.coinA.tradeValue = parseFloat(
            sdk
              .toBig(request.joinTokens.pooled[0].volume)
              .div("1e" + coinA.decimals)
              .toFixed(marketInfo.precisionForPrice)
          );
        }
      }

      myLog("raw request:", request);

      updatePageAmmJoin({
        request,
        ammData: {
          coinA: newData.coinA as IBData<string>,
          coinB: newData.coinB as IBData<string>,
          slippage,
        },
      });
    },
    []
  );

  const handleAmmPoolEvent = (
    data: AmmJoinData<IBData<any>>,
    _type: "coinA" | "coinB"
  ) => {
    handleJoin({
      data,
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
      updatePageAmmJoinBtn({ btnStatus: TradeBtnStatus.LOADING });
      if (!allowTrade.order.enable) {
        setShowSupport({ isShow: true });
        setIsLoading(false);
      } else if (ammInfo?.joinDisable) {
        setShowTradeIsFrozen({
          isShow: true,
          messageKey: "labelNoticeForMarketFrozen",
          type: t("labelAmmJoin") + ` ${ammInfo?.__rawConfig__.name}`,
        });
        setIsLoading(false);
      } else if (!joinAmm.enable) {
        setShowTradeIsFrozen({
          isShow: true,
          type: t("labelAmmJoin") + ` ${ammInfo?.__rawConfig__.name}`,
        });
        setIsLoading(false);
      } else {
        try {
          if (
            LoopringAPI.ammpoolAPI &&
            LoopringAPI.userAPI &&
            request &&
            account?.eddsaKey?.sk
          ) {
            const patch: sdk.AmmPoolRequestPatch = {
              chainId: store.getState().system.chainId as sdk.ChainId,
              ammName: ammInfo?.__rawConfig__.name ?? "",
              poolAddress: ammInfo?.address ?? "",
              eddsaKey: account.eddsaKey.sk,
            };

            let req = _.cloneDeep(request);

            const request0: sdk.GetNextStorageIdRequest = {
              accountId: account.accountId,
              sellTokenId: req.joinTokens.pooled[0].tokenId as number,
            };
            const storageId0 = await LoopringAPI.userAPI.getNextStorageId(
              request0,
              account.apiKey
            );

            const request_1: sdk.GetNextStorageIdRequest = {
              accountId: account.accountId,
              sellTokenId: req.joinTokens.pooled[1].tokenId as number,
            };
            const storageId1 = await LoopringAPI.userAPI.getNextStorageId(
              request_1,
              account.apiKey
            );

            req.storageIds = [storageId0.offchainId, storageId1.offchainId];

            req.validUntil = getTimestampDaysLater(DAYS);
            if (ammInfo?.domainSeparator) {
              req.domainSeparator = ammInfo?.domainSeparator;
            }

            myLog("join ammpool req:", req);

            const response = await LoopringAPI.ammpoolAPI.joinAmmPool(
              req,
              patch,
              account.apiKey
            );

            myLog("join ammpool response:", response);

            updatePageAmmJoin({
              ammData: {
                ...ammData,
                ...{
                  coinA: { ...ammData.coinA, tradeValue: 0 },
                  coinB: { ...ammData.coinB, tradeValue: 0 },
                },
              },
            });

            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
              throw response;
            } else {
              setToastOpen({
                open: true,
                type: "success",
                content: t("labelJoinAmmSuccess"),
              });
            }
          } else {
            throw new Error("api not ready");
          }
        } catch (error: any) {
          if (error?.message === "api not ready") {
            setToastOpen({
              open: true,
              type: "error",
              content: t("labelJoinAmmFailed"),
            });
          } else if ((error as sdk.RESULT_INFO)?.code) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001];
            if (
              [102024, 102025, 114001, 114002].includes(
                (error as sdk.RESULT_INFO)?.code || 0
              )
            ) {
              await updateJoinFee();
            }
            setToastOpen({
              open: true,
              type: "error",
              content:
                t("labelJoinAmmFailed") +
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
              content: t("labelJoinAmmFailed"),
            });
          }
        } finally {
          setIsLoading(false);
          walletLayer2Service.sendUserUpdate();
          await updateJoinFee();
        }

        if (props.__cache__) {
          makeCache(props.__cache__);
        }
      }
    },
    [request, ammData, account, t, allowTrade]
  );

  const onAmmClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.ACTIVATED]: [ammCalculator],
  });

  const onAmmClick = React.useCallback(
    (props: AmmJoinData<IBData<any>>) => {
      accountStaticCallBack(onAmmClickMap, [props]);
    },
    [onAmmClickMap]
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
      const { ammData } = store.getState()._router_pageAmmPool.ammJoin;
      if (
        ammData?.coinA?.belong === pair?.coinAInfo?.simpleName &&
        ammData?.coinB?.belong === pair?.coinAInfo?.simpleName
      ) {
        initAmmData(pair, walletMap);
      } else {
        setIsLoading(true);
        initAmmData(pair, walletMap, true);
      }
      await updateJoinFee();
    }
  }, [
    pair?.coinAInfo?.simpleName,
    pair?.coinBInfo?.simpleName,
    ammPoolSnapshot,
  ]);

  useWalletLayer2Socket({ walletLayer2Callback });

  return {
    ammCalcData,
    ammData,
    handleAmmPoolEvent,
    btnStatus,
    onAmmClick,
    btnI18nKey,
    // updateJoinFee,
    updatePageAmmJoin,
  };
};
