import styled from '@emotion/styled'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Modal,
  Typography,
} from '@mui/material'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
  AmmPanelType,
  AssetsTable,
  DefiStakingTable,
  DetailRewardPanel,
  DualAssetTable,
  DualDetail,
  EarningsDetail,
  EmptyDefault,
  ModalCloseButton,
  MyPoolTable,
  SwitchPanelStyled,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AssetTabIndex,
  CheckBoxIcon,
  CheckedIcon,
  CLAIM_TYPE,
  CurrencyToTag,
  DualViewBase,
  EmptyValueTag,
  FailedIcon,
  getValuePrecisionThousand,
  HiddenTag,
  myLog,
  PriceTag,
  RecordTabIndex,
  RowInvestConfig,
  STAKING_INVEST_LIMIT,
  TokenType,
  TRADE_TYPE,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { AmmPoolActivityRule, LoopringMap } from '@loopring-web/loopring-sdk'
import { useOverview } from './hook'
import {
  TableWrapStyled,
  useAccount,
  useAmmActivityMap,
  useDualMap,
  useModalData,
  useDefiMap,
  useUserRewards,
  useStakeRedeemClick,
  useSystem,
  useTokenMap,
  useTokenPrices,
  volumeToCount,
} from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { useGetAssets } from '../../AssetPage/AssetPanel/hook'
import { useDualAsset } from '../../AssetPage/HistoryPanel/useDualAsset'
import React from 'react'

const StyleWrapper = styled(Grid)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Grid

const MyLiquidity: any = withTranslation('common')(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
    isHideTotal,
    hideAssets,
    className,
    /* ammActivityMap, */ ...rest
  }: WithTranslation & {
    isHideTotal?: boolean
    className?: string
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined
    hideAssets?: boolean
  }) => {
    let match: any = useRouteMatch('/invest/balance/:type')
    const { search } = useLocation()
    const searchParams = new URLSearchParams(search)
    const { totalClaims } = useUserRewards()

    const ammPoolRef = React.useRef(null)
    const stakingRef = React.useRef(null)
    const leverageETHRef = React.useRef(null)
    const dualRef = React.useRef(null)
    const sideStakeRef = React.useRef(null)

    const { updateClaimData } = useModalData()
    const { setShowClaimWithdraw } = useOpenModals()

    const { ammActivityMap } = useAmmActivityMap()
    const { forexMap } = useSystem()
    const { tokenMap, disableWithdrawList, idIndex } = useTokenMap()
    const { tokenPrices } = useTokenPrices()
    const { redeemItemClick } = useStakeRedeemClick()
    const { marketMap: dualMarketMap } = useDualMap()
    const { assetsRawData, onSend, onReceive, allowTrade, getTokenRelatedMarketArray } =
      useGetAssets()
    const { account } = useAccount()
    const history = useHistory()
    const { currency, hideSmallBalances, setHideSmallBalances } = useSettings()
    const { setShowAmm } = useOpenModals()
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
      totalClaimableRewards,
      stakedSymbol,
    } = useOverview({
      ammActivityMap,
      dualOnInvestAsset,
      hideSmallBalances,
      // dualList,
    })
    const { marketLeverageCoins: marketCoins, marketCoins: ethStakingCoins } = useDefiMap()

    myLog('summaryMyInvest', summaryMyInvest, forexMap[currency])

    React.useEffect(() => {
      if (match?.params?.type) {
        switch (match?.params?.type) {
          case 'dual':
            // @ts-ignore
            window.scrollTo(0, dualRef?.current?.offsetTop)
            break
          case 'stake':
            // @ts-ignore
            window.scrollTo(0, stakingRef?.current?.offsetTop)

            break
          case 'amm':
            // @ts-ignore
            window.scrollTo(0, ammPoolRef?.current?.offsetTop)
            break
          case 'sideStake':
            // @ts-ignore
            window.scrollTo(0, sideStakeRef?.current?.offsetTop)
        }
      }
      if (searchParams?.get('refreshStake')) {
        getStakingList({})
      }
    }, [match?.params?.type, searchParams?.get('refreshStake')])

    React.useEffect(() => {
      if (account.accountId) {
        getDualTxList({})
      }
    }, [account.accountId])

    const theme = useTheme()
    const { isMobile } = useSettings()
    const fontSize: any = isMobile
      ? {
          title: 'body1',
          count: 'h5',
          title2: 'body1',
          count2: 'h5',
        }
      : {
          title: 'body1',
          count: 'h1',
          title2: 'body1',
          count2: 'h5',
        }
    const lidoAssets = assetsRawData.filter((o) => {
      return (
        ethStakingCoins?.includes(o.name) &&
        o.token.type !== TokenType.lp &&
        (hideSmallBalances ? !o.smallBalance : true)
      )
    })
    const leverageETHAssets = assetsRawData.filter((o) => {
      return (
        marketCoins && marketCoins.includes(o.name) && (hideSmallBalances ? !o.smallBalance : true)
      )
    })
    const totalClaimableRewardsAmount =
      totalClaimableRewards && totalClaimableRewards !== '0'
        ? getValuePrecisionThousand(
            sdk.toBig(totalClaimableRewards ?? 0).div('1e' + tokenMap[stakedSymbol].decimals),
            tokenMap[stakedSymbol].precision,
            tokenMap[stakedSymbol].precision,
            tokenMap[stakedSymbol].precision,
            false,
            { floor: true, isAbbreviate: true },
          )
        : '0'
    const totalAMMClaims: { totalDollar: string; detail: EarningsDetail[] } = Reflect.ownKeys(
      totalClaims ?? {},
    ).reduce(
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
    const dualStakeDollar = dualOnInvestAsset
      ? dualOnInvestAsset.reduce((pre: string, cur: any) => {
          const price = tokenPrices[idIndex[cur.tokenId]]
          return sdk
            .toBig(cur?.amount ?? 0)
            .div('1e' + tokenMap[idIndex[cur.tokenId]].decimals)
            .times(price)
            .plus(pre)
            .toString()
        }, '0')
      : undefined
    const _summaryMyInvest = sdk
      .toBig(dualStakeDollar ?? 0)
      .plus(summaryMyInvest.investDollar ?? 0)
      .toString()
    return (
      <Box
        display={'flex'}
        className={className}
        flex={1}
        position={'relative'}
        flexDirection={'column'}
      >
        <Box
          position={'absolute'}
          display={'flex'}
          alignItems={'center'}
          sx={
            isHideTotal && !isMobile
              ? {
                  right: 2 * theme.unit,
                  top: -42,
                  zIndex: 99,
                }
              : {
                  right: 2 * theme.unit,
                  top: 2 * theme.unit,
                  zIndex: 99,
                }
          }
        >
          <FormControlLabel
            sx={{
              marginRight: 2,
              paddingRight: 0,
              fontSize: isMobile ? theme.fontDefault.body2 : theme.fontDefault.body1,
            }}
            control={
              <Checkbox
                checked={hideSmallBalances}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color='default'
                onChange={(event) => {
                  setHideSmallBalances(event.target.checked)
                }}
              />
            }
            label={t('labelHideSmallBalances', { ns: 'tables' })}
          />
          <Link
            variant={'body1'}
            target='_self'
            rel='noopener noreferrer'
            //?tokenSymbol=${market}
            onClick={() => history.push(`/l2assets/history/${RecordTabIndex.AmmRecords}`)}
            // href={"./#/layer2/history/ammRecords"}
          >
            {t('labelTransactionsLink')}
          </Link>
        </Box>
        <StyleWrapper
          container
          className={'MuiPaper-elevation2'}
          paddingY={3}
          paddingX={4}
          margin={0}
          display={isHideTotal ? 'none' : 'flex'}
        >
          <Grid container spacing={2} alignItems={'flex-end'}>
            <Grid item display={'flex'} flexDirection={'column'} sm={6} md={5}>
              <Typography variant={fontSize.title} color={'textSecondary'}>
                {t('labelTotalPositionValue')}
              </Typography>
              <Typography variant={fontSize.count} marginTop={1}>
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
            </Grid>
            {/*<Grid item marginRight={6}>*/}
            {/*  <Divider orientation={"vertical"} />*/}
            {/*</Grid>*/}
            {/*<Grid item display={"flex"} flexDirection={"column"} sm={3} md={4}>*/}
            {/*  <Typography*/}
            {/*    variant={fontSize.title2}*/}
            {/*    component={"h3"}*/}
            {/*    fontFamily={"Roboto"}*/}
            {/*    color={"textSecondary"}*/}
            {/*  >*/}
            {/*    {t("labelFeeRewards")}*/}
            {/*  </Typography>*/}
            {/*  <Typography*/}
            {/*    variant={fontSize.count2}*/}
            {/*    marginTop={1}*/}
            {/*    fontFamily={"Roboto"}*/}
            {/*  >*/}
            {/*    {summaryMyInvest?.feeU*/}
            {/*      ? PriceTag[CurrencyToTag[currency]] +*/}
            {/*        getValuePrecisionThousand(*/}
            {/*          (summaryMyInvest.feeU || 0) **/}
            {/*            (forexMap[currency] ?? 0),*/}
            {/*          undefined,*/}
            {/*          undefined,*/}
            {/*          2,*/}
            {/*          true,*/}
            {/*          { isFait: true, floor: true }*/}
            {/*        )*/}
            {/*      : EmptyValueTag}*/}
            {/*  </Typography>*/}
            {/*</Grid>*/}
          </Grid>
        </StyleWrapper>
        <Box marginBottom={3} flex={1}>
          {!(myPoolRow?.length > 0) &&
          !(lidoAssets?.length > 0) &&
          !(leverageETHAssets?.length > 0) &&
          !(stakingList?.length > 0) &&
          !(dualList?.length > 0) ? (
            <TableWrapStyled
              flex={1}
              marginTop={isHideTotal ? 1 : 2}
              height={'100%'}
              display={'flex'}
              width={'100%'}
            >
              <EmptyDefault
                sx={{ flex: 1 }}
                message={() => {
                  return (
                    <Trans i18nKey='labelNoInvestContent'>
                      You have no investment assets, invest AMM, ETH Stacking, DUAL earn your
                      rewards
                    </Trans>
                  )
                }}
              />
            </TableWrapStyled>
          ) : (
            <>
              {myPoolRow?.length > 0 && (
                <TableWrapStyled
                  ref={ammPoolRef}
                  className={`table-divide-short MuiPaper-elevation2`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                >
                  <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1}>
                    <MyPoolTable
                      totalAMMClaims={totalAMMClaims}
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
                      allowTrade={allowTrade}
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
              {stakingList?.length > 0 && (
                <TableWrapStyled
                  ref={sideStakeRef}
                  className={`table-divide-short MuiPaper-elevation2 min-height`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
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
                              : PriceTag[CurrencyToTag[currency]] +
                                getValuePrecisionThousand(
                                  sdk
                                    .toBig(summaryMyInvest?.stakeLRCDollar)
                                    .times(forexMap[currency] ?? 0),
                                  undefined,
                                  undefined,
                                  2,
                                  true,
                                  { isFait: true, floor: true },
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
                        {totalClaimableRewardsAmount && totalClaimableRewardsAmount !== '0' ? (
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
                                history.push(`/l2assets/assets/${AssetTabIndex.Rewards}`)
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
              {lidoAssets?.length > 0 && (
                <TableWrapStyled
                  ref={stakingRef}
                  className={`table-divide-short MuiPaper-elevation2 ${
                    lidoAssets?.length > 0 ? 'min-height' : ''
                  }`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
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
                            : PriceTag[CurrencyToTag[currency]] +
                              getValuePrecisionThousand(
                                sdk
                                  .toBig(summaryMyInvest?.stakeETHDollar)
                                  .times(forexMap[currency] ?? 0),
                                undefined,
                                undefined,
                                2,
                                true,
                                { isFait: true, floor: true },
                              )
                          : EmptyValueTag}
                      </Typography>
                    ) : (
                      ''
                    )}
                    <AssetsTable
                      {...{
                        disableWithdrawList,
                        rawData: lidoAssets,
                        showFilter: false,
                        allowTrade,
                        onSend,
                        onReceive,
                        getMarketArrayListCallback: getTokenRelatedMarketArray,
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
              {!!(leverageETHAssets?.length > 0) && (
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
                            : PriceTag[CurrencyToTag[currency]] +
                              getValuePrecisionThousand(
                                sdk
                                  .toBig(summaryMyInvest?.leverageETHDollar)
                                  .times(forexMap[currency] ?? 0),
                                undefined,
                                undefined,
                                2,
                                true,
                                { isFait: true, floor: true },
                              )
                          : EmptyValueTag}
                      </Typography>
                    ) : (
                      ''
                    )}
                    <AssetsTable
                      {...{
                        disableWithdrawList,
                        rawData: leverageETHAssets,
                        showFilter: false,
                        allowTrade,
                        onSend,
                        onReceive,
                        getMarketArrayListCallback: getTokenRelatedMarketArray, // todo change logic
                        rowConfig: RowInvestConfig,
                        forexMap: forexMap as any,
                        isInvest: true,
                        hideAssets,
                        isLeverageETH: true,
                        ...rest,
                      }}
                    />
                  </Grid>
                </TableWrapStyled>
              )}
              {dualList?.length > 0 && (
                <TableWrapStyled
                  ref={dualRef}
                  className={`table-divide-short MuiPaper-elevation2 min-height`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                >
                  <Grid item xs={12}>
                    <Typography variant={'h5'} marginBottom={1} marginX={3}>
                      {t('labelInvestType_DUAL')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1} margin={0}>
                    {dualStakeDollar !== undefined ? (
                      <Typography component={'h4'} variant={'h3'} marginX={3}>
                        {dualStakeDollar
                          ? hideAssets
                            ? HiddenTag
                            : PriceTag[CurrencyToTag[currency]] +
                              sdk
                                .toBig(dualStakeDollar)
                                .times(forexMap[currency] ?? 0)
                                .toFixed(2, 1)
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
                      refresh={refresh}
                      hideAssets={hideAssets}
                    />
                    <Modal
                      open={dualOpen}
                      onClose={(_e: any) => setDualOpen(false)}
                      aria-labelledby='modal-modal-title'
                      aria-describedby='modal-modal-description'
                    >
                      <SwitchPanelStyled width={'var(--modal-width)'}>
                        <ModalCloseButton onClose={(_e: any) => setDualOpen(false)} t={t} />
                        {dualDetail && (
                          <Box
                            flex={1}
                            paddingY={2}
                            width={'100%'}
                            display={'flex'}
                            flexDirection={'column'}
                          >
                            <Typography
                              variant={isMobile ? 'h5' : 'h4'}
                              marginTop={-4}
                              textAlign={'center'}
                              paddingBottom={2}
                            >
                              {t('labelDuaInvestmentDetails', { ns: 'common' })}
                            </Typography>
                            <DualDetail
                              isOrder={true}
                              dualViewInfo={dualDetail.dualViewInfo as DualViewBase}
                              currentPrice={dualDetail.dualViewInfo.currentPrice}
                              tokenMap={tokenMap}
                              lessEarnTokenSymbol={dualDetail.lessEarnTokenSymbol}
                              greaterEarnTokenSymbol={dualDetail.greaterEarnTokenSymbol}
                              lessEarnView={dualDetail.lessEarnView}
                              greaterEarnView={dualDetail.greaterEarnView}
                            />
                          </Box>
                        )}
                      </SwitchPanelStyled>
                    </Modal>
                  </Grid>
                </TableWrapStyled>
              )}
            </>
          )}
        </Box>
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
      </Box>
    )
  },
)

export default MyLiquidity
