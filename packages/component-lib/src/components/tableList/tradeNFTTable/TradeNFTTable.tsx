import React from 'react'
import { Box, BoxProps, Link, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, Trans, withTranslation, WithTranslation } from 'react-i18next'
import moment from 'moment'

import { BoxNFT, Column, NftImage, Table, TablePagination } from '../../basic-lib'
import { TableFilterStyled, TablePaddingX } from '../../styled'
import { Filter, FilterTradeTypes } from './components/Filter'

import {
  EmptyValueTag,
  Explorer,
  getShortAddr,
  getValuePrecisionThousand,
  globalSetup,
  RowConfig,
  TableType,
  UNIX_TIMESTAMP_FORMAT,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import * as sdk from '@loopring-web/loopring-sdk'
import { Currency, NFT_IMAGE_SIZES } from '@loopring-web/loopring-sdk'
import _ from 'lodash'
import { FilterTradeNFTTypes, NFTTradeProps } from './Interface'
import { DateRange } from '@mui/lab'

const StyledSideCell: any = styled(Typography)`
  color: ${(props: any) => {
    const {
      value,
      theme: { colorBase },
    } = props
    return value === FilterTradeNFTTypes.sell ? colorBase.success : colorBase.error
  }};
`

const TableStyled = styled(Box)<
  BoxProps & {
    isMobile?: boolean
    currentheight?: number
  }
>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${(props: any) => props.currentheight}px;

    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 50% auto 20% auto  !important; `
        : ` --template-columns: 70% 30% !important;`}
    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .rdg-header-row {
      // background-color: inherit !important;
    }

    .textAlignRight {
      text-align: right;
    }
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (
  props: {
    isMobile?: boolean
    currentheight?: number
  } & BoxProps,
) => JSX.Element

const getColumnModeAssets = (
  t: TFunction,
  _currency: Currency,
  tokenMap: any,
  accountId: number,
  filterType: FilterTradeNFTTypes,
): Column<sdk.UserNFTTradeHistory, unknown>[] => {
  return [
    {
      key: 'side',
      name: t('labelTradeNFTSide'),
      formatter: ({ row }) => {
        let { nftAmount, metadata, bInfo, sInfo } = row
        metadata = {
          ...metadata,
          ...metadata?.base,
        }
        let tradeType, fromAddr
        if (filterType === FilterTradeNFTTypes.buy && bInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.buy
          fromAddr = sInfo.address
        } else if (filterType === FilterTradeNFTTypes.sell && sInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.sell
          fromAddr = bInfo.address
        } else if (sInfo.accountId === accountId && bInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.self
          fromAddr = ''
        } else if (bInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.buy
          fromAddr = sInfo.address
        } else {
          tradeType = FilterTradeNFTTypes.sell
          fromAddr = bInfo.address
        }
        // const amount = Number(nftAmount ?? 0);// getValuePrecisionThousand( Number(nftAmount??0) , 0, 0, 0);
        return (
          <Box className='rdg-cell-value' height={'100%'} display={'flex'} alignItems={'center'}>
            {metadata?.imageSize ? (
              <Box
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                height={RowConfig.rowHeight + 'px'}
                width={RowConfig.rowHeight + 'px'}
                padding={1 / 4}
                style={{ background: 'var(--field-opacity)' }}
              >
                {metadata?.imageSize && (
                  <NftImage
                    alt={metadata?.base?.name}
                    onError={() => undefined}
                    src={metadata?.imageSize[NFT_IMAGE_SIZES.small]}
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
              overflow={'hidden'}
              textOverflow={'ellipsis'}
              component={'span'}
            >
              <StyledSideCell value={tradeType} marginRight={1}>
                {tradeType === FilterTradeNFTTypes.buy
                  ? t('labelFilterTradeNFTBuy')
                  : tradeType === FilterTradeNFTTypes.self
                  ? t('labelFilterTradeNFTSelf')
                  : t('labelFilterTradeNFTSell')}
              </StyledSideCell>
              <span>
                {`${Number(nftAmount)} * ${
                  metadata?.base?.name ? metadata?.base?.name : t('labelUnknown', { ns: 'common' })
                } ${
                  tradeType === FilterTradeNFTTypes.buy
                    ? t('labelFrom')
                    : tradeType === FilterTradeNFTTypes.sell
                    ? t('labelTo')
                    : ''
                } ${fromAddr && getShortAddr(fromAddr)}`}
              </span>
            </Typography>
          </Box>
        )
      },
    },
    {
      key: 'price',
      name: t('labelTradeNFTUnitPrice'),
      headerCellClass: 'textAlignRight',
      formatter: ({ row }) => {
        // const {value} = row[ "price" ];
        let { price, feeTokenSymbol } = row
        let erc20Info = tokenMap[feeTokenSymbol]
        // const precision = row[ "precision" ] || 6;
        const renderValue = price
          ? getValuePrecisionThousand(
              price,
              undefined,
              undefined,
              erc20Info?.precision ?? undefined,
              true,
              { isPrice: true },
            ) +
            ' ' +
            erc20Info.symbol
          : EmptyValueTag
        return <Box className='rdg-cell-value textAlignRight'>{renderValue}</Box>
      },
    },
    {
      key: 'fee',
      name: t('labelTradeFee'),
      headerCellClass: 'textAlignRight',
      formatter: ({ row }) => {
        let { sInfo, bInfo, feeTokenSymbol } = row
        let feeAmount

        if (filterType == FilterTradeNFTTypes.sell && sInfo.accountId === accountId) {
          feeAmount = sInfo.feeAmount
        } else if (filterType == FilterTradeNFTTypes.buy && bInfo.accountId === accountId) {
          feeAmount = bInfo.feeAmount
        } else if (bInfo.accountId === accountId && sInfo.accountId === accountId) {
          feeAmount = sdk.toBig(bInfo.feeAmount).plus(sInfo.feeAmount)
        } else if (bInfo.accountId === accountId) {
          feeAmount = bInfo.feeAmount
        } else {
          feeAmount = sInfo.feeAmount
        }
        let feeTokenInfo = tokenMap[feeTokenSymbol]
        const fee = feeAmount
          ? sdk
              .toBig(feeAmount ?? 0)
              .div('1e' + feeTokenInfo.decimals)
              .toString()
          : undefined
        const renderValue = fee
          ? getValuePrecisionThousand(
              fee,
              feeTokenInfo?.precision ?? undefined,
              feeTokenInfo?.precision ?? undefined,
              feeTokenInfo?.precision ?? undefined,
              true,
              { isPrice: true },
            ) +
            ' ' +
            feeTokenInfo.symbol
          : EmptyValueTag
        // return (
        // const {key, value} = row[ "fee" ];
        // myLog({value})
        return <div className='rdg-cell-value textAlignRight'>{`${renderValue}`}</div>
      },
    },
    {
      key: 'time',
      name: t('labelTradeTime'),
      headerCellClass: 'textAlignRight',
      // minWidth: 400,
      formatter: ({ row }) => {
        const time = moment(new Date(row.createdAt), 'YYYYMMDDHHMM').fromNow()
        return <div className='rdg-cell-value textAlignRight'>{time}</div>
      },
    },
  ]
}

const getColumnModeMobileAssets = (
  t: TFunction,
  _currency: Currency,
  tokenMap: any,
  accountId: number,
  filterType: FilterTradeNFTTypes,
): Column<sdk.UserNFTTradeHistory, unknown>[] => {
  return [
    {
      key: 'side',
      name: t('labelTradeNFTSide') + '/' + t('labelTradeNFTUnitPrice'),
      formatter: ({ row }) => {
        let { nftAmount, metadata, price, feeTokenSymbol, bInfo, sInfo } = row
        metadata = {
          ...metadata,
          ...metadata?.base,
        }
        let tradeType, fromAddr
        if (filterType === FilterTradeNFTTypes.buy && bInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.buy
          fromAddr = sInfo.address
        } else if (filterType === FilterTradeNFTTypes.sell && sInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.sell
          fromAddr = bInfo.address
        } else if (sInfo.accountId === accountId && bInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.self
          fromAddr = ''
        } else if (bInfo.accountId === accountId) {
          tradeType = FilterTradeNFTTypes.buy
          fromAddr = sInfo.address
        } else {
          tradeType = FilterTradeNFTTypes.sell
          fromAddr = bInfo.address
        }
        let erc20Info = tokenMap[feeTokenSymbol]
        const renderValue = price
          ? getValuePrecisionThousand(
              price,
              undefined,
              undefined,
              erc20Info?.precision ?? undefined,
              true,
              { isPrice: true },
            ) +
            ' ' +
            erc20Info.symbol
          : EmptyValueTag
        return (
          <Box className='rdg-cell-value' height={'100%'} display={'flex'} alignItems={'center'}>
            {metadata?.imageSize ? (
              <Box
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                height={RowConfig.rowHeight + 'px'}
                width={RowConfig.rowHeight + 'px'}
                padding={1 / 4}
                style={{ background: 'var(--field-opacity)' }}
              >
                {metadata?.imageSize && (
                  <NftImage
                    alt={metadata?.base?.name}
                    onError={() => undefined}
                    src={metadata?.imageSize[NFT_IMAGE_SIZES.small]}
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
            <Box display={'flex'} flexDirection={'column'}>
              <Typography
                color={'inherit'}
                flex={1}
                display={'inline-flex'}
                alignItems={'center'}
                paddingLeft={1}
                overflow={'hidden'}
                textOverflow={'ellipsis'}
                component={'span'}
              >
                <StyledSideCell value={tradeType} marginRight={1}>
                  {tradeType === FilterTradeNFTTypes.buy
                    ? t('labelFilterTradeNFTBuy')
                    : t('labelFilterTradeNFTSell')}
                </StyledSideCell>
                <span>
                  {`${Number(nftAmount)}  ${
                    metadata?.base?.name
                      ? metadata?.base?.name
                      : t('labelUnknown', { ns: 'common' })
                  } ${
                    tradeType === FilterTradeNFTTypes.buy
                      ? t('labelFrom')
                      : tradeType === FilterTradeNFTTypes.sell
                      ? t('labelTo')
                      : ''
                  } ${fromAddr && getShortAddr(fromAddr)}`}
                </span>
              </Typography>
              <Typography
                color={'inherit'}
                flex={1}
                display={'inline-flex'}
                alignItems={'center'}
                paddingLeft={1}
                component={'span'}
              >
                {t('labelUPrice') + renderValue}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      key: 'fee',
      name: t('labelTradeFee'),
      cellClass: 'textAlignRight',
      headerCellClass: 'textAlignRight',
      formatter: ({ row }) => {
        let { sInfo, bInfo, feeTokenSymbol } = row
        const time = moment(new Date(row.createdAt), 'YYYYMMDDHHMM').fromNow()
        let feeAmount
        if (filterType == FilterTradeNFTTypes.sell && sInfo.accountId === accountId) {
          feeAmount = sInfo.feeAmount
        } else if (filterType == FilterTradeNFTTypes.buy && bInfo.accountId === accountId) {
          feeAmount = bInfo.feeAmount
        } else if (bInfo.accountId === accountId && sInfo.accountId === accountId) {
          feeAmount = sdk.toBig(bInfo.feeAmount).plus(sInfo.feeAmount)
        } else if (bInfo.accountId === accountId) {
          feeAmount = bInfo.feeAmount
        } else {
          feeAmount = sInfo.feeAmount
        }

        let feeTokenInfo = tokenMap[feeTokenSymbol]
        const fee = sdk
          .toBig(feeAmount)
          .div('1e' + feeTokenInfo.decimals)
          .toString()
        const renderValue = fee
          ? getValuePrecisionThousand(
              fee,
              undefined,
              undefined,
              feeTokenInfo?.precision ?? undefined,
              true,
              { isPrice: true },
            ) +
            ' ' +
            feeTokenInfo.symbol
          : EmptyValueTag
        // return (
        // const {key, value} = row[ "fee" ];
        // myLog({value})
        return (
          <Box display={'flex'} flexDirection={'column'}>
            <Typography variant={'body1'} component={'span'}>
              {`${renderValue} ${feeTokenSymbol}`}
            </Typography>
            <Typography color={'var(--color-text-third)'} variant={'body2'} component={'span'}>
              {time}
            </Typography>
          </Box>
        )
      },
    },
  ]
}

export const TradeNFTTable = withTranslation('tables')(
  <Row extends sdk.UserNFTTradeHistory>({
    t,
    pagination,
    showFilter,
    // idIndex,
    tokenMap,
    // filterPairs = [],
    rawData,
    currentHeight,
    rowHeight = RowConfig.rowHeight,
    getTradeList,
    headerRowHeight = RowConfig.rowHeaderHeight,
    showLoading = false,
    accAddress,
    accountId,
    ...rest
  }: WithTranslation & NFTTradeProps<Row>) => {
    // const {search} = useLocation();
    // const searchParams = new URLSearchParams(search);
    const [filterType, setFilterType] = React.useState(FilterTradeNFTTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<DateRange<string | Date>>([null, null])
    const { currency, isMobile } = useSettings()
    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnModeMobileAssets(t, currency, tokenMap, accountId, filterType)
        : getColumnModeAssets(t, currency, tokenMap, accountId, filterType),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<Row, unknown>[],
      style: {
        backgroundColor: ({ colorBase }: any) => `${colorBase.box}`,
      },
    }
    // myLog('TradeNFTTable', rawData, pagination)

    const pageSize = pagination ? pagination.pageSize : 10

    const updateData = _.debounce(
      ({
        // isSell,
        // page,
        tableType,
        // tableType,
        // currFilterPair = filterPair,
        currFilterDate = filterDate,
        currPage = pagination?.page || 1,
        currFilterType = filterType,
      }) => {
        if (tableType === TableType.filter) {
          currPage = 1
        }

        const start = currFilterDate[0]
          ? Number(moment(currFilterDate[0]).format(UNIX_TIMESTAMP_FORMAT))
          : undefined
        const end = currFilterDate[1]
          ? Number(moment(currFilterDate[1]).format(UNIX_TIMESTAMP_FORMAT))
          : undefined
        // const market =
        //   currFilterPair === "all" ? "" : currFilterPair.replace(/\s+/g, "");
        if (getTradeList) {
          getTradeList({
            start: start,
            end: end,
            limit: pagination?.pageSize ?? 10,
            offset: (currPage - 1) * (pagination?.pageSize ?? 10),
            page: currPage,
            side:
              currFilterType === FilterTradeNFTTypes.allTypes
                ? undefined
                : currFilterType.toUpperCase(),
          })
        }
      },
      globalSetup.wait,
      //[filterPair, filterType, pageSize, getUserTradeList, pagination]
    )

    const handleFilterChange = React.useCallback(
      ({ type = filterType, date = [null, null] }) => {
        setFilterType(type)
        setFilterDate(date as any)
        updateData({
          tableType: TableType.filter,
          currFilterType: type,
          currFilterData: date,
        })
      },
      [updateData, filterType],
    )

    const handlePageChange = React.useCallback(
      (page: number) => {
        updateData({ tableType: TableType.page, currPage: page })
      },
      [updateData],
    )

    const handleReset = () => {
      setFilterType(FilterTradeNFTTypes.allTypes)
      setFilterDate([null, null])
      // setFilterPair("all");
      // setFilterDate(date);
      updateData({
        tableType: 'filter',
        currFilterType: FilterTradeTypes.allTypes,
        currFilterDate: [null, null],
        currPage: 1,
      })
    }
    // const tradeposition = isL2Trade === true ? "layer2" : "swap";
    const [isDropDown, setIsDropDown] = React.useState(true)

    React.useEffect(() => {
      let filters: any = {}
      updateData.cancel()
      handleFilterChange(filters)
      return () => {
        updateData.cancel()
      }
    }, [pagination?.pageSize])
    return (
      <TableStyled isMobile={isMobile} currentheight={currentHeight}>
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
                  filterDate,
                  handleFilterChange,
                  filterType,
                  handleReset,
                }}
              />
            </TableFilterStyled>
          ))}
        <Table
          className={'scrollable'}
          {...{
            ...defaultArgs,
            rowHeight,
            headerRowHeight,
            showloading: showLoading,
            ...rest,
            rawData: rawData ?? [],
          }}
        />
        {!!accountId && showFilter && (
          <Typography
            display={'flex'}
            justifyContent={'flex-end'}
            textAlign={'right'}
            paddingRight={5 / 2}
            paddingY={1}
            component={'span'}
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
        {pagination && (
          <TablePagination
            height={rowHeight}
            page={pagination.page}
            pageSize={pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    )
  },
)
