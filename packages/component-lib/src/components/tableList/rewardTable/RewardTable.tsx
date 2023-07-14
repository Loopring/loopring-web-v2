import styled from '@emotion/styled'
import { Box } from '@mui/material'
import { TablePaddingX } from '../../styled'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next'
import { Column, Table } from '../../basic-lib'
import moment from 'moment'
import { EmptyValueTag } from '@loopring-web/common-resources'

interface Row {
  amount: string
  time: number
}

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: auto;

  .rdg {
    --template-columns: auto auto !important;
    min-height: ${({ theme }) => theme.unit * 30}px !important;
  }

  .textAlignRight {
    text-align: right;

    // .rdg-header-sort-cell {
    //     justify-content: flex-end;
    // }
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as typeof Box

const getColumnModeRewardTable = (
  t: TFunction,
  chosenCardInfo?: string,
): Column<Row, unknown>[] => {
  return [
    {
      key: 'amount',
      name: t('labelRewardTableAmount'),
      formatter: ({ row, column }) => {
        const value = row[column.key]
        const renderValue = `${value} ${chosenCardInfo}`
        // const renderValue = `${getValuePrecisionThousand(valueFrom, undefined, undefined, precisionFrom)} ${keyFrom} \u2192 ${getValuePrecisionThousand(valueTo, precisionTo, precisionTo, precisionTo)} ${keyTo}`
        return <div className='rdg-cell-value'>{renderValue}</div>
      },
    },
    {
      key: 'time',
      name: t('labelRewardTableTime'),
      headerCellClass: 'textAlignRight',
      formatter: ({ row, column }) => {
        const value = row[column.key]
        const renderValue = Number.isFinite(value)
          ? moment(new Date(row['time']), 'YYYYMMDDHHMM').fromNow()
          : EmptyValueTag
        return (
          <div className='rdg-cell-value textAlignRight'>
            <span>{renderValue}</span>
          </div>
        )
      },
    },
  ]
}

export interface RewardTableProps {
  rawData: Row[]
  chosenCardInfo?: string
}

export const RewardTable = withTranslation('tables')(
  ({ chosenCardInfo, rawData, t }: RewardTableProps & WithTranslation) => {
    const defaultArgs: any = {
      rawData: [],
      columnMode: getColumnModeRewardTable(t, chosenCardInfo),
      // generateRows,
      generateRows: (rawData: any) => rawData,
      // generateColumns,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<Row, unknown>[],
    }
    return (
      <TableStyled>
        <Table {...{ ...defaultArgs, rawData: rawData }} />
      </TableStyled>
    )
  },
)
