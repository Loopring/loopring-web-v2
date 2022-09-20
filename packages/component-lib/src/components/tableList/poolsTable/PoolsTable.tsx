import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { bindHover } from "material-ui-popup-state/es";
import {
  Button,
  Column,
  NewTagIcon,
  Popover,
  PopoverPure,
  PopoverType,
  PopoverWrapProps,
  Table,
  TableProps,
} from "../../basic-lib";
import {
  AmmDetail,
  AvatarCoinStyled,
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  MoreIcon,
  PriceTag,
  RowConfig,
  SoursURL,
} from "@loopring-web/common-resources";
import { Avatar, Box, BoxProps, Grid, Typography } from "@mui/material";
import { IconColumnProps, PoolTableProps, Row } from "./Interface";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";

import { useSettings } from "../../../stores";
import { TablePaddingX } from "../../styled";
import { AmmPairDetail, TagIconList } from "../../block";
import { ActionPopContent } from "../myPoolTable/components/ActionPop";
const BoxStyled = styled(Box)`` as typeof Box;
const TableStyled = styled(Box)<{ isMobile?: boolean } & BoxProps>`
  .rdg {
    border-radius: ${({ theme }) => theme.unit}px;

    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 240px auto auto auto 200px !important;`
        : ` --template-columns: 16% 60% auto 8% !important;
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
    size = 24,
    campaignTagConfig,
  }: IconColumnProps<R>) => {
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
        justifyContent={"flex-start"}
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
                size={size}
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
                size={size}
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
        {campaignTagConfig && (
          <TagIconList
            scenario={"AMM"}
            campaignTagConfig={campaignTagConfig}
            symbol={pair}
          />
        )}
        {isNew && <NewTagIcon />}
      </BoxStyled>
    );
  }
) as unknown as <R extends AmmDetail<T>, T>(
  props: IconColumnProps<R>
) => JSX.Element;

export const PoolsTable = withTranslation(["tables", "common"])(
  <T extends { [key: string]: any }>({
    t,
    i18n,
    tReady,
    campaignTagConfig,
    showFilter = true,
    rawData,
    sortMethod,
    wait = globalSetup.wait,
    tableHeight = 350,
    coinJson,
    account,
    tokenPrices,
    showLoading,
    handleWithdraw,
    handleDeposit,
    tokenMap,
    forexMap,
    allowTrade,
    rowConfig = RowConfig,
    ...rest
  }: WithTranslation & PoolTableProps<T>) => {
    const { currency, isMobile } = useSettings();

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
                campaignTagConfig={campaignTagConfig}
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
          const { coinA, coinB, totalA, totalB, amountDollar } = row as any;
          const popoverState = getPopoverState(rowIdx.toString());

          return (
            <>
              <Box className={"textAlignRight"}>
                <Typography
                  {...bindHover(popoverState)}
                  paddingTop={1}
                  component={"span"}
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline dotted",
                  }}
                >
                  {typeof amountDollar === "undefined"
                    ? EmptyValueTag
                    : PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        amountDollar * (forexMap[currency] ?? 0),
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
                {coinA && coinB && (
                  <AmmPairDetail
                    coinA={coinA}
                    coinB={coinB}
                    balanceA={totalA}
                    balanceB={totalB}
                    precisionA={tokenMap[coinA]?.precision}
                    precisionB={tokenMap[coinB]?.precision}
                  />
                )}
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
          return (
            <Box className={"textAlignRight"}>
              <Typography component={"span"}>
                {volume && Number.isFinite(volume)
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      totalAmountDollar * (forexMap[currency] ?? 0),
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
        formatter: ({ row }) => {
          return (
            <Box className={"action"} marginRight={-1}>
              <Button
                // href={`liquidity/pools/coinPair/${
                //   row?.coinAInfo?.simpleName + "-" + row?.coinBInfo?.simpleName
                // }`}
                disabled={!allowTrade?.joinAmm?.enable}
                className={"btn"}
                variant={"text"}
                size={"small"}
                onClick={() => {
                  handleDeposit(row as any);
                  // handleWithdraw(row);
                }}
              >
                {t("labelTradePool")}
              </Button>
              <Button
                variant={"text"}
                size={"small"}
                onClick={() => {
                  handleWithdraw(row as any);
                }}
              >
                {t("labelPoolTableRemoveLiqudity")}
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
                size={20}
                campaignTagConfig={campaignTagConfig}
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
          const { coinA, coinB, totalA, totalB, amountDollar } = row as any;
          return (
            <Box
              className={"textAlignRight"}
              display={"flex"}
              flexDirection={"column"}
              height={"100%"}
              justifyContent={"center"}
            >
              <Typography component={"span"}>
                {typeof amountDollar === "undefined"
                  ? EmptyValueTag
                  : PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      amountDollar * (forexMap[currency] ?? 0),
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
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      totalAmountDollar * (forexMap[currency] ?? 0),
                      undefined,
                      undefined,
                      2,
                      true,
                      { isFait: true }
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
    const defaultArgs: TableProps<any, any> = {
      rawData,
      columnMode: isMobile ? columnModeMobile() : columnMode(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }) =>
        columnsRaw as Column<Row<any>, unknown>[],
    };

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
            rowHeight: rowConfig.rowHeight,
            rowHeaderHeight: rowConfig.rowHeaderHeight,
            showloading: showLoading,
            sortMethod: (sortedRows: any[], sortColumn: string) =>
              sortMethod(sortedRows, sortColumn),
            sortDefaultKey: "liquidity",
          }}
        />
      </TableStyled>
    );
  };
);
