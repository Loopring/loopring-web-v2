import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import {
  globalSetup,
  RowConfig,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { Column, Table, TablePagination } from "../../basic-lib";
import { Box, BoxProps, Typography } from "@mui/material";
import moment from "moment";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { DualAssetTableProps, RawDataDualAssetItem } from "./Interface";
import { CoinIcons } from "../assetsTable";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (prosp: BoxProps & { isMobile: boolean }) => JSX.Element;
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      return props.currentheight + "px";
    }};
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

export const DualAssetTable = withTranslation(["tables", "common"])(
  <R extends RawDataDualAssetItem>(
    props: DualAssetTableProps<R> & WithTranslation
  ) => {
    const {
      rawData,
      pagination,
      getDualAssetList,
      idIndex,
      tokenMap,
      showloading,
      t,
    } = props;

    const { isMobile, coinJson } = useSettings();
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
        getDualAssetList({
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
    const getColumnMode = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          sortable: false,
          width: "auto",
          key: "Frozen_Target",
          name: t("labelDualAssetProduct"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                component={"span"}
                flexDirection={"column"}
                display={"flex"}
                height={"100%"}
              >
                <Typography component={"span"} display={"inline-flex"}>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <CoinIcons
                    type={"dual"}
                    size={24}
                    tokenIcon={[
                      coinJson[row.sellSymbol],
                      coinJson[row.buySymbol],
                    ]}
                  />
                </Typography>
                <Typography
                  component={"span"}
                  display={"inline-flex"}
                  color={"textPrimary"}
                >
                  {t("labelDualInvestTitle", {
                    symbolA: row.sellSymbol,
                    symbolB: row.buySymbol,
                  })}
                </Typography>
              </Typography>
            );
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Price",
          name: t("labelDualFrozen"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                height={"100%"}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
              >
                {row?.amount + " " + row.buySymbol}
              </Typography>
            );
          },
        },
        {
          key: "Price",
          sortable: false,
          width: "auto",
          name: t("labelDualAssetPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                height={"100%"}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
              >
                {row?.strike}
              </Typography>
            );
          },
        },
        {
          key: "Settlement_Date",
          sortable: true,
          width: "auto",
          name: t("labelDualAssetSettlement_Date"),
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
          key: "APR",
          sortable: true,
          width: "auto",
          name: t("labelDualAssetAPR"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Typography>{row?.apy}</Typography>;
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Action",
          name: t("labelDualAssetAction"),
          formatter: ({ row: _row }: FormatterProps<R, unknown>) => {
            return <Typography>{t("labelDetail")}</Typography>;
          },
        },
      ],
      [coinJson, t]
    );

    const getColumnMobile = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          sortable: false,
          width: "auto",
          key: "Frozen_Target",
          name: t("labelDualAssetProduct"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                <Typography component={"span"} display={"inline-flex"}>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <CoinIcons
                    type={"dual"}
                    size={32}
                    tokenIcon={[
                      coinJson[row.sellSymbol],
                      coinJson[row.buySymbol],
                    ]}
                  />
                </Typography>
                <Typography
                  component={"span"}
                  flexDirection={"column"}
                  display={"flex"}
                >
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    color={"textPrimary"}
                  >
                    {t("labelDualInvestTitle", {
                      symbolA: row.sellSymbol,
                      symbolB: row.buySymbol,
                    })}
                  </Typography>
                </Typography>
              </>
            );
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Price",
          name: t("labelDualAssetFrozen"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                height={"100%"}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
              >
                {row?.amount + " " + row.buySymbol}
              </Typography>
            );
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Price",
          name: t("labelDualAssetPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                height={"100%"}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
              >
                {row?.strike}
              </Typography>
            );
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Settlement_Date",
          name: t("labelDualAssetSettlement_Date"),
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
          sortable: false,
          width: "auto",
          key: "APR",
          name: t("labelDualAssetAPR"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Typography>{row?.apy}</Typography>;
          },
        },
        {
          sortable: false,
          width: "auto",
          key: "Action",
          name: t("labelDualAssetAction"),
          formatter: ({ row: _row }: FormatterProps<R, unknown>) => {
            return <Typography>{t("labelDetail")}</Typography>;
          },
        },
      ],
      [t, tokenMap, idIndex]
    );

    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let _dualList: R[] = [];
        switch (sortColumn) {
          case "Settlement_Date":
            _dualList = rawData.sort((a, b) => {
              return b.expireTime - a.expireTime;
            });
            break;

          case "APR":
            _dualList = rawData.sort((a, b) => {
              const replaced = new RegExp(`[\\${sdk.SEP},%]`);
              const valueA = a.apy?.replace(replaced, "") ?? 0;
              const valueB = b.apy?.replace(replaced, "") ?? 0;
              return Number(valueB) - Number(valueA);
            });
            break;
          default:
            _dualList = rawData;
        }
        // resetTableData(_dualList)
        return _dualList;
      },
      [rawData]
    );
    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMode() : getColumnMobile(),
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
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={
            RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
          }
          sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,
            rawData,
            showloading,
          }}
        />
        {pagination && pagination.total > pagination.pageSize && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableWrapperStyled>
    );
  }
);
