import React from "react";
import {
  AccountStatus,
  SagaStatus,
  AmmDetail,
  myLog,
  ErrorMap,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  LoopringAPI,
  useTokenMap,
  useAccount,
  useSocket,
  useToast,
  usePageAmmPool,
  store,
  useAmmMap,
  AmmDetailStore,
  useTicker,
  makeWalletLayer2,
  calcPriceByAmmTickMapDepth,
  initSlippage,
  useWalletLayer2Socket,
  useUserRewards,
} from "../../index";
import { ToastType, useOpenModals } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";

const useAmmSocket = ({ market }: { market: string }) => {
  const { sendSocketTopic, socketEnd } = useSocket();
  const { account } = useAccount();

  React.useEffect(() => {
    const { ammMap } = store.getState().amm.ammMap;
    const ammInfo: AmmDetail<any> = ammMap["AMM-" + market];
    if (account.readyState === AccountStatus.ACTIVATED && ammInfo?.address) {
      sendSocketTopic({
        [sdk.WsTopicType.account]: true,
        [sdk.WsTopicType.ammpool]: ammInfo?.address ? [ammInfo.address] : [],
        [sdk.WsTopicType.ticker]: [`${ammInfo.market}`],
      });
    } else if (ammInfo?.address) {
      sendSocketTopic({
        [sdk.WsTopicType.ammpool]: ammInfo?.address ? [ammInfo.address] : [],
        [sdk.WsTopicType.ticker]: [`${ammInfo.market}`],
      });
    } else {
      socketEnd();
    }
    return () => {
      socketEnd();
    };
  }, [account.readyState]);
};

export function usePairInit({ ammInfo }: { ammInfo: AmmDetailStore<any> }) {
  const { tickerMap } = useTicker();
  const { coinMap, tokenMap } = useTokenMap();
  const [pairInit] = React.useState(() => {
    let coinACount = 0,
      coinBCount = 0,
      percentage = 0;
    const coinLp = "LP-" + ammInfo.market;

    const { walletMap } = makeWalletLayer2(false);
    let ammCalcData: any = {
      coinInfoMap: coinMap,
    };
    const lpToken = tokenMap["LP-" + ammInfo.market];
    const { totalLPToken, totalA, totalB } = ammInfo;
    const {
      close: _close,
      stob,
      btos,
    } = calcPriceByAmmTickMapDepth({
      market: ammInfo.market as any,
      tradePair: ammInfo.market as any,
      dependencyData: {
        ammPoolSnapshot: {
          poolName: ammInfo.name,
          poolAddress: ammInfo.address,
          pooled: ammInfo.tokens.pooled, //[ammInfo., TokenVolumeV3];
          lp: {
            tokenId: lpToken.tokenId,
            volume: ammInfo.tokens.lp,
          },
          risky: false,
        },
        ticker: tickerMap[ammInfo?.market],
        depth: undefined,
      },
    });
    ammCalcData = {
      ...ammCalcData,
      AtoB: stob,
      BtoA: btos,
      myCoinA: {
        belong: ammInfo.coinA,
        balance: walletMap ? walletMap[ammInfo?.coinA ?? ""]?.count : undefined,
        tradeValue: undefined,
      },
      myCoinB: {
        belong: ammInfo.coinB,
        balance: walletMap ? walletMap[ammInfo?.coinB ?? 0]?.count : undefined,
        tradeValue: undefined,
      },
    };

    const lpBalance = walletMap ? walletMap[coinLp ?? ""]?.count : 0;
    if (totalA && totalLPToken && totalB) {
      percentage = totalLPToken
        ? sdk
            .toBig(lpBalance ?? 0)
            .div(totalLPToken)
            .toNumber()
        : 0;
      coinACount = totalA * percentage;
      coinBCount = totalB * percentage;
    }
    ammCalcData = {
      ...ammCalcData,
      lpCoin: { belong: coinLp, balance: lpBalance },
      lpCoinA: {
        belong: ammInfo.coinA,
        balance: coinACount,
      },
      lpCoinB: {
        belong: ammInfo.coinB,
        balance: coinBCount,
      },
      percentage,
    };

    return {
      ammJoin: {
        ammData: {
          coinA: { ...ammCalcData.myCoinA, tradeValue: undefined },
          coinB: { ...ammCalcData.myCoinB, tradeValue: undefined },
          coinLP: { ...ammCalcData.lpCoin, tradeValue: undefined },
          slippage: initSlippage,
        },
        ammCalcData,
      },
      ammExit: {
        ammData: {
          coinA: { ...ammCalcData.myCoinA, tradeValue: undefined },
          coinB: { ...ammCalcData.myCoinB, tradeValue: undefined },
          coinLP: { ...ammCalcData.lpCoin, tradeValue: undefined },
          slippage: initSlippage,
        },
        ammCalcData,
        // ...feePatch,
      },
    };
  });
  return { ...pairInit };
}

export const useAmmCommon = ({ market }: { market: string }) => {
  const { t } = useTranslation();
  const { getUserRewards } = useUserRewards();

  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { updateRealTimeAmmMap, ammMap } = useAmmMap();
  const { marketArray, tokenMap } = useTokenMap();
  const { setShowAccount } = useOpenModals();

  const { updatePageAmmExit, updatePageAmmJoin } = usePageAmmPool();
  const ammInfo = ammMap["AMM-" + market];
  const { ammExit, ammJoin } = usePairInit({
    ammInfo: ammMap["AMM-" + market],
  });
  const updateAmmPoolSnapshot = React.useCallback(async () => {
    const { ammMap } = store.getState().amm.ammMap;
    myLog("ammCommon", "market", market);
    if (market && market && LoopringAPI.ammpoolAPI) {
      const ammInfo: any = ammMap["AMM-" + market];
      LoopringAPI.ammpoolAPI
        .getAmmPoolSnapshot({
          poolAddress: ammInfo.address,
        })
        .then((response) => {
          if (
            !response ||
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw (response as sdk.RESULT_INFO).message;
          }
          const { ammPoolSnapshot } = response;
          updateRealTimeAmmMap({
            ammPoolStats: {
              ["AMM-" + market]: {
                ...ammMap["AMM-" + market].__rawConfig__,
                liquidity: [
                  ammPoolSnapshot.pooled[0].volume,
                  ammPoolSnapshot.pooled[1].volume,
                ],
                lpLiquidity: ammPoolSnapshot.lp.volume,
              },
            } as any,
          });
        });
    }
    await Promise.race([updateExitFee, updateJoinFee]);
    setShowAccount({ isShow: false });
  }, [marketArray, market]);
  const refreshRef = React.createRef();
  const getFee = async (
    requestType:
      | sdk.OffchainFeeReqType.AMM_EXIT
      | sdk.OffchainFeeReqType.AMM_JOIN
  ) => {
    const account = store.getState().account;
    const { ammMap } = store.getState().amm.ammMap;
    const ammInfo = ammMap["AMM-" + market];
    if (
      ammInfo?.coinB &&
      LoopringAPI.userAPI &&
      account.status == SagaStatus.UNSET &&
      account.readyState == AccountStatus.ACTIVATED &&
      tokenMap
    ) {
      const feeToken: sdk.TokenInfo = tokenMap[ammInfo.coinB ?? ""];
      const request: sdk.GetOffchainFeeAmtRequest = {
        accountId: account.accountId,
        requestType,
        tokenSymbol: ammInfo?.coinB,
      };

      const { fees } = await LoopringAPI.userAPI?.getOffchainFeeAmt(
        request,
        account.apiKey
      );

      const feeRaw = fees[ammInfo.coinB] ? fees[ammInfo.coinB].fee : 0;
      const fee = sdk
        .toBig(feeRaw)
        .div("1e" + feeToken.decimals)
        .toNumber();

      // myLog("new fee:", fee.toString());
      return {
        fee,
        feeRaw,
        fees,
      };
    } else {
      throw "not ready";
    }
  };

  const updateExitFee = React.useCallback(async () => {
    const account = store.getState().account;
    if (account.readyState === AccountStatus.ACTIVATED && ammInfo?.coinB) {
      try {
        const feeInfo = await getFee(sdk.OffchainFeeReqType.AMM_EXIT);
        const { walletMap } = makeWalletLayer2(false);
        const { ammExit: _ammExit } = store.getState()._router_pageAmmPool;
        let { ammCalcData, ammData } = _ammExit;
        const lpBalance = walletMap
          ? walletMap["LP-" + ammInfo.market]?.count
          : 0;
        let percentage, coinACount, coinBCount;
        if (ammInfo.totalA && ammInfo.totalLPToken && ammInfo.totalB) {
          percentage = sdk
            .toBig(lpBalance ?? 0)
            .div(ammInfo?.totalLPToken ? ammInfo?.totalLPToken : 1); //totalLPToken ? lpBalance / totalLPToken : 0;
          coinACount = sdk.toBig(ammInfo.totalA).times(percentage);
          coinBCount = sdk.toBig(ammInfo.totalB).times(percentage);
        }
        if (!ammCalcData) {
          ammCalcData = ammExit.ammCalcData;
          ammData = ammExit.ammData;
        }
        updatePageAmmExit({
          ammData: {
            ...ammData,
            coinLP: {
              ...ammData?.coinLP,
              balance: lpBalance,
            } as any,
          },
          ammCalcData: {
            ...ammCalcData,
            lpCoin: {
              ...ammCalcData?.lpCoin,
              balance: lpBalance,
            },
            lpCoinA: {
              ...ammCalcData?.lpCoinA,
              balance: coinACount,
            },
            lpCoinB: {
              ...ammCalcData?.lpCoinB,
              balance: coinBCount,
            },
            percentage,
            fee: feeInfo?.fee,
            fees: feeInfo?.fees,
          } as any,
          fee: feeInfo?.fee,
          fees: feeInfo?.fees,
        });
      } catch (error) {
        console.log(error);
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: t(ErrorMap.NO_NETWORK_ERROR.messageKey, {
            ns: ToastType.error,
          }),
        });
      }
    } else {
      const {
        ammExit: { ammCalcData },
      } = store.getState()._router_pageAmmPool;
      if (!ammCalcData) {
        updatePageAmmExit({
          ammData: {
            ...ammExit.ammData,
            coinLP: {
              ...ammExit.ammData?.coinLP,
              balance: undefined,
            } as any,
          },
          ammCalcData: {
            ...ammExit.ammCalcData,
            lpCoin: {
              ...ammExit.ammCalcData.lpCoin,
              balance: undefined,
            },
            lpCoinA: {
              ...ammExit.ammCalcData.lpCoinA,
              balance: undefined,
            },
            lpCoinB: {
              ...ammExit.ammCalcData.lpCoinB,
              balance: undefined,
            },
            percentage: 0,
            fee: undefined,
            fees: undefined,
          } as any,
          fee: undefined,
          fees: undefined,
        });
      }
    }
  }, [ammExit]);
  const updateJoinFee = React.useCallback(async () => {
    const account = store.getState().account;

    if (ammInfo?.market && account.readyState === AccountStatus.ACTIVATED) {
      const feeInfo = await getFee(sdk.OffchainFeeReqType.AMM_JOIN);
      const { walletMap } = makeWalletLayer2(false);
      const { ammJoin: _ammJoin } = store.getState()._router_pageAmmPool;
      let { ammCalcData, ammData } = _ammJoin;
      if (!ammCalcData) {
        ammCalcData = ammJoin.ammCalcData;
        ammData = ammJoin.ammData;
      }
      const coinA = {
        ...ammData?.coinA,
        balance: walletMap ? walletMap[ammInfo.coinA]?.count : undefined,
      } as any;
      const coinB = {
        ...ammData?.coinB,
        balance: walletMap ? walletMap[ammInfo.coinB]?.count : undefined,
      } as any;
      updatePageAmmJoin({
        ammData: {
          ...ammData,
          coinA,
          coinB,
        },
        ammCalcData: {
          ...ammCalcData,
          myCoinA: coinA,
          myCoinB: coinB,
          fee: feeInfo?.fee,
          fees: feeInfo?.fees,
        } as any,
        fee: feeInfo?.fee,
        fees: feeInfo?.fees,
      });
    } else {
      const {
        ammJoin: { ammCalcData },
      } = store.getState()._router_pageAmmPool;
      if (!ammCalcData) {
        updatePageAmmJoin({
          ammData: {
            ...ammJoin.ammData,
            coinA: {
              ...ammJoin.ammData.coinA,
              balance: undefined,
            } as any,
            coinB: {
              ...ammJoin.ammData.coinB,
              balance: undefined,
            } as any,
          },
          ammCalcData: {
            ...ammJoin.ammCalcData,
            myCoinA: {
              ...ammJoin.ammCalcData.myCoinA,
              balance: undefined,
            },
            myCoinB: {
              ...ammJoin.ammCalcData.myCoinB,
              balance: undefined,
            },
            fee: 0,
            fees: undefined,
          } as any,
          fee: 0,
          fees: undefined,
        });
      }
    }
  }, [ammJoin]);

  const walletLayer2Callback = React.useCallback(async () => {
    getUserRewards();
  }, []);

  useWalletLayer2Socket({ walletLayer2Callback });
  useAmmSocket({ market });

  return {
    toastOpen,
    setToastOpen,
    closeToast,
    refreshRef,
    updateAmmPoolSnapshot,
    getFee,
    ammExit,
    ammJoin,
    updateExitFee,
    updateJoinFee,
  };
};
