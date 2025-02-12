import React from 'react'
import { AmmRecordRow, MyPoolRow, RawDataDefiSideStakingItem } from '@loopring-web/component-lib'
import {
  LoopringAPI,
  makeDefiInvestReward,
  makeWalletLayer2,
  store,
  SummaryMyInvest,
  useAccount,
  useAmmMap,
  useDefiMap,
  useStakingMap,
  useTokenMap,
  useTokenPrices,
  useUserRewards,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '@loopring-web/core'
import {
  AccountStatus,
  CustomError,
  ErrorMap,
  myLog,
  RowInvestConfig,
  SagaStatus,
  STAKING_INVEST_LIMIT,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { pickBy, toArray } from 'lodash'
// import { walletServices } from "@loopring-web/web3-provider";

export const useOverview = <R extends { [key: string]: any }, I extends { [key: string]: any }>({
  dualOnInvestAsset,
  rowConfig = RowInvestConfig,
  hideSmallBalances,
}: {
  ammActivityMap: sdk.LoopringMap<sdk.LoopringMap<sdk.AmmPoolActivityRule[]>> | undefined
  dualOnInvestAsset: any //RawDataDualAssetItem[];
  rowConfig?: any
  hideSmallBalances: boolean
}): {
  myAmmMarketArray: AmmRecordRow<R>[]
  summaryMyInvest: Partial<SummaryMyInvest>
  myPoolRow: MyPoolRow<R>[]
  showLoading: boolean
  filter: { searchValue: string }
  tableHeight: number
  handleFilterChange: (props: { searchValue: string }) => void
  stakingList: RawDataDefiSideStakingItem[]
  getStakingList: (props: { limit?: number; offset?: number }) => Promise<void>
  stakeShowLoading: boolean
  stakingTotal: number
  totalStaked: string
  totalStakedRewards: string
  totalLastDayPendingRewards: string
  totalClaimableRewards: string
  stakedSymbol: string
} => {
  const { account, status: accountStatus } = useAccount()
  const { status: userRewardsStatus, userRewardsMap, myAmmLPMap } = useUserRewards()
  const { tokenMap } = useTokenMap()
  const { marketCoins: defiCoinArray, marketLeverageCoins: leverageETHCoinArray } = useDefiMap()

  const { status: ammMapStatus, ammMap } = useAmmMap()
  const { tokenPrices } = useTokenPrices()
  const { marketMap: stakingMap } = useStakingMap()

  const [summaryMyInvest, setSummaryMyInvest] = React.useState<Partial<SummaryMyInvest>>({})
  const [filter, setFilter] = React.useState({
    searchValue: '',
  })
  const [stakeShowLoading, setStakeShowLoading] = React.useState(false)
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
    stakingList: RawDataDefiSideStakingItem[]
    totalStaked: string
    totalLastDayPendingRewards: string
    totalStakedRewards: string
    totalClaimableRewards: string
    total: number
    stakedSymbol: string
  }>({
    stakingList: [],
    total: 0,
    totalStaked: '0',
    totalLastDayPendingRewards: '0',
    totalStakedRewards: '0',
    totalClaimableRewards: '0',
    stakedSymbol: 'LRC',
  })

  // const [totalData, setTotalData] = React.useState<MyPoolRow<R>[]>([]);
  const [summaryDefiReward, setSummaryDefiReward] = React.useState('')
  const [myPoolRow, setMyPoolRow] = React.useState<MyPoolRow<R>[]>([])
  const [tableHeight, setTableHeight] = React.useState(0)
  const resetTableData = React.useCallback(
    (viewData) => {
      setMyPoolRow(viewData)
      setTableHeight(
        viewData.length > 0
          ? rowConfig.rowHeaderHeight + viewData.length * rowConfig.rowHeight
          : 350,
      )
    },
    [rowConfig.rowHeaderHeight, rowConfig.rowHeight],
  )
  const updateData = React.useCallback(() => {
    if (myAmmLPMap) {
      let resultData: MyPoolRow<R>[] = Object.keys(myAmmLPMap).map((key) => ({
        ...myAmmLPMap[key],
        ammDetail: ammMap['AMM-' + key],
      }))

      if (hideSmallBalances) {
        // myLog('hideSmallBalances', hideSmallBalances, resultData)
        resultData = resultData.filter((o) => sdk.toBig(o?.balanceU ?? 0).gt(0))
      }
      if (filter.searchValue) {
        resultData = resultData.filter(
          (o) =>
            o.ammDetail.coinAInfo.simpleName
              .toLowerCase()
              .includes(filter.searchValue.toLowerCase()) ||
            o.ammDetail.coinBInfo.simpleName
              .toLowerCase()
              .includes(filter.searchValue.toLowerCase()),
        )
      }
      resetTableData(resultData)
    }
  }, [myAmmLPMap, filter, hideSmallBalances, resetTableData, defiCoinArray])
  const handleFilterChange = React.useCallback(
    (filter) => {
      setFilter(filter)
    },
    [setFilter],
  )
  React.useEffect(() => {
    updateData()
  }, [filter, hideSmallBalances])

  const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<AmmRecordRow<R>[]>([])
  const [showLoading, setShowLoading] = React.useState(false)
  const mountedRef = React.useRef(false)


  React.useEffect(() => {
    if (ammMapStatus === SagaStatus.UNSET && accountStatus === SagaStatus.UNSET) {
      walletLayer2Service.sendUserUpdate()
      const account = store.getState().account
      if (account.readyState == AccountStatus.ACTIVATED) {
        getStakingList({})
        makeDefiInvestReward().then((summaryDefiReward) => {
          if (mountedRef.current) {
            setSummaryDefiReward(summaryDefiReward.toString())
          }
        })
      }
    }
  }, [ammMapStatus, accountStatus])


  React.useEffect(() => {
    mountedRef.current = true
    setShowLoading(true)
    return () => {
      mountedRef.current = false
    }
  }, [])

  const getStakingList = React.useCallback(
    async ({ limit = STAKING_INVEST_LIMIT, offset = 0 }: { limit?: number; offset?: number }) => {
      setStakeShowLoading(true)
      const stakingSymbol = 'TAIKO'
      if (LoopringAPI.defiAPI && account.readyState === AccountStatus.ACTIVATED) {
        const [response] = await Promise.all([
          LoopringAPI.defiAPI.getStakeSummary(
            {
              accountId: account.accountId,
              limit,
              offset,
              statuses: 'locked,partial_unlocked',
              tokenId: tokenMap[stakingSymbol].tokenId,
            },
            account.apiKey,
          ),
        ])
        if (
          (response &&
            ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)) ||
          !stakingMap[stakingSymbol]
        ) {
          throw new CustomError(ErrorMap.ERROR_UNKNOWN)
        } else {
          let {
            totalNum,
            totalStaked,
            totalStakedRewards,
            totalLastDayPendingRewards,
            totalClaimableRewards,
            list,
          } = response as any

          list = list.map((item: sdk.StakeInfoOrigin) => {
            return {
              ...stakingMap[stakingSymbol],
              ...item,
              status_product: stakingMap[stakingSymbol].status,
            }
          })

          setStakingProps({
            total: totalNum,
            stakingList: list,
            totalStaked,
            totalStakedRewards,
            totalLastDayPendingRewards,
            totalClaimableRewards,
            stakedSymbol: stakingSymbol,
          })

          const totalDollar = sdk
            .toBig(totalStaked)
            .div('1e' + tokenMap[stakingSymbol].decimals)
            .times(tokenPrices[stakingSymbol])

          setSummaryMyInvest((state) => {
            return {
              ...state,
              taikoFarmingDollar: totalDollar.toString(),
              investDollar: sdk
                .toBig(state.ammPoolDollar ?? 0)
                .plus(state.dualStakeDollar ?? 0)
                .plus(state.leverageETHDollar ?? 0)
                .plus(state.taikoFarmingDollar ?? 0)
                .plus(totalDollar ?? 0)
                .toString(),
            }
          })
        }
      }
      setStakeShowLoading(false)
    },
    [account, tokenPrices],
  )

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
  }
}
