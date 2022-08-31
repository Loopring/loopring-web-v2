import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import { Column, Table } from "../../basic-lib";
import { Box, BoxProps } from "@mui/material";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { RawDataDualsItem } from "./Interface";

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: auto 20% 180px !important;`
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

export interface DualsTableProps<R = RawDataDualsItem> {
  rawData: R[];
  showloading: boolean;
}

export const DualTable = withTranslation(["tables", "common"])(
  <R extends RawDataDualsItem>(props: DualsTableProps<R> & WithTranslation) => {
    const { rawData, showloading, t } = props;
    const { isMobile } = useSettings();

    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "style",
          sortable: false,
          width: "auto",
          minWidth: 240,
          name: t("labelDualType") + " " + t("labelDualAmount"),
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
            return (
              <Box display={"flex"} alignItems={"center"}>
                {/*<Typography*/}
                {/*  color={isJoin ? "var(--color-success)" : "var(--color-error)"}*/}
                {/*>*/}
                {/*  {side}*/}
                {/*</Typography>*/}
                {/*&nbsp;&nbsp;*/}
                {/*<Typography component={"span"}>*/}
                {/*  {`${getValuePrecisionThousand(*/}
                {/*    sellVolume,*/}
                {/*    sellTokenInfo?.precision,*/}
                {/*    sellTokenInfo?.precision,*/}
                {/*    sellTokenInfo?.precision,*/}
                {/*    false,*/}
                {/*    { isTrade: true, floor: false }*/}
                {/*  )} ${sellTokenInfo.symbol}`}*/}
                {/*</Typography>*/}
                {/*&nbsp;{DirectionTag} &nbsp;*/}
                {/*<Typography component={"span"}>*/}
                {/*  {`${getValuePrecisionThousand(*/}
                {/*    buyVolume,*/}
                {/*    buyTokenInfo?.precision,*/}
                {/*    buyTokenInfo?.precision,*/}
                {/*    buyTokenInfo?.precision,*/}
                {/*    false,*/}
                {/*    { isTrade: true, floor: false }*/}
                {/*  )} ${buyTokenInfo.symbol}`}*/}
                {/*</Typography>*/}
              </Box>
            );
          },
        },
        {
          key: "fee",
          name: t("labelDualFee"),
          headerCellClass: "textAlignRight",
          formatter: ({ row: _row }) => {
            // const { fee } = row;
            // const feeTokenInfo = tokenMap[idIndex[fee?.tokenId ?? ""]];
            // const feeVolume = sdk
            //   .toBig(fee?.volume ?? 0)
            //   .div("1e" + feeTokenInfo.decimals)
            //   .toNumber();
            // const renderValue =
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
            // renderValue
            return <Box className="rdg-cell-value textAlignRight">{}</Box>;
          },
        },
        // {
        //   key: "time",
        //   sortable: false,
        //   width: "auto",
        //   headerCellClass: "textAlignRight",
        //   cellClass: "textAlignRight",
        //   name: t("labelDualTime"),
        //   formatter: ({ row }) => {
        //     const { updatedAt: time } = row;
        //     let timeString;
        //     if (typeof time === "undefined") {
        //       timeString = EmptyValueTag;
        //     } else {
        //       timeString = moment(new Date(time), "YYYYMMDDHHMM").fromNow();
        //     }
        //     return (
        //       <Typography component={"span"} textAlign={"right"}>
        //         {timeString}
        //       </Typography>
        //     );
        //   },
        // },
      ],
      [t]
    );

    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "apy",
          name: t("labelDualApy"),
          sortable: true,
          headerCellClass: "textAlignLeft",
          cellClass: "textAlignLeft",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
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
      [t]
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
      </TableStyled>
    );
  }
);
