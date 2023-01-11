import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Button, Column, Table } from "../../basic-lib";
import { RowInvestConfig } from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  RawDataRedPacketRecordsItem,
  RedPacketClaimTableProps,
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

export const RedPacketClaimTable = withTranslation(["tables", "common"])(
  <R extends RawDataRedPacketRecordsItem>(
    props: RedPacketClaimTableProps<R> & WithTranslation
  ) => {
    const {
      // getMyRedPacketClaimList,
      tokenMap,
      rawData,
      showloading,
      onItemClick,
      t,
    } = props;
    // const { isMobile, upColor } = useSettings();
    const history = useHistory();
    // const [page, setPage] = React.useState(1);

    // const updateData = _.debounce(async ({ page = 1, pair }: any) => {
    //   await getMyRedPacketClaimList({
    //     // offset: (page - 1) * (pagination?.pageSize ?? 10),
    //     // limit: pagination?.pageSize ?? 10,
    //   });
    // }, globalSetup.wait);

    // const handlePageChange = React.useCallback(
    //   ({ page = 1, type, date, pair }: any) => {
    //     setPage(page);
    //     myLog("AmmTable page,", page);
    //     updateData({ page, type, date, pair });
    //   },
    //   [updateData]
    // );
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
      </TableWrapperStyled>
    );
  }
);
