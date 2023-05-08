import React from "react";
import {
  AmmRecordRow,
  MyPoolRow,
  RawDataDefiSideStakingItem,
} from "@loopring-web/component-lib";
import {
  getUserAmmTransaction,
  LoopringAPI,
  makeDefiInvestReward,
  makeMyAmmMarketArray,
  makeMyPoolRowWithPoolState,
  makeWalletLayer2,
  SummaryMyInvest,
  useAccount,
  useAmmMap,
  useDefiMap,
  useStakingMap,
  useTokenMap,
  useTokenPrices,
  useUserRewards,
  useWalletLayer2,
  useWalletLayer2Socket,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import {
  AccountStatus,
  CustomError,
  ErrorMap,
  RowInvestConfig,
  SagaStatus,
  STAKING_INVEST_LIMIT,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export const useOverview = <
  R extends { [key: string]: any },
  I extends { [key: string]: any }
>({
  dualOnInvestAsset,
  rowConfig = RowInvestConfig,
  hideSmallBalances,
}: {
  ammActivityMap:
    | sdk.LoopringMap<sdk.LoopringMap<sdk.AmmPoolActivityRule[]>>
    | undefined;
  dualOnInvestAsset: any; //RawDataDualAssetItem[];
  rowConfig?: any;
  hideSmallBalances: boolean;
}): {
  myAmmMarketArray: AmmRecordRow<R>[];
  summaryMyInvest: Partial<SummaryMyInvest>;
  myPoolRow: MyPoolRow<R>[];
  showLoading: boolean;
  filter: { searchValue: string };
  tableHeight: number;
  handleFilterChange: (props: { searchValue: string }) => void;
  stakingList: RawDataDefiSideStakingItem[];
  getStakingList: (props: { limit?: number; offset?: number }) => Promise<void>;
  stakeShowLoading: boolean;
  stakingTotal: number;
  totalStaked: string;
  totalStakedRewards: string;
  totalLastDayPendingRewards: string;
  totalClaimableRewards: string;
  stakedSymbol: string;
} => {
  const { account } = useAccount();
  const { status: walletLayer2Status } = useWalletLayer2();
  const { status: userRewardsStatus, userRewardsMap } = useUserRewards();
  const { tokenMap, idIndex } = useTokenMap();
  const { marketCoins: defiCoinArray } = useDefiMap();
  const { status: ammMapStatus, ammMap } = useAmmMap();
  const { tokenPrices } = useTokenPrices();
  const { status: stakingMapStatus, marketMap: stakingMap } = useStakingMap();

  const [summaryMyInvest, setSummaryMyInvest] = React.useState<
    Partial<SummaryMyInvest>
  >({});
  const [filter, setFilter] = React.useState({
    searchValue: "",
  });
  const [stakeShowLoading, setStakeShowLoading] = React.useState(false);
  const [
    {
      stakingList,
      total: stakingTotal,
      totalStaked,
      totalLastDayPendingRewards,
      totalStakedRewards,
      totalClaimableRewards,
      stakedSymbol,
    },
    setStakingProps,
  ] = React.useState<{
    stakingList: RawDataDefiSideStakingItem[];
    totalStaked: string;
    totalLastDayPendingRewards: string;
    totalStakedRewards: string;
    totalClaimableRewards: string;
    total: number;
    stakedSymbol: string;
  }>({
    stakingList: [],
    total: 0,
    totalStaked: "0",
    totalLastDayPendingRewards: "0",
    totalStakedRewards: "0",
    totalClaimableRewards: "0",
    stakedSymbol: "LRC",
  });

  const [totalData, setTotalData] = React.useState<MyPoolRow<R>[]>([]);
  const [myPoolRow, setMyPoolRow] = React.useState<MyPoolRow<R>[]>([]);
  const [tableHeight, setTableHeight] = React.useState(0);
  const resetTableData = React.useCallback(
    (viewData) => {
      setMyPoolRow(viewData);
      setTableHeight(
        rowConfig.rowHeaderHeight + viewData.length * rowConfig.rowHeight
      );
    },
    [rowConfig.rowHeaderHeight, rowConfig.rowHeight]
  );
  const updateData = React.useCallback(() => {
    let resultData: MyPoolRow<R>[] =
      totalData && !!totalData.length ? totalData : [];
    // if (filter.hideSmallBalance) {
    if (hideSmallBalances) {
      resultData = resultData.filter((o) => !o.smallBalance);
    }
    if (filter.searchValue) {
      resultData = resultData.filter(
        (o) =>
          o.ammDetail.coinAInfo.simpleName
            .toLowerCase()
            .includes(filter.searchValue.toLowerCase()) ||
          o.ammDetail.coinBInfo.simpleName
            .toLowerCase()
            .includes(filter.searchValue.toLowerCase())
      );
    }
    resetTableData(resultData);
  }, [totalData, filter, hideSmallBalances, resetTableData]);
  const handleFilterChange = React.useCallback(
    (filter) => {
      setFilter(filter);
    },
    [setFilter]
  );
  React.useEffect(() => {
    updateData();
  }, [totalData, filter, hideSmallBalances]);

  const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<
    AmmRecordRow<R>[]
  >([]);
  const [showLoading, setShowLoading] = React.useState(false);
  const mountedRef = React.useRef(false);

  const walletLayer2DoIt = React.useCallback(async () => {
    const { walletMap: _walletMap } = makeWalletLayer2(false);
    if (_walletMap) {
      const res = await getUserAmmTransaction({});
      let _myTradeArray = makeMyAmmMarketArray(
        undefined,
        res ? res.userAmmPoolTxs : []
      );
      if (mountedRef.current) {
        setMyAmmMarketArray(_myTradeArray ? _myTradeArray : []);
      }
    }
    return _walletMap;
  }, []);

  const makeMyPoolRow = React.useCallback(
    async (_walletMap): Promise<MyPoolRow<R>[]> => {
      let totalCurrentInvest = {
        ammPoolDollar: 0,
        stakeETHDollar: 0,
      };
      if (_walletMap && ammMap && userRewardsMap && tokenPrices) {
        // @ts-ignore
        const _myPoolRow: MyPoolRow<R>[] = Reflect.ownKeys(_walletMap).reduce(
          (prev, walletKey) => {
            if (/LP-/i.test(walletKey as string)) {
              const ammKey = walletKey.toString().replace("LP-", "AMM-");
              const marketKey = walletKey.toString().replace("LP-", "");
              let rowData: MyPoolRow<R> | undefined;
              rowData = makeMyPoolRowWithPoolState({
                ammDetail: ammMap[ammKey],
                walletMap: _walletMap,
                market: marketKey,
                ammUserRewardMap: userRewardsMap,
              }) as any;
              if (rowData !== undefined) {
                prev.push(rowData);
              }
            }

            return prev;
          },
          [] as MyPoolRow<R>[]
        );

        const formattedPoolRow = _myPoolRow.map((o: MyPoolRow<R>) => {
          const market = `LP-${o.ammDetail?.coinAInfo.simpleName}-${o.ammDetail?.coinBInfo.simpleName}`;
          const totalAmount = o.totalLpAmount ?? 0;
          const totalAmmValueDollar = (tokenPrices[market] || 0) * totalAmount;
          const coinA = o.ammDetail?.coinAInfo?.simpleName;
          const coinB = o.ammDetail?.coinBInfo?.simpleName;
          const precisionA = tokenMap ? tokenMap[coinA]?.precision : undefined;
          const precisionB = tokenMap ? tokenMap[coinB]?.precision : undefined;
          // totalCurrentInvest.investDollar += Number(o.balanceDollar ?? 0);
          totalCurrentInvest.ammPoolDollar += Number(o.balanceDollar ?? 0);
          return {
            ...o,
            totalAmmValueDollar,
            precisionA,
            precisionB,
          };
        });
        defiCoinArray?.forEach((defiCoinKey) => {
          totalCurrentInvest.stakeETHDollar += Number(
            (_walletMap[defiCoinKey]?.count.replaceAll(sdk.SEP, "") ?? 0) *
              tokenPrices[defiCoinKey] ?? 0
          );
        }, []);
        // if (dualOnInvestAsset) {
        //   Object.keys(dualOnInvestAsset).forEach((key) => {
        //     const item = dualOnInvestAsset[key];
        //     const { amount, tokenId } = item;
        //     const tokenInfo = tokenMap[idIndex[tokenId]];
        //     totalCurrentInvest.dualStakeDollar +=
        //       volumeToCountAsBigNumber(tokenInfo.symbol, amount)
        //         ?.times(tokenPrices[tokenInfo.symbol] ?? 0)
        //         .toNumber() ?? 0;
        //   });
        // }

        setSummaryMyInvest((state) => {
          return {
            ...state,
            ...totalCurrentInvest,
            investDollar: sdk
              .toBig(totalCurrentInvest.ammPoolDollar ?? 0)
              .plus(state.dualStakeDollar ?? 0)
              .plus(totalCurrentInvest.stakeETHDollar ?? 0)
              .plus(state.stakeLRCDollar ?? 0)
              .toString(),
          };
        });
        return formattedPoolRow as any;
      }
      return [];
    },
    [ammMap, userRewardsMap, tokenPrices, tokenMap, dualOnInvestAsset]
  );

  const walletLayer2Callback = React.useCallback(async () => {
    if (ammMap && tokenPrices && userRewardsMap) {
      setShowLoading(true);
      const _walletMap = await walletLayer2DoIt();
      const _myPoolRow = await makeMyPoolRow(_walletMap);
      setTotalData(_myPoolRow);
      setShowLoading(false);
    }
  }, [ammMap, tokenPrices, userRewardsMap, walletLayer2DoIt, makeMyPoolRow]);

  useWalletLayer2Socket({ walletLayer2Callback });
  React.useEffect(() => {
    if (
      ammMapStatus === SagaStatus.UNSET &&
      userRewardsStatus === SagaStatus.UNSET &&
      walletLayer2Status === SagaStatus.UNSET
    ) {
      walletLayer2Callback();
    }
  }, [ammMapStatus, userRewardsStatus, walletLayer2Status, dualOnInvestAsset]);

  React.useEffect(() => {
    mountedRef.current = true;
    setShowLoading(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (userRewardsStatus === SagaStatus.UNSET) {
      // let summaryReward: any = makeSummaryMyAmm({ userRewardsMap }) ?? {};
      makeDefiInvestReward().then((summaryDefiReward) => {
        const dualStakeDollar = sdk.toBig(summaryDefiReward);
        // summaryReward.rewardDollar = dualStakeDollar
        //   .plus(summaryReward?.rewardDollar ?? 0)
        //   .toString();
        setSummaryMyInvest((state) => {
          return {
            ...state,
            investDollar: sdk
              .toBig(state.ammPoolDollar ?? 0)
              .plus(dualStakeDollar ?? 0)
              .plus(state.stakeETHDollar ?? 0)
              .plus(state.stakeLRCDollar ?? 0)
              .toString(),
            dualStakeDollar: dualStakeDollar.toString(),
          };
        });
      });

      walletLayer2Callback();
    }
  }, [userRewardsStatus]);

  const getStakingList = React.useCallback(
    async ({
      limit = STAKING_INVEST_LIMIT,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    }) => {
      setStakeShowLoading(true);
      const LRCStakingSymbol = "LRC";
      if (
        LoopringAPI.defiAPI &&
        account.readyState === AccountStatus.ACTIVATED
      ) {
        const [response] = await Promise.all([
          LoopringAPI.defiAPI.getStakeSummary(
            {
              accountId: account.accountId,
              limit,
              offset,
              statuses: "locked,partial_unlocked",
              tokenId: tokenMap[LRCStakingSymbol].tokenId,
            },
            account.apiKey
          ),
        ]);
        if (
          (response &&
            ((response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message)) ||
          !stakingMap[LRCStakingSymbol]
        ) {
          throw new CustomError(ErrorMap.ERROR_UNKNOWN);
        } else {
          let {
            totalNum,
            totalStaked,
            totalStakedRewards,
            totalLastDayPendingRewards,
            totalClaimableRewards,
            list,
          } = response as any;

          list = list.map((item: sdk.StakeInfoOrigin) => {
            return {
              ...stakingMap[LRCStakingSymbol],
              ...item,
              status_product: stakingMap[LRCStakingSymbol].status,
            };
          });

          setStakingProps({
            total: totalNum,
            stakingList: list,
            totalStaked,
            totalStakedRewards,
            totalLastDayPendingRewards,
            totalClaimableRewards,
            stakedSymbol: LRCStakingSymbol,
          });

          const totalDollar = sdk
            .toBig(totalStaked)
            .div("1e" + tokenMap[LRCStakingSymbol].decimals)
            .times(tokenPrices[LRCStakingSymbol]);

          setSummaryMyInvest((state) => {
            return {
              ...state,
              stakeLRCDollar: totalDollar.toString(),
              investDollar: sdk
                .toBig(state.ammPoolDollar ?? 0)
                .plus(state.dualStakeDollar ?? 0)
                .plus(state.stakeETHDollar ?? 0)
                .plus(totalDollar ?? 0)
                .toString(),
            };
          });
        }
      }
      setStakeShowLoading(false);
    },
    [account, tokenPrices]
  );
  React.useEffect(() => {
    if (
      walletLayer2Status === SagaStatus.UNSET &&
      stakingMapStatus === SagaStatus.UNSET
    ) {
      getStakingList({});
    }
  }, [account.readyState, stakingMapStatus, walletLayer2Status]);
  return {
    myAmmMarketArray,
    summaryMyInvest,
    myPoolRow,
    showLoading,
    filter,
    tableHeight,
    handleFilterChange,
    stakingList,
    getStakingList,
    stakeShowLoading,
    stakingTotal,
    totalStaked,
    totalStakedRewards,
    totalLastDayPendingRewards,
    totalClaimableRewards,
    stakedSymbol,
  };
};
