import styled from '@emotion/styled'
import * as sdk from '@loopring-web/loopring-sdk'
import { CoinIcons, Table, useSettings } from '@loopring-web/component-lib'
import {
  RowDualInvestConfig,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import React from 'react'
import { Column } from 'react-data-grid'
import { Typography } from '@mui/material'
import moment from 'moment'

const TableStyled = styled(Table)<{ isMobile: boolean }>`
  &.rdg {
    --template-columns: '30% 20% 20% 30% !important';

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

export interface DualsTxProps<R, C = sdk.Currency> {
  rawData: R[]
  showloading: boolean
}

export const DualTxTable = withTranslation(['tables', 'common'])(
  <R extends any>(props: DualsTxProps<R> & WithTranslation) => {
    const { rawData, showloading, t } = props
    const { coinJson } = useSettings()

    const defaultArgs: any = {
      columnMode: [
        {
          key: 'token',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Token',
          formatter: ({ row }) => (
            <Typography
              component={'span'}
              flexDirection={'row'}
              display={'flex'}
              height={'100%'}
              alignItems={'center'}
            >
              <Typography component={'span'} display={'inline-flex'}>
                <CoinIcons tokenIcon={[coinJson[row.symbol]]} type={TokenType.symbol} />
              </Typography>
              <Typography component={'span'} display={'inline-flex'}>
                {row.symbol}
              </Typography>
            </Typography>
          ),
        },
        {
          key: 'type',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Type',
          formatter: ({ row }) => row.txType,
        },

        {
          key: 'amount',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'amount',
          formatter: ({ row }) => row.amount,
        },
        {
          key: 'time',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Time',
          formatter: ({ row }) => moment(row.updatedAt).format(YEAR_DAY_MINUTE_FORMAT),
        },
      ],
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let _rawData: R[] = []
        switch (sortColumn) {
          case 'product':
          case 'targetPrice':
          case 'currentPrice':
          case 'investAmount':
          case 'settledAmount':
          case 'received':
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
            ? RowDualInvestConfig.rowHeaderHeight + rawData.length * RowDualInvestConfig.rowHeight
            : RowDualInvestConfig.minHeight
        }
        rowHeight={RowDualInvestConfig.rowHeight}
        headerRowHeight={RowDualInvestConfig.rowHeaderHeight}
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
