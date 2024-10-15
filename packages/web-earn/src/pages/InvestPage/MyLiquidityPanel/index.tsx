import { Box, Button, Grid, Modal, Tab, Typography } from '@mui/material'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
  ButtonStyle,
  CancelDualAlert,
  DefiStakingTable,
  DualAssetTable,
  DualDetail,
  EarningsDetail,
  EmptyDefault,
  ModalCloseButton,
  SwitchPanelStyled,
  Toast,
  ToastType,
  VaultAssetsTable,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CurrencyToTag,
  DualViewBase,
  EmptyValueTag,
  FailedIcon,
  getValuePrecisionThousand,
  HiddenTag,
  INVEST_TABS,
  InvestAssetRouter,
  // InvestTab,
  // investTabs,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  PriceTag,
  SagaStatus,
  SoursURL,
  STAKING_INVEST_LIMIT,
  TOAST_TIME,
  TokenType,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { AmmPoolActivityRule, LoopringMap } from '@loopring-web/loopring-sdk'
import { useOverview } from './hook'
import {
  confirmation,
  fiatNumberDisplay,
  numberFormatShowInPercent,
  numberFormatThousandthPlace,
  TableWrapStyled,
  useAccount,
  useAccountInfo,
  useAmmActivityMap,
  useDefiMap,
  useDualMap,
  useStakeRedeemClick,
  useSystem,
  useTokenMap,
  useTokenPrices,
  useUserRewards,
  useVaultMap,
  useVaultTicker,
} from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { useGetAssets } from '../../AssetPage/AssetPanel/hook'
import { useDualAsset } from '../../AssetPage/HistoryPanel/useDualAsset'
import React from 'react'
import { containerColors, MaxWidthContainer } from '..'
import _ from 'lodash'
import { RowEarnConfig } from '../../../constant/setting'
import { useGetVaultAssets } from 'pages/VaultPage/DashBoardPanel/hook'
import { useVaultMarket } from 'pages/VaultPage/HomePanel/hook'
import Decimal from 'decimal.js'
import { TaikoFarmingPortfolioTable } from '@loopring-web/component-lib/src/components/tableList/taikoFarmingTable'
import { utils } from 'ethers'
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
    const { forexMap, getValueInCurrency } = useSystem()
    const { tokenMap, idIndex } = useTokenMap()

    const { tokenPrices } = useTokenPrices()
    const { redeemItemClick } = useStakeRedeemClick()
    const { marketMap: dualMarketMap, status: dualMarketMapStatus } = useDualMap()
    const { assetsRawData, onSend, onReceive, allowTrade, getTokenRelatedMarketArray } =
      useGetAssets()
    const { account } = useAccount()
    const history = useHistory()
    const { currency, hideSmallBalances, defaultNetwork, coinJson } = useSettings()
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
      totalStakedRewards,
      stakingList,
      stakeShowLoading,
      stakingTotal,
      totalStaked,
    } = useOverview({
      ammActivityMap,
      dualOnInvestAsset,
      hideSmallBalances,
      // dualList,
    })
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
    const vaultAccountInfo = useAccountInfo()
    const {
      onActionBtnClick,
      dialogBtn,
      showNoVaultAccount,
      setShowNoVaultAccount,
      whichBtn,
      btnProps,
      onBtnClose,
      positionOpend,
      onClcikOpenPosition,
      totalAsset: totalAssetVault,
      ...assetPanelProps
    } = useGetVaultAssets({ vaultAccountInfo: vaultAccountInfo })
    const { tokenMap: vaultTokenMap } = useVaultMap()
    const priceTag = PriceTag[CurrencyToTag[currency]]
    const { vaultTickerMap } = useVaultTicker()
    const showTaikoFarming = new Decimal(totalStaked).greaterThan('0') ? true : false
    const taikoFarmingTotalStakedRaw = utils.formatUnits(
      totalStaked,
      tokenMap[stakedSymbol].decimals,
    )
    const taikoFarmingTotalStaked = numberFormatThousandthPlace(taikoFarmingTotalStakedRaw, {
      fixed: tokenMap[stakedSymbol].precision,
    })
    const taikoFarmingTotalStakedDollarRaw = 
      getValueInCurrency(
        new Decimal(taikoFarmingTotalStakedRaw).times(tokenPrices[stakedSymbol] ?? 0).toString(),
      )
    const taikoFarmingTotalStakedDollar = fiatNumberDisplay(
      taikoFarmingTotalStakedDollarRaw,
      currency,
    )
    const taikoFarmingInfo = new Decimal(taikoFarmingTotalStakedRaw).greaterThan('0')
      ? {
          amount: taikoFarmingTotalStaked,
          value: taikoFarmingTotalStakedDollar,
        }
      : undefined
    const defiTotalInUSD = sdk
      .toBig(dualStakeDollar ?? 0)
      .plus(totalAssetVault ?? 0)
      .plus(taikoFarmingTotalStakedDollarRaw ?? 0)
      .toString()
    // @ts-ignore
    const { marketProps } = useVaultMarket({ tableRef: undefined })
    const showDual = dualList.length > 0
    const showPortal = assetPanelProps.rawData.find((ele) => {
      try {
        return new Decimal(ele.amount).greaterThan('0')
      } catch {
        return false
      }
    })
      ? true
      : false
    

    const showEmptyHint =
      !assetPanelProps.isLoading && !showDual && !showPortal && !dualLoading && !showTaikoFarming

    return (
      <Box display={'flex'} flex={1} position={'relative'} flexDirection={'column'}>
        <MaxWidthContainer
          marginBottom={3}
          minHeight={'80vh'}
          background={containerColors[1]}
          containerProps={{
            borderRadius: noHeader ? `${theme.unit}px` : 0,
            marginTop: 0,
          }}
        >
          <Typography marginY={3.5} color={'var(--color-text-third)'}>
            {t('labelTotalBalance')}:{' '}
            {hideAssets
              ? HiddenTag
              : nanToEmptyTag(
                  sdk
                    .toBig(defiTotalInUSD)
                    .times(forexMap[currency] ?? 0)
                    .toFixed(2, 1),
                  PriceTag[CurrencyToTag[currency]],
                )}
          </Typography>
          {showDual && (
            <Box
              sx={{
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                padding: 4.5,
              }}
            >
              <Box display={'flex'}>
                {/* <Box
                  component={'img'}
                  marginRight={1}
                  width={40}
                  height={40}
                  src={SoursURL + 'images/icon-dual.svg'}
                /> */}
                <Box>
                  <Typography variant='h4'>{t('labelInvestDualTitle')}</Typography>
                  <Typography color={'var(--color-text-third)'}>
                    {t('labelBalance')}:{' '}
                    {hideAssets
                      ? HiddenTag
                      : dualStakeDollar && !Number.isNaN(dualStakeDollar)
                      ? nanToEmptyTag(
                          sdk
                            .toBig(dualStakeDollar?.replaceAll(sdk.SEP))
                            .times(forexMap[currency] ?? 0)
                            .toFixed(2, 1),
                          PriceTag[CurrencyToTag[currency]],
                        )
                      : EmptyValueTag}
                  </Typography>
                </Box>
              </Box>
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
                    noMinHeight
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
                                    editDualBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
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
            </Box>
          )}
          {showPortal && (
            <Box
              sx={{
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                padding: 4.5,
                marginTop: 4,
              }}
            >
              <Box marginBottom={2} display={'flex'}>
                {/* <Box
                  component={'img'}
                  marginRight={1}
                  width={40}
                  height={40}
                  src={SoursURL + 'images/icon-dual.svg'}
                /> */}
                <Box>
                  <Typography variant='h4'>Portal</Typography>
                  <Typography color={'var(--color-text-third)'}>
                    Balance:{' '}
                    {totalAssetVault && !sdk.toBig(totalAssetVault ?? 0).eq('0')
                      ? `${nanToEmptyTag(
                          getValuePrecisionThousand(
                            sdk.toBig(totalAssetVault ?? 0).times(forexMap[currency] ?? 0),
                            2,
                            2,
                            2,
                            true,
                            { floor: true },
                          ),
                          priceTag,
                        )}`
                      : EmptyValueTag}{' '}
                  </Typography>
                </Box>
              </Box>
              <Box marginLeft={-2.5}>
                <VaultAssetsTable
                  {...assetPanelProps}
                  onRowClick={(index, row) => {
                    // @ts-ignore
                    marketProps.onRowClick(index, {
                      // @ts-ignore
                      ...vaultTokenMap[row.name],
                      // @ts-ignore
                      cmcTokenId: vaultTickerMap[row.erc20Symbol].tokenId,
                      ...vaultTickerMap[row.erc20Symbol],
                    })
                  }}
                  showFilter
                  hideActions
                  noMinHeight
                />
              </Box>
            </Box>
          )}
          {showTaikoFarming && (
            <Box
              sx={{
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                padding: 4.5,
                marginTop: 4,
              }}
            >
              <Box>
                <Typography variant={'h4'}>{t('labelInvestType_TAIKOFarming')}</Typography>
                <Typography color={'var(--color-text-third)'}>
                  Balance:{' '}
                  {hideAssets
                    ? HiddenTag
                    : taikoFarmingInfo
                    ? taikoFarmingInfo.value
                    : EmptyValueTag}
                </Typography>
              </Box>
              <Box ml={-3}>
                <TaikoFarmingPortfolioTable
                  rawData={
                    taikoFarmingInfo
                      ? [
                          {
                            tokenSymbol: stakedSymbol,
                            amount: taikoFarmingInfo.amount,
                            value: taikoFarmingInfo.value,
                            coinJSON: coinJson[stakedSymbol],
                          },
                        ]
                      : []
                  }
                  idIndex={idIndex}
                  tokenMap={tokenMap}
                  getStakingList={getStakingList}
                  isLoading={stakeShowLoading}
                  hideAssets={hideAssets}
                  noMinHeight
                  {...rest}
                />
              </Box>
            </Box>
          )}
          {showEmptyHint && (
            <Box
              flex={1}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
            >
              <EmptyDefault
                height={'calc(100% - 35px)'}
                marginTop={10}
                display={'flex'}
                flexWrap={'nowrap'}
                alignItems={'center'}
                justifyContent={'center'}
                flexDirection={'column'}
                message={() => {
                  return <Trans i18nKey='labelEmptyDefault'>Content is Empty</Trans>
                }}
              />
            </Box>
          )}
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
