import _ from "lodash";
import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import {
  DAY_FORMAT,
  DirectionTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  MINUTE_FORMAT,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { Column, Table, TablePagination } from "../../basic-lib";
import { Box, BoxProps, Typography } from "@mui/material";
import moment from "moment";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { LABEL_INVESTMENT_STATUS_MAP, RawDataDualTxsItem } from "./Interface";
import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 30% auto 76px  120px 120px 160px 120px !important;`
        : `--template-columns: 100% !important;`}
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

export interface DualTxsTableProps<R = RawDataDualTxsItem> {
  // etherscanBaseUrl?: string;
  rawData: R[];
  pagination?: {
    pageSize: number;
    total: number;
  };
  idIndex: { [key: string]: string };
  tokenMap: { [key: string]: any };
  dualMarketMap: any;

  getDualTxList: (props: any) => Promise<void>;
  // filterTokens: string[];
  // showFilter?: boolean;
  showloading: boolean;
  // accAddress: string;
  // accountId: number;
}

export const DualTxsTable = withTranslation(["tables", "common"])(
  <R extends RawDataDualTxsItem>(
    props: DualTxsTableProps<R> & WithTranslation
  ) => {
    const {
      rawData,
      idIndex,
      pagination,
      tokenMap,
      getDualTxList,
      showloading,
      dualMarketMap,
      t,
    } = props;
    const { isMobile } = useSettings();
    const [page, setPage] = React.useState(1);

    const updateData = _.debounce(
      ({
        // tableType,
        currPage = page,
        pageSize = pagination?.pageSize ?? 10,
      }: {
        // tableType: TableType;
        currPage?: number;
        pageSize?: number;
      }) => {
        getDualTxList({
          limit: pageSize,
          offset: (currPage - 1) * pageSize,
        });
      },
      globalSetup.wait
    );

    const handlePageChange = React.useCallback(
      (currPage: number) => {
        if (currPage === page) return;
        setPage(currPage);
        updateData({ currPage: currPage });
      },
      [updateData, page]
    );

    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          sortable: false,
          width: "auto",
          key: "DualTxsSide",
          name: t("labelDualTxsSide"),
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const {
              __raw__: {
                order: {
                  settlementStatus,
                  tokenInfoOrigin: {
                    amountIn,
                    tokenOut,

                    amountOut,
                  },
                  timeOrigin: { expireTime },
                  investmentStatus
                },
              },
              // expireTime,
              sellSymbol,
            } = row;
            const sellAmount = sdk
              .toBig(amountIn ? amountIn : 0)
              .div("1e" + tokenMap[sellSymbol].decimals);
            const amount = getValuePrecisionThousand(
              sellAmount,
              tokenMap[sellSymbol].precision,
              tokenMap[sellSymbol].precision,
              tokenMap[sellSymbol].precision,
              false
            );
            const side =
              settlementStatus === sdk.SETTLEMENT_STATUS.PAID
                ? t(LABEL_INVESTMENT_STATUS_MAP.INVESTMENT_RECEIVED)
                : Date.now() - expireTime >= 0
                ? t(LABEL_INVESTMENT_STATUS_MAP.DELIVERING)
                : t(LABEL_INVESTMENT_STATUS_MAP.INVESTMENT_SUBSCRIBE);
            const statusColor =
              settlementStatus === sdk.SETTLEMENT_STATUS.PAID
                ? "var(--color-tag)"
                : Date.now() - expireTime >= 0
                ? "var(--color-warning)"
                : "var(--color-success)";
            let buySymbol, buyAmount;
            if (tokenOut !== undefined) {
              buySymbol = tokenMap[idIndex[tokenOut]].symbol;
              buyAmount = getValuePrecisionThousand(
                sdk
                  .toBig(amountOut ? amountOut : 0)
                  .div("1e" + tokenMap[buySymbol].decimals),
                tokenMap[buySymbol].precision,
                tokenMap[buySymbol].precision,
                tokenMap[buySymbol].precision,
                false
              );
            }

            const sentence =
              settlementStatus === sdk.SETTLEMENT_STATUS.PAID
                ? `${amount} ${sellSymbol} ${DirectionTag} ${buyAmount} ${buySymbol} `
                : Date.now() - expireTime >= 0
                ? `${amount} ${sellSymbol}`
                : `${amount} ${sellSymbol}`;
            const pending = <Typography borderRadius={1} marginLeft={1} paddingX={0.5} bgcolor={"var(--color-warning)"}>pending</Typography>
            const failed = <Typography borderRadius={1} marginLeft={1} paddingX={0.5} bgcolor={"var(--color-error)"}>failed</Typography>
            return (
              <Box display={"flex"} alignItems={"center"} flexDirection={"row"}>
                <Typography color={statusColor}>{side}</Typography>
                &nbsp;&nbsp;
                <Typography component={"span"}>{sentence}</Typography>
                { 
                  investmentStatus === sdk.LABEL_INVESTMENT_STATUS.FAILED 
                    ? failed
                    : investmentStatus === sdk.LABEL_INVESTMENT_STATUS.PROCESSING 
                      ? pending
                      : null 
                }
              </Box>
            );
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Product",
          name: t("labelDualTxsProduct"),
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const {
              sellSymbol,
              buySymbol,
              __raw__: {
                order: { dualType },
              },
            } = row;
            const [base, quote] =
              dualType === DUAL_TYPE.DUAL_BASE
                ? [sellSymbol, buySymbol]
                : [buySymbol, sellSymbol];
            return <>{base + "/" + quote}</>;
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "APR",
          name: t("labelDualTxAPR"),
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.apy}</>;
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "TargetPrice",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDualTxsTargetPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.strike}</>;
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Price",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDualTxsSettlementPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const {
              __raw__: {
                order: {
                  deliveryPrice,
                  tokenInfoOrigin: { quote },
                },
              },
              // currentPrice: { currentPrice, quote },
            } = row;
            return (
              <>
                {deliveryPrice
                  ? getValuePrecisionThousand(
                      deliveryPrice,
                      tokenMap[quote]?.precision,
                      tokenMap[quote]?.precision,
                      tokenMap[quote]?.precision,
                      true,
                      { isFait: true }
                    )
                  : EmptyValueTag}
              </>
            );
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Settlement_Date",
          name: t("labelDualTxsSettlement_Date"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                height={"100%"}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
              >
                {moment(
                  new Date(row.__raw__.order.timeOrigin.expireTime)
                ).format(YEAR_DAY_MINUTE_FORMAT)}
              </Typography>
            );
          },
        },
        {
          key: "time",
          name: t("labelDualTxsTime"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            return (
              <Box className="rdg-cell-value textAlignRight">
                {moment(
                  new Date(row.__raw__.order?.createdAt),
                  "YYYYMMDDHHMM"
                ).fromNow()}
              </Box>
            );
          },
        },
      ],
      []
    );

    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          sortable: false,
          width: "auto",
          key: "DualTxsSide",
          name: t("labelDualTxsSide"),
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const {
              sellSymbol,
              apy,
              buySymbol: _marketBuy,
              __raw__: {
                order: {
                  settlementStatus,
                  dualType,
                  deliveryPrice,
                  tokenInfoOrigin: {
                    amountIn,
                    tokenOut,

                    amountOut,
                  },
                  timeOrigin: { expireTime },
                },
              },
            } = row;
            const sellAmount = sdk
              .toBig(amountIn ? amountIn : 0)
              .div("1e" + tokenMap[sellSymbol].decimals);
            const amount = getValuePrecisionThousand(
              sellAmount,
              tokenMap[sellSymbol].precision,
              tokenMap[sellSymbol].precision,
              tokenMap[sellSymbol].precision,
              false
            );
            const side =
              settlementStatus === sdk.SETTLEMENT_STATUS.PAID
                ? t(LABEL_INVESTMENT_STATUS_MAP.INVESTMENT_RECEIVED)
                : Date.now() - expireTime >= 0
                ? t(LABEL_INVESTMENT_STATUS_MAP.DELIVERING)
                : t(LABEL_INVESTMENT_STATUS_MAP.INVESTMENT_SUBSCRIBE);
            const statusColor =
              settlementStatus === sdk.SETTLEMENT_STATUS.PAID
                ? "var(--color-tag)"
                : Date.now() - expireTime >= 0
                ? "var(--color-warning)"
                : "var(--color-success)";
            let buySymbol, buyAmount;
            if (tokenOut !== undefined) {
              buySymbol = tokenMap[idIndex[tokenOut]].symbol;
              buyAmount = getValuePrecisionThousand(
                sdk
                  .toBig(amountOut ? amountOut : 0)
                  .div("1e" + tokenMap[buySymbol].decimals),
                tokenMap[buySymbol].precision,
                tokenMap[buySymbol].precision,
                tokenMap[buySymbol].precision,
                false
              );
            }

            const sentence =
              settlementStatus === sdk.SETTLEMENT_STATUS.PAID
                ? `${amount} ${sellSymbol} ${DirectionTag} ${buyAmount} ${buySymbol} `
                : Date.now() - expireTime >= 0
                ? `${amount} ${sellSymbol}`
                : `${amount} ${sellSymbol}`;
            const [base, quote] =
              dualType === DUAL_TYPE.DUAL_BASE
                ? [sellSymbol, _marketBuy]
                : [_marketBuy, sellSymbol];
            return (
              <Box
                display={"flex"}
                alignItems={"stretch"}
                flexDirection={"column"}
              >
                <Typography
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  variant={"body2"}
                >
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    display={"inline-flex"}
                    alignItems={"center"}
                  >
                    <Typography
                      component={"span"}
                      variant={"inherit"}
                      color={statusColor}
                    >
                      {side}
                    </Typography>
                    &nbsp;
                    <Typography
                      component={"span"}
                      color={"textPrimary"}
                      variant={"inherit"}
                    >
                      {sentence}
                    </Typography>
                  </Typography>
                  <Typography
                    component={"span"}
                    color={"textPrimary"}
                    paddingLeft={1}
                    variant={"body2"}
                  >
                    APY: {apy}
                  </Typography>
                </Typography>
                {/* " - " +*/}
                {/*&nbsp;&nbsp;*/}

                <Typography
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  variant={"body2"}
                >
                  <Typography
                    component={"span"}
                    color={"textSecondary"}
                    variant={"body2"}
                  >
                    {base + "/" + quote}
                  </Typography>
                  <Typography
                    component={"span"}
                    variant={"body2"}
                    paddingLeft={1}
                  >
                    {` ${t("labelDualTxsSettlement")}:                  
                    ${
                      deliveryPrice
                        ? getValuePrecisionThousand(
                            deliveryPrice,
                            tokenMap[quote]?.precision,
                            tokenMap[quote]?.precision,
                            tokenMap[quote]?.precision,
                            true,
                            { isFait: true }
                          )
                        : EmptyValueTag
                    }
                    (${t("labelDualTPrice")} : ${row?.strike})
                    ${moment(
                      new Date(row.__raw__.order.timeOrigin.expireTime)
                    ).format(`${DAY_FORMAT} ${MINUTE_FORMAT}`)}
                    `}
                  </Typography>
                </Typography>
              </Box>
            );
          },
        },
      ],
      [t, tokenMap, idIndex]
    );

    // const [isDropDown, setIsDropDown] = React.useState(true);

    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnMobileTransaction()
        : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };
    React.useEffect(() => {
      if (dualMarketMap) {
        updateData.cancel();
        updateData({ currPage: 1 });
      }
      // let filters: any = {};

      // handlePageChange(1);
      // if (searchParams.get("types")) {
      //   filters.type = searchParams.get("types");
      // }
      // handleFilterChange(filters);
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize, dualMarketMap]);

    return (
      <TableStyled isMobile={isMobile}>
        <Table
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,
            rawData,
            showloading,
          }}
        />
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
