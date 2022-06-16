import React from "react";
import {
  Avatar,
  Box,
  BoxProps,
  Grid,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
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
  AvatarCoinStyled,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  MoreIcon,
  PriceTag,
  RowConfig,
  SoursURL,
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
        : `--template-columns: 30% auto 8% !important;`}
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

const ActionPopContent = React.memo(
  ({ row, allowTrade, handleWithdraw, handleDeposit, t }: any) => {
    return (
      <Box borderRadius={"inherit"} minWidth={110}>
        {allowTrade?.joinAmm?.enable && (
          <MenuItem onClick={() => handleDeposit(row)}>
            <ListItemText>{t("labelPoolTableAddLiqudity")}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleWithdraw(row)}>
          <ListItemText>{t("labelPoolTableRemoveLiqudity")}</ListItemText>
        </MenuItem>
      </Box>
    );
  }
);

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
  coinJson: any
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
    name: t("labelLiquidity"),
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
        totalAmmValueDollar,
        totalAmmValueYuan,
        balanceA,
        balanceB,
        ammDetail: { coinAInfo, coinBInfo },
      } = row as any;
      const coinAIcon: any = coinJson[coinAInfo.simpleName];
      const coinBIcon: any = coinJson[coinBInfo.simpleName];
      // const formattedYuan = (balanceYuan && Number.isNaN(balanceYuan)) ? balanceYuan : 0
      // const formattedDollar = (balanceDollar && Number.isNaN(balanceYuan)) ? balanceDollar : 0
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
              {typeof totalAmmValueDollar === "undefined"
                ? EmptyValueTag
                : currency === Currency.usd
                ? PriceTag.Dollar +
                  getValuePrecisionThousand(
                    totalAmmValueDollar,
                    undefined,
                    undefined,
                    undefined,
                    true,
                    {
                      isFait: true,
                      floor: true,
                    }
                  )
                : PriceTag.Yuan +
                  getValuePrecisionThousand(
                    totalAmmValueYuan,
                    undefined,
                    undefined,
                    undefined,
                    true,
                    {
                      isFait: true,
                      floor: true,
                    }
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
            <Box padding={1.5} paddingLeft={1}>
              <Typography
                component={"span"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                style={{ textTransform: "capitalize" }}
                color={"textPrimary"}
              >
                <Box
                  component={"span"}
                  className={"logo-icon"}
                  display={"flex"}
                  height={"var(--list-menu-coin-size)"}
                  width={"var(--list-menu-coin-size)"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  {coinAIcon ? (
                    <AvatarCoinStyled
                      imgx={coinAIcon.x}
                      imgy={coinAIcon.y}
                      imgheight={coinAIcon.h}
                      imgwidth={coinAIcon.w}
                      size={20}
                      variant="circular"
                      style={{ marginTop: 2 }}
                      alt={coinAInfo.simpleName as string}
                      src={
                        "data:image/svg+xml;utf8," +
                        '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                      }
                    />
                  ) : (
                    <Avatar
                      variant="circular"
                      alt={coinAInfo.simpleName as string}
                      style={{
                        height: "var(--list-menu-coin-size))",
                        width: "var(--list-menu-coin-size)",
                      }}
                      src={SoursURL + "images/icon-default.png"}
                    />
                  )}
                  <Typography
                    component={"span"}
                    color={"var(--color-text-primary)"}
                    variant={"body2"}
                    marginLeft={1 / 2}
                    height={20}
                    lineHeight={"20px"}
                  >
                    {coinAInfo.simpleName}
                  </Typography>
                </Box>

                <Typography
                  component={"span"}
                  color={"var(--color-text-primary)"}
                  variant={"body2"}
                  height={20}
                  marginLeft={10}
                  lineHeight={"20px"}
                >
                  {getValuePrecisionThousand(balanceA, 4, 4)}
                </Typography>
              </Typography>
              <Typography
                component={"span"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                marginTop={1 / 2}
                style={{ textTransform: "capitalize" }}
              >
                <Box
                  component={"span"}
                  className={"logo-icon"}
                  display={"flex"}
                  height={"var(--list-menu-coin-size)"}
                  width={"var(--list-menu-coin-size)"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  {coinBIcon ? (
                    <AvatarCoinStyled
                      style={{ marginTop: 2 }}
                      imgx={coinBIcon.x}
                      imgy={coinBIcon.y}
                      imgheight={coinBIcon.h}
                      imgwidth={coinBIcon.w}
                      size={20}
                      variant="circular"
                      alt={coinBInfo.simpleName as string}
                      src={
                        "data:image/svg+xml;utf8," +
                        '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                      }
                    />
                  ) : (
                    <Avatar
                      variant="circular"
                      alt={coinBInfo.simpleName as string}
                      style={{
                        height: "var(--list-menu-coin-size)",
                        width: "var(--list-menu-coin-size)",
                      }}
                      src={SoursURL + "images/icon-default.png"}
                    />
                  )}
                  <Typography
                    variant={"body2"}
                    color={"var(--color-text-primary)"}
                    component={"span"}
                    marginRight={5}
                    marginLeft={1 / 2}
                    alignSelf={"right"}
                    height={20}
                    lineHeight={"20px"}
                  >
                    {coinBInfo.simpleName}
                  </Typography>
                </Box>

                <Typography
                  variant={"body2"}
                  color={"var(--color-text-primary)"}
                  component={"span"}
                  height={20}
                  marginLeft={10}
                  lineHeight={"20px"}
                >
                  {getValuePrecisionThousand(balanceB, 4, 4)}
                </Typography>
              </Typography>
            </Box>
          </PopoverPure>
        </Box>
      );
    },
  },
  // {
  //   key: "feesEarned",
  //   sortable: false,
  //   width: "auto",
  //   name: t("labelFeeEarned"),
  //   headerCellClass: "textAlignRight",
  //   formatter: ({ row }: FormatterProps<Row<any>, unknown>) => {
  //     if (!row.ammDetail || !row.ammDetail.coinAInfo) {
  //       return (
  //         <Box
  //           display={"flex"}
  //           justifyContent={"flex-end"}
  //           alignItems={"center"}
  //         />
  //       );
  //     }
  //     const {
  //       ammDetail: { coinAInfo, coinBInfo },
  //       feeA,
  //       feeB,
  //       precisionA,
  //       precisionB,
  //     } = row as any;
  //     return (
  //       <Box
  //         width={"100%"}
  //         height={"100%"}
  //         display={"flex"}
  //         justifyContent={"flex-end"}
  //         alignItems={"center"}
  //       >
  //         {/* <TypogStyle variant={'body1'} component={'span'} color={'textPrimary'}>
  //                   {feeDollar === undefined ? EmptyValueTag : currency === Currency.usd ? 'US' + PriceTag.Dollar + getThousandFormattedNumbers(feeDollar)
  //                       : 'CNY' + PriceTag.Yuan + getThousandFormattedNumbers(feeYuan as number)}
  //               </TypogStyle> */}
  //         <Typography variant={"body2"} component={"p"} color={"textPrimary"}>
  //           <Typography component={"span"}>
  //             {getValuePrecisionThousand(
  //               feeA,
  //               undefined,
  //               undefined,
  //               precisionA,
  //               false,
  //               { floor: true }
  //             )}
  //           </Typography>
  //           <Typography component={"span"}>{` ${
  //             coinAInfo?.simpleName as string
  //           }`}</Typography>
  //         </Typography>
  //         <Typography
  //           variant={"body2"}
  //           component={"p"}
  //           color={"textPrimary"}
  //           marginX={1 / 2}
  //         >
  //           +
  //         </Typography>
  //         <Typography
  //           variant={"body2"}
  //           component={"span"}
  //           color={"textPrimary"}
  //         >
  //           <Typography component={"span"}>
  //             {getValuePrecisionThousand(
  //               feeB,
  //               undefined,
  //               undefined,
  //               precisionB,
  //               false,
  //               { floor: true }
  //             )}
  //           </Typography>
  //           <Typography component={"span"}>{` ${
  //             coinBInfo?.simpleName as string
  //           }`}</Typography>
  //         </Typography>
  //       </Box>
  //     );
  //   },
  // },
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
  getPopoverState: any,
  _account: Account,
  coinJson: any
): Column<R, unknown>[] => [
  {
    key: "pools",
    sortable: false,
    width: "auto",
    name: t("labelPool"),
    formatter: ({ row }) => {
      // const {
      //   ammDetail: { coinAInfo, coinBInfo },
      // } = row;
      let coinAInfo, coinBInfo;
      if (row.ammDetail) {
        coinAInfo = row.ammDetail.coinAInfo;
        coinBInfo = row.ammDetail.coinBInfo;
      }
      return (
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignContent={"flex-start"}
          justifyContent={"center"}
          height={"100%"}
        >
          {/*<IconColumn row={row.ammDetail as any} />*/}
          <Typography variant={"body1"}>
            {coinAInfo?.simpleName + "/" + coinBInfo?.simpleName}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "liquidity",
    sortable: true,
    headerCellClass: "textAlignRightSortable",
    name: t("labelLiquidity") + "/" + t("labelFeeEarned"),
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
        totalAmmValueDollar,
        totalAmmValueYuan,
        balanceA,
        balanceB,
        ammDetail: { coinAInfo, coinBInfo },
        // feeA,
        // feeB,
        // precisionA,
        // precisionB,
      } = row as any;
      const coinAIcon: any = coinJson[coinAInfo.simpleName];
      const coinBIcon: any = coinJson[coinBInfo.simpleName];
      return (
        <Box
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"flex-end"}
          flexDirection={"column"}
          {...bindHover(popState)}
        >
          <Typography component={"span"} style={{ cursor: "pointer" }}>
            {typeof totalAmmValueDollar === "undefined"
              ? EmptyValueTag
              : currency === Currency.usd
              ? PriceTag.Dollar +
                getValuePrecisionThousand(
                  totalAmmValueDollar,
                  undefined,
                  undefined,
                  undefined,
                  true,
                  {
                    isFait: true,
                    floor: true,
                  }
                )
              : PriceTag.Yuan +
                getValuePrecisionThousand(
                  totalAmmValueYuan,
                  undefined,
                  undefined,
                  undefined,
                  true,
                  {
                    isFait: true,
                    floor: true,
                  }
                )}
          </Typography>
          {/*<Box*/}
          {/*  width={"100%"}*/}
          {/*  display={"flex"}*/}
          {/*  justifyContent={"flex-end"}*/}
          {/*  alignItems={"center"}*/}
          {/*>*/}
          {/*  <Typography*/}
          {/*    variant={"body2"}*/}
          {/*    component={"span"}*/}
          {/*    color={"textSecondary"}*/}
          {/*  >*/}
          {/*    {`Fee: ${getValuePrecisionThousand(*/}
          {/*      feeA,*/}
          {/*      undefined,*/}
          {/*      undefined,*/}
          {/*      precisionA,*/}
          {/*      false,*/}
          {/*      { floor: true }*/}
          {/*    )} ${coinAInfo?.simpleName as string} */}
          {/*    + ${getValuePrecisionThousand(*/}
          {/*      feeB,*/}
          {/*      undefined,*/}
          {/*      undefined,*/}
          {/*      precisionB,*/}
          {/*      false,*/}
          {/*      { floor: true }*/}
          {/*    )} ${coinBInfo?.simpleName as string}`}*/}
          {/*  </Typography>*/}
          {/*</Box>*/}

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
            <Box padding={1.5} paddingLeft={1}>
              <Typography
                component={"span"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                style={{ textTransform: "capitalize" }}
                color={"textPrimary"}
              >
                <Box
                  component={"span"}
                  className={"logo-icon"}
                  display={"flex"}
                  height={"var(--list-menu-coin-size)"}
                  width={"var(--list-menu-coin-size)"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  {coinAIcon ? (
                    <AvatarCoinStyled
                      imgx={coinAIcon.x}
                      imgy={coinAIcon.y}
                      imgheight={coinAIcon.h}
                      imgwidth={coinAIcon.w}
                      size={20}
                      variant="circular"
                      style={{ marginTop: 2 }}
                      alt={coinAInfo.simpleName as string}
                      src={
                        "data:image/svg+xml;utf8," +
                        '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                      }
                    />
                  ) : (
                    <Avatar
                      variant="circular"
                      alt={coinAInfo.simpleName as string}
                      style={{
                        height: "var(--list-menu-coin-size))",
                        width: "var(--list-menu-coin-size)",
                      }}
                      src={SoursURL + "images/icon-default.png"}
                    />
                  )}
                  <Typography
                    component={"span"}
                    color={"var(--color-text-primary)"}
                    variant={"body2"}
                    marginLeft={1 / 2}
                    height={20}
                    lineHeight={"20px"}
                  >
                    {coinAInfo.simpleName}
                  </Typography>
                </Box>

                <Typography
                  component={"span"}
                  color={"var(--color-text-primary)"}
                  variant={"body2"}
                  height={20}
                  marginLeft={10}
                  lineHeight={"20px"}
                >
                  {getValuePrecisionThousand(balanceA, 4, 4)}
                </Typography>
              </Typography>
              <Typography
                component={"span"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                marginTop={1 / 2}
                style={{ textTransform: "capitalize" }}
              >
                <Box
                  component={"span"}
                  className={"logo-icon"}
                  display={"flex"}
                  height={"var(--list-menu-coin-size)"}
                  width={"var(--list-menu-coin-size)"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                >
                  {coinBIcon ? (
                    <AvatarCoinStyled
                      style={{ marginTop: 2 }}
                      imgx={coinBIcon.x}
                      imgy={coinBIcon.y}
                      imgheight={coinBIcon.h}
                      imgwidth={coinBIcon.w}
                      size={20}
                      variant="circular"
                      alt={coinBInfo.simpleName as string}
                      src={
                        "data:image/svg+xml;utf8," +
                        '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                      }
                    />
                  ) : (
                    <Avatar
                      variant="circular"
                      alt={coinBInfo.simpleName as string}
                      style={{
                        height: "var(--list-menu-coin-size)",
                        width: "var(--list-menu-coin-size)",
                      }}
                      src={SoursURL + "images/icon-default.png"}
                    />
                  )}
                  <Typography
                    variant={"body2"}
                    color={"var(--color-text-primary)"}
                    component={"span"}
                    marginRight={5}
                    marginLeft={1 / 2}
                    alignSelf={"right"}
                    height={20}
                    lineHeight={"20px"}
                  >
                    {coinBInfo.simpleName}
                  </Typography>
                </Box>

                <Typography
                  variant={"body2"}
                  color={"var(--color-text-primary)"}
                  component={"span"}
                  height={20}
                  marginLeft={10}
                  lineHeight={"20px"}
                >
                  {getValuePrecisionThousand(balanceB, 4, 4)}
                </Typography>
              </Typography>
            </Box>
          </PopoverPure>
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
    ...rest
  }: MyPoolTableProps<R> & WithTranslation) => {
    const { coinJson, isMobile } = useSettings();
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
                  coinJson
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
                  coinJson
                ) as any)
          }
          sortDefaultKey={"liquidity"}
          generateRows={(rawData) => rawData}
          generateColumns={({ columnsRaw }) =>
            columnsRaw as Column<MyPoolTableProps<R>, unknown>[]
          }
          sortMethod={(
            sortedRows: MyPoolTableProps<R>[],
            sortColumn: string
          ) => {
            switch (sortColumn) {
              case "liquidity":
                sortedRows = sortedRows.sort((a, b) => {
                  const valueA = a["liquidity"];
                  const valueB = b["liquidity"];
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
