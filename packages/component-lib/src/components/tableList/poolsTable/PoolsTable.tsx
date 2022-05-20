import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { bindHover } from "material-ui-popup-state/es";
import {
  Button,
  Column,
  NewTagIcon,
  PopoverPure,
  Table,
  TableProps,
} from "../../basic-lib";
import {
  Account,
  AmmDetail,
  AmmRankIcon,
  AvatarCoinStyled,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  PriceTag,
  SoursURL,
} from "@loopring-web/common-resources";
import { Avatar, Box, BoxProps, Typography } from "@mui/material";
import { PoolTableProps, Row } from "./Interface";
import styled from "@emotion/styled";
import { useHistory } from "react-router-dom";
import { FormatterProps } from "react-data-grid";
import {
  AmmPoolInProgressActivityRule,
  Currency,
  LoopringMap,
} from "@loopring-web/loopring-sdk";
import { useSettings } from "../../../stores";
import { TablePaddingX } from "../../styled";
const BoxStyled = styled(Box)`` as typeof Box;
const TableStyled = styled(Box)<{ isMobile?: boolean } & BoxProps>`
  .rdg {
    border-radius: ${({ theme }) => theme.unit}px;

    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 240px auto auto auto 200px !important;`
        : ` --template-columns: 16% 62% 22% !important;
`}
    .rdg-cell.action {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element;

export const IconColumn = React.memo(
  <R extends AmmDetail<T>, T>({
    row,
    account,
    activityInProgressRules,
  }: {
    row: R;
    account: Account;
    activityInProgressRules?: LoopringMap<AmmPoolInProgressActivityRule>;
  }) => {
    const history = useHistory();
    const { coinJson, isMobile } = useSettings();
    if (!row || !row.coinAInfo || !row.coinBInfo) {
      return <BoxStyled />;
    }
    const { coinAInfo, coinBInfo, isNew } = row;
    const coinAIcon: any = coinJson[coinAInfo?.simpleName];
    const coinBIcon: any = coinJson[coinBInfo?.simpleName];
    const pair = coinAInfo?.simpleName + "-" + coinBInfo?.simpleName;
    return (
      <BoxStyled
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box display={"flex"} alignContent={"center"} height={"initial"}>
          <Box
            className={"logo-icon"}
            display={"flex"}
            height={"var(--list-menu-coin-size)"}
            position={"relative"}
            zIndex={20}
            width={"var(--list-menu-coin-size)"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {coinAIcon ? (
              <AvatarCoinStyled
                imgx={coinAIcon.x}
                imgy={coinAIcon.y}
                imgheight={coinAIcon.h}
                imgwidth={coinAIcon.w}
                size={24}
                variant="circular"
                alt={coinAInfo?.simpleName as string}
                // src={sellData?.icon}
                src={
                  "data:image/svg+xml;utf8," +
                  '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                }
              />
            ) : (
              <Avatar
                variant="circular"
                alt={coinAInfo?.simpleName as string}
                style={{
                  height: "var(--list-menu-coin-size)",
                  width: "var(--list-menu-coin-size)",
                }}
                // src={sellData?.icon}
                src={SoursURL + "images/icon-default.png"}
              />
            )}
          </Box>
          <Box
            className={"logo-icon"}
            display={"flex"}
            height={"var(--list-menu-coin-size)"}
            position={"relative"}
            zIndex={18}
            left={-8}
            width={"var(--list-menu-coin-size)"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {coinBIcon ? (
              <AvatarCoinStyled
                imgx={coinBIcon.x}
                imgy={coinBIcon.y}
                imgheight={coinBIcon.h}
                imgwidth={coinBIcon.w}
                size={24}
                variant="circular"
                alt={coinBInfo?.simpleName as string}
                // src={sellData?.icon}
                src={
                  "data:image/svg+xml;utf8," +
                  '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                }
              />
            ) : (
              <Avatar
                variant="circular"
                alt={coinBInfo?.simpleName as string}
                style={{
                  height: "var(--list-menu-coin-size)",
                  width: "var(--list-menu-coin-size)",
                }}
                // src={sellData?.icon}
                src={SoursURL + "images/icon-default.png"}
              />
            )}
          </Box>
        </Box>

        {!isMobile && (
          <Typography
            variant={isMobile ? "body2" : "inherit"}
            display={"flex"}
            flexDirection={"column"}
            marginLeft={isMobile ? 0 : 1}
            component={"div"}
            paddingRight={isMobile ? 0 : 1}
            textOverflow={"ellipsis"}
          >
            <Typography
              variant="inherit"
              component={"span"}
              color={"textPrimary"}
              title={"sell"}
            >
              <Typography
                variant="inherit"
                component={"span"}
                className={"next-coin"}
              >
                {coinAInfo?.simpleName}
              </Typography>
              <Typography variant="inherit" component={"i"}>
                /
              </Typography>
              <Typography variant="inherit" component={"span"} title={"buy"}>
                {coinBInfo?.simpleName}
              </Typography>
            </Typography>
          </Typography>
        )}
        <>
          {activityInProgressRules && activityInProgressRules[`AMM-${pair}`] && (
            <Box
              style={{ cursor: "pointer", paddingTop: 4 }}
              onClick={(event) => {
                event.stopPropagation();
                const date = new Date(
                  activityInProgressRules[`AMM-${pair}`].rangeFrom
                );
                const year = date.getFullYear();
                const month = ("0" + (date.getMonth() + 1).toString()).slice(
                  -2
                );
                const day = ("0" + date.getDate().toString()).slice(-2);
                const current_event_date = `${year}-${month}-${day}`;

                history.push(
                  `/race-event/${current_event_date}?pair=${pair}&type=${
                    activityInProgressRules[`AMM-${pair}`].ruleType[0]
                  }&owner=${account?.accAddress}`
                );
              }}
            >
              <AmmRankIcon fontSize={"medium"} />
            </Box>
          )}
          {isNew && <NewTagIcon />}
        </>
      </BoxStyled>
    );
  }
) as unknown as <R extends AmmDetail<T>, T>(props: {
  row: R;
  account: Account;
  activityInProgressRules?: LoopringMap<AmmPoolInProgressActivityRule>;
}) => JSX.Element;

export const PoolsTable = withTranslation(["tables", "common"])(
  <T extends { [key: string]: any }>({
    t,
    i18n,
    tReady,
    activityInProgressRules,
    showFilter = true,
    rawData,
    sortMethod,
    wait = globalSetup.wait,
    tableHeight = 350,
    coinJson,
    account,
    forex,
    tokenPrices,
    showLoading,
    ...rest
  }: WithTranslation & PoolTableProps<T>) => {
    const { currency, isMobile } = useSettings();
    const history = useHistory();

    const getPopoverState = React.useCallback((label: string) => {
      return usePopupState({
        variant: "popover",
        popupId: `popup-poolsTable-${label}`,
      });
    }, []);
    const columnMode = <R extends Row<T>, T>(): Column<R, unknown>[] => [
      {
        key: "pools",
        sortable: true,
        width: "auto",
        minWidth: 240,
        name: t("labelPool"),
        formatter: ({ row }: FormatterProps<R>) => {
          return (
            <Box
              flex={1}
              height={"100%"}
              alignContent={"center"}
              display={"flex"}
            >
              <IconColumn
                row={row as any}
                account={account}
                activityInProgressRules={activityInProgressRules}
              />
            </Box>
          );
        },
      },
      {
        key: "liquidity",
        sortable: true,
        width: "auto",
        headerCellClass: "textAlignRight",
        name: t("labelLiquidity"),
        formatter: ({ row, rowIdx }) => {
          const { coinA, coinB, totalA, totalB, amountDollar, amountYuan } =
            row as any;
          const popoverState = getPopoverState(rowIdx.toString());

          const coinAIcon: any = coinJson[coinA];
          const coinBIcon: any = coinJson[coinB];

          const liquidityLpToken =
            currency === Currency.usd ? amountDollar : amountYuan;
          return (
            <>
              <Box className={"textAlignRight"}>
                <Typography
                  {...bindHover(popoverState)}
                  paddingTop={1}
                  component={"span"}
                  style={{ cursor: "pointer" }}
                >
                  {typeof liquidityLpToken === "undefined"
                    ? EmptyValueTag
                    : (currency === Currency.usd
                        ? PriceTag.Dollar
                        : PriceTag.Yuan) +
                      getValuePrecisionThousand(
                        liquidityLpToken,
                        undefined,
                        undefined,
                        undefined,
                        true,
                        { isFait: true }
                      )}
                </Typography>
              </Box>
              <PopoverPure
                className={"arrow-top-center"}
                {...bindPopper(popoverState)}
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
                          alt={coinA as string}
                          src={
                            "data:image/svg+xml;utf8," +
                            '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                          }
                        />
                      ) : (
                        <Avatar
                          variant="circular"
                          alt={coinA as string}
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
                        {coinA}
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
                      {getValuePrecisionThousand(totalA, undefined, 2)}
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
                          alt={coinB as string}
                          src={
                            "data:image/svg+xml;utf8," +
                            '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                          }
                        />
                      ) : (
                        <Avatar
                          variant="circular"
                          alt={coinB as string}
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
                        {coinB}
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
                      {getValuePrecisionThousand(totalB, undefined, 2)}
                    </Typography>
                  </Typography>
                </Box>
              </PopoverPure>
            </>
          );
        },
      },
      {
        key: "volume24",
        sortable: true,
        width: "auto",
        minWidth: 156,
        headerCellClass: "textAlignRight",
        name: t("label24TradeVolume"),
        formatter: ({ row }) => {
          const { volume } =
            row.tradeFloat && row.tradeFloat.volume
              ? row.tradeFloat
              : { volume: EmptyValueTag };
          const totalAmountDollar =
            (Number(volume) || 0) *
            (tokenPrices[row.coinAInfo?.simpleName] || 0);
          const totalAmountYuan =
            (Number(volume) || 0) *
            (tokenPrices[row.coinAInfo?.simpleName] || 0) *
            (forex || 6.5);
          const renderValue =
            currency === Currency.usd ? totalAmountDollar : totalAmountYuan;
          const renderUnit =
            currency === Currency.usd ? PriceTag.Dollar : PriceTag.Yuan;
          return (
            <Box className={"textAlignRight"}>
              <Typography component={"span"}>
                {volume && Number.isFinite(volume)
                  ? renderUnit +
                    getValuePrecisionThousand(
                      renderValue,
                      undefined,
                      undefined,
                      undefined,
                      true,
                      { isFait: true }
                    )
                  : EmptyValueTag}
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
        maxWidth: 68,
        headerCellClass: "textAlignRight",
        formatter: ({ row }) => {
          const APR =
            typeof row.APR !== undefined && row.APR ? row?.APR : EmptyValueTag;
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
        name: t("labelAction"),
        // maxWidth: 120,
        width: "auto",
        headerCellClass: `textAlignRight`,
        cellClass: () => `action`,
        formatter: () => {
          return (
            <Box className={"action"}>
              <Button
                // href={`liquidity/pools/coinPair/${
                //   row?.coinAInfo?.simpleName + "-" + row?.coinBInfo?.simpleName
                // }`}
                className={"btn"}
                variant={"outlined"}
                size={"small"}
              >
                {t("labelTradePool")}
              </Button>
            </Box>
          );
        },
      },
    ];
    const columnModeMobile = <R extends Row<T>, T>(): Column<R, unknown>[] => [
      {
        key: "pools",
        sortable: true,
        width: "auto",
        name: t("labelPool"),
        formatter: ({ row }: FormatterProps<R>) => {
          return (
            <Box
              flex={1}
              height={"100%"}
              alignContent={"center"}
              display={"flex"}
            >
              <IconColumn
                account={account}
                row={row as any}
                activityInProgressRules={activityInProgressRules}
              />
            </Box>
          );
        },
      },
      {
        key: "liquidity",
        sortable: true,
        headerCellClass: "textAlignRight",
        name: t("labelLiquidity"),
        formatter: ({ row }) => {
          const { coinA, coinB, totalA, totalB, amountDollar, amountYuan } =
            row as any;
          const liquidityLpToken =
            currency === Currency.usd ? amountDollar : amountYuan;
          return (
            <Box
              className={"textAlignRight"}
              display={"flex"}
              flexDirection={"column"}
            >
              <Typography component={"span"}>
                {typeof liquidityLpToken === "undefined"
                  ? EmptyValueTag
                  : (currency === Currency.usd
                      ? PriceTag.Dollar
                      : PriceTag.Yuan) +
                    getValuePrecisionThousand(
                      liquidityLpToken,
                      undefined,
                      undefined,
                      undefined,
                      true,
                      { isFait: true }
                    )}
              </Typography>
              <Typography
                component={"span"}
                variant={"body2"}
                color={"textSecondary"}
              >
                {getValuePrecisionThousand(totalA, undefined, 2, 2, true, {
                  isAbbreviate: true,
                  abbreviate: 3,
                }) +
                  " " +
                  coinA +
                  `  +  ` +
                  getValuePrecisionThousand(totalB, undefined, 2, 2, true, {
                    isAbbreviate: true,
                    abbreviate: 3,
                  }) +
                  " " +
                  coinB}
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "volume24",
        sortable: true,
        width: "auto",
        headerCellClass: "textAlignRight",
        name: t("label24VolumeSimple", { ns: "common" }) + "/" + t("labelAPR"),
        formatter: ({ row }) => {
          const { volume } =
            row.tradeFloat && row.tradeFloat.volume
              ? row.tradeFloat
              : { volume: EmptyValueTag };
          const totalAmountDollar =
            (Number(volume) || 0) *
            (tokenPrices[row.coinAInfo?.simpleName] || 0);
          const totalAmountYuan =
            (Number(volume) || 0) *
            (tokenPrices[row.coinAInfo?.simpleName] || 0) *
            (forex || 6.5);
          const renderValue =
            currency === Currency.usd ? totalAmountDollar : totalAmountYuan;
          const renderUnit =
            currency === Currency.usd ? PriceTag.Dollar : PriceTag.Yuan;
          const APR =
            typeof row.APR !== undefined && row.APR ? row?.APR : EmptyValueTag;

          return (
            <Box
              className={"textAlignRight"}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"center"}
              height={"100%"}
            >
              <Typography
                component={"span"}
                variant={"body2"}
                color={"textPrimary"}
              >
                {volume && Number.isFinite(volume)
                  ? renderUnit +
                    getValuePrecisionThousand(
                      renderValue,
                      undefined,
                      undefined,
                      2,
                      true,
                      { isFait: true, abbreviate: 3, isAbbreviate: true }
                    )
                  : EmptyValueTag}
              </Typography>
              <Typography
                component={"span"}
                variant={"body2"}
                color={"textSecondary"}
              >
                APR:
                {APR === EmptyValueTag || typeof APR === "undefined"
                  ? EmptyValueTag
                  : getValuePrecisionThousand(APR, 2, 2, 2, true) + "%"}
              </Typography>
            </Box>
          );
        },
      },
    ];
    const defaultArgs: TableProps<any, any> = {
      rawData,
      columnMode: isMobile ? columnModeMobile() : columnMode(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }) =>
        columnsRaw as Column<Row<any>, unknown>[],
    };
    const onRowClick = React.useCallback(
      (_rowIdx: any, row: any) => {
        const pathname = `/liquidity/pools/coinPair/${
          row?.coinAInfo?.simpleName + "-" + row?.coinBInfo?.simpleName
        }`;

        history &&
          history.push({
            pathname,
          });
      },
      [history]
    );

    return (
      <TableStyled
        flex={1}
        flexDirection={"column"}
        display={"flex"}
        isMobile={isMobile}
      >
        <Table
          style={{ height: tableHeight }}
          {...{
            ...defaultArgs,
            t,
            i18n,
            tReady,
            ...rest,
            rawData: rawData,
            onRowClick: (index, row) => {
              onRowClick(index, row);
            },
            showloading: showLoading,
            sortMethod: (sortedRows: any[], sortColumn: string) =>
              sortMethod(sortedRows, sortColumn),
            sortDefaultKey: "liquidity",
          }}
        />
      </TableStyled>
    );
  }
);
