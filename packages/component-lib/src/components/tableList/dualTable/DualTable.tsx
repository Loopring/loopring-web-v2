import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import { Column, Table } from "../../basic-lib";
import { Box, BoxProps } from "@mui/material";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { RawDataDualsItem } from "./Interface";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { DualRulesCoinsInfo } from "@loopring-web/loopring-sdk/dist/defs/loopring_defs";
import moment from "moment/moment";

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
  dualRulesCoinsInfo: DualRulesCoinsInfo;
  showloading: boolean;
}

export const DualTable = withTranslation(["tables", "common"])(
  <R extends RawDataDualsItem>(props: DualsTableProps<R> & WithTranslation) => {
    const {
      rawData,
      showloading,
      dualRulesCoinsInfo: { baseProfitStep },
      t,
    } = props;
    const { isMobile } = useSettings();

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
        // {
        //   key: "Term",
        //   sortable: true,
        //   name: t("labelDualTerm"),
        //   formatter: ({ row }: FormatterProps<R, unknown>) => {
        //     const {baseProfit,baseQty} = row.dualPrice.dualBid;
        //     const settleRatio = getValuePrecisionThousand((baseProfit*0.54), baseProfitStep,baseProfitStep,baseProfitStep,false,{ floor: true})
        //     const apy = settleRatio / ((expire_time-current_time)/(total millisecond per day)) * 365
        //     return <Box display="flex">{row.dualPrice}</Box>;
        //   },
        // },
        // {
        //   key: "Price",
        //   sortable: true,
        //   name: t("labelDualPrice"),
        //   formatter: ({ row }: FormatterProps<R, unknown>) => {
        //     return <Box display="flex"></Box>;
        //   },
        // },
        {
          key: "Settlement",
          sortable: true,
          name: t("labelDualSettlement"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const expireTime = row.expireTime;

            return (
              <Box display="flex">
                {moment(new Date(expireTime), "YYYYMMDDHHMM").toNow()}
              </Box>
            );
          },
        },
        {
          key: "Action",
          sortable: true,
          name: t("labelDualAction"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <Box display="flex"></Box>;
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
