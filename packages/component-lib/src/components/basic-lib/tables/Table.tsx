import type { Column as RdgColumn } from 'react-data-grid'
import DataGrid, { SortColumn } from 'react-data-grid'
import styled from '@emotion/styled'
import { Trans, WithTranslation } from 'react-i18next'

import { WithT } from 'i18next'
import React, { ForwardedRef } from 'react'
import { Column, DataGridProps, SortableHeaderCell, SortableHeaderCellProps, TableProps } from './'
import { EmptyDefault } from '../empty'
import { RowConfig, SoursURL } from '@loopring-web/common-resources'
import { Box, IconButton } from '@mui/material'
import { css } from '@emotion/react'

interface TableWrapperStyledProps {
  showloading: 'true' | 'false'
}

const TableWrapperStyled = styled(Box)<TableWrapperStyledProps>`
  display: flex;
  position: relative;
  flex: 1;
` as any
const hr = ({ theme }: any) => css`
  border-radius: ${theme.unit / 2}px;
  content: '';
  display: block;
  height: 1px;
  //margin-bottom: -2px;
  background: var(--color-divide);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`

const hrShort = ({ theme }: any) => css`
  border-radius: ${theme.unit / 2}px;
  content: '';
  display: block;
  height: 1px;
  width: calc(100% - ${theme.unit * 6}px);
  background: var(--color-divide);
  position: absolute;
  left: ${theme.unit * 3}px;
  right: 0;
  bottom: 0;
`

export const DataGridStyled = styled(DataGrid)`
  width: 100%;
  height: 100%;

  .table-divide &.rdg .rdg-header-row {
    &:after {
      ${hr}
    }
  }
  .table-divide-short &.rdg .rdg-header-row {
    &:after {
      ${hrShort}
    }
  }

  &.rdg {
    &.scrollable .rdg-header-row {
      background: var(--color-box);
    }

    min-height: var(--min-height);
    color: var(--color-text-primary);
    //color: inherit;
    box-sizing: border-box;
    border: rgba(0, 0, 0, 0) 0 solid;
    //background-color: inherit;
    .rdg-header-row {
      color: var(--color-text-secondary);
      width: 100%;
      background-color: inherit;
      font-weight: normal;
      @media only screen and (max-width: 768px) {
        .rdg-cell {
          font-size: 12px;
        }
      }
    }

    .rdg-header-sort-name {
      flex-grow: initial;
    }

    .rdg-cell-selected {
      box-shadow: inherit;
    }

    .rdg-row {
      box-sizing: border-box;
      background: inherit;
      width: 100%;
      transition: background 0.4s ease-out;

      &:hover {
        background: var(--color-box-hover);

        .rdg-cell:first-of-type {
          // border-left: ${({ theme }) => theme.border.borderConfig({ d_W: 2, c_key: 'selected' })}
        }
      }
    }

    .rdg-cell {
      color: inherit;
      border-left: rgba(0, 0, 0, 0) 2px solid;
      border-right: rgba(0, 0, 0, 0) 2px solid;
      border-bottom: rgba(0, 0, 0, 0) 2px solid;
      box-sizing: border-box;
      height: 100%;
      // padding: 0 ${({ theme }) => theme.unit}px;

      & > span,
      div {
        user-select: text;
      }

      &.textAlignRight {
        text-align: right;

        .rdg-header-sort-cell {
          justify-content: right;
        }
      }

      &.textAlignLeft {
        text-align: left;

        .rdg-header-sort-cell {
          justify-content: left;
        }
      }

      &.textAlignCenter {
        text-align: center;

        .rdg-header-sort-cell {
          justify-content: center;
        }
      }
    }

    .rdg-header-sort-cell {
      .rdg-header-sort-name + span {
        display: none;
      }

      .rdg-header-sort-name {
        .sort-icon svg {
          display: inline-block;
          transform-origin: center;
        }

        .DESC svg {
          transform: rotate(0deg) translateX(-3px) scale(1.2);
        }

        .ASC svg {
          transform: rotate(180deg) translateX(-3px) scale(1.2);
        }

        .NONE svg {
          transform: rotate(90deg) translateX(-3px) scale(1.2);
        }
      }
    }

    .rdg-cell[aria-selected='true'] {
      box-shadow: none;
    }

    .rdg-cell.action {
      text-overflow: initial;
    }

    .rdg-cell.success {
      color: var(--color-success);
    }

    .rdg-cell.error {
      color: var(--color-error);
    }
  }
` as typeof DataGrid

const LoadingStyled = styled(IconButton)`
  position: absolute;
  z-index: 21;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export const generateColumns = <Row, SR>({
  columnsRaw,
  t,
}: {
  columnsRaw: Column<Row, SR>[]
  [key: string]: any
} & WithT): RdgColumn<Row, SR>[] => {
  const columns: Column<Row, SR>[] = columnsRaw.reduce(
    (prev: RdgColumn<Row, SR>[], column: Column<Row, SR>) => {
      const { name, isHidden } = column
      if (typeof name === 'string' && !isHidden) {
        //@ts-ignore
        column.name = t(name)
        prev.push(column)
      }
      return prev
    },
    [],
  )
  return columns as Column<Row, SR>[]
}
export const generateRows = <Row, SR>(rawData: [][], rest: TableProps<Row, SR>): Row[] => {
  const { columnMode } = rest
  return rawData.map(
    (row) =>
      row.reduce(
        (prev: { [key: string]: any }, cell, index) => {
          if (columnMode[index]) {
            prev[columnMode[index].key] = cell
          }
          return prev
        },
        { _rawData: row },
      ) as Row,
  )
}

export type ExtraTableProps = {
  showloading?: boolean
}

export const Table = React.forwardRef(<R, SR>(props: DataGridProps<R, SR> & WithTranslation & ExtraTableProps, ref: ForwardedRef<any>) => {
  const {
    EmptyRowsRenderer,
    generateRows,
    generateColumns,
    sortInitDirection,
    sortDefaultKey,
    sortMethod,
    rawData,
    style,
    frozeSort,
    rowRenderer,
    rowClassFn,
    rowKeyGetter,
    columnMode,
    onScroll,
    onRowClick,
    rowHeight,
    showloading,
    t,
    ...rest
  } = props

  const columns = generateColumns({ columnsRaw: columnMode, t })
  const [rows, setRows] = React.useState(generateRows(rawData, props))

  React.useEffect(() => {
    setRows(generateRows(rawData, props))
  }, [rawData])
  /*** sort handle start ***/
  const [sortColumns, setSortColumns] = React.useState<readonly Readonly<SortColumn>[]>([
    {
      columnKey: sortDefaultKey as any,
      direction: sortInitDirection ? sortInitDirection : ('ASC' as any),
    },
  ])

  const sortedRows: readonly R[] = React.useMemo(() => {
    if (sortColumns.length === 0) return rows
    const { columnKey, direction } = sortColumns[0]
    let sortedRows: R[] = [...rows]
    sortedRows = sortMethod ? sortMethod(sortedRows, columnKey, direction) : rows
    return direction === 'DESC' ? sortedRows.reverse() : sortedRows
  }, [rows, sortColumns, sortMethod])
  const onSortColumnsChange = React.useCallback((sortColumns: SortColumn[]) => {
    setSortColumns(sortColumns.slice(-1))
  }, [])

  const loopringColumns = React.useMemo(() => {
    return columns.map((c) => {
      if (c.headerRenderer) {
        return { ...c } as Column<R, unknown>
      } else {
        return {
          ...c,
          headerRenderer: (props: SortableHeaderCellProps<R>) => <SortableHeaderCell {...props} />,
        } as Column<R, unknown>
      }
    }) as Column<R, unknown>[]
  }, [columns])
  const RenderEmptyMsg = styled.span`
    display: flex;

    .link {
      margin: 0 5px;
    }
  `
  /*** sort handle end ***/
  return (
    <TableWrapperStyled showloading={!!showloading ? 'true' : 'false'}>
      <DataGridStyled
        {...rest}
        ref={ref}
        onScroll={onScroll}
        columns={loopringColumns as any}
        style={style}
        rows={sortDefaultKey && sortedRows ? sortedRows : rows}
        rowKeyGetter={rowKeyGetter}
        rowClass={(row) => (rowClassFn ? rowClassFn(row, props) : '')}
        rowHeight={rowHeight ? rowHeight : RowConfig.rowHeight}
        onRowsChange={setRows}
        onSortColumnsChange={onSortColumnsChange}
        rowRenderer={rowRenderer as any}
        sortColumns={sortColumns}
        onRowClick={onRowClick}
        emptyRowsRenderer={
          !showloading
            ? () =>
                EmptyRowsRenderer ? (
                  EmptyRowsRenderer
                ) : (
                  <EmptyDefault
                    height={`calc(100% - var(--header-row-height))`}
                    message={() => {
                      return (
                        <RenderEmptyMsg>
                          <Trans i18nKey='labelEmptyDefault'>Content is Empty</Trans>
                        </RenderEmptyMsg>
                      )
                    }}
                  />
                )
            : null
        }
      />
      {showloading && (
        <LoadingStyled color={'inherit'}>
          <img
            className='loading-gif'
            alt={'loading'}
            width='36'
            src={`${SoursURL}images/loading-line.gif`}
          />
        </LoadingStyled>
      )}
    </TableWrapperStyled>
  )
}
)