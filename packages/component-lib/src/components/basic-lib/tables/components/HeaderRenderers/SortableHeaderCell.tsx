import { HeaderRendererProps } from 'react-data-grid'
import styled from '@emotion/styled'
import { Box, BoxProps } from '@mui/material'
import { css } from '@emotion/react'
import React from 'react'

export const headerSortCell = css`
  cursor: pointer;
  display: flex;
`
export const headerSortName = css`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`
const StyledArrowSort = styled(Box)<BoxProps & { sortdirection: 'ASC' | 'DESC' | undefined }>`
  margin-left: ${({ theme }) => `${theme.unit / 2}px`};
  .up {
    width: 0;
    height: 0;
    border: ${({ theme }) => `${theme.unit / 2}px`} solid transparent;
    border-bottom-color: ${({
      // theme,
      sortdirection,
    }) => (sortdirection === 'DESC' ? `var(--color-text-primary)` : `var(--color-text-third)`)};
  }

  .down {
    width: 0;
    height: 0;
    border: ${({ theme }) => `${theme.unit / 2}px`} solid transparent;
    border-top-color: ${({
      // theme,
      sortdirection,
    }) => (sortdirection === 'ASC' ? `var(--color-text-primary)` : `var(--color-text-third)`)};
    margin-top: ${({ theme }) => `${theme.unit / 4}px`};
  }
` as (props: BoxProps & { sortdirection: 'ASC' | 'DESC' | undefined }) => JSX.Element

// @ts-ignore
export const ArrowSort = ({
  sortDirection,
  // children,
  ...rest
}: BoxProps & { sortDirection: 'ASC' | 'DESC' | undefined }) => {
  return (
    <StyledArrowSort {...{ ...rest }} sortdirection={sortDirection}>
      <div className='up' />
      <div className='down' />
    </StyledArrowSort>
  )
}

// type SharedHeaderCellProps<R, SR> = Pick<
//     HeaderRendererProps<R, SR>,
//     'sortDirection' | 'onSort' | 'priority'
//     >;
export interface SortableHeaderCellProps<R, SR = unknown> extends HeaderRendererProps<R, SR> {
  children?: React.ReactNode
}

export function SortableHeaderCell<R, SR>({
  column,
  sortDirection,
  priority,
  onSort,
  children,
}: SortableHeaderCellProps<R, SR>) {
  // let sortText = '';
  // if (sortDirection === 'ASC') {
  //     sortText = '\u25B2';
  // } else if (sortDirection === 'DESC') {
  //     sortText = '\u25BC';
  // }
  if (column.sortable) {
    // const showUp = sortDirection === 'ASC'
    // const showDown =  sortDirection === 'DESC'

    return (
      <Box
        component={'span'}
        display={'flex'}
        alignItems={'center'}
        className={`rdg-header-sort-cell ${headerSortCell}`}
        onClick={(e: React.MouseEvent) => onSort(e.ctrlKey)}
      >
        <span className={`rdg-header-sort-name ${headerSortName}`}>
          {children ? children : column.name}
        </span>
        <ArrowSort {...{ sortDirection }} />
        {priority}
      </Box>
    )
  } else {
    return <>{children ? children : column.name}</>
  }
}
