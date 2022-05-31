import React from "react";
import { Box, BoxProps, Grid, Typography } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import {
  Button,
  Popover,
  PopoverPure,
  PopoverType,
  PopoverWrapProps,
} from "../../basic-lib";
import { Column, Table } from "../../basic-lib/";
import {
  Account,
  CurrencyToTag,
  EmptyValueTag,
  ForexMap,
  getValuePrecisionThousand,
  globalSetup,
  MoreIcon,
  PriceTag,
  RowConfig,
} from "@loopring-web/common-resources";
import { Method, MyPoolRow, MyPoolTableProps } from "./Interface";
import styled from "@emotion/styled";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import { IconColumn } from "../poolsTable";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { bindHover } from "material-ui-popup-state/es";
import { useSettings } from "../../../stores";
import { Currency } from "@loopring-web/loopring-sdk";
import { Filter } from "./components/Filter";
import { AmmPairDetail } from "../../block";
import { ActionPopContent } from "./components/ActionPop";

export enum PoolTradeType {
  add = "add",
  swap = "swap",
  remove = "remove",
}

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 200px 80px auto auto !important;`
        : `--template-columns: 16% 60% auto 8% !important;`}
    height: calc(86px * 5 + var(--header-row-height));

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;
  }

  .textAlignRightSortable {
    display: flex;
    justify-content: flex-end;
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element;

const PoolStyle = styled(Box)`
  height: calc(${RowConfig.rowHeight}px);
  &.MuiTypography-body1 {
    font-size: ${({ theme }) => theme.fontDefault.body1};
  }

  .MuiButton-root:not(:first-of-type) {
    margin-left: ${({ theme }) => theme.unit}px;
  }
` as typeof Box;
const columnMode = <R extends MyPoolRow<{ [key: string]: any }>>(
  { t, handleWithdraw, handleDeposit, allowTrade }: WithTranslation & Method<R>,
  currency: Currency,
  getPopoverState: any,
  account: Account,
  tokenMap: { [key: string]: any },
  forexMap: ForexMap<Currency>
): Column<R, unknown>[] => [
  {
    key: "pools",
    sortable: false,
    width: "auto",
    minWidth: 240,
    name: t("labelPool"),
    formatter: ({ row }) => {
      return (
        <PoolStyle
          display={"flex"}
          flexDirection={"column"}
          alignContent={"flex-start"}
          justifyContent={"center"}
        >
          <IconColumn account={account} row={row.ammDetail as any} />
        </PoolStyle>
      );
    },
  },
  {
    key: "APR",
    sortable: true,
    name: t("labelAPR"),
    width: "auto",
    maxWidth: 80,
    headerCellClass: "textAlignRightSortable",
    formatter: ({ row }) => {
      const APR =
        typeof row?.ammDetail?.APR !== undefined && row.ammDetail.APR
          ? row.ammDetail.APR
          : EmptyValueTag;
      return (
        <Box className={"textAlignRight"}>
          <Typography component={"span"}>
            {APR === EmptyValueTag || typeof APR === "undefined"
              ? EmptyValueTag
              : getValuePrecisionThousand(APR, 2, 2, 2, true) + "%"}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "liquidity",
    sortable: true,
    width: "auto",
    headerCellClass: "textAlignRightSortable",
    name: t("labelMyLiquidity"),
    formatter: ({ row, rowIdx }) => {
      const popState = getPopoverState(rowIdx);
      if (!row || !row.ammDetail) {
        return (
          <Box
            display={"flex"}
            justifyContent={"flex-end"}
            alignItems={"center"}
          />
        );
      }
      const {
        // totalAmmValueDollar,
        balanceDollar,
        balanceA,
        balanceB,
        ammDetail: { coinAInfo, coinBInfo },
      } = row as any;
      // const coinAIcon: any = coinJson[coinAInfo.simpleName];
      // const coinBIcon: any = coinJson[coinBInfo.simpleName];
      return (
        <Box
          height={"100%"}
          display={"flex"}
          justifyContent={"flex-end"}
          alignItems={"center"}
        >
          <Box {...bindHover(popState)}>
            <Typography
              component={"span"}
              style={{ cursor: "pointer", textDecoration: "underline dotted" }}
            >
              {typeof balanceDollar === "undefined"
                ? EmptyValueTag
                : PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    (balanceDollar || 0) * (forexMap[currency] ?? 0),
                    undefined,
                    undefined,
                    2,
                    true,
                    { isFait: true, floor: true }
                  )}
            </Typography>
          </Box>
          <PopoverPure
            className={"arrow-top-center"}
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
            <AmmPairDetail
              coinA={coinAInfo.simpleName}
              coinB={coinBInfo.simpleName}
              balanceA={balanceA}
              balanceB={balanceB}
              precisionA={tokenMap[coinAInfo.simpleName].precision}
              precisionB={tokenMap[coinBInfo.simpleName].precision}
            />
          </PopoverPure>
        </Box>
      );
    },
  },
  {
    key: "action",
    name: t("labelActions"),
    headerCellClass: "textAlignRight",
    formatter: ({ row }) => {
      return (
        <PoolStyle
          display={"flex"}
          flexDirection={"column"}
          alignItems={"flex-end"}
          justifyContent={"center"}
        >
          <Box display={"flex"} marginRight={-1}>
            <Button
              variant={"text"}
              size={"small"}
              disabled={!allowTrade?.joinAmm?.enable}
              onClick={() => {
                handleDeposit(row);
              }}
            >
              {t("labelPoolTableAddLiqudity")}
            </Button>
            <Button
              variant={"text"}
              size={"small"}
              onClick={() => {
                handleWithdraw(row);
              }}
            >
              {t("labelPoolTableRemoveLiqudity")}
            </Button>
          </Box>
        </PoolStyle>
      );
    },
  },
];
const columnModeMobile = <R extends MyPoolRow<{ [key: string]: any }>>(
  { t, handleWithdraw, handleDeposit, allowTrade }: WithTranslation & Method<R>,
  currency: Currency,
  _getPopoverState: any,
  account: Account,
  _tokenMap: { [key: string]: any },
  forexMap: ForexMap<Currency>
): Column<R, unknown>[] => [
  {
    key: "pools",
    sortable: false,
    width: "auto",
    name: t("labelPool"),
    formatter: ({ row }) => {
      return (
        <PoolStyle
          display={"flex"}
          flexDirection={"column"}
          alignContent={"flex-start"}
          justifyContent={"center"}
        >
          <IconColumn account={account} row={row.ammDetail as any} size={20} />
        </PoolStyle>
      );
    },
  },
  {
    key: "liquidity",
    sortable: true,
    headerCellClass: "textAlignRightSortable",
    name: t("labelMyLiquidity"), //+ "/" + t("labelFeeEarned")
    formatter: ({ row }) => {
      if (!row || !row.ammDetail) {
        return (
          <Box
            display={"flex"}
            justifyContent={"flex-end"}
            alignItems={"center"}
          />
        );
      }
      const {
        balanceDollar,
        balanceA,
        balanceB,
        ammDetail: { coinAInfo, coinBInfo },
      } = row as any;

      return (
        <Box
          className={"textAlignRight"}
          display={"flex"}
          flexDirection={"column"}
          height={"100%"}
          justifyContent={"center"}
        >
          <Typography component={"span"}>
            {typeof balanceDollar === "undefined"
              ? EmptyValueTag
              : PriceTag[CurrencyToTag[currency]] +
                getValuePrecisionThousand(
                  (balanceDollar || 0) * (forexMap[currency] ?? 0),
                  undefined,
                  undefined,
                  2,
                  true,
                  { isFait: true, floor: true }
                )}
          </Typography>
          <Typography
            component={"span"}
            variant={"body2"}
            color={"textSecondary"}
          >
            {getValuePrecisionThousand(balanceA, undefined, 2, 2, true, {
              isAbbreviate: true,
              abbreviate: 3,
            }) +
              " " +
              coinAInfo.simpleName +
              `  +  ` +
              getValuePrecisionThousand(balanceB, undefined, 2, 2, true, {
                isAbbreviate: true,
                abbreviate: 3,
              }) +
              " " +
              coinBInfo.simpleName}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "APR",
    sortable: true,
    name: t("labelAPR"),
    width: "auto",
    maxWidth: 80,
    headerCellClass: "textAlignRightSortable",
    formatter: ({ row }) => {
      const APR =
        typeof row?.ammDetail?.APR !== undefined && row.ammDetail.APR
          ? row.ammDetail.APR
          : EmptyValueTag;
      return (
        <Box className={"textAlignRight"}>
          <Typography component={"span"}>
            {APR === EmptyValueTag || typeof APR === "undefined"
              ? EmptyValueTag
              : getValuePrecisionThousand(APR, 2, 2, 2, true) + "%"}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "action",
    name: "",
    headerCellClass: "textAlignRight",
    formatter: ({ row }) => {
      const popoverProps: PopoverWrapProps = {
        type: PopoverType.click,
        popupId: "testPopup",
        className: "arrow-none",
        children: <MoreIcon cursor={"pointer"} />,
        popoverContent: (
          <ActionPopContent
            {...{ row, allowTrade, handleWithdraw, handleDeposit, t }}
          />
        ),
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      } as PopoverWrapProps;
      return (
        <Grid item marginTop={1}>
          <Popover {...{ ...popoverProps }} />
        </Grid>
      );
    },
  },
];

export const MyPoolTable = withTranslation("tables")(
  <R extends MyPoolRow<{ [key: string]: any }>>({
    t,
    i18n,
    tReady,
    allowTrade,
    handlePageChange,
    pagination,
    showFilter = true,
    rawData,
    account,
    title,
    handleWithdraw,
    handleDeposit,
    hideSmallBalances = false,
    setHideSmallBalances,
    wait = globalSetup.wait,
    currency = Currency.usd,
    showloading,
    tokenMap,
    forexMap,
    ...rest
  }: MyPoolTableProps<R> & WithTranslation) => {
    const { isMobile } = useSettings();
    const [filter, setFilter] = React.useState({
      searchValue: "",
    });
    const [totalData, setTotalData] = React.useState<R[]>(rawData);
    const [viewData, setViewData] = React.useState<R[]>(rawData);
    const [tableHeight, setTableHeight] = React.useState(rest.tableHeight);
    const resetTableData = React.useCallback(
      (viewData) => {
        setViewData(viewData);
        setTableHeight(
          RowConfig.rowHeaderHeight + viewData.length * RowConfig.rowHeight
        );
      },
      [setViewData, setTableHeight]
    );
    const updateData = React.useCallback(() => {
      let resultData: R[] = totalData && !!totalData.length ? totalData : [];
      // if (filter.hideSmallBalance) {
      if (hideSmallBalances) {
        resultData = resultData.filter((o) => !o.smallBalance);
      }
      if (filter.searchValue) {
        resultData = resultData.filter(
          (o) =>
            o.ammDetail.coinAInfo.name
              .toLowerCase()
              .includes(filter.searchValue.toLowerCase()) ||
            o.ammDetail.coinBInfo.name
              .toLowerCase()
              .includes(filter.searchValue.toLowerCase())
        );
      }
      resetTableData(resultData);
    }, [totalData, filter, hideSmallBalances, resetTableData]);

    React.useEffect(() => {
      setTotalData(rawData);
    }, [rawData]);
    React.useEffect(() => {
      updateData();
    }, [totalData, filter, hideSmallBalances]);
    const handleFilterChange = React.useCallback(
      (filter) => {
        setFilter(filter);
      },
      [setFilter]
    );
    const getPopoverState = React.useCallback((label: string) => {
      return usePopupState({
        variant: "popover",
        popupId: `popup-poolsTable-${label}`,
      });
    }, []);

    return (
      <TableStyled isMobile={isMobile}>
        {
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

          <TableFilterStyled
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexDirection={isMobile ? "column" : "row"}
          >
            <>{title}</>
            {showFilter && (
              <Filter
                {...{
                  handleFilterChange,
                  filter,
                  hideSmallBalances,
                  setHideSmallBalances,
                }}
              />
            )}
          </TableFilterStyled>
        }

        <Table
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={44}
          style={{ height: tableHeight }}
          rawData={viewData}
          showloading={showloading}
          columnMode={
            isMobile
              ? (columnModeMobile(
                  {
                    t,
                    i18n,
                    tReady,
                    handleWithdraw,
                    handleDeposit,
                    allowTrade,
                  },
                  currency,
                  getPopoverState,
                  account,
                  tokenMap,
                  forexMap
                  // coinJson
                ) as any)
              : (columnMode(
                  {
                    t,
                    i18n,
                    tReady,
                    handleWithdraw,
                    handleDeposit,
                    allowTrade,
                  },
                  currency,
                  getPopoverState,
                  account,
                  tokenMap,
                  forexMap
                ) as any)
          }
          sortDefaultKey={"liquidity"}
          generateRows={(rawData) => rawData}
          generateColumns={({ columnsRaw }) => columnsRaw as Column<any, any>[]}
          sortMethod={(sortedRows: MyPoolRow<any>[], sortColumn: string) => {
            switch (sortColumn) {
              case "liquidity":
                sortedRows = sortedRows.sort((a, b) => {
                  const valueA = a.balanceDollar;
                  const valueB = b.balanceDollar;

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
              case "APR":
                sortedRows = sortedRows.sort((a, b) => {
                  const valueA = a.ammDetail.APR || 0;
                  const valueB = b.ammDetail.APR || 0;
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
          }}
          {...{
            t,
            i18n,
            tReady,
          }}
        />
      </TableStyled>
    );
  }
);
