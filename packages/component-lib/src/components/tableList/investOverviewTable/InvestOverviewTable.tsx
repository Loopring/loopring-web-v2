import React from "react";
import { useTranslation } from "react-i18next";

import { Button, Column, Table } from "../../basic-lib";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  InvestMapType,
  RowConfig,
} from "@loopring-web/common-resources";
import { Box, BoxProps, Typography } from "@mui/material";
import { InvestOverviewTableProps, RowInvest, SubRowAction } from "./Interface";
import styled from "@emotion/styled";
import { useHistory } from "react-router-dom";
import { TokenInfo } from "@loopring-web/loopring-sdk";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import { investRowReducer } from "./components/expends";
import { CoinIcons } from "../assetsTable/components/CoinIcons";
import { Filter } from "./components/Filter";
import { DropdownIconStyled } from "../../tradePanel";
import { useSettings } from "../../../stores";
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

export const InvestOverviewTable = <R extends RowInvest>({
  rawData,
  // handleWithdraw,
  // handleDeposit,
  showFilter,
  wait,
  tableHeight,
  coinJson,
  // account,
  // tokenPrices,
  allowTrade,
  showLoading,
  // tokenMap,
  // forexMap,
  sortMethod,
  hideSmallBalances,
  setHideSmallBalances,
  ...rest
}: InvestOverviewTableProps<R>) => {
  const { t, i18n } = useTranslation(["table", "common"]);
  const [rows, dispatch] = React.useReducer(investRowReducer, rawData);
  const history = useHistory();
  const [filter, setFilter] = React.useState({
    searchValue: "",
  });
  const handleFilterChange = React.useCallback(
    (filter) => {
      setFilter(filter);
    },
    [setFilter]
  );
  const getColumnMode = (): Column<R, unknown>[] => [
    {
      key: "type",
      name: t("labelToken"),
      formatter: ({ row }) => {
        switch (row.type) {
          case InvestMapType.Token:
            const token: TokenInfo = row.token;
            let tokenIcon = coinJson[token?.symbol];
            return (
              <>
                <CoinIcons tokenIcon={tokenIcon} />
                <Typography
                  variant={"inherit"}
                  color={"textPrimary"}
                  display={"inline-flex"}
                  flexDirection={"column"}
                  marginLeft={2}
                  component={"span"}
                  paddingRight={1}
                >
                  <Typography component={"span"} className={"next-coin"}>
                    {token?.symbol}
                  </Typography>
                  <Typography
                    marginLeft={1}
                    component={"span"}
                    className={"next-company"}
                    color={"textSecondary"}
                  >
                    {token?.name}
                  </Typography>
                </Typography>
              </>
            );
          default:
            return (
              <Typography
                variant={"inherit"}
                color={"textPrimary"}
                display={"inline-flex"}
                flexDirection={"column"}
                marginLeft={2}
                component={"span"}
                paddingRight={1}
              >
                <Typography component={"span"} className={"next-type"}>
                  {t(row.i18nKey, { ns: "common" })}
                </Typography>
              </Typography>
            );
        }
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
        const [start, end] = row.apr;
        return (
          <Box className={"textAlignRight"}>
            <Typography component={"span"}>
              {!start
                ? EmptyValueTag
                : start == end
                ? getValuePrecisionThousand(start, 2, 2, 2, true) + "%"
                : getValuePrecisionThousand(start, 2, 2, 2, true) +
                  "% - " +
                  getValuePrecisionThousand(end, 2, 2, 2, true) +
                  "%"}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "duration",
      sortable: true,
      width: "auto",
      name: t("labelDurations "),
      formatter: ({ row }) => {
        return (
          <Box
            height={"100%"}
            display={"flex"}
            justifyContent={"flex-end"}
            alignItems={"center"}
          >
            <Typography component={"span"}>
              {t("labelInvest" + row.durationType, { ns: "common" })}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "action",
      name: t("labelActions"),
      headerCellClass: "textAlignRight",
      formatter: ({ row }) => {
        switch (row.type) {
          case InvestMapType.Token:
            return (
              <Typography
                variant={"inherit"}
                display={"inline-flex"}
                onClick={
                  () =>
                    dispatch({
                      symbol: row.token.symbol,
                      type: SubRowAction.ToggleSubRow,
                    })
                  // setDropdownStatus((prev) =>
                  //   prev === "up" ? "down" : "up"
                  // )
                }
              >
                {`${t("labelSelect")}`}
                <DropdownIconStyled
                  status={row.isExpanded ? "up" : "down"}
                  fontSize={"medium"}
                />
              </Typography>
            );
          default:
            return (
              <Typography
                variant={"inherit"}
                color={"textPrimary"}
                display={"inline-flex"}
                flexDirection={"column"}
                marginLeft={2}
                component={"span"}
                paddingRight={1}
              >
                <Button
                  variant={"outlined"}
                  size={"small"}
                  onClick={(_e) => {
                    switch (row.type) {
                      case InvestMapType.AMM:
                        history.replace(
                          `./invest/ammpool?search=${row.token.symbol}`
                        );
                        return;
                      case InvestMapType.DEFI:
                        history.replace(
                          `./invest/defi?search=${row.token.symbol}`
                        );
                        return;
                    }
                  }}
                >
                  {t("labelInvest")}
                </Button>
              </Typography>
            );
        }
      },
    },
  ];
  const { isMobile } = useSettings();
  return (
    <TableStyled isMobile={isMobile}>
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
              hideSmallBalances,
              setHideSmallBalances,
            }}
          />
        </TableFilterStyled>
      )}

      <Table
        i18n={i18n}
        tReady={true}
        {...{ ...rest, t }}
        style={{ height: tableHeight }}
        rowHeight={RowConfig.rowHeight}
        headerRowHeight={RowConfig.rowHeaderHeight}
        rawData={rows}
        generateRows={(rowData: any) => rowData}
        generateColumns={({ columnsRaw }: any) =>
          columnsRaw as Column<any, unknown>[]
        }
        columnMode={isMobile ? getColumnMode() : getColumnMode()}
      />
    </TableStyled>
  );
};
