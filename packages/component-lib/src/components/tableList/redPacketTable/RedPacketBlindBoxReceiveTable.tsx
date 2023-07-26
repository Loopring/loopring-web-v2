import styled from '@emotion/styled'
import { Box, Tooltip, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import {
  BoxNFT,
  Button,
  Column,
  NftImage,
  NftImageStyle,
  Table,
  TablePagination,
} from '../../basic-lib'
import {
  CoinInfo,
  DAY_MINUTE_FORMAT,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  myLog,
  RowConfig,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  RawDataRedPacketBlindBoxReceivesItem,
  RedPacketBlindBoxReceiveTableProps,
} from './Interface'
import React, { useEffect } from 'react'
import { FormatterProps } from 'react-data-grid'
import _, { random } from 'lodash'
import moment from 'moment'
import * as sdk from '@loopring-web/loopring-sdk'
import { ColumnCoinDeep } from '../assetsTable'
import TextTooltip from './textTooltip'
import { useTheme } from '@emotion/react'
import { redpacketService } from '@loopring-web/core'

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
`
const TableStyled = styled(Table)<{ isUnclaimed: boolean }>`
  &.rdg {
    --template-columns: 25% 25% 25% 25% !important;

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
const RowHeight = 55
export const RedPacketBlindBoxReceiveTable = withTranslation(['tables', 'common'])(
  <R extends RawDataRedPacketBlindBoxReceivesItem>(
    props: RedPacketBlindBoxReceiveTableProps<R> & WithTranslation,
  ) => {
    const {
      getRedPacketReceiveList,
      pagination,
      rawData,
      showloading,
      t,
      onItemClick,
      showActionableRecords,
      isUnclaimed,
    } = props
    const [page, setPage] = React.useState(1)
    const updateData = _.debounce(async ({ page = 1, filter = {} }: any) => {
      await getRedPacketReceiveList({
        offset: (page - 1) * (pagination?.pageSize ?? 10),
        limit: pagination?.pageSize ?? 10,
        filter: {
          ...filter,
          statuses: showActionableRecords
            ? [0] // 0 is for sdk.BlindBoxStatus.NOT_OPENED
            : undefined,
        },
      })
    }, globalSetup.wait)
    const theme = useTheme()

    const handlePageChange = React.useCallback(
      ({ page = 1 }: any) => {
        setPage(page)
        myLog('RedPacket Receive page,', page)
        updateData({
          page,
        })
      },
      [updateData],
    )
    React.useEffect(() => {
      updateData.cancel()
      handlePageChange({ page: 1 })
      return () => {
        updateData.cancel()
      }
    }, [showActionableRecords])
    const columnModeTransaction = [
      {
        key: 'Token',
        name: t('labelToken'),
        formatter: ({ row }: FormatterProps<R>) => {
          if (row.rawData.luckyToken.isNft) {
            const metadata = row.rawData.luckyToken.nftTokenInfo?.metadata
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
                  flex={1}
                  display={'inline-block'}
                  alignItems={'center'}
                  paddingLeft={1}
                  overflow={'hidden'}
                  textOverflow={'ellipsis'}
                  component={'span'}
                >
                  {metadata?.base?.name ?? 'NFT'}
                </Typography>
              </Box>
            )
          } else {
            const _token = row.token as CoinInfo<any> & { type: TokenType }
            return (
              <ColumnCoinDeep
                token={{
                  ..._token,
                  name: '', // for not displaying name here
                }}
              />
            )
          }
        },
      },
      {
        key: 'Amount',
        name: t('labelAmount'),
        formatter: ({ row }: FormatterProps<R>) => {
          const { token } = row
          if (token && token.type === TokenType.single) {
            const { decimals, precision } = token as unknown as {
              decimals: number
              precision: number
            }
            return (
              <>
                {row.rawData.claim.amount
                  ? getValuePrecisionThousand(
                      sdk.toBig(row.rawData.claim.amount).div('1e' + decimals),
                      precision,
                      precision,
                      precision,
                      false,
                    )
                  : EmptyValueTag}
              </>
            )
          } else {
            return <>{row.rawData.claim.amount ? row.rawData.claim.amount : EmptyValueTag}</>
          }
        },
      },
      {
        key: 'ReceiveTime',
        cellClass: 'textAlignRight',
        headerCellClass: 'textAlignRight',
        name: t('labelReceiveTime'),
        formatter: ({ row }: FormatterProps<R>) => {
          return <>{moment(new Date(row.claimAt), 'YYYYMMDDHHMM').fromNow()}</>
        },
      },
      {
        key: 'Status',
        cellClass: 'textAlignRight',
        headerCellClass: 'textAlignRight',
        name: t('labelRecordStatus'),
        formatter: ({ row }: FormatterProps<R>) => {
          if (row.rawData.luckyToken.validUntil > Date.now()) {
            return (
              <Tooltip
                title={
                  <>
                    {t('labelRedpacketCantOpen', {
                      time: moment(row.rawData.luckyToken.validUntil).format(
                        YEAR_DAY_MINUTE_FORMAT,
                      ),
                      interpolation: {
                        escapeValue: false,
                      },
                    })}
                  </>
                }
              >
                <span style={{ borderBottom: '1px dotted', marginRight: `${theme.unit * 2}px` }}>
                  {t('labelRedPacketOpen', { ns: 'common' })}
                </span>
              </Tooltip>
            )
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.OPENED) {
            return <>{t('labelBlindBoxOpend')}</>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.EXPIRED) {
            return <>{t('labelBlindBoxExpired')}</>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.NOT_OPENED) {
            return (
              <Box display={'flex'} flexDirection={'column'} alignItems={'end'}>
                <Button size={'small'} onClick={(_e) => {}} variant={'text'}>
                  {t('labelRedPacketOpen', { ns: 'common' })}
                </Button>
                <Typography>
                  {t('labelBlindBoxExpiredTime', {
                    time: moment(row.rawData.luckyToken.nftExpireTime).format(
                      YEAR_DAY_MINUTE_FORMAT,
                    ),
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                </Typography>
              </Box>
            )
          }
        },
      },
    ] as Column<R, unknown>[]
    const columnModeTransactionUnClaimed = [
      {
        key: 'Token',
        name: t('labelToken'),
        formatter: ({ row }: FormatterProps<R>) => {
          if (row.rawData.luckyToken.isNft) {
            const metadata = row.rawData.luckyToken.nftTokenInfo?.metadata
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
                  flex={1}
                  display={'inline-block'}
                  alignItems={'center'}
                  paddingLeft={1}
                  overflow={'hidden'}
                  textOverflow={'ellipsis'}
                  component={'span'}
                >
                  {metadata?.base?.name ?? 'NFT'}
                </Typography>
              </Box>
            )
          } else {
            const _token = row.token as CoinInfo<any> & { type: TokenType }
            return (
              <ColumnCoinDeep
                token={{
                  ..._token,
                  name: '', // for not displaying name here
                }}
              />
            )
          }
        },
      },
      {
        key: 'RevealTime',
        cellClass: 'textAlignRight',
        headerCellClass: 'textAlignRight',
        name: (
          <TextTooltip text={t('labelRevealTime')} tooltipTitle={t('labelRevealTimeTooltip')} />
        ),
        formatter: ({ row }: FormatterProps<R>) => {
          return (
            <>
              {moment(new Date(row.rawData.luckyToken.validUntil)).format(YEAR_DAY_MINUTE_FORMAT)}
            </>
          )
        },
      },

      {
        key: 'ExpiredTime',
        cellClass: 'textAlignRight',
        headerCellClass: 'textAlignRight',
        name: (
          <TextTooltip text={t('labelExpiredTime')} tooltipTitle={t('labelExpiredTimeTooltip')} />
        ),
        formatter: ({ row }: FormatterProps<R>) => {
          return (
            <>{moment(new Date(row.rawData.claim.expireTime)).format(YEAR_DAY_MINUTE_FORMAT)}</>
          )
        },
      },
      {
        key: 'Status',
        cellClass: 'textAlignRight',
        headerCellClass: 'textAlignRight',
        name: t('labelAction'),
        formatter: ({ row }: FormatterProps<R>) => {
          if (row.rawData.luckyToken.validUntil > Date.now()) {
            return (
              <Tooltip
                title={
                  <>
                    {t('labelRedpacketCantOpen', {
                      time: moment(row.rawData.luckyToken.validUntil).format(
                        YEAR_DAY_MINUTE_FORMAT,
                      ),
                      interpolation: {
                        escapeValue: false,
                      },
                    })}
                  </>
                }
              >
                <span style={{ borderBottom: '1px dotted', marginRight: `${theme.unit * 2}px` }}>
                  {t('labelRedPacketOpen', { ns: 'common' })}
                </span>
              </Tooltip>
            )
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.OPENED) {
            return <>{t('labelBlindBoxOpend')}</>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.EXPIRED) {
            return <>{t('labelBlindBoxExpired')}</>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.NOT_OPENED) {
            return (
              <Button size={'small'} onClick={(_e) => {}} variant={'text'}>
                {t('labelRedPacketOpen', { ns: 'common' })}
              </Button>
            )
          }
        },
      },
    ] as Column<R, unknown>[]
    const defaultArgs: any = {
      columnMode: isUnclaimed ? columnModeTransactionUnClaimed : columnModeTransaction,
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }
    
    const subject = React.useMemo(() => redpacketService.onRefresh(), [])
    React.useEffect(() => {
      const subscription = subject.subscribe(() => {
        updateData({page})
      })
      return () => {
        subscription.unsubscribe()
      }
    }, [subject, page])

    return (
      <TableWrapperStyled>
        <TableStyled
          isUnclaimed={isUnclaimed}
          currentheight={RowConfig.rowHeaderHeight + rawData.length * RowHeight}
          rowHeight={RowHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row.rawData, {
              offset: (page - 1) * (pagination?.pageSize ?? 10),
              limit: pagination?.pageSize ?? 10,
              filter: {
                statuses: showActionableRecords
                  ? [0] // 0 is for sdk.BlindBoxStatus.NOT_OPENED
                  : undefined,
              },
            })
          }}
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
                    return a.amount.localeCompare(b.amount)
                  })
                  break
                case 'Time':
                  resultRows = rawData.sort((a: R, b: R) => {
                    return b.claimAt - a.claimAt
                  })
                  break
                default:
              }
              return resultRows
            },
            [rawData],
          )}
          headerRowHeight={RowConfig.rowHeaderHeight}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
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
