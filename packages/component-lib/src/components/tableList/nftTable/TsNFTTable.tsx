import React from "react";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { TFunction, WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table } from "../../basic-lib";
import {
  CompleteIcon,
  EmptyValueTag,
  Explorer,
  getFormattedHash,
  getValuePrecisionThousand,
  WaitingIcon,
  WarningIcon,
} from "@loopring-web/common-resources";
import { TablePaddingX } from "../../styled";

import { NFTTableProps, TsTradeStatus, TxnDetailProps } from "./Interface";
import { TxType } from "@loopring-web/loopring-sdk";

const TYPE_COLOR_MAPPING = [
  { type: TsTradeStatus.processed, color: "success" },
  { type: TsTradeStatus.processing, color: "warning" },
  { type: TsTradeStatus.received, color: "warning" },
  { type: TsTradeStatus.failed, color: "error" },
];

const CellStatus = ({ row: { status } }: any) => {
  const RenderValue = styled.div`
    display: flex;
    align-items: center;
    color: ${({ theme }) =>
      theme.colorBase[
        `${TYPE_COLOR_MAPPING.find((o) => o.type === status)?.color}`
      ]};

    & svg {
      width: 24px;
      height: 24px;
    }
  `;
  const svg =
    status === "processed" ? (
      <CompleteIcon />
    ) : status === "processing" || status === "received" ? (
      <WaitingIcon />
    ) : (
      <WarningIcon />
    );
  const RenderValueWrapper = <RenderValue>{svg}</RenderValue>;
  return RenderValueWrapper;
};

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    .rdgCellCenter {
      height: 100%;
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

export const TsNFTTable = withTranslation(["tables", "common"])(
  <Row extends TxnDetailProps>(props: NFTTableProps & WithTranslation) => {
    const { rawData, showloading, etherscanBaseUrl } = props;
    // const [page, setPage] = React.useState(1);
    // const updateData = React.useCallback(
    //   (page) => {
    //     setPage(page);
    //     getTxnList(page);
    //   },
    //   [getTxnList]
    // );

    // const handlePageChange = React.useCallback(
    //   (currPage: number) => {
    //     if (currPage === page) return;
    //     setPage(currPage);
    //     updateData({ TableType: TableType.page, currPage: currPage });
    //   },
    //   [updateData, page]
    // );

    const getColumnModeTransaction = React.useCallback(
      (t: TFunction): Column<Row, unknown>[] => [
        {
          key: "amount",
          name: t("labelAmount"),
          formatter: ({ row }) => {
            return (
              <>
                <Typography
                  variant={"body1"}
                  component={"span"}
                  marginRight={1}
                >
                  {row.amount}
                </Typography>
                <Typography variant={"body1"} component={"span"}>
                  {getFormattedHash(row.nftData)}
                </Typography>
              </>
            );
          },
        },
        {
          key: "txnHash",
          name: t("labelTxTxnHash"),
          cellClass: "textAlignRight",
          formatter: ({ row }) => {
            const path =
              row.txHash !== ""
                ? etherscanBaseUrl + `/tx/${row.txHash}`
                : Explorer + `/tx/${row.blockId}-${row.indexInBlock}`;
            const hash = row.txHash !== "" ? row.txHash : row.hash;
            return (
              <Box
                className="rdg-cell-value"
                display={"inline-flex"}
                justifyContent={"flex-end"}
                alignItems={"center"}
              >
                <Typography
                  style={{
                    cursor: "pointer",
                  }}
                  color={"var(--color-primary)"}
                  onClick={() => window.open(path, "_blank")}
                  title={hash}
                >
                  {hash ? getFormattedHash(hash) : EmptyValueTag}
                </Typography>
                <Box marginLeft={1}>
                  <CellStatus {...{ row }} />
                </Box>
              </Box>
            );
          },
        },
        {
          key: "fee",
          name: t("labelTxFee"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const fee = row["fee"];
            const renderValue = `${getValuePrecisionThousand(
              fee.value,
              undefined,
              undefined,
              undefined,
              false,
              {
                floor: false,
                isTrade: true,
              }
            )} ${fee.unit}`;
            return (
              <Box className="rdg-cell-value textAlignRight">{renderValue}</Box>
            );
          },
        },
        {
          key: "memo",
          name: t("labelTxMemo"),
          headerCellClass: "textAlignCenter",
          formatter: ({ row }) => (
            <Box title={row.memo} className="rdg-cell-value textAlignCenter">
              {row["memo"] || EmptyValueTag}
            </Box>
          ),
        },
        {
          key: "time",
          name: t("labelTxTime"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const value = row.createdAt;
            const hasValue = Number.isFinite(value);
            const renderValue = hasValue
              ? moment(new Date(value), "YYYYMMDDHHMM").fromNow()
              : EmptyValueTag;
            return (
              <Box className="rdg-cell-value textAlignRight">{renderValue}</Box>
            );
          },
        },
      ],
      [etherscanBaseUrl]
    );

    const defaultArgs: any = {
      columnMode: getColumnModeTransaction(props.t).filter((o) => !o.hidden),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };

    return (
      <>
        <TableStyled>
          <Table
            className={"scrollable"}
            {...{ ...defaultArgs, ...props, rawData, showloading }}
          />
          {/*{pagination && (*/}
          {/*  <TablePagination*/}
          {/*    page={page}*/}
          {/*    pageSize={pagination.pageSize}*/}
          {/*    total={pagination.total}*/}
          {/*    onPageChange={handlePageChange}*/}
          {/*  />*/}
          {/*)}*/}
        </TableStyled>
      </>
    );
  }
);
