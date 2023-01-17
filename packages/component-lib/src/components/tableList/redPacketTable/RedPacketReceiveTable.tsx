import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Column, Table, TablePagination } from "../../basic-lib";
import { globalSetup, myLog, RowConfig } from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  RawDataRedPacketReceivesItem,
  RedPacketReceiveTableProps,
} from "./Interface";
import { useHistory } from "react-router-dom";
import React from "react";
import { FormatterProps } from "react-data-grid";
import _ from "lodash";
import moment from "moment";
import { ColumnCoinDeep } from "../assetsTable";
import * as sdk from "@loopring-web/loopring-sdk";

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
    --template-columns: 20% 20% 30% auto auto !important;

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
export const RedPacketReceiveTable = withTranslation(["tables", "common"])(
  <R extends RawDataRedPacketReceivesItem>(
    props: RedPacketReceiveTableProps<R> & WithTranslation
  ) => {
    const { getRedPacketReceiveList, pagination, rawData, showloading, t } =
      props;
    // const { isMobile, upColor } = useSettings();
    const history = useHistory();
    const [page, setPage] = React.useState(1);

    const updateData = _.debounce(async ({ page = 1 }: any) => {
      await getRedPacketReceiveList({
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
    React.useEffect(() => {
      updateData.cancel();
      handlePageChange({ page: 1 });
      // updateData({});
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Token",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelToken"),
          formatter: ({ row: { token } }: FormatterProps<R, unknown>) => (
            <ColumnCoinDeep token={token} />
          ),
        },
        {
          key: "Amount",
          sortable: true,
          name: t("labelAmount"),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{`${row.amount}`}</>;
          },
        },
        {
          key: "Type",
          sortable: true,
          name: t("labelType"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {t(
                  row.type.partition == sdk.LuckyTokenAmountType.AVERAGE
                    ? "labelRedPacketSendCommonTitle"
                    : "labelRedPacketSenRandomTitle",
                  { ns: "common" }
                ) +
                  " (" +
                  t(`labelRedPacketViewType${row?.type?.scope ?? 0}`, {
                    ns: "common",
                  }) +
                  ")"}
              </>
            );
          },
        },
        {
          key: "Address",
          sortable: true,
          name: t("labelAddress"),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{row.sender}</>;
          },
        },
        {
          key: "Time",
          sortable: true,
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelRecordTime"),
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <>{moment(new Date(row.claimAt), "YYYYMMDDHHMM").fromNow()}</>
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
            RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
          }
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.rowHeaderHeight}
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
