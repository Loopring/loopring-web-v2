import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Tab, Tabs } from '@mui/material'
import {
  AmmTable,
  BtradeSwapTable,
  Button,
  DefiStakingTxTable,
  DefiTxsTable,
  DualTxsTable,
  OrderHistoryTable,
  Toast,
  ToastType,
  TradeTable,
  TransactionTable,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import {
  StylePaper,
  useAccount,
  useAmmMap,
  useGetOrderHistorys,
  useSystem,
  useToast,
  useTokenMap,
} from '@loopring-web/core'
import {
  useBtradeTransaction,
  useDefiSideRecord,
  useDualTransaction,
  useGetAmmRecord,
  useGetDefiRecord,
  useGetLeverageETHRecord,
  useGetTrades,
  useGetTxs,
  useOrderList,
} from './hooks'
import {
  BackIcon,
  MapChainId,
  RecordMap,
  RecordTabIndex,
  RowConfig,
  TOAST_TIME,
  TabOrderIndex,
} from '@loopring-web/common-resources'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'

const HistoryPanel = withTranslation('common')((rest: WithTranslation<'common'>) => {
  const history = useHistory()
  const { search } = useLocation()
  const { isMobile, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    toggle: { StopLimit },
  } = useToggle()
  const match: any = useRouteMatch('/l2assets/:history/:tab/:orderTab?')
  const [pageSize, setPageSize] = React.useState(0)
  const [currentTab, setCurrentTab] = React.useState<RecordTabIndex>(() => {
    let item = match?.params?.tab ?? RecordTabIndex.Transactions
    return RecordMap[network]?.includes(item) ? item : RecordTabIndex.Transactions
  })
  const [currentOrderTab, setCurrentOrderTab] = React.useState(() => {
    return match?.params?.orderTab ?? TabOrderIndex.orderOpenTable
  })

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { totalCoinMap, tokenMap, idIndex, marketArray } = useTokenMap()
  const { ammMap } = useAmmMap()

  const {
    txs: txTableData,
    txsTotal,
    showLoading: showTxsLoading,
    getUserTxnList,
    searchValue,
  } = useGetTxs(setToastOpen)
  const {
    userTrades,
    getUserTradeList,
    userTradesTotal,
    page: tradePage,
    showLoading: showTradeLoading,
  } = useGetTrades(setToastOpen)
  const {
    defiList,
    showLoading: showDefiLoading,
    getDefiTxList,
    defiTotal,
  } = useGetDefiRecord(setToastOpen)
  const {
    ammRecordList,
    showLoading: showAmmloading,
    ammRecordTotal,
    getAmmpoolList,
  } = useGetAmmRecord(setToastOpen)
  const {
    rawData,
    getOrderList,
    totalNum,
    showLoading,
    marketArray: orderRaw,
    cancelOrder,
  } = useOrderList({ setToastOpen })
  const {
    rawData: stopLimitRawData,
    getOrderList: getStopLimitOrderList,
    totalNum: totalNumStopLimit,
    showLoading: showLoadingStopLimit,
    cancelOrder: cancelOrderStopLimit,
  } = useOrderList({ setToastOpen, isStopLimit: true })

  const {
    dualList,
    showLoading: showDualLoading,
    getDualTxList,
    dualMarketMap,
    dualTotal,
  } = useDualTransaction(setToastOpen)
  const {
    sideStakingList,
    showLoading: showDefiSideStakingLoading,
    getSideStakingTxList,
    sideStakingTotal,
  } = useDefiSideRecord(setToastOpen)
  const {
    leverageETHList,
    showLoading: showLeverageETHLoading,
    getLeverageETHTxList,
    leverageETHTotal,
  } = useGetLeverageETHRecord(setToastOpen)

  const { userOrderDetailList, getUserOrderDetailTradeList } = useGetOrderHistorys()
  const { etherscanBaseUrl } = useSystem()
  const {
    getBtradeOrderList,
    btradeOrderData,
    onDetail,
    totalNum: btradeTotalNum,
    showLoading: showBtradeLoading,
  } = useBtradeTransaction(setToastOpen)

  const {
    account: { accAddress, accountId },
  } = useAccount()

  const { t } = rest
  const container = React.useRef<HTMLDivElement>(null)

  const handleTabChange = React.useCallback(
    (value: RecordTabIndex, _pageSize?: number) => {
      setCurrentTab(value)
      history.replace(`/l2assets/history/${value}?${search.replace('?', '')}`)
    },
    [history, search],
  )
  React.useEffect(() => {
    let height = container?.current?.offsetHeight
    if (height) {
      const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3
      setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3)
      handleTabChange(currentTab, pageSize)
    }
  }, [container?.current?.offsetHeight])
  // React.useEffect(()=>{},[])
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Box marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={history.goBack}
        >
          {t('labelTransactions')}
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
      </Box>
      {/*<IconButton*/}
      {/*  className={"back-btn"}*/}
      {/*  size={"large"}*/}
      {/*  color={"inherit"}*/}
      {/*  aria-label={t && t("labelBack")}*/}
      {/*  onClick={() => {*/}
      {/*    onBack && onBack();*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <BackIcon />*/}
      {/*</IconButton>*/}
      <StylePaper ref={container} flex={1}>
        <Toast
          alertText={toastOpen?.content ?? ''}
          severity={toastOpen?.type ?? ToastType.success}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
        <Box
          marginTop={2}
          display={'flex'}
          sx={isMobile ? { maxWidth: 'calc(100vw - 32px)' } : {}}
        >
          <Tabs
            value={currentTab}
            onChange={(_event, value) => handleTabChange(value)}
            aria-label='l2-history-tabs'
            variant='scrollable'
          >
            {RecordMap[network]?.map((item) => {
              return <Tab key={item} label={t(`labelLayer2History${item}`)} value={item} />
            })}
          </Tabs>
        </Box>
        <Box
          className='tableWrapper table-divide-short'
          display={'flex'}
          flex={1}
          overflow={'scroll'}
        >
          {currentTab === RecordTabIndex.Transactions ? (
            <TransactionTable
              {...{
                etherscanBaseUrl,
                rawData: txTableData,
                searchValue,
                pagination: {
                  pageSize: pageSize,
                  total: txsTotal,
                },
                filterTokens: totalCoinMap ? (Reflect.ownKeys(totalCoinMap) as string[]) : [],
                showFilter: true,
                showloading: showTxsLoading,
                getTxnList: getUserTxnList,
                accAddress,
                accountId,
                ...rest,
              }}
            />
          ) : currentTab === RecordTabIndex.Trades ? (
            <TradeTable
              getUserTradeList={getUserTradeList}
              {...{
                rawData: userTrades,
                showFilter: true,
                filterPairs: marketArray,
                showloading: showTradeLoading,
                tokenMap: tokenMap,
                isL2Trade: true,
                pagination: {
                  page: tradePage,
                  pageSize: pageSize,
                  total: userTradesTotal,
                },
                accAddress,
                accountId,
                ...rest,
              }}
            />
          ) : currentTab === RecordTabIndex.AmmRecords ? (
            <AmmTable
              {...{
                rawData: ammRecordList,
                pagination: {
                  pageSize: pageSize,
                  total: ammRecordTotal,
                },
                getAmmpoolList,
                showFilter: true,
                filterPairs: Reflect.ownKeys(ammMap ?? {}).map((item) =>
                  item.toString().replace('AMM', 'LP'),
                ),
                showloading: showAmmloading,
                ...rest,
              }}
            />
          ) : currentTab === RecordTabIndex.DefiRecords ? (
            <DefiTxsTable
              key={'defi'}
              {...{
                rawData: defiList,
                pagination: {
                  pageSize: pageSize,
                  total: defiTotal,
                },
                getDefiTxList,
                showloading: showDefiLoading,
                ...rest,
              }}
              tokenMap={tokenMap}
              idIndex={idIndex}
            />
          ) : currentTab === RecordTabIndex.SideStakingRecords ? (
            <DefiStakingTxTable
              {...{
                rawData: sideStakingList as any[],
                pagination: {
                  pageSize: pageSize,
                  total: sideStakingTotal,
                },
                getSideStakingTxList,
                showloading: showDefiSideStakingLoading,
                ...rest,
              }}
              tokenMap={tokenMap}
              idIndex={idIndex}
            />
          ) : currentTab === RecordTabIndex.DualRecords ? (
            <DualTxsTable
              rawData={dualList}
              getDualTxList={getDualTxList}
              pagination={{
                pageSize: pageSize + 2,
                total: dualTotal,
              }}
              dualMarketMap={dualMarketMap}
              showloading={showDualLoading}
              tokenMap={tokenMap}
              idIndex={idIndex}
              {...{
                ...rest,
              }}
            />
          ) : currentTab === RecordTabIndex.Orders ? (
            <Box flex={1} display={'flex'} flexDirection={'column'} marginTop={-2}>
              <Box marginBottom={2} marginLeft={3}>
                <Tabs
                  value={currentOrderTab}
                  onChange={(_event, value) => {
                    setCurrentOrderTab(value)
                    history.replace(
                      `/l2assets/history/${RecordTabIndex.Orders}/${value}?${search.replace(
                        '?',
                        '',
                      )}`,
                    )
                  }}
                  aria-label='l2-history-tabs'
                  variant='scrollable'
                >
                  <Tab label={t('labelOrderTableOpenOrder')} value={TabOrderIndex.orderOpenTable} />
                  <Tab
                    label={t('labelOrderTableOrderHistory')}
                    value={TabOrderIndex.orderHistoryTable}
                  />
                </Tabs>
              </Box>

              <OrderHistoryTable
                {...{
                  pagination:
                    currentOrderTab === TabOrderIndex.orderOpenTable
                      ? undefined
                      : {
                          pageSize: pageSize - 1,
                          total: totalNum,
                        },
                  rawData,
                  showFilter: true,
                  getOrderList,
                  marketArray: orderRaw,
                  showDetailLoading: false,
                  userOrderDetailList,
                  getUserOrderDetailTradeList,
                  ...rest,
                  showLoading,
                  isOpenOrder: currentOrderTab === TabOrderIndex.orderOpenTable,
                  cancelOrder,
                }}
              />
            </Box>
          ) : currentTab === RecordTabIndex.StopLimitRecords ? (
            <Box flex={1} display={'flex'} flexDirection={'column'} marginTop={-2}>
              <>
                <Box marginBottom={2} marginLeft={3}>
                  <Tabs
                    value={currentOrderTab}
                    onChange={(_event, value) => {
                      setCurrentOrderTab(value)
                      history.replace(
                        `/l2assets/history/${
                          RecordTabIndex.StopLimitRecords
                        }/${value}?${search.replace('?', '')}`,
                      )
                    }}
                    aria-label='l2-history-tabs'
                    variant='scrollable'
                  >
                    <Tab
                      label={t('labelOrderTableOpenOrder')}
                      value={TabOrderIndex.orderOpenTable}
                    />
                    <Tab
                      label={t('labelOrderTableOrderHistory')}
                      value={TabOrderIndex.orderHistoryTable}
                    />
                  </Tabs>
                </Box>

                <OrderHistoryTable
                  {...{
                    pagination:
                      currentOrderTab === TabOrderIndex.orderOpenTable
                        ? undefined
                        : {
                            pageSize: pageSize - 1,
                            total: totalNumStopLimit,
                          },
                    isStopLimit: true,
                    rawData: stopLimitRawData,
                    showFilter: true,
                    getOrderList: getStopLimitOrderList,
                    marketArray: orderRaw,
                    showDetailLoading: false,
                    userOrderDetailList,
                    getUserOrderDetailTradeList,
                    ...rest,
                    showLoading: showLoadingStopLimit,
                    isOpenOrder: currentOrderTab === TabOrderIndex.orderOpenTable,
                    cancelOrder: cancelOrderStopLimit,
                  }}
                />
              </>
            </Box>
          ) : currentTab === RecordTabIndex.BtradeSwapRecords ? (
            <Box flex={1} display={'flex'} flexDirection={'column'} marginTop={-2}>
              <BtradeSwapTable
                {...{
                  showloading: showBtradeLoading,
                  getBtradeOrderList,
                  rawData: btradeOrderData,
                }}
                pagination={{
                  pageSize: pageSize,
                  total: btradeTotalNum,
                }}
                onItemClick={onDetail}
              />
            </Box>
          ) : currentTab === RecordTabIndex.leverageETHRecords ? (
            <DefiTxsTable
              key={'leverage'}
              {...{
                rawData: leverageETHList,
                pagination: {
                  pageSize: pageSize,
                  total: leverageETHTotal,
                },
                getDefiTxList: getLeverageETHTxList,
                showloading: showLeverageETHLoading,
                ...rest,
              }}
              tokenMap={tokenMap}
              idIndex={idIndex}
            />
          ) : (
            <></>
          )}
        </Box>
      </StylePaper>
    </Box>
  )
})

export default HistoryPanel
