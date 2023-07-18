import _ from 'lodash'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import {
  DirectionTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
} from '@loopring-web/common-resources'
import { Column, Table, TablePagination } from '../../basic-lib'
import { Box, BoxProps, Typography } from '@mui/material'
import moment from 'moment'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'
import * as sdk from '@loopring-web/loopring-sdk'
import { DefiTxsTableProps, RawDataDefiTxsItem } from './Interface'

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: auto 20% 180px !important;`
        : `--template-columns: 100% !important;`}
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

export const DefiTxsTable = withTranslation(['tables', 'common'])(
  <R extends RawDataDefiTxsItem>(props: DefiTxsTableProps<R> & WithTranslation) => {
    const { rawData, idIndex, pagination, tokenMap, getDefiTxList, showloading, t } = props
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
        getDefiTxList({
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
          key: 'style',
          sortable: false,
          width: 'auto',
          minWidth: 240,
          name: t('labelDefiType') + ' ' + t('labelDefiAmount'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const { action, sellToken, buyToken } = row
            const isJoin = !new RegExp(sdk.DefiAction.Withdraw, 'ig').test(action ?? ' ')
            const sellTokenInfo =
              sellToken?.tokenId !== undefined && tokenMap[idIndex[sellToken?.tokenId]]
            const sellVolume = sdk.toBig(sellToken?.volume ?? 0).div('1e' + sellTokenInfo.decimals)
            const buyTokenInfo =
              buyToken?.tokenId !== undefined && tokenMap[idIndex[buyToken?.tokenId]]
            const buyVolume = sdk.toBig(buyToken?.volume ?? 0).div('1e' + buyTokenInfo.decimals)
            const side = isJoin ? t('labelDefiJoin') : t('labelDefiExit')
            return (
              <Box display={'flex'} alignItems={'center'}>
                <Typography color={isJoin ? 'var(--color-success)' : 'var(--color-error)'}>
                  {side}
                </Typography>
                &nbsp;&nbsp;
                <Typography component={'span'}>
                  {`${getValuePrecisionThousand(
                    sellVolume,
                    sellTokenInfo?.precision,
                    sellTokenInfo?.precision,
                    sellTokenInfo?.precision,
                    false,
                    { isTrade: true, floor: false },
                  )} ${sellTokenInfo.symbol}`}
                </Typography>
                &nbsp;{DirectionTag} &nbsp;
                <Typography component={'span'}>
                  {`${getValuePrecisionThousand(
                    buyVolume,
                    buyTokenInfo?.precision,
                    buyTokenInfo?.precision,
                    buyTokenInfo?.precision,
                    false,
                    { isTrade: true, floor: false },
                  )} ${buyTokenInfo.symbol}`}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'fee',
          name: t('labelTxNetworkFee'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const { fee } = row
            const feeTokenInfo = tokenMap[idIndex[fee?.tokenId ?? '']]
            const renderValue =
              fee?.volume == '0' || fee?.volume === undefined
                ? EmptyValueTag
                : `${getValuePrecisionThousand(
                    sdk.toBig(fee?.volume).div('1e' + feeTokenInfo.decimals),
                    feeTokenInfo?.precision,
                    feeTokenInfo?.precision,
                    feeTokenInfo?.precision,
                    false,
                    { isTrade: false, floor: false },
                  )} ${feeTokenInfo.symbol}`
            return <Box className='rdg-cell-value textAlignRight'>{renderValue}</Box>
          },
        },
        {
          key: 'time',
          sortable: false,
          width: 'auto',
          headerCellClass: 'textAlignRight',
          cellClass: 'textAlignRight',
          name: t('labelDefiTime'),
          formatter: ({ row }) => {
            const { updatedAt: time } = row
            let timeString
            if (typeof time === 'undefined') {
              timeString = EmptyValueTag
            } else {
              timeString = moment(new Date(time), 'YYYYMMDDHHMM').fromNow()
            }
            return (
              <Typography component={'span'} textAlign={'right'}>
                {timeString}
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
          key: 'side',
          name: (
            <Typography
              height={'100%'}
              display={'flex'}
              justifyContent={'space-between'}
              variant={'inherit'}
              color={'inherit'}
              alignItems={'center'}
            >
              <span>{t('labelDefiType')}</span>
              <span>{t('labelDefiTime') + '/' + t('labelTxNetworkFee')}</span>
            </Typography>
          ),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const { action, sellToken, buyToken } = row
            const isJoin = !new RegExp(sdk.DefiAction.Withdraw, 'ig').test(action ?? ' ')
            const sellTokenInfo =
              sellToken?.tokenId !== undefined && tokenMap[idIndex[sellToken?.tokenId]]
            const sellVolume = sdk.toBig(sellToken?.volume ?? 0).div('1e' + sellTokenInfo.decimals)
            const buyTokenInfo =
              buyToken?.tokenId !== undefined && tokenMap[idIndex[buyToken?.tokenId]]
            const buyVolume = sdk.toBig(buyToken?.volume ?? 0).div('1e' + buyTokenInfo.decimals)
            const side = isJoin ? t('labelDefiJoin') : t('labelDefiExit')
            const { fee } = row
            const feeTokenInfo = tokenMap[idIndex[fee?.tokenId ?? '']]
            const feeVolume = sdk
              .toBig(fee?.volume ?? 0)
              .div('1e' + feeTokenInfo.decimals)
              .toNumber()
            const renderFee =
              feeVolume === 0 || feeVolume === undefined
                ? EmptyValueTag
                : `${getValuePrecisionThousand(
                    feeVolume,
                    feeTokenInfo?.precision,
                    feeTokenInfo?.precision,
                    feeTokenInfo?.precision,
                    false,
                    { isTrade: false, floor: false },
                  )} ${feeTokenInfo.symbol}`
            const { updatedAt: time } = row
            let timeString
            if (typeof time === 'undefined') {
              timeString = EmptyValueTag
            } else {
              timeString = moment(new Date(time), 'YYYYMMDDHHMM').fromNow()
            }
            return (
              <Box
                display={'flex'}
                alignItems={'stretch'}
                justifyContent={'center'}
                flexDirection={'column'}
                height={'100%'}
              >
                <Typography
                  component={'span'}
                  display={'flex'}
                  flexDirection={'row'}
                  variant={'body2'}
                  justifyContent={'space-between'}
                >
                  <Typography color={isJoin ? 'var(--color-success)' : 'var(--color-error)'}>
                    {side}
                  </Typography>
                  &nbsp;
                  <Typography component={'span'}>
                    <Typography component={'span'}>
                      {`${getValuePrecisionThousand(
                        sellVolume,
                        sellTokenInfo?.precision,
                        sellTokenInfo?.precision,
                        sellTokenInfo?.precision,
                        false,
                        { isTrade: false, floor: false },
                      )} ${sellTokenInfo.symbol}`}
                    </Typography>
                    &nbsp;{DirectionTag} &nbsp;
                    <Typography component={'span'}>
                      {`${getValuePrecisionThousand(
                        buyVolume,
                        buyTokenInfo?.precision,
                        buyTokenInfo?.precision,
                        buyTokenInfo?.precision,
                        false,
                        { isTrade: false, floor: false },
                      )} ${buyTokenInfo.symbol}`}
                    </Typography>
                  </Typography>
                </Typography>
                <Typography
                  component={'span'}
                  display={'flex'}
                  flexDirection={'row'}
                  variant={'body2'}
                  justifyContent={'space-between'}
                >
                  <Typography
                    variant={'inherit'}
                    component={'span'}
                    color={'textSecondary'}
                    alignSelf={'flex-end'}
                  >
                    {`Fee: ${renderFee}`}
                  </Typography>
                  <Typography component={'span'} textAlign={'right'} variant={'inherit'}>
                    {timeString}
                  </Typography>
                </Typography>
              </Box>
            )
          },
        },
      ],
      [t, tokenMap, idIndex],
    )

    // const [isDropDown, setIsDropDown] = React.useState(true);

    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobileTransaction() : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }
    React.useEffect(() => {
      // let filters: any = {};
      updateData.cancel()
      updateData({ currPage: 1 })
      // handlePageChange(1);
      // if (searchParams.get("types")) {
      //   filters.type = searchParams.get("types");
      // }
      // handleFilterChange(filters);
      return () => {
        updateData.cancel()
      }
    }, [pagination?.pageSize])

    return (
      <TableStyled isMobile={isMobile}>
        <Table
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
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
