import styled from "@emotion/styled";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  Account,
  AmmRankIcon,
  EmptyValueTag,
  FloatTag,
  getValuePrecisionThousand,
  PriceTag,
  RowConfig,
  StarHollowIcon,
  StarSolidIcon,
  TrophyIcon,
} from "@loopring-web/common-resources";
import { Column, Table } from "../../basic-lib";
import { TablePaddingX } from "../../styled";
import { useSettings } from "@loopring-web/component-lib/src/stores";
import { useDispatch } from "react-redux";
import {
  AmmPoolInProgressActivityRule,
  Currency,
  LoopringMap,
} from "@loopring-web/loopring-sdk";
import React from "react";

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
`;

const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.ispro === "pro") {
        return "620px";
      }
      if (props.currentheight && props.currentheight > 350) {
        return props.currentheight + "px";
      } else {
        return "100%";
      }
    }};

    --template-columns: ${({ ispro, isMobile }: any) =>
      ispro || isMobile
        ? "35% 44% auto"
        : "240px 220px 100px auto auto auto 132px"} !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }

  .textAlignCenter {
    text-align: center;
  }
` as any;

export type QuoteTableRawDataItem = {
  pair: {
    coinA: string;
    coinB: string;
  };
  close: number;
  change: number;
  high: number;
  low: number;
  floatTag: keyof typeof FloatTag;
  volume: number;
  changeDollar: number;
  changeYuan: number;
  closeDollar: number;
  closeYuan: number;
  coinAPriceDollar: number;
  coinAPriceYuan: number;
  precision?: number;
  priceDollar?: number;
  priceYuan?: number;
  reward?: number;
  rewardToken?: string;
  timeUnit?: "24h";
};

const QuoteTableChangedCell: any = styled.span`
  color: ${({ theme: { colorBase }, upColor, value }: any) => {
    const isUpColorGreen = upColor === "green";
    return value > 0
      ? isUpColorGreen
        ? colorBase.success
        : colorBase.error
      : value < 0
      ? isUpColorGreen
        ? colorBase.error
        : colorBase.success
      : colorBase.textPrimary;
  }};
`;

type IGetColumnModePros = {
  t: any;
  history: any;
  upColor: "green" | "red";
  handleStartClick: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    isFavourite: boolean,
    pair: string
  ) => void;
  favoriteMarket: string[];
  isPro: boolean;
};

export interface QuoteTableProps {
  rawData: QuoteTableRawDataItem[];
  rowHeight?: number;
  headerRowHeight?: number;
  onVisibleRowsChange?: (startIndex: number) => void;
  onRowClick?: (
    rowIdx: number,
    row: QuoteTableRawDataItem,
    column: any
  ) => void;
  account: Account;
  favoriteMarket: string[];
  addFavoriteMarket: (pair: string) => void;
  removeFavoriteMarket: (pair: string) => void;
  currentheight?: number;
  showLoading?: boolean;
  isPro?: boolean;
  activityInProgressRules: LoopringMap<AmmPoolInProgressActivityRule>;
}

export type VisibleDataItem = {
  coinA: string;
  coinB: string;
};

export const QuoteTable = withTranslation("tables")(
  withRouter(
    ({
      t,
      currentheight = 350,
      rowHeight = RowConfig.rowHeight,
      headerRowHeight = RowConfig.rowHeaderHeight,
      onVisibleRowsChange,
      rawData,
      history,
      onRowClick,
      favoriteMarket,
      addFavoriteMarket,
      removeFavoriteMarket,
      showLoading,
      account,
      isPro = false,
      activityInProgressRules,
      ...rest
    }: QuoteTableProps & WithTranslation & RouteComponentProps) => {
      let userSettings = useSettings();
      const upColor = userSettings?.upColor;
      const { currency, isMobile } = userSettings;
      const getColumnMode = (
        props: IGetColumnModePros & {
          currency: Currency;
          activityInProgressRules: LoopringMap<AmmPoolInProgressActivityRule>;
        }
      ): Column<QuoteTableRawDataItem, unknown>[] => {
        const {
          t: { t },
          history,
          upColor,
          handleStartClick,
          favoriteMarket,
          currency,
          isPro,
          activityInProgressRules,
        } = props;

        const isUSD = currency === Currency.usd;
        const basicRender = [
          {
            key: "pair",
            name: t("labelQuotaPair"),
            sortable: true,
            formatter: ({ row }: any) => {
              const { coinA, coinB } = row["pair"];
              const pair = `${coinA}-${coinB}`;
              const isFavourite = favoriteMarket?.includes(pair);
              return (
                <Box
                  className="rdg-cell-value"
                  display={"flex"}
                  alignItems={"center"}
                  height={"100%"}
                >
                  <Typography marginRight={1} marginLeft={-2}>
                    <IconButton
                      style={{ color: "var(--color-star)" }}
                      size={"large"}
                      onClick={(e: any) =>
                        handleStartClick(e, isFavourite, pair)
                      }
                    >
                      {isFavourite ? (
                        <StarSolidIcon cursor={"pointer"} />
                      ) : (
                        <StarHollowIcon cursor={"pointer"} />
                      )}
                    </IconButton>
                  </Typography>
                  <Typography component={"span"}>
                    {coinA}
                    <Typography component={"span"} color={"textSecondary"}>
                      /{coinB}
                    </Typography>
                  </Typography>
                  &nbsp;
                  {activityInProgressRules &&
                    activityInProgressRules[pair] &&
                    activityInProgressRules[pair].ruleType.map(
                      (ruleType, index) => (
                        <Box
                          key={ruleType.toString() + index}
                          style={{ cursor: "pointer", paddingTop: 4 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            const date = new Date(
                              activityInProgressRules[pair].rangeFrom
                            );
                            const year = date.getFullYear();
                            const month = (
                              "0" + (date.getMonth() + 1).toString()
                            ).slice(-2);
                            const day = ("0" + date.getDate().toString()).slice(
                              -2
                            );
                            const current_event_date = `${year}-${month}-${day}`;

                            history.push(
                              `/race-event/${current_event_date}?pair=${pair}&type=${ruleType}&owner=${account?.accAddress}`
                            );
                          }}
                        >
                          <TrophyIcon />
                        </Box>
                      )
                    )}
                  {activityInProgressRules &&
                    activityInProgressRules[`AMM-${pair}`] && (
                      <Box
                        style={{ cursor: "pointer", paddingTop: 4 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          const date = new Date(
                            activityInProgressRules[`AMM-${pair}`].rangeFrom
                          );
                          const year = date.getFullYear();
                          const month = (
                            "0" + (date.getMonth() + 1).toString()
                          ).slice(-2);
                          const day = ("0" + date.getDate().toString()).slice(
                            -2
                          );
                          const current_event_date = `${year}-${month}-${day}`;

                          history.push(
                            `/race-event/${current_event_date}?pair=${pair}&type=${
                              activityInProgressRules[`AMM-${pair}`].ruleType[0]
                            }&owner=${account?.accAddress}`
                          );
                        }}
                      >
                        <AmmRankIcon />
                      </Box>
                    )}
                </Box>
              );
            },
          },
          {
            key: "close",
            name: t("labelQuotaLastPrice"),
            headerCellClass: "textAlignCenter",
            cellClass: "textAlignRight",
            sortable: true,
            formatter: ({ row }: any) => {
              const value = row.close;
              const precision = row["precision"] || 6;
              const price = Number.isFinite(value)
                ? getValuePrecisionThousand(
                    value,
                    undefined,
                    undefined,
                    precision,
                    true,
                    { isPrice: true }
                  )
                : EmptyValueTag;

              const faitPrice = Number.isFinite(value)
                ? isUSD
                  ? PriceTag.Dollar +
                    getValuePrecisionThousand(
                      row.coinAPriceDollar,
                      2,
                      2,
                      2,
                      true,
                      {
                        isFait: true,
                      }
                    )
                  : PriceTag.Yuan +
                    getValuePrecisionThousand(
                      row.coinAPriceYuan,
                      2,
                      2,
                      2,
                      true,
                      {
                        isFait: true,
                      }
                    )
                : EmptyValueTag;
              return (
                <Typography
                  className="rdg-cell-value"
                  display={"inline-flex"}
                  alignItems={"center"}
                  whiteSpace={isMobile ? "pre-line" : "pre"}
                  justifyContent={isMobile ? "flex-end" : "flex-start"}
                >
                  <Typography component={"span"} variant={"inherit"}>
                    {price}
                  </Typography>
                  <Typography
                    component={"span"}
                    variant={isMobile ? "body2" : "body1"}
                    color={"var(--color-text-third)"}
                  >
                    {"/"}
                    {/*{isMobile ? "\n" : "/"}*/}
                    {faitPrice}
                  </Typography>
                </Typography>
              );
            },
          },
          {
            key: "change",
            name: t(
              isMobile ? "labelQuota24hChangeLit" : "labelQuota24hChange"
            ),
            sortable: true,
            headerCellClass: "textAlignCenter",
            formatter: ({ row }: any) => {
              const value = row.change;
              return (
                <div className="rdg-cell-value textAlignRight">
                  <QuoteTableChangedCell value={value} upColor={upColor}>
                    {typeof value !== "undefined"
                      ? (row.floatTag === FloatTag.increase ? "+" : "") +
                        getValuePrecisionThousand(value, 2, 2, 2, true) +
                        "%"
                      : EmptyValueTag}
                  </QuoteTableChangedCell>
                </div>
              );
            },
          },
        ];
        const extraRender = [
          {
            key: "high",
            name: t("labelQuota24hHigh"),
            headerCellClass: "textAlignRight",
            formatter: ({ row, column }: any) => {
              const value = row[column.key];
              const precision = row["precision"] || 6;
              const price = Number.isFinite(value)
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
                <div className="rdg-cell-value textAlignRight">
                  <span>{price}</span>
                </div>
              );
            },
          },
          {
            key: "low",
            name: t("labelQuota24hLow"),
            headerCellClass: "textAlignRight",
            formatter: ({ row, column }: any) => {
              const value = row[column.key];
              const precision = row["precision"] || 6;
              const price = Number.isFinite(value)
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
                <div className="rdg-cell-value textAlignRight">
                  <span>{price}</span>
                </div>
              );
            },
          },
          {
            key: "volume",
            name: t("labelQuota24hAmount"),
            headerCellClass: "textAlignRight",
            // resizable: true,
            sortable: true,
            formatter: ({ row }: any) => {
              const value = row["volume"];
              const precision = row["precision"] || 6;
              const price = Number.isFinite(value)
                ? getValuePrecisionThousand(
                    value,
                    precision,
                    undefined,
                    undefined,
                    true,
                    { isTrade: true }
                  )
                : EmptyValueTag;
              return (
                <div className="rdg-cell-value textAlignRight">
                  <span>{price}</span>
                </div>
              );
            },
          },
          {
            key: "actions",
            headerCellClass: "textAlignCenter",
            name: t("labelQuoteAction"),
            formatter: ({ row }: any) => {
              const { coinA, coinB } = row["pair"];
              const tradePair = `${coinA}-${coinB}`;
              return (
                <div className="rdg-cell-value textAlignCenter">
                  <Button
                    variant="outlined"
                    onClick={() =>
                      history.push({
                        pathname: `/trade/lite/${tradePair}`,
                      })
                    }
                  >
                    {t("labelTrade")}
                  </Button>
                </div>
              );
            },
          },
        ];
        // const isMobile = [];
        if (isMobile) {
          return [...basicRender];
        }
        if (isPro) {
          return [...basicRender];
        }

        return [...basicRender, ...extraRender];
      };

      const dispatch = useDispatch();

      const handleStartClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        isFavourite: boolean,
        pair: string
      ): void => {
        event.stopPropagation();
        if (isFavourite) {
          dispatch(removeFavoriteMarket(pair));
        } else {
          dispatch(addFavoriteMarket(pair));
        }
      };

      const defaultArgs: any = {
        rawData: [],
        columnMode: getColumnMode({
          t: { t },
          history,
          upColor,
          handleStartClick,
          favoriteMarket,
          currency,
          isPro,
          activityInProgressRules,
        }),
        generateRows: (rawData: any) => rawData,
        onRowClick: onRowClick,
        generateColumns: ({ columnsRaw }: any) =>
          columnsRaw as Column<QuoteTableRawDataItem, unknown>[],
        sortMethod: (
          sortedRows: QuoteTableRawDataItem[],
          sortColumn: string
        ) => {
          switch (sortColumn) {
            case "pair":
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a.pair.coinA;
                const valueB = b.pair.coinA;
                return valueB.localeCompare(valueA);
              });
              break;
            case "close":
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a["close"];
                const valueB = b["close"];
                if (valueA && valueB) {
                  return valueB - valueA;
                }
                if (valueA && !valueB) {
                  return -1;
                }
                if (!valueA && valueB) {
                  return 1;
                }
                return 0;
              });
              break;
            case "change":
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a["change"];
                const valueB = b["change"];
                if (valueA && valueB) {
                  return valueB - valueA;
                }
                if (valueA && !valueB) {
                  return -1;
                }
                if (!valueA && valueB) {
                  return 1;
                }
                return 0;
              });
              break;
            case "high":
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a["high"];
                const valueB = b["high"];
                if (valueA && valueB) {
                  return valueB - valueA;
                }
                if (valueA && !valueB) {
                  return -1;
                }
                if (!valueA && valueB) {
                  return 1;
                }
                return 0;
              });
              break;
            case "low":
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a["low"];
                const valueB = b["low"];
                if (valueA && valueB) {
                  return valueB - valueA;
                }
                if (valueA && !valueB) {
                  return -1;
                }
                if (!valueA && valueB) {
                  return 1;
                }
                return 0;
              });
              break;
            case "volume":
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a["volume"];
                const valueB = b["volume"];
                if (valueA && valueB) {
                  return valueB - valueA;
                }
                if (valueA && !valueB) {
                  return -1;
                }
                if (!valueA && valueB) {
                  return 1;
                }
                return 0;
              });
              break;
            default:
              return sortedRows;
          }
          return sortedRows;
        },
        sortDefaultKey: "change",
      };

      return (
        <TableWrapperStyled>
          <TableStyled
            isMobile={isMobile}
            currentheight={currentheight}
            ispro={isPro}
            className={"scrollable"}
            {...{
              ...defaultArgs,
              ...rest,
              onVisibleRowsChange,
              rawData,
              rowHeight,
              headerRowHeight,
              showloading: showLoading,
            }}
          />
        </TableWrapperStyled>
      );
    }
  )
);
