import styled from "@emotion/styled";
import { Box, Link } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Column, Table } from "../../basic-lib";
import { WithTranslation, withTranslation } from "react-i18next";

import {
  RawDataRedPacketClaimItem,
  RedPacketClaimTableProps,
} from "./Interface";
import { useHistory } from "react-router-dom";
import { useSettings } from "../../../stores";
import React from "react";
import { FormatterProps } from "react-data-grid";
import {
  CurrencyToTag,
  getValuePrecisionThousand,
  PriceTag,
  RowConfig,
} from "@loopring-web/common-resources";
import { ColumnCoinDeep } from "../assetsTable";

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

export const RedPacketClaimTable = withTranslation(["tables", "common"])(
  <R extends RawDataRedPacketClaimItem>(
    props: RedPacketClaimTableProps<R> & WithTranslation
  ) => {
    const { rawData, forexMap, showloading, onItemClick, t } = props;
    const history = useHistory();
    const { currency } = useSettings();

    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Token",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelToken"),
          formatter: ({ row }: FormatterProps<R>) => (
            <ColumnCoinDeep token={row.token} />
          ),
        },
        {
          key: "Amount",
          sortable: true,
          name: t("labelAmount"),
          formatter: ({ row }: FormatterProps<R>) => {
            return <Box display={"flex"}>{row.amountStr}</Box>;
          },
        },
        {
          key: "Value",
          sortable: true,
          name: t("labelValue"),
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <Box display="flex">
                {PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    (row.volume || 0) * (forexMap[currency] ?? 0),
                    2,
                    2,
                    2,
                    true,
                    { isFait: true }
                  )}
              </Box>
            );
          },
        },
        {
          key: "Actions",
          name: t("labelActions"),
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          // minWidth: 280,
          formatter: ({ row }) => {
            return (
              <Link onClick={() => onItemClick(row.rawData)}>
                {t("labelClaim")}
              </Link>
            );
          },
        },
      ],
      [history, t]
    );
    const defaultArgs: any = {
      columnMode: getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };
    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let resultRows: R[] = [];
        switch (sortColumn) {
          case "Token":
            resultRows = rawData.sort((a: R, b: R) => {
              return a.token.simpleName.localeCompare(b.token.simpleName);
            });
            break;
          case "Amount":
            resultRows = rawData.sort((a: R, b: R) => {
              return a.amountStr.localeCompare(b.amountStr);
            });
            break;
          case "Value":
            resultRows = rawData.sort((a: R, b: R) => {
              return b.volume - a.volume;
            });
            break;
          default:
        }
        return resultRows;
      },
      [rawData]
    );

    return (
      <TableWrapperStyled>
        <TableStyled
          currentheight={
            RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
          }
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.rowHeaderHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row.rawData);
          }}
          sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,

            rawData,
            showloading,
          }}
        />
      </TableWrapperStyled>
    );
  }
);
