import React from 'react'
import { Box, BoxProps, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import { Column, Table } from '../../basic-lib'
import { TablePaddingX } from '../../styled'
import { hexToRGB, HiddenTag, MarginLevelIcon, RowConfig, TokenType } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { CoinIcons } from './components/CoinIcons'
import _ from 'lodash'
import { Button } from '@mui/material'
import { useTheme } from '@emotion/react'
import { marginLevelType } from '@loopring-web/core/src/hooks/useractions/vault/utils'

const TableWrap = styled(Box)<BoxProps & { isMobile?: boolean; lan: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    flex: 1;
    ${({ isMobile }) =>
      isMobile
        ? `--template-columns: 250px auto auto 290px !important;`
        : `--template-columns: 250px auto auto 290px !important;`}
    .rdg-cell:first-of-type {
      display: flex;
      align-items: center;
      margin-top: ${({ theme }) => theme.unit / 8}px;
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

}

${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean; lan: string } & BoxProps) => JSX.Element

export type PositionItem = {
  tokenPair: {
    coinJson: any
    pair: string
    leverage: string
    marginLevel: string
  }
  direction: 'long' | 'short'
  holding: string
  onClickTrade: () => void
  onClickClose: () => void
}

export type VaultPositionsTableProps = {
  rawData: PositionItem[]
  onRowClick?: (index: number, row: PositionItem) => void
  isLoading?: boolean
  rowConfig?: typeof RowConfig
  hideAssets?: boolean

  // onRowClickLeverage: ({ row }: { row: PositionItem }) => void
  // onRowClickTrade: ({ row }: { row: PositionItem }) => void
  // onRowClickClose: ({ row }: { row: PositionItem }) => void
}

export const VaultPositionsTable = withTranslation('tables')(
  (props: WithTranslation & VaultPositionsTableProps) => {
    const {
      t,
      rawData,
      onRowClick,
      rowConfig = RowConfig,
      hideAssets,

      // onRowClickLeverage,
      // onRowClickTrade,
      // onRowClickClose,
      isLoading,
      ...rest
    } = props
    const total  = rawData.length
    const { language, isMobile } = useSettings()
    const theme = useTheme()

    const getColumnModeAssets = (t: TFunction): Column<PositionItem, unknown>[] => [
      {
        key: 'token',
        name: t('labelToken'),
        formatter: ({ row }) => {
          return (
            <>
              <CoinIcons type={TokenType.single} tokenIcon={row.tokenPair.coinJson} />
              <Typography
                variant={'inherit'}
                color={'var(--color-text-primary)'}
                flexDirection={'column'}
                marginLeft={1}
                component={'span'}
                paddingRight={1}
                width={'80px'}
              >
                {row.tokenPair.pair}
              </Typography>
              <Typography
                bgcolor={hexToRGB(theme.colorBase.warning, 0.5)}
                color={'var(--color-text-primary)'}
                marginLeft={1}
                px={1}
                component={'span'}
                borderRadius={'4px'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                {row.tokenPair.leverage}
              </Typography>
              <Typography
                color={
                  marginLevelType(row.tokenPair.marginLevel) === 'warning'
                    ? theme.colorBase.warning
                    : marginLevelType(row.tokenPair.marginLevel) === 'danger'
                    ? theme.colorBase.error
                    : theme.colorBase.success
                }
                bgcolor={hexToRGB(
                  marginLevelType(row.tokenPair.marginLevel) === 'warning'
                    ? theme.colorBase.warning
                    : marginLevelType(row.tokenPair.marginLevel) === 'danger'
                    ? theme.colorBase.error
                    : theme.colorBase.success,
                  0.5,
                )}
                ml={1}
                display={'flex'}
                alignItems={'center'}
                borderRadius={'4px'}
                px={0.5}
              >
                <MarginLevelIcon sx={{ mr: 0.5, mb: 0.2 }} />
                {row.tokenPair.marginLevel}
              </Typography>
            </>
          )
        },
      },
      {
        key: 'direction',
        name: 'Direction',
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <Box
              className={'textAlignRight'}
              color={row.direction === 'long' ? 'var(--color-success)' : 'var(--color-error)'}
            >
              {row.direction === 'long' ? 'Long' : 'Short'}
            </Box>
          )
        },
      },
      {
        key: 'holding',
        name: 'Holding',
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return <Box className={'textAlignRight'}>{hideAssets ? HiddenTag : row.holding}</Box>
        },
      },
      // {
      //   key: 'costPrice',
      //   name: 'Cost Price (USDT)',
      //   headerCellClass: 'textAlignRight',
      //   formatter: ({ row }) => {
      //     return <Box className={'textAlignRight'}>{row.costPrice}</Box>
      //   },
      // },

      {
        key: 'actions',
        name: t('labelActions'),
        headerCellClass: 'textAlignRight',
        cellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <Box height={'100%'} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
              {/* <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onRowClickLeverage({ row })
                }}
              >
                Leverage
              </Button> */}
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  row.onClickTrade()
                }}
              >
                Trade
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  row.onClickClose()
                }}
              >
                Close
              </Button>
            </Box>
          )
        },
      },
    ]
    const getColumnMobileAssets = getColumnModeAssets

    return (
      <TableWrap lan={language} isMobile={isMobile}>
        <Table
          {...rest}
          style={{
            height: total > 0 ? rowConfig.rowHeaderHeight + total * rowConfig.rowHeight : 200,
            minHeight: 0,
          }}
          onRowClick={onRowClick as any}
          rowHeight={rowConfig.rowHeight}
          headerRowHeight={rowConfig.rowHeaderHeight}
          rawData={rawData}
          generateRows={(rowData: any) => rowData}
          generateColumns={({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[]}
          showloading={isLoading}
          columnMode={(isMobile ? getColumnMobileAssets(t) : getColumnModeAssets(t)) as any}
          t={t}
          EmptyRowsRenderer={
            <Box display='flex' justifyContent='center' alignItems='center' mt={9}>
              <Typography color='var(--color-text-secondary)'>No Positions</Typography>
            </Box>
          }
        />
      </TableWrap>
    )
  },
)
