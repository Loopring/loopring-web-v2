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
  globalSetup,
  myLog,
  RowConfig,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import { RawDataRedPacketReceivesItem, RedPacketReceiveTableProps } from './Interface'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { FormatterProps } from 'react-data-grid'
import _ from 'lodash'
import moment from 'moment'
import { ColumnCoinDeep } from '../assetsTable'
import * as sdk from '@loopring-web/loopring-sdk'
import TextTooltip from './textTooltip'
import { useTheme } from '@emotion/react'

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
`
const TableStyled = styled(Table)<{ isUnClaimedNFT: boolean; isNFT: boolean }>`
  &.rdg {
    --template-columns: ${({ isUnClaimedNFT, isNFT }) =>
      isUnClaimedNFT
        ? '25% 25% 25% 25% !important'
        : isNFT
        ? '25% 25% 25% 25% !important'
        : '33% 33% 33% !important'};

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

export const RedPacketReceiveTable = withTranslation(['tables', 'common'])(
  <R extends RawDataRedPacketReceivesItem>(
    props: RedPacketReceiveTableProps<R> & WithTranslation,
  ) => {
    const {
      tokenType,
      getRedPacketReceiveList,
      pagination,
      rawData,
      showloading,
      t,
      onItemClick,
      onClaimItem,
      showActionableRecords,
      isUncliamedNFT,
    } = props
    // const { isMobile, upColor } = useSettings();
    const history = useHistory()
    const [page, setPage] = React.useState(1)

    const updateData = _.debounce(async ({ page = 1, filter = {} }: any) => {
      await getRedPacketReceiveList({
        offset: (page - 1) * (pagination?.pageSize ?? 12),
        limit: pagination?.pageSize ?? 12,
        filter: {
          ...filter,
          statuses: tokenType === TokenType.nft && showActionableRecords ? [0] : undefined,
        },
      })
    }, globalSetup.wait)

    const handlePageChange = React.useCallback(
      ({ page = 1 }: any) => {
        setPage(page)
        myLog('RedPacket Receive page,', page)
        updateData({
          page,
          filter: { isNft: tokenType === TokenType.nft },
        })
      },
      [updateData, tokenType],
    )
    React.useEffect(() => {
      updateData.cancel()
      handlePageChange({ page: 1 })
      return () => {
        updateData.cancel()
      }
    }, [tokenType, showActionableRecords])
    const theme = useTheme()

    const fromBlindboxTag = (
      <Tooltip title={<>{t('labelRedpacketFromBlindbox')}</>}>
        <img
          width={24}
          height={24}
          style={{ marginLeft: `${theme.unit}px` }}
          src={
            theme.mode === 'dark'
              ? sdk.SoursURL + '/images/from_blindbox_dark.png'
              : sdk.SoursURL + '/images/from_blindbox_light.png'
          }
        />
      </Tooltip>
    )
    const getColumnModeTransactionUnclaimedNFT = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Token',
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelToken'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const { token } = row
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
                  display={'inline-block'}
                  alignItems={'center'}
                  paddingLeft={1}
                  overflow={'hidden'}
                  textOverflow={'ellipsis'}
                  component={'span'}
                >
                  {metadata?.base?.name ?? 'NFT'}
                </Typography>
                {row.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && fromBlindboxTag}
              </Box>
            )
          },
        },
        {
          key: 'Amount',
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          name: t('labelAmount'),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{`${row.amount}`}</>
          },
        },
        {
          key: 'ExpiredTime',
          name: (
            <TextTooltip text={t('labelExpiredTime')} tooltipTitle={t('labelExpiredTimeTooltip')} />
          ),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>{moment(new Date(row.rawData.claim.expireTime)).format(YEAR_DAY_MINUTE_FORMAT)}</>
            )
          },
        },
        {
          key: 'Action',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: 'Action',
          formatter: ({ row }: FormatterProps<R>) => {
            if (row.rawData.claim.status === sdk.ClaimRecordStatus.WAITING_CLAIM) {
              return (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClaimItem(row.rawData)
                  }}
                >
                  {t('labelBlindBoxCalim')}
                </Button>
              )
            } else if (row.rawData.claim.status === sdk.ClaimRecordStatus.EXPIRED) {
              return <Box>{t('labelBlindBoxExpired')}</Box>
            } else if (row.rawData.claim.status === sdk.ClaimRecordStatus.CLAIMED) {
              return <Box>{t('labelBlindBoxClaimed')}</Box>
            } else {
              return <></>
            }
          },
        },
      ],
      [history, t, tokenType],
    )
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'Token',
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelToken'),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const { token } = row
            if (token.type === TokenType.single) {
              const _token = token as CoinInfo<any> & { type: TokenType }
              return (
                <Box height={'100%'} display={'flex'} alignItems={'center'}>
                  <ColumnCoinDeep
                    token={{
                      ..._token,
                      name: '', // for not displaying name here
                    }}
                  />
                  {row.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && fromBlindboxTag}
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
                    <Box
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      height={RowConfig.rowHeight + 'px'}
                      width={RowConfig.rowHeight + 'px'}
                      padding={1 / 4}
                    >
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
                    display={'inline-block'}
                    alignItems={'center'}
                    paddingLeft={1}
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                    component={'span'}
                  >
                    {metadata?.base?.name ?? 'NFT'}
                  </Typography>
                  {row.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && fromBlindboxTag}
                </Box>
              )
            }
          },
        },
        {
          key: 'Amount',
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          name: t('labelAmount'),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{`${row.amount}`}</>
          },
        },
        ...(tokenType === TokenType.nft
          ? [
              {
                key: 'Action',
                cellClass: 'textAlignRight',
                headerCellClass: 'textAlignRight',
                name: t('labelRecordStatus'),
                formatter: ({ row }: FormatterProps<R>) => {
                  if (row.rawData.claim.status === sdk.ClaimRecordStatus.WAITING_CLAIM) {
                    return (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          onClaimItem(row.rawData)
                        }}
                      >
                        {t('labelBlindBoxCalim')}
                      </Button>
                    )
                  } else if (row.rawData.claim.status === sdk.ClaimRecordStatus.EXPIRED) {
                    return <Box>{t('labelBlindBoxExpired')}</Box>
                  } else if (row.rawData.claim.status === sdk.ClaimRecordStatus.CLAIMED) {
                    return <Box>{t('labelBlindBoxClaimed')}</Box>
                  } else {
                    return <></>
                  }
                },
              },
            ]
          : []),
        {
          key: 'Time',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelReceiveTime'),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{moment(new Date(row.claimAt), 'YYYYMMDDHHMM').fromNow()}</>
          },
        },
      ],
      [history, t, tokenType],
    )

    const defaultArgs: any = {
      columnMode: isUncliamedNFT
        ? getColumnModeTransactionUnclaimedNFT()
        : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    return (
      <TableWrapperStyled>
        <TableStyled
          isUnClaimedNFT={isUncliamedNFT ? true : false}
          isNFT={tokenType === TokenType.nft}
          currentheight={RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight}
          rowHeight={RowConfig.rowHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row.rawData, () => {
              handlePageChange({ page })
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
