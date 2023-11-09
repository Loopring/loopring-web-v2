import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import {
  AlertIcon,
  ClockIcon,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  HiddenTag,
  MoreIcon,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { Column, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps, Link, Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'
import { DualAssetTableProps, RawDataDualAssetItem } from './Interface'
import { CoinIcons } from '../assetsTable'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE } from '@loopring-web/loopring-sdk'

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 22% 14% auto 6% 14% 10% 10% 8% !important`
        : `--template-columns: 16% 30% 44% 10% !important;`}
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (prosp: BoxProps & { isMobile: boolean }) => JSX.Element
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      return props.currentheight + 'px'
    }};

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo-icon.dual:last-child {
      transform: scale(0.6) translate(0, 4px);
    }
  }

  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }

  .textAlignCenter {
    text-align: center;
  }
` as any

export const DualAssetTable = withTranslation(['tables', 'common'])(
  <R extends RawDataDualAssetItem>(props: DualAssetTableProps<R> & WithTranslation) => {
    const {
      rawData,
      pagination,
      getDualAssetList,
      getDetail,
      dualMarketMap,
      showloading,
      showDetail,
      refresh,
      cancelReInvest,
      hideAssets,
      rowConfig,
      t,
    } = props

    const { isMobile, coinJson } = useSettings()
    const [page, setPage] = React.useState(1)
    const updateData = _.debounce(
      ({
        // tableType,
        currPage = page,
        pageSize = pagination?.pageSize ?? 10,
      }: {
        // tableType: TableType;
        currPage?: number
        pageSize?: number
      }) => {
        getDualAssetList({
          limit: pageSize,
          offset: (currPage - 1) * pageSize,
        })
      },
      globalSetup.wait,
    )

    const handlePageChange = React.useCallback(
      (currPage: number) => {
        if (currPage === page) return
        setPage(currPage)
        updateData({ currPage: currPage })
      },
      [updateData, page],
    )
    const getColumnMode = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Product',
          sortable: false,
          width: 'auto',
          name: t('labelDualAssetProduct'),
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const {
              sellSymbol,
              buySymbol,
              __raw__: {
                order: {
                  dualType,
                  // investmentStatus,
                  settlementStatus,
                  dualReinvestInfo
                },
              },
            } = row
            const [base, quote] =
              dualType === DUAL_TYPE.DUAL_BASE ? [sellSymbol, buySymbol] : [buySymbol, sellSymbol]

            const showClock =
              dualReinvestInfo?.isRecursive &&
              settlementStatus?.toUpperCase() == sdk.SETTLEMENT_STATUS.PAID &&
              dualReinvestInfo?.retryStatus?.toUpperCase() === sdk.DUAL_RETRY_STATUS.RETRYING
            return (
              <Typography
                component={'span'}
                flexDirection={'row'}
                display={'flex'}
                height={'100%'}
                alignItems={'center'}
              >
                <Typography component={'span'} display={'inline-flex'}>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <CoinIcons
                    type={TokenType.dual}
                    size={24}
                    tokenIcon={[coinJson[row.sellSymbol], coinJson[row.buySymbol]]}
                  />
                </Typography>
                <Typography component={'span'} display={'flex'} alignItems={'center'}>
                  {showClock ? (
                    <Tooltip title={t('labelDualRetryStatusRetrying').toString()}>
                      <Typography
                        component={'span'}
                        // display={"inline-flex"}
                        alignItems={'center'}
                        color={'textPrimary'}
                        display={'inline-flex'}
                        flexDirection={'row'}
                      >
                        {`${base}/${quote}`}
                        <ClockIcon sx={{ marginLeft: 1 }} color={'warning'} />
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography
                      component={'span'}
                      // display={"inline-flex"}
                      color={'textPrimary'}
                      display={'flex'}
                      flexDirection={'column'}
                    >
                      {`${base}/${quote}`}
                    </Typography>
                  )}
                </Typography>
              </Typography>
            )
          },
        },
        {
          key: 'Frozen',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          name: t('labelDualAssetFrozen'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            if (hideAssets) {
              return <>{HiddenTag}</>
            } else if (!row?.amount) {
              return <>{'-- ' + row.sellSymbol}</>
            } else {
              return <>{row?.amount + ' ' + row.sellSymbol}</>
            }
          },
        },
        {
          key: 'Return',
          sortable: false,
          width: 'auto',
          name: t('labelDualAssetReturn'),
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const { currentPrice, lessEarnView, greaterEarnView } = getDetail(row)
            const { base, quote } = currentPrice
            return (
              <>
                {hideAssets
                  ? HiddenTag
                  : (lessEarnView === '0' ? EmptyValueTag : lessEarnView) +
                    ' ' +
                    base +
                    '/' +
                    (greaterEarnView === '0' ? EmptyValueTag : greaterEarnView) +
                    ' ' +
                    quote}
              </>
            )
          },
        },
        {
          key: 'Price',
          sortable: false,
          width: 'auto',
          name: t('labelDualAssetPrice'),
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.strike}</>
          },
        },
        {
          key: 'Settlement_Date',
          sortable: true,
          width: 'auto',
          name: t('labelDualAssetSettlement_Date'),
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{moment(new Date(row.expireTime)).format(YEAR_DAY_MINUTE_FORMAT)}</>
          },
        },
        {
          key: 'APR',
          sortable: true,
          width: 'auto',
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          name: t('labelDualAssetAPR'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.apy}</>
          },
        },
        {
          key: 'Auto',
          sortable: true,
          name: t('labelDualAutoReinvest'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return row?.__raw__.order?.dualReinvestInfo?.isRecursive ? (
              <Link
                onClick={(_e) => {
                  cancelReInvest(row)
                }}
              >
                {t('labelDualAssetReInvestEnable')}
              </Link>
            ) : (
              <>{t('labelDualAssetReInvestDisable')} </>
            )
          },
        },
        {
          key: 'Action',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelDualAssetAction'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const investmentStatus = row.__raw__.order.investmentStatus
            const showRefresh = investmentStatus === sdk.LABEL_INVESTMENT_STATUS.PROCESSING
            const dualType = row.__raw__.order?.dualType
            const isRecursive = row.__raw__.order?.dualReinvestInfo?.isRecursive
            const newStrike = row.__raw__.order?.dualReinvestInfo?.newStrike
            const { currentPrice, precisionForPrice, base, quote } = row.__raw__?.currentPrice
            const currentView = currentPrice
              ? getValuePrecisionThousand(
                  currentPrice,
                  precisionForPrice ?? 6,
                  precisionForPrice ?? 6,
                  undefined,
                  false,
                )
              : EmptyValueTag
            let showAlert = false
            if (isRecursive && dualType == DUAL_TYPE.DUAL_BASE) {
              showAlert = sdk
                .toBig(currentPrice ?? 0)
                .div(newStrike)
                .minus(1)
                .lte(-0.05)
            } else {
              showAlert = sdk
                .toBig(currentPrice ?? 0)
                .div(newStrike)
                .minus(1)
                .gte(0.05)
            }

            return showRefresh ? (
              <Link
                onClick={(_e) => {
                  refresh(row)
                }}
              >
                {t('labelDualAssetRefresh')}
              </Link>
            ) : showAlert ? (
              <Tooltip
                title={t('labelDualAutoAlert', {
                  ns: 'common',
                  base,
                  currentPrice: currentView,
                  quote,
                  method:
                    dualType == DUAL_TYPE.DUAL_BASE
                      ? t('labelDualIsLow', { ns: 'common' })
                      : t('labelDualIsHigh', { ns: 'common' }),
                }).toString()}
              >
                <Typography display={'inline-flex'} alignItems={'center'}>
                  <Link paddingRight={1 / 2} onClick={(_e) => showDetail(row)}>
                    {t('labelDualAssetDetail')}
                  </Link>
                  <AlertIcon color={'warning'} />
                </Typography>
              </Tooltip>
            ) : (
              <Link onClick={(_e) => showDetail(row)}>{t('labelDualAssetDetail')}</Link>
            )
          },
        },
      ],
      [coinJson, t, hideAssets],
    )

    const getColumnMobile = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Product',
          sortable: false,
          width: 'auto',
          name: t('labelDualAssetProduct'),
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const {
              __raw__: {
                order: {
                  dualType,
                  investmentStatus,
                  settlementStatus,
                  dualReinvestInfo
                },
              },
            } = row
            // const inAuto = investmentStatus === sdk.LABEL_INVESTMENT_STATUS.PROCESSING
            const showClock =
              dualReinvestInfo?.isRecursive &&
              settlementStatus?.toUpperCase() == sdk.SETTLEMENT_STATUS.PAID &&
              dualReinvestInfo?.retryStatus?.toUpperCase() === sdk.DUAL_RETRY_STATUS.RETRYING
            return (
              <Typography
                component={'span'}
                flexDirection={'row'}
                display={'flex'}
                height={'100%'}
                alignItems={'center'}
              >
                <Typography component={'span'} display={'inline-flex'}>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <CoinIcons
                    type={TokenType.dual}
                    size={24}
                    tokenIcon={[coinJson[row.sellSymbol], coinJson[row.buySymbol]]}
                  />
                </Typography>
                {/*{inAuto && <ClockIcon color={'primary'} />}*/}
                {showClock && (
                  <Tooltip title={t('labelDualRetryStatusRetrying').toString()}>
                    <ClockIcon sx={{ marginLeft: 1 }} color={'warning'} />
                  </Tooltip>
                )}
              </Typography>
            )
          },
        },
        {
          key: 'Price',
          sortable: false,
          width: 'auto',
          name: t('labelDualAssetPrice') + '/' + t('labelDualAssetSettlement_Date'),
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const dualType = row.__raw__.order?.dualType
            const newStrike = row.__raw__.order?.dualReinvestInfo?.newStrike
            const isRecursive = row.__raw__.order?.dualReinvestInfo?.isRecursive
            const { currentPrice, precisionForPrice, base, quote } = row.__raw__?.currentPrice ?? {}
            const currentView = currentPrice
              ? getValuePrecisionThousand(
                  currentPrice,
                  precisionForPrice ?? 6,
                  precisionForPrice ?? 6,
                  undefined,
                  false,
                )
              : EmptyValueTag
            let showAlert = false
            if (isRecursive && dualType == DUAL_TYPE.DUAL_BASE) {
              showAlert = sdk.toBig(currentPrice).div(newStrike).minus(1).lte(-0.05)
            } else {
              showAlert = sdk.toBig(currentPrice).div(newStrike).minus(1).gte(0.05)
            }

            return (
              <Box
                className={'textAlignRight'}
                display={'flex'}
                flexDirection={'column'}
                height={'100%'}
                justifyContent={'center'}
              >
                {showAlert ? (
                  <Tooltip
                    title={t('labelDualAutoAlert', {
                      ns: 'common',
                      base,
                      currentPrice: currentView,
                      quote,
                      method:
                        dualType == DUAL_TYPE.DUAL_BASE
                          ? t('labelDualIsLow', { ns: 'common' })
                          : t('labelDualIsHigh', { ns: 'common' }),
                    }).toString()}
                  >
                    <Typography component={'span'}>
                      {row?.strike}
                      <AlertIcon color={'warning'} />
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography component={'span'}>{row?.strike}</Typography>
                )}
                <Typography component={'span'} variant={'body2'} color={'textSecondary'}>
                  {moment(new Date(row.expireTime)).format(YEAR_DAY_MINUTE_FORMAT)}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'APR',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelDualAssetAPR') + '/' + t('labelDualAssetFrozen'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                <Box
                  className={'textAlignRight'}
                  display={'flex'}
                  flexDirection={'column'}
                  height={'100%'}
                  justifyContent={'center'}
                >
                  <Typography component={'span'}>{row?.apy}</Typography>
                  <Typography component={'span'} variant={'body2'} color={'textSecondary'}>
                    {hideAssets ? HiddenTag : row?.amount + ' ' + row.sellSymbol}
                  </Typography>
                </Box>
              </>
            )
          },
        },
        {
          key: 'Action',
          sortable: false,
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: 'Action',
          formatter: ({ row }: FormatterProps<R>) => {
            return <MoreIcon onClick={() => showDetail(row)} cursor={'pointer'} />
          },
        },
      ],
      [coinJson, t, hideAssets],
    )

    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let _dualList: R[] = []
        switch (sortColumn) {
          case 'Settlement_Date':
            _dualList = rawData.sort((a, b) => {
              return b.expireTime - a.expireTime
            })
            break

          case 'APR':
            _dualList = rawData.sort((a, b) => {
              const replaced = new RegExp(`[\\${sdk.SEP},%]`, 'ig')
              const valueA = a.apy?.replace(replaced, '') ?? 0
              const valueB = b.apy?.replace(replaced, '') ?? 0
              return Number(valueB) - Number(valueA)
            })
            break
          default:
            _dualList = rawData
        }
        // resetTableData(_dualList)
        return _dualList
      },
      [rawData],
    )
    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobile() : getColumnMode(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }
    React.useEffect(() => {
      if (dualMarketMap) {
        updateData.cancel()
        updateData({ currPage: 1 })
      }
      // let filters: any = {};
      // handlePageChange(1);
      // if (searchParams.get("types")) {
      //   filters.type = searchParams.get("types");
      // }
      // handleFilterChange(filters);
      return () => {
        updateData.cancel()
      }
    }, [pagination?.pageSize, dualMarketMap])
    return (
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={
            rawData.length ? rowConfig.rowHeaderHeight! + rawData.length * rowConfig.rowHeight! : 350
          }
          rowHeight={rowConfig.rowHeight}
          headerRowHeight={rowConfig.rowHeaderHeight}
          sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,
            rawData,
            showloading,
          }}
        />
        {pagination && pagination.total > pagination.pageSize && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableWrapperStyled>
    )
  },
)
