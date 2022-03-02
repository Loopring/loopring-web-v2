import React from "react";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { TFunction, WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
import { Column, TablePagination, Table } from "../../basic-lib";
import {
  CompleteIcon,
  EmptyValueTag,
  EXPLORE_TYPE,
  Explorer,
  getFormattedHash,
  getShortAddr,
  getValuePrecisionThousand,
  WaitingIcon,
  WarningIcon,
} from "@loopring-web/common-resources";
import { TableFilterStyled, TablePaddingX } from "../../styled";

import {
  NFTTableFilter,
  NFTTableProps,
  TsTradeStatus,
  TxnDetailProps,
} from "./Interface";
import { Filter } from "./components/Filter";
import { TxNFTType } from "@loopring-web/loopring-sdk";

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
  <Row extends TxnDetailProps>({
    accAddress,
    showFilter = true,
    rawData,
    page,
    pagination,
    txType,
    getTxnList,
    duration,
    showloading,
    etherscanBaseUrl,
    ...props
  }: NFTTableProps<Row> & WithTranslation) => {
    const getColumnModeTransaction = React.useCallback(
      (t: TFunction): Column<Row, Row>[] => [
        {
          key: "side",
          name: t("labelTxSide"),
          formatter: ({ row }) => {
            // const renderValue =
            //   value === TransactionTradeTypes.deposit
            //     ? t("labelDeposit")
            //     : value === TransactionTradeTypes.transfer
            //     ? t("labelTransfer")
            //     : t("labelWithdraw");
            return (
              <Box className="rdg-cell-value" title={row.nftTxType}>
                {t(`labelNFTType${TxNFTType[row.nftTxType]}`)}
              </Box>
            );
          },
        },
        {
          key: "amount",
          name: t("labelTxAmount"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }: { row: Row }) => {
            const hasSymbol =
              row.nftTxType === TxNFTType[TxNFTType.TRANSFER]
                ? row.receiverAddress?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? "+"
                  : "-"
                : row.nftTxType === TxNFTType[TxNFTType.DEPOSIT] ||
                  row.nftTxType === TxNFTType[TxNFTType.MINT]
                ? "+"
                : row.nftTxType === TxNFTType[TxNFTType.WITHDRAW]
                ? "-"
                : "";
            return (
              <>
                <Typography
                  variant={"body1"}
                  component={"span"}
                  marginRight={1}
                >
                  {hasSymbol}
                  {row.amount ?? EmptyValueTag}
                </Typography>
                <Typography variant={"body1"} component={"span"}>
                  {getFormattedHash(row.nftData)}
                </Typography>
              </>
            );
          },
        },
        // {
        //   key: "amount",
        //   name: t("labelAmount"),
        //   formatter: ({ row }) => {
        //     return (
        //       <>
        //         <Typography
        //           variant={"body1"}
        //           component={"span"}
        //           marginRight={1}
        //         >
        //           {row.amount}
        //         </Typography>
        //         <Typography variant={"body1"} component={"span"}>
        //           {getFormattedHash(row.nftData)}
        //         </Typography>
        //       </>
        //     );
        //   },
        // },

        {
          key: "from",
          name: t("labelTxFrom"),
          cellClass: "textAlignRight",
          formatter: ({ row }) => {
            const receiverAddress = getShortAddr(row.receiverAddress);
            const senderAddress = getShortAddr(row.senderAddress);
            const [from, to] =
              row.nftTxType === TxNFTType[TxNFTType.TRANSFER]
                ? row.receiverAddress?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? [senderAddress, "L2"]
                  : ["L2", receiverAddress]
                : row.nftTxType === TxNFTType[TxNFTType.DEPOSIT] ||
                  row.nftTxType === TxNFTType[TxNFTType.MINT]
                ? ["L2 Mint", "L2"]
                : row.nftTxType === TxNFTType[TxNFTType.WITHDRAW]
                ? ["L2", receiverAddress]
                : ["", ""];
            const hash = row.txHash !== "" ? row.txHash : row.hash;
            let path =
              row.txHash !== ""
                ? etherscanBaseUrl + `/tx/${row.txHash}`
                : Explorer +
                  `tx/${row.hash}-${
                    EXPLORE_TYPE["NFT" + row.nftTxType.toUpperCase()]
                  }`;
            return (
              <Box
                className="rdg-cell-value textAlignRight"
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
                  {from + " -> " + to}
                  {/*{hash ? getFormattedHash(hash) : EmptyValueTag}*/}
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
            const fee = row["fee"] ?? {};
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
    const handleFilterChange = (filter: Partial<NFTTableFilter>) => {
      getTxnList({
        page: filter.page ?? page,
        txType:
          filter.txType !== undefined
            ? // @ts-ignore
              filter.txType == 0
              ? undefined
              : filter.txType
            : txType,
        duration: filter.duration ?? duration,
      });
    };
    // const handleReset = () => {
    //   getTxnList({ page: 1, txType: undefined });
    // };
    // const handlePageChange = ({ page: number }) => {
    //   getTxnList({ page: 1, txType: undefined });
    // };
    const defaultArgs: any = {
      columnMode: getColumnModeTransaction(props.t).filter((o) => !o.hidden),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };

    return (
      <TableStyled>
        {showFilter && (
          <TableFilterStyled>
            <Filter
              {...{
                rawData,
                handleFilterChange,
                filterType: txType,
                filterDate: duration,
              }}
            />
          </TableFilterStyled>
        )}
        <Table
          className={"scrollable"}
          {...{ ...defaultArgs, ...props, rawData, showloading }}
        />
        {pagination && pagination.total && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={(page) => {
              handleFilterChange({ page });
            }}
          />
        )}
      </TableStyled>
    );
  }
);
