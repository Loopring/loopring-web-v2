import React from "react";
import styled from "@emotion/styled";
import { Box, Modal, Typography } from "@mui/material";
import { TFunction, WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table, TablePagination } from "../../basic-lib";
import {
  CompleteIcon,
  EmptyValueTag,
  EXPLORE_TYPE,
  Explorer,
  getFormattedHash,
  getValuePrecisionThousand,
  TableType,
  WaitingIcon,
  WarningIcon,
} from "@loopring-web/common-resources";
import { Filter } from "./components/Filter";
import { TxnDetailPanel, TxnDetailProps } from "./components/modal";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import {
  RawDataTransactionItem,
  TransactionStatus,
  TransactionTradeTypes,
} from "./Interface";
import { DateRange } from "@mui/lab";
import { UserTxTypes } from "@loopring-web/loopring-sdk";

export type TxsFilterProps = {
  tokenSymbol?: string;
  start?: number;
  end?: number;
  offset?: number;
  limit?: number;
  types?: UserTxTypes[] | string;
};

const TYPE_COLOR_MAPPING = [
  { type: TransactionStatus.processed, color: "success" },
  { type: TransactionStatus.processing, color: "warning" },
  { type: TransactionStatus.received, color: "warning" },
  { type: TransactionStatus.failed, color: "error" },
];

const CellStatus = ({ row }: any) => {
  const status = row["status"];
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

const MemoCellStyled = styled(Box)`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
`;

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    --template-columns: 120px auto auto auto 120px 150px !important;

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

export interface TransactionTableProps {
  etherscanBaseUrl?: string;
  rawData: RawDataTransactionItem[];
  pagination?: {
    pageSize: number;
    total: number;
  };
  getTxnList: ({
    tokenSymbol,
    start,
    end,
    limit,
    offset,
    types,
  }: TxsFilterProps) => Promise<void>;
  showFilter?: boolean;
  showloading: boolean;
  accAddress?: string;
}

export const TransactionTable = withTranslation(["tables", "common"])(
  (props: TransactionTableProps & WithTranslation) => {
    const {
      rawData,
      pagination,
      showFilter,
      getTxnList,
      showloading,
      etherscanBaseUrl,
      accAddress,
    } = props;
    const [page, setPage] = React.useState(1);
    const [filterType, setFilterType] = React.useState(
      TransactionTradeTypes.allTypes
    );
    const [filterDate, setFilterDate] = React.useState<
      DateRange<Date | string>
    >(["", ""]);
    const [filterToken, setFilterToken] = React.useState<string>("All Tokens");
    const [modalState, setModalState] = React.useState(false);
    const [txnDetailInfo, setTxnDetailInfo] = React.useState<TxnDetailProps>({
      hash: "",
      txHash: "",
      status: "processed",
      time: "",
      from: "",
      to: "",
      amount: "",
      fee: "",
      memo: "",
    });

    const pageSize = pagination ? pagination.pageSize : 10;

    const updateData = React.useCallback(
      ({
        TableType,
        currFilterType = filterType,
        currFilterDate = filterDate,
        currFilterToken = filterToken,
        currPage = page,
      }) => {
        let actualPage = currPage;
        if (TableType === "filter") {
          actualPage = 1;
          setPage(1);
        }
        const tokenSymbol =
          currFilterToken === "All Tokens" ? "" : currFilterToken;
        const formattedType = currFilterType.toUpperCase();
        const types =
          currFilterType === TransactionTradeTypes.allTypes
            ? "deposit,transfer,offchain_withdrawal"
            : formattedType === TransactionTradeTypes.deposit
            ? "deposit"
            : formattedType === TransactionTradeTypes.transfer
            ? "transfer"
            : "offchain_withdrawal";
        const start = Number(moment(currFilterDate[0]).format("x"));
        const end = Number(moment(currFilterDate[1]).format("x"));
        getTxnList({
          limit: pageSize,
          offset: (actualPage - 1) * pageSize,
          types: types,
          tokenSymbol: tokenSymbol,
          start: Number.isNaN(start) ? -1 : start,
          end: Number.isNaN(end) ? -1 : end,
        });
      },
      [filterDate, filterType, filterToken, getTxnList, page, pageSize]
    );

    const handleFilterChange = React.useCallback(
      ({ type = filterType, date = filterDate, token = filterToken }) => {
        setFilterType(type);
        setFilterDate(date);
        setFilterToken(token);
        updateData({
          TableType: TableType.filter,
          currFilterType: type,
          currFilterDate: date,
          currFilterToken: token,
        });
      },
      [updateData, filterDate, filterType, filterToken]
    );

    const handleReset = React.useCallback(() => {
      setFilterType(TransactionTradeTypes.allTypes);
      setFilterDate([null, null]);
      setFilterToken("All Tokens");
      updateData({
        TableType: TableType.filter,
        currFilterType: TransactionTradeTypes.allTypes,
        currFilterDate: [null, null],
        currFilterToken: "All Tokens",
      });
    }, [updateData]);

    const handlePageChange = React.useCallback(
      (currPage: number) => {
        if (currPage === page) return;
        setPage(currPage);
        updateData({ TableType: TableType.page, currPage: currPage });
      },
      [updateData, page]
    );

    const handleTxnDetail = React.useCallback(
      (prop: TxnDetailProps) => {
        setModalState(true);
        setTxnDetailInfo(prop);
      },
      [setModalState, setTxnDetailInfo]
    );

    const getColumnModeTransaction = React.useCallback(
      (t: TFunction): Column<any, unknown>[] => [
        {
          key: "side",
          name: t("labelTxSide"),
          formatter: ({ row }) => {
            const value = row["side"];
            const renderValue =
              value === TransactionTradeTypes.deposit
                ? t("labelDeposit")
                : value === TransactionTradeTypes.transfer
                ? t("labelTransfer")
                : t("labelWithdraw");
            return <Box className="rdg-cell-value">{renderValue}</Box>;
          },
        },
        {
          key: "amount",
          name: t("labelTxAmount"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const { unit, value } = row["amount"];
            const hasValue = Number.isFinite(value);
            const hasSymbol =
              row["side"] === "TRANSFER"
                ? row["receiverAddress"]?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? "+"
                  : "-"
                : row["side"] === "DEPOSIT"
                ? "+"
                : row["side"] === "OFFCHAIN_WITHDRAWAL"
                ? "-"
                : "";
            const renderValue = hasValue
              ? `${getValuePrecisionThousand(
                  value,
                  undefined,
                  undefined,
                  undefined,
                  false,
                  { isTrade: true }
                )}`
              : EmptyValueTag;
            return (
              <Box className="rdg-cell-value textAlignRight">
                {hasSymbol}
                {renderValue} {unit || ""}
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
          key: "txnHash",
          name: t("labelTxTxnHash"),
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          formatter: ({ row }) => {
            const hash = row.txHash !== "" ? row.txHash : row.hash;
            // if (
            //   row.txHash ||
            //   (row.blockIdInfo.blockId &&
            //     row.storageInfo &&
            //     (row.storageInfo.tokenId || row.storageInfo.storageId))
            // ) {
            const path =
              row.txHash !== ""
                ? etherscanBaseUrl + `/tx/${row.txHash}`
                : row.storageInfo.tokenId || row.storageInfo.storageId
                ? Explorer +
                  `tx/${row.storageInfo.accountId}-${row.storageInfo.tokenId}-${row.storageInfo.storageId}`
                : Explorer +
                  `tx/${row.hash}-${EXPLORE_TYPE[row.txType.toUpperCase()]}`;
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
          key: "status",
          name: t("labelTxMemo"),
          headerCellClass: "textAlignCenter",
          formatter: ({ row }) => (
            <MemoCellStyled
              title={row["memo"]}
              className="rdg-cell-value textAlignLeft"
            >
              {row["memo"] || EmptyValueTag}
            </MemoCellStyled>
          ),
        },
        {
          key: "time",
          name: t("labelTxTime"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const value = row["time"];
            const hasValue = Number.isFinite(value);
            const renderValue = hasValue
              ? moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow()
              : EmptyValueTag;
            return (
              <Box className="rdg-cell-value textAlignRight">{renderValue}</Box>
            );
          },
        },
      ],
      [handleTxnDetail, etherscanBaseUrl]
    );

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
              originalData={rawData}
              filterDate={filterDate}
              filterType={filterType}
              filterToken={filterToken}
              handleFilterChange={handleFilterChange}
              handleReset={handleReset}
            />
          </TableFilterStyled>
        )}
        <Modal open={modalState} onClose={() => setModalState(false)}>
          <TxnDetailPanel {...{ ...txnDetailInfo }} />
        </Modal>
        <Table {...{ ...defaultArgs, ...props, rawData, showloading }} />
        {pagination && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    );
  }
);
