import styled from '@emotion/styled'
import { Box, Tooltip, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import { BoxNFT, Column, NftImageStyle, Table, TablePagination } from '../../basic-lib'
import { CoinInfo, globalSetup, hexToRGB, myLog, RowConfig, SoursURL, TokenType } from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'

import {
  LuckyTokenItemStatusMap,
  RawDataRedPacketRecordsItem,
  RedPacketRecordsTableProps,
} from './Interface'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { FormatterProps } from 'react-data-grid'
import _ from 'lodash'
import moment from 'moment'
import { ColumnCoinDeep } from '../assetsTable'
import { useTheme } from '@emotion/react'

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
`
const TableStyled = styled(Table)<{ isBlindbox: boolean }>`
  &.rdg {
    --template-columns: ${({ isBlindbox }) =>
      isBlindbox ? '30% 25% 25% 20% !important' : '22% 12% 24% auto auto auto !important'};

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

export const RedPacketRecordTable = withTranslation(['tables', 'common'])(
  <R extends RawDataRedPacketRecordsItem>(
    props: RedPacketRecordsTableProps<R> & WithTranslation,
  ) => {
    const {
      getMyRedPacketRecordTxList,
      pagination,
      rawData,
      showloading,
      onItemClick,
      tokenType,
      tableType,
      t,
    } = props
    const history = useHistory()
    const [page, setPage] = React.useState(1)

    const updateData = _.debounce(async ({ page = 1, filter = {} }: any) => {
      await getMyRedPacketRecordTxList({
        offset: (page - 1) * (pagination?.pageSize ?? 10),
        limit: pagination?.pageSize ?? 10,
        filter,
      })
    }, globalSetup.wait)

    const handlePageChange = React.useCallback(
      ({ page = 1 }: any) => {
        setPage(page)
        myLog('AmmTable page,', page)
        updateData({
          page,
          filter: {
            isNft: tableType === 'NFT' ? true : tableType === 'token' ? false : undefined,
            modes: tableType === 'blindbox' ? 2 : [0, 1],
          },
        })
      },
      [updateData, tableType],
    )
    const theme = useTheme()
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Token',
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelRecordToken'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const {token} = row
            const blindBoxTag = (
              <Tooltip title={<>{t('labelRedpacketFromBlindbox')}</>}>
                <img
                  width={24}
                  height={24}
                  style={{ marginLeft: `${0.5 * theme.unit}px` }}
                  src={
                    theme.mode === 'dark'
                      ? sdk.SoursURL + '/images/from_blindbox_dark.png'
                      : sdk.SoursURL + '/images/from_blindbox_light.png'
                  }
                />
              </Tooltip>
            )
            const exclusiveTag = <Typography marginLeft={0.5} borderRadius={1} paddingX={0.5} bgcolor={hexToRGB(theme.colorBase.warning, 0.5)} color={'var(--color-warning)'}>Exclusive </Typography>
            if (token.type === TokenType.single) {
              const _token = token as CoinInfo<any> & { type: TokenType }
              return (
                <Box display={'flex'} alignItems={'center'} height={'100%'}>
                  <ColumnCoinDeep
                    token={{
                      ..._token,
                      name: '', // for not displaying name here
                    }}
                  />
                  {row.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && tableType !== 'blindbox' && blindBoxTag}
                  {row.type.scope === sdk.LuckyTokenViewType.TARGET && exclusiveTag}
                </Box>
              )
            } else {
              const { metadata } = token as sdk.UserNFTBalanceInfo
              return (
                <Box
                  className='rdg-cell-value'
                  height={'100%'}
                  display={'flex'}
                  alignItems={'center'}
                >
                  {metadata?.imageSize ? (
                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
                      {metadata?.imageSize && (
                        <NftImageStyle
                          src={metadata?.imageSize[sdk.NFT_IMAGE_SIZES.small]}
                          style={{
                            width: `${theme.unit * 3}px`,
                            height: `${theme.unit * 3}px`,
                            borderRadius: '4px',
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <BoxNFT
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      height={RowConfig.rowHeight + 'px'}
                      width={RowConfig.rowHeight + 'px'}
                    />
                  )}
                  <Typography
                    color={'inherit'}
                    display={'inline-flex'}
                    alignItems={'center'}
                    paddingLeft={1}
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                    component={'span'}
                  >
                    {metadata?.base?.name ?? 'NFT'}
                  </Typography>
                  {row.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && tableType !== 'blindbox' && blindBoxTag}
                  {row.type.scope === sdk.LuckyTokenViewType.TARGET && exclusiveTag}
                </Box>
              )
            }
          },
        },
        {
          key: 'Amount',
          name: t('labelRecordAmount'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row.totalAmount}</>
          },
        },
        ...(tableType !== 'blindbox'
          ? [
              {
                key: 'Type',
                name: t('labelRecordType'),
                formatter: ({ row }: FormatterProps<R, unknown>) => {
                  return (
                    <>
                      {t(
                        row.type.mode === sdk.LuckyTokenClaimType.RELAY
                          ? 'labelLuckyRelayToken'
                          : row.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                          ? 'labelLuckyBlindBox'
                          : row.type.partition === sdk.LuckyTokenAmountType.AVERAGE
                          ? 'labelRedPacketSendAverageTitle'
                          : 'labelRedPacketSenRandomTitle',

                        { ns: 'common' },
                      ) +
                        ' — ' +
                        t(`labelRedPacketViewType${row?.type?.scope ?? 0}`, {
                          ns: 'common',
                        })}
                    </>
                  )
                },
              },
            ]
          : []),

        {
          key: 'Status',
          name: t('labelRecordStatus'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const statusMap = [
              [0, t(`labelRedPacketStatusNotStarted`, { ns: 'common' })],
              [1, t(`labelRedPacketStatusNotStarted`, { ns: 'common' })],
              [2, t(`labelRedPacketStatusStarted`, { ns: 'common' })],
              [3, t(`labelRedPacketStatusEnded`, { ns: 'common' })],
              [4, t(`labelRedPacketStatusEnded`, { ns: 'common' })],
              [5, t(`labelRedPacketStatusEnded`, { ns: 'common' })],
            ] as [number, string][]
            const found = statusMap.find((x) => x[0] === LuckyTokenItemStatusMap[row.status])
            return <>{found ? found[1] : ''}</>
          },
        },
        ...(tableType !== 'blindbox'
          ? [
              {
                key: 'Number',
                sortable: true,
                cellClass: 'textAlignCenter',
                headerCellClass: 'textAlignCenter',
                name: t('labelRecordNumber'),
                formatter: ({ row }: FormatterProps<R, unknown>) => {
                  return <>{`${row.totalCount - row.remainCount}/${row.totalCount}`}</>
                },
              },
            ]
          : []),
        {
          key: 'Time',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelRecordTime'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{moment(new Date(row.createdAt), 'YYYYMMDDHHMM').fromNow()}</>
          },
        },
      ],
      [history, onItemClick, t],
    )
    React.useEffect(() => {
      updateData.cancel()
      handlePageChange({ page: 1 })
      // updateData({});
      return () => {
        updateData.cancel()
      }
    }, [tokenType, tableType])

    const defaultArgs: any = {
      columnMode: getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    return (
      <TableWrapperStyled>
        <TableStyled
          isBlindbox={tableType === 'blindbox'}
          currentheight={RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row.rawData)
          }}
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.rowHeaderHeight}
          sortMethod={React.useCallback(
            (_sortedRows, sortColumn) => {
              let resultRows: R[] = []
              switch (sortColumn) {
                case 'Token':
                  resultRows = rawData.sort((a: R, b: R) => {
                    if (a.token.type == TokenType.nft) {
                      return (a.token as any)?.metadata?.base?.name?.localeCompare(
                        (b.token as any)?.metadata?.base?.name,
                      )
                    } else {
                      return (a.token as any)?.simpleName.localeCompare(
                        (b.token as any)?.simpleName,
                      )
                    }
                  })
                  break
                case 'Amount':
                  resultRows = rawData.sort((a: R, b: R) => {
                    return a.totalAmount.localeCompare(b.totalAmount)
                  })
                  break
                case 'Number':
                  resultRows = rawData.sort((a: R, b: R) => {
                    return b.totalCount - a.totalCount
                  })
                  break
                case 'Time':
                  resultRows = rawData.sort((a: R, b: R) => {
                    return b.createdAt - a.createdAt
                  })
                  break
                default:
              }
              return resultRows
            },
            [rawData],
          )}
          {...{
            ...defaultArgs,
            ...props,
            rawData,
            showloading,
          }}
        />
        {!!(pagination && pagination.total) && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={(page) => handlePageChange({ page })}
          />
        )}
      </TableWrapperStyled>
    )
  },
)
