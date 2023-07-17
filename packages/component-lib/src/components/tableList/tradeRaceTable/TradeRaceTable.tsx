import { PlaceComponent, Table } from '../../basic-lib'
import { withTranslation } from 'react-i18next'
import { getShortAddr } from '@loopring-web/common-resources'
import { Box } from '@mui/material'

export const TradeRaceTable = withTranslation('tables')(
  <R extends object>({
    rawData,
    column,
    showloading,
    scrollable,
  }: {
    rawData: R
    column: { key: string; label: string }[]
    showloading: boolean
    scrollable: boolean
  }) => {
    const defaultArgs: any = {
      columnMode: column.length
        ? column.map((item, index) => ({
            key: item.key,
            name: item.label,
            width: 'auto',
            headerCellClass:
              index == 0
                ? 'textAlignLeft'
                : column.length == index + 1
                ? 'textAlignRight'
                : `textAlignCenter`,
            cellClass:
              index == 0
                ? 'textAlignLeft'
                : column.length == index + 1
                ? 'rdg-cell-value textAlignRight'
                : 'rdg-cell-value textAlignCenter',
            formatter: ({ row }: any) => {
              if (/address/gi.test(item.key.toLowerCase())) {
                return getShortAddr(row[item.key])
              } else if (/rank/gi.test(item.key.toLowerCase())) {
                return (
                  <Box className='rdg-cell-value'>
                    <PlaceComponent rank={row.rank} />
                  </Box>
                )
              } else {
                return row[item.key] ?? ''
              }
            },
          }))
        : [],
      generateRows: (rawData: R) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw,
    }

    return (
      <Table
        className={scrollable ? 'scrollable' : ''}
        {...{
          ...defaultArgs,
          rawData: rawData,
          showloading,
        }}
      />
    )
  },
)
