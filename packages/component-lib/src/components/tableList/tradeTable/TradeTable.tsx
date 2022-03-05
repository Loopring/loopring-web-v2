import React from "react";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { TFunction, withTranslation, WithTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table, TablePagination } from "../../basic-lib";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import { Filter, FilterTradeTypes } from "./components/Filter";

import {
  EmptyValueTag,
  getValuePrecisionThousand,
  TableType,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { DateRange } from "@mui/lab";
import { Currency, MarketTradeInfo } from "@loopring-web/loopring-sdk";

export enum TradeItemRole {
  maker = "Maker",
  taker = "Taker",
}

export enum TradeItemCounterparty {
  orderbook = "Orderbook",
  pool = "Pool",
}

export type RawDataTradeItem = {
  // side: keyof typeof TradeTypes;
  role: TradeItemRole;
  amount: {
    from: {
      key: string;
      value: number | undefined;
    };
    to: {
      key: string;
      value: number | undefined;
    };
    volume?: number;
  };
  counterParty?: TradeItemCounterparty;
  price: {
    key: string;
    value: number | undefined;
  };
  // priceDollar: number;
  // priceYuan: number;
  fee: {
    key: string;
    value: number | undefined;
  };
  time: number;
  __raw__: Partial<MarketTradeInfo>;
};

export type TradeTableProps = {
  rawData: RawDataTradeItem[];
  // getUserTradeList?: (param: Omit<GetUserTradesRequest, 'accountId'>) => void;
  getUserTradeList?: (param: any) => void;
  pagination?: {
    pageSize: number;
    total: number;
  };
  showFilter?: boolean;
  currentheight?: number;
  rowHeight?: number;
  headerRowHeight?: number;
  isL2Trade?: boolean;
  marketMap?: any;
  showLoading?: boolean;
};

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${(props: any) => props.currentheight}px;
    @media only screen and (max-width: 768px) {
      --template-columns: 16% 54% 30% !important;
    }
    --template-columns: ${({ tradeposition }: any) =>
      tradeposition === "swap"
        ? "300px 120px auto auto !important"
        : "150px 300px auto 120px auto auto !important"};

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .rdg-header-row {
      // background-color: inherit !important;
    }

    .textAlignRight {
      text-align: right;
    }
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as any;

const getColumnModeAssets = (
  t: TFunction,
  _currency: Currency,
  tokenMap: any,
  isL2Trade: boolean
): Column<RawDataTradeItem, unknown>[] => {
  if (isL2Trade) {
    return [
      {
        key: "role",
        name: t("labelTradeRole"),
        formatter: ({ row }) => {
          const value = row["role"];
          const renderValue =
            value === TradeItemRole.maker
              ? t("labelTradeRoleMaker")
              : t("labelTradeRoleTaker");
          return <Box className="rdg-cell-value">{renderValue}</Box>;
        },
      },
      {
        key: "side",
        name: t("labelTradeSide"),
        formatter: ({ row }) => {
          // const tradeType = row[ 'side' ] === TradeTypes.Buy ? t('labelBuy') : t('labelSell')
          const { from, to } = row["amount"];
          const precisionFrom = tokenMap
            ? tokenMap[from.key]?.precision
            : undefined;
          const precisionTo = tokenMap
            ? tokenMap[to.key]?.precision
            : undefined;
          const fromValue = from.value
            ? getValuePrecisionThousand(
                from.value,
                precisionFrom,
                precisionFrom
              )
            : EmptyValueTag;
          const toValue = to.value
            ? getValuePrecisionThousand(to.value, precisionTo, precisionTo)
            : EmptyValueTag;

          return (
            <Box className="rdg-cell-value">
              <Typography>
                {`${fromValue} ${from.key} \u2192 ${toValue} ${to.key}`}
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "counterparty",
        name: t("labelTradeConterparty"),
        formatter: ({ row }) => {
          const value = row["counterParty"];
          const renderValue =
            value === TradeItemCounterparty.orderbook
              ? t("labelTradeCounterpartyOrderbook")
              : t("labelTradeCounterpartyPool");
          return <Box className="rdg-cell-value">{renderValue}</Box>;
        },
      },
      {
        key: "price",
        name: t("labelTradePrice"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const { value } = row["price"];
          const precision = row["precision"] || 6;
          const renderValue = value
            ? getValuePrecisionThousand(
                value,
                undefined,
                undefined,
                precision,
                true,
                { isPrice: true }
              )
            : EmptyValueTag;
          return (
            <Box className="rdg-cell-value textAlignRight">{renderValue}</Box>
          );
        },
      },
      {
        key: "fee",
        name: t("labelTradeFee"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const { key, value } = row["fee"];
          // myLog({value})
          return (
            <div className="rdg-cell-value textAlignRight">
              {`${value} ${key}`}
            </div>
          );
        },
      },
      {
        key: "time",
        name: t("labelTradeTime"),
        headerCellClass: "textAlignRight",
        // minWidth: 400,
        formatter: ({ row }) => {
          const time = moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow();
          return <div className="rdg-cell-value textAlignRight">{time}</div>;
        },
      },
    ];
  } else {
    return [
      {
        key: "side",
        name: t("labelTradeSide"),
        formatter: ({ row }) => {
          // const tradeType = row[ 'side' ] === TradeTypes.Buy ? t('labelBuy') : t('labelSell')
          const { from, to } = row["amount"];
          const precisionFrom = tokenMap
            ? tokenMap[from.key]?.precision
            : undefined;
          const precisionTo = tokenMap
            ? tokenMap[to.key]?.precision
            : undefined;
          const fromValue = from.value
            ? getValuePrecisionThousand(
                from.value,
                precisionFrom,
                precisionFrom
              )
            : EmptyValueTag;
          const toValue = to.value
            ? getValuePrecisionThousand(to.value, precisionTo, precisionTo)
            : EmptyValueTag;

          return (
            <Box className="rdg-cell-value">
              <Typography>
                {`${fromValue} ${from.key} \u2192 ${toValue} ${to.key}`}
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "price",
        name: t("labelTradePrice"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const { value } = row["price"];
          const precision = row["precision"] || 6;
          const renderValue = value
            ? getValuePrecisionThousand(
                value,
                undefined,
                undefined,
                precision,
                true,
                { isPrice: true }
              )
            : EmptyValueTag;
          return (
            <Box className="rdg-cell-value textAlignRight">
              {renderValue}
              {/*{currency === Currency.usd ?*/}
              {/*    PriceTag.Dollar + getThousandFormattedNumbers(priceDollar)*/}
              {/*    : PriceTag.Yuan + getThousandFormattedNumbers(priceYuan)}*/}
            </Box>
          );
        },
      },
      {
        key: "fee",
        name: t("labelTradeFee"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const { key, value } = row["fee"];
          // myLog({value})
          return (
            <div className="rdg-cell-value textAlignRight">
              {`${value} ${key}`}
            </div>
          );
        },
      },
      {
        key: "time",
        name: t("labelTradeTime"),
        headerCellClass: "textAlignRight",
        // minWidth: 400,
        formatter: ({ row }) => {
          const time = moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow();
          return <div className="rdg-cell-value textAlignRight">{time}</div>;
        },
      },
    ];
  }
};

const getColumnModeMobileAssets = (
  t: TFunction,
  _currency: Currency,
  tokenMap: any,
  isL2Trade: boolean
): Column<RawDataTradeItem, unknown>[] => {
  return [
    ...(isL2Trade
      ? [
          {
            key: "role",
            name: t("labelTradeRole") + "/" + t("labelTradeConterparty"),
            // @ts-ignore
            formatter: ({ row }) => {
              const value = row["role"];
              const renderValue =
                value === TradeItemRole.maker
                  ? t("labelTradeRoleMaker")
                  : t("labelTradeRoleTaker");
              const counterParty =
                row.counterParty === TradeItemCounterparty.orderbook
                  ? t("labelTradeCounterpartyOrderbook")
                  : t("labelTradeCounterpartyPool");
              return (
                <Box
                  className="rdg-cell-value"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  height={"100%"}
                >
                  <Typography>{renderValue}</Typography>
                  <Typography color={"textSecondary"} variant={"body2"}>
                    {counterParty}
                  </Typography>
                </Box>
              );
            },
          },
        ]
      : []),
    {
      key: "side",
      name: t("labelTradeSide") + t("labelTradeFee"),
      headerCellClass: "textAlignRight",
      formatter: ({ row }) => {
        // const tradeType = row[ 'side' ] === TradeTypes.Buy ? t('labelBuy') : t('labelSell')
        const { from, to } = row["amount"];
        const precisionFrom = tokenMap
          ? tokenMap[from.key]?.precision
          : undefined;
        const precisionTo = tokenMap ? tokenMap[to.key]?.precision : undefined;
        const fromValue = from.value
          ? getValuePrecisionThousand(from.value, precisionFrom, precisionFrom)
          : EmptyValueTag;
        const toValue = to.value
          ? getValuePrecisionThousand(to.value, precisionTo, precisionTo)
          : EmptyValueTag;
        const { key, value } = row["fee"];

        return (
          <Box
            className="rdg-cell-value"
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"flex-end"}
            textAlign={"right"}
            height={"100%"}
          >
            <Typography variant={"body2"}>
              {`${fromValue} ${from.key}  \u2192 ${toValue} ${to.key}`}
            </Typography>
            <Typography variant={"body2"} color={"textSecondary"}>
              {t("labelFee", { ns: "common" }) + `: ${value} ${key}`}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "price",
      name: t("labelTradePrice") + "/" + t("labelTradeTime"),
      headerCellClass: "textAlignRight",
      formatter: ({ row }) => {
        const precision = row["precision"] || 6;
        const time = moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow();
        const renderValue = row.price
          ? getValuePrecisionThousand(
              row.price.value,
              undefined,
              undefined,
              precision,
              true
              // { isPrice: true }
            )
          : EmptyValueTag;

        return (
          <Box
            className="rdg-cell-value textAlignRight"
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            height={"100%"}
          >
            <Typography>{renderValue}</Typography>
            <Typography color={""} textOverflow={"ellipsis"} variant={"body2"}>
              {time}
            </Typography>
          </Box>
        );
      },
    },
  ];
};

export const TradeTable = withTranslation("tables")(
  ({
    t,
    pagination,
    showFilter,
    rawData,
    currentheight,
    rowHeight = 44,
    headerRowHeight = 44,
    tokenMap = undefined,
    isL2Trade = false,
    marketMap = undefined,
    getUserTradeList,
    showLoading = false,
    ...rest
  }: WithTranslation & TradeTableProps & { tokenMap?: any }) => {
    const [filterType, setFilterType] = React.useState(
      FilterTradeTypes.allTypes
    );
    const [filterDate, setFilterDate] = React.useState<
      DateRange<string | Date>
    >([null, null]);
    const [filterPair, setFilterPair] = React.useState("all");
    const [page, setPage] = React.useState(1);
    // const [totalData, setTotalData] = React.useState<RawDataTradeItem[]>(rawData)
    const { currency, isMobile } = useSettings();
    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnModeMobileAssets(t, currency, tokenMap, isL2Trade)
        : getColumnModeAssets(t, currency, tokenMap, isL2Trade),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<RawDataTradeItem, unknown>[],
      style: {
        backgroundColor: ({ colorBase }: any) => `${colorBase.box}`,
      },
    };
    // useDeepCompareEffect(() => {
    //     setTotalData(rawData);
    // }, [rawData])

    const pageSize = pagination ? pagination.pageSize : 10;

    const updateData = React.useCallback(
      ({ TableType, currFilterPair = filterPair, currPage = page }) => {
        if (TableType === "filter") {
          setPage(1);
        }
        const market =
          currFilterPair === "all" ? "" : currFilterPair.replace(/\s+/g, "");
        if (getUserTradeList) {
          getUserTradeList({
            market,
            offset: (currPage - 1) * pageSize,
            limit: pageSize,
          });
        }
      },
      [filterPair, getUserTradeList, page, pageSize]
    );

    const handleFilterChange = React.useCallback(
      ({ type = filterType, date = filterDate, pair = filterPair }) => {
        setFilterType(type);
        setFilterDate(date);
        setFilterPair(pair);
        updateData({
          TableType: TableType.filter,
          currFilterType: type,
          currFilterDate: date,
          currFilterPair: pair,
        });
      },
      [updateData, filterDate, filterType, filterPair]
    );

    const handlePageChange = React.useCallback(
      (page: number) => {
        setPage(page);
        updateData({ TableType: TableType.page, currPage: page });
      },
      [updateData]
    );

    const handleReset = () => {
      setFilterType(FilterTradeTypes.allTypes);
      setFilterDate([null, null]);
      setFilterPair("all");
      updateData({
        TableType: "filter",
        currFilterType: FilterTradeTypes.allTypes,
        currFilterDate: [null, null],
        currFilterPair: "all",
        currPage: 1,
      });
    };
    const tradeposition = isL2Trade === true ? "layer2" : "swap";

    return (
      <TableStyled currentheight={currentheight} tradeposition={tradeposition}>
        {showFilter && (
          <TableFilterStyled>
            <Filter
              {...{
                rawData,
                handleFilterChange,
                filterType,
                filterDate,
                filterPair,
                handleReset,
                marketMap,
              }}
            />
          </TableFilterStyled>
        )}
        <Table
          className={"scrollable"}
          {...{
            ...defaultArgs,
            rowHeight,
            headerRowHeight,
            showloading: showLoading,
            ...rest,
            rawData: rawData,
          }}
        />
        {pagination && (
          <TablePagination
            height={rowHeight}
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
