import styled from '@emotion/styled'
import * as sdk from '@loopring-web/loopring-sdk'
import { CoinIcons, Table, useSettings } from '@loopring-web/component-lib'
import { EmptyValueTag, TokenType, RowConfig } from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { Column } from 'react-data-grid'
import { Typography } from '@mui/material'

const TableStyled = styled(Table)<{ isMobile: boolean }>`
  &.rdg {
    --template-columns: auto 10% 10% 16% 16% 14% 14% !important;

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
  isDelivering: boolean
}

export const DualProductTable = withTranslation(['tables', 'common'])(
  <R extends any>(props: DualsTableProps<R> & WithTranslation) => {
    const { rawData, showloading, t } = props
    const history = useHistory()
    const { coinJson } = useSettings()

    const defaultArgs: any = {
      columnMode: [
        {
          key: 'product',
          sortable: false,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Product',
          formatter: ({ row }) => (
            <Typography
              component={'span'}
              flexDirection={'row'}
              display={'flex'}
              height={'100%'}
              alignItems={'center'}
            >
              <Typography component={'span'} display={'inline-flex'}>
                <CoinIcons
                  tokenIcon={[coinJson[row.base], coinJson[row.quote]]}
                  type={TokenType.dual}
                />
              </Typography>
              <Typography component={'span'} display={'inline-flex'}>
                {row.product}
              </Typography>
            </Typography>
          ),
        },
        {
          key: 'targetPrice',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Target Price',
          formatter: ({ row }) => row.targetPrice,
        },
        {
          key: 'currentPrice',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: props.isDelivering ? 'Expire Price' : 'Current Price',
          formatter: ({ row }) => (props.isDelivering ? row.deliveryPrice : row.currentPrice),
        },
        {
          key: 'investAmount',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'InvestAmount',
          formatter: ({ row }) => <>{row.investAmountStr + ' ' + row.investToken}</>,
        },
        {
          key: 'settledAmount',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Amount to be settled',
          formatter: ({ row }) => row.toBeSettledAmount + ' ' + row.toBeSettledToken,
        },
        {
          key: 'received',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'To be received',
          formatter: ({ row }) =>
            row.receivedAmount == 0 ? EmptyValueTag : row.receivedAmount + ' ' + row.receivedToken,
        },
        {
          key: 'supplied',
          sortable: true,
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: 'To be Supplied',
          formatter: ({ row }) => row.supplliedAmount + ' ' + row.supplliedToken,
        },
      ],
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let _rawData: R[] = []
        let key = ''
        switch (sortColumn) {
          case 'product':
            _rawData = rawData.sort((a, b) => a.base.localeCompare(b.base))
            break
          case 'targetPrice':
            _rawData = rawData.sort((a, b) => a['targetPrice'].localeCompare(b['targetPrice']))
            break
          case 'currentPrice':
            key = props.isDelivering ? 'deliveryPrice' : 'currentPrice'
            _rawData = rawData.sort((a, b) => a[key].toString().localeCompare(b[key]))
            break
          case 'investAmount':
            _rawData = rawData.sort((a, b) => a.supplliedAmount.localeCompare(b.supplliedAmount))
            break
          case 'settledAmount':
            _rawData = rawData.sort((a, b) =>
              a.toBeSettledAmount.localeCompare(b.toBeSettledAmount),
            )
            break
          case 'received':
            _rawData = rawData.sort((a, b) => a.receivedAmount.localeCompare(b.receivedAmount))
            break
          case 'supplied':
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
      <TableStyled
        currentheight={
          rawData.length > 0
            ? RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
            : RowConfig.minHeight
        }
        rowHeight={RowConfig.rowHeight}
        headerRowHeight={RowConfig.rowHeaderHeight}
        sortMethod={sortMethod}
        {...{
          ...defaultArgs,
          ...props,
          rawData,
          showloading,
        }}
      />
    )
  },
)
