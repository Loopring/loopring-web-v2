import styled from '@emotion/styled'
import * as sdk from '@loopring-web/loopring-sdk'
import { Table } from '@loopring-web/component-lib'
import { RowDualInvestConfig } from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { Column } from 'react-data-grid'

const TableStyled = styled(Table)<{ isMobile: boolean }>`
  &.rdg {
    --template-columns: '18% auto 18% 18% 20% !important';

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
}

export const DualTxTable = withTranslation(['tables', 'common'])(
  <R extends any>(props: DualsTableProps<R> & WithTranslation) => {
    const { rawData, showloading, t } = props
    const history = useHistory()

    const defaultArgs: any = {
      columnMode: [
        {
          key: 'product',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Product',
          formatter: ({ row }) => row.product,
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
          name: 'Current Price',
          formatter: ({ row }) => row.currentPrice,
        },
        {
          key: 'investAmount',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'InvestAmount',
          formatter: ({ row }) => row.investAmount,
        },
        {
          key: 'settledAmount',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'Amount to be settled',
          formatter: ({ row }) => row.settledAmount,
        },
        {
          key: 'received',
          sortable: true,
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: 'To be received',
          formatter: ({ row }) => row.recieved,
        },
        {
          key: 'supplied',
          sortable: true,
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: 'To be supplied',
          formatter: ({ row }) => row.supplied,
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
