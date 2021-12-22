import { Box } from "@mui/material";
import { Column, generateColumns, Table } from "../../basic-lib";
import { OrderDetailItem } from "./OrderHistoryTable";
import { TFunction, withTranslation, WithTranslation } from "react-i18next";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  myLog,
} from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import moment from "moment";
import { TablePaddingX } from "../../styled";

interface Row {
  amount: number;
  tradingPrice: number;
  filledPrice: number;
  time: number;
  total: {
    key: string;
    value: number;
  };
  sortColumn: string;
  filterColumn: string;
  actionsStatus: object;
}

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: auto;

  .rdg {
    --template-columns: auto auto auto auto 180px !important;
  }
  .textAlignRight {
    text-align: right;
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as typeof Box;

const getColumnModeSingleHistory = (t: TFunction): Column<Row, unknown>[] => {
  return [
    {
      key: "amount",
      name: t("labelOrderAmount"),
      formatter: ({ row }) => {
        const value = row["amount"];
        const renderValue = `${getValuePrecisionThousand(
          value,
          undefined,
          undefined,
          6
        )}`;
        return <div className="rdg-cell-value">{renderValue}</div>;
      },
    },
    {
      key: "filledPrice",
      name: t("labelOrderFilledPrice"),
      headerCellClass: "textAlignRight",
      formatter: ({ row, column }) => {
        const value = row[column.key];
        const renderValue = value
          ? getValuePrecisionThousand(
              value,
              undefined,
              undefined,
              undefined,
              true,
              { isPrice: true }
            )
          : EmptyValueTag;
        return (
          <div className="rdg-cell-value textAlignRight">{renderValue}</div>
        );
      },
    },
    {
      key: "fee",
      name: t("labelOrderFee"),
      headerCellClass: "textAlignRight",
      formatter: ({ row, column }) => {
        myLog(666, row["fee"]);
        const value = row[column.key].value;
        const token = row[column.key].key;
        const renderValue = value
          ? `${getValuePrecisionThousand(
              value,
              undefined,
              undefined,
              undefined,
              false,
              { floor: false }
            )} ${token}`
          : EmptyValueTag;
        return (
          <div className="rdg-cell-value textAlignRight">{renderValue}</div>
        );
      },
    },
    {
      key: "role",
      name: t("labelOrderRole"),
      headerCellClass: "textAlignRight",
      formatter: ({ row }) => {
        const renderValue = row["fee"].value
          ? t("labelTaker")
          : t("labelMaker");
        return (
          <div className="rdg-cell-value textAlignRight">{renderValue}</div>
        );
      },
    },
    {
      key: "time",
      name: t("labelOrderTime"),
      headerCellClass: "textAlignRight",
      formatter: ({ row, column }) => {
        const value = row[column.key];
        const renderValue = Number.isFinite(value)
          ? moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow()
          : EmptyValueTag;
        return (
          <div className="rdg-cell-value textAlignRight">
            <span>{renderValue}</span>
          </div>
        );
      },
    },
  ];
};

export interface SingleOrderHistoryTableProps {
  rawData: OrderDetailItem[];
  showloading?: boolean;
}

export const SingleOrderHistoryTable = withTranslation("tables")(
  (props: SingleOrderHistoryTableProps & WithTranslation) => {
    const defaultArgs: any = {
      rawData: [],
      columnMode: getColumnModeSingleHistory(props.t),
      generateRows: (rawData: any) => rawData,
      generateColumns,
    };
    return (
      <TableStyled>
        <Table
          className={"scrollable"}
          {...{
            ...defaultArgs,
            ...props,
            rawData: props.rawData,
            showloading: props.showloading,
          }}
        />
      </TableStyled>
    );
  }
);
