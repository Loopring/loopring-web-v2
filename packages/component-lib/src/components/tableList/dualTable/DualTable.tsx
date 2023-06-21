import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import { Button, Column, Table } from '../../basic-lib'
import { Box, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'
import { RawDataDualsItem } from './Interface'
import {
  EmptyValueTag,
  ForexMap,
  getValuePrecisionThousand,
  RowDualInvestConfig,
  UpColor,
  UpIcon,
  YEAR_DAY_FORMAT,
} from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import moment from 'moment/moment'
import * as sdk from '@loopring-web/loopring-sdk'

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
`
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.ispro === 'pro') {
        return '620px'
      }
      if (props.currentheight) {
        return props.currentheight + 'px'
      } else {
        return '100%'
      }
    }};

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
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

export interface DualsTableProps<R, C = sdk.Currency> {
  rawData: R[]
  showloading: boolean
  forexMap: ForexMap<C>
  onItemClick: (item: R) => void
}

const ButtonStyled = styled(Button)`
  & {
    border-color: var(--color-primary);
    color: var(--color-primary);
    font-size: 16px;
    height: ${({theme}) => 5 * theme.unit}px;
    padding-left: ${({theme}) => 2.5 * theme.unit}px;
    padding-right: ${({theme}) => 2.5 * theme.unit}px;
  }
`

export const DualTable = withTranslation(['tables', 'common'])(
  <R extends RawDataDualsItem>(props: DualsTableProps<R> & WithTranslation) => {
    const { rawData, showloading, onItemClick, t } = props
    const { isMobile, upColor } = useSettings()
    const history = useHistory()
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Apy',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelDualApy'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display={'flex'}>{row?.apy ?? EmptyValueTag}</Box>
          },
        },
        {
          key: 'targetPrice',
          sortable: true,
          name: t('labelDualPrice'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const [_upColor, _downColor] =
              upColor == UpColor.green
                ? ['var(--color-success)', 'var(--color-error)']
                : ['var(--color-error)', 'var(--color-success)']
            return (
              <Box display='flex' justifyContent={'stretch'} height={'100%'} alignItems={'center'}>
                <Typography component={'span'}> {row.strike}</Typography>
                <Typography
                  component={'span'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  color={'textSecondary'}
                  variant={'body2'}
                >
                  <UpIcon
                    fontSize={'small'}
                    // htmlColor={row.isUp ? _upColor : _downColor}
                    style={{
                      transform: row.isUp ? '' : 'rotate(-180deg)',
                    }}
                  />
                  {row.settleRatio
                    ? getValuePrecisionThousand(
                        sdk
                          .toBig(row.strike ?? 0)
                          .minus(row.currentPrice?.currentPrice ?? 0)
                          .div(row.currentPrice?.currentPrice ?? 1)
                          .times(100)
                          .abs(),
                        2,
                        2,
                        2,
                        true,
                      ) + '%'
                    : EmptyValueTag}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Term',
          sortable: true,
          name: t('labelDualTerm'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display='flex'>{row.term}</Box>
          },
        },
        {
          key: 'Settlement',
          sortable: true,
          name: t('labelDualSettlement'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Box display='flex'>{moment(new Date(row.expireTime)).format(YEAR_DAY_FORMAT)}</Box>
            )
          },
        },
        {
          key: 'Action',
          sortable: false,
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelDualAction'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                variant={'inherit'}
                color={'textPrimary'}
                display={'inline-flex'}
                flexDirection={'column'}
                className={'textAlignRight'}
                component={'span'}
              >
                <ButtonStyled
                  variant={'outlined'}
                  size={'medium'}
                  onClick={(_e) => {
                    onItemClick(row)
                  }}
                >
                  {t('labelInvestBtn', { ns: 'common' })}
                </ButtonStyled>
              </Typography>
            )
          },
        },
      ],
      [history, upColor, t],
    )

    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Apy',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelDualApy'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display={'flex'}>{row?.apy ?? EmptyValueTag}</Box>
          },
        },
        {
          key: 'targetPrice',
          sortable: true,
          name: t('labelDualPrice'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const [_upColor, _downColor] =
              upColor == UpColor.green
                ? ['var(--color-success)', 'var(--color-error)']
                : ['var(--color-error)', 'var(--color-success)']
            return (
              <Box display='flex' justifyContent={'stretch'} height={'100%'} alignItems={'center'}>
                <Typography component={'span'}> {row.strike}</Typography>
                <Typography
                  component={'span'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  color={'textSecondary'}
                  variant={'body2'}
                >
                  <UpIcon
                    fontSize={'small'}
                    // htmlColor={row.isUp ? _upColor : _downColor}
                    style={{
                      transform: row.isUp ? '' : 'rotate(-180deg)',
                    }}
                  />
                  {row.settleRatio
                    ? getValuePrecisionThousand(
                        sdk
                          .toBig(row.strike ?? 0)
                          .minus(row.currentPrice?.currentPrice ?? 0)
                          .div(row.currentPrice?.currentPrice ?? 1)
                          .times(100)
                          .abs(),
                        2,
                        2,
                        2,
                        true,
                      ) + '%'
                    : EmptyValueTag}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Settlement',
          sortable: true,
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelDualSettlement'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{moment(new Date(row.expireTime)).format(YEAR_DAY_FORMAT)}</>
          },
        },
      ],
      [t],
    )

    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobileTransaction() : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let _rawData: R[] = []
        switch (sortColumn) {
          case 'Apy':
            _rawData = rawData.sort((a, b) => {
              const replaced = new RegExp(`[\\${sdk.SEP},%]`, 'ig')
              const valueA = a.apy?.replace(replaced, '') ?? 0
              const valueB = b.apy?.replace(replaced, '') ?? 0
              return Number(valueB) - Number(valueA) //.localeCompare(valueA);
            })
            // default;
            break
          case 'targetPrice':
            _rawData = rawData.sort((a, b) => {
              const replaced = new RegExp(`\\${sdk.SEP}`, 'ig')
              const valueA = a.strike?.replace(replaced, '') ?? 0
              const valueB = b.strike?.replace(replaced, '') ?? 0
              return Number(valueB) - Number(valueA) //.loc
            })
            break
          case 'Settlement':
          case 'Term':
            _rawData = rawData.sort((a, b) => {
              return b.expireTime - a.expireTime
            })
            break
          default:
            _rawData = rawData
        }

        // resetTableData(_rawData)
        return _rawData
      },
      [rawData],
    )

    return (
      <TableWrapperStyled>
        <TableStyled
          currentheight={
            rawData.length > 0
              ? RowDualInvestConfig.rowHeaderHeight + rawData.length * RowDualInvestConfig.rowHeight
              : RowDualInvestConfig.minHeight
          }
          rowHeight={RowDualInvestConfig.rowHeight}
          headerRowHeight={RowDualInvestConfig.rowHeaderHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row)
          }}
          sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,

            rawData,
            showloading,
          }}
        />
      </TableWrapperStyled>
    )
  },
)
