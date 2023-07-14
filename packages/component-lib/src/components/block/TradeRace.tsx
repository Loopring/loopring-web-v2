import React from 'react'
import { Column, Table } from '../basic-lib'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { Box, Typography } from '@mui/material'
import { EmptyValueTag, getValuePrecisionThousand, RowConfig } from '@loopring-web/common-resources'

export interface TradeRaceRow {
  project: string
  pair: string
  reward: {
    count: number
    token: string
  }
}

const rowHeight = RowConfig.rowHeight
const TableStyle = styled(Table)`
  &.rdg {
    box-sizing: border-box;
    border-top: 1px solid var(--color-divide);
    text-align: center;
    min-height: initial;
    height: ${(props: any) => {
      if (props.currentheight) {
        return props.currentheight + 2 + 'px'
      } else {
        return '100%'
      }
    }};
    .rdg-header-row {
      // background:var(--color-table-header-bg);
    }

    .rdg-row,
    .rdg-header-row {
      border-right: 1px solid var(--color-divide);
    }

    .rdg-cell {
      box-sizing: border-box;
      border-left-width: 1px;
      border-bottom-width: 1px;
      border-left-color: var(--color-divide);
      border-bottom-color: var(--color-divide);
    }

    .rdg-align-left {
      text-align: left;
    }

    .rdg-align-right {
      text-align: right;
    }
  }
` as typeof Table

export const TradeRacePanel = ({ rawData, ...rest }: { rawData: TradeRaceRow[] }) => {
  const { t } = useTranslation(['tables'])

  const getColumnMode = React.useCallback(
    (): Column<any, unknown>[] => [
      {
        key: 'project',
        name: t('labelTradeRaceProject'),
        formatter: ({ row }) => {
          const value = row['project']

          return <Box className='rdg-cell-value'>{value}</Box>
        },
      },
      {
        key: 'pair',
        name: /\-/gi.test(rawData[0].pair) ? t('labelTradeRacePair') : t('labelTradeRaceToken'),
      },
      {
        key: 'reward',
        // cellClass: "",
        // headerCellClass: "",
        name: t('labelTradeRaceReward'),
        formatter: ({ row }) => {
          return (
            <>
              {row.reward.token ? (
                <>
                  <Typography variant={'body1'} component={'span'}>
                    {row.reward.count !== '' && getValuePrecisionThousand(row.reward.count)}
                  </Typography>
                  <Typography variant={'body1'} component={'span'} marginLeft={1}>
                    {row.reward.token}
                  </Typography>
                </>
              ) : (
                <Typography variant={'body1'} component={'span'} marginLeft={1}>
                  {EmptyValueTag}
                </Typography>
              )}
            </>
          )
        },
      },
    ],
    [],
  )

  const defaultArgs: any = {
    columnMode: getColumnMode(),
    currentheight: (rawData.length + 1) * rowHeight,
    generateRows: (rawData: any) => rawData,
    generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
  }

  return <TableStyle<TradeRaceRow, unknown> {...{ ...defaultArgs, t, ...rest, rawData }} />
}
