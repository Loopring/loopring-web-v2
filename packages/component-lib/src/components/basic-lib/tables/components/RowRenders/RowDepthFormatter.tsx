import clsx from 'clsx'
import styled from '@emotion/styled'
import { CalculatedColumn, Cell, RowRendererProps } from 'react-data-grid'
import React from 'react'
// import type { Column } from 'react-data-grid';

const RowDepthStyled = styled.div`
  contain: strict;
  contain: size layout style paint;
  display: grid;
  grid-template-rows: var(--row-height);
  grid-template-columns: var(--template-columns);
  position: absolute;
  left: 0;
  width: var(--row-width);
  height: var(--row-height);
  line-height: var(--row-height);
  background-color: var(--background-color);

  .row-background-value {
    opacity: .06;
    height: var(--row-height);
    width: var(--row-width);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    .rgb-depth-row {
      float: right;
      height: var(--row-height);
      background: var(--color-success);

      &.rgb-depth-red {
        background: var(--color-error);
      }
    }
  }
}
`

export interface IDepthRendererProps<R, SR> extends RowRendererProps<R, SR> {
  depthKey: string
  rowBeforeRender: (prors: {
    depthKey: string
    row: R
    column: readonly CalculatedColumn<R, SR>[]
    className: any
    [key: string]: any
  }) => JSX.Element
}

function _DepthRow<R, SR = unknown>(
  {
    cellRenderer: CellRenderer = Cell,
    className,
    rowIdx,
    isRowSelected,
    copiedCellIdx,
    draggedOverCellIdx,
    row,
    viewportColumns,
    selectedCellProps,
    onRowClick,
    rowClass,
    setDraggedOverRowIdx,
    onMouseEnter,
    top,
    onRowChange,
    selectCell,
    selectRow,
    rowBeforeRender,
    depthKey,
    'aria-rowindex': ariaRowIndex,
    'aria-selected': ariaSelected,
    ...props
  }: IDepthRendererProps<R, SR> & { selectRow: any },
  ref: React.Ref<HTMLDivElement>,
) {
  function handleDragEnter(event: React.MouseEvent<HTMLDivElement>) {
    setDraggedOverRowIdx?.(rowIdx)
    onMouseEnter?.(event)
  }

  className = clsx(
    `rdg-row`,
    `rdg-row-${rowIdx % 2 === 0 ? 'even' : 'odd'}`,
    {
      'rdg-cell-selected': isRowSelected,
      'rdg-group-row-selected': selectedCellProps?.idx === -1,
    },
    rowClass?.(row),
    className,
  )
  return (
    <RowDepthStyled
      role='row'
      aria-rowindex={ariaRowIndex}
      aria-selected={ariaSelected}
      ref={ref}
      className={className}
      onMouseEnter={handleDragEnter}
      style={{ top }}
      {...props}
    >
      <div className={'row-background-value'}>
        {rowBeforeRender({
          row,
          depthKey,
          column: viewportColumns,
          className,
          ...props,
        })}
      </div>
      {viewportColumns.map((column) => {
        const isCellSelected = selectedCellProps?.idx === column.idx

        return (
          CellRenderer && (
            <CellRenderer
              {...props}
              colSpan={undefined}
              key={column.key}
              rowIdx={rowIdx}
              column={column}
              row={row}
              isCopied={copiedCellIdx === column.idx}
              isDraggedOver={draggedOverCellIdx === column.idx}
              isCellSelected={isCellSelected}
              // isRowSelected={isRowSelected}
              dragHandleProps={
                isCellSelected ? (selectedCellProps as any).dragHandleProps : undefined
              }
              onFocus={isCellSelected ? (selectedCellProps as any).onFocus : undefined}
              onKeyDown={isCellSelected ? selectedCellProps!.onKeyDown : undefined}
              onRowClick={onRowClick}
              onRowChange={onRowChange}
              selectCell={selectCell}
              // selectRow={selectRow}
            />
          )
        )
      })}
    </RowDepthStyled>
  )
}

export const DepthRow = React.memo(React.forwardRef(_DepthRow)) as unknown as <R, SR = unknown>(
  props: IDepthRendererProps<R, SR> & React.RefAttributes<HTMLDivElement>,
) => JSX.Element

export const RowBefore = <R, SR>({
  row,
  // isRowSelected,
  className,
  column,
  depthKey,
  width,
  // onRowReorder,
  ...props
}: { column: any; width: string } & IDepthRendererProps<R, SR>) => {
  return <div className={`rgb-depth-row ${className}`} style={{ width: width }} {...props}></div>
}
