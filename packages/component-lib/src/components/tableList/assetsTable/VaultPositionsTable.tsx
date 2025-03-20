import React from 'react'
import { Box, BoxProps, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import { Column, Table } from '../../basic-lib'
import { VaultAssetFilter } from './components/Filter'
import { TablePaddingX } from '../../styled'
import { BrushIcon, hexToRGB, HiddenTag, MarginLevelIcon, RowConfig, TokenType } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { CoinIconsNew } from './components/CoinIcons'
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
        ? `--template-columns: 30% auto 50% !important;`
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
  showFilter?: boolean
  hideSmallBalances?: boolean
  setHideSmallBalances?: (status: boolean) => void
  hideDustCollector?: boolean
  onClickDustCollector?: () => void
}

export const VaultPositionsTable = withTranslation('tables')(
  (props: WithTranslation & VaultPositionsTableProps) => {
    const {
      t,
      rawData,
      onRowClick,
      rowConfig = RowConfig,
      hideAssets,
      showFilter,
      hideSmallBalances = false,
      setHideSmallBalances,
      hideDustCollector = false,
      onClickDustCollector,
      isLoading,
      ...rest
    } = props
    const total  = rawData.length
    const { language, isMobile } = useSettings()
    const theme = useTheme()
    const [filter, setFilter] = React.useState({
      searchValue: '',
    })

    const handleFilterChange = React.useCallback(
      (props: { searchValue: string }) => {
        setFilter(props)
      },
      [setFilter]
    )

    const getColumnModeAssets = (t: TFunction): Column<PositionItem, unknown>[] => [
      {
        key: 'token',
        name: t('labelToken'),
        formatter: ({ row }) => {
          return (
            <Box height={'100%'} display={'flex'} alignItems={'center'}>
              <CoinIconsNew secondLogoType={'subscript'} tokenIcon={row.tokenPair.coinJson} />

              <Typography
                variant={'inherit'}
                color={'var(--color-text-primary)'}
                flexDirection={'column'}
                marginLeft={-2.5}
                component={'span'}
                paddingRight={1}
                width={'80px'}
              >
                {row.tokenPair.pair}
              </Typography>
             
            </Box>
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

      {
        key: 'actions',
        name: t('labelActions'),
        headerCellClass: 'textAlignRight',
        cellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <Box height={'100%'} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  row.onClickTrade()
                }}
                size={'medium'}
              >
                Trade
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  row.onClickClose()
                }}
                size={'medium'}
              >
                Close
              </Button>
            </Box>
          )
        },
      },
    ]
    const getColumnMobileAssets = (t: TFunction): Column<PositionItem, unknown>[] => [
      {
        key: 'token',
        name: t('labelToken'),
        formatter: ({ row }) => {
          return (
            <Box height={'100%'} display={'flex'} alignItems={'center'}>
              <Typography
                variant={'inherit'}
                color={'var(--color-text-primary)'}
                flexDirection={'column'}
                component={'span'}
                paddingRight={1}
                width={'80px'}
              >
                {row.tokenPair.pair}
              </Typography>
            </Box>
          )
        },
      },
      {
        key: 'holding',
        name: 'Holding',
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return <Box className={'textAlignRight'}>
            <Typography mr={1} component={'span'} color={row.direction === 'long' ? 'var(--color-success)' : 'var(--color-error)'}>{row.direction === 'long' ? 'Long' : 'Short'}</Typography>
            {hideAssets ? HiddenTag : row.holding}
            </Box>
        },
      },

      {
        key: 'actions',
        name: t('labelActions'),
        headerCellClass: 'textAlignRight',
        cellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <Box height={'100%'} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  row.onClickTrade()
                }}
                size={'small'}
              >
                Trade
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  row.onClickClose()
                }}
                size={'small'}
              >
                Close
              </Button>
            </Box>
          )
        },
      },
    ]

    return (
      <TableWrap lan={language} isMobile={isMobile}>
        {showFilter && (
          <Box marginX={2} display={'flex'} alignItems={'center'}>
            <Box>
              <VaultAssetFilter
                handleFilterChange={handleFilterChange}
                filter={filter}
                hideSmallBalances={hideSmallBalances}
                setHideSmallBalances={setHideSmallBalances}
                noHideInvestToken
              />
            </Box>

            {!hideDustCollector && <Typography
              sx={{ cursor: 'pointer' }}
              component={'span'}
              onClick={onClickDustCollector}
              width={'140px'}
              color={'var(--color-text-primary)'}
              display={'flex'}
              alignItems={'center'}
            >
              <BrushIcon
                sx={{ fontSize: '24px', color: 'inherit', marginLeft: 1, marginRight: 0.5 }}
              />{' '}
              {t('labelVaultDustCollector')}
            </Typography>}
          </Box>
        )}
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
