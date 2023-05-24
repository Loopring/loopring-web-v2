import React, { useEffect } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import {
  AmmTable,
  Button,
  DefiTxsTable,
  DualTxsTable,
  Filter,
  OrderHistoryTable,
  TablePagination,
  Column,
  Table,
  Toast,
  TradeTable,
  // TransactionTable,
  useSettings,
  TransactionTradeViews,
  TransactionTradeTypes,
  TableFilterStyled,
  TablePaddingX,
  TransactionStatus,
  ToastType,
} from "@loopring-web/component-lib";
import { StylePaper, useGetOrderHistorys } from "@loopring-web/core";
import { useTransactions } from "./hooks";

import {
  useSystem,
  useAccount,
  useToast,
  useTokenMap,
  useAmmMap,
} from "@loopring-web/core";
import {
  BackIcon,
  RowConfig,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import styled from "@emotion/styled";
import { BoxProps, Link, Typography } from "@mui/material";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
// import { Column, Table, TablePagination } from "../../basic-lib";
// Column
import {
  CompleteIcon,
  DepositIcon,
  DirectionTag,
  EmptyValueTag,
  EXPLORE_TYPE,
  Explorer,
  getShortAddr,
  getValuePrecisionThousand,
  globalSetup,
  TableType,
  TransferIcon,
  UNIX_TIMESTAMP_FORMAT,
  WaitingIcon,
  WarningIcon,
  WithdrawIcon,
} from "@loopring-web/common-resources";
// import { Column, Table, TablePagination } from "../../basic-lib";
// TablePagination
// import { Filter } from "./components/Filter";
// Filter
// import { TableFilterStyled, TablePaddingX } from "../../styled";
// import {
//   RawDataTransactionItem,
//   TransactionStatus,
//   TransactionTradeTypes,
//   TransactionTradeViews,
// } from "./Interface";
import { DateRange } from "@mui/lab";
import * as sdk from "@loopring-web/loopring-sdk";
import { debounce } from "lodash";
import { Filter2 } from "@loopring-web/component-lib/src/components/tableList/transactionsTable/components/Filter";

// import React from "react";
// import { useSettings } from "../../../stores";
// import { useLocation } from "react-router-dom";
// import _ from "lodash";
const TYPE_COLOR_MAPPING = [
  { type: TransactionStatus.processed, color: "success" },
  { type: TransactionStatus.processing, color: "warning" },
  { type: TransactionStatus.received, color: "warning" },
  { type: TransactionStatus.failed, color: "error" },
];
const CellStatus = ({ row }: any) => {
  const status = row["status"];
  // debugger
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
  return <RenderValue>{svg}</RenderValue>;
};

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 124px auto auto auto 120px 120px !important;`
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
const MemoCellStyled = styled(Box)`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
`;

enum TabIndex {
  transactions = "transactions",
  trades = "trades",
  ammRecords = "ammRecords",
  orders = "orders",
  // orderOpenTable = "orderOpenTable",
  // orderHistoryTable = "orderHistoryTable",
  defiRecords = "defiRecords",
  dualRecords = "dualRecords",
}

enum TabOrderIndex {
  orderOpenTable = "orderOpenTable",
  orderHistoryTable = "orderHistoryTable",
}

type TxsFilterProps = {
  tokenSymbol?: string;
  start?: number;
  end?: number;
  offset?: number;
  limit?: number;
  types?: sdk.UserTxTypes[] | string;
};

interface TransactionTableProps {
  etherscanBaseUrl?: string;
  rawData: any[];
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

// Filter

const TransactionTable = withTranslation(["tables", "common"])(
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
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const [page, setPage] = React.useState(1);
    const [filterType, setFilterType] = React.useState<TransactionTradeViews>(
      TransactionTradeViews.allTypes
    );
    const [filterDate, setFilterDate] = React.useState<
      DateRange<Date | string>
    >(["", ""]);
    const [filterToken, setFilterToken] = React.useState<string>("all");

    const updateData = debounce(
      ({
        tableType,
        currFilterType = filterType,
        currFilterDate = filterDate,
        currFilterToken = filterToken,
        currPage = page,
        pageSize = pagination?.pageSize ?? 10,
      }: {
        tableType: TableType;
        currFilterType?: TransactionTradeViews;
        currFilterDate?: DateRange<Date | string>;
        currFilterToken?: string;
        currPage?: number;
        pageSize?: number;
      }) => {
        if (tableType === "filter") {
          currPage = 1;
          setPage(1);
        }
        const tokenSymbol = currFilterToken === "all" ? "" : currFilterToken;
        const formattedType = currFilterType.toUpperCase();
        const types =
          formattedType === TransactionTradeViews.receive
            ? TransactionTradeTypes.receive //UserTxTypes.DEPOSIT
            : formattedType === TransactionTradeViews.send
            ? TransactionTradeTypes.send
            : formattedType.toUpperCase() ===
              TransactionTradeViews.forceWithdraw
            ? TransactionTradeTypes.forceWithdraw
            : TransactionTradeTypes.allTypes;
        const start = Number(
          moment(currFilterDate[0]).format(UNIX_TIMESTAMP_FORMAT)
        );
        const end = Number(
          moment(currFilterDate[1]).format(UNIX_TIMESTAMP_FORMAT)
        );
        getTxnList({
          limit: pageSize,
          offset: (currPage - 1) * pageSize,
          types,
          tokenSymbol: tokenSymbol,
          start: Number.isNaN(start) ? -1 : start,
          end: Number.isNaN(end) ? -1 : end,
        });
      },
      globalSetup.wait
    );

    const handleFilterChange = React.useCallback(
      ({ type = filterType, date = filterDate, token = filterToken }) => {
        setFilterType(type);
        setFilterDate(date);
        setFilterToken(token);

        updateData({
          tableType: TableType.filter,
          currFilterType: type,
          currFilterDate: date,
          currFilterToken: token,
        });
      },
      [updateData, filterDate, filterType, filterToken]
    );

    const handleReset = React.useCallback(() => {
      setFilterType(TransactionTradeViews.allTypes);
      setFilterDate([null, null]);
      setFilterToken("all");
      updateData({
        tableType: TableType.filter,
        currFilterType: TransactionTradeViews.allTypes,
        currFilterDate: [null, null],
        currFilterToken: "all",
      });
    }, [updateData]);

    const handlePageChange = React.useCallback(
      (currPage: number) => {
        if (currPage === page) return;
        setPage(currPage);
        updateData({ tableType: TableType.page, currPage: currPage });
      },
      [updateData, page]
    );

    const getColumnModeTransaction = React.useCallback(
      (): Column<any, unknown>[] => [
        {
          key: "side",
          name: t("labelTxSide"),
          formatter: ({ row }) => {
            const value = row.side;
            const renderValue =
              value.toLowerCase() === sdk.UserTxTypes.TRANSFER &&
              row.receiverAddress?.toUpperCase() === accAddress?.toUpperCase()
                ? t(`labelTypeReceive`)
                : t(`labelType${value?.toUpperCase()}`);
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
              row.side.toLowerCase() ===
              sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW
                ? ""
                : // t("labelForceWithdrawTotalDes", {
                //     address: getShortAddr(row.withdrawalInfo?.recipient),
                //     symbol: row.symbol,
                //   })
                row.side.toLowerCase() === sdk.UserTxTypes.TRANSFER // TransactionTradeTypes.transfer
                ? row.receiverAddress?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? "+"
                  : "-"
                : row.side.toLowerCase() === sdk.UserTxTypes.DEPOSIT //TransactionTradeTypes.deposit
                ? "+"
                : /chain_withdrawal/i.test(row.side.toLowerCase()) //TransactionTradeTypes.withdraw
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
              <Box
                className="rdg-cell-value textAlignRight"
                title={`${hasSymbol}  ${
                  row.side !== sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW
                    ? `${renderValue} ${unit}`
                    : ""
                }`}
              >
                {hasSymbol}
                {row.side !== sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW &&
                  `${renderValue} ${unit}`}
              </Box>
            );
          },
        },
        {
          key: "fee",
          name: t("labelTxFee"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const fee = row.fee;
            const renderValue =
              fee.value === 0 || fee.value === undefined
                ? EmptyValueTag
                : `${getValuePrecisionThousand(
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
            const receiverAddress = /chain_withdrawal/i.test(
              row.side.toLowerCase()
            )
              ? row.withdrawalInfo
                ? getShortAddr(row.withdrawalInfo.recipient, isMobile)
                : ""
              : getShortAddr(row.receiverAddress, isMobile);
            const senderAddress = getShortAddr(row.senderAddress);
            // myLog("receiverAddress", row.receiverAddress);
            // if (/chain_withdrawal/i.test(row.side.toLowerCase())) {
            //   myLog("receiverAddress", row.receiverAddress);
            // }
            const [from, to] =
              row.side.toLowerCase() == sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW
                ? [
                    t("labelForceWithdrawDes", {
                      address: getShortAddr(row.withdrawalInfo?.recipient),
                    }),
                    "",
                  ]
                : row.side.toLowerCase() === sdk.UserTxTypes.TRANSFER
                ? row.receiverAddress?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? [senderAddress, "L2"]
                  : ["L2", receiverAddress]
                : row.side.toLowerCase() === sdk.UserTxTypes.DEPOSIT
                ? [
                    row.senderAddress.toLowerCase() !== accAddress
                      ? "L1 " + senderAddress
                      : "L1",
                    "L2",
                  ]
                : /chain_withdrawal/i.test(row.side.toLowerCase()) //sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL
                ? [
                    "L2",
                    row.withdrawalInfo?.recipient?.toUpperCase() ===
                    accAddress.toUpperCase()
                      ? "L1"
                      : "L1 " + receiverAddress,
                  ]
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
                title={hash}
              >
                <Link
                  style={{
                    cursor: "pointer",
                    color: "var(--color-primary)",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                  maxWidth={148}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={path}
                  title={
                    from && to ? from + ` ${DirectionTag} ` + to : from + to
                  }
                >
                  {from && to ? from + ` ${DirectionTag} ` + to : from + to}
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
      [t, accAddress, isMobile, etherscanBaseUrl]
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
              row.side.toLowerCase() === sdk.UserTxTypes.TRANSFER &&
              row.receiverAddress?.toUpperCase() === accAddress?.toUpperCase()
                ? t(`labelTypeReceive`)
                : t(`labelType${row.side?.toUpperCase()}`);

            const hasSymbol =
              row.side.toLowerCase() ===
              sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW
                ? ""
                : // t("labelForceWithdrawTotalDes", {
                //     address: getShortAddr(row.withdrawalInfo?.recipient),
                //     symbol: row.symbol,
                //   })
                row.side.toLowerCase() === sdk.UserTxTypes.TRANSFER
                ? row["receiverAddress"]?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? "+"
                  : "-"
                : row.side.toLowerCase() === sdk.UserTxTypes.DEPOSIT
                ? "+"
                : row.side.toLowerCase() ===
                  sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW
                ? "-"
                : "";
            const sideIcon =
              row.side.toLowerCase() ===
              sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW ? (
                <WithdrawIcon fontSize={"inherit"} />
              ) : row.side.toLowerCase() === sdk.UserTxTypes.DEPOSIT ? (
                <DepositIcon fontSize={"inherit"} />
              ) : row.side.toLowerCase() === sdk.UserTxTypes.TRANSFER ? (
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
                height={"100%"}
                title={`${hasSymbol}  ${renderValue} ${unit}`}
              >
                {/*{side + " "}*/}
                <Typography
                  display={"flex"}
                  marginRight={1}
                  variant={"h3"}
                  alignItems={"center"}
                  flexDirection={"column"}
                  width={"62px"}
                >
                  {sideIcon}
                  <Typography
                    component={"span"}
                    fontSize={10}
                    marginTop={-1}
                    textOverflow={"ellipsis"}
                  >
                    {side}
                  </Typography>
                </Typography>
                <Box display={"flex"} flex={1} flexDirection={"column"}>
                  <Typography
                    display={"inline-flex"}
                    justifyContent={"flex-end"}
                    alignItems={"center"}
                  >
                    {hasSymbol + renderValue + " " + unit}
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
            // row.side.toLowerCase() === sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL
            const receiverAddress = /chain_withdrawal/i.test(
              row.side.toLowerCase()
            )
              ? getShortAddr(row.withdrawalInfo.recipient, isMobile)
              : getShortAddr(row.receiverAddress, isMobile);

            const senderAddress = getShortAddr(row.senderAddress, isMobile);
            const [from, to] =
              row.side.toLowerCase() ===
              sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW
                ? [
                    t("labelForceWithdrawDes", {
                      address: getShortAddr(row.withdrawalInfo?.recipient),
                    }),
                    "",
                  ]
                : row.side.toLowerCase() === sdk.UserTxTypes.TRANSFER
                ? row["receiverAddress"]?.toUpperCase() ===
                  accAddress?.toUpperCase()
                  ? [senderAddress, "L2"]
                  : ["L2", receiverAddress]
                : row.side.toLowerCase() === sdk.UserTxTypes.DEPOSIT
                ? [
                    row.senderAddress.toLowerCase() !== accAddress
                      ? "L1 " + senderAddress
                      : "L1",
                    "L2",
                  ]
                : /chain_withdrawal/i.test(row.side.toLowerCase()) //sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL
                ? [
                    "L2",
                    row.withdrawalInfo?.recipient?.toUpperCase() ===
                    accAddress.toUpperCase()
                      ? "L1"
                      : "L1 " + receiverAddress,
                  ]
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
                title={hash}
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
                  {/*<Typography*/}
                  {/*  style={{*/}
                  {/*    cursor: "pointer",*/}
                  {/*  }}*/}
                  {/*  color={"var(--color-primary)"}*/}
                  {/*  title={hash}*/}
                  {/*>*/}
                  {/*  {from + ` ${DirectionTag} ` + to}*/}
                  {/*</Typography>*/}
                  <Link
                    style={{
                      cursor: "pointer",
                      color: "var(--color-primary)",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                    maxWidth={148}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={path}
                    title={
                      from && to ? from + ` ${DirectionTag} ` + to : from + to
                    }
                  >
                    {from && to ? from + ` ${DirectionTag} ` + to : from + to}
                  </Link>
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
      [t, accAddress, isMobile, etherscanBaseUrl]
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
    React.useEffect(() => {
      let filters: any = {};
      updateData.cancel();
      if (searchParams.get("types")) {
        filters.type = searchParams.get("types");
      }
      handleFilterChange(filters);
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);

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
              {t("labelShowFilter")}
            </Link>
          ) : (
            <TableFilterStyled>
              <Filter2
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
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    );
  }
);

export const ContactTransactionsPage = withTranslation("common")(
  (rest: WithTranslation<"common">) => {
    const history = useHistory();
    const { isMobile } = useSettings();

    const [pageSize, setPageSize] = React.useState(0);

    const { toastOpen, closeToast } = useToast();
    const { totalCoinMap } = useTokenMap();

    const { etherscanBaseUrl } = useSystem();

    const {
      account: { accAddress, accountId },
    } = useAccount();

    const container = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      let height = container?.current?.offsetHeight;
      if (height) {
        const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
        setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3);
        // handleTabChange(currentTab, pageSize);
      }
    }, [container?.current?.offsetHeight]);
    const {
      txs: txTableData,
      txsTotal,
      showLoading: showTxsLoading,
      getUserTxnList,
    } = useTransactions();
    useEffect(() => {
      getUserTxnList({});
    }, []);

    return (
      <Box flex={1} display={"flex"} flexDirection={"column"}>
        <Box marginBottom={2}>
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={history.goBack}
          >
            Contacts
          </Button>
        </Box>
        <StylePaper ref={container} flex={1}>
          <Toast
            alertText={toastOpen?.content ?? ""}
            severity={toastOpen?.type ?? ToastType.success}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
          />
          <Box
            marginTop={2}
            marginLeft={2}
            display={"flex"}
            sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
          ></Box>
          <Box
            className="tableWrapper table-divide-short"
            display={"flex"}
            flex={1}
            overflow={"scroll"}
          >
            <TransactionTable
              {...{
                etherscanBaseUrl,
                rawData: txTableData,
                pagination: {
                  pageSize: pageSize,
                  total: txsTotal,
                },
                filterTokens: totalCoinMap
                  ? (Reflect.ownKeys(totalCoinMap) as string[])
                  : [],
                showFilter: true,
                showloading: showTxsLoading,
                getTxnList: getUserTxnList,
                accAddress,
                accountId,
                ...rest,
              }}
            />
          </Box>
        </StylePaper>
      </Box>
    );
  }
);

// export default HistoryPanel;
