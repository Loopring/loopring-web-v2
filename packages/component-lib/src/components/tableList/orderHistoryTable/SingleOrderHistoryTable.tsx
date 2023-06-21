import { Box, BoxProps, Typography } from '@mui/material'
import { Column, generateColumns, Table } from '../../basic-lib'
import { OrderDetailItem } from './OrderHistoryTable'
import { withTranslation, WithTranslation } from 'react-i18next'
import { EmptyValueTag, getValuePrecisionThousand, myLog } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import moment from 'moment'
import { TablePaddingX } from '../../styled'
import { useSettings } from '../../../stores'

interface Row {
  amount: number
  tradingPrice: number
  filledPrice: string
  time: number
  total: {
    key: string
    value: number
  }
  fee: { value: number; key: string }
  sortColumn: string
  filterColumn: string
  actionsStatus: object
}

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: auto;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: auto auto auto auto 180px !important;`
        : `--template-columns: 40% 40% 20% !important;`}
  }

  .textAlignRight {
    text-align: right;
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element

export interface SingleOrderHistoryTableProps {
  rawData: OrderDetailItem[]
  showloading?: boolean
}

export const SingleOrderHistoryTable = withTranslation('tables')(
  (props: SingleOrderHistoryTableProps & WithTranslation) => {
    const { t } = props
    const getColumnModeSingleHistory = (): Column<Row, unknown>[] => {
      return [
        {
          key: 'amount',
          name: props.t('labelOrderAmount'),
          formatter: ({ row }) => {
            const value = row['amount']
            const renderValue = `${getValuePrecisionThousand(value, undefined, undefined, 6)}`
            return <div className='rdg-cell-value'>{renderValue}</div>
          },
        },
        {
          key: 'filledPrice',
          name: props.t('labelOrderFilledPrice'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row, column }) => {
            const value = row[column.key]
            const renderValue = value
              ? getValuePrecisionThousand(value, undefined, undefined, undefined, true, {
                  isPrice: true,
                })
              : EmptyValueTag
            return <div className='rdg-cell-value textAlignRight'>{renderValue}</div>
          },
        },
        {
          key: 'fee',
          name: props.t('labelOrderFee'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row, column }) => {
            myLog(666, row['fee'])
            const value = row[column.key].value
            const token = row[column.key].key
            const renderValue = value
              ? `${getValuePrecisionThousand(value, undefined, undefined, undefined, false, {
                  floor: false,
                })} ${token}`
              : EmptyValueTag
            return <div className='rdg-cell-value textAlignRight'>{renderValue}</div>
          },
        },
        {
          key: 'role',
          name: props.t('labelOrderRole'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const renderValue = row['fee'].value ? props.t('labelTaker') : props.t('labelMaker')
            return <div className='rdg-cell-value textAlignRight'>{renderValue}</div>
          },
        },
        {
          key: 'time',
          name: props.t('labelOrderTime'),
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
    const getColumnModeMobileSingleHistory = (): Column<Row, unknown>[] => {
      return [
        {
          key: 'amount',
          name: t('labelOrderAmount') + '/' + t('labelOrderFilledPrice'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const renderValue = `${getValuePrecisionThousand(row.amount, undefined, undefined, 6)}`
            const filledPrice = row.filledPrice
              ? `${getValuePrecisionThousand(
                  Number(row.filledPrice),
                  undefined,
                  undefined,
                  undefined,
                  true,
                  { isPrice: true },
                )} `
              : EmptyValueTag
            return (
              <Box
                height={'100%'}
                width={'100%'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'flex-end'}
                justifyContent={'center'}
              >
                <Typography component={'span'}>{renderValue}</Typography>
                <Typography color={'textSecondary'}> {filledPrice}</Typography>
              </Box>
            )
          },
        },
        {
          key: 'fee',
          name: props.t('labelOrderFee'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const value = row.fee.value
            const token = row.fee.key
            const renderValue = value
              ? `${getValuePrecisionThousand(value, undefined, undefined, undefined, false, {
                  floor: false,
                })} ${token}`
              : EmptyValueTag
            return <div className='rdg-cell-value textAlignRight'>{renderValue}</div>
          },
        },
        {
          key: 'role',
          name: t('labelOrderRole') + '/' + t('labelOrderTime'),
          headerCellClass: 'textAlignRight',
          formatter: ({ row }) => {
            const renderValue = row['fee'].value ? props.t('labelTaker') : props.t('labelMaker')
            const time = Number.isFinite(row.time)
              ? moment(new Date(row.time), 'YYYYMMDDHHMM').fromNow()
              : EmptyValueTag

            return (
              <Box
                height={'100%'}
                width={'100%'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'flex-end'}
                justifyContent={'center'}
              >
                <Typography>{renderValue}</Typography>
                <Typography color={'textSecondary'} variant={'body2'}>
                  {time}
                </Typography>
              </Box>
            )
          },
        },
      ]
    }
    const { isMobile } = useSettings()
    const defaultArgs: any = {
      rawData: [],
      columnMode: isMobile ? getColumnModeMobileSingleHistory() : getColumnModeSingleHistory(),
      generateRows: (rawData: any) => rawData,
      generateColumns,
    }
    return (
      <TableStyled isMobile={isMobile}>
        <Table
          className={'scrollable'}
          {...{
            ...defaultArgs,
            ...props,
            rawData: props.rawData,
            showloading: props.showloading,
          }}
        />
      </TableStyled>
    )
  },
)
