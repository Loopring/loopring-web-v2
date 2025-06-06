import { Box, Button, Divider, Grid, Modal, Tab, Typography } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
  AssetsTable,
  ButtonStyle,
  CancelDualAlert,
  DefiStakingTable,
  DualAssetTable,
  DualDetail,
  EarningsDetail,
  ModalCloseButton,
  MyPoolTable,
  SwitchPanelStyled,
  Toast,
  ToastType,
  useOpenModals,
  useSettings,
  Tabs,
  CoinIcons,
  MaxWidthContainer,
  AssetsDefiTable,
  useToggle,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  AssetTabIndex,
  CurrencyToTag,
  DualViewBase,
  EmptyValueTag,
  FailedIcon,
  getValuePrecisionThousand,
  HiddenTag,
  INVEST_TABS,
  InvestAssetRouter,
  AmmPanelType,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  PriceTag,
  RowInvestConfig,
  SagaStatus,
  STAKING_INVEST_LIMIT,
  TOAST_TIME,
  TokenType,
  TradeBtnStatus,
  RouterPath,
  RecordTabIndex,
  InvestRouter,
  InvestType,
  RowConfig,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { useOverview } from './hook'
import {
  TableWrapStyled,
  useAccount,
  useAmmActivityMap,
  useDefiMap,
  useDualMap,
  useStakeRedeemClick,
  useSystem,
  useTokenMap,
  useTokenPrices,
  useUserRewards,
  confirmation,
} from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import React from 'react'
import { containerColors } from '..'
import _ from 'lodash'
import { useDualAsset } from '../../AssetPage/HistoryPanel'

const MyLiquidity: any = withTranslation('common')(
  ({
    t,
    isHideTotal,
    hideAssets,
    className,
    noHeader,
    path = `${RouterPath.invest}/${InvestRouter[InvestType.MyBalance]}`,
    /* ammActivityMap, */ ...rest
  }: WithTranslation & {
    isHideTotal?: boolean
    className?: string
    ammActivityMap: sdk.LoopringMap<sdk.LoopringMap<sdk.AmmPoolActivityRule[]>> | undefined
    hideAssets?: boolean
    noHeader?: boolean
    path?: string
  }) => {
    let match: any = useRouteMatch(path + '/:type')
    const { toggle } = useToggle()
    const { search } = useLocation()
    const searchParams = new URLSearchParams(search)
    const { totalClaims, getUserRewards, errorMessage: rewardsAPIError } = useUserRewards()
    const { setShowAutoDefault, confirmation: { showAutoDefault } } = confirmation.useConfirmation()
    const ammPoolRef = React.useRef(null)
    const stakingRef = React.useRef(null)
    const leverageETHRef = React.useRef(null)
    const dualRef = React.useRef(null)
    const sideStakeRef = React.useRef(null)
    const { ammActivityMap } = useAmmActivityMap()
    const { forexMap } = useSystem()
    const { tokenMap, disableWithdrawList, idIndex } = useTokenMap()
    const { tokenPrices } = useTokenPrices()
    const { redeemItemClick } = useStakeRedeemClick()
    const { marketMap: dualMarketMap, status: dualMarketMapStatus } = useDualMap()
    const { account } = useAccount()
    const history = useHistory()
    const { currency, hideSmallBalances, defaultNetwork, coinJson } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const { setShowAmm } = useOpenModals()
    const [showCancelOneAlert, setShowCancelOndAlert] = React.useState<{
      open: boolean
      row?: any
    }>({
      open: false,
      row: undefined,
    })
    const {
      dualList,
      dualOnInvestAsset,
      getDualTxList,
      pagination,
      showDetail,
      showLoading: dualLoading,
      open: dualOpen,
      detail: dualDetail,
      setOpen: setDualOpen,
      getDetail,
      refresh,
      setShowRefreshError,
      showRefreshError,
      refreshErrorInfo,
      dualProducts,
      getProduct,
      cancelReInvest,
      dualToastOpen,
      closeDualToast,
      editDualTrade,
      editDualBtnInfo,
      editDualBtnStatus,
      handleOnchange,
      onEditDualClick,
    } = useDualAsset()
    const {
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
      totalStakedRewards,
      stakedSymbol,
      leverageETHAssets,
      defiAsset,
      onReceive,
      onSend,
    } = useOverview({
      ammActivityMap,
      dualOnInvestAsset,
      hideSmallBalances,
      // dualList,
    })
    const { marketLeverageCoins: marketCoins, marketCoins: ethStakingCoins } = useDefiMap()

    React.useEffect(() => {
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        dualMarketMapStatus === SagaStatus.UNSET
      ) {
        getDualTxList({})
      }
    }, [account.readyState, dualMarketMapStatus])

    const theme = useTheme()
    const { isMobile } = useSettings()
    const totalClaimableRewardsAmount =
      rewardsAPIError || !totalClaims
        ? '0'
        : getValuePrecisionThousand(
            sdk
              .toBig(
                totalClaims['LRC']?.detail?.find(
                  (item: EarningsDetail) => item.claimType === sdk.CLAIM_TYPE.LRC_STAKING,
                )?.amount ?? 0,
              )
              .div('1e' + tokenMap[stakedSymbol].decimals),
            tokenMap[stakedSymbol].precision,
            tokenMap[stakedSymbol].precision,
            tokenMap[stakedSymbol].precision,
            false,
            { floor: true, isAbbreviate: true },
          )

    const totalAMMClaims: { totalDollar: string; detail: EarningsDetail[] } = rewardsAPIError
      ? { totalDollar: '0', detail: [] }
      : Reflect.ownKeys(totalClaims ?? {}).reduce(
          (prev, key) => {
            const item = totalClaims[key]?.detail?.find(
              (item: EarningsDetail) => item.claimType === sdk.CLAIM_TYPE.PROTOCOL_FEE,
            )
            if (item && item.amount !== '0') {
              prev.detail.push({ ...item })
              prev.totalDollar = sdk.toBig(item.tokenValueDollar).plus(prev.totalDollar).toString()
            }
            return prev
          },
          { totalDollar: '0', detail: [] } as { totalDollar: string; detail: EarningsDetail[] },
        )
    const dualStakeDollar = React.useMemo(() => {
      return dualOnInvestAsset
        ? dualOnInvestAsset.reduce((pre: string, cur: any) => {
            const price = tokenPrices[idIndex[cur.tokenId]]
            return sdk
              .toBig(cur?.amount ?? 0)
              .div('1e' + tokenMap[idIndex[cur.tokenId]].decimals)
              .times(price ?? 0)
              .plus(pre)
              .toString()
          }, '0')
        : undefined
    }, [dualOnInvestAsset, tokenPrices])
    const _summaryMyInvest = sdk
      .toBig(dualStakeDollar ?? 0)
      .plus(summaryMyInvest.investDollar ?? 0)
      .toString()
    const visibaleTabs = _.cloneDeep(INVEST_TABS).filter(() => {
      return true
    })
    const [tab, setTab] = React.useState(match?.params?.type ?? InvestAssetRouter.DUAL)
    React.useEffect(() => {
      const tab = match?.params?.type ?? InvestAssetRouter.DUAL
      setTab(tab)
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (tab == InvestAssetRouter.DUAL && dualMarketMapStatus === SagaStatus.UNSET) {
          getDualTxList({})
          if (
            searchParams?.get('show') == 'detail' &&
            match?.params?.type == InvestAssetRouter.DUAL &&
            searchParams?.has('hash')
          ) {
            let hash = searchParams.get('hash')
            refresh(hash ?? '', true)
          }
        }

        if (searchParams?.get('refreshStake')) {
          getStakingList({})
        }
      }
    }, [match?.params?.type, searchParams?.toString(), dualMarketMapStatus, account.readyState])

    const label = React.useMemo(() => {
      if (editDualBtnInfo.label) {
        const key = editDualBtnInfo.label.split('|')
        return t(
          key[0],
          key && key[1]
            ? {
                arg: key[1].toString(),
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }
            : {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              },
        )
      } else {
        return t(`labelDualModifyBtn`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        })
      }
    }, [editDualBtnInfo.label])

    const _cancelReInvest = (item) => {
      setShowCancelOndAlert({ open: true, row: item })
    }
    const nanToEmptyTag = (value: any, prefix: string) => {
      return value === 'NaN' ? EmptyValueTag : prefix + value
    }
    return (
      <Box display={'flex'} flex={1} position={'relative'} flexDirection={'column'}>
        {!noHeader && (
          <MaxWidthContainer
            height={isMobile ? 70 * theme.unit : 34 * theme.unit}
            alignItems={'center'}
            background={containerColors[0]}
          >
            <Box
              display={'flex'}
              justifyContent={'space-between'}
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={isMobile ? 'start' : 'center'}
              alignSelf={'stretch'}
            >
              <Box paddingY={7}>
                <Typography marginBottom={5} fontSize={'38px'} variant={'h1'}>
                  {t('labelInvestBalanceTitle')}
                </Typography>
                <Button
                  onClick={() => {
                    history.push(`${RouterPath.invest}/${InvestRouter[InvestType.Overview]}`)
                  }}
                  sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit, marginRight: 2 }}
                  variant={'contained'}
                >
                  {t('labelInvestOverviewTitle')}
                </Button>
                <Button
                  onClick={() => {
                    let item = RecordTabIndex.Transactions
                    switch (tab) {
                      case InvestAssetRouter.DUAL:
                        item = RecordTabIndex.DualRecords
                        break
                      case InvestAssetRouter.AMM:
                        item = RecordTabIndex.AmmRecords
                        break
                      case InvestAssetRouter.STAKE:
                        item = RecordTabIndex.DefiRecords
                        break
                      case InvestAssetRouter.STAKELRC:
                        item = RecordTabIndex.SideStakingRecords
                        break
                      case InvestAssetRouter.LEVERAGEETH:
                        item = RecordTabIndex.leverageETHRecords
                        break
                      default:
                        break
                    }
                    history.push(`${RouterPath.l2records}/${item}`)
                  }}
                  sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit }}
                  variant={'contained'}
                >
                  {t('labelTxnDetailHeader')}
                </Button>
              </Box>
              <Box
                sx={{ background: 'var(--color-box-secondary)' }}
                width={'var(--earning-banner-width)'}
                border={'1px solid var(--color-border)'}
                borderRadius={0.5}
                paddingX={3}
                paddingY={4}
                display={'flex'}
                justifyContent={'space-between'}
                marginRight={10}
                marginBottom={isMobile ? 7 : 0}
              >
                <Box>
                  <Typography marginBottom={2} color={'var(--color-text-third)'} variant={'h6'}>
                    {t('labelTotalPositionValue')}
                  </Typography>
                  <Typography>
                    {_summaryMyInvest
                      ? PriceTag[CurrencyToTag[currency]] +
                        getValuePrecisionThousand(
                          sdk
                            .toBig(_summaryMyInvest)
                            .times(forexMap[currency] ?? 0)
                            .toString(),
                          undefined,
                          undefined,
                          2,
                          true,
                          { isFait: true, floor: true },
                        )
                      : EmptyValueTag}
                  </Typography>
                </Box>
                <Box>
                  <Typography color={'var(--color-text-third)'} marginBottom={2} variant={'h6'}>
                    {t('labelInvestTotalEarnings')}
                  </Typography>
                  <Typography>
                    {summaryMyInvest.rewardU
                      ? PriceTag[CurrencyToTag[currency]] +
                        getValuePrecisionThousand(
                          summaryMyInvest.rewardU,
                          undefined,
                          undefined,
                          2,
                          true,
                          { isFait: true, floor: true },
                        )
                      : EmptyValueTag}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MaxWidthContainer>
        )}
        <MaxWidthContainer
          marginBottom={3}
          marginTop={3}
          minHeight={'80vh'}
          background={noHeader ? 'var(--color-box-third)' : containerColors[1]}
          containerProps={{
            borderRadius: noHeader ? `${theme.unit}px` : 0,
            marginTop: noHeader ? 1 : 0,
          }}
          // sx={{ flexDirection: 'column' }}
        >
          {
            <>
              <Box width={'100%'} display={'flex'}>
                <Tabs
                  variant='scrollable'
                  className={'btnTab'}
                  value={tab}
                  onChange={(_event: any, newValue: any) => {
                    myLog('newValue', newValue)
                    history.push(`${path}/${newValue}`)
                  }}
                  aria-label='InvestmentsTab'
                >
                  {visibaleTabs.map((tab) => (
                    <Tab value={tab.tab.toString()} label={t(tab.label).toString()} key={tab.tab} />
                  ))}
                </Tabs>
              </Box>

              {tab === InvestAssetRouter.AMM && (
                <TableWrapStyled
                  ref={ammPoolRef}
                  className={`table-divide-short`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                  marginLeft={-3}
                >
                  <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1}>
                    <MyPoolTable
                      totalAMMClaims={totalAMMClaims}
                      rewardsAPIError={rewardsAPIError}
                      getUserRewards={getUserRewards}
                      forexMap={forexMap as any}
                      title={
                        <Typography
                          variant={'h5'}
                          // marginBottom={isMobile ? 3 : 0}
                          // paddingLeft={3}
                        >
                          {t('labelMyAmm')}
                        </Typography>
                      }
                      totalDollar={summaryMyInvest.ammPoolDollar}
                      tableHeight={tableHeight}
                      filter={filter}
                      handleFilterChange={handleFilterChange}
                      hideSmallBalances={hideSmallBalances}
                      allowTrade={toggle}
                      rawData={myPoolRow}
                      showFilter={true}
                      account={account}
                      showloading={showLoading}
                      currency={currency}
                      tokenMap={tokenMap as any}
                      idIndex={idIndex}
                      tokenPrices={tokenPrices as any}
                      handleWithdraw={(row) => {
                        const pair = `${row.ammDetail.coinAInfo.simpleName}-${row.ammDetail.coinBInfo.simpleName}`
                        setShowAmm({
                          isShow: true,
                          type: AmmPanelType.Exit,
                          symbol: pair,
                        })
                      }}
                      handleDeposit={(row) => {
                        const pair = `${row.ammDetail.coinAInfo.simpleName}-${row.ammDetail.coinBInfo.simpleName}`
                        setShowAmm({
                          isShow: true,
                          type: AmmPanelType.Join,
                          symbol: pair,
                        })
                      }}
                      rowConfig={RowInvestConfig}
                      hideAssets={hideAssets}
                    />
                  </Grid>
                </TableWrapStyled>
              )}
              {tab === InvestAssetRouter.STAKELRC && (
                <TableWrapStyled
                  ref={sideStakeRef}
                  className={`table-divide-short min-height`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                  marginLeft={-3}
                >
                  <Grid container>
                    <Grid item md={6} xs={12}>
                      <Typography variant={'h5'} marginBottom={2} marginX={3}>
                        {t('labelInvestType_LRCSTAKE')}
                      </Typography>
                      {summaryMyInvest?.stakeLRCDollar !== undefined ? (
                        <Typography component={'h4'} variant={'h3'} marginX={3}>
                          {summaryMyInvest?.stakeLRCDollar
                            ? hideAssets
                              ? HiddenTag
                              : nanToEmptyTag(
                                  getValuePrecisionThousand(
                                    sdk
                                      .toBig(summaryMyInvest?.stakeLRCDollar)
                                      .times(forexMap[currency] ?? 0),
                                    undefined,
                                    undefined,
                                    2,
                                    true,
                                    { isFait: true, floor: true },
                                  ),
                                  PriceTag[CurrencyToTag[currency]],
                                )
                            : EmptyValueTag}
                        </Typography>
                      ) : (
                        ''
                      )}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      xs={6}
                      justifyContent={'space-evenly'}
                      flexDirection={'column'}
                      alignItems={isMobile ? 'flex-start' : 'flex-end'}
                      display={'flex '}
                    >
                      <Typography variant={'body1'} marginBottom={1} marginX={3} component={'span'}>
                        {t('labelStakingCumulativeEarnings')}
                      </Typography>
                      <Typography variant={'body1'} marginBottom={1} marginX={3} component={'span'}>
                        {totalStakedRewards && totalStakedRewards !== '0'
                          ? hideAssets
                            ? HiddenTag
                            : getValuePrecisionThousand(
                                sdk
                                  .toBig(totalStakedRewards ?? 0)
                                  .div('1e' + tokenMap[stakedSymbol].decimals),
                                tokenMap[stakedSymbol].precision,
                                tokenMap[stakedSymbol].precision,
                                tokenMap[stakedSymbol].precision,
                                false,
                                { floor: true, isAbbreviate: true },
                              ) +
                              ' ' +
                              stakedSymbol
                          : EmptyValueTag}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      md={3}
                      xs={6}
                      justifyContent={'space-evenly'}
                      flexDirection={'column'}
                      alignItems={'flex-end'}
                      display={'flex'}
                    >
                      <Typography variant={'body1'} marginBottom={1} marginX={3} component={'span'}>
                        {t('labelStakingClaimableEarnings')}
                      </Typography>
                      <Box
                        marginBottom={1}
                        marginX={3}
                        display={'flex'}
                        flexDirection={'row'}
                        alignItems={'center'}
                      >
                        {rewardsAPIError ? (
                          <Button
                            onClick={() => {
                              getUserRewards && getUserRewards()
                            }}
                            size={'small'}
                            variant={'outlined'}
                          >
                            {t('labelRewardRefresh', { ns: 'common' })}
                          </Button>
                        ) : totalClaimableRewardsAmount !== '0' ? (
                          <>
                            <Typography component={'span'} display={'inline-flex'} paddingRight={2}>
                              {hideAssets
                                ? HiddenTag
                                : totalClaimableRewardsAmount + ' ' + stakedSymbol}
                            </Typography>
                            <Button
                              variant={'contained'}
                              size={'small'}
                              onClick={() => {
                                history.push(
                                  `${RouterPath.l2assetsDetail}/${AssetTabIndex.Rewards}`,
                                )
                              }}
                            >
                              {t('labelClaimBtn')}
                            </Button>
                          </>
                        ) : (
                          <Typography component={'span'} display={'inline-flex'}>
                            {EmptyValueTag}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <DefiStakingTable
                    {...{
                      rawData: stakingList,
                      pagination: {
                        pageSize: STAKING_INVEST_LIMIT,
                        total: stakingTotal,
                      },
                      idIndex,
                      tokenMap,
                      redeemItemClick,
                      geDefiSideStakingList: getStakingList,
                      showloading: stakeShowLoading,
                      hideAssets,
                      ...rest,
                    }}
                  />
                </TableWrapStyled>
              )}
              {tab === InvestAssetRouter.STAKE && (
                <TableWrapStyled
                  ref={stakingRef}
                  className={`table-divide-short`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                  marginLeft={-3}
                >
                  <Grid item xs={12}>
                    <Typography variant={'h5'} marginBottom={1} marginX={3}>
                      {t('labelInvestType_STAKE')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1} marginX={0}>
                    {summaryMyInvest?.stakeETHDollar !== undefined ? (
                      <Typography component={'h4'} variant={'h3'} marginX={3}>
                        {summaryMyInvest?.stakeETHDollar
                          ? hideAssets
                            ? HiddenTag
                            : nanToEmptyTag(
                                getValuePrecisionThousand(
                                  sdk
                                    .toBig(summaryMyInvest?.stakeETHDollar)
                                    .times(forexMap[currency] ?? 0),
                                  undefined,
                                  undefined,
                                  2,
                                  true,
                                  { isFait: true, floor: true },
                                ),
                                PriceTag[CurrencyToTag[currency]],
                              )
                          : EmptyValueTag}
                      </Typography>
                    ) : (
                      ''
                    )}
                    <AssetsDefiTable
                      {...{
                        disableWithdrawList,
                        onReceive,
                        onSend,
                        rawData: defiAsset,
                        showFilter: false,
                        allowTrade: toggle,
                        rowConfig: RowInvestConfig,
                        forexMap: forexMap as any,
                        isInvest: true,
                        hideAssets,
                        ...rest,
                      }}
                    />
                  </Grid>
                </TableWrapStyled>
              )}
              {tab === InvestAssetRouter.LEVERAGEETH && (
                <TableWrapStyled
                  ref={leverageETHRef}
                  className={`table-divide-short MuiPaper-elevation2 ${
                    leverageETHAssets?.length > 0 ? 'min-height' : ''
                  }`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                >
                  <Grid item xs={12}>
                    <Typography variant={'h5'} marginBottom={1} marginX={3}>
                      {t('labelLeverageETHTitle')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1} marginX={0}>
                    {summaryMyInvest?.leverageETHDollar !== undefined ? (
                      <Typography component={'h4'} variant={'h3'} marginX={3}>
                        {summaryMyInvest?.leverageETHDollar
                          ? hideAssets
                            ? HiddenTag
                            : nanToEmptyTag(
                                getValuePrecisionThousand(
                                  sdk
                                    .toBig(summaryMyInvest?.leverageETHDollar)
                                    .times(forexMap[currency] ?? 0),
                                  undefined,
                                  undefined,
                                  2,
                                  true,
                                  { isFait: true, floor: true },
                                ),
                                PriceTag[CurrencyToTag[currency]],
                              )
                          : EmptyValueTag}
                      </Typography>
                    ) : (
                      ''
                    )}
                    <AssetsDefiTable
                      {...{
                        disableWithdrawList,
                        onReceive,
                        onSend,
                        rawData: leverageETHAssets,
                        showFilter: false,
                        allowTrade: toggle,
                        rowConfig: RowInvestConfig,
                        forexMap: forexMap as any,
                        hideAssets,
                        isLeverageETH: true,
                        ...rest,
                      }}
                    />
                  </Grid>
                </TableWrapStyled>
              )}
              {tab === InvestAssetRouter.DUAL && (
                <TableWrapStyled
                  ref={dualRef}
                  className={`table-divide-short min-height`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                  marginLeft={-3}
                >
                  <Grid item xs={12}>
                    <Typography variant={'h5'} marginBottom={1} marginX={3}>
                      {t('labelInvestType_DUAL')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1} margin={0}>
                    {dualStakeDollar !== undefined ? (
                      <Typography component={'h4'} variant={'h3'} marginX={3}>
                        {dualStakeDollar && !Number.isNaN(dualStakeDollar)
                          ? hideAssets
                            ? HiddenTag
                            : nanToEmptyTag(
                                sdk
                                  .toBig(dualStakeDollar?.replaceAll(sdk.SEP))
                                  .times(forexMap[currency] ?? 0)
                                  .toFixed(2, 1),
                                PriceTag[CurrencyToTag[currency]],
                              )
                          : EmptyValueTag}
                      </Typography>
                    ) : (
                      ''
                    )}
                    <DualAssetTable
                      rawData={dualList}
                      getDetail={getDetail}
                      idIndex={idIndex}
                      dualMarketMap={dualMarketMap}
                      tokenMap={tokenMap}
                      showloading={dualLoading}
                      pagination={pagination}
                      getDualAssetList={getDualTxList}
                      showDetail={showDetail}
                      refresh={(item) => refresh(item.__raw__.order.hash)}
                      hideAssets={hideAssets}
                      cancelReInvest={_cancelReInvest as any}
                      getProduct={getProduct}
                      rowConfig={RowConfig}
                    />
                    <Modal
                      open={dualOpen}
                      onClose={(_e: any) => setDualOpen(false)}
                      aria-labelledby='modal-modal-title'
                      aria-describedby='modal-modal-description'
                    >
                      <SwitchPanelStyled width={'var(--modal-width)'}>
                        <ModalCloseButton onClose={(_e: any) => setDualOpen(false)} t={t} />
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
                            <Typography
                              component={'span'}
                              display={'inline-flex'}
                              color={'textPrimary'}
                            >
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
                                : { maxHeight: 'var(--lage-modal-height)', overflowY: 'scroll' }
                            }
                          >
                            <DualDetail
                              setShowAutoDefault={setShowAutoDefault}
                              showAutoDefault={showAutoDefault}
                              isOrder={true}
                              order={dualDetail?.__raw__?.order}
                              btnConfirm={
                                dualDetail.__raw__?.order?.dualReinvestInfo?.isRecursive && (
                                  <ButtonStyle
                                    fullWidth
                                    variant={'contained'}
                                    size={'medium'}
                                    color={'primary'}
                                    onClick={() => {
                                      onEditDualClick()
                                    }}
                                    loading={
                                      editDualBtnStatus === TradeBtnStatus.LOADING
                                        ? 'true'
                                        : 'false'
                                    }
                                    disabled={
                                      editDualBtnStatus === TradeBtnStatus.LOADING ||
                                      editDualBtnStatus === TradeBtnStatus.DISABLED
                                    }
                                  >
                                    {label}
                                  </ButtonStyle>
                                )
                              }
                              showClock={
                                dualDetail?.__raw__?.order?.dualReinvestInfo?.isRecursive &&
                                dualDetail?.__raw__?.order?.settlementStatus?.toUpperCase() ==
                                  sdk.SETTLEMENT_STATUS.PAID &&
                                dualDetail?.__raw__?.order?.dualReinvestInfo?.retryStatus?.toUpperCase() ===
                                  sdk.DUAL_RETRY_STATUS.RETRYING
                              }
                              dualProducts={dualProducts}
                              dualViewInfo={dualDetail.dualViewInfo as DualViewBase}
                              currentPrice={dualDetail.dualViewInfo.currentPrice}
                              isPriceEditable={true}
                              toggle={{ enable: true }}
                              lessEarnTokenSymbol={dualDetail.lessEarnTokenSymbol}
                              greaterEarnTokenSymbol={dualDetail.greaterEarnTokenSymbol}
                              lessEarnView={dualDetail.lessEarnView}
                              greaterEarnView={dualDetail.greaterEarnView}
                              onChange={(item) => {
                                handleOnchange({ tradeData: item })
                              }}
                              onChangeOrderReinvest={(info, item) => {
                                if (info.on) {
                                  handleOnchange({
                                    tradeData: {
                                      ...item,
                                      isRenew: info.on,
                                      renewTargetPrice: info.renewTargetPrice,
                                      renewDuration: info.renewDuration,
                                    } as any,
                                  })
                                  onEditDualClick({ dontCloseModal: false })
                                } else {
                                  handleOnchange({
                                    tradeData: {
                                      ...item,
                                      isRenew: false,
                                    } as any,
                                  })
                                  onEditDualClick({ dontCloseModal: false })
                                }
                              }}
                              coinSell={{
                                ...editDualTrade,
                              }}
                            />
                          </Box>
                        )}
                      </SwitchPanelStyled>
                    </Modal>
                  </Grid>
                </TableWrapStyled>
              )}
            </>
          }
        </MaxWidthContainer>
        <Modal
          open={showRefreshError}
          onClose={(_e: any) => setShowRefreshError(false)}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <SwitchPanelStyled width={'var(--modal-width)'}>
            <ModalCloseButton onClose={(_e: any) => setShowRefreshError(false)} t={t} />
            <Box marginTop={9}>
              <FailedIcon color={'error'} style={{ width: 60, height: 60 }} />
            </Box>

            <Typography marginTop={1} variant={'h5'}>
              {t('labelInvestDualRefreshErrorTitle')}
            </Typography>
            <Typography marginTop={5} marginBottom={22}>
              {t('labelInvestDualRefreshError', {
                token1: refreshErrorInfo[0],
                token2: refreshErrorInfo[1],
              })}
            </Typography>
          </SwitchPanelStyled>
        </Modal>
        <CancelDualAlert
          open={showCancelOneAlert.open}
          row={showCancelOneAlert.row}
          handleCancelOne={async () => await cancelReInvest(showCancelOneAlert.row)}
          handleClose={() => setShowCancelOndAlert({ open: false, row: undefined })}
        />
        <Toast
          alertText={dualToastOpen?.content ?? ''}
          severity={dualToastOpen?.type ?? ToastType.success}
          open={dualToastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            if (closeDualToast) {
              closeDualToast()
            }
          }}
        />
      </Box>
    )
  },
)

export { MyLiquidity }
