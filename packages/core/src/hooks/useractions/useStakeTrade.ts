import React from "react";
import {
  AccountStep,
  DeFiSideWrapProps,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiSideCalcData,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
  TradeStack,
} from "@loopring-web/common-resources";

import {
  calcSideStaking,
  makeWalletLayer2,
  useStakingMap,
  useSubmitBtn,
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
  walletLayer2Service,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useTradeStack } from "../../stores";

export const useStakeTradeJOIN = <
  T extends IBData<I>,
  I,
  ACD extends DeFiSideCalcData<T>
>({
  setToastOpen,
  symbol: coinSellSymbol,
}: {
  symbol: string;
  setToastOpen: (props: {
    open: boolean;
    content: JSX.Element | string;
    type: "success" | "error" | "warning" | "info";
  }) => void;
}) => {
  const { t } = useTranslation(["common"]);
  const refreshRef = React.createRef();
  const [isLoading, setIsLoading] = React.useState(false);
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { setShowAccount } = useOpenModals();
  const {
    status: stakingMapStatus,
    marketMap: stakingMap,
    getStakingMap,
  } = useStakingMap();

  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const { tradeStack, updateTradeStack, resetTradeStack } = useTradeStack();
  const { exchangeInfo, allowTrade } = useSystem();
  const { toggle } = useToggle();

  const handleOnchange = _.debounce(
    ({
      tradeData,
      _tradeStack = {},
    }: {
      tradeData: T;
      _tradeStack?: Partial<TradeStack<T>>;
    }) => {
      const tradeStack = store.getState()._router_tradeStack.tradeStack;
      let _deFiSideCalcData: DeFiSideCalcData<T> = {
        ...tradeStack.deFiSideCalcData,
      } as unknown as DeFiSideCalcData<T>;
      let _oldTradeStack = {
        ...tradeStack,
        ..._tradeStack,
      };
      //_.cloneDeep({ ...tradeStack, ..._tradeStack });
      myLog("defi handleOnchange", _oldTradeStack);

      if (tradeData && coinSellSymbol) {
        const inputValue = tradeData?.tradeValue?.toString() ?? "0";
        const tokenSell = tokenMap[coinSellSymbol];
        const { sellVol, deFiSideCalcData } = calcSideStaking({
          inputValue,
          isJoin: true,
          deFiSideCalcData: _deFiSideCalcData,
          tokenSell,
        });

        // @ts-ignore
        _deFiSideCalcData = {
          ...deFiSideCalcData,
          coinSell: {
            ...tradeData,
            tradeValue: tradeData?.tradeValue?.toString(),
          },
        };
        updateTradeStack({
          sellToken: tokenSell,
          sellVol,
          deFiSideCalcData: {
            ..._deFiSideCalcData,
          },
        });
      }
    },
    globalSetup.wait
  );

  const resetDefault = React.useCallback(
    async (clearTrade: boolean = false) => {
      let walletMap: any = {};
      let deFiSideCalcDataInit: Partial<DeFiSideCalcData<any>> = {
        ...tradeStack.deFiSideCalcData,
        coinSell: {
          belong: coinSellSymbol,
          balance: undefined,
          tradeValue:
            tradeStack.deFiSideCalcData?.coinSell?.belong === coinSellSymbol
              ? tradeStack.deFiSideCalcData?.coinSell?.tradeValue
              : undefined,
        },
      };
      try {
        let item = stakingMap[coinSellSymbol];
        if (item && stakingMap) {
          deFiSideCalcDataInit.stackViewInfo = { ...item };
        } else {
          throw new Error("no product");
        }

        if (account.readyState === AccountStatus.ACTIVATED) {
          if (clearTrade === true) {
            walletLayer2Service.sendUserUpdate();
          }
          walletMap = makeWalletLayer2(true).walletMap ?? {};

          deFiSideCalcDataInit.coinSell.balance =
            walletMap[coinSellSymbol]?.count;
        }

        if (
          clearTrade ||
          tradeStack.deFiSideCalcData?.coinSell?.tradeValue === undefined
        ) {
          deFiSideCalcDataInit.coinSell.tradeValue = undefined;
          updateTradeStack({
            sellVol: "0",
            sellToken: tokenMap[coinSellSymbol],
            deFiSideCalcData: {
              ...deFiSideCalcDataInit,
              coinSell: {
                ...deFiSideCalcDataInit.coinSell,
                tradeValue: undefined,
              },
            } as DeFiSideCalcData<T>,
          });
          myLog("resetDefault defi clearTrade", deFiSideCalcDataInit);
        } else {
          const tradeData = {
            ...deFiSideCalcDataInit.coinSell,
            tradeValue:
              tradeStack.deFiSideCalcData?.coinSell?.tradeValue ?? undefined,
          };
          handleOnchange({ tradeData });
        }
      } catch (error) {
        setToastOpen({
          open: true,
          type: "error",
          content: t(
            SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO).code ?? 700001]
              ?.messageKey ?? (error as sdk.RESULT_INFO).message
          ),
        });
      }
      setIsLoading(false);
    },
    [
      account.readyState,
      coinSellSymbol,
      handleOnchange,
      coinSellSymbol,
      tokenMap,
      tradeStack.deFiSideCalcData,
      updateTradeStack,
    ]
  );

  const walletLayer2Callback = React.useCallback(async () => {
    let tradeValue: any = undefined;
    let deFiSideCalcDataInit: Partial<DeFiSideCalcData<any>> = {
      coinSell: {
        belong: coinSellSymbol,
        balance: undefined,
      },
      ...(tradeStack?.deFiSideCalcData ?? {}),
    };
    if (tradeStack.deFiSideCalcData) {
      tradeValue =
        tradeStack?.deFiSideCalcData?.coinSell?.tradeValue ?? undefined;
    }
    if (deFiSideCalcDataInit?.coinSell?.belong) {
      let walletMap: any;
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2(true).walletMap;
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: walletMap[coinSellSymbol]?.count,
        };
      } else {
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: undefined,
        };
      }
      const tradeData = {
        ...deFiSideCalcDataInit.coinSell,
        tradeValue,
      };
      myLog("resetDefault Defi walletLayer2Callback", tradeData);
      handleOnchange({ tradeData });
    }
  }, [
    account.readyState,
    coinSellSymbol,
    handleOnchange,
    tradeStack.deFiSideCalcData,
  ]);

  useWalletLayer2Socket({ walletLayer2Callback });
  const sendRequest = React.useCallback(async () => {
    const tradeStack = store.getState()._router_tradeStack.tradeStack;
    try {
      setIsLoading(true);
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeStack.deFiSideCalcData?.coinSell &&
        tradeStack.sellToken?.tokenId !== undefined &&
        exchangeInfo
      ) {
        const request = {
          accountId: account.accountId,
          timestamp: Date.now(),
          token: {
            tokenId: tradeStack.sellToken?.tokenId,
            volume: tradeStack.sellVol,
          },
        };
        myLog("Stake Trade request:", request);

        const response = await LoopringAPI.defiAPI.sendStake(
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
          throw new CustomErrorWithCode(errorItem);
        } else {
          const response1 = await LoopringAPI.defiAPI.getStakeSummary(
            {
              accountId: account.accountId,
              hashes: response.hash,
              tokenId: tradeStack.sellToken.tokenId,
            },
            account.apiKey
          );
          let item: any;
          if (
            (response1 as sdk.RESULT_INFO).code ||
            (response1 as sdk.RESULT_INFO).message
          ) {
          } else {
            item = (response1 as any).list[0];
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.Staking_Success,
            info: {
              symbol: tradeStack.sellToken.symbol,
              amount: tradeStack.deFiSideCalcData.coinSell.tradeValue,
              daysDuration: Math.ceil(
                Number(
                  tradeStack?.deFiSideCalcData?.stackViewInfo?.rewardPeriod ?? 0
                ) / 86400000
              ),
              ...item,
            },
          });
          await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE);
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step ==
              AccountStep.Staking_Success
          ) {
            setShowAccount({ isShow: false });
          }
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: "error",
        content:
          t("labelInvestFailed") +
            " " +
            (reason as CustomErrorWithCode)?.messageKey ??
          ` error: ${t((reason as CustomErrorWithCode)?.messageKey)}`,
      });
    } finally {
      resetDefault(true);
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    resetDefault,
    setToastOpen,
    t,
  ]);

  const onSubmitBtnClick = React.useCallback(async () => {
    // const tradeStack = store.getState()._router_tradeStack.tradeStack;
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      exchangeInfo &&
      account.eddsaKey?.sk
    ) {
      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true });
      } else if (toggle && !toggle[`${coinSellSymbol}StackInvest`].enable) {
        setShowTradeIsFrozen({ isShow: true, type: "StakingInvest" });
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
  // const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const tradeStack = store.getState()._router_tradeStack.tradeStack;
    myLog("tradeStack", tradeStack);
    if (account.readyState === AccountStatus.ACTIVATED) {
      if (
        tradeStack?.sellVol === undefined ||
        sdk.toBig(tradeStack?.sellVol).lte(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk
          .toBig(tradeStack?.sellVol)
          .minus(tradeStack?.deFiSideCalcData?.stackViewInfo?.minSellVol ?? 0)
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk.toBig(
              tradeStack?.deFiSideCalcData?.stackViewInfo?.minSellAmount ?? 0
            ),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false, isAbbreviate: true }
          )} ${coinSellSymbol}`,
        };
      } else if (
        sdk
          .toBig(tradeStack?.sellVol)
          .gt(tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellVol ?? 0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMax| ${getValuePrecisionThousand(
            sdk.toBig(
              tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellAmount ?? 0
            ),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false, isAbbreviate: true }
          )} ${coinSellSymbol}`,
        };
        // return {
        //   tradeBtnStatus: TradeBtnStatus.DISABLED,
        //   label: `labelDefiNoEnough| ${coinSellSymbol}`,
        // };
      } else if (
        tradeStack?.deFiSideCalcData?.coinSell?.tradeValue &&
        sdk
          .toBig(tradeStack.deFiSideCalcData.coinSell.tradeValue)
          .gt(tradeStack.deFiSideCalcData?.coinSell.balance ?? 0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelStakeNoEnough| ${coinSellSymbol}`,
        };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [
    tradeStack?.deFiSideCalcData?.stackViewInfo?.minSellVol,
    tradeStack.sellVol,
    tradeStack.sellToken,
    tradeStack.deFiSideCalcData,
    tokenMap,
    coinSellSymbol,
  ]);
  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  });
  React.useEffect(() => {
    getStakingMap();
    walletLayer2Service.sendUserUpdate();
  }, []);
  React.useEffect(() => {
    const {
      _router_tradeStack: { tradeStack },
      invest: {
        stakingMap: { marketMap: stakingMap },
      },
    } = store.getState();

    if (
      stakingMapStatus === SagaStatus.UNSET &&
      stakingMap &&
      stakingMap[coinSellSymbol]?.symbol == coinSellSymbol &&
      !(tradeStack?.deFiSideCalcData?.coinSell?.belong == coinSellSymbol)
    ) {
      resetDefault(true);
    } else if (
      stakingMapStatus === SagaStatus.UNSET &&
      stakingMap &&
      !stakingMap[coinSellSymbol]
    ) {
      // setToastOpen({
      //
      // })
    }
    return () => {
      resetTradeStack();
      handleOnchange.cancel();
    };
  }, [stakingMapStatus]);
  const stackWrapProps = React.useMemo(() => {
    return {
      disabled: false,
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isJoin: true,
      isLoading,
      switchStobEvent: (
        _isStoB: boolean | ((prevState: boolean) => boolean)
      ) => {},
      onSubmitClick: onBtnClick as () => void,
      onChangeEvent: handleOnchange,
      deFiSideCalcData: {
        ...tradeStack.deFiSideCalcData,
      },
      minSellAmount: tradeStack?.deFiSideCalcData?.stackViewInfo?.minSellAmount,
      maxSellAmount: tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellAmount,
      tokenSell: {
        ...tokenMap[coinSellSymbol],
        decimals: tradeStack?.deFiSideCalcData?.stackViewInfo?.decimals,
        precision: tradeStack?.deFiSideCalcData?.stackViewInfo?.precision,
      },
      btnStatus,
      accStatus: account.readyState,
    };
  }, [
    refreshRef,
    sendRequest,
    tradeStack.deFiSideCalcData,
    tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellVol,
    account.readyState,
    tradeMarketI18nKey,
    isLoading,
    onBtnClick,
    handleOnchange,
    tokenMap,
    coinSellSymbol,
    btnStatus,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    stackWrapProps: stackWrapProps as unknown as DeFiSideWrapProps<T, I, ACD>,
  };
};
