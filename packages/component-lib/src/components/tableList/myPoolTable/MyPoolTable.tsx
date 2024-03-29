import React from 'react'
import { Box, BoxProps, Grid, Tooltip, Typography } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Button, Popover, PopoverPure, PopoverType, PopoverWrapProps } from '../../basic-lib'
import { Column, Table } from '../../basic-lib/'
import {
  AssetTabIndex,
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  HiddenTag,
  MoreIcon,
  PriceTag,
  RowConfig,
  TokenType,
  RouterPath,
} from '@loopring-web/common-resources'
import { MyPoolRow, MyPoolTableProps } from './Interface'
import styled from '@emotion/styled'
import { TableFilterStyled, TablePaddingX } from '../../styled'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'
import { bindHover } from 'material-ui-popup-state/es'
import { useSettings } from '../../../stores'
import * as sdk from '@loopring-web/loopring-sdk'
import { Filter } from './components/Filter'
import { AmmAPRDetail, AmmPairDetail, AmmRewardsDetail } from '../../block'
import { ActionPopContent, DetailRewardPanel } from './components/ActionPop'
import { CoinIcons } from '../assetsTable'
import { useHistory } from 'react-router-dom'

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 200px 80px auto auto 200px !important;`
        : `--template-columns: 16% 60% auto 8% !important;`}
    height: calc(86px * 5 + var(--header-row-height));

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;
  }

  .textAlignRightSortable {
    display: flex;
    justify-content: flex-end;
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
  .assetWrap & {
    .titleSummary.mobile {
      margin-top: ${({ theme }) => theme.unit * 5}px;
      flex-direction: row;
    }
  }

  .titleSummary.mobile {
    flex-direction: row;
  }
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element

const PoolStyle = styled(Box)`
  &.MuiTypography-body1 {
    font-size: ${({ theme }) => theme.fontDefault.body1};
  }

  .MuiButton-root:not(:first-of-type) {
    margin-left: ${({ theme }) => theme.unit}px;
  }
` as typeof Box

export const MyPoolTable = withTranslation('tables')(
  <R extends MyPoolRow<{ [key: string]: any }>>({
    t,
    i18n,
    tReady,
    allowTrade,
    handleFilterChange,
    filter,
    totalDollar,
    showFilter = true,
    rawData,
    title,
    totalAMMClaims,
    handleWithdraw,
    handleDeposit,
    hideSmallBalances = false,
    setHideSmallBalances,
    currency = CurrencyToTag.USD,
    showloading,
    tableHeight,
    tokenMap,
    forexMap,
    rowConfig = RowConfig,
    hideAssets,
    rewardsAPIError,
    getUserRewards,
  }: MyPoolTableProps<R> & WithTranslation) => {
    const { isMobile, coinJson } = useSettings()
    const history = useHistory()

    const getPopoverState = React.useCallback((label: string) => {
      return usePopupState({
        variant: 'popover',
        popupId: `popup-poolsLiq-${label}`,
      })
    }, [])
    const getPopoverRewardState = React.useCallback((label: string) => {
      return usePopupState({
        variant: 'popover',
        popupId: `popup-poolsReward-${label}`,
      })
    }, [])
    const getPopoverAprState = React.useCallback((label: string) => {
      return usePopupState({
        variant: 'popover',
        popupId: `popup-poolsApr-${label}`,
      })
    }, [])
    const columnMode = (): Column<R, unknown>[] => {
      return [
        {
          key: 'pools',
          sortable: false,
          width: 'auto',
          minWidth: 240,
          name: t('labelPool'),
          formatter: ({ row }) => {
            return (
              <PoolStyle
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                height={'100%'}
              >
                <CoinIcons
                  type={TokenType.lp}
                  tokenIcon={[coinJson[row.ammDetail?.coinA], coinJson[row.ammDetail?.coinB]]}
                />
                <Typography
                  variant={'inherit'}
                  color={'textPrimary'}
                  display={'flex'}
                  flexDirection={'column'}
                  marginLeft={2}
                  component={'span'}
                  paddingRight={1}
                >
                  <Typography component={'span'} className={'next-coin'}>
                    <Typography variant='inherit' component={'span'} className={'next-coin'}>
                      {row.ammDetail?.coinAInfo?.simpleName}
                    </Typography>
                    <Typography variant='inherit' component={'i'}>
                      /
                    </Typography>
                    <Typography variant='inherit' component={'span'} title={'buy'}>
                      {row.ammDetail?.coinBInfo?.simpleName}
                    </Typography>
                  </Typography>
                </Typography>
              </PoolStyle>
            )
          },
        },
        {
          key: 'APR',
          sortable: true,
          name: t('labelAPR'),
          width: 'auto',
          maxWidth: 80,
          headerCellClass: 'textAlignRightSortable',
          formatter: ({ row, rowIdx }) => {
            const APR =
              typeof row?.ammDetail?.APR !== undefined && row?.ammDetail?.APR
                ? row.ammDetail.APR
                : EmptyValueTag
            const popoverState = getPopoverAprState(rowIdx.toString())
            return (
              <Box className={'textAlignRight'}>
                <Typography
                  component={'span'}
                  style={
                    APR === 0 || typeof APR === 'undefined' || APR == EmptyValueTag
                      ? {}
                      : {
                          cursor: 'pointer',
                          textDecoration: 'underline dotted',
                        }
                  }
                  {...bindHover(popoverState)}
                >
                  {APR === 0 || typeof APR === 'undefined' || APR == EmptyValueTag
                    ? EmptyValueTag
                    : getValuePrecisionThousand(APR, 2, 2, 2, true) + '%'}
                </Typography>
                {!(APR === 0 || typeof APR === 'undefined' || APR == EmptyValueTag) && (
                  <PopoverPure
                    className={'arrow-top-center'}
                    {...bindPopper(popoverState)}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                  >
                    <AmmAPRDetail {...row?.ammDetail?.APRs} />
                  </PopoverPure>
                )}
              </Box>
            )
          },
        },
        {
          key: 'liquidity',
          sortable: true,
          width: 'auto',
          headerCellClass: 'textAlignRightSortable',
          name: t('labelMyLiquidity'),
          formatter: ({ row, rowIdx }) => {
            const popState = getPopoverState(rowIdx.toString())
            if (!row || !row.ammDetail) {
              return <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} />
            }
            const {
              // totalAmmValueDollar,
              balanceU,
              balanceA,
              balanceB,
              ammDetail: { coinAInfo, coinBInfo },
            } = row as any
            // const coinAIcon: any = coinJson[coinAInfo.simpleName];
            // const coinBIcon: any = coinJson[coinBInfo.simpleName];
            return (
              <Box
                height={'100%'}
                display={'flex'}
                justifyContent={'flex-end'}
                alignItems={'center'}
              >
                <Box {...bindHover(popState)}>
                  <Typography
                    component={'span'}
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'underline dotted',
                    }}
                  >
                    {typeof balanceU === 'undefined'
                      ? EmptyValueTag
                      : hideAssets
                      ? HiddenTag
                      : PriceTag[CurrencyToTag[currency]] +
                        getValuePrecisionThousand(
                          (balanceU || 0) * (forexMap[currency] ?? 0),
                          undefined,
                          undefined,
                          2,
                          true,
                          { isFait: true, floor: true },
                        )}
                  </Typography>
                </Box>
                <PopoverPure
                  className={'arrow-top-center'}
                  {...bindPopper(popState)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                >
                  <AmmPairDetail
                    coinA={coinAInfo?.simpleName}
                    coinB={coinBInfo?.simpleName}
                    balanceA={balanceA}
                    balanceB={balanceB}
                  />
                </PopoverPure>
              </Box>
            )
          },
        },
        {
          key: 'rewards',
          name: t('label24Rewards'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row, rowIdx }) => {
            const {
              rewardToken,
              rewardToken2,
              reward24,
              reward224,
              extraRewards24,
              ammDetail: { coinAInfo, coinBInfo },
            } = row
            let dollarReward24 = 0
            const popState = getPopoverRewardState(rowIdx.toString())
            if (!(typeof row.rewardU24 === 'undefined' || row.rewardU24 === 0)) {
              dollarReward24 += row.rewardU24
            }
            if (!(typeof row.feeU24 === 'undefined' || row.feeU24 === 0)) {
              dollarReward24 += row.feeU24
            }
            if (!(typeof row.extraU24 === 'undefined' || row.extraU24 === 0)) {
              dollarReward24 += row.extraU24
              // dollarReward24 += row.feeU24;
            }
            return (
              <Box className={'textAlignRight'} height={'100%'}>
                <Typography
                  component={'span'}
                  style={
                    dollarReward24 === 0
                      ? {}
                      : {
                          cursor: 'pointer',
                          textDecoration: 'underline dotted',
                        }
                  }
                  {...bindHover(popState)}
                >
                  {dollarReward24 === 0
                    ? EmptyValueTag
                    : hideAssets
                    ? HiddenTag
                    : PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        (dollarReward24 || 0) * (forexMap[currency] ?? 0),
                        undefined,
                        undefined,
                        2,
                        true,
                        { isFait: true, floor: true },
                      )}
                </Typography>
                <PopoverPure
                  className={'arrow-top-center'}
                  {...bindPopper(popState)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                >
                  {coinAInfo && (
                    <AmmRewardsDetail
                      feeA={row.feeA24}
                      feeB={row.feeB24}
                      coinA={coinAInfo.simpleName}
                      coinB={coinBInfo.simpleName}
                      rewards={
                        [
                          ...(reward24
                            ? [
                                {
                                  tokenSymbol: rewardToken,
                                  amount: reward24,
                                },
                              ]
                            : []),
                          ...(reward224
                            ? [
                                {
                                  tokenSymbol: rewardToken2,
                                  amount: reward224,
                                },
                              ]
                            : []),
                        ] as any[]
                      }
                      extraRewards={extraRewards24}
                      tokenMap={tokenMap}
                    />
                  )}
                </PopoverPure>
              </Box>
            )
          },
        },
        {
          key: 'action',
          name: t('labelActions'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            return (
              <PoolStyle
                display={'flex'}
                flexDirection={'column'}
                alignItems={'flex-end'}
                justifyContent={'center'}
                height={'100%'}
              >
                <Box display={'flex'} marginRight={-1}>
                  {handleDeposit && (
                    <Button
                      variant={'text'}
                      size={'small'}
                      disabled={!allowTrade?.joinAmm?.enable}
                      onClick={() => {
                        handleDeposit(row)
                      }}
                    >
                      {t('labelPoolTableAddLiquidity')}
                    </Button>
                  )}
                  {handleWithdraw && (
                    <Button
                      variant={'text'}
                      size={'small'}
                      onClick={() => {
                        handleWithdraw(row)
                      }}
                    >
                      {t('labelPoolTableRemoveLiquidity')}
                    </Button>
                  )}
                </Box>
              </PoolStyle>
            )
          },
        },
      ]
    }
    const columnModeMobile = (): Column<R, unknown>[] => {
      return [
        {
          key: 'pools',
          sortable: false,
          width: 'auto',
          name: t('labelPool'),
          formatter: ({ row }) => {
            return (
              <PoolStyle
                display={'flex'}
                flexDirection={'column'}
                alignContent={'flex-start'}
                justifyContent={'center'}
                height={'100%'}
              >
                <CoinIcons
                  size={18}
                  type={TokenType.lp}
                  tokenIcon={[coinJson[row.ammDetail?.coinA], coinJson[row.ammDetail?.coinB]]}
                />
                <Typography
                  variant={'body2'}
                  color={'textPrimary'}
                  display={'flex'}
                  flexDirection={'column'}
                  marginLeft={0}
                  component={'span'}
                  paddingRight={1}
                >
                  <Typography component={'span'} className={'next-coin'}>
                    <Typography variant='inherit' component={'span'} className={'next-coin'}>
                      {row.ammDetail?.coinAInfo?.simpleName}
                    </Typography>
                    <Typography variant='inherit' component={'i'}>
                      /
                    </Typography>
                    <Typography variant='inherit' component={'span'} title={'buy'}>
                      {row.ammDetail?.coinBInfo?.simpleName}
                    </Typography>
                  </Typography>
                </Typography>
              </PoolStyle>
            )
          },
        },
        {
          key: 'liquidity',
          sortable: true,
          headerCellClass: 'textAlignRightSortable',
          name: t('labelMyLiquidity'), //+ "/" + t("labelFeeEarned")
          formatter: ({ row }) => {
            if (!row || !row.ammDetail) {
              return <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} />
            }
            const {
              balanceU,
              balanceA,
              balanceB,
              ammDetail: { coinAInfo, coinBInfo },
            } = row as any

            return (
              <Box
                className={'textAlignRight'}
                display={'flex'}
                flexDirection={'column'}
                height={'100%'}
                justifyContent={'center'}
              >
                <Typography component={'span'}>
                  {typeof balanceU === 'undefined'
                    ? EmptyValueTag
                    : hideAssets
                    ? HiddenTag
                    : PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        (balanceU || 0) * (forexMap[currency] ?? 0),
                        undefined,
                        undefined,
                        2,
                        true,
                        { isFait: true, floor: true },
                      )}
                </Typography>
                <Typography component={'span'} variant={'body2'} color={'textSecondary'}>
                  {hideAssets
                    ? HiddenTag + `  +  ` + HiddenTag
                    : getValuePrecisionThousand(balanceA, undefined, 2, 2, true, {
                        isAbbreviate: true,
                        abbreviate: 3,
                      }) +
                      ' ' +
                      coinAInfo?.simpleName +
                      `  +  ` +
                      getValuePrecisionThousand(balanceB, undefined, 2, 2, true, {
                        isAbbreviate: true,
                        abbreviate: 3,
                      }) +
                      ' ' +
                      coinBInfo?.simpleName}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'APR',
          sortable: true,
          name: t('labelAPR'),
          width: 'auto',
          maxWidth: 80,
          headerCellClass: 'textAlignRightSortable',
          formatter: ({ row }) => {
            const APR =
              typeof row?.ammDetail?.APR !== undefined && row.ammDetail.APR
                ? row.ammDetail.APR
                : EmptyValueTag
            return (
              <Box className={'textAlignRight'}>
                <Typography component={'span'}>
                  {APR === EmptyValueTag || typeof APR === 'undefined'
                    ? EmptyValueTag
                    : getValuePrecisionThousand(APR, 2, 2, 2, true) + '%'}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'action',
          name: '',
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const popoverProps: PopoverWrapProps = {
              type: PopoverType.click,
              popupId: 'testPopup',
              className: 'arrow-none',
              children: <MoreIcon cursor={'pointer'} />,
              popoverContent: (
                <ActionPopContent {...{ row, allowTrade, handleWithdraw, handleDeposit, t }} />
              ),
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            } as PopoverWrapProps
            return (
              <Grid item marginTop={1}>
                <Popover {...{ ...popoverProps }} />
              </Grid>
            )
          },
        },
      ]
    }

    const nanToEmptyTag = (value: any, prefix: string) => {
      return value === 'NaN' ? EmptyValueTag : prefix + value
    }

    return (
      <TableStyled isMobile={isMobile} className={`${rawData?.length > 0 ? 'min-height' : ''}`}>
        {
          <TableFilterStyled
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            className={`titleSummary ${isMobile ? 'mobile' : ''}`}
            flexDirection={isMobile ? 'column' : 'row'}
          >
            <>{title}</>
            {showFilter && (
              <Filter
                {...{
                  handleFilterChange,
                  filter,
                  hideSmallBalances,
                  setHideSmallBalances,
                }}
              />
            )}
          </TableFilterStyled>
        }
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          {totalDollar !== undefined ? (
            <Typography component={'h4'} variant={'h3'} marginX={3}>
              {totalDollar
                ? hideAssets
                  ? HiddenTag
                  : nanToEmptyTag(
                      getValuePrecisionThousand(
                        sdk.toBig(totalDollar).times(forexMap[currency] ?? 0),
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
          {totalAMMClaims ? (
            rewardsAPIError && getUserRewards ? (
              <Button
                sx={{ marginRight: 3 }}
                onClick={() => {
                  getUserRewards && getUserRewards()
                }}
                size={'small'}
                variant={'outlined'}
              >
                {t('labelRewardRefresh', { ns: 'common' })}
              </Button>
            ) : (
              <Typography
                paddingRight={3}
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
              >
                <Typography variant={'body1'} marginRight={2} component={'span'}>
                  {t('labelAMMClaimableEarnings', { ns: 'common' })}
                </Typography>

                {totalAMMClaims.totalDollar !== '0' ? (
                  <>
                    <Tooltip
                      componentsProps={{
                        tooltip: {
                          sx: {
                            width: 'var(--mobile-full-panel-width)',
                          },
                        },
                      }}
                      className={'detailPanel'}
                      title={<DetailRewardPanel detailList={totalAMMClaims.detail} />}
                    >
                      <Typography
                        display={'inline-flex'}
                        alignItems={'center'}
                        component={'span'}
                        color={'textPrimary'}
                        marginRight={2}
                        sx={{
                          textDecoration: 'underline dotted',
                          cursor: 'pointer',
                        }}
                      >
                        {hideAssets
                          ? HiddenTag
                          : PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              sdk.toBig(totalAMMClaims.totalDollar).times(forexMap[currency] ?? 0),
                              undefined,
                              undefined,
                              2,
                              true,
                              { isFait: true, floor: true },
                            )}
                      </Typography>
                    </Tooltip>
                    <Button
                      variant={'contained'}
                      size={'small'}
                      onClick={() => {
                        history.push(`${RouterPath.l2assetsDetail}/${AssetTabIndex.Rewards}`)
                      }}
                    >
                      {t('labelClaimBtn', { ns: 'common' })}
                    </Button>
                  </>
                ) : (
                  <Typography variant={'inherit'} component={'span'} color={'textPrimary'}>
                    {EmptyValueTag}
                  </Typography>
                )}
              </Typography>
            )
          ) : (
            <></>
          )}
        </Box>

        <Table
          rowHeight={rowConfig.rowHeight}
          headerRowHeight={rowConfig.rowHeaderHeight}
          style={{ height: tableHeight }}
          rawData={rawData}
          showloading={showloading}
          columnMode={isMobile ? columnModeMobile() : (columnMode() as any)}
          sortDefaultKey={'liquidity'}
          generateRows={(rawData) => rawData}
          generateColumns={({ columnsRaw }) => columnsRaw as Column<any, any>[]}
          sortMethod={(sortedRows: R[], sortColumn: string) => {
            switch (sortColumn) {
              case 'liquidity':
                sortedRows = sortedRows.sort((a, b) => {
                  const valueA = a.balanceU
                  const valueB = b.balanceU

                  if (valueA && valueB) {
                    return valueB - valueA
                  }
                  if (valueA && !valueB) {
                    return -1
                  }
                  if (!valueA && valueB) {
                    return 1
                  }
                  return 0
                })
                break
              case 'APR':
                sortedRows = sortedRows.sort((a, b) => {
                  const valueA = a.ammDetail.APR || 0
                  const valueB = b.ammDetail.APR || 0
                  if (valueA && valueB) {
                    return valueB - valueA
                  }
                  if (valueA && !valueB) {
                    return -1
                  }
                  if (!valueA && valueB) {
                    return 1
                  }
                  return 0
                })
                break
              default:
                return sortedRows
            }
            return sortedRows
          }}
          {...{
            t,
            i18n,
            tReady,
          }}
        />
      </TableStyled>
    )
  },
)
