import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import {
  ForexMap,
  getValuePrecisionThousand,
  globalSetup,
  RowConfig,
  TokenType,
} from '@loopring-web/common-resources'
import { Column, Table } from '../../basic-lib'
import { Box, BoxProps, Link, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import _ from 'lodash'
import { CoinIcons } from '../assetsTable'
import * as sdk from '@loopring-web/loopring-sdk'

export type EarningsRow = {
  token: {
    type: TokenType
    value: string
  }
  detail: Array<{
    amountStr: string
    amount: string
    claimType: sdk.CLAIM_TYPE
  }>
  precision: number
  amountStr: string
  amount: string
  tokenValueDollar: number
  rawData: any
}
const TableWrapperStyled = styled(Box)<BoxProps & { isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (prosp: BoxProps & { isMobile: boolean }) => JSX.Element
const TableStyled = styled(Table)`
  &.rdg {
    min-height: 240px;
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

export const RewardsTable = withTranslation(['tables', 'common'])(
  <R extends EarningsRow>(
    props: {
      forexMap: ForexMap<sdk.Currency>
      rawData: R[]
      onItemClick: (item: any) => void
      onDetail: (item: any) => void
      getList: () => void
      showloading: boolean
    } & WithTranslation,
  ) => {
    const { forexMap, rawData, onItemClick, onDetail, getList, showloading, t } = props

    const { currency, isMobile, coinJson } = useSettings()
    const updateData = _.debounce(() => {
      getList()
    }, globalSetup.wait)

    const getColumnMode = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'token',
          name: t('labelToken'),
          formatter: ({ row, column }) => {
            const token = row[column.key]
            let tokenIcon: [any, any] = [undefined, undefined]
            const [head, middle, tail] = token.value.split('-')
            if (token.type === 'lp' && middle && tail) {
              tokenIcon =
                coinJson[middle] && coinJson[tail]
                  ? [coinJson[middle], coinJson[tail]]
                  : [undefined, undefined]
            }
            if (token.type !== 'lp' && head && head !== 'lp') {
              tokenIcon = coinJson[head] ? [coinJson[head], undefined] : [undefined, undefined]
            }
            return (
              <>
                <CoinIcons type={token.type} tokenIcon={tokenIcon} />
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
                    {token.value}
                  </Typography>
                </Typography>
              </>
            )
          },
        },
        {
          key: 'amount',
          name: t('labelAmount'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const value = row.amountStr
            const precision = row.precision
            return (
              <Box
                className={'textAlignRight'}
                onClick={() => {
                  onDetail(row)
                }}
              >
                <Typography
                  display={'inline-flex'}
                  alignItems={'center'}
                  component={'span'}
                  sx={{
                    textDecoration: 'underline dotted',
                    cursor: 'pointer',
                  }}
                >
                  {getValuePrecisionThousand(value, precision, precision, undefined, false, {
                    floor: true,
                  })}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'value',
          name: t('labelAssetsTableValue'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            return (
              <Box className={'textAlignRight'}>
                {getValuePrecisionThousand(
                  (row?.tokenValueDollar || 0) * (forexMap[currency] ?? 0),
                  undefined,
                  undefined,
                  undefined,
                  true,
                  { isFait: true, floor: true },
                )}
              </Box>
            )
          },
        },
        {
          key: 'Actions',
          name: t('labelActions'),
          headerCellClass: 'textAlignRight',
          cellClass: 'textAlignRight',
          formatter: ({ row }) => {
            return <Link onClick={() => onItemClick(row)}>{t('labelClaim')}</Link>
          },
        },
      ],
      [],
    )

    const defaultArgs: any = {
      columnMode: getColumnMode(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }
    React.useEffect(() => {
      updateData.cancel()
      updateData()
      return () => {
        updateData.cancel()
      }
    }, [])
    return (
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight}
          {...{
            ...defaultArgs,
            ...props,
            rawData,
            showloading,
          }}
        />
      </TableWrapperStyled>
    )
  },
)
