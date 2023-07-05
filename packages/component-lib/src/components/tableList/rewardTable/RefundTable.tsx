import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import { EmptyValueTag, globalSetup, RowConfig } from '@loopring-web/common-resources'
import { Column, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps } from '@mui/material'
import moment from 'moment'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'

export type RefundRow = sdk.ReferSelf & {
  amount: { unit: string; value: string }
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

export const RefundTable = withTranslation(['tables', 'common'])(
  <R extends RefundRow>(
    props: {
      rawData: R[]
      pagination: {
        pageSize: number
        total: number
      }
      getList: (props: { limit: number; offset: number }) => void
      showloading: boolean
    } & WithTranslation,
  ) => {
    const { rawData, pagination, getList, showloading, t } = props

    const { isMobile } = useSettings()
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
        getList({
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
          key: 'time',
          name: t('labelRefundTableTime'),
          headerCellClass: 'textAlignLeft',
          cellClass: 'textAlignLeft',
          formatter: ({ row }) => {
            const renderValue = Number.isFinite(row.startAt)
              ? moment(new Date(row['time']), 'YYYYMMDDHHMM').fromNow()
              : EmptyValueTag
            return (
              <div className='rdg-cell-value textAlignRight'>
                <span>{renderValue}</span>
              </div>
            )
          },
        },
        {
          key: 'Rewards',
          name: t('labelRefundTableAmount'),
          headerCellClass: 'textAlignRight',
          cellClass: 'textAlignRight',
          formatter: ({ row }) => {
            // const value = row[column.key];
            const renderValue = `${row.amount} LRC`
            // const renderValue = `${getValuePrecisionThousand(valueFrom, undefined, undefined, precisionFrom)} ${keyFrom} \u2192 ${getValuePrecisionThousand(valueTo, precisionTo, precisionTo, precisionTo)} ${keyTo}`
            return <div className='rdg-cell-value'>{renderValue}</div>
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
      updateData({ currPage: 1 })
      return () => {
        updateData.cancel()
      }
    }, [pagination?.pageSize])
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
