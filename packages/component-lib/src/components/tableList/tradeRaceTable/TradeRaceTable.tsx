import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Column, Table } from "../../basic-lib";
import { TFunction } from "i18next";
import { withTranslation } from "react-i18next";
import {
  FirstPlaceIcon,
  SecondPlaceIcon,
  ThirdPlaceIcon,
} from "@loopring-web/common-resources";

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    --template-columns: 150px 350px auto auto !important;
    height: auto;

    // .rdg-cell.action {
    // display: flex;
    // justify-content: center;
    // align-items: center;
    // }
    .rdgCellCenter {
      height: 100%;
      // display: flex;
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
  // .textAlignRight {
  //     text-align: right;
  // }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as typeof Box;

export const TradeRaceTable = withTranslation("tables")(
  ({ rawData, showloading, volumeToken, rewardToken, t, ...props }: any) => {
    const getColumnMode = React.useCallback(
      (t: TFunction): Column<any, unknown>[] => [
        {
          key: "rank",
          name: t("labelTradeRaceRank"),
          formatter: ({ row }) => {
            const value = row["rank"];
            const formattedValue =
              value === "1" ? (
                <FirstPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
              ) : value === "2" ? (
                <SecondPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
              ) : value === "3" ? (
                <ThirdPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
              ) : (
                <Box paddingLeft={1}>{value}</Box>
              );
            return <Box className="rdg-cell-value">{formattedValue}</Box>;
          },
        },
        {
          key: "address",
          name: t("labelTradeRaceAddress"),
          headerCellClass: "textAlignCenter",
          formatter: ({ row }) => {
            const value = row["address"];
            // const firstSix = value.substring(0, 6)
            // const lastFour = value.substring(value.length - 4, value.length)
            // const formattedAddress = `${firstSix}...${lastFour}`
            return (
              <Box className="rdg-cell-value textAlignCenter">
                {/* {formattedAddress} */}
                {value}
              </Box>
            );
          },
        },
        {
          key: "tradeVolume",
          name: `${t("labelTradeRaceTradeVolume")} (${volumeToken})`,
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const value = row["tradeVolume"];

            return <Box className="rdg-cell-value textAlignRight">{value}</Box>;
          },
        },
        {
          key: "profit",
          name: `${t("labelTradeRaceAward")} (${rewardToken})`,
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const value = row["profit"];

            return <Box className="rdg-cell-value textAlignRight">{value}</Box>;
          },
        },
      ],
      [rewardToken, volumeToken]
    );

    const defaultArgs: any = {
      columnMode: getColumnMode(t),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };

    return (
      <TableStyled>
        <Table
          className={"scrollable"}
          {...{ ...defaultArgs, ...props, rawData, showloading }}
        />
      </TableStyled>
    );
  }
);
