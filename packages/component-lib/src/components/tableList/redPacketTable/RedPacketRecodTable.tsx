import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Button, Column, Table, TablePagination } from "../../basic-lib";
import {
  globalSetup,
  myLog,
  RowInvestConfig,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  RawDataRedPacketRecordsItem,
  RedPacketRecordsTableProps,
} from "./Interface";
import { useHistory } from "react-router-dom";
import React from "react";
import { FormatterProps } from "react-data-grid";
import _ from "lodash";

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

export const RedPacketRecordTable = withTranslation(["tables", "common"])(
  <R extends RawDataRedPacketRecordsItem>(
    props: RedPacketRecordsTableProps<R> & WithTranslation
  ) => {
    const {
      getMyRedPacketRecordTxList,
      pagination,
      rawData,
      showloading,
      onItemClick,
      t,
    } = props;
    const history = useHistory();
    const [page, setPage] = React.useState(1);

    const updateData = _.debounce(async ({ page = 1, pair }: any) => {
      await getMyRedPacketRecordTxList({
        offset: (page - 1) * (pagination?.pageSize ?? 10),
        limit: pagination?.pageSize ?? 10,
      });
    }, globalSetup.wait);

    const handlePageChange = React.useCallback(
      ({ page = 1, type, date, pair }: any) => {
        setPage(page);
        myLog("AmmTable page,", page);
        updateData({ page, type, date, pair });
      },
      [updateData]
    );
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelDualApy"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display={"flex"}></Box>;
          },
        },
        {
          key: "",
          sortable: true,
          name: t("labelDualPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display={"flex"}></Box>;
          },
        },
        {
          key: "",
          sortable: true,
          name: t("labelDualTerm"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display="flex"></Box>;
          },
        },
        {
          key: "",
          sortable: true,
          name: t("labelDualSettlement"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display="flex"></Box>;
          },
        },
        {
          key: "Action",
          sortable: false,
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelDualAction"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                variant={"inherit"}
                color={"textPrimary"}
                display={"inline-flex"}
                flexDirection={"column"}
                className={"textAlignRight"}
                component={"span"}
              >
                <Button
                  variant={"contained"}
                  color={"primary"}
                  size={"small"}
                  onClick={(_e) => {
                    onItemClick(row);
                  }}
                >
                  {t("labelInvestBtn", { ns: "common" })}
                </Button>
              </Typography>
            );
          },
        },
      ],
      [history, t]
    );

    // const getColumnMobileTransaction = React.useCallback(
    //   (): Column<R, unknown>[] => [
    //     {
    //       key: "Apy",
    //       sortable: true,
    //       cellClass: "textAlignLeft",
    //       headerCellClass: "textAlignLeft",
    //       name: t("labelDualApy"),
    //       formatter: ({ row }: FormatterProps<R, unknown>) => {
    //         return <Box display={"flex"}>{row?.apy ?? EmptyValueTag}</Box>;
    //       },
    //     },
    //     {
    //       key: "targetPrice",
    //       sortable: true,
    //       name: t("labelDualPrice"),
    //       formatter: ({ row }: FormatterProps<R, unknown>) => {
    //         const [_upColor, _downColor] =
    //           upColor == UpColor.green
    //             ? ["var(--color-success)", "var(--color-error)"]
    //             : ["var(--color-error)", "var(--color-success)"];
    //         return (
    //           <Box
    //             display="flex"
    //             justifyContent={"stretch"}
    //             height={"100%"}
    //             alignItems={"center"}
    //           >
    //             <Typography component={"span"}> {row.strike}</Typography>
    //             <Typography
    //               component={"span"}
    //               display={"inline-flex"}
    //               alignItems={"center"}
    //               color={"textSecondary"}
    //               variant={"body2"}
    //             >
    //               <UpIcon
    //                 fontSize={"small"}
    //                 // htmlColor={row.isUp ? _upColor : _downColor}
    //                 style={{
    //                   transform: row.isUp ? "" : "rotate(-180deg)",
    //                 }}
    //               />
    //               {row.settleRatio
    //                 ? getValuePrecisionThousand(
    //                     sdk
    //                       .toBig(row.strike ?? 0)
    //                       .minus(row.currentPrice?.currentPrice ?? 0)
    //                       .div(row.currentPrice?.currentPrice ?? 1)
    //                       .times(100)
    //                       .abs(),
    //                     2,
    //                     2,
    //                     2,
    //                     true
    //                   ) + "%"
    //                 : EmptyValueTag}
    //             </Typography>
    //           </Box>
    //         );
    //       },
    //     },
    //     {
    //       key: "Settlement",
    //       sortable: true,
    //       cellClass: "textAlignRight",
    //       headerCellClass: "textAlignRight",
    //       name: t("labelDualSettlement"),
    //       formatter: ({ row }: FormatterProps<R, unknown>) => {
    //         return (
    //           <>{moment(new Date(row.expireTime)).format(YEAR_DAY_FORMAT)}</>
    //         );
    //       },
    //     },
    //   ],
    //   [t]
    // );

    const defaultArgs: any = {
      columnMode: getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };

    return (
      <TableWrapperStyled>
        <TableStyled
          currentheight={
            RowInvestConfig.rowHeaderHeight +
            rawData.length * RowInvestConfig.rowHeight
          }
          rowHeight={RowInvestConfig.rowHeight}
          headerRowHeight={RowInvestConfig.rowHeaderHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row);
          }}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,

            rawData,
            showloading,
          }}
        />
        {!!(pagination && pagination.total) && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={(page) => handlePageChange({ page })}
          />
        )}
      </TableWrapperStyled>
    );
  }
);
