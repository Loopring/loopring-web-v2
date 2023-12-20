import { Box, Button, Grid, Modal, Tab, Typography } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
  ButtonStyle,
  CancelDualAlert,
  DualAssetTable,
  DualDetail,
  EarningsDetail,
  ModalCloseButton,
  SwitchPanelStyled,
  Toast,
  ToastType,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CurrencyToTag,
  DualViewBase,
  EmptyValueTag,
  FailedIcon,
  getValuePrecisionThousand,
  INVEST_TABS,
  InvestAssetRouter,
  // InvestTab,
  // investTabs,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  PriceTag,
  SagaStatus,
  TOAST_TIME,
  TokenType,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { AmmPoolActivityRule, LoopringMap } from '@loopring-web/loopring-sdk'
import { useOverview } from './hook'
import {
  confirmation,
  TableWrapStyled,
  useAccount,
  useAmmActivityMap,
  useDefiMap,
  useDualMap,
  useSystem,
  useTokenMap,
  useTokenPrices,
  useUserRewards,
} from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { useGetAssets } from '../../AssetPage/AssetPanel/hook'
import { useDualAsset } from '../../AssetPage/HistoryPanel/useDualAsset'
import React from 'react'
import { containerColors, MaxWidthContainer } from '..'
import _ from 'lodash'
import { RowEarnConfig } from '../../../constant/setting'

const MyLiquidity: any = withTranslation('common')(
  ({
    t,
    isHideTotal,
    hideAssets,
    className,
    noHeader,
    /* ammActivityMap, */ ...rest
  }: WithTranslation & {
    isHideTotal?: boolean
    className?: string
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined
    hideAssets?: boolean
    noHeader?: boolean
  }) => {
    let match: any = useRouteMatch('/invest/balance/:type')

    const { search } = useLocation()
    const searchParams = new URLSearchParams(search)
    const { totalClaims, getUserRewards, errorMessage: rewardsAPIError } = useUserRewards()

    const ammPoolRef = React.useRef(null)
    const stakingRef = React.useRef(null)
    const leverageETHRef = React.useRef(null)
    const dualRef = React.useRef(null)
    const sideStakeRef = React.useRef(null)
    const { ammActivityMap } = useAmmActivityMap()
    const { forexMap } = useSystem()
    const { tokenMap, idIndex } = useTokenMap()
    const { tokenPrices } = useTokenPrices()
    const { marketMap: dualMarketMap, status: dualMarketMapStatus } = useDualMap()
    const { assetsRawData, onSend, onReceive, allowTrade, getTokenRelatedMarketArray } =
      useGetAssets()
    const { account } = useAccount()
    const history = useHistory()
    const { currency, hideSmallBalances, defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const { setShowAutoDefault } = confirmation.useConfirmation()
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

      getStakingList,
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
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        dualMarketMapStatus === SagaStatus.UNSET
      ) {
        getDualTxList({})
      }
    }, [account.readyState, dualMarketMapStatus])

    const theme = useTheme()
    const { isMobile } = useSettings()
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

    const [tab, setTab] = React.useState(match?.params?.type ?? InvestAssetRouter.DUAL)
    React.useEffect(() => {
      setTab(
        InvestAssetRouter[
          // @ts-ignore
          match?.params?.type?.toUpperCase() ?? InvestAssetRouter.DUAL
        ] ?? InvestAssetRouter.DUAL,
      )
      if (searchParams?.get('refreshStake')) {
        getStakingList({})
      }
    }, [match?.params?.type, searchParams?.get('refreshStake')])

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
            >
              <Box paddingY={7}>
                <Typography marginBottom={5} fontSize={'38px'} variant={'h1'}>
                  {t('labelInvestBalanceTitle')}
                </Typography>
                <Button
                  onClick={() => {
                    history.push('/invest/overview')
                  }}
                  sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit, marginRight: 2 }}
                  variant={'contained'}
                >
                  {t('labelInvestOverviewTitle')}
                </Button>
                <Button
                  onClick={() => {
                    history.push('/l2assets/history/Transactions')
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
          minHeight={'80vh'}
          background={containerColors[1]}
          containerProps={{
            borderRadius: noHeader ? `${theme.unit}px` : 0,
            marginTop: 0,
          }}
        >
          {
            <>
              {
                <TableWrapStyled
                  ref={dualRef}
                  className={`min-height`}
                  marginBottom={2}
                  paddingTop={1}
                  paddingX={0}
                  flex={1}
                  marginLeft={-3}
                >
                  <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1} margin={0}>
                    {/* {dualStakeDollar !== undefined ? (
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
                    )} */}
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
                      cancelReInvest={_cancelReInvest as any}
                      getProduct={getProduct}
                      rowConfig={RowEarnConfig}
                    />
                    <Modal
                      open={dualOpen}
                      onClose={(_e: any) => setDualOpen(false)}
                      aria-labelledby='modal-modal-title'
                      aria-describedby='modal-modal-description'
                    >
                      <SwitchPanelStyled width={'var(--modal-width)'}>
                        <ModalCloseButton onClose={(_e: any) => setDualOpen(false)} t={t} />
                        {dualDetail && dualDetail.dualViewInfo && (
                          <Box
                            flex={1}
                            paddingY={2}
                            width={'100%'}
                            display={'flex'}
                            flexDirection={'column'}
                          >
                            <DualDetail
                              setShowAutoDefault={setShowAutoDefault}
                              isOrder={true}
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
                                  onEditDualClick({ dontCloseModal: true })
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
              }
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

export default MyLiquidity
