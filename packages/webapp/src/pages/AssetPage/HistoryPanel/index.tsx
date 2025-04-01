import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Divider, Modal, Tab, Tabs, Typography } from '@mui/material'
import {
  AmmTable,
  BtradeSwapTable,
  Button,
  CoinIcons,
  DefiStakingTxTable,
  DefiTxsTable,
  DualTxsTable,
  ModalCloseButton,
  OrderHistoryTable,
  SwitchPanelStyled,
  Toast,
  ToastType,
  TradeTable,
  TransactionTable,
  useSettings,
  useToggle,
  DualDes,
  ButtonStyle,
  VaultCloseDetail,
  VaultTxTable,
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
  useVaultTransaction,
} from './hooks'
import {
  BackIcon,
  MapChainId,
  RecordMap,
  RecordTabIndex,
  RowConfig,
  TOAST_TIME,
  TabOrderIndex,
  TokenType,
  DualViewBase,
  RouterPath,
  InvestAssetRouter,
  DualViewType,
} from '@loopring-web/common-resources'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useDualAsset } from './useDualAsset'
import * as sdk from '@loopring-web/loopring-sdk'
import { VaultConvertDetail, VaultOperationDetail, VaultTradeDetail } from '@loopring-web/component-lib/src/components/tableList/vaultTable/VaultTxTable'
import Decimal from 'decimal.js'
export const l2assetsRouter = `${RouterPath.l2records}/:tab/:orderTab?`


const HistoryPanel = withTranslation('common')((rest: WithTranslation<'common'>) => {
  const history = useHistory()
  const { search } = useLocation()
  const { isMobile, defaultNetwork, coinJson } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    toggle: { StopLimit },
  } = useToggle()
  const match: any = useRouteMatch(l2assetsRouter)
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
  const { etherscanBaseUrl } = useSystem()

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
    refreshDualDetail,
    dualDetail,
    openDualDetail,
    onDualClose,
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
  const {
    getVaultOrderList,
    vaultOrderData,
    totalNum: vaultTotal,
    showLoading: showVaultLoaning,
    onItemClick: onVaultDetail,
    vaultOperationDetail,
    openVaultDetail,
    onVaultDetailClose,
  } = useVaultTransaction(setToastOpen)
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
      history.replace(`${RouterPath.l2records}/${value}?${search.replace('?', '')}`)
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
        <Box marginTop={2} display={'flex'} sx={isMobile ? { maxWidth: 'calc(100vw - 32px)' } : {}}>
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
          overflow={'auto'}
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
            <>
              <Modal
                open={openDualDetail}
                onClose={onDualClose}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
              >
                <SwitchPanelStyled width={'var(--modal-width)'}>
                  <ModalCloseButton onClose={onDualClose} t={t} />
                  <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'flex-start'}
                    alignSelf={'stretch'}
                    marginTop={-4}
                    justifyContent={'stretch'}
                  >
                    <Typography
                      display={'flex'}
                      flexDirection={'row'}
                      component={'header'}
                      alignItems={'center'}
                      height={'var(--toolbar-row-height)'}
                      paddingX={3}
                    >
                      <Typography component={'span'} display={'inline-flex'}>
                        {/* eslint-disable-next-line react/jsx-no-undef */}
                        <CoinIcons
                          type={TokenType.dual}
                          size={32}
                          tokenIcon={[
                            coinJson[dualDetail?.dualViewInfo?.sellSymbol ?? ''],
                            coinJson[dualDetail?.dualViewInfo?.buySymbol ?? ''],
                          ]}
                        />
                      </Typography>
                      <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
                        {`${dualDetail?.dualViewInfo?.sellSymbol} / ${dualDetail?.dualViewInfo?.buySymbol}`}
                      </Typography>
                    </Typography>
                    <Divider style={{ marginTop: '-1px', width: '100%' }} />
                  </Box>

                  {dualDetail && dualDetail.dualViewInfo && (
                    <Box
                      flex={1}
                      paddingY={2}
                      width={'100%'}
                      display={'flex'}
                      flexDirection={'column'}
                      sx={
                        isMobile
                          ? {
                              maxHeight: 'initial',
                              overflowY: 'initial',
                            }
                          : { maxHeight: 'var(--modal-height)', overflowY: 'auto' }
                      }
                    >
                      <DualDes
                        isOrder={true}
                        dualViewInfo={dualDetail.dualViewInfo as DualViewBase}
                        currentPrice={dualDetail.dualViewInfo.currentPrice}
                      />
                      <Box paddingX={2}>
                        <ButtonStyle
                          fullWidth
                          variant={'contained'}
                          size={'medium'}
                          color={'primary'}
                          onClick={() => {
                            history.push(
                              `${RouterPath.invest}/${InvestAssetRouter.DUAL}/${
                                dualDetail?.currentPrice?.base
                              }-${dualDetail?.currentPrice?.quoteUnit}?viewType=${
                                dualDetail.dualViewInfo.dualType === sdk.DUAL_TYPE.DUAL_BASE
                                  ? DualViewType.DualGain
                                  : DualViewType.DualDip
                              }`,
                            )
                          }}
                        >
                          {t('labelQuickInvest')}
                        </ButtonStyle>
                      </Box>
                    </Box>
                  )}
                </SwitchPanelStyled>
              </Modal>
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
            </>
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
          ) : currentTab === RecordTabIndex.VaultRecords ? (
            <>
              <Modal
                open={openVaultDetail}
                onClose={onVaultDetailClose}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
              >
                <SwitchPanelStyled width={'var(--modal-width)'}>
                  <ModalCloseButton onClose={onVaultDetailClose} t={t} />
                  <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'flex-start'}
                    alignSelf={'stretch'}
                    marginTop={-4}
                    justifyContent={'stretch'}
                  >
                    <Typography
                      display={'flex'}
                      flexDirection={'row'}
                      component={'header'}
                      alignItems={'center'}
                      height={'var(--toolbar-row-height)'}
                      paddingX={3}
                    >
                      <Typography component={'span'} display={'inline-flex'}>
                        {vaultOperationDetail &&
                          (vaultOperationDetail.type === 'VAULT_BORROW'
                            ? t('labelBorrowDetail')
                            : vaultOperationDetail.type === 'VAULT_MARGIN_CALL'
                            ? t('labelMarginCallDetail')
                            : vaultOperationDetail.type === 'VAULT_OPEN_POSITION'
                            ? t('labelVaultJoin')
                            : vaultOperationDetail.type === 'VAULT_REPAY'
                            ? t('labelRepayDetail')
                            : vaultOperationDetail.type === 'VAULT_TRADE'
                            ? t('labelTradeDetail')
                            : vaultOperationDetail.type === 'VAULT_CONVERT'
                            ? t('labelDustCollectorDetail')
                            : vaultOperationDetail.type === 'VAULT_JOIN_REDEEM'
                            ? t('labelVaultJoinRedeem')
                            : vaultOperationDetail.type === 'VAULT_CLOSE_SHORT' 
                            ? 'Close Short'
                            : t('labelCloseOutDetail'))
                            }
                      </Typography>
                    </Typography>
                    <Divider style={{ marginTop: '-1px', width: '100%' }} />
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      paddingY: 2,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: isMobile ? 'initial' : '80%',
                      overflowY: isMobile ? 'initial' : 'auto',
                    }}
                  >
                    {vaultOperationDetail &&
                      (vaultOperationDetail.type === 'VAULT_BORROW' ||
                        vaultOperationDetail.type === 'VAULT_MARGIN_CALL' ||
                        vaultOperationDetail.type === 'VAULT_OPEN_POSITION' ||
                        vaultOperationDetail.type === 'VAULT_JOIN_REDEEM' ||
                        vaultOperationDetail.type === 'VAULT_REPAY' ||
                        vaultOperationDetail.type === 'VAULT_CLOSE_SHORT') && (
                        <VaultOperationDetail
                          statusColor={vaultOperationDetail.statusColor}
                          statusLabel={vaultOperationDetail.statusLabel}
                          time={vaultOperationDetail.time}
                          type={vaultOperationDetail.type}
                          statusType={vaultOperationDetail.statusType}
                          amount={vaultOperationDetail.amount ? vaultOperationDetail.amount : ''}
                          amountSymbol={vaultOperationDetail.amountSymbol}
                        />
                      )}
                    {vaultOperationDetail && vaultOperationDetail.type === 'VAULT_CLOSE_OUT' && (
                      <VaultCloseDetail
                        vaultCloseDetail={vaultOperationDetail.vaultCloseDetail}
                      />
                    )}
                    {vaultOperationDetail && vaultOperationDetail.type === 'VAULT_TRADE' && (
                      <VaultTradeDetail
                        statusColor={vaultOperationDetail.statusColor}
                        statusLabel={vaultOperationDetail.statusLabel}
                        fromSymbol={vaultOperationDetail.fromSymbol}
                        toSymbol={vaultOperationDetail.toSymbol}
                        placedAmount={vaultOperationDetail.placedAmount}
                        executedAmount={vaultOperationDetail.executedAmount}
                        executedRate={vaultOperationDetail.executedRate}
                        convertedAmount={vaultOperationDetail.convertedAmount}
                        price={vaultOperationDetail.price}
                        feeSymbol={vaultOperationDetail.feeSymbol}
                        feeAmount={vaultOperationDetail.feeAmount}
                        time={vaultOperationDetail.time}
                        statusType={vaultOperationDetail.statusType}
                      />
                    )}
                    {vaultOperationDetail && vaultOperationDetail.type === 'VAULT_CONVERT' && (
                      <VaultConvertDetail
                        totalValueInCurrency={vaultOperationDetail.totalValueInCurrency}
                        convertedInUSDT={vaultOperationDetail.convertedInUSDT}
                        repaymentInUSDT={vaultOperationDetail.repaymentInUSDT}
                        time={vaultOperationDetail.time}
                        dusts={vaultOperationDetail.dusts}
                        status={vaultOperationDetail.status}
                      />
                    )}
                  </Box>
                </SwitchPanelStyled>
              </Modal>
              <Box flex={1} display={'flex'} flexDirection={'column'} marginTop={-2}>
                <VaultTxTable
                  {...{
                    showloading: showVaultLoaning,
                    getOrderList: getVaultOrderList,
                    rawData: vaultOrderData,
                    onItemClick: onVaultDetail,
                  }}
                  pagination={{
                    pageSize: pageSize,
                    total: vaultTotal,
                  }}
                />
              </Box>
            </>
          ) : (
            <></>
          )}
        </Box>
      </StylePaper>
    </Box>
  )
})

export { HistoryPanel, useDualAsset }
