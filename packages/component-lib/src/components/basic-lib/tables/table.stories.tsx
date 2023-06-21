import { Meta, Story } from '@storybook/react/types-6-0'
import { CellDepthFormatter } from './components/Formatters'
import { Column, DataGridProps, generateColumns, generateRows, Table } from './index'

import styled from '@emotion/styled'
import { RowRendererProps } from 'react-data-grid'

import { DepthRow, RowBefore } from './components/RowRenders'
import { useTranslation } from 'react-i18next'

const Style = styled.div`
  background: var(--color-global-bg);
`

interface Row {
  price: string
  size: string
  volume: string
  number: string
  sortColumn: string
  filterColumn: string
  cellExpend: {
    value: string
    children: []
    isExpanded: boolean
  }
  children?: Row[]
  isExpanded?: boolean
  format?: any
}

const rawData: Array<Array<any>> = [
  ['1.2', 'big', '0.12', '123', 'abc', 'start_a'],
  ['1.3', 'big', '0.99', '1293', 'abc', 'start_a'],
  ['1.5', 'small', '0.42', '23', 'abc', 'start_a'],
  ['1.2', 'big', '0.32', '123', 'abc', 'end_a'],
  ['1.6', 'big', '0.52', '123', 'abc', 'start_a'],
  ['1.3', 'middle', '0.852', '5', 'abc', 'before_a'],
  ['1.2', 'big', '0.12', '123', 'abc', 'start_a'],
]
const columnModeDefault: Column<Row, unknown>[] = [
  { key: 'price', name: 'price' },
  { key: 'size', name: 'size' },
  { key: 'volume', name: 'volume' },
  { key: 'number', name: 'size' },
  { key: 'string', name: 'volume' },
  { key: 'filter', name: 'number' },
]

/**
 * Table StoryBook
 */
export default {
  component: Table,
  title: 'basic-lib/Table',
  argTypes: {},
} as Meta

const Template: Story<DataGridProps<Row, unknown>> = (args: DataGridProps<Row, unknown> & any) => {
  let rest = useTranslation()
  return (
    <Style>
      <Table {...{ ...args, ...rest }} />
    </Style>
  )
}
export const Default = Template.bind({})
export const Empty = Template.bind({})
export const FormatCell = Template.bind({})
export const FormatRow = Template.bind({})
export const SortColumn = Template.bind({})
export const ExpendRowDemo = Template.bind({})
Default.args = {
  rawData: rawData,
  columnMode: columnModeDefault,
  generateRows: generateRows,
  generateColumns: generateColumns,
}
Empty.args = {
  ...Default.args,
  rawData: [],
  columnMode: columnModeDefault,
}
const columnModeCellDepth: Column<Row, unknown>[] = [
  {
    key: 'price',
    name: 'price',
    cellClass: (row: Row) => (Number(row.volume) > 0.4 ? 'success' : 'error'),
  },
  {
    key: 'size',
    name: 'size',
    formatter: ({ row, column, ...props }: any) => {
      return (
        <>
          <CellDepthFormatter
            {...props}
            row={row}
            column={column}
            className={row.price > 0.4 ? 'rgb-depth-success' : 'rgb-depth-error'}
            depthKey={'price'}
          />
          <div className='rdg-cell-value'>
            <div>{row[column.key]}</div>
          </div>
        </>
      )
    },
  },
  { key: 'volume', name: 'volume', sortable: true },
]
FormatCell.args = {
  ...Default.args,
  ...{
    columnMode: columnModeCellDepth,
  },
}
FormatRow.args = {
  ...Default.args,
  ...{
    columnMode: columnModeDefault,
    rowRenderer: (p: RowRendererProps<Row, any>) => {
      const { row } = p
      return (
        <DepthRow
          depthKey={'volume'}
          rowBeforeRender={(p: any) => {
            const width = `${Number(row.volume) * 100}%`
            return (
              <RowBefore
                {...p}
                width={width}
                className={Number(row.volume) > 0.4 ? 'rgb-depth-red' : ''}
              />
            )
          }}
          {...p}
        />
      )
    },
  },
}

const columnModeSort: Column<Row, unknown>[] = [
  {
    key: 'price',
    name: 'price',
    cellClass: (row: Row) => (Number(row.price) > 100 ? 'upper' : 'row'),
  },
  { key: 'size', name: 'size', sortable: true },
  { key: 'volume', name: 'volume', sortable: true },
  { key: 'sortColumn', name: 'value', sortable: true },
]
SortColumn.args = {
  ...Default.args,
  columnMode: columnModeSort,
  sortDefaultKey: 'sortColumn',
  frozeSort: false,
  sortMethod: (sortedRows: Row[], sortColumn) => {
    switch (sortColumn) {
      case 'size':
        sortedRows = sortedRows.sort((a, b) => a[sortColumn].localeCompare(b[sortColumn]))
        break
      case 'sortColumn':
      case 'volume':
        sortedRows = sortedRows.sort(
          (a: Row, b: Row) => Number(a[sortColumn]) - Number(b[sortColumn]),
        )
        break
      default:
    }
    return sortedRows
  },
}
