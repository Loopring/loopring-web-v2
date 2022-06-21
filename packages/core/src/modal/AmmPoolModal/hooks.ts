import React from "react";
import {
  AccountStatus,
  AmmActivity,
  CoinInfo,
  MyAmmLP,
  SagaStatus,
  TradeFloat,
  myLog,
} from "@loopring-web/common-resources";
import moment from "moment";

import {
  makeWalletLayer2,
  volumeToCount,
  WalletMapExtend,
  makeMyAmmMarketArray,
  getUserAmmTransaction,
  getRecentAmmTransaction,
  AmmDetailStore,
  useTokenPrices,
  useUserRewards,
  useAmmActivityMap,
  useSystem,
  useTicker,
  useAccount,
  useTokenMap,
  useWalletLayer2,
  useAmmMap,
  LoopringAPI,
  useWalletLayer2Socket,
  store,
  calcPriceByAmmTickMapDepth,
  swapDependAsync,
  makeMyAmmWithStat,
} from "../../index";
import {
  AmmPoolSnapshot,
  AmmPoolTx,
  getExistedMarket,
  TickerData,
  TradingInterval,
  UserAmmPoolTx,
} from "@loopring-web/loopring-sdk";

import _ from "lodash";
import {
  AmmRecordRow,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";

const makeAmmDetailExtendsActivityMap = ({
  ammMap,
  coinMap,
  ammActivityMap,
  market,
  coinA,
  coinB,
}: any) => {
  let amm = "AMM-" + market;

  let ammDetail = undefined;

  if (ammMap && coinMap) {
    if (!ammMap[amm as string]) {
      amm = "AMM-LRC-ETH";
      market = "LRC-ETH";
    }
    ammDetail = _.cloneDeep(ammMap[amm as string]);
    const ammActivity = ammActivityMap[amm as string];

    if (ammDetail && coinA && coinB) {
      ammDetail.myCoinA = coinMap[coinA];
      ammDetail.myCoinB = coinMap[coinB];
      ammDetail["activity"] = ammActivity ? ammActivity : {};
    }
  }
  return {
    amm,
    market,
    ammDetail,
  };
};
type PgAmmDetail<C extends { [key: string]: any }> = AmmDetailStore<C> & {
  myCoinA: CoinInfo<C>;
  myCoinB: CoinInfo<C>;
  activity: AmmActivity<C> | undefined;
};

export type ammHistoryItem = {
  close: number;
  timeStamp: number;
};

export type AwardItme = {
  start: string;
  end: string;
  market: string;
  accountId: number;
  awardList: {
    token?: string;
    volume?: number;
  }[];
};

export const useCoinPair = <C extends { [key: string]: any }>({
  selectedMarket,
}: {
  selectedMarket: string;
}) => {
  const { ammActivityMap } = useAmmPool();

  const { coinMap, tokenMap, marketArray } = useTokenMap();
  const { ammMap, getAmmMap, status: ammMapStatus } = useAmmMap();
  const { userRewardsMap, status: useUserRewardsStatus } = useUserRewards();
  const { tickerMap } = useTicker();

  const { accountId } = store.getState().account;
  const { walletLayer2 } = useWalletLayer2();
  const [walletMap, setWalletMap] =
    React.useState<WalletMapExtend<C> | undefined>(undefined);
  const [snapShotData, setSnapShotData] =
    React.useState<
      | {
          tickerData: TickerData | undefined;
          ammPoolSnapshot: AmmPoolSnapshot | undefined;
        }
      | undefined
    >(undefined);

  const [myAmm, setMyAmm] = React.useState<MyAmmLP<C>>({
    feeA: 0,
    feeB: 0,
    feeDollar: 0,
    feeYuan: 0,
    reward: 0,
    rewardToken: undefined as any,
    balanceA: 0,
    balanceB: 0,
    balanceYuan: 0,
    balanceDollar: 0,
  });

  const [coinPairInfo, setCoinPairInfo] = React.useState<PgAmmDetail<C>>({
    myCoinA: undefined,
    myCoinB: undefined,
    activity: undefined,
    totalRewards: undefined,
    amountDollar: undefined,
    amountYuan: undefined,
    totalLPToken: undefined,
    totalA: undefined,
    totalB: undefined,
    rewardToken: undefined,
    rewardValue: undefined,
    feeA: undefined,
    feeB: undefined,
    isNew: undefined,
    isActivity: undefined,
    APR: undefined,
  } as unknown as PgAmmDetail<C>);
  const [tradeFloat, setTradeFloat] =
    React.useState<TradeFloat | undefined>(undefined);
  const [pair, setPair] = React.useState<{
    coinAInfo: CoinInfo<C> | undefined;
    coinBInfo: CoinInfo<C> | undefined;
  }>(() => {
    // @ts-ignore
    let [, coinA, coinB] = (selectedMarket ?? "").match(/(\w+)-(\w+)/i);
    const coinAInfo = coinMap[coinA];
    const coinBInfo = coinMap[coinB];
    return {
      coinAInfo,
      coinBInfo,
    };
  });
  const [pairHistory, setPairHistory] = React.useState<ammHistoryItem[]>([]);
  const [awardList, setAwardList] = React.useState<AwardItme[]>([]);

  const [stobPair, setStobPair] = React.useState<{
    stob: string | undefined;
    btos: string | undefined;
  }>({ stob: undefined, btos: undefined });

  const getAwardList = React.useCallback(async () => {
    try {
      if (LoopringAPI.ammpoolAPI) {
        const result =
          await LoopringAPI.ammpoolAPI.getLiquidityMiningUserHistory({
            accountId,
            start: 0,
            end: Number(moment()),
          });
        if (result && result.userMiningInfos) {
          const formattedList = result.userMiningInfos.map((o) => ({
            start: moment(o.start).format("YYYY/MM/DD"),
            end: moment(o.end).format("YYYY/MM/DD"),
            market: o.market,
            accountId: o.account_id,
            awardList: o.awards.map((item) => {
              const market = Reflect.ownKeys(tokenMap).find(
                (o) => o[1].tokenId === item.tokenId
              )?.[0];
              return {
                token: market,
                volume: volumeToCount(market as string, item.volume),
              };
            }),
          }));

          setAwardList(formattedList);
        }
      }
    } catch (reason: any) {}
  }, [accountId, tokenMap]);

  const walletLayer2DoIt = React.useCallback(() => {
    const { walletMap: _walletMap } = makeWalletLayer2(false);
    setWalletMap(_walletMap as WalletMapExtend<any>);
    return _walletMap;
  }, []);

  const getPairList = React.useCallback(
    async (coinPairInfo: any) => {
      if (
        LoopringAPI.exchangeAPI &&
        coinPairInfo.myCoinA &&
        coinPairInfo.myCoinB
      ) {
        const { myCoinA, myCoinB } = coinPairInfo;
        const market = `${myCoinA?.name}-${myCoinB?.name}`;
        const ammList = await LoopringAPI.exchangeAPI.getMixCandlestick({
          market: market,
          interval: TradingInterval.d1,
          limit: 30,
        });
        const formattedPairHistory = ammList.candlesticks
          .map((o) => ({
            ...o,
            timeStamp: o.timestamp,
            date: moment(o.timestamp).format("MMM DD"),
          }))
          .sort((a, b) => a.timeStamp - b.timeStamp);
        setPairHistory(formattedPairHistory);
      }
    },
    [setPairHistory]
  );

  React.useEffect(() => {
    getAwardList();
    // @ts-ignore
    let [, coinA, coinB] = (selectedMarket ?? "").match(/(\w+)-(\w+)/i);
    let { market } = getExistedMarket(marketArray, coinA, coinB);
    const {
      amm: realAmm,
      market: realMarket,
      ammDetail: _coinPairInfo,
    } = makeAmmDetailExtendsActivityMap({
      ammMap,
      coinMap,
      ammActivityMap,
      market,
      coinA,
      coinB,
    });

    // myLog('-----> _coinPairInfo:', market, ammMap, coinMap, ammActivityMap, _coinPairInfo)

    const coinPairInfoWithPrecision = {
      ..._coinPairInfo,
      precisionA: tokenMap
        ? tokenMap[_coinPairInfo.coinA]?.precision
        : undefined,
      precisionB: tokenMap
        ? tokenMap[_coinPairInfo.coinB]?.precision
        : undefined,
    };

    // setCoinPairInfo(_coinPairInfo ? _coinPairInfo : {})
    setCoinPairInfo(coinPairInfoWithPrecision ? coinPairInfoWithPrecision : {});

    getPairList(_coinPairInfo);

    if (coinMap) {
      const coinAInfo = coinMap[coinA];
      const coinBInfo = coinMap[coinB];
      setPair({
        coinAInfo,
        coinBInfo,
      });
    }

    if (walletLayer2) {
      walletLayer2DoIt();
    }

    if (realAmm && realMarket && ammMap) {
      getAmmMap();
      swapDependAsync(realMarket)
        .then(({ ammPoolSnapshot, tickMap, depth }) => {
          if (tokenMap && tickMap) {
            const _snapShotData = {
              tickerData: tickMap[realMarket],
              ammPoolSnapshot: ammPoolSnapshot,
            };
            const ticker = tickerMap[market];

            const { close, stob, btos } = calcPriceByAmmTickMapDepth({
              market: realMarket,
              tradePair: realMarket,
              dependencyData: { ammPoolSnapshot, ticker, depth },
            });
            setStobPair({ stob, btos });
            setTradeFloat({ ...ticker, close: close } as TradeFloat);

            const coinPairInfoWithPrecision = {
              ..._coinPairInfo,
              precisionA: tokenMap
                ? tokenMap[_coinPairInfo.coinA]?.precision
                : undefined,
              precisionB: tokenMap
                ? tokenMap[_coinPairInfo.coinB]?.precision
                : undefined,
            };

            setCoinPairInfo({ ...coinPairInfoWithPrecision });
            setSnapShotData(_snapShotData);
          }
        })
        .catch((error) => {
          myLog(error);
          throw Error;
        });
    }
  }, [selectedMarket]);

  const walletLayer2Callback = React.useCallback(async () => {
    const ammData = ammMap && ammMap["AMM-" + selectedMarket];
    if (selectedMarket && ammData) {
      const _walletMap = walletLayer2DoIt();
      const _myAmm: MyAmmLP<C> = makeMyAmmWithStat(
        selectedMarket,
        _walletMap,
        userRewardsMap,
        ammData
      );
      setMyAmm(_myAmm);
    }
  }, [ammMap, userRewardsMap, selectedMarket, walletLayer2DoIt]);

  useWalletLayer2Socket({ walletLayer2Callback });

  React.useEffect(() => {
    if (useUserRewardsStatus === SagaStatus.UNSET && selectedMarket) {
      walletLayer2Callback();
    }
  }, [selectedMarket, useUserRewardsStatus]);

  React.useEffect(() => {
    if (
      ammMapStatus === SagaStatus.UNSET &&
      ammMap &&
      pair.coinAInfo?.simpleName &&
      pair.coinBInfo?.simpleName
    ) {
      const _coinPairInfo = makeAmmDetailExtendsActivityMap({
        ammMap,
        coinMap,
        ammActivityMap,
        market: pair.coinAInfo.simpleName + pair.coinBInfo.simpleName,
        coinA: pair.coinAInfo.simpleName,
        coinB: pair.coinBInfo.simpleName,
      });
      setCoinPairInfo({
        ...coinPairInfo,
        ..._coinPairInfo,
        tradeFloat: coinPairInfo.tradeFloat,
      });
    }
  }, [ammMapStatus]);

  return {
    walletMap,
    myAmm,
    coinPairInfo,
    snapShotData,
    pair,
    tradeFloat,
    pairHistory,
    awardList,
    tickerMap,
    stob: stobPair.stob,
    btos: stobPair.btos,
  };
};

export const useAmmPool = <
  R extends { [key: string]: any },
  _I extends { [key: string]: any }
>() => {
  const { forex } = useSystem();
  const { account, status: accountStatus } = useAccount();
  const { tokenPrices } = useTokenPrices();
  const { currency, coinJson, isMobile } = useSettings();
  const { ammActivityMap, activityInProgressRules } = useAmmActivityMap();

  const { status: walletLayer2Status, walletLayer2 } = useWalletLayer2();
  const { ammMap, getAmmMap } = useAmmMap();

  const [ammMarketArray, setAmmMarketArray] = React.useState<AmmRecordRow<R>[]>(
    []
  );
  const [pageSize, setPageSize] = React.useState(14);

  const [ammTotal, setAmmTotal] = React.useState(0);
  const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<
    AmmRecordRow<R>[]
  >([]);
  const [ammUserTotal, setAmmUserTotal] = React.useState(0);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isRecentLoading, setIsRecentLoading] = React.useState(false);

  // const routerLocation = useLocation();
  const {
    modals: {
      isShowAmm: { symbol: market },
    },
  } = useOpenModals();
  // const list = routerLocation.pathname.split("/");
  // const market = list[list.length - 1];

  // init AmmMap at begin
  React.useEffect(() => {
    if (!ammMap || Object.keys(ammMap).length === 0) {
      getAmmMap();
    }
  }, []);

  const getUserAmmPoolTxs = React.useCallback(
    ({ limit = pageSize, offset = 0 }) => {
      // limit = pageSize;
      if (ammMap && forex) {
        const addr = ammMap["AMM-" + market]?.address;
        if (addr) {
          setIsLoading(true);
          getUserAmmTransaction({
            address: addr,
            limit: limit,
            offset,
            txStatus: "processed",
          })?.then(
            (res: {
              userAmmPoolTxs: UserAmmPoolTx[];
              totalNum: React.SetStateAction<number>;
            }) => {
              let _myTradeArray = makeMyAmmMarketArray(
                market,
                res.userAmmPoolTxs
              );

              const formattedArray = _myTradeArray.map((o: any) => {
                const market = `LP-${o.coinA.simpleName}-${o.coinB.simpleName}`;
                const formattedBalance = Number(
                  volumeToCount(market, o.totalBalance)
                );
                const price = tokenPrices && tokenPrices[market];
                const totalDollar = ((formattedBalance || 0) *
                  (price || 0)) as any;
                const totalYuan = totalDollar * forex;
                return {
                  ...o,
                  totalDollar: totalDollar,
                  totalYuan: totalYuan,
                };
              });
              setMyAmmMarketArray(formattedArray || []);
              setAmmUserTotal(res.totalNum);
              setIsLoading(false);
            }
          );
        }
      }
    },
    [ammMap, market, forex, tokenPrices, pageSize]
  );

  const getRecentAmmPoolTxs = React.useCallback(
    ({ limit = 15, offset = 0 }) => {
      if (ammMap && forex) {
        // const market = list[list.length - 1];
        const addr = ammMap["AMM-" + market]?.address;

        if (addr) {
          setIsRecentLoading(true);
          getRecentAmmTransaction({
            address: addr,
            limit: limit,
            offset,
          })?.then(
            ({
              ammPoolTrades,
              totalNum,
            }: {
              ammPoolTrades: AmmPoolTx[];
              totalNum: number;
            }) => {
              let _tradeArray = makeMyAmmMarketArray(market, ammPoolTrades);

              const formattedArray = _tradeArray.map((o: any) => {
                const market = `LP-${o.coinA.simpleName}-${o.coinB.simpleName}`;
                const formattedBalance = Number(
                  volumeToCount(market, o.totalBalance)
                );
                const price = tokenPrices && tokenPrices[market];
                const totalDollar = ((formattedBalance || 0) *
                  (price || 0)) as any;
                const totalYuan = totalDollar * forex;
                return {
                  ...o,
                  totalDollar: totalDollar,
                  totalYuan: totalYuan,
                };
              });
              setAmmMarketArray(formattedArray || []);
              setAmmTotal(totalNum);
              setIsRecentLoading(false);
            }
          );
        }
      }
    },
    [ammMap, forex, market, tokenPrices]
  );
  React.useEffect(() => {
    if (
      walletLayer2Status === SagaStatus.UNSET &&
      walletLayer2 !== undefined &&
      accountStatus === SagaStatus.UNSET
    ) {
      if (account.readyState === AccountStatus.ACTIVATED && market) {
        getUserAmmPoolTxs({ pageSize, offset: 0 });
      } else {
        setMyAmmMarketArray([]);
      }
    }
  }, [pageSize, walletLayer2Status, market]);

  return {
    ammActivityMap,
    isMyAmmLoading: isLoading,
    isRecentLoading,
    ammMarketArray,
    ammTotal,
    isMobile,
    myAmmMarketArray,
    ammUserTotal,
    activityInProgressRules,
    getUserAmmPoolTxs, //handle page change used
    getRecentAmmPoolTxs,
    tokenPrices,
    currency,
    coinJson,
    forex,
    pageSize,
    setPageSize,
  };
};
