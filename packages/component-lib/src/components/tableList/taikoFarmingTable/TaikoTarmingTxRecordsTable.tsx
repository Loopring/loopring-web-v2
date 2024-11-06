import _ from 'lodash'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import {
  EmptyValueTag,
  getShortAddr,
  getValuePrecisionThousand,
  globalSetup,
} from '@loopring-web/common-resources'
import { Column, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'
import { RawDataTaikoFarmingTxItem, TaikoFarmingTxTableProps } from './Interface'
import * as sdk from '@loopring-web/loopring-sdk'
import moment from 'moment'

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 30% 40% 30% !important;`
        : `--template-columns: 20% 45% 35% !important;`}
    .rdgCellCenter {
      height: 100%;
      justify-content: center;
      align-items: center;
    }

    .textAlignRight {
      text-align: right;
    }

    .textAlignCenter {
      text-align: center;
    }

    .textAlignLeft {
      text-align: left;
    }
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element

export const TaikoTarmingTxRecordsTable = withTranslation(['tables', 'common'])(
  <R extends RawDataTaikoFarmingTxItem>(
    props: TaikoFarmingTxTableProps<R> & WithTranslation,
  ) => {
    const { rawData, idIndex, pagination, tokenMap, getSideStakingTxList, showloading, t } = props
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
        getSideStakingTxList({
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

    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Type',
          sortable: false,
          width: 'auto',
          name: t('labelDefiStakingTxType'),
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          formatter: ({ row }) => {
            let side = {
              color: 'var(--color-text-primary)',
              // @ts-ignore
              type: `labelStakeTransactionType${row.stakingType}`,
            }
            const tokenInfo = tokenMap[idIndex[row.tokenId ?? '']]
            const amountStr = row.amount
              ? getValuePrecisionThousand(
                  sdk.toBig(row.amount).div('1e' + tokenInfo.decimals),
                  tokenInfo.precision,
                  tokenInfo.precision,
                  undefined,
                  false,
                  {
                    floor: false,
                    // isTrade: true,
                  },
                ) +
                ' ' +
                tokenInfo.symbol
              : EmptyValueTag
            // alert(JSON.stringify(row))
            switch (row.stakingType) {
              case sdk.StakeTransactionType.subscribe:
                side = {
                  color: 'var(--color-success)',
                  type: 'labelLock',
                }
                break
              case sdk.StakeTransactionType.redeem:
                side = {
                  ...side,
                  color: 'var(--color-success)',
                }
                break
              case sdk.StakeTransactionType.claim:
                side = {
                  ...side,
                  color: 'var(--color-success)',
                }
                break
            }

            return (
              <Typography
                component={'span'}
                flexDirection={'row'}
                display={'flex'}
                height={'100%'}
                alignItems={'center'}
              >
                <Typography
                  component={'span'}
                  sx={{ textTransform: 'capitalize' }}
                  color={side.color}
                  display={'inline'}
                  minWidth={86}
                >
                  {t(side.type)}
                </Typography>
                <Typography component={'span'} display={'inline'}>
                  {amountStr}
                </Typography>
              </Typography>
            )
          },
        },
        {
          key: 'HashID',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          name: 'Hash',
          formatter: ({ row }) => {
            return <>{row.hash ? getShortAddr(row.hash) : EmptyValueTag}</>
          },
        },
        {
          key: 'SubscribeTime',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelLockTime'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography component={'span'} textAlign={'right'}>
                {typeof row.createdAt === 'undefined'
                  ? EmptyValueTag
                  : moment(new Date(row.createdAt), 'YYYYMMDDHHMM').fromNow()}
              </Typography>
            )
          },
        },
      ],
      [t, tokenMap, idIndex],
    )

    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Type',
          sortable: false,
          width: 'auto',
          name: t('labelDefiStakingTxType'),
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          formatter: ({ row }) => {
            let side = {
              color: 'var(--color-text-primary)',
              // @ts-ignore
              type: `labelStakeTransactionType${row.stakingType}`,
            }
            // @ts-ignore
            switch (row.stakingType) {
              case sdk.StakeTransactionType.subscribe:
                side = {
                  ...side,
                  color: 'var(--color-success)',
                }
                break
              case sdk.StakeTransactionType.redeem:
                side = {
                  ...side,
                  color: 'var(--color-error)',
                }
                break
              case sdk.StakeTransactionType.claim:
                side = {
                  ...side,
                  color: 'var(--color-warning)',
                }
                break
            }

            return (
              <Typography
                component={'span'}
                flexDirection={'row'}
                display={'flex'}
                height={'100%'}
                alignItems={'center'}
              >
                <Typography
                  component={'span'}
                  sx={{ textTransform: 'capitalize' }}
                  color={side.color}
                  display={'inline'}
                  minWidth={86}
                >
                  {t(side.type)}
                </Typography>
              </Typography>
            )
          },
        },
        {
          key: 'Product',
          sortable: false,
          width: 'auto',
          name: t('labelDefiStakingTxAmount'),
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const tokenInfo = tokenMap[idIndex[row.tokenId ?? '']]
            const amountStr =
              row.amount && row.amount != '0'
                ? getValuePrecisionThousand(
                    sdk.toBig(row.amount).div('1e' + tokenInfo.decimals),
                    tokenInfo.precision,
                    tokenInfo.precision,
                    undefined,
                    false,
                    {
                      floor: false,
                      // isTrade: true,
                    },
                  ) +
                  ' ' +
                  tokenInfo.symbol
                : EmptyValueTag
            return (
              <Box
                display={'flex'}
                height={'100%'}
                width={'100%'}
                alignItems={'center'}
              >
                <Typography textAlign={'right'} width={'100%'}>
                  {amountStr}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'SubscribeTime',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelLockTime'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography component={'span'} textAlign={'right'}>
                {typeof row.createdAt === 'undefined'
                  ? EmptyValueTag
                  : moment(new Date(row.createdAt), 'YYYYMMDDHHMM').fromNow()}
              </Typography>
            )
          },
        },
      ],
      [t, tokenMap, idIndex],
    )


    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobileTransaction() : getColumnModeTransaction(),
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
      <TableStyled isMobile={isMobile}>
        <Table
          {...{
            ...defaultArgs,
            ...props,
            rawData,
            showloading,
          }}
        />
        {pagination && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    )
  },
)
