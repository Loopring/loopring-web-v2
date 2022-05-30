import styled from "@emotion/styled";
import { Box, BoxProps, Link, Modal, Typography } from "@mui/material";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table, TablePagination } from "../../basic-lib";
import {
  CompleteIcon,
  DepositIcon,
  DirectionTag,
  EmptyValueTag,
  EXPLORE_TYPE,
  Explorer,
  getShortAddr,
  getValuePrecisionThousand,
  TableType,
  TransferIcon,
  WaitingIcon,
  WarningIcon,
  WithdrawIcon,
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
import React from "react";
import { useSettings } from "../../../stores";

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

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 120px auto auto auto 120px 150px !important;`
        : `--template-columns: 60% 40% !important;`}
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
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element;

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
  filterTokens: string[];
  showFilter?: boolean;
  showloading: boolean;
  accAddress: string;
  accountId: number;
}

export const TransactionTable = withTranslation(["tables", "common"])(
  (props: TransactionTableProps & WithTranslation) => {
    const {
      rawData,
      pagination,
      showFilter,
      getTxnList,
      filterTokens,
      showloading,
      etherscanBaseUrl,
      accAddress,
      accountId,
      t,
    } = props;
    const { isMobile } = useSettings();
    const [page, setPage] = React.useState(1);
    const [filterType, setFilterType] = React.useState(
      TransactionTradeTypes.allTypes
    );
    const [filterDate, setFilterDate] = React.useState<
      DateRange<Date | string>
    >(["", ""]);
    const [filterToken, setFilterToken] = React.useState<string>("all");
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
        if (TableType === "filter") {
          currPage = 1;
          setPage(1);
        }
        const tokenSymbol = currFilterToken === "all" ? "" : currFilterToken;
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
          offset: (currPage - 1) * pageSize,
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
      setFilterToken("all");
      updateData({
        TableType: TableType.filter,
        currFilterType: TransactionTradeTypes.allTypes,
        currFilterDate: [null, null],
        currFilterToken: "all",
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
      (): Column<any, unknown>[] => [
        {
          key: "side",
          name: t("labelTxSide"),
          formatter: ({ row }) => {
            const value = row["side"];
            const renderValue = t(`labelType${value.toUpperCase()}`);
            // const renderValue =
            //   value === TransactionTradeTypes.deposit
            //     ? t("labelReceive")
            //     : value === TransactionTradeTypes.transfer
            //     ? t("labelSendL2")
            //     : t("labelSendL1");
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
          key: "from",
          name: t("labelTxFrom"),
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          formatter: ({ row }) => {
            const receiverAddress =
              row["side"] === "OFFCHAIN_WITHDRAWAL"
                ? getShortAddr(row.withdrawalInfo.recipient, isMobile)
                : getShortAddr(row.receiverAddress, isMobile);
            const senderAddress = getShortAddr(row.senderAddress);
            const [from, to] =
              row["side"] === "TRANSFER"
                ? row["receiverAddress"]?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? [senderAddress, "L2"]
                  : ["L2", receiverAddress]
                : row["side"] === "DEPOSIT"
                ? ["L1", "L2"]
                : row["side"] === "OFFCHAIN_WITHDRAWAL"
                ? ["L2", receiverAddress]
                : ["", ""];
            const hash = row.txHash !== "" ? row.txHash : row.hash;
            const path =
              row.txHash !== ""
                ? etherscanBaseUrl + `/tx/${row.txHash}`
                : Explorer +
                  `tx/${row.hash}-${EXPLORE_TYPE[row.txType.toUpperCase()]}`;
            return (
              <Box
                className="rdg-cell-value textAlignRight"
                display={"inline-flex"}
                justifyContent={"flex-end"}
                alignItems={"center"}
              >
                <Link
                  style={{
                    cursor: "pointer",
                    color: "var(--color-primary)",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={path}
                  title={hash}
                >
                  {from + ` ${DirectionTag} ` + to}
                  {/*{hash ? getFormattedHash(hash) : EmptyValueTag}*/}
                </Link>
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
      [handleTxnDetail, etherscanBaseUrl, t]
    );

    const getColumnMobileTransaction = React.useCallback(
      (): Column<any, unknown>[] => [
        {
          key: "amount",
          name: (
            <Typography
              height={"100%"}
              display={"flex"}
              justifyContent={"space-between"}
              variant={"inherit"}
              color={"inherit"}
              alignItems={"center"}
            >
              <span>{t("labelTransactions")}</span>
              <span>{t("labelTxAmount") + " / " + t("labelTxFee")}</span>
            </Typography>
          ),
          cellClass: "textAlignRight",
          headerCellClass: "textAlignLeft",
          formatter: ({ row }) => {
            const { unit, value } = row["amount"];
            const hasValue = Number.isFinite(value);
            const side =
              row.side === TransactionTradeTypes.deposit
                ? t("labelReceive")
                : row.side === TransactionTradeTypes.transfer
                ? t("labelSendL2")
                : t("labelSendL1");
            const hasSymbol =
              row.side === "TRANSFER"
                ? row["receiverAddress"]?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? "+"
                  : "-"
                : row.side === "DEPOSIT"
                ? "+"
                : row.side === "OFFCHAIN_WITHDRAWAL"
                ? "-"
                : "";
            const sideIcon =
              row.side === TransactionTradeTypes.deposit ? (
                <DepositIcon fontSize={"inherit"} />
              ) : row.side === TransactionTradeTypes.transfer ? (
                <TransferIcon fontSize={"inherit"} />
              ) : (
                <WithdrawIcon fontSize={"inherit"} />
              );
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

            const renderFee = `Fee: ${getValuePrecisionThousand(
              row.fee.value,
              undefined,
              undefined,
              undefined,
              false,
              {
                floor: false,
                isTrade: true,
              }
            )} ${row.fee.unit}`;
            return (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"flex-start"}
                title={side}
                height={"100%"}
              >
                {/*{side + " "}*/}
                <Typography
                  display={"flex"}
                  marginRight={1}
                  variant={"h3"}
                  alignItems={"center"}
                  flexDirection={"column"}
                  width={"50px"}
                >
                  {sideIcon}
                  <Typography fontSize={10} marginTop={-1}>
                    {side}
                  </Typography>
                </Typography>
                <Box display={"flex"} flex={1} flexDirection={"column"}>
                  <Typography
                    display={"inline-flex"}
                    justifyContent={"flex-end"}
                    alignItems={"center"}
                  >
                    {hasSymbol}
                    {renderValue} {unit || ""}
                  </Typography>
                  <Typography color={"textSecondary"} variant={"body2"}>
                    {renderFee}
                  </Typography>
                </Box>
              </Box>
            );
          },
        },
        {
          key: "from",
          name: t("labelTxFrom") + " / " + t("labelTxTime"),
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          formatter: ({ row }) => {
            const receiverAddress =
              row["side"] === "OFFCHAIN_WITHDRAWAL"
                ? getShortAddr(row.withdrawalInfo.recipient, isMobile)
                : getShortAddr(row.receiverAddress, isMobile);

            const senderAddress = getShortAddr(row.senderAddress, isMobile);
            const [from, to] =
              row["side"] === "TRANSFER"
                ? row["receiverAddress"]?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? [senderAddress, "L2"]
                  : ["L2", receiverAddress]
                : row["side"] === "DEPOSIT"
                ? ["L1", "L2"]
                : row["side"] === "OFFCHAIN_WITHDRAWAL"
                ? ["L2", receiverAddress]
                : ["", ""];
            const hash = row.txHash !== "" ? row.txHash : row.hash;
            const path =
              row.txHash !== ""
                ? etherscanBaseUrl + `/tx/${row.txHash}`
                : Explorer +
                  `tx/${row.hash}-${EXPLORE_TYPE[row.txType.toUpperCase()]}`;

            const hasValue = Number.isFinite(row.time);
            const renderTime = hasValue
              ? moment(new Date(row.time), "YYYYMMDDHHMM").fromNow()
              : EmptyValueTag;

            return (
              <Box
                display={"flex"}
                flex={1}
                flexDirection={"column"}
                onClick={() => {
                  window.open(path, "_blank");
                  window.opener = null;
                }}
              >
                <Typography
                  display={"inline-flex"}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                >
                  <Typography
                    style={{
                      cursor: "pointer",
                    }}
                    color={"var(--color-primary)"}
                    title={hash}
                  >
                    {from + ` ${DirectionTag} ` + to}
                  </Typography>
                  <Typography marginLeft={1}>
                    <CellStatus {...{ row }} />
                  </Typography>
                </Typography>
                <Typography color={"textSecondary"} variant={"body2"}>
                  {renderTime}
                </Typography>
              </Box>
            );
          },
        },
      ],
      [handleTxnDetail, etherscanBaseUrl, isMobile, t]
    );
    const [isDropDown, setIsDropDown] = React.useState(true);

    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnMobileTransaction()
        : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };

    return (
      <TableStyled isMobile={isMobile}>
        {showFilter &&
          (isMobile && isDropDown ? (
            <Link
              variant={"body1"}
              display={"inline-flex"}
              width={"100%"}
              justifyContent={"flex-end"}
              paddingRight={2}
              onClick={() => setIsDropDown(false)}
            >
              Show Filter
            </Link>
          ) : (
            <TableFilterStyled>
              <Filter
                filterTokens={filterTokens}
                // originalData={rawData}
                filterDate={filterDate}
                filterType={filterType}
                filterToken={filterToken}
                handleFilterChange={handleFilterChange}
                handleReset={handleReset}
              />
            </TableFilterStyled>
          ))}
        <Modal open={modalState} onClose={() => setModalState(false)}>
          <TxnDetailPanel {...{ ...txnDetailInfo }} />
        </Modal>
        <Table
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,
            rawData,
            showloading,
          }}
        />
        {!!(accountId && showFilter) && (
          <Typography
            display={"flex"}
            justifyContent={"flex-end"}
            textAlign={"right"}
            paddingRight={5 / 2}
            paddingY={1}
          >
            <Trans i18nKey={"labelGoExplore"} ns={"common"}>
              View transactions on
              <Link
                display={"inline-flex"}
                target="_blank"
                rel="noopener noreferrer"
                href={Explorer + `/account/${accountId}`}
                paddingLeft={1 / 2}
              >
                block explorer
              </Link>
            </Trans>
          </Typography>
        )}
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
