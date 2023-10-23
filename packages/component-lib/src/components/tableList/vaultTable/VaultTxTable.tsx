import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import { Column, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps, Tooltip, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'
import { RawDataVaultTxItem, VaultRecordType } from './Interface'
import {
  EmptyValueTag,
  globalSetup,
  Info2Icon,
  RowInvestConfig,
} from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import moment from 'moment/moment'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};

  & .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 33% 20% auto auto auto !important;`
        : `--template-columns: 33% 32% auto !important;`}
  }
`
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.ispro === 'pro') {
        return '620px'
      }
      if (props.currentheight && props.currentheight > 350) {
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

export interface VaultTxsTableProps<R> {
  rawData: R[]
  showloading: boolean
  onItemClick: (item: R) => void
  pagination: {
    pageSize: number
    total: number
  }
  getOrderList: (props: Omit<sdk.GetOrdersRequest, 'accountId'>) => Promise<any>
}

export const VaultTxTable = withTranslation(['tables', 'common'])(
  <R extends RawDataVaultTxItem>(props: VaultTxsTableProps<R> & WithTranslation) => {
    const { rawData, showloading, onItemClick, pagination, getOrderList, t } = props
    const [page, setPage] = React.useState(0)
    // const [_pageSize, setPageSize] = React.useState(pagination?.pageSize);

    const { isMobile, upColor } = useSettings()
    const history = useHistory()
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Type',
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelVaultTxType'),
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                paddingRight={3}
                alignItems={'center'}
                height={'100%'}
              >
                <Tooltip title={t(`labelVault${VaultRecordType.borrow}Des`).toString()}>
                  <Typography component={'span'} display={'flex'}>
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Typography>
                </Tooltip>
                <Typography component={'span'} display={'inline-flex'}>
                  {row
                    ? `${row.fromAmount} ${row.fromSymbol} -> ${row.toAmount} ${row.toSymbol}`
                    : EmptyValueTag}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Filled',
          name: t('labelVaultTxFailed'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row.filledPercent ? row.filledPercent + '%' : EmptyValueTag}</>
          },
        },
        {
          key: 'Price',
          name: t('labelVaultTxPrice'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <> {row.price?.value + ' ' + row.price?.key} </>
          },
        },
        {
          key: 'Fee',
          name: t('labelVaultTxFee'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {row.feeAmount !== undefined ? row.feeAmount + ' ' + row.feeSymbol : EmptyValueTag}
              </>
            )
          },
        },
        {
          key: 'Time',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelVaultTxTime'),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{moment(new Date(row.time)).fromNow()}</>
          },
        },
      ],
      [history, upColor, t],
    )
    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Type',
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelVaultTxType'),
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                paddingRight={3}
                flexDirection={'column'}
                alignItems={'flex-start'}
                height={'100%'}
              >
                <Tooltip title={t(`labelVault${VaultRecordType.borrow}Des`).toString()}>
                  <Typography component={'span'} display={'flex'}>
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Typography>
                </Tooltip>
                <Typography component={'span'} display={'flex'}>
                  {row
                    ? `${row.fromAmount} ${row.fromSymbol} -> ${row.toAmount} ${row.toSymbol}`
                    : EmptyValueTag}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Price',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelVaultTxPrice') + '/' + t('labelVaultTxFailed'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                paddingRight={3}
                flexDirection={'column'}
                alignItems={'flex-end'}
                height={'100%'}
              >
                <Typography component={'span'} display={'flex'}>
                  {row.price?.value + ' ' + row.price?.key}
                </Typography>
                <Typography component={'span'} display={'flex'} color={'textSecondary'}>
                  {row.filledPercent ? row.filledPercent + '%' : EmptyValueTag}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Fee',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelVaultTxFee') + '/' + t('labelVaultTxTime'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                paddingRight={3}
                flexDirection={'column'}
                alignItems={'flex-end'}
                height={'100%'}
              >
                <Typography component={'span'} display={'flex'}>
                  {row.feeAmount !== undefined
                    ? row.feeAmount + ' ' + row.feeSymbol
                    : EmptyValueTag}
                </Typography>

                <Typography component={'span'} display={'flex'} color={'textSecondary'}>
                  {moment(new Date(row.time)).fromNow()}
                </Typography>
              </Box>
            )
          },
        },
      ],
      [history, upColor, t],
    )
    const updateData = _.debounce(
      ({
        // tableType,
        currPage = page,
        pageSize = pagination.pageSize,
      }: {
        // tableType: TableType;
        currPage?: number
        pageSize?: number
      }) => {
        getOrderList({
          limit: pageSize,
          offset: (currPage - 1) * pageSize,
        })
      },
      globalSetup.wait,
    )
    const handlePageChange = React.useCallback(
      async (currPage: number) => {
        // if (currPage === page) return;
        setPage(currPage)
        updateData({ currPage: currPage })
      },
      [updateData],
    )

    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobileTransaction() : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }
    // React.useEffect(() => {
    //   updateData.cancel();
    //   handlePageChange(1);
    //   return () => {
    //     updateData.cancel();
    //   };
    // }, [pagination?.pageSize]);
    React.useEffect(() => {
      // setPageSize(pagination?.pageSize);
      updateData.cancel()
      handlePageChange(1)
      return () => {
        updateData.cancel()
      }
    }, [pagination?.pageSize])

    return (
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={
            RowInvestConfig.rowHeaderHeight + rawData.length * RowInvestConfig.rowHeight
          }
          rowHeight={RowInvestConfig.rowHeight}
          headerRowHeight={RowInvestConfig.rowHeaderHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row)
          }}
          // sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            ...props,

            rawData,
            showloading,
          }}
        />
        {pagination && !!rawData.length && (
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
