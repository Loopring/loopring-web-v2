import React from "react";
import {
  Button,
  CancelAllOrdersAlert,
  PopoverPure,
  QuoteTableRawDataItem,
} from "../../index";
import { bindTrigger } from "material-ui-popup-state/es";
import styled from "@emotion/styled";
import {
  Box,
  BoxProps,
  ClickAwayListener,
  Grid,
  Link,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import { DateRange } from "@mui/lab";
import { WithTranslation, withTranslation } from "react-i18next";
import moment from "moment";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  DirectionTag,
  DropDownIcon,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  GoodIcon,
  RowConfig,
  TableType,
  TradeStatus,
  TradeTypes,
  UNIX_TIMESTAMP_FORMAT,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { Column, Table, TablePagination } from "../../basic-lib";
import { Filter, FilterOrderTypes } from "./components/Filter";
import { OrderDetailPanel } from "./components/modal";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  GetOrdersRequest,
  GetUserTradesRequest,
  OrderType,
  Side,
} from "@loopring-web/loopring-sdk";
import { useSettings } from "../../../stores";
import _ from "lodash";
import { useLocation } from "react-router-dom";

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
  extraOrderInfo: {
    extraOrderType: string;
    isTriggerd: boolean;
    stopPrice: string;
    stopSide: string;
  };
  __raw__: any;
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
  extraOrderInfo?: {
    extraOrderType: string;
    isTriggerd: boolean;
    stopPrice: string;
    stopSide: string;
  };
  __raw__: any;
};

const TableStyled = styled(Box)<
  BoxProps & {
    isMobile?: boolean;
    isopen?: string;
    ispro?: string;
    isStopLimit?: boolean;
  }
>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile, isopen, ispro, isStopLimit }) =>
      !isMobile
        ? `--template-columns: ${
            isopen === "open"
              ? ispro === "pro"
                ? `auto auto ${isStopLimit ? 220 : 250}px auto auto ${
                    isStopLimit ? "auto" : ""
                  } auto auto`
                : `auto auto ${isStopLimit ? 200 : 230}px auto auto ${
                    isStopLimit ? "auto" : ""
                  } 130px 140px`
              : ispro === "pro"
              ? `auto auto  ${isStopLimit ? 220 : 250}px auto auto ${
                  isStopLimit ? "auto" : ""
                } auto auto`
              : `auto auto ${isStopLimit ? 200 : 230}px auto 130px ${
                  isStopLimit ? "auto" : ""
                } 130px 130px`
          } !important;`
        : `--template-columns: 14% 62% 24% !important;`}
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
` as (
  props: {
    isMobile?: boolean;
    isopen?: string;
    ispro?: string;
    isStopLimit?: boolean;
  } & BoxProps
) => JSX.Element;

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
  onRowClick?: (
    rowIdx: number,
    row: QuoteTableRawDataItem,
    column: any
  ) => void;
  isStopLimit?: boolean;
}

export const OrderHistoryTable = withTranslation("tables")(
  (props: OrderHistoryTableProps & WithTranslation) => {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
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
      onRowClick,
      isStopLimit,
    } = props;
    const { isMobile } = useSettings();
    // const [tableHeight] = React.useState(() => {
    //   if (isOpenOrder) {
    //     return ;
    //   }
    // });

    const actionColumns = ["status"];
    const [filterType, setFilterType] = React.useState(
      FilterOrderTypes.allTypes
    );
    const [filterDate, setFilterDate] = React.useState<
      DateRange<Date | string>
    >([null, null]);
    const [filterToken, setFilterToken] = React.useState<string>("all");
    const [page, setPage] = React.useState(1);
    const [modalState, setModalState] = React.useState(false);
    const [currOrderId, setCurrOrderId] = React.useState("");
    const [showCancelAllAlert, setShowCancelAllAlert] = React.useState(false);

    const updateData = _.debounce(
      async ({
        isOpen = isOpenOrder,
        actionType,
        currFilterType = filterType,
        currFilterDate = filterDate,
        currFilterToken = filterToken,
        currPage = page,
      }) => {
        if (actionType === TableType.filter) {
          currPage = 1;
          setPage(1);
        }
        const types =
          currFilterType === FilterOrderTypes.buy
            ? "BUY"
            : currFilterType === FilterOrderTypes.sell
            ? "SELL"
            : "";
        const start = Number(
          moment(currFilterDate[0]).format(UNIX_TIMESTAMP_FORMAT)
        );
        const end = Number(
          moment(currFilterDate[1]).format(UNIX_TIMESTAMP_FORMAT)
        );
        await getOrderList({
          limit: pagination?.pageSize ?? 10,
          offset: (currPage - 1) * (pagination?.pageSize ?? 10),
          side: [types] as Side[],
          market: currFilterToken === "all" ? "" : currFilterToken,
          start: Number.isNaN(start) ? -1 : start,
          end: Number.isNaN(end) ? -1 : end,
          status: isOpen
            ? ["processing"]
            : ["processed", "failed", "cancelled", "cancelling", "expired"],
        });
      },
      globalSetup.wait
    );

    const handleFilterChange = React.useCallback(
      async ({
        isOpen = isOpenOrder,
        type = filterType,
        date = filterDate,
        token = filterToken,
        currPage = page,
      }) => {
        setFilterType(type);
        setFilterDate(date);
        setFilterToken(token);
        await updateData({
          isOpen: isOpen,
          actionType: TableType.filter,
          currFilterType: type,
          currFilterDate: date,
          currFilterToken: token,
          currPage: currPage,
        });
      },
      [updateData, filterDate, filterType, filterToken, page]
    );

    const handlePageChange = React.useCallback(
      async (page: number) => {
        setPage(page);
        await updateData({ actionType: TableType.page, currPage: page });
      },
      [updateData]
    );

    const handleReset = React.useCallback(async () => {
      setFilterType(FilterOrderTypes.allTypes);
      setFilterDate([null, null]);
      setFilterToken("all");
      await updateData({
        TableType: TableType.filter,
        currFilterType: FilterOrderTypes.allTypes,
        currFilterDate: [null, null],
        currFilterToken: "all",
      });
    }, [updateData]);
    const handleOrderClick = React.useCallback(
      async (row: OrderHistoryRawDataItem) => {
        if (clearOrderDetail) {
          clearOrderDetail();
        }
        setCurrOrderId(row.orderId);
        setModalState(true);
        if (getUserOrderDetailTradeList) {
          await getUserOrderDetailTradeList({
            orderHash: row.hash,
          });
        }
      },
      [clearOrderDetail, getUserOrderDetailTradeList]
    );

    React.useEffect(() => {
      let filters: any = {};
      updateData.cancel();
      if (searchParams.get("market")) {
        filters.token = searchParams.get("market");
      }
      filters.isOpen = isOpenOrder;
      handleFilterChange(filters);
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize, isOpenOrder]);

    const stopLimitColumn = React.useCallback((): Column<
      OrderHistoryRow,
      unknown
    >[] => {
      if (isStopLimit) {
        return [
          {
            key: "Condition",
            name: t("labelStopLimitStopPrice"),
            headerCellClass: "textAlignRight",
            formatter: ({ row }: any) => {
              return row.extraOrderInfo.isTriggerd ? (
                <Box
                  style={{ cursor: "pointer" }}
                  className="rdg-cell-value textAlignRight"
                  display={"inline-flex"}
                  justifyContent={"center"}
                >
                  <Tooltip
                    style={{ cursor: "pointer" }}
                    className="rdg-cell-value textAlignRight"
                    title={t("labelStopLimitTriggered", {
                      time: row.extraOrderInfo.triggerdTime
                        ? moment(
                            new Date(row.extraOrderInfo.triggerdTime)
                          ).format(YEAR_DAY_MINUTE_FORMAT)
                        : "",
                    }).toString()}
                  >
                    <>
                      <Typography component={"span"} paddingRight={1 / 2}>
                        {row.extraOrderInfo.stopSide ==
                        sdk.STOP_SIDE.LESS_THAN_AND_EQUAL
                          ? "≤"
                          : "≥"}
                        {row.extraOrderInfo.stopPrice}
                      </Typography>
                      <GoodIcon />
                    </>
                  </Tooltip>
                </Box>
              ) : (
                <Box
                  style={{ cursor: "pointer" }}
                  className="rdg-cell-value textAlignRight"
                >
                  <Typography component={"span"}>
                    {row.extraOrderInfo.stopSide ==
                    sdk.STOP_SIDE.LESS_THAN_AND_EQUAL
                      ? "≤"
                      : "≥"}
                    {row.extraOrderInfo.stopPrice}
                  </Typography>
                </Box>
              );
            },
          },
        ];
      } else {
        return [];
      }
    }, [isStopLimit]);
    const CellStatus = React.useCallback(
      ({ row, rowIdx }: any) => {
        const value = row.status;
        const popupId = `status-orderTable-${rowIdx}`;
        const rightState = usePopupState({
          variant: "popover",
          popupId: popupId,
        });
        const RenderValue: any = styled(Typography)`
          position: relative;
          display: flex;
          justify-content: flex-end;
          align-items: center;

          color: ${({ theme }) => {
            const { colorBase } = theme;
            return value === TradeStatus.Processed
              ? colorBase.success
              : value === TradeStatus.Expired
              ? colorBase.textSecondary
              : colorBase.textPrimary;
          }};
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

        return (
          <>
            {isMobile ? (
              <RenderValue
                whiteSpace={"pre-line"}
                style={{ wordBreak: "break-all" }}
                className={"textAlignLeft"}
                variant={"body2"}
                component={"span"}
              >
                {actualValue}
              </RenderValue>
            ) : (
              <RenderValue
                component={"span"}
                className={`rdg-cell-value textAlignRight`}
                onClick={() => handleOrderClick(row)}
              >
                <Typography
                  component={"span"}
                  whiteSpace={"pre-line"}
                  variant={"body1"}
                  color={"inherit"}
                >
                  {actualValue}
                </Typography>

                <DropDownIcon
                  htmlColor={"var(--color-text-third)"}
                  fontSize={"large"}
                />
              </RenderValue>
            )}
          </>
        );
      },
      [handleOrderClick, isMobile, t]
    );

    const getPopoverState = React.useCallback((label: number) => {
      return usePopupState({
        variant: "popover",
        popupId: `popup-cancel-order-${label}`,
      });
    }, []);

    const getColumnModeOrderHistory = (): Column<
      OrderHistoryRow,
      unknown
    >[] => [
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
          )} ${keyFrom} ${DirectionTag} ${getValuePrecisionThousand(
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
      ...[].concat(stopLimitColumn() as never[]),
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
          )} ${keyFrom} ${DirectionTag} ${getValuePrecisionThousand(
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
      ...[].concat(stopLimitColumn() as never[]),
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
    const getColumnModeMobileOrderHistory = (): Column<
      OrderHistoryRow,
      unknown
    >[] => [
      {
        key: "types",
        name: t("labelOrderTypes") + "/" + t("labelOrderChannels"),
        formatter: ({ row }) => {
          let renderChannel = "",
            renderValue = "";
          switch (row.tradeChannel) {
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
          switch (row.orderType as string) {
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
          return (
            <Box
              height={"100%"}
              width={"100%"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-start"}
              justifyContent={"center"}
            >
              <Typography>{renderValue}</Typography>
              <Typography color={"textSecondary"} variant={"body2"}>
                {renderChannel}
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "amount",
        name: t("labelOrderAmount") + "/" + t("labelOrderAverage"),
        headerCellClass: "textAlignRight",
        formatter: ({ row, column, rowIdx }) => {
          const { from, to } = row[column.key];
          const precisionFrom = row.amount.from?.["precision"];
          const precisionTo = row.amount.to?.["precision"];
          const { key: keyFrom, value: valueFrom } = from;
          const { key: keyTo, value: valueTo } = to;
          const renderValue = `${getValuePrecisionThousand(
            valueFrom,
            precisionFrom,
            precisionFrom
          )} ${keyFrom} ${DirectionTag} ${getValuePrecisionThousand(
            valueTo,
            precisionTo,
            precisionTo
          )} ${keyTo}`;
          const average = row.average
            ? getValuePrecisionThousand(
                row.average,
                undefined,
                undefined,
                row["precisionMarket"],
                true,
                { isPrice: true }
              )
            : EmptyValueTag;
          return (
            <Box
              height={"100%"}
              width={"100%"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-end"}
              justifyContent={"center"}
            >
              <Typography component={"span"}>{renderValue}</Typography>

              <Typography
                component={"span"}
                color={"textSecondary"}
                display={"flex"}
                justifyContent={"space-between"}
                variant={"body2"}
                width={"100%"}
              >
                <CellStatus {...{ row, column, rowIdx }} />
                <Typography component={"span"} color={"textSecondary"}>
                  {average}
                </Typography>
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "price",
        name: t("labelOrderPrice") + "/" + t("labelOrderTime"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const value = row["price"].value;
          const precisionMarket = row["precisionMarket"];
          const hasValue = Number.isFinite(value);
          const time = Number.isFinite(value)
            ? moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow()
            : EmptyValueTag;
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
            <Box
              height={"100%"}
              width={"100%"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-end"}
              justifyContent={"center"}
            >
              <Typography>{renderValue}</Typography>
              <Typography color={"textSecondary"} variant={"body2"}>
                {time}
              </Typography>
            </Box>
          );
        },
      },
    ];
    const getColumnModeMobileOpenHistory = (
      isEmpty: boolean
    ): Column<OrderHistoryRow, unknown>[] => [
      {
        key: "types",
        name: t("labelOrderTypes") + "/" + t("labelOrderChannels"),
        formatter: ({ row }) => {
          let renderChannel = "",
            renderValue = "";
          switch (row.tradeChannel) {
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
          switch (row.orderType as string) {
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
          return (
            <Box
              height={"100%"}
              width={"100%"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-start"}
              justifyContent={"center"}
            >
              <Typography>{renderValue}</Typography>
              <Typography color={"textSecondary"} variant={"body2"}>
                {renderChannel}
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "amount",
        headerCellClass: "textAlignRight",
        name: t("labelOrderAmount") + "/" + t("labelOrderPrice"),
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
          )} ${keyFrom} ${DirectionTag} ${getValuePrecisionThousand(
            valueTo,
            precisionTo,
            precisionTo
          )} ${keyTo}`;
          //@ts-ignore
          const hasValue = Number.isFinite(row["price"]?.value);
          const price = hasValue
            ? getValuePrecisionThousand(
                //@ts-ignore
                row["price"]?.value,
                row["precisionMarket"],
                row["precisionMarket"],
                row["precisionMarket"],
                true,
                { isPrice: true }
              )
            : EmptyValueTag;
          const completion = `${(row["completion"] * 100).toFixed(2)}%`;

          return (
            <Box
              height={"100%"}
              width={"100%"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-end"}
              justifyContent={"center"}
            >
              <Typography>{renderValue}</Typography>
              <Typography
                color={"textSecondary"}
                display={"flex"}
                justifyContent={"space-between"}
                variant={"body2"}
                width={"100%"}
              >
                <Typography color={"inherit"} variant={"inherit"}>
                  {completion}
                </Typography>
                <Typography color={"inherit"} variant={"inherit"}>
                  {price}
                </Typography>
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "time",
        name: (
          <CancelColHeaderStyled
            empty={isEmpty ? "true" : "false"}
            onClick={isEmpty ? undefined : () => setShowCancelAllAlert(true)}
          >
            {t("labelOrderCancelAll")}
          </CancelColHeaderStyled>
        ),
        headerCellClass: "textAlignRight",
        formatter: ({ row, rowIdx }) => {
          const time = Number.isFinite(row.time)
            ? moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow()
            : EmptyValueTag;
          const orderHash = row["hash"];
          const clientOrderId = row["orderId"];
          const popState = getPopoverState(rowIdx);
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
                <Typography color={"textSecondary"} variant={"body2"}>
                  {time}
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
      ? isMobile
        ? getColumnModeMobileOpenHistory(rawData.length === 0)
        : getColumnModeOpenHistory(rawData.length === 0)
      : isMobile
      ? getColumnModeMobileOrderHistory()
      : getColumnModeOrderHistory();

    const defaultArgs: any = {
      columnMode: actualColumns,
      generateRows: (rawData: any) => rawData,
      onRowClick: isPro ? onRowClick : null,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<OrderHistoryRawDataItem, unknown>[],
      actionColumns,
    };

    const handleCancelAll = React.useCallback(async () => {
      const openOrdresList = rawData
        .filter((o) => o.status === "processing")
        .map((o) => o.hash)
        .join(",");
      if (cancelOrderByHashList) {
        await cancelOrderByHashList(openOrdresList);
      }
    }, [rawData, cancelOrderByHashList]);
    const [isDropDown, setIsDropDown] = React.useState(true);

    return (
      <TableStyled
        isMobile={isMobile}
        isStopLimit={isStopLimit}
        isopen={isOpenOrder ? "open" : "history"}
        ispro={isPro ? "pro" : "lite"}
      >
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
              <Filter
                marketArray={marketArray}
                filterDate={filterDate}
                filterType={filterType}
                filterToken={filterToken}
                handleReset={handleReset}
                handleFilterChange={handleFilterChange}
              />
            </TableFilterStyled>
          ))}
        <Table
          className={isScroll ? "scrollable" : undefined}
          onRowClick={
            isOpenOrder
              ? undefined
              : (_index, row) => handleOrderClick(row as any)
          }
          onScroll={
            handleScroll ? (e) => handleScroll(e, isOpenOrder) : undefined
          }
          style={{
            height:
              isOpenOrder && !isScroll
                ? RowConfig.rowHeaderHeight +
                  rawData.length * RowConfig.rowHeight
                : "initial",
          }}
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
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    );
  }
);
