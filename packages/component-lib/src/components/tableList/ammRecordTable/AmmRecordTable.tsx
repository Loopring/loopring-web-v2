import React from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table, TablePagination, TableProps } from "../../basic-lib";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  PriceTag,
  RowConfig,
} from "@loopring-web/common-resources";
import {
  AmmRecordRow as Row,
  AmmRecordTableProps,
  AmmTradeType,
} from "./Interface";
import { FormatterProps } from "react-data-grid";
import styled from "@emotion/styled";
import { TablePaddingX } from "../../styled";
import { Currency } from "@loopring-web/loopring-sdk";
import { useSettings } from "../../../stores";
import { TFunction } from "i18next";

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${(props: any) => {
      if (props.currentheight && props.currentheight > 350) {
        return props.currentheight + "px";
      } else {
        return "100%";
      }
    }};
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 280px 240px auto auto !important;`
        : `--template-columns: 90% 10% !important;`}
    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (
  props: { currentheight?: number; isMobile?: boolean } & BoxProps
) => JSX.Element;

const columnMode = (
  { t }: { t: TFunction },
  currency: Currency
): Column<Row<any>, unknown>[] => [
  {
    key: "style",
    sortable: false,
    width: "auto",
    minWidth: 240,
    name: t("labelAmmTableType"),
    formatter: ({ row }: FormatterProps<Row<any>, unknown>) => {
      const { type, coinA, coinB, amountA, amountB } = row;
      const isAdd = type === AmmTradeType.add;
      const side = isAdd ? t("labelAmmJoin") : t("labelAmmExit");
      return (
        <Box display={"flex"} alignItems={"center"}>
          <Typography
            color={isAdd ? "var(--color-success)" : "var(--color-error)"}
          >
            {side}
          </Typography>
          &nbsp;&nbsp;
          <Typography component={"span"}>
            {`${getValuePrecisionThousand(
              amountA,
              undefined,
              undefined,
              undefined,
              false,
              { isTrade: true }
            )} ${coinA.simpleName}`}
          </Typography>
          &nbsp; + &nbsp;
          <Typography component={"span"}>
            {`${getValuePrecisionThousand(
              amountB,
              undefined,
              undefined,
              undefined,
              false,
              { isTrade: true }
            )} ${coinB.simpleName}`}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "totalValue",
    sortable: false,
    width: "auto",
    name: t("labelAmmTotalValue"),
    formatter: ({ row }: FormatterProps<Row<any>, unknown>) => {
      const { totalDollar, totalYuan } = row;
      return (
        <Typography component={"span"}>
          {typeof totalDollar === "undefined"
            ? EmptyValueTag
            : currency === Currency.usd
            ? PriceTag.Dollar +
              getValuePrecisionThousand(
                totalDollar,
                undefined,
                undefined,
                undefined,
                true,
                { isFait: true }
              )
            : PriceTag.Yuan + getValuePrecisionThousand(totalYuan, 2, 2)}
        </Typography>
      );
    },
  },
  {
    key: "time",
    sortable: false,
    width: "auto",
    headerCellClass: "textAlignRight",
    cellClass: "textAlignRight",
    name: t("labelAmmTime"),
    formatter: ({ row }: FormatterProps<Row<any>, unknown>) => {
      const { time } = row;
      let timeString;
      if (typeof time === "undefined") {
        timeString = EmptyValueTag;
      } else {
        timeString = moment(new Date(time), "YYYYMMDDHHMM").fromNow();
      }
      return (
        <Typography component={"span"} textAlign={"right"}>
          {timeString}
        </Typography>
      );
      // 10 年前
    },
  },
];

const columnModeMobile = (
  { t }: { t: TFunction },
  currency: Currency
): Column<Row<any>, unknown>[] => [
  {
    key: "style",
    sortable: false,
    width: "auto",
    minWidth: 240,
    name: t("labelAmmTableType"),
    formatter: ({ row }: FormatterProps<Row<any>, unknown>) => {
      const { type, coinA, coinB, amountA, amountB } = row;
      const isAdd = type === AmmTradeType.add;
      const side = isAdd ? t("labelAmmJoin") : t("labelAmmExit");
      return (
        <Box display={"flex"} alignItems={"center"}>
          <Typography
            color={isAdd ? "var(--color-success)" : "var(--color-error)"}
          >
            {side}
          </Typography>
          &nbsp;&nbsp;
          <Typography component={"span"}>
            {`${getValuePrecisionThousand(
              amountA,
              undefined,
              undefined,
              undefined,
              false,
              { isTrade: true }
            )} ${coinA.simpleName}`}
          </Typography>
          &nbsp; + &nbsp;
          <Typography component={"span"}>
            {`${getValuePrecisionThousand(
              amountB,
              undefined,
              undefined,
              undefined,
              false,
              { isTrade: true }
            )} ${coinB.simpleName}`}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "totalValue",
    sortable: false,
    width: "auto",
    cellClass: "textAlignRight",
    name: t("labelAmmTotalValue") + "/" + t("labelAmmTime"),
    formatter: ({ row }: FormatterProps<Row<any>, unknown>) => {
      const { totalDollar, totalYuan } = row;
      const time = moment(new Date(row.time), "YYYYMMDDHHMM").fromNow();
      return (
        <Box display={"flex"} flexDirection={"column"} height={"100%"}>
          <Typography component={"span"}>
            {typeof totalDollar === "undefined"
              ? EmptyValueTag
              : currency === Currency.usd
              ? PriceTag.Dollar +
                getValuePrecisionThousand(
                  totalDollar,
                  undefined,
                  undefined,
                  undefined,
                  true,
                  { isFait: true }
                )
              : PriceTag.Yuan + getValuePrecisionThousand(totalYuan, 2, 2)}
          </Typography>
          <Typography component={"span"} textAlign={"right"}>
            {time}
          </Typography>
        </Box>
      );
    },
  },
];

export const AmmRecordTable = withTranslation("tables")(
  <T extends { [key: string]: any }>({
    t,
    i18n,
    tReady,
    handlePageChange,
    pagination,
    currentheight,
    rowHeight = RowConfig.rowHeight,
    headerRowHeight = RowConfig.rowHeaderHeight,
    showFilter = true,
    rawData,
    wait = globalSetup.wait,
    currency = Currency.usd,
    ...rest
  }: AmmRecordTableProps<T> & WithTranslation) => {
    const [page, setPage] = React.useState(1);
    const { isMobile } = useSettings();
    const defaultArgs: TableProps<any, any> = {
      rawData,
      columnMode: isMobile
        ? columnModeMobile({ t }, currency)
        : columnMode({ t }, currency),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }) =>
        columnsRaw as Column<Row<any>, unknown>[],
    };

    const pageSize = pagination ? pagination.pageSize : 10;

    const _handlePageChange = React.useCallback(
      (currPage: number) => {
        if (currPage === page) return;
        setPage(currPage);
        // updateData({actionType: ActionType.page, currPage: page})
        if (handlePageChange) {
          handlePageChange({
            limit: pageSize,
            offset: (currPage - 1) * pageSize,
          });
        }
      },
      [handlePageChange, page, pageSize]
    );

    const height =
      (currentheight || 0) + (!!rawData.length ? 0 : RowConfig.rowHeaderHeight);

    return (
      <TableStyled isMobile={isMobile} currentheight={height}>
        <Table
          /* className={'scrollable'}  */ {...{
            ...defaultArgs,
            t,
            i18n,
            tReady,
            ...rest,
            rowHeight,
            headerRowHeight,
            rawData: rawData,
          }}
        />
        {pagination && !!rawData.length && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={pagination.total}
            onPageChange={_handlePageChange}
          />
        )}
      </TableStyled>
    );
  }
);
