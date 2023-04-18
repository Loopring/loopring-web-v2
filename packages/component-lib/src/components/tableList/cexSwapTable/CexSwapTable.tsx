import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import { Column, Table, TablePagination } from "../../basic-lib";
import { Box, BoxProps, Tooltip, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { CexSwapsType, RawDataCexSwapsItem } from "./Interface";
import {
  EmptyValueTag,
  globalSetup,
  Info2Icon,
  RowInvestConfig,
  TableType,
} from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import moment from "moment/moment";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};

  & .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 33% 20% auto auto auto !important;`
        : `--template-columns: 33% 20% auto auto auto !important;`}
  }
`;
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.ispro === "pro") {
        return "620px";
      }
      if (props.currentheight && props.currentheight > 350) {
        return props.currentheight + "px";
      } else {
        return "100%";
      }
    }};

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }
  .textAlignCenter {
    text-align: center;
  }
` as any;

export interface CexSwapsTableProps<R> {
  rawData: R[];
  showloading: boolean;
  onItemClick: (item: R) => void;
  pagination: {
    pageSize: number;
    total: number;
  };
  getCexOrderList: (
    props: Omit<sdk.GetOrdersRequest, "accountId">
  ) => Promise<any>;
}

export const CexSwapTable = withTranslation(["tables", "common"])(
  <R extends RawDataCexSwapsItem>(
    props: CexSwapsTableProps<R> & WithTranslation
  ) => {
    const {
      rawData,
      showloading,
      onItemClick,
      pagination,
      getCexOrderList,
      t,
    } = props;
    const [page, setPage] = React.useState(1);

    const { isMobile, upColor } = useSettings();
    const history = useHistory();
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Type",
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelCexSwapType"),
          formatter: ({ row }: FormatterProps<R>) => {
            const colorMap = [
              [CexSwapsType.Settled, "var(--color-success)"],
              [CexSwapsType.Delivering, "var(--color-warning)"],
              [CexSwapsType.Failed, "var(--color-error)"],
              [CexSwapsType.Cancelled, "var(--color-error)"],
              [CexSwapsType.Pending, "var(--color-warning)"],
            ];
            const found = colorMap.find((x) => x[0] === row?.type);
            return (
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                paddingRight={3}
                alignItems={"center"}
                height={"100%"}
              >
                {row?.type === CexSwapsType.Delivering ? (
                  <Tooltip title={t("labelCexDeliveringDes").toString()}>
                    <Typography
                      color={found ? found[1].toString() : ""}
                      marginLeft={1}
                      display={"inline-flex"}
                      alignItems={"center"}
                    >
                      {t("labelCex" + row?.type)}
                      <Info2Icon
                        fontSize={"small"}
                        color={"inherit"}
                        sx={{ marginX: 1 / 2 }}
                      />
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography
                    color={found ? found[1].toString() : ""}
                    marginLeft={1}
                  >
                    {t("labelCex" + row?.type)}
                  </Typography>
                )}
                <Typography>
                  {row ? (
                    <>
                      {`${row.fromAmount} ${row.fromSymbol} -> ${row.toAmount} ${row.toSymbol}`}
                    </>
                  ) : (
                    EmptyValueTag
                  )}
                </Typography>
              </Box>
            );
          },
        },
        {
          key: "Filled",
          name: t("labelCexSwapFailed"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {row.filledPercent ? row.filledPercent + "%" : EmptyValueTag}{" "}
              </>
            );
          },
        },
        {
          key: "Price",
          name: t("labelCexSwapPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <> {row.price?.value + " " + row.price?.key} </>;
          },
        },
        {
          key: "Fee",
          name: t("labelCexSwapFee"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {row.feeAmount != "0"
                  ? row.feeAmount + " " + row.feeSymbol
                  : EmptyValueTag}
              </>
            );
          },
        },
        {
          key: "Time",
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelCexSwapTime"),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{moment(new Date(row.time)).fromNow()}</>;
          },
        },
      ],
      [history, upColor, t]
    );
    const updateData = _.debounce(async ({ currPage = page }) => {
      await getCexOrderList({
        limit: pagination?.pageSize ?? 10,
        offset: (currPage - 1) * (pagination?.pageSize ?? 10),
      });
    }, globalSetup.wait);
    const handlePageChange = React.useCallback(
      async (page: number) => {
        setPage(page);
        await updateData({ actionType: TableType.page, currPage: page });
      },
      [updateData]
    );

    const getColumnMobileTransaction = getColumnModeTransaction;

    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnMobileTransaction()
        : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };
    React.useEffect(() => {
      updateData.cancel();
      handlePageChange(1);
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);

    return (
      <TableWrapperStyled>
        <TableStyled
          currentheight={
            RowInvestConfig.rowHeaderHeight +
            rawData.length * RowInvestConfig.rowHeight
          }
          rowHeight={RowInvestConfig.rowHeight}
          headerRowHeight={RowInvestConfig.rowHeaderHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row);
          }}
          // sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            ...props,

            rawData,
            showloading,
          }}
        />
        {pagination && !!rawData.length && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableWrapperStyled>
    );
  }
);
