import React from "react";
import { Box, Pagination } from "@mui/material";
import styled from "@emotion/styled";

// const StyledPaginationWrapper = styled(Box)`
//     height: 44px;
//     position: relative;
// `

const StyledPagination = styled(Pagination)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  height?: number;
  alignItems?: string;
  justifyContent?: string;
  onPageChange: (page: number) => void;
};

export const TablePagination = ({
  onPageChange,
  page,
  height = 44,
  justifyContent = "center",
  alignItems = "center",
  pageSize,
  total,
}: PaginationProps) => {
  const getCount = React.useCallback(() => {
    if (!total) return 0;
    return Math.ceil(total / pageSize);
    // total % pageSize > 0
    //       ? parseInt(String(total / pageSize)) + 1
    //       : parseInt(String(total / pageSize))
  }, [pageSize, total]);

  const handleChange = React.useCallback(
    (_, value: number) => {
      onPageChange(value);
    },
    [onPageChange]
  );

  return (
    <Box
      display={"flex"}
      alignItems={alignItems}
      height={height}
      justifyContent={justifyContent}
    >
      <StyledPagination
        color={"primary"}
        count={getCount()}
        page={page}
        onChange={handleChange}
      />
    </Box>
  );
};
