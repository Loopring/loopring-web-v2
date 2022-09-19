import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Column, Table } from "../../basic-lib";
import { withTranslation } from "react-i18next";
import {
  FirstPlaceIcon,
  getShortAddr,
  RowConfig,
  SecondPlaceIcon,
  ThirdPlaceIcon,
} from "@loopring-web/common-resources";

const TableStyled = styled(Box)<{ height: number | undefined | string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${({ height }) => height}px;
    --template-columns: 10% auto auto !important;
    height: auto;

    .rdgCellCenter {
      height: 100%;
      // display: flex;
      justify-content: center;
      align-items: center;
    }

    .textAlignRight {
      text-align: right;
    }

    .textAlignCenter {
      text-align: center;
    }

    .textAlignLeft {
      text-align: left;
    }
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as typeof Box;

export const TradeRaceTableConfig = withTranslation("tables")(
  ({ rawData, column, showloading, t, ...props }: any) => {
    const getColumnMode = React.useCallback(
      (): Column<any, unknown>[] =>
        column.length
          ? column.map((item: any, index: number) => ({
              key: item.key,
              name: item.label,
              width: "auto",
              headerCellClass:
                index == 0
                  ? "textAlignLeft"
                  : column.length == index + 1
                  ? "textAlignRight"
                  : `textAlignCenter`,
              cellClass:
                index == 0
                  ? "textAlignLeft"
                  : column.length == index + 1
                  ? "rdg-cell-value textAlignRight"
                  : "rdg-cell-value textAlignCenter",
              formatter: ({ row }: any) => {
                // return row.address;
                //item.key;
                // ("");
                if (/address/gi.test(item.key.toLowerCase())) {
                  return getShortAddr(row[item.key]);
                }

                if (/rank/gi.test(item.key.toLowerCase())) {
                  const value = row[item.key];
                  const formattedValue =
                    value === "1" ? (
                      <FirstPlaceIcon
                        style={{ marginTop: 8 }}
                        fontSize={"large"}
                      />
                    ) : value === "2" ? (
                      <SecondPlaceIcon
                        style={{ marginTop: 8 }}
                        fontSize={"large"}
                      />
                    ) : value === "3" ? (
                      <ThirdPlaceIcon
                        style={{ marginTop: 8 }}
                        fontSize={"large"}
                      />
                    ) : (
                      <Box paddingLeft={1}>{value}</Box>
                    );
                  return <Box className="rdg-cell-value">{formattedValue}</Box>;
                }
                return row[item.key] ?? "";
                // else {
                //   return row[item.key];
                // }
                // return row[item.key];
              },
            }))
          : [],
      []
    );

    const defaultArgs: any = {
      columnMode: getColumnMode(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };

    return (
      <TableStyled height={(rawData.length + 1) * RowConfig.rowHeight}>
        <Table
          className={"scrollable"}
          rawData={rawData}
          {...{ ...defaultArgs, ...props, showloading }}
        />
      </TableStyled>
    );
  }
);
