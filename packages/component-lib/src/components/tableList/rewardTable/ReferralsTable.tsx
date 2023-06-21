import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import {
  EmptyValueTag,
  getShortAddr,
  globalSetup,
  RowConfig,
  YEAR_DAY_FORMAT,
} from '@loopring-web/common-resources'
import { Column, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps, Typography } from '@mui/material'
import moment from 'moment'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'

export type ReferralsRow = sdk.ReferDownsides & {
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

export const ReferralsTable = withTranslation(['tables', 'common'])(
  <R extends ReferralsRow>(
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
          name: t('labelReferralsTableTime'),
          headerCellClass: 'textAlignLeft',
          cellClass: 'textAlignLeft',
          formatter: ({ row }) => {
            return (
              <>
                {Number.isFinite(row.startAt)
                  ? moment(new Date(row.startAt), 'YYYYMMDDHHMM').format(YEAR_DAY_FORMAT)
                  : EmptyValueTag}
              </>
            )
          },
        },
        {
          key: 'referee',
          name: t('labelReferralsTableReferee'),
          headerCellClass: 'textAlignCenter',
          cellClass: 'textAlignCenter',
          formatter: ({ row }) => {
            return (
              <Typography component={'span'} color={'inherit'} title={row.address}>
                {getShortAddr(row.address)}
              </Typography>
            )
          },
        },
        {
          key: 'Rewards',
          name: t('labelReferralsTableAmount'),
          headerCellClass: 'textAlignRight',
          cellClass: 'textAlignRight',
          formatter: ({ row }) => {
            return (
              <>
                {row.amount?.value} {row.amount?.unit}
              </>
            )
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
