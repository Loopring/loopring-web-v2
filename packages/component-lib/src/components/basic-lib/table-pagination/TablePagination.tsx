import React from 'react'
import { Box, Pagination } from '@material-ui/core'
import styled from '@emotion/styled'

const StyledPaginationWrapper = styled(Box)`
    height: 36px;
    position: relative;
`

const StyledPagination = styled(Pagination)`
    display: flex;
    justify-content: center;
    align-items: center;
`

export type PaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}

export const TablePagination = ({onPageChange, page, pageSize, total}: PaginationProps) => {
    const getCount = React.useCallback(() => {
        if (!total) return 0
        return total % pageSize > 0
            ? parseInt(String(total / pageSize)) + 1
            : parseInt(String(total / pageSize))
    }, [pageSize, total])

    const handleChange = React.useCallback((_, value: number) => {
        onPageChange(value)
    }, [onPageChange]);

    return (
        <StyledPaginationWrapper>
            <StyledPagination color={'primary'} count={getCount()} page={page} onChange={handleChange}/>
        </StyledPaginationWrapper>
    );
}
