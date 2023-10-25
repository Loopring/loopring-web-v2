import React from 'react'
import styled from '@emotion/styled'
import { Box, BoxProps, Link, Typography } from '@mui/material'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import moment from 'moment'
import { BoxNFT, Column, NftImage, Table, TablePagination } from '../../basic-lib'
import {
  CompleteIcon,
  DepositIcon,
  DirectionTag,
  EmptyValueTag,
  EXPLORE_TYPE,
  Explorer,
  getFormattedHash,
  getShortAddr,
  getValuePrecisionThousand,
  L1L2_NAME_DEFINED,
  MapChainId,
  MintIcon,
  RedPacketIcon,
  RowConfig,
  TransferIcon,
  WaitingIcon,
  WarningIcon,
  WithdrawIcon,
} from '@loopring-web/common-resources'
import { TableFilterStyled, TablePaddingX } from '../../styled'

import { NFTTableFilter, NFTTableProps, TsTradeStatus, TxnDetailProps } from './Interface'
import { Filter } from './components/Filter'
import { NFT_IMAGE_SIZES, TxNFTType } from '@loopring-web/loopring-sdk'
import { useSettings } from '../../../stores'
import { sanitize } from 'dompurify'

const TYPE_COLOR_MAPPING = [
  { type: TsTradeStatus.processed, color: 'success' },
  { type: TsTradeStatus.processing, color: 'warning' },
  { type: TsTradeStatus.received, color: 'warning' },
  { type: TsTradeStatus.failed, color: 'error' },
]

const CellStatus = ({ row: { status } }: any) => {
  const RenderValue = styled.div`
    display: flex;
    align-items: center;
    color: ${({ theme }) =>
      theme.colorBase[`${TYPE_COLOR_MAPPING.find((o) => o.type === status)?.color}`]};

    & svg {
      width: 24px;
      height: 24px;
    }
  `
  const svg =
    status === 'processed' ? (
      <CompleteIcon color={'success'} />
    ) : status === 'processing' || status === 'received' ? (
      <WaitingIcon color={'warning'} />
    ) : (
      <WarningIcon color={'error'} />
    )
  const RenderValueWrapper = <RenderValue>{svg}</RenderValue>
  return RenderValueWrapper
}

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      isMobile
        ? `--template-columns: 60% 40% !important;`
        : `--template-columns: 20% 15% 20% 15% 20% 10% !important;`}
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

export const TsNFTTable = withTranslation(['tables', 'common'])(
  <Row extends TxnDetailProps>({
    accAddress,
    showFilter = true,
    rawData,
    page,
    pagination,
    txType,
    getTxnList,
    duration,
    showloading,
    etherscanBaseUrl,
    accountId,
    t,
    ...props
  }: NFTTableProps<Row> & WithTranslation) => {
    const [isDropDown, setIsDropDown] = React.useState(true)
    const { isMobile, defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const handleFilterChange = (filter: Partial<NFTTableFilter>) => {
      getTxnList({
        page: filter.page ?? page,
        txType:
          filter.txType !== undefined
            ? // @ts-ignore
              filter.txType == 0
              ? undefined
              : filter.txType
            : txType,
        duration: filter.duration ?? duration,
      })
    }

    const getColumnModeTransaction = React.useCallback(
      (): Column<Row, Row>[] => [
        {
          key: 'side',
          name: t('labelTxSide'),
          formatter: ({ row }) => {
            return (
              <Box className='rdg-cell-value' title={row.nftTxType} display={'flex'}>
                {row.metadata?.imageSize ? (
                  <Box
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    height={RowConfig.rowHeight + 'px'}
                    width={RowConfig.rowHeight + 'px'}
                    padding={1 / 4}
                    style={{ background: 'var(--field-opacity)' }}
                  >
                    {row.metadata?.imageSize && (
                      <NftImage
                        alt={sanitize(row.metadata?.name ?? EmptyValueTag)}
                        onError={() => undefined}
                        src={row.metadata?.imageSize[NFT_IMAGE_SIZES.small]}
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
                  display={'inline-flex'}
                  alignItems={'center'}
                  paddingLeft={1}
                >
                  {t(`labelNFTType${TxNFTType[row.nftTxType]}`)}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'amount',
          name: t('labelTxAmount'),
          headerCellClass: 'textAlignLeft',
          formatter: ({ row }: { row: Row }) => {
            const hasSymbol =
              row.nftTxType === TxNFTType[TxNFTType.TRANSFER]
                ? row?.receiverAddress?.toLowerCase().trim() === accAddress?.toLowerCase().trim()
                  ? '+'
                  : '-'
                : row.nftTxType === TxNFTType[TxNFTType.DEPOSIT] ||
                  row.nftTxType === TxNFTType[TxNFTType.MINT]
                ? '+'
                : row.nftTxType === TxNFTType[TxNFTType.WITHDRAW]
                ? '-'
                : // @ts-ignore
                row.nftTxType === TxNFTType[TxNFTType.SEND_LUCKY_TOKEN]
                ? '-'
                : // @ts-ignore
                row.nftTxType === TxNFTType[TxNFTType.SEND_BACK_LUCKY_TOKEN]
                ? '+'
                : // @ts-ignore
                row.nftTxType === TxNFTType[TxNFTType.WITHDRAW_LUCKY_TOKEN]
                ? '+'
                : ''
            return (
              <>
                <Typography variant={'body1'} component={'span'} marginRight={1}>
                  {hasSymbol}
                  {row.amount ?? EmptyValueTag}
                </Typography>
                <Typography variant={'body1'} component={'span'}>
                  {getFormattedHash(row.nftData)}
                </Typography>
              </>
            )
          },
        },
        {
          key: 'from',
          name: t('labelTxFrom'),
          headerCellClass: 'textAlignRight',
          cellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const receiverAddress =
              row.nftTxType === TxNFTType[TxNFTType.WITHDRAW]
                ? getShortAddr(row.withdrawalInfo.recipient, isMobile)
                : getShortAddr(row.receiverAddress, isMobile)
            const senderAddress = getShortAddr(row.senderAddress)
            const [from, to] =
              row.nftTxType === TxNFTType[TxNFTType.TRANSFER]
                ? row.receiverAddress?.toLowerCase().trim() === accAddress?.toLowerCase().trim()
                  ? [senderAddress, `${L1L2_NAME_DEFINED[network].l2Symbol}`]
                  : [`${L1L2_NAME_DEFINED[network].l2Symbol}`, receiverAddress]
                : row.nftTxType === TxNFTType[TxNFTType.DEPOSIT]
                ? [
                    `${L1L2_NAME_DEFINED[network].l1Symbol}`,
                    `${L1L2_NAME_DEFINED[network].l2Symbol}`,
                  ]
                : row.nftTxType === TxNFTType[TxNFTType.MINT]
                ? [
                    `${L1L2_NAME_DEFINED[network].l2Symbol} Mint`,
                    `${L1L2_NAME_DEFINED[network].l2Symbol}`,
                  ]
                : row.nftTxType === TxNFTType[TxNFTType.WITHDRAW]
                ? [`${L1L2_NAME_DEFINED[network].l2Symbol}`, receiverAddress]
                : // @ts-ignore
                row.nftTxType === TxNFTType[TxNFTType.SEND_BACK_LUCKY_TOKEN]
                ? [
                    `${L1L2_NAME_DEFINED[network].l2Symbol} Red Packet`,
                    `${L1L2_NAME_DEFINED[network].l2Symbol}`,
                  ]
                : // @ts-ignore
                row.nftTxType === TxNFTType[TxNFTType.SEND_LUCKY_TOKEN]
                ? [
                    `${L1L2_NAME_DEFINED[network].l2Symbol}`,
                    `${L1L2_NAME_DEFINED[network].l2Symbol} Red Packet`,
                  ]
                : // @ts-ignore
                row.nftTxType === TxNFTType[TxNFTType.WITHDRAW_LUCKY_TOKEN]
                ? [
                    `${L1L2_NAME_DEFINED[network].l2Symbol} Red Packet`,
                    `${L1L2_NAME_DEFINED[network].l2Symbol}`,
                  ]
                : ['', '']
            const hash = row.txHash !== '' ? row.txHash : row.hash
            let path =
              row.txHash !== ''
                ? etherscanBaseUrl + `/tx/${row.txHash}`
                : Explorer +
                  `tx/${row.hash}-${EXPLORE_TYPE['NFT' + row.nftTxType.toUpperCase()]}-${
                    row.storageInfo.accountId
                  }-${row.storageInfo.tokenId}-${row.storageInfo.storageId}`
            return (
              <Box
                className='rdg-cell-value textAlignRight'
                display={'inline-flex'}
                justifyContent={'flex-end'}
                alignItems={'center'}
              >
                <Link
                  style={{
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                  }}
                  target='_blank'
                  rel='noopener noreferrer'
                  href={path}
                  title={hash}
                >
                  {from && to ? from + ` ${DirectionTag} ` + to : ''}
                </Link>
                <Box marginLeft={1}>
                  <CellStatus {...{ row }} />
                </Box>
              </Box>
            )
          },
        },
        {
          key: 'fee',
          name: t('labelTxNetworkFee'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const fee = row['fee'] ?? {}
            const renderValue = `${getValuePrecisionThousand(
              fee.value,
              undefined,
              undefined,
              undefined,
              false,
              {
                floor: false,
                isTrade: true,
              },
            )} ${fee.unit}`
            return <Box className='rdg-cell-value textAlignRight'>{renderValue}</Box>
          },
        },
        {
          key: 'memo',
          name: t('labelTxMemo'),
          headerCellClass: 'textAlignCenter',
          formatter: ({ row }) => (
            <Box
              title={row.memo}
              className='rdg-cell-value textAlignCenter'
              dangerouslySetInnerHTML={{
                __html: sanitize(row?.memo ?? EmptyValueTag) ?? '',
              }}
            />
          ),
        },
        {
          key: 'time',
          name: t('labelTxTime'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const value = row.updatedAt
            const hasValue = Number.isFinite(value)
            const renderValue = hasValue
              ? moment(new Date(value), 'YYYYMMDDHHMM').fromNow()
              : EmptyValueTag
            return <Box className='rdg-cell-value textAlignRight'>{renderValue}</Box>
          },
        },
      ],
      [etherscanBaseUrl],
    )

    const getColumnMobileTransaction = React.useCallback(
      (): Column<any, unknown>[] => [
        {
          key: 'amount',
          name: (
            <Typography
              height={'100%'}
              display={'flex'}
              justifyContent={'space-between'}
              variant={'inherit'}
              color={'inherit'}
              alignItems={'center'}
            >
              <span>{t('labelTransactions')}</span>
              <span>{t('labelTxAmount') + ' / ' + t('labelTxNetworkFee')}</span>
            </Typography>
          ),
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          formatter: ({ row }) => {
            // const hasValue = Number.isFinite(row.amount);
            let side, hasSymbol, sideIcon
            switch (row.nftTxType) {
              case TxNFTType[TxNFTType.DEPOSIT]:
                side = t('labelReceive')
                hasSymbol = '+'
                sideIcon = <DepositIcon fontSize={'inherit'} />
                break
              case TxNFTType[TxNFTType.TRANSFER]:
                side = t('labelSendL2')
                hasSymbol =
                  row.receiverAddress?.toLowerCase() === accAddress?.toLowerCase() ? '+' : '-'
                sideIcon = <TransferIcon fontSize={'inherit'} />
                break
              case TxNFTType[TxNFTType.MINT]:
                side = t('labelMint')
                sideIcon = <MintIcon fontSize={'inherit'} />
                hasSymbol = '+'
                break
              // @ts-ignore
              case TxNFTType[TxNFTType.SEND_LUCKY_TOKEN]:
                side = t('labelNFTTypeSEND_LUCKY_TOKEN')
                sideIcon = <RedPacketIcon fontSize={'inherit'} />
                hasSymbol = '-'
                break
              // @ts-ignore
              case TxNFTType[TxNFTType.SEND_BACK_LUCKY_TOKEN]:
                side = t('labelNFTTypeSEND_BACK_LUCKY_TOKEN')
                sideIcon = <RedPacketIcon fontSize={'inherit'} />
                hasSymbol = '+'
                break
              // @ts-ignore
              case TxNFTType[TxNFTType.WITHDRAW_LUCKY_TOKEN]:
                side = t('labelNFTTypeWITHDRAW_LUCKY_TOKEN')
                sideIcon = <RedPacketIcon fontSize={'inherit'} />
                hasSymbol = '+'
                break
              case TxNFTType[TxNFTType.WITHDRAW]:
              default:
                hasSymbol = '-'
                sideIcon = <WithdrawIcon fontSize={'inherit'} />
                side = t('labelSendL1')
            }
            // const renderValue = hasValue ? row.amount : EmptyValueTag;

            const renderFee = `Fee: ${getValuePrecisionThousand(
              row.fee.value,
              undefined,
              undefined,
              undefined,
              false,
              {
                floor: false,
                isTrade: true,
              },
            )} ${row.fee.unit}`
            return (
              <Box
                flex={1}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                title={side}
              >
                {/*{side + " "}*/}
                <Typography
                  display={'flex'}
                  marginRight={1}
                  variant={'h3'}
                  alignItems={'center'}
                  flexDirection={'column'}
                  width={'60px'}
                >
                  <Typography
                    fontSize={20}
                    width={'60px'}
                    justifyContent={'center'}
                    display={'inline-flex'}
                    alignItems={'center'}
                  >
                    {row.metadata?.imageSize ? (
                      <BoxNFT
                        display={'flex'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        height={24 + 'px'}
                        width={24 + 'px'}
                      >
                        <img height={24} src={row.metadata?.imageSize[NFT_IMAGE_SIZES.small]} />
                      </BoxNFT>
                    ) : (
                      sideIcon
                    )}
                  </Typography>
                  <Typography fontSize={10} marginTop={0}>
                    {side}
                  </Typography>
                </Typography>
                <Box display={'flex'} flex={1} flexDirection={'column'}>
                  <Typography
                    display={'inline-flex'}
                    justifyContent={'flex-end'}
                    alignItems={'center'}
                  >
                    {hasSymbol}
                    {row.amount ?? EmptyValueTag}
                  </Typography>
                  <Typography color={'textSecondary'} variant={'body2'}>
                    {renderFee}
                  </Typography>
                </Box>
              </Box>
            )
          },
        },
        {
          key: 'from',
          name: t('labelTxFrom') + ' / ' + t('labelTxTime'),
          headerCellClass: 'textAlignRight',
          cellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const receiverAddress =
              row.nftTxType === TxNFTType[TxNFTType.WITHDRAW]
                ? getShortAddr(row.withdrawalInfo.recipient, isMobile)
                : getShortAddr(row.receiverAddress, isMobile)

            const senderAddress = getShortAddr(row.senderAddress, isMobile)

            const [from, to] =
              row.nftTxType === TxNFTType[TxNFTType.TRANSFER]
                ? row.receiverAddress?.toLowerCase() === accAddress?.toLowerCase()
                  ? [senderAddress, `${L1L2_NAME_DEFINED[network].l2Symbol}`]
                  : [`${L1L2_NAME_DEFINED[network].l2Symbol}`, receiverAddress]
                : row.nftTxType === TxNFTType[TxNFTType.DEPOSIT]
                ? [
                    `${L1L2_NAME_DEFINED[network].l1Symbol}`,
                    `${L1L2_NAME_DEFINED[network].l2Symbol}`,
                  ]
                : row.nftTxType === TxNFTType[TxNFTType.MINT]
                ? ['Mint', `${L1L2_NAME_DEFINED[network].l2Symbol}`]
                : row.nftTxType === TxNFTType[TxNFTType.WITHDRAW]
                ? [`${L1L2_NAME_DEFINED[network].l2Symbol}`, receiverAddress]
                : ['', '']
            const hash = row.txHash !== '' ? row.txHash : row.hash
            const path =
              row.txHash !== ''
                ? etherscanBaseUrl + `/tx/${row.txHash}`
                : Explorer + `tx/${row.hash}-${EXPLORE_TYPE[row.nftTxType.toUpperCase()]}`

            const hasValue = Number.isFinite(row.updatedAt)
            const renderTime = hasValue
              ? moment(new Date(row.updatedAt), 'YYYYMMDDHHMM').fromNow()
              : EmptyValueTag

            return (
              <Box
                display={'flex'}
                flex={1}
                flexDirection={'column'}
                onClick={() => {
                  window.open(path, '_blank')
                  window.opener = null
                }}
              >
                <Typography
                  display={'inline-flex'}
                  justifyContent={'flex-end'}
                  alignItems={'center'}
                >
                  <Typography
                    style={{
                      cursor: 'pointer',
                    }}
                    color={'var(--color-primary)'}
                    title={hash}
                  >
                    {from + ` ${DirectionTag} ` + to}
                    {/*{hash ? getFormattedHash(hash) : EmptyValueTag}*/}
                  </Typography>
                  <Typography marginLeft={1}>
                    <CellStatus {...{ row }} />
                  </Typography>
                </Typography>
                <Typography color={'textSecondary'} variant={'body2'}>
                  {renderTime}
                </Typography>
              </Box>
            )
          },
        },
      ],
      [etherscanBaseUrl, isMobile, t],
    )
    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobileTransaction() : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    return (
      <TableStyled isMobile={isMobile}>
        {showFilter &&
          (isMobile && isDropDown ? (
            <Link
              variant={'body1'}
              display={'inline-flex'}
              width={'100%'}
              justifyContent={'flex-end'}
              paddingRight={2}
              onClick={() => setIsDropDown(false)}
            >
              {t('labelShowFilter')}
            </Link>
          ) : (
            <TableFilterStyled>
              <Filter
                {...{
                  rawData,
                  handleFilterChange,
                  filterType: txType,
                  filterDate: duration,
                }}
              />
            </TableFilterStyled>
          ))}
        <Table className={'scrollable'} {...{ ...defaultArgs, ...props, rawData, showloading }} />
        {!!(accountId && showFilter) && (
          <Typography
            display={'flex'}
            justifyContent={'flex-end'}
            textAlign={'right'}
            paddingRight={5 / 2}
            paddingY={1}
          >
            <Trans i18nKey={'labelGoExplore'} ns={'common'}>
              View transactions on
              <Link
                display={'inline-flex'}
                target='_blank'
                rel='noopener noreferrer'
                href={Explorer + `/account/${accountId}`}
                paddingLeft={1 / 2}
              >
                block explorer
              </Link>
            </Trans>
          </Typography>
        )}

        {!!(pagination && pagination.total) && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={(page) => {
              handleFilterChange({ page })
            }}
          />
        )}
      </TableStyled>
    )
  },
)
