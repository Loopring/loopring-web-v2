import React from 'react'
import { Column, Table } from '../basic-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'
import { CheckIcon } from '@loopring-web/common-resources'
import styled from '@emotion/styled'

interface Row {
  level: string
  tradeVolume: string
  rule: string
  balance: string
  maker: string
  taker: string
}

const TableStyle = styled(Table)`
  &.rdg {
    border-top: 1px solid var(--color-divide);
    text-align: center;
    min-height: 300px;
    overflow: auto;
    --template-columns: auto !important;
    .rdg-header-row {
      // background:var(--color-table-header-bg);
    }
    .rdg-row,
    .rdg-header-row {
      border-right: 1px solid var(--color-divide);
    }
    .rdg-cell {
      border-left-width: 1px;
      border-bottom-width: 1px;
      border-left-color: var(--color-divide);
      border-bottom-color: var(--color-divide);
    }
  }
` as typeof Table

export const VipPanel = withTranslation(['tables'])(
  ({
    t,
    rawData,
    currentLevel,
    ...rest
  }: WithTranslation & { rawData: Row[]; currentLevel: number }) => {
    const getColumnModeTransaction = React.useCallback(
      ({ t }: WithTranslation): Column<any, unknown>[] => [
        {
          key: 'level',
          name: t('labelVipTableLevel'),
          frozen: true,
          formatter: ({ row }) => {
            const [_, level] = row.level.split(' ')
            return (
              <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                {String(currentLevel) === String(level) && (
                  <Box>
                    <CheckIcon style={{ marginBottom: -3 }} htmlColor={'var(--color-logo)'} />
                  </Box>
                )}
                <Box>
                  <Typography marginLeft={1} variant={'body1'} component={'span'}>
                    {row.level}
                  </Typography>
                </Box>
              </Box>
            )
          },

          // headerRenderer: (props: SortableHeaderCellProps<Row>) => <SortableHeaderCell {...props}
          //                                                                              children={<Typography
          //                                                                                  variant={'body1'}
          //                                                                                  paddingLeft={2}
          //                                                                                  component={'span'}>{t('labelLevel')}</Typography>}/>,
          // formatter: ({row}) => <Typography variant={'body1'}
          //                                   component={'span'}>{row.level}</Typography>
        },
        { key: 'tradeVolume', name: t('labelVipTable30dTradeVolume') },
        { key: 'rule', name: t('labelVipTableRule') },
        { key: 'balance', name: t('labelVipTableBalance') },
        { key: 'maker', name: t('labelVipTableMaker') },
        { key: 'taker', name: t('labelVipTableTaker') },
      ],
      [currentLevel],
    )

    const defaultArgs: any = {
      columnMode: getColumnModeTransaction({ t, ...rest }),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    return <TableStyle<Row, unknown> {...{ ...defaultArgs, t, ...rest, rawData }} />
  },
)
