import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import {
  CurrencyToTag,
  EmptyValueTag,
  ForexMap,
  getValuePrecisionThousand,
  HiddenTag,
  myLog,
  PriceTag,
  RowConfig,
  TokenType,
} from '@loopring-web/common-resources'
import { Column, Table } from '../../basic-lib'
import { Box, BoxProps, Link, Tooltip, Typography } from '@mui/material'
import { TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { CoinIcons } from '../assetsTable'
import * as sdk from '@loopring-web/loopring-sdk'

export type EarningsDetail = {
  amountStr: string
  amount: string
  name?: string
  claimType: sdk.CLAIM_TYPE
  tokenValueDollar: string
  token: string
  precision: number
}
export type EarningsRow = {
  token: {
    type: TokenType
    value: string
  }
  detail: Array<EarningsDetail>
  precision: number
  amountStr: string
  amount: string
  tokenValueDollar: number
  rawData: any
}
const TableWrapperStyled = styled(Box)<BoxProps & { isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (prosp: BoxProps & { isMobile: boolean }) => JSX.Element
const TableStyled = styled(Table)`
  &.rdg {
    min-height: 240px;
    height: ${(props: any) => {
      return props.currentheight + 'px'
    }};

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo-icon.dual:last-child {
      transform: scale(0.6) translate(0, 4px);
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
const ContentWrapperStyled = styled(Box)`
  padding: 0 ${({ theme }) => theme.unit * 1}px;
  border-radius: ${({ theme }) => theme.unit / 2}px;
`

export const DetailRewardPanel = ({
  detailList,
  hideAssets = false,
}: {
  detailList?: EarningsDetail[]
  hideAssets?: boolean
}) => {
  const { t } = useTranslation()
  myLog('detailLis', detailList)
  return (
    <ContentWrapperStyled>
      {detailList?.map((item, index) => {
        if (item.amount === '0') {
          return <React.Fragment key={item.toString()} />
        } else {
          return (
            <Box
              display={'flex'}
              key={index}
              flexDirection={'row'}
              justifyContent={'space-between'}
              padding={1}
            >
              <Typography
                display={'inline-flex'}
                alignItems={'center'}
                component={'span'}
                color={'textSecondary'}
              >
                {Reflect.ownKeys(sdk.CLAIM_TYPE)?.includes(item.claimType?.toUpperCase() ?? '')
                  ? t(`labelClaimType${item.claimType}`)
                  : item?.name
                  ? item?.name
                  : t('labelClaimOtherRewards')}
              </Typography>
              <Typography
                display={'inline-flex'}
                alignItems={'center'}
                component={'span'}
                color={'textPrimary'}
              >
                {item.amount == '0'
                  ? EmptyValueTag
                  : hideAssets
                  ? HiddenTag
                  : getValuePrecisionThousand(
                      item.amountStr,
                      item.precision,
                      item.precision,
                      undefined,
                      false,
                      {
                        floor: true,
                      },
                    ) +
                    ' ' +
                    item.token}
              </Typography>
            </Box>
          )
        }
      })}
    </ContentWrapperStyled>
  )
}

export const RewardsTable = withTranslation(['tables', 'common'])(
  <R extends EarningsRow>(
    props: {
      hideAssets?: boolean
      forexMap: ForexMap<sdk.Currency>
      rawData: R[]
      onItemClick: (item: any) => void
      onDetail: (item: any) => void
      showloading: boolean
    } & WithTranslation,
  ) => {
    const { forexMap, hideAssets, rawData, onItemClick, showloading, t } = props

    const { currency, isMobile, coinJson } = useSettings()

    const getColumnMode = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'token',
          name: t('labelToken'),
          formatter: ({ row, column }) => {
            const token = row[column.key]
            let tokenIcon: [any, any] = [undefined, undefined]
            const [head, middle, tail] = token.value.split('-')
            if (token.type === 'lp' && middle && tail) {
              tokenIcon =
                coinJson[middle] && coinJson[tail]
                  ? [coinJson[middle], coinJson[tail]]
                  : [undefined, undefined]
            }
            if (token.type !== 'lp' && head && head !== 'lp') {
              tokenIcon = coinJson[head] ? [coinJson[head], undefined] : [undefined, undefined]
            }
            return (
              <Box
                display={'inline-flex'}
                height={'100%'}
                flexDirection={'row'}
                alignItems={'center'}
              >
                <CoinIcons type={token.type} tokenIcon={tokenIcon} />
                <Typography
                  variant={'inherit'}
                  color={'textPrimary'}
                  display={'flex'}
                  flexDirection={'column'}
                  marginLeft={2}
                  component={'span'}
                  paddingRight={1}
                >
                  <Typography component={'span'} className={'next-coin'}>
                    {token.value}
                  </Typography>
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'amount',
          name: t('labelAmount'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const value = row.amountStr
            const precision = row.precision
            return (
              <Box
                className={'textAlignRight'}
                // onClick={() => {
                //   onDetail(row)
                // }}
              >
                {row.amount === '0' ? (
                  EmptyValueTag
                ) : (
                  <Tooltip
                    componentsProps={{
                      tooltip: {
                        sx: {
                          width: 'var(--mobile-full-panel-width)',
                        },
                      },
                    }}
                    className={'detailPanel'}
                    title={<DetailRewardPanel hideAssets={hideAssets} detailList={row.detail} />}
                  >
                    <Typography
                      display={'inline-flex'}
                      alignItems={'center'}
                      component={'span'}
                      sx={{
                        textDecoration: 'underline dotted',
                        cursor: 'pointer',
                      }}
                    >
                      {hideAssets
                        ? HiddenTag
                        : getValuePrecisionThousand(value, precision, precision, undefined, false, {
                            floor: true,
                          })}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            )
          },
        },
        {
          key: 'value',
          name: t('labelAssetsTableValue'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            return (
              <Box className={'textAlignRight'}>
                {row.amount === '0'
                  ? EmptyValueTag
                  : hideAssets
                  ? HiddenTag
                  : PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      (row?.tokenValueDollar || 0) * (forexMap[currency] ?? 0),
                      undefined,
                      undefined,
                      undefined,
                      true,
                      { isFait: true, floor: true },
                    )}
              </Box>
            )
          },
        },
        {
          key: 'Actions',
          name: t('labelActions'),
          headerCellClass: 'textAlignRight',
          cellClass: 'textAlignRight',
          formatter: ({ row }) => {
            return (
              <Box className={'textAlignRight'}>
                {row.amount === '0' ? (
                  EmptyValueTag
                ) : (
                  <Link onClick={() => onItemClick(row)}>{t('labelClaim')}</Link>
                )}
              </Box>
            )
          },
        },
      ],
      [hideAssets, forexMap, currency],
    )

    const defaultArgs: any = {
      columnMode: getColumnMode(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    return (
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight}
          {...{
            ...defaultArgs,
            ...props,
            rawData,
            showloading,
          }}
        />
      </TableWrapperStyled>
    )
  },
)
