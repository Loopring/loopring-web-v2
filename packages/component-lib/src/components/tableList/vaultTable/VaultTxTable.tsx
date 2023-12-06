import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import { Column, EmptyDefault, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps, IconButton, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'
import { RawDataVaultTxItem, VaultRecordType } from './Interface'
import { globalSetup, RecordIcon, RowInvestConfig } from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import moment from 'moment/moment'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'
import { RedeemDes2 } from '../../modal'

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};

  & .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 16% 48% auto auto !important;`
        : `--template-columns: 16% 40% auto !important;`}
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
                <Typography component={'span'} display={'flex'} alignItems={'center'}>
                  {t(`labelVault${row.type}`)}
                  {row.type === VaultRecordType.closeout &&
                  [sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED, 'VAULT_STATUS_EARNING'].includes(
                    row.status,
                  ) ? (
                    <IconButton
                      sx={{ marginLeft: 1, color: 'var(--color-primary)' }}
                      onClick={() => props.onItemClick(row)}
                    >
                      <RecordIcon color={'inherit'} />
                    </IconButton>
                  ) : (
                    <></>
                  )}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Filled',
          name: t('labelVaultTxFilled'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {row.mainContentRender +
                  (row.feeStr
                    ? `; ${t('labelTradeFee')}: ${row.feeStr} ${row.feeTokenSymbol}`
                    : '')}
              </>
            )
          },
        },
        {
          key: 'status',
          name: t('labelVaultTxStatus'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const color = [
              sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
              'VAULT_STATUS_EARNING',
            ].includes(row.status)
              ? 'var(--color-success)'
              : [
                  sdk.VaultOperationStatus.VAULT_STATUS_PENDING,
                  sdk.VaultOperationStatus.VAULT_STATUS_PROCESSING,
                ].includes(row.status)
              ? 'var(--color-primary)'
              : row.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
              ? 'var(--color-error)'
              : 'var(--color-text-primary)'
            return (
              <Typography
                variant={'body1'}
                display={'inline-flex'}
                justifyContent={'center'}
                alignItems={'center'}
                color={color}
              >
                {t(`labelVault${row.status}`) +
                  `${row.type === VaultRecordType.trade ? '(' + row.percentage + '%)' : ''}`}
              </Typography>
            )
          },
        },
        {
          key: 'Time',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelVaultTxTime'),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{moment(row?.raw_data?.operation?.createdAt).fromNow()}</>
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
                alignItems={'center'}
                height={'100%'}
              >
                {/*<Tooltip title={t(`labelVault${row.type}Des`).toString()}>*/}
                <Typography component={'span'} display={'flex'}>
                  {/*<Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />*/}
                  {t(`labelVault${row.type}`)}
                </Typography>
                {/*</Tooltip>*/}
              </Box>
            )
          },
        },
        {
          key: 'Filled',
          name: t('labelVaultTxFilled'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {row.mainContentRender + row.feeStr
                  ? `fee: ${row.feeStr} ${row.feeTokenSymbol}`
                  : ''}
              </>
            )
          },
        },
        {
          key: 'statusTime',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',

          name: t('labelVaultTxStatus') + '/' + t('labelVaultTxTime'),
          formatter: ({ row }: FormatterProps<R>) => {
            const color =
              row.status === sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
                ? 'var(--color-success)'
                : row.status === sdk.VaultOperationStatus.VAULT_STATUS_PENDING
                ? 'var(--color-primary)'
                : row.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
                ? 'var(--color-error)'
                : 'var(--color-text-primary)'
            return (
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                paddingRight={3}
                alignItems={'center'}
                height={'100%'}
              >
                <Typography
                  component={'span'}
                  color={color}
                  variant={'body1'}
                  display={'inline-flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  {t(`labelVault${row.status}`) +
                    `${row.type === VaultRecordType.trade ? '(' + row.percentage + '%)' : ''}`}
                </Typography>
                <Typography>{moment(row?.raw_data?.order?.createdAt).fromNow()}</Typography>
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
export const VaultCloseDetail = withTranslation(['common'])(
  <R extends RawDataVaultTxItem>({
    t,
    vaultCloseDetail,
  }: {
    vaultCloseDetail: R & any
  } & WithTranslation) => {
    return (
      <Box flex={1} display={'flex'} flexDirection={'column'}>
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'stretch'}
          justifyContent={'space-between'}
          padding={2}
          margin={2}
          borderRadius={1 / 2}
          sx={{
            background: 'var(--field-opacity)',
          }}
        >
          <RedeemDes2 t={t} isNoWrap={true} info={{ ...vaultCloseDetail }} />
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultExitCloseAmount')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {vaultCloseDetail?.amount}
            </Typography>
          </Typography>
        </Box>
        {
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'stretch'}
            justifyContent={'space-between'}
            padding={2}
            margin={2}
            borderRadius={1 / 2}
            sx={{
              background: 'var(--field-opacity)',
            }}
          >
            <Typography component={'p'} variant={'h5'} color={'var(--color-text-secondary)'}>
              {t('labelVaultRedeemDetail')}
            </Typography>
            {vaultCloseDetail?.executionHistory.length ? (
              vaultCloseDetail?.executionHistory?.map((item, index) => {
                return (
                  <Typography
                    key={index}
                    variant={'body1'}
                    component={'p'}
                    display={'inline-flex'}
                    justifyContent={'space-between'}
                    marginTop={2}
                    color={'var(--color-text-primary)'}
                  >
                    {item}
                  </Typography>
                )
              })
            ) : (
              <Box flex={1} height={'100%'} width={'100%'}>
                <EmptyDefault
                  style={{ alignSelf: 'center' }}
                  height={'100%'}
                  message={() => (
                    <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                      {t('labelNoContent')}
                    </Box>
                  )}
                />
              </Box>
            )}
          </Box>
        }
      </Box>
    )
  },
)
