import React, { useCallback, useEffect, useState } from "react";
import { PopoverPure, Button, CancelAllOrdersAlert } from "../../index";
import { bindTrigger } from "material-ui-popup-state/es";
import styled from "@emotion/styled";
import { Box, Modal, Typography, ClickAwayListener, Grid } from "@mui/material";
import { DateRange } from "@mui/lab";
import { WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
import { usePopupState, bindPopper } from "material-ui-popup-state/hooks";
import {
  DropDownIcon,
  EmptyValueTag,
  TableType,
  TradeStatus,
  TradeTypes,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { Column, Table, TablePagination } from "../../basic-lib";
import { Filter, FilterOrderTypes } from "./components/Filter";
import { OrderDetailPanel } from "./components/modal";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import {
  GetOrdersRequest,
  Side,
  OrderType,
  GetUserTradesRequest,
} from "@loopring-web/loopring-sdk";

const CancelColHeaderStyled = styled(Typography)`
  display: flex;
  align-items: center;
  color: ${({ empty }: any) =>
    empty === "true" ? "var(--color-text-third)" : "var(--color-primary)"};
  cursor: ${({ empty }: any) => (empty === "true" ? "not-allowed" : "pointer")};
` as any;

export type OrderPair = {
  from: {
    key: string;
    value: number;
  };
  to: {
    key: string;
    value: number;
  };
};

export interface OrderHistoryRow {
  side: keyof typeof TradeTypes;
  orderType: keyof typeof OrderType;
  amount: OrderPair;
  average: number;
  filledAmount: OrderPair;
  time: number;
  hash: string;
  status: keyof typeof TradeStatus;
  sortColumn: string;
  filterColumn: string;
  actionsStatus: object;
  tradeChannel: string;
}

export enum DetailRole {
  maker = "maker",
  taker = "taker",
}

export type OrderDetailItem = {
  market: string;
  amount: number;
  filledPrice: string;
  time: number;
  fee: {
    key: string;
    value: string;
  };
  volumeToken: string;
};

export type OrderHistoryTableDetailItem = {
  amount: OrderPair;
  filledPrice: {
    value: string | number;
    precision?: number;
  };
  fee: {
    key: string;
    value: string | number;
    precision?: number;
  };
  role: string;
  time: number;
  volume?: number;
  orderId: string;
};

export type OrderHistoryRawDataItem = {
  market: string;
  side: TradeTypes;
  amount: OrderPair;
  average: number | string;
  price: {
    key: string;
    value: number;
  };
  time: number;
  status: TradeStatus;
  hash: string;
  orderId: string;
};

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    --template-columns: ${({ isopen, ispro }: any) =>
      isopen === "open"
        ? ispro === "pro"
          ? "auto auto 250px auto auto auto auto"
          : "auto auto 230px auto auto 130px 140px"
        : ispro === "pro"
        ? "auto auto 250px auto auto auto auto"
        : "auto auto 230px auto 130px 130px 130px"} !important;

    .rdg-cell:last-of-type {
      display: flex;
      justify-content: flex-end;
    }
  }
  .textAlignRight {
    text-align: right;
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as any;

export interface OrderHistoryTableProps {
  rawData: OrderHistoryRawDataItem[];
  pagination?: {
    pageSize: number;
    total: number;
  };
  showFilter?: boolean;
  getOrderList: (props: Omit<GetOrdersRequest, "accountId">) => Promise<any>;
  userOrderDetailList?: any[];
  getUserOrderDetailTradeList?: (
    props?: Omit<GetUserTradesRequest, "accountId">
  ) => Promise<void>;
  showLoading?: boolean;
  marketArray?: string[];
  showDetailLoading?: boolean;
  isOpenOrder?: boolean;
  cancelOrder: ({ orderHash, clientOrderId }: any) => Promise<void>;
  cancelOrderByHashList?: (orderHashList: string) => Promise<void>;
  isScroll?: boolean;
  isPro?: boolean;
  handleScroll?: (
    event: React.UIEvent<HTMLDivElement>,
    isOpen?: boolean
  ) => Promise<void>;
  clearOrderDetail?: () => void;
}

export const OrderHistoryTable = withTranslation("tables")(
  (props: OrderHistoryTableProps & WithTranslation) => {
    const {
      t,
      rawData,
      pagination,
      showFilter,
      getOrderList,
      showLoading,
      marketArray,
      showDetailLoading,
      /* getOrderDetail, */ /* orderDetailList, */ cancelOrder,
      isOpenOrder = false,
      isScroll,
      handleScroll,
      isPro = false,
      clearOrderDetail,
      cancelOrderByHashList,
      userOrderDetailList,
      getUserOrderDetailTradeList,
    } = props;
    const actionColumns = ["status"];
    const [filterType, setFilterType] = useState(FilterOrderTypes.allTypes);
    const [filterDate, setFilterDate] = useState<DateRange<Date | string>>([
      null,
      null,
    ]);
    const [filterToken, setFilterToken] = useState<string>("All Pairs");
    const [page, setPage] = useState(1);
    const [modalState, setModalState] = useState(false);
    const [currOrderId, setCurrOrderId] = useState("");
    const [showCancelAllAlert, setShowCancelAllAlert] = useState(false);
    const pageSize = pagination ? pagination.pageSize : 0;

    useEffect(() => {
      if (isOpenOrder) {
        setPage(1);
      }
    }, [isOpenOrder]);

    const updateData = useCallback(
      async ({
        isOpen = isOpenOrder,
        actionType,
        currFilterType = filterType,
        currFilterDate = filterDate,
        currFilterToken = filterToken,
        currPage = page,
      }) => {
        let actualPage = currPage;
        if (actionType === TableType.filter) {
          actualPage = 1;
          setPage(1);
        }
        const types =
          currFilterType === FilterOrderTypes.buy
            ? "BUY"
            : currFilterType === FilterOrderTypes.sell
            ? "SELL"
            : "";
        const start = Number(moment(currFilterDate[0]).format("x"));
        const end = Number(moment(currFilterDate[1]).format("x"));
        await getOrderList({
          limit: pageSize,
          offset: (actualPage - 1) * pageSize,
          side: [types] as Side[],
          market: currFilterToken === "All Pairs" ? "" : currFilterToken,
          start: Number.isNaN(start) ? -1 : start,
          end: Number.isNaN(end) ? -1 : end,
          status: isOpen
            ? "processing"
            : "processed,failed,cancelled,cancelling,expired",
        });
      },
      [
        filterDate,
        filterType,
        filterToken,
        getOrderList,
        page,
        pageSize,
        isOpenOrder,
      ]
    );

    const handleFilterChange = useCallback(
      async ({
        type = filterType,
        date = filterDate,
        token = filterToken,
        currPage = page,
      }) => {
        setFilterType(type);
        setFilterDate(date);
        setFilterToken(token);
        await updateData({
          actionType: TableType.filter,
          currFilterType: type,
          currFilterDate: date,
          currFilterToken: token,
          currPage: currPage,
        });
      },
      [updateData, filterDate, filterType, filterToken, page]
    );

    const handlePageChange = useCallback(
      async (page: number) => {
        setPage(page);
        await updateData({ actionType: TableType.page, currPage: page });
      },
      [updateData]
    );

    const handleReset = useCallback(async () => {
      setFilterType(FilterOrderTypes.allTypes);
      setFilterDate([null, null]);
      setFilterToken("All Pairs");
      await updateData({
        TableType: TableType.filter,
        currFilterType: FilterOrderTypes.allTypes,
        currFilterDate: [null, null],
        currFilterToken: "All Pairs",
      });
    }, [updateData]);

    const CellStatus = useCallback(
      ({ row, column, rowIdx }: any) => {
        const hash = row["hash"];
        const value = row[column.key];
        const popupId = `${column.key}-orderTable-${rowIdx}`;
        const rightState = usePopupState({
          variant: "popover",
          popupId: popupId,
        });
        const RenderValue: any = styled.span`
          position: relative;
          display: flex;
          justify-content: flex-end;
          align-items: center;

          & span {
            color: ${({ theme }) => {
              const { colorBase } = theme;
              return value === TradeStatus.Processed
                ? colorBase.success
                : value === TradeStatus.Expired
                ? colorBase.textSecondary
                : colorBase.textPrimary;
            }};
          }
          height: 100%;
          & svg {
            font-size: 14px;
            transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            transform: ${() => (rightState.isOpen ? "rotate(180deg)" : "")};
          }
        `;

        let actualValue = "";
        switch (value) {
          case TradeStatus.Processing:
            actualValue = t("labelOrderProcessing");
            break;
          case TradeStatus.Processed:
            actualValue = t("labelOrderProcessed");
            break;
          case TradeStatus.Cancelling:
            actualValue = t("labelOrderCancelling");
            break;
          case TradeStatus.Cancelled:
            actualValue = t("labelOrderCancelled");
            break;
          case TradeStatus.Expired:
            actualValue = t("labelOrderExpired");
            break;
          case TradeStatus.Waiting:
            actualValue = t("labelOrderWaiting");
            break;
          default:
            break;
        }

        const handleOrderClick = useCallback(
          async (hash: string) => {
            if (clearOrderDetail) {
              clearOrderDetail();
            }
            setCurrOrderId(row["orderId"]);
            setModalState(true);
            if (getUserOrderDetailTradeList) {
              await getUserOrderDetailTradeList({
                orderHash: hash,
              });
            }
          },
          [row]
        );

        return (
          <RenderValue
            className="rdg-cell-value textAlignRight"
            onClick={() => handleOrderClick(hash)}
          >
            <Typography component={"span"} marginRight={1}>
              {actualValue}
            </Typography>
            <DropDownIcon
              htmlColor={"var(--color-text-third)"}
              fontSize={"large"}
            />
          </RenderValue>
        );
      },
      [clearOrderDetail, getUserOrderDetailTradeList, t]
    );

    const getPopoverState = useCallback((label: string) => {
      return usePopupState({
        variant: "popover",
        popupId: `popup-cancel-order-${label}`,
      });
    }, []);

    const getColumnModeOrderHistory = (
      t: any
    ): Column<OrderHistoryRow, unknown>[] => [
      {
        key: "types",
        name: t("labelOrderTypes"),
        formatter: ({ row }) => {
          const value = row["orderType"] as any;
          let renderValue = "";
          switch (value) {
            case "AMM":
              renderValue = t("labelOrderMarketOrder");
              break;
            case "LIMIT_ORDER":
              renderValue = t("labelOrderLimitOrder");
              break;
            case "MAKER_ONLY":
              renderValue = t("labelOrderLimitOrder");
              break;
            case "TAKER_ONLY":
              renderValue = t("labelOrderLimitOrder");
              break;
            default:
              break;
          }
          return <div className="rdg-cell-value">{renderValue}</div>;
        },
      },
      {
        key: "channels",
        name: t("labelOrderChannels"),
        formatter: ({ row }) => {
          const value = row["tradeChannel"];
          let renderChannel = "";
          switch (value) {
            case "MIXED":
              renderChannel = t("labelOrderChannelsMixed");
              break;
            case "AMM_POOL":
              renderChannel = t("labelOrderChannelsSwap");
              break;
            case "ORDER_BOOK":
              renderChannel = t("labelOrderChannelsOrderBook");
              break;
            default:
              break;
          }
          return <div className="rdg-cell-value">{renderChannel}</div>;
        },
      },
      {
        key: "amount",
        name: t("labelOrderAmount"),
        formatter: ({ row, column }) => {
          const { from, to } = row[column.key];
          const precisionFrom = row.amount.from?.["precision"];
          const precisionTo = row.amount.to?.["precision"];
          const { key: keyFrom, value: valueFrom } = from;
          const { key: keyTo, value: valueTo } = to;
          const renderValue = `${getValuePrecisionThousand(
            valueFrom,
            precisionFrom,
            precisionFrom
          )} ${keyFrom} \u2192 ${getValuePrecisionThousand(
            valueTo,
            precisionTo,
            precisionTo
          )} ${keyTo}`;
          return <div className="rdg-cell-value">{renderValue}</div>;
        },
      },

      {
        key: "average",
        name: t("labelOrderAverage"),
        headerCellClass: "textAlignRight",
        formatter: ({ row, column }) => {
          const value = row[column.key];
          const precisionMarket = row["precisionMarket"];
          const renderValue = value
            ? getValuePrecisionThousand(
                value,
                undefined,
                undefined,
                precisionMarket,
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
        key: "price",
        name: t("labelOrderPrice"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const value = row["price"].value;
          const precisionMarket = row["precisionMarket"];
          const hasValue = Number.isFinite(value);
          const renderValue = hasValue
            ? getValuePrecisionThousand(
                value,
                undefined,
                undefined,
                precisionMarket,
                true,
                { isPrice: true }
              )
            : EmptyValueTag;
          return (
            <div className="rdg-cell-value textAlignRight">
              <span>{renderValue}</span>
            </div>
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
      {
        key: "status",
        headerCellClass: "textAlignRight",
        name: t("labelOrderStatus"),
        formatter: ({ row, column, rowIdx }) => (
          <>
            <CellStatus {...{ row, column, rowIdx }} />
          </>
        ),
      },
    ];

    const getColumnModeOpenHistory = (
      t: any,
      isEmpty: boolean
    ): Column<OrderHistoryRow, unknown>[] => [
      {
        key: "types",
        name: t("labelOrderTypes"),
        formatter: ({ row }) => {
          const value = row["orderType"] as any;
          let renderValue = "";
          switch (value) {
            case "AMM":
              renderValue = t("labelOrderAmm");
              break;
            case "LIMIT_ORDER":
              renderValue = t("labelOrderLimitOrder");
              break;
            case "MAKER_ONLY":
              renderValue = t("labelOrderMaker");
              break;
            case "TAKER_ONLY":
              renderValue = t("labelOrderTaker");
              break;
            default:
              break;
          }
          return <div className="rdg-cell-value">{renderValue}</div>;
        },
      },
      {
        key: "channels",
        name: t("labelOrderChannels"),
        formatter: ({ row }) => {
          const value = row["tradeChannel"];
          let renderChannel = "";
          switch (value) {
            case "MIXED":
              renderChannel = t("labelOrderChannelsMixed");
              break;
            case "AMM_POOL":
              renderChannel = t("labelOrderChannelsAMM");
              break;
            case "ORDER_BOOK":
              renderChannel = t("labelOrderChannelsOrderBook");
              break;
            default:
              break;
          }
          return <div className="rdg-cell-value">{renderChannel}</div>;
        },
      },
      {
        key: "amount",
        name: t("labelOrderAmount"),
        formatter: ({ row, column }) => {
          const { from, to } = row[column.key];
          const { key: keyFrom, value: valueFrom } = from;
          const { key: keyTo, value: valueTo } = to;
          const precisionFrom = row.amount.from?.["precision"];
          const precisionTo = row.amount.to?.["precision"];
          const renderValue = `${getValuePrecisionThousand(
            valueFrom,
            precisionFrom,
            precisionFrom
          )} ${keyFrom} \u2192 ${getValuePrecisionThousand(
            valueTo,
            precisionTo,
            precisionTo
          )} ${keyTo}`;
          return <div className="rdg-cell-value">{renderValue}</div>;
        },
      },
      {
        key: "price",
        name: t("labelOrderPrice"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const value = row["price"].value;
          const precisionMarket = row["precisionMarket"];
          const hasValue = Number.isFinite(value);
          const renderValue = hasValue
            ? getValuePrecisionThousand(
                value,
                precisionMarket,
                precisionMarket,
                precisionMarket,
                true,
                { isPrice: true }
              )
            : EmptyValueTag;
          return (
            <div className="rdg-cell-value textAlignRight">
              <span>{renderValue}</span>
            </div>
          );
        },
      },
      {
        key: "completion",
        name: t("labelOrderCompletion"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const rawValue = row["completion"];
          const renderValue = `${(rawValue * 100).toFixed(2)}%`;
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
      {
        key: "cancel",
        headerCellClass: "textAlignRight",
        name: (
          <CancelColHeaderStyled
            empty={isEmpty ? "true" : "false"}
            onClick={isEmpty ? undefined : () => setShowCancelAllAlert(true)}
          >
            {t("labelOrderCancelAll")}
          </CancelColHeaderStyled>
        ),
        formatter: ({ row, index }: any) => {
          const orderHash = row["hash"];
          const clientOrderId = row["orderId"];
          const popState = getPopoverState(index);
          const handleClose = () => {
            popState.setOpen(false);
          };
          const handleRequestCancel = async () => {
            await cancelOrder({ orderHash, clientOrderId });
            handleClose();
          };
          return (
            <>
              <Box
                {...bindTrigger(popState)}
                onClick={(e: any) => {
                  bindTrigger(popState).onClick(e);
                }}
                style={{ cursor: "pointer" }}
                className="rdg-cell-value textAlignRight"
              >
                <Typography component={"span"} color={"var(--color-primary)"}>
                  {t("labelOrderCancelOrder")}
                </Typography>
              </Box>

              <PopoverPure
                className={isPro ? "arrow-top-right" : "arrow-top-center"}
                {...bindPopper(popState)}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
              >
                <ClickAwayListener onClickAway={() => popState.setOpen(false)}>
                  <Box padding={2}>
                    <Typography marginBottom={1}>
                      {t("labelOrderCancelConfirm")}
                    </Typography>
                    <Grid
                      container
                      spacing={1}
                      display={"flex"}
                      justifyContent={"flex-end"}
                      alignItems={"center"}
                    >
                      <Grid item>
                        <Button variant={"outlined"} onClick={handleClose}>
                          {t("labelOrderCancel")}
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          variant={"contained"}
                          size={"small"}
                          onClick={handleRequestCancel}
                        >
                          {t("labelOrderConfirm")}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </ClickAwayListener>
              </PopoverPure>
            </>
          );
        },
      },
    ];

    const actualColumns = isOpenOrder
      ? getColumnModeOpenHistory(t, rawData.length === 0)
      : getColumnModeOrderHistory(t);

    const defaultArgs: any = {
      columnMode: actualColumns,
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<OrderHistoryRawDataItem, unknown>[],
      actionColumns,
    };

    const handleCancelAll = useCallback(async () => {
      const openOrdresList = rawData
        .filter((o) => o.status === "processing")
        .map((o) => o.hash)
        .join(",");
      if (cancelOrderByHashList) {
        await cancelOrderByHashList(openOrdresList);
      }
    }, [rawData, cancelOrderByHashList]);

    return (
      <TableStyled
        isopen={isOpenOrder ? "open" : "history"}
        ispro={isPro ? "pro" : "lite"}
      >
        {showFilter && (
          <TableFilterStyled>
            <Filter
              marketArray={marketArray}
              filterDate={filterDate}
              filterType={filterType}
              filterToken={filterToken}
              handleReset={handleReset}
              handleFilterChange={handleFilterChange}
            />
          </TableFilterStyled>
        )}
        <Table
          className={isScroll ? "scrollable" : undefined}
          onScroll={
            handleScroll ? (e) => handleScroll(e, isOpenOrder) : undefined
          }
          {...{ ...defaultArgs, ...props, rawData, showloading: showLoading }}
        />
        <CancelAllOrdersAlert
          open={showCancelAllAlert}
          handleCancelAll={handleCancelAll}
          handleClose={() => setShowCancelAllAlert(false)}
        />
        <Modal open={modalState} onClose={() => setModalState(false)}>
          <OrderDetailPanel
            rawData={userOrderDetailList || []}
            showLoading={showDetailLoading}
            orderId={currOrderId}
          />
        </Modal>
        {pagination && !!rawData.length && (
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
