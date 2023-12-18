import React from 'react'
import { Box, BoxProps, Typography, Tooltip } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, withTranslation, WithTranslation, Trans } from 'react-i18next'
import { Column, Table, Button } from '../../basic-lib'
import { TablePaddingX } from '../../styled'
import {
  BackIcon,
  EmptyValueTag,
  getValuePrecisionThousand,
  HiddenTag,
  Info2Icon,
  RowConfig,
  UpColor,
} from '@loopring-web/common-resources'
import { useOpenModals, useSettings } from '../../../stores'
import { CoinIcons } from './components/CoinIcons'
import ActionMemo from './components/ActionMemo'
import { AssetsTableProps, RawDataAssetsItem } from './AssetsTable'
import * as sdk from '@loopring-web/loopring-sdk'
export type RawDefiAssetsItem = RawDataAssetsItem & {
  apr: string
  average: string
  defiInfo: sdk.DefiMarketInfo
  baseToken?: string
}
const TableWrap = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  .rdg {
    //.rdg-header-row {
    //  .rdg-cell {
    //    display: inline-flex;
    //    align-items: center;
    //  }
    //}
    flex: 1;
    --template-columns: 16% auto auto 10% 16% !important;

    .rdg-cell:first-of-type {
      display: flex;
      align-items: center;
      margin-top: ${({ theme }) => theme.unit / 8}px;
    }

    .rdg-cell:last-of-type {
    }

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .textAlignRight {
      text-align: right;
    }
  }
  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element

export const AssetsDefiTable = withTranslation('tables')(
  <R extends RawDefiAssetsItem>(props: WithTranslation & Partial<AssetsTableProps<R>>) => {
    const {
      t,
      rawData = [],
      allowTrade,
      showFilter,
      getMarketArrayListCallback,
      disableWithdrawList,
      hideInvestToken,
      hideSmallBalances,
      isLoading = false,
      setHideSmallBalances,
      onSend,
      onReceive,
      forexMap,
      rowConfig = RowConfig,
      hideAssets,
      onTokenLockHold,
      tokenLockDetail,
      searchValue,
      isWebEarn,
      ...rest
    } = props
    const gridRef = React.useRef(null)
    const { setShowETHStakingApr } = useOpenModals()
    const { isMobile, coinJson } = useSettings()
    const { upColor } = useSettings()
    const colorRight =
      upColor === UpColor.green
        ? ['var(--color-success)', 'var(--color-error)']
        : ['var(--color-error)', 'var(--color-success)']

    const getColumnModeAssets = (t: TFunction, allowTrade?: any): Column<R, unknown>[] => [
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
            <>
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
            </>
          )
        },
      },
      {
        key: 'amount',
        name: t('labelAmount'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const value = row.amount
          const precision = row.precision
          return (
            <Box className={'textAlignRight'}>
              {hideAssets
                ? HiddenTag
                : getValuePrecisionThousand(value, precision, precision, undefined, false, {
                    floor: true,
                  })}
            </Box>
          )
        },
      },
      {
        key: 'averagePositionCost',
        name: (
          <Tooltip title={t('labelAveragePositionCostDes').toString()} placement={'top'}>
            <Typography
              display={'inline-flex'}
              alignItems={'center'}
              color={'var(--color-text-third)'}
            >
              <Trans i18nKey={'labelAveragePositionCost'} ns={'tables'}>
                Average
                <Info2Icon color={'inherit'} fontSize={'small'} sx={{ marginLeft: 1 / 2 }} />
              </Trans>
            </Typography>
          </Tooltip>
        ),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const precision = row.precision
          return (
            <Box className={'textAlignRight'}>
              {hideAssets
                ? HiddenTag
                : row.average
                ? getValuePrecisionThousand(row.average, precision, precision, undefined, false, {
                    floor: true,
                  }) + ` ${row?.baseToken}`
                : EmptyValueTag}
            </Box>
          )
        },
      },
      {
        key: 'apr',
        name: (
          <Tooltip title={t('labelDefiAprDes').toString()} placement={'top'}>
            <Typography
              display={'inline-flex'}
              alignItems={'center'}
              color={'var(--color-text-third)'}
            >
              <Trans i18nKey={'labelDefiApr'} ns={'tables'}>
                APR <Info2Icon color={'inherit'} fontSize={'small'} sx={{ marginLeft: 1 / 2 }} />
              </Trans>
            </Typography>
          </Tooltip>
        ),
        headerCellClass: 'textAlignCenter',
        formatter: ({ row }) => {
          return (
            <Button
              variant={'text'}
              size={'small'}
              onClick={() =>
                setShowETHStakingApr({
                  isShow: true,
                  symbol: `${row?.defiInfo?.market}`,
                  info: row?.defiInfo,
                })
              }
              sx={{
                padding: 0,
                justifyContent: 'right',
                color: row?.apr?.toString().charAt(0) == '-' ? colorRight[1] : colorRight[0],
              }}
              endIcon={
                <BackIcon
                  fontSize={'small'}
                  sx={{ transform: 'rotate(180deg)' }}
                  color={'inherit'}
                />
              }
            >
              {row.apr && row.apr !== '0.00' ? row.apr + '%' : EmptyValueTag}
            </Button>
          )
        },
      },
      {
        key: 'actions',
        name: t('labelActions'),
        headerCellClass: 'textAlignRight',
        // minWidth: 280,
        formatter: ({ row }) => {
          const token = row.token
          const tokenValue = token.value
          return (
            <ActionMemo
              {...({
                isLp: false,
                onSend,
                onReceive,
                isInvest: true,
                tokenValue,
                disableWithdrawList,
                isDefi: true,
                allowTrade,
                isLeverageETH: false,
              } as any)}
            />
          )
        },
      },
    ]
    return (
      <TableWrap isMobile={isMobile}>
        <Table
          ref={gridRef}
          className={'investAsset'}
          {...{ ...rest, t }}
          style={{
            height:
              rawData.length > 0
                ? rowConfig.rowHeaderHeight + rawData.length * rowConfig.rowHeight
                : 350,
          }}
          rowHeight={rowConfig.rowHeight}
          headerRowHeight={rowConfig.rowHeaderHeight}
          rawData={rawData}
          generateRows={(rowData: any) => rowData}
          generateColumns={({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[]}
          showloading={isLoading}
          columnMode={getColumnModeAssets(t, allowTrade) as any}
        />
      </TableWrap>
    )
  },
)
