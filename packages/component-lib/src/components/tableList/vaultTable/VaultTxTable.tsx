import { WithTranslation, useTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import { Column, EmptyDefault, SpaceBetweenBox, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps, Button, Tooltip, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'
import { RawDataVaultTxItem, VaultRecordType } from './Interface'
import {
  DoneIcon,
  EmptyValueTag,
  FailedIcon,
  globalSetup,
  Info2Icon,
  LoadingIcon,
  RowInvestConfig,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
  hexToRGB,
  ErrorIcon
} from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'
import { RedeemDes2 } from '../../modal'
import { CoinIcons } from '../assetsTable'
import {
  CoinIcon,
} from '@loopring-web/component-lib'
import { useTheme } from '@mui/material'

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};

  & .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 16% 38% auto auto auto !important;`
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
    const { rawData, showloading, pagination, getOrderList, t } = props
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
            const isForcedCloseOut =
              ((row.raw_data.operation.operateSubType as string) === 'VAULT_FORCE_SETTLEMENT' ||
                (row.raw_data.operation.operateSubType as string) === 'VAULT_FORCE_WITHDRAW') &&
              row.type === VaultRecordType.closeout

            return (
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                paddingRight={3}
                alignItems={'center'}
                height={'100%'}
              >
                <Typography component={'span'} display={'flex'} alignItems={'center'}>
                  {isForcedCloseOut ? t(`labelVaultcloseoutForced`) : t(`labelVault${row.type}`)}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Filled',
          name: t('labelVaultTxFilled'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row.mainContentRender}</>
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
                  `${
                    row.type === VaultRecordType.trade &&
                    row.status !== sdk.VaultOperationStatus.VAULT_STATUS_FAILED
                      ? '(' + row.percentage + '%)'
                      : ''
                  }`}
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
        {
          key: 'Action',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: 'Action',
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <Button variant={'text'} onClick={() => props.onItemClick(row)}>
                {t('labelDetail')}
              </Button>
            )
          },
        },
      ],
      [t, props],
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
                <Typography component={'span'} display={'flex'}>
                  {t(`labelVault${row.type}`)}
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
                {row.mainContentRender}
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
                    `${
                      row.type === VaultRecordType.trade &&
                      row.status !== sdk.VaultOperationStatus.VAULT_STATUS_FAILED
                        ? '(' + row.percentage + '%)'
                        : ''
                    }`}
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
          onRowClick={(_, row) => {
            props.onItemClick(row)
          }}
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
          justifyContent={'center'}
          width={'100%'}
          alignItems={'center'}
        >
          {vaultCloseDetail.statusType === 'failed' ? (
            <FailedIcon style={{ color: 'var(--color-error)', width: 64, height: 64 }} />
          ) : vaultCloseDetail.statusType === 'processing' ? (
            <LoadingIcon color={'primary'} style={{ width: 64, height: 64 }} />
          ) : (
            <DoneIcon
              style={{
                color: 'var(--color-success)',
                width: 64,
                height: 64,
              }}
            />
          )}
          <Typography
            marginTop={2}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
          >
            {vaultCloseDetail.statusLabel}
          </Typography>
        </Box>
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
            <Typography display={'flex'} flexDirection={'row'} alignItems={'center'} variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultExitCloseAmount')}
            </Typography>
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
              <CoinIcon
                tokenImageKey={vaultCloseDetail.tokenSymbol}
                symbol={vaultCloseDetail.tokenSymbol}
                type={TokenType.single}
              />
              <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
                {vaultCloseDetail?.amount}
              </Typography>
            </Box>
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

export const VaultOperationDetail = (props: {
  statusColor: string
  statusLabel: string
  statusType: "success" | "processing" | "failed"
  time: number
  type: 'VAULT_BORROW' | 'VAULT_MARGIN_CALL' | 'VAULT_REPAY' | 'VAULT_OPEN_POSITION' | 'VAULT_JOIN_REDEEM'
  amount: string
  amountSymbol: string
}) => {
  const { coinJson } = useSettings()
  const { statusColor, statusLabel, time, type, statusType, amount, amountSymbol } = props
  const { t } = useTranslation()
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        width={'100%'}
        alignItems={'center'}
      >
        {statusType === 'failed' ? (
          <FailedIcon style={{ color: 'var(--color-error)', width: 64, height: 64 }} />
        ) : statusType === 'processing' ? (
          <LoadingIcon color={'primary'} style={{ width: 64, height: 64 }} />
        ) : (
          <DoneIcon
            style={{
              color: 'var(--color-success)',
              width: 64,
              height: 64,
            }}
          />
        )}
        <Typography
          marginTop={2}
          variant={'body1'}
          component={'span'}
          color={'var(--color-text-primary)'}
        >
          {statusLabel}
        </Typography>
      </Box>
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
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
          order={9}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {t('labelType')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {type === 'VAULT_OPEN_POSITION'
              ? t('labelVaultJoin')
              : type === 'VAULT_MARGIN_CALL'
              ? t('labelVaultMarginCall')
              : type === 'VAULT_BORROW'
              ? t('labelVaultBorrow')
              : type === 'VAULT_JOIN_REDEEM'
              ? t('labelVaultJoinRedeem')
              : t('labelVaultRepay')}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
          order={9}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {t('labelVaultStatus')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={statusColor}>
            {statusLabel}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
          order={9}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {type === 'VAULT_BORROW' || type === 'VAULT_REPAY'
              ? t('labelVaultAmount')
              : t('labelVaultCollateral')}
          </Typography>
          <Typography
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
          >
            {amount ? (
              <>
                <CoinIcons
                  size='small'
                  type={(type === 'VAULT_MARGIN_CALL' || type === 'VAULT_OPEN_POSITION') ? TokenType.single : TokenType.vault}
                  tokenIcon={[coinJson[amountSymbol], undefined]}
                />{' '}
                <Typography marginLeft={(type === 'VAULT_MARGIN_CALL' || type === 'VAULT_OPEN_POSITION') ? 0.5 : 0}>{amount} {amountSymbol}</Typography>
              </>
            ) : (
              EmptyValueTag
            )}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          order={10}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {t('labelVaultTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {time && moment(time).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
    </Box>
  )
}

export const VaultTradeDetail = withTranslation(['common'])(
  (
    props: {
      statusColor: string
      statusLabel: string
      statusType: "success" | "processing" | "failed"
      fromSymbol: string
      toSymbol: string
      placedAmount: string
      executedAmount: string
      executedRate: string
      convertedAmount: string
      price: string
      feeSymbol: string
      feeAmount: string
      time: number
    } & WithTranslation,
  ) => {
    const {
      statusColor,
      statusLabel,
      statusType,
      fromSymbol,
      toSymbol,
      placedAmount,
      executedAmount,
      executedRate,
      convertedAmount,
      price,
      feeSymbol,
      feeAmount,
      time,
    } = props
    const { coinJson } = useSettings()
    const { t } = useTranslation()
    return (
      <Box flex={1} display={'flex'} flexDirection={'column'}>
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          width={'100%'}
          alignItems={'center'}
        >
          {statusType === 'failed' ? (
            <FailedIcon style={{ color: 'var(--color-error)', width: 64, height: 64 }} />
          ) : statusType === 'processing' ? (
            <LoadingIcon color={'primary'} style={{ width: 64, height: 64 }} />
          ) : (
            <DoneIcon
              style={{
                color: 'var(--color-success)',
                width: 64,
                height: 64,
              }}
            />
          )}
          <Typography
            marginTop={2}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
          >
            {statusLabel}
          </Typography>
        </Box>
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
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelType')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {t('labelVaultSwap')}
            </Typography>
          </Typography>
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultStatus')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={statusColor}>
              {statusLabel}
            </Typography>
          </Typography>
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography display={'flex'} alignItems={'center'} variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultPlacedAmount')}
              <Tooltip title={<>{t('labelVaultPlacedAmountTip')}</>}>
                <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                  <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
                </Typography>
              </Tooltip>
            </Typography>
            <Typography
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              variant={'body1'}
              component={'span'}
              color={'var(--color-text-primary)'}
            >
              <CoinIcons
                size='small'
                type={TokenType.vault}
                tokenIcon={[coinJson[fromSymbol], undefined]}
              />{' '}
              {placedAmount} {fromSymbol}
            </Typography>
          </Typography>
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography display={'flex'} alignItems={'center'} variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultExecutedAmount')}
              <Tooltip title={<>{t("labelVaultExecutedAmountTip")}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
            </Typography>
            <Typography
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              variant={'body1'}
              component={'span'}
              color={'var(--color-text-primary)'}
            >
              <CoinIcons
                size='small'
                type={TokenType.vault}
                tokenIcon={[coinJson[fromSymbol], undefined]}
              />{' '}
              {executedAmount} {fromSymbol}
            </Typography>
          </Typography>
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultExecutedRate')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {executedRate}
            </Typography>
          </Typography>
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography display={'flex'} alignItems={'center'} variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultConvertedAmount')}
              <Tooltip title={<>{t("labelVaultConvertedAmountTip")}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
            </Typography>

            <Typography
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              variant={'body1'}
              component={'span'}
              color={'var(--color-text-primary)'}
            >
              <CoinIcons
                size='small'
                type={TokenType.vault}
                tokenIcon={[coinJson[toSymbol], undefined]}
              />{' '}
              {convertedAmount} {toSymbol}
            </Typography>
          </Typography>
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultPrice')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {price}
            </Typography>
          </Typography>
          <Typography
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            component={'span'}
            order={9}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultTxFee')}
            </Typography>

            <Typography
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              variant={'body1'}
              component={'span'}
              color={'var(--color-text-primary)'}
            >
              <CoinIcons
                size='small'
                type={TokenType.vault}
                tokenIcon={[coinJson[feeSymbol], undefined]}
              />{' '}
              {feeAmount} {feeSymbol}
            </Typography>
          </Typography>
          <Typography
            component={'span'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
            order={10}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('labelVaultTime')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {time && moment(time).format(YEAR_DAY_MINUTE_FORMAT)}
            </Typography>
          </Typography>
        </Box>
      </Box>
    )
  },
)

type VaultConvertDetailProps = {
  totalValueInCurrency: string
  convertedInUSDT: string
  repaymentInUSDT?: string
  time: number
  dusts: {
    symbol: string
    coinJSON: any
    amount: string
    valueInCurrency: string
  }[]
  status: 'success' | 'processing' | 'failed'
}

export const VaultConvertDetail = (props: VaultConvertDetailProps) => {
  const { totalValueInCurrency, convertedInUSDT, repaymentInUSDT, time, dusts, status } = props
  const theme = useTheme()
  const { t } = useTranslation()
  const iconDiv = React.useMemo(() => {
    switch (status) {
      case 'failed':
        return (
          <Box
            width={'100%'}
            marginBottom={2}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <FailedIcon style={{ color: 'var(--color-error)', width: 64, height: 64 }} />
            <Typography marginTop={1}>{t('labelVaultVAULT_STATUS_FAILED')}</Typography>
          </Box>
        )
      case 'success':
        return (
          <Box
            width={'100%'}
            marginBottom={2}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <DoneIcon
              style={{
                color: 'var(--color-success)',
                width: 64,
                height: 64,
              }}
            />
            <Typography marginTop={1}>{t('labelVaultVAULT_STATUS_SUCCEED')}</Typography>
          </Box>
        )
      case 'processing':
        return (
          <Box
            width={'100%'}
            marginBottom={2}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <LoadingIcon color={'primary'} style={{ width: 64, height: 64 }} />
            <Typography marginTop={1}>{t('labelVaultVAULT_STATUS_PROCESSING')}</Typography>
          </Box>
        )
    }
  }, [status])
  return (
    <Box
      justifySelf={'stretch'}
      display={'flex'}
      flexDirection={'column'}
      width={'100%'}
      justifyContent={'center'}
      marginTop={2}
      paddingX={3}
    >
      {iconDiv}
      <Box borderRadius={'8px'} bgcolor={'var(--color-box-secondary)'} paddingX={2.5} paddingY={1}>
        <SpaceBetweenBox
          leftNode={
            <Typography color={'var(--color-text-third)'}>{t('labelTotalValue')}</Typography>
          }
          rightNode={<Typography>{totalValueInCurrency}</Typography>}
          marginBottom={2}
        />
        <SpaceBetweenBox
          leftNode={
            <Typography color={'var(--color-text-third)'}>{t('labelVaultConvert')}</Typography>
          }
          rightNode={<Typography>{convertedInUSDT ? convertedInUSDT + ' USDT' : '--'} </Typography>}
          marginBottom={2}
        />
        {status === 'success' && (
          <SpaceBetweenBox
            leftNode={
              <Typography color={'var(--color-text-third)'}>{t('labelVaultRepayment')}</Typography>
            }
            rightNode={
              <Typography>{repaymentInUSDT ? repaymentInUSDT + ' USDT' : '--'} </Typography>
            }
            marginBottom={2}
          />
        )}
        <SpaceBetweenBox
          leftNode={
            <Typography color={'var(--color-text-third)'}>{t('labelVaultTime')}</Typography>
          }
          rightNode={
            <Typography>{time ? moment(time).format(YEAR_DAY_MINUTE_FORMAT) : '--'}</Typography>
          }
        />
      </Box>
      <Typography marginTop={0.5} marginBottom={1.5}>
        {t('labelDetails')}
      </Typography>
      <Box marginBottom={2}>
        {dusts &&
          dusts.map((dust) => {
            return (
              <SpaceBetweenBox
                borderRadius={'8px'}
                border={'1px solid var(--color-border)'}
                paddingY={1.5}
                paddingX={2}
                marginBottom={1}
                alignItems={'center'}
                key={dust.symbol}
                leftNode={
                  <Box alignItems={'center'} display={'flex'}>
                    <CoinIcons type={TokenType.vault} tokenIcon={[dust.coinJSON]} />
                    <Typography marginLeft={1}>{dust.symbol}</Typography>
                  </Box>
                }
                rightNode={
                  <Box display={'flex'} alignItems={'center'}>
                    <Box marginRight={1}>
                      <Typography textAlign={'right'}>{dust.amount}</Typography>
                      <Typography
                        color={'var(--color-text-secondary)'}
                        textAlign={'right'}
                        variant={'subtitle2'}
                      >
                        {dust.valueInCurrency}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            )
          })}
      </Box>
      {status === 'failed' && (
        <Box
          borderRadius={'8px'}
          display={'flex'}
          alignItems={'center'}
          paddingX={2.5}
          paddingY={1.5}
          bgcolor={hexToRGB(theme.colorBase.error, 0.2)}
        >
          <ErrorIcon sx={{ color: 'var(--color-error)', marginRight: 1 / 2 }} />
          <Typography>{t('labelVaultErrorOccurred')}</Typography>
        </Box>
      )}
    </Box>
  )
}

