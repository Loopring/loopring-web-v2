import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import { Button, Column, Table } from "../../basic-lib";
import { Box, BoxProps, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { RawDataDualsItem } from "./Interface";
import { EmptyValueTag, RowConfig } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import moment from "moment/moment";

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

export interface DualsTableProps<R> {
  rawData: R[];
  showloading: boolean;
}

export const DualTable = withTranslation(["tables", "common"])(
  <R extends RawDataDualsItem>(props: DualsTableProps<R> & WithTranslation) => {
    const { rawData, showloading, t } = props;
    const { isMobile } = useSettings();
    const history = useHistory();
    // const [tableHeight, setTableHeight] = React.useState(0);
    // const resetTableData = React.useCallback(
    //   (tableData) => {
    //     setFilteredData(tableData);
    //     setTableHeight(
    //
    //     );
    //   },
    //   [setFilteredData, setTableHeight]
    // );
    // React.useEffect(() => {
    //   window.addEventListener("scroll", currentScroll);
    //   return () => {
    //     window.removeEventListener("scroll", currentScroll);
    //   };
    // }, [currentScroll]);
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Apy",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelDualApy"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display={"flex"}>{row?.apy ?? EmptyValueTag}</Box>;
          },
        },
        {
          key: "targetPrice",
          sortable: true,
          name: t("labelDualPrice"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display="flex">{row.settleRatio}</Box>;
          },
        },
        {
          key: "Term",
          sortable: true,
          name: t("labelDualTerm"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display="flex">{row.term}</Box>;
          },
        },
        {
          key: "Settlement",
          sortable: true,
          name: t("labelDualSettlement"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Box display="flex">
                {moment(new Date(row?.expireTime)).format("YYYY/MM/DD")}
              </Box>
            );
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
                    history.push(`/invest/dual/${row.productId}`);
                  }}
                >
                  {t("labelInvestBtn", { ns: "common" })}
                </Button>
              </Typography>
            );
          },
        },
      ],
      []
    );

    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "apy",
          name: t("labelDualApy"),
          sortable: true,
          headerCellClass: "textAlignLeft",
          cellClass: "textAlignLeft",
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
      <TableWrapperStyled>
        <TableStyled
          currentheight={
            RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
          }
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.rowHeaderHeight}
          onRowClick={(_, row: R) => {
            history.push(`/invest/dual/${row?.productId}`);
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
