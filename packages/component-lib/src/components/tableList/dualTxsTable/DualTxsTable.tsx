import _ from "lodash";
import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import {
  DirectionTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
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
import BigNumber from "bignumber.js";

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: auto auto 80px  100px 160px 160px 120px !important;`
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
                  deliveryPrice,
                  dualType,
                  settlementStatus,
                  tokenInfoOrigin: { amountIn, base, quote, amountOut },
                  settleRatio,
                  strike,
                },
              },

              expireTime,
              sellSymbol,
              buySymbol,
            } = row;
            let lessEarnVol, greaterEarnVol;
            const sellAmount = sdk
              .toBig(amountIn ? amountIn : 0)
              .div("1e" + tokenMap[sellSymbol].decimals);
            if (dualType === sdk.DUAL_TYPE.DUAL_BASE) {
              lessEarnVol = sdk.toBig(settleRatio).plus(1).times(amountIn); //dualViewInfo.strike);
              greaterEarnVol = sdk
                .toBig(
                  sdk
                    .toBig(settleRatio)
                    .plus(1)
                    .times(sellAmount ? sellAmount : 0)
                    .times(strike)
                    .toFixed(
                      tokenMap[buySymbol].precision,
                      BigNumber.ROUND_CEIL
                    )
                )
                .times("1e" + tokenMap[buySymbol].decimals);
            } else {
              lessEarnVol = sdk
                .toBig(
                  sdk
                    .toBig(settleRatio)
                    .plus(1)
                    .times(sellAmount ? sellAmount : 0)
                    // .times(1 + info.ratio)
                    .div(strike)
                    .toFixed(
                      tokenMap[buySymbol].precision,
                      BigNumber.ROUND_CEIL
                    )
                )
                .times("1e" + tokenMap[buySymbol].decimals);

              // sellVol.times(1 + info.ratio).div(dualViewInfo.strike); //.times(1 + dualViewInfo.settleRatio);
              greaterEarnVol = sdk.toBig(settleRatio).plus(1).times(amountIn);
            }
            const lessEarnView =
              amountIn && amountOut
                ? getValuePrecisionThousand(
                    sdk.toBig(lessEarnVol).div("1e" + tokenMap[base].decimals),
                    tokenMap[base].precision,
                    tokenMap[base].precision,
                    tokenMap[base].precision,
                    false,
                    { floor: true }
                  )
                : EmptyValueTag;
            const greaterEarnView =
              amountIn && amountOut
                ? getValuePrecisionThousand(
                    sdk
                      .toBig(greaterEarnVol)
                      .div("1e" + tokenMap[quote].decimals),
                    tokenMap[quote].precision,
                    tokenMap[quote].precision,
                    tokenMap[quote].precision,
                    false,
                    { floor: true }
                  )
                : EmptyValueTag;

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
                ? "var(--color-success)"
                : Date.now() - expireTime >= 0
                ? "var(--color-warning)"
                : "var(--color-error)";

            let buyAmount, sentence;
            buyAmount =
              deliveryPrice - strike >= 0
                ? `${greaterEarnView} ${quote}`
                : `${lessEarnView} ${base}`;
            sentence =
              settlementStatus === sdk.SETTLEMENT_STATUS.PAID
                ? `${amount} ${sellSymbol} ${DirectionTag} ${buyAmount} ${buySymbol}`
                : Date.now() - expireTime >= 0
                ? `${amount} ${sellSymbol}`
                : `${amount} ${sellSymbol}`;
            return (
              <Box display={"flex"} alignItems={"center"} flexDirection={"row"}>
                <Typography color={statusColor}>{side}</Typography>
                &nbsp;&nbsp;
                <Typography component={"span"}>{sentence}</Typography>
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
            return <>{row?.sellSymbol + "/" + row?.buySymbol}</>;
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
          name: t("labelDualTxsTargetPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.strike + " " + row.buySymbol}</>;
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
                {moment(new Date(row.expireTime)).format(
                  YEAR_DAY_MINUTE_FORMAT
                )}
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
                  new Date(row.__raw__.order?.timeOrigin?.updateTime),
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
          key: "side",
          name: (
            <Typography
              height={"100%"}
              display={"flex"}
              justifyContent={"space-between"}
              variant={"inherit"}
              color={"inherit"}
              alignItems={"center"}
            >
              <span>{t("labelDualType")}</span>
              <span>{t("labelDualTime") + "/" + t("labelDualFee")}</span>
            </Typography>
          ),
          headerCellClass: "textAlignRight",
          formatter: ({ row: _row }: FormatterProps<R, unknown>) => {
            // const { action, sellToken, buyToken } = row;
            // const isJoin = !new RegExp(sdk.DualAction.Withdraw, "ig").test(
            //   action ?? " "
            // );
            // const sellTokenInfo =
            //   sellToken?.tokenId !== undefined &&
            //   tokenMap[idIndex[sellToken?.tokenId]];
            // const sellVolume = sdk
            //   .toBig(sellToken?.volume ?? 0)
            //   .div("1e" + sellTokenInfo.decimals);
            // const buyTokenInfo =
            //   buyToken?.tokenId !== undefined &&
            //   tokenMap[idIndex[buyToken?.tokenId]];
            // const buyVolume = sdk
            //   .toBig(buyToken?.volume ?? 0)
            //   .div("1e" + buyTokenInfo.decimals);
            // const side = isJoin ? t("labelDualJoin") : t("labelDualExit");
            // const { fee } = row;
            // const feeTokenInfo = tokenMap[idIndex[fee?.tokenId ?? ""]];
            // const feeVolume = sdk
            //   .toBig(fee?.volume ?? 0)
            //   .div("1e" + feeTokenInfo.decimals)
            //   .toNumber();
            // const renderFee =
            //   feeVolume === 0 || feeVolume === undefined
            //     ? EmptyValueTag
            //     : `${getValuePrecisionThousand(
            //         feeVolume,
            //         feeTokenInfo?.precision,
            //         feeTokenInfo?.precision,
            //         feeTokenInfo?.precision,
            //         false,
            //         { isTrade: false, floor: false }
            //       )} ${feeTokenInfo.symbol}`;
            // const { updatedAt: time } = row;
            // let timeString;
            // if (typeof time === "undefined") {
            //   timeString = EmptyValueTag;
            // } else {
            //   timeString = moment(new Date(time), "YYYYMMDDHHMM").fromNow();
            // }
            return (
              <Box
                display={"flex"}
                alignItems={"stretch"}
                justifyContent={"center"}
                flexDirection={"column"}
                height={"100%"}
              >
                {/*<Typography*/}
                {/*  component={"span"}*/}
                {/*  display={"flex"}*/}
                {/*  flexDirection={"row"}*/}
                {/*  variant={"body2"}*/}
                {/*  justifyContent={"space-between"}*/}
                {/*>*/}
                {/*  <Typography*/}
                {/*    color={*/}
                {/*      isJoin ? "var(--color-success)" : "var(--color-error)"*/}
                {/*    }*/}
                {/*  >*/}
                {/*    {side}*/}
                {/*  </Typography>*/}
                {/*  &nbsp;*/}
                {/*  <Typography component={"span"}>*/}
                {/*    <Typography component={"span"}>*/}
                {/*      {`${getValuePrecisionThousand(*/}
                {/*        sellVolume,*/}
                {/*        sellTokenInfo?.precision,*/}
                {/*        sellTokenInfo?.precision,*/}
                {/*        sellTokenInfo?.precision,*/}
                {/*        false,*/}
                {/*        { isTrade: false, floor: false }*/}
                {/*      )} ${sellTokenInfo.symbol}`}*/}
                {/*    </Typography>*/}
                {/*    &nbsp;{DirectionTag} &nbsp;*/}
                {/*    <Typography component={"span"}>*/}
                {/*      {`${getValuePrecisionThousand(*/}
                {/*        buyVolume,*/}
                {/*        buyTokenInfo?.precision,*/}
                {/*        buyTokenInfo?.precision,*/}
                {/*        buyTokenInfo?.precision,*/}
                {/*        false,*/}
                {/*        { isTrade: false, floor: false }*/}
                {/*      )} ${buyTokenInfo.symbol}`}*/}
                {/*    </Typography>*/}
                {/*  </Typography>*/}
                {/*</Typography>*/}
                {/*<Typography*/}
                {/*  component={"span"}*/}
                {/*  display={"flex"}*/}
                {/*  flexDirection={"row"}*/}
                {/*  variant={"body2"}*/}
                {/*  justifyContent={"space-between"}*/}
                {/*>*/}
                {/*  <Typography*/}
                {/*    variant={"inherit"}*/}
                {/*    component={"span"}*/}
                {/*    color={"textSecondary"}*/}
                {/*    alignSelf={"flex-end"}*/}
                {/*  >*/}
                {/*    {`Fee: ${renderFee}`}*/}
                {/*  </Typography>*/}
                {/*  <Typography*/}
                {/*    component={"span"}*/}
                {/*    textAlign={"right"}*/}
                {/*    variant={"inherit"}*/}
                {/*  >*/}
                {/*    {timeString}*/}
                {/*  </Typography>*/}
                {/*</Typography>*/}
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
      // let filters: any = {};
      updateData.cancel();
      updateData({ currPage: 1 });
      // handlePageChange(1);
      // if (searchParams.get("types")) {
      //   filters.type = searchParams.get("types");
      // }
      // handleFilterChange(filters);
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);

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
