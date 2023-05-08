import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import { Button, Column, Table } from "../../basic-lib";
import { Box, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { RawDataCexSwapsItem } from "./Interface";
import {
  EmptyValueTag,
  ForexMap,
  getValuePrecisionThousand,
  RowInvestConfig,
  UpColor,
  UpIcon,
  YEAR_DAY_FORMAT,
} from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import moment from "moment/moment";
import * as sdk from "@loopring-web/loopring-sdk";

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
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
}

export const CexSwapTable = withTranslation(["tables", "common"])(
  <R extends RawDataCexSwapsItem>(
    props: CexSwapsTableProps<R> & WithTranslation
  ) => {
    const { rawData, showloading, onItemClick, t } = props;
    const { isMobile, upColor } = useSettings();
    const history = useHistory();
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Type",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelCexSwapType"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const colorMap = [
              ["Settled", "var(--color-success)"],
              ["Delivering", "var(--color-warning)"],
            ];
            const found = colorMap.find((x) => x[0] === row?.type);
            return (
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                paddingRight={3}
              >
                <Box color={found ? found[1] : ""}>
                  {row?.type ?? EmptyValueTag}
                </Box>
                <Box>
                  {row ? (
                    <>
                      {`${row.fromAmount} ${row.fromSymbol} -> ${row.toAmount} ${row.toSymbol}`}{" "}
                    </>
                  ) : (
                    EmptyValueTag
                  )}
                </Box>
              </Box>
            );
          },
        },
        {
          key: "Price",
          sortable: true,
          name: t("labelCexSwapPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <> {row.price}</>;
          },
        },
        {
          key: "Fee",
          sortable: true,
          name: t("labelCexSwapFee"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Box>
                {row.feeAmount} {row.feeSymbol}
              </Box>
            );
          },
        },
        {
          key: "Time",
          sortable: true,
          name: t("labelCexSwapTime"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Box display="flex">{moment(new Date(row.time)).fromNow()}</Box>
            );
          },
        },
      ],
      [history, upColor, t]
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
      </TableWrapperStyled>
    );
  }
);
