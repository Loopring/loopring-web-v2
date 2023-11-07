import React from 'react'
import { useTranslation } from 'react-i18next'

import { Button, CoinIcon, Column, Table } from '../../basic-lib'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  InvestAssetRouter,
  InvestDuration,
  InvestMapType,
  RouterPath,
  RowConfig,
  TokenType,
} from '@loopring-web/common-resources'
import { Box, BoxProps, Link, Typography } from '@mui/material'
import { ColumnKey, InvestOverviewTableProps, RowInvest, SubRowAction } from './Interface'
import styled from '@emotion/styled'
import { useHistory } from 'react-router-dom'
import { TokenInfo } from '@loopring-web/loopring-sdk'
import { TableFilterStyled, TablePaddingX } from '../../styled'
import { investRowReducer } from './components/expends'
import { Filter } from './components/Filter'
import { DropdownIconStyled } from '../../tradePanel'
import { useSettings } from '../../../stores'
import { InvestColumnKey } from './index'
import { ColumnCoinDeep } from '../assetsTable'

const TableStyled = styled(Box)<{ isMobile?: boolean; hasContent?: boolean } & BoxProps>`
  & .rdg.rdg {
    ${({ hasContent }) => (hasContent ? `min-height:initial;` : ``)}
    // border-radius: ${({ theme }) => theme.unit}px;

    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 320px auto auto 124px !important;`
        : ` --template-columns: 46% auto auto !important;
`}
    .rdg-cell.action {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    & > .rdg-row {
      border-top: 1px solid var(--color-box-hover);
    }

    & > .rdg-row.child_row {
      border-top: none;
      .rdg-cell:first-of-type {
        margin-left: ${({ theme }) => 2 * theme.unit}px;
      }
      &:hover {
        background-color: transparent;
      }
    }
    & > .rdg-row.child_row:first-of-type {
      border-top: 0px solid var(--color-box-hover);
    }
    .rdg-row.expends {
      background-color: var(--color-pop-bg);
    }
  }

  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean; hasContent?: boolean } & BoxProps) => JSX.Element

export const InvestOverviewTable = <R extends RowInvest>({
  rawData,
  wait,
  coinJson,
  filterValue,
  getFilteredData,
  showLoading,
  showFilter,
  rowConfig = RowConfig,
  ...rest
}: InvestOverviewTableProps<R>) => {
  const { t, i18n } = useTranslation(['tables', 'common'])
  const [rows, dispatch] = React.useReducer(investRowReducer, rawData)
  const history = useHistory()

  React.useEffect(() => {
    if (rawData.length) {
      dispatch({
        rows: rawData,
        type: SubRowAction.UpdateRaw,
      })
    }
  }, [rawData])

  // myLog("Overview", rows);
  const handleFilterChange = React.useCallback(
    ({ searchValue }: any) => {
      if (getFilteredData) {
        getFilteredData(searchValue)
      }
    },
    [getFilteredData],
  )
  const tableHeight = React.useMemo(() => {
    return rows.length > 0 ? (rows.length + 1) * rowConfig.rowHeight : 350
  }, [rows.length, rowConfig])
  const [isDropDown, setIsDropDown] = React.useState(true)

  const getColumnMode = (): Column<R, unknown>[] => [
    {
      key: ColumnKey.TYPE,
      sortable: false,
      name: t('labelToken'),
      formatter: ({ row }) => {
        switch (row.type) {
          case InvestMapType.Token:
            const token = row.coinInfo
            return <ColumnCoinDeep token={{ ...token, type: TokenType.single }} />
          default:
            return (
              <Typography
                variant={'inherit'}
                color={'textPrimary'}
                display={'inline-flex'}
                flexDirection={'column'}
                marginLeft={2}
                component={'span'}
                paddingRight={1}
              >
                <Typography component={'span'} className={'next-type'}>
                  {t(row.i18nKey, { ns: 'common' })}
                </Typography>
              </Typography>
            )
        }
      },
    },
    {
      key: ColumnKey.APR,
      sortable: false,
      name: t('labelAPR'),
      width: 'auto',
      maxWidth: 80,
      cellClass: 'textAlignLeft',
      headerCellClass: 'textAlignLeftSortable',
      formatter: ({ row }) => {
        const [start, end] = row.apr
        // myLog("end", end);
        return (
          <Box className={'textAlignLeft'}>
            <Typography component={'span'}>
              {end === 0 && start === 0
                ? EmptyValueTag
                : start === end
                ? getValuePrecisionThousand(end, 2, 2, 2, true) + '%'
                : end === 0 || start === 0
                ? getValuePrecisionThousand(end ? end : start, 2, 2, 2, true) + '%'
                : getValuePrecisionThousand(start, 2, 2, 2, true) +
                  '% - ' +
                  getValuePrecisionThousand(end, 2, 2, 2, true) +
                  '%'}
            </Typography>
          </Box>
        )
      },
    },
    {
      key: ColumnKey.DURATION,
      sortable: false,
      width: 'auto',
      cellClass: 'textAlignCenter',
      headerCellClass: 'textAlignCenter',
      name: t('labelDuration'),
      formatter: ({ row }) => {
        const label = (row.duration ?? '').split('|')
        return (
          <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Typography component={'span'}>
              {row.durationType === InvestDuration.Duration
                ? `${t(label[0], { ns: 'common', arg: label[1] })}`
                : t('labelInvest' + row.durationType, { ns: 'common' })}
            </Typography>
          </Box>
        )
        // ${t("labelDay", {
        //             ns: "common",
        //           })}
      },
    },
    {
      key: ColumnKey.ACTION,
      name: t('labelActions'),
      headerCellClass: 'textAlignRight',
      cellClass: 'action',
      formatter: ({ row }) => {
        switch (row.type) {
          case InvestMapType.Token:
            return (
              <Typography
                variant={'inherit'}
                display={'inline-flex'}
                justifyContent={'flex-end'}
                alignItems={'center'}
                className={'textAlignRight'}
                width={'100%'}
                sx={{ cursor: 'pointer' }}
              >
                <DropdownIconStyled status={row.isExpanded ? 'up' : 'down'} fontSize={'medium'} />
              </Typography>
            )
          default:
            return (
              <Typography
                variant={'inherit'}
                color={'textPrimary'}
                display={'inline-flex'}
                flexDirection={'column'}
                className={'textAlignRight'}
                component={'span'}
              >
                <Button
                  variant={'outlined'}
                  size={'medium'}
                  onClick={(_e) => {
                    switch (row.type) {
                      case InvestMapType.AMM:
                        history.push(
                          `${RouterPath.invest}/${InvestAssetRouter.AMM}?search=${row.token.symbol}`,
                        )
                        return
                      case InvestMapType.STAKE:
                        history.push(
                          `${RouterPath.invest}/${InvestAssetRouter.STAKE}/${row.token.symbol}-null/invest`,
                        )
                        return
                      case InvestMapType.DUAL:
                        history.push(
                          `${RouterPath.invest}/${InvestAssetRouter.DUAL}/${row.token.symbol}-null`,
                        )
                        return
                      case InvestMapType.STAKELRC:
                        history.push(
                          `${RouterPath.invest}/${InvestAssetRouter.STAKELRC}/${row.token.symbol}-null`,
                        )
                        return
                      case InvestMapType.LEVERAGEETH:
                        history.push(`${RouterPath.invest}/${InvestAssetRouter.LEVERAGEETH}`)
                        return
                    }
                  }}
                >
                  {t('labelInvestBtn', { ns: 'common' })}
                </Button>
              </Typography>
            )
        }
      },
    },
  ]
  const getColumnMobileMode = (): Column<R, unknown>[] => [
    {
      key: ColumnKey.TYPE,
      sortable: false,
      name: t('labelToken'),
      formatter: ({ row }) => {
        switch (row.type) {
          case InvestMapType.Token:
            const token: TokenInfo = row.token
            return (
              <Box display={'flex'} flexDirection={'row'} alignItems={'center'} height={'100%'}>
                {token?.symbol && <CoinIcon symbol={token?.symbol} />}
                <Typography component={'span'} className={'next-coin'}>
                  {token?.symbol}
                </Typography>
                <Typography
                  marginLeft={1}
                  component={'span'}
                  className={'next-company'}
                  color={'textSecondary'}
                >
                  {token?.name}
                </Typography>
              </Box>
            )
          default:
            return (
              <Typography
                variant={'inherit'}
                color={'textPrimary'}
                display={'inline-flex'}
                flexDirection={'column'}
                marginLeft={2}
                component={'span'}
                paddingRight={1}
              >
                <Typography component={'span'} className={'next-type'}>
                  {t(row.i18nKey, { ns: 'common' })}
                </Typography>
              </Typography>
            )
        }
      },
    },
    {
      key: ColumnKey.APR,
      sortable: false,
      name: t('labelAPR'),
      width: 'auto',
      maxWidth: 80,
      cellClass: 'textAlignLeft',
      headerCellClass: 'textAlignLeftSortable',
      formatter: ({ row }) => {
        const [start, end] = row.apr
        // myLog("end", end);
        return (
          <Box className={'textAlignLeft'}>
            <Typography component={'span'}>
              {end === 0 && start === 0
                ? EmptyValueTag
                : start === end
                ? getValuePrecisionThousand(end, 2, 2, 2, true) + '%'
                : end === 0 || start === 0
                ? getValuePrecisionThousand(end ? end : start, 2, 2, 2, true) + '%'
                : getValuePrecisionThousand(start, 2, 2, 2, true) +
                  '% - ' +
                  getValuePrecisionThousand(end, 2, 2, 2, true) +
                  '%'}
            </Typography>
          </Box>
        )
      },
    },
    {
      key: ColumnKey.DURATION,
      sortable: false,
      width: 'auto',
      cellClass: 'textAlignCenter',
      headerCellClass: 'textAlignCenter',
      name: t('labelDuration'),
      formatter: ({ row }) => {
        const label = (row.duration ?? '').split('|')
        return (
          <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Typography component={'span'}>
              {row.durationType === InvestDuration.Duration
                ? `${t(label[0], { ns: 'common', arg: label[1] })}`
                : t('labelInvest' + row.durationType, { ns: 'common' })}
            </Typography>
          </Box>
        )
        // ${t("labelDay", {
        //             ns: "common",
        //           })}
      },
    },
  ]
  const { isMobile } = useSettings()

  return (
    <TableStyled isMobile={isMobile} hasContent={rows?.length > 0 ? true : false}>
      {showFilter &&
        (isMobile && isDropDown ? (
          <Link
            variant={'body1'}
            display={'inline-flex'}
            width={'100%'}
            justifyContent={'flex-end'}
            paddingRight={2}
            onClick={() => setIsDropDown(false)}
          >
            {t('labelShowFilter')}
          </Link>
        ) : (
          <Box
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            marginLeft={3}
          >
            <Typography fontSize={'36px'} variant={isMobile ? 'h3' : 'h1'}>
              {t('labelTitleOverviewAllPrd', { ns: 'common' })}
            </Typography>
            <TableFilterStyled>
              <Filter
                {...{
                  handleFilterChange,
                  searchValue: filterValue,
                  // hideSmallBalances,
                  // setHideSmallBalances,
                }}
              />
            </TableFilterStyled>
          </Box>
        ))}

      <Table
        i18n={i18n}
        tReady={true}
        {...{ ...rest, t }}
        // rowGrouper={_.groupBy}
        rowClassFn={(row) => {
          if (
            row.type !== InvestMapType.Token
            // row.type === InvestMapType.STAKE ||
            // row.type === InvestMapType.AMM  || row.type === InvestMapType.AMM
          ) {
            return 'child_row'
          }
          if (row.isExpanded) {
            return 'expends'
          }

          return ''
        }}
        onRowClick={(_, row) => {
          if (row.children) {
            dispatch({
              symbol: row.token.symbol,
              type: SubRowAction.ToggleSubRow,
            })
          }
        }}
        style={{ height: tableHeight }}
        rowHeight={rowConfig.rowHeight}
        headerRowHeight={rowConfig.rowHeaderHeight}
        rawData={rows}
        // sortMethod={sortMethod}
        generateRows={(rowData: any) => rowData}
        generateColumns={({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[]}
        sortDefaultKey={InvestColumnKey.APR}
        columnMode={isMobile ? getColumnMobileMode() : getColumnMode()}
      />
    </TableStyled>
  )
}
