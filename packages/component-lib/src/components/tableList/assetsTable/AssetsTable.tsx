import React, { useCallback, useEffect, useState } from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { TFunction, withTranslation, WithTranslation } from "react-i18next";
import { Column, Table } from "../../basic-lib";
import { Filter } from "./components/Filter";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import {
  getValuePrecisionThousand,
  MarketType,
  PriceTag,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { CoinIcons } from "./components/CoinIcons";
import ActionMemo from "./components/ActionMemo";
import { Currency } from "@loopring-web/loopring-sdk";

const TableWrap = styled(Box)<BoxProps & { isMobile?: boolean; lan: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    flex: 1;

    ${({ isMobile, lan }) =>
      !isMobile
        ? `--template-columns: 200px 150px auto auto ${
            lan === "en_US" ? "186px" : "186px"
          } !important;`
        : `--template-columns: 54% 40% 6% !important;`}

    .rdg-cell:first-of-type {
      display: flex;
      align-items: center;
      margin-top: ${({ theme }) => theme.unit / 8}px;
    }

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .textAlignRight {
      text-align: right;
    }
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean; lan: string } & BoxProps) => JSX.Element;

interface Row {
  token: {
    type: TokenType;
    value: string;
  };
  amount: string;
  available: string;
  locked: string;
  filterColumn?: string;
  tradePairList?: {
    first: string;
    last: string;
  }[];
  cellExpend?: {
    value: string;
    children: [];
    isExpanded: boolean;
  };
  children?: Row[];
  isExpanded?: boolean;
  format?: any;
}

export enum TokenType {
  single = "single",
  lp = "lp",
}

export type TradePairItem = {
  first: string;
  last: string;
};

export enum LpTokenAction {
  add = "add",
  remove = "remove",
}

export type RawDataAssetsItem = {
  token: {
    type: TokenType;
    value: string;
  };
  amount: string;
  available: string;
  locked: string;
  tradePairList?: TradePairItem[];
  smallBalance: boolean;
  tokenValueDollar: number;
  tokenValueYuan: number;
};

export interface AssetsTableProps {
  rawData: RawDataAssetsItem[];
  pagination?: {
    pageSize: number;
  };
  allowTrade?: any;
  tableHeight?: number;
  onVisibleRowsChange?: (props: any) => void;
  showFilter?: boolean;
  onSend: (token: string, isToL1: boolean) => void;
  onReceive: (token: string) => void;
  // onShowDeposit: (token: string) => void;
  // onShowTransfer: (token: string) => void;
  // onShowWithdraw: (token: string) => void;
  getMarketArrayListCallback: (token: string) => string[];
  hideLpToken: boolean;
  hideSmallBalances: boolean;
  disableWithdrawList: string[];
  setHideLpToken: (value: boolean) => void;
  setHideSmallBalances: (value: boolean) => void;
}

const RowConfig = {
  rowHeight: 44,
  headerRowHeight: 44,
};

export const AssetsTable = withTranslation("tables")(
  (props: WithTranslation & AssetsTableProps) => {
    const {
      t,
      rawData,
      allowTrade,
      showFilter,
      onReceive,
      onSend,
      getMarketArrayListCallback,
      disableWithdrawList,
      hideLpToken,
      hideSmallBalances,
      setHideLpToken,
      setHideSmallBalances,
      ...rest
    } = props;

    const [filter, setFilter] = useState({
      searchValue: "",
    });
    const [totalData, setTotalData] = useState<RawDataAssetsItem[]>(rawData);
    const [viewData, setViewData] = useState<RawDataAssetsItem[]>(rawData);
    const [tableHeight, setTableHeight] = React.useState(props.tableHeight);

    const resetTableData = React.useCallback(
      (viewData) => {
        setViewData(viewData);
        setTableHeight(
          RowConfig.headerRowHeight + viewData.length * RowConfig.rowHeight
        );
      },
      [setViewData, setTableHeight]
    );
    const { language, isMobile } = useSettings();
    const { coinJson, currency } = useSettings();
    const isUSD = currency === Currency.usd;
    useEffect(() => {
      setTotalData(rawData);
    }, [rawData]);
    useEffect(() => {
      updateData();
    }, [totalData, filter, hideLpToken, hideSmallBalances]);

    const getColumnModeAssets = (
      t: TFunction,
      allowTrade?: any
    ): Column<Row, unknown>[] => [
      {
        key: "token",
        name: t("labelToken"),
        formatter: ({ row, column }) => {
          const token = row[column.key];
          let tokenIcon: [any, any] = [undefined, undefined];
          const [head, middle, tail] = token.value.split("-");
          if (token.type === "lp" && middle && tail) {
            tokenIcon =
              coinJson[middle] && coinJson[tail]
                ? [coinJson[middle], coinJson[tail]]
                : [undefined, undefined];
          }
          if (token.type !== "lp" && head && head !== "lp") {
            tokenIcon = coinJson[head]
              ? [coinJson[head], undefined]
              : [undefined, undefined];
          }
          return (
            <>
              <CoinIcons tokenIcon={tokenIcon} />
              <Typography
                variant={"inherit"}
                color={"textPrimary"}
                display={"flex"}
                flexDirection={"column"}
                marginLeft={2}
                component={"span"}
                paddingRight={1}
              >
                <Typography component={"span"} className={"next-coin"}>
                  {token.value}
                </Typography>
              </Typography>
            </>
          );
        },
      },
      {
        key: "amount",
        name: t("labelAmount"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const value = row["amount"];
          const precision = row["precision"];
          return (
            <Box className={"textAlignRight"}>
              {getValuePrecisionThousand(
                value,
                precision,
                precision,
                undefined,
                false,
                { floor: true }
              )}
            </Box>
          );
        },
      },
      {
        key: "locked",
        name: t("labelLocked"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const value = row["locked"];
          const precision = row["precision"];
          return (
            <Box className={"textAlignRight"}>
              {getValuePrecisionThousand(
                value,
                precision,
                precision,
                undefined,
                false,
                { floor: true }
              )}
            </Box>
          );
        },
      },
      {
        key: "value",
        name: t("labelAssetsTableValue"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const tokenValueDollar = row["tokenValueDollar"];
          const tokenValueYuan = row["tokenValueYuan"];
          const renderValue = isUSD ? tokenValueDollar : tokenValueYuan;
          return (
            <Box className={"textAlignRight"}>
              {isUSD ? PriceTag.Dollar : PriceTag.Yuan}
              {getValuePrecisionThousand(
                renderValue,
                undefined,
                undefined,
                undefined,
                true,
                { isFait: true, floor: true }
              )}
            </Box>
          );
        },
      },
      {
        key: "actions",
        name: t("labelActions"),
        headerCellClass: "textAlignRight",
        // minWidth: 280,
        formatter: ({ row }) => {
          const token = row["token"];
          const isLp = token.type === TokenType.lp;
          const tokenValue = token.value;

          const isToL1 = token.type !== TokenType.lp;

          const lpPairList = tokenValue.split("-");
          lpPairList.splice(0, 1);
          const lpPair = lpPairList.join("-");
          const renderMarket: MarketType = (
            isLp ? lpPair : tokenValue
          ) as MarketType;
          return (
            <ActionMemo
              {...{
                t,
                tokenValue,
                getMarketArrayListCallback,
                disableWithdrawList,
                isLp,
                isToL1,
                allowTrade,
                market: renderMarket,
                onReceive,
                onSend,
              }}
            />
          );
        },
      },
    ];
    const getColumnMobileAssets = (
      t: TFunction,
      allowTrade?: any
    ): Column<Row, unknown>[] => [
      {
        key: "token",
        name: t("labelToken"),
        formatter: ({ row, column }) => {
          const token = row[column.key];
          const value = row["amount"];
          const precision = row["precision"];
          let tokenIcon: [any, any] = [undefined, undefined];
          const [head, middle, tail] = token.value.split("-");
          if (token.type === "lp" && middle && tail) {
            tokenIcon =
              coinJson[middle] && coinJson[tail]
                ? [coinJson[middle], coinJson[tail]]
                : [undefined, undefined];
          }
          if (token.type !== "lp" && head && head !== "lp") {
            tokenIcon = coinJson[head]
              ? [coinJson[head], undefined]
              : [undefined, undefined];
          }
          return (
            <>
              <Typography width={"56px"} display={"flex"}>
                <CoinIcons tokenIcon={tokenIcon} />
              </Typography>
              <Typography
                variant={"body1"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"flex-end"}
                textAlign={"right"}
                flex={1}
              >
                <Typography display={"flex"}>
                  {getValuePrecisionThousand(
                    value,
                    precision,
                    precision,
                    undefined,
                    false,
                    { floor: true }
                  )}
                </Typography>
                <Typography
                  display={"flex"}
                  color={"textSecondary"}
                  marginLeft={1}
                >
                  {token.value}
                </Typography>
              </Typography>
            </>
          );
        },
      },
      {
        key: "locked",
        name: t("labelLocked"),
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const value = row["locked"];
          const precision = row["precision"];
          return (
            <Box className={"textAlignRight"}>
              {getValuePrecisionThousand(
                value,
                precision,
                precision,
                undefined,
                false,
                { floor: true }
              )}
            </Box>
          );
        },
      },
      {
        key: "actions",
        name: "",
        headerCellClass: "textAlignRight",
        // minWidth: 280,
        formatter: ({ row }) => {
          const token = row["token"];
          const isLp = token.type === TokenType.lp;
          const tokenValue = token.value;
          const lpPairList = tokenValue.split("-");
          lpPairList.splice(0, 1);
          const lpPair = lpPairList.join("-");
          const renderMarket: MarketType = (
            isLp ? lpPair : tokenValue
          ) as MarketType;
          return (
            <ActionMemo
              {...{
                t,
                tokenValue,
                getMarketArrayListCallback,
                disableWithdrawList,
                isLp,
                allowTrade,
                market: renderMarket,
                onReceive,
                onSend,
              }}
            />
          );
        },
      },
    ];
    const updateData = useCallback(() => {
      let resultData = totalData && !!totalData.length ? totalData : [];
      // if (filter.hideSmallBalance) {
      if (hideSmallBalances) {
        resultData = resultData.filter((o) => !o.smallBalance);
      }
      // if (filter.hideLpToken) {
      if (hideLpToken) {
        resultData = resultData.filter(
          (o) => o.token.type === TokenType.single
        );
      }
      if (filter.searchValue) {
        resultData = resultData.filter((o) =>
          o.token.value.toLowerCase().includes(filter.searchValue.toLowerCase())
        );
      }
      resetTableData(resultData);
    }, [totalData, filter, hideSmallBalances, hideLpToken, resetTableData]);

    const handleFilterChange = useCallback(
      (filter) => {
        setFilter(filter);
      },
      [setFilter]
    );

    return (
      <TableWrap lan={language} isMobile={isMobile}>
        {showFilter && (
          // (isMobile && isDropDown ? (
          //   <Link
          //     variant={"body1"}
          //     display={"inline-flex"}
          //     width={"100%"}
          //     justifyContent={"flex-end"}
          //     paddingRight={2}
          //     onClick={() => setIsDropDown(false)}
          //   >
          //     Show Filter
          //   </Link>
          // ) :
          <TableFilterStyled>
            <Filter
              {...{
                handleFilterChange,
                filter,
                hideLpToken,
                hideSmallBalances,
                setHideLpToken,
                setHideSmallBalances,
              }}
            />
          </TableFilterStyled>
        )}

        <Table
          {...{ ...rest, t }}
          style={{ height: tableHeight }}
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.headerRowHeight}
          rawData={viewData}
          generateRows={(rowData: any) => rowData}
          generateColumns={({ columnsRaw }: any) =>
            columnsRaw as Column<any, unknown>[]
          }
          columnMode={
            isMobile
              ? getColumnMobileAssets(t, allowTrade)
              : getColumnModeAssets(t, allowTrade)
          }
        />
      </TableWrap>
    );
  }
);
