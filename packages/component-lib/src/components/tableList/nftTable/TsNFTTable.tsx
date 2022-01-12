import React from "react";
import styled from "@emotion/styled";
import { Box, Link, Modal } from "@mui/material";
import { TFunction, WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table, TablePagination } from "../../basic-lib";
import {
  CompleteIcon,
  EmptyValueTag,
  getFormattedHash,
  getValuePrecisionThousand,
  TableType,
  WaitingIcon,
  WarningIcon,
} from "@loopring-web/common-resources";
import { Filter } from "./components/Filter";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import { DateRange } from "@mui/lab";
import { TxType } from "@loopring-web/loopring-sdk";
import {
  RawDataTsNFTItem,
  TsTradeStatus,
  TxsFilterProps,
  TxnDetailProps,
} from "./Interface";
import { TxnDetailPanel } from "../transactionsTable/components/modal";

const TYPE_COLOR_MAPPING = [
  { type: TsTradeStatus.processed, color: "success" },
  { type: TsTradeStatus.processing, color: "warning" },
  { type: TsTradeStatus.received, color: "warning" },
  { type: TsTradeStatus.failed, color: "error" },
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
  rawData: RawDataTsNFTItem[];
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

export const TsNFTTable = withTranslation(["tables", "common"])(
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
    const [page, setPage] = React.useState(1);
    const [filterDate, setFilterDate] = React.useState<
      DateRange<Date | string>
    >(["", ""]);
    const [filterToken, setFilterToken] = React.useState<string>("All Tokens");
    const pageSize = pagination ? pagination.pageSize : 10;

    const updateData = React.useCallback(
      ({
        TableType,
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
        const start = Number(moment(currFilterDate[0]).format("x"));
        const end = Number(moment(currFilterDate[1]).format("x"));
        getTxnList({
          limit: pageSize,
          offset: (actualPage - 1) * pageSize,
          tokenSymbol: tokenSymbol,
          start: Number.isNaN(start) ? -1 : start,
          end: Number.isNaN(end) ? -1 : end,
        });
      },
      [filterDate, filterToken, getTxnList, page, pageSize]
    );
    const handleTxnDetail = React.useCallback(
      (prop: TxnDetailProps) => {
        setModalState(true);
        setTxnDetailInfo(prop);
      },
      [setModalState, setTxnDetailInfo]
    );
    const handleFilterChange = React.useCallback(
      ({ date = filterDate, token = filterToken }) => {
        setFilterDate(date);
        setFilterToken(token);
        updateData({
          TableType: TableType.filter,
          currFilterDate: date,
          currFilterToken: token,
        });
      },
      [updateData, filterDate, filterToken]
    );

    const handleReset = React.useCallback(() => {
      setFilterDate([null, null]);
      setFilterToken("All Tokens");
      updateData({
        TableType: TableType.filter,
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

    const getColumnModeTransaction = React.useCallback(
      (t: TFunction): Column<any, unknown>[] => [
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
          formatter: ({ row }) => {
            const path = row["path"] || "";
            const value = row["txnHash"];
            const RenderValue = styled(Box)`
              color: ${({ theme }) =>
                theme.colorBase[value ? "secondary" : "textSecondary"]};
              cursor: pointer;
            `;

            const {
              hash,
              txHash,
              txType,
              status,
              time,
              receiverAddress,
              recipient,
              senderAddress,
              amount,
              fee,
              memo,
            } = row;

            const receiver =
              txType === TxType.TRANSFER
                ? receiverAddress
                : txType === TxType.OFFCHAIN_WITHDRAWAL
                ? recipient
                : "";
            const formattedDetail = {
              txType,
              hash,
              txHash,
              status,
              time,
              from: senderAddress,
              to: receiver,
              fee: `${getValuePrecisionThousand(
                fee.value,
                undefined,
                undefined,
                undefined,
                false,
                {
                  isTrade: true,
                  floor: false,
                }
              )} ${fee.unit}`,
              amount: `${getValuePrecisionThousand(
                amount.value,
                undefined,
                undefined,
                undefined,
                false,
                { isTrade: true }
              )} ${amount.unit}`,
              memo,
              etherscanBaseUrl,
            };
            return (
              <Box
                className="rdg-cell-value "
                display={"flex"}
                justifyContent={"flex-end"}
                alignItems={"center"}
              >
                {path ? (
                  <Link href={path}>
                    <RenderValue title={value}>
                      {value || EmptyValueTag}
                    </RenderValue>
                  </Link>
                ) : (
                  <RenderValue
                    onClick={() => handleTxnDetail(formattedDetail)}
                    title={value}
                  >
                    {value ? getFormattedHash(value) : EmptyValueTag}
                  </RenderValue>
                )}
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
      <>
        <Modal open={modalState} onClose={() => setModalState(false)}>
          <TxnDetailPanel {...{ ...txnDetailInfo }} />
        </Modal>

        <TableStyled>
          {showFilter && (
            <TableFilterStyled>
              <Filter
                originalData={rawData}
                filterDate={filterDate}
                filterToken={filterToken}
                handleFilterChange={handleFilterChange}
                handleReset={handleReset}
              />
            </TableFilterStyled>
          )}
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
      </>
    );
  }
);
