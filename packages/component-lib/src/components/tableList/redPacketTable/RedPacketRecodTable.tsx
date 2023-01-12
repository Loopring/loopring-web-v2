import styled from "@emotion/styled";
import { Box, Link, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Column, Table, TablePagination } from "../../basic-lib";
import { globalSetup, myLog, RowConfig } from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";

import {
  LuckyTokenItemStatusMap,
  RawDataRedPacketRecordsItem,
  RedPacketRecordsTableProps,
} from "./Interface";
import { useHistory } from "react-router-dom";
import React from "react";
import { FormatterProps } from "react-data-grid";
import _ from "lodash";
import { CoinIcons } from "../assetsTable";
import { useSettings } from "../../../stores";
import moment from "moment";

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

    const updateData = _.debounce(async ({ page = 1 }: any) => {
      await getMyRedPacketRecordTxList({
        offset: (page - 1) * (pagination?.pageSize ?? 10),
        limit: pagination?.pageSize ?? 10,
      });
    }, globalSetup.wait);

    const handlePageChange = React.useCallback(
      ({ page = 1 }: any) => {
        setPage(page);
        myLog("AmmTable page,", page);
        updateData({ page });
      },
      [updateData]
    );
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Token",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelRecordToken"),
          formatter: ({ row: { token } }: FormatterProps<R, unknown>) => {
            let tokenIcon: [any, any] = [undefined, undefined];
            const [head, middle, tail] = token.simpleName.split("-");
            const { coinJson } = useSettings();
            if (token.type === "lp" && middle && tail) {
              tokenIcon =
                coinJson[middle] && coinJson[tail]
                  ? [coinJson[middle], coinJson[tail]]
                  : [undefined, undefined];
            }
            if (token.type !== "lp" && head && head !== "lp") {
              tokenIcon = coinJson[head]
                ? [coinJson[head], undefined]
                : [undefined, undefined];
            }
            return (
              <Box
                height={"100%"}
                display={"inline-flex"}
                alignItems={"center"}
              >
                <CoinIcons type={token.type} tokenIcon={tokenIcon} />
                <Typography
                  marginLeft={1}
                  component={"span"}
                  color={"textPrimary"}
                >
                  {token?.simpleName}
                </Typography>
                <Typography
                  marginLeft={1 / 2}
                  component={"span"}
                  variant={"body2"}
                  className={"next-company"}
                  color={"textSecondary"}
                >
                  {token?.name}
                </Typography>
              </Box>
            );
          },
        },
        {
          key: "Amount",
          sortable: true,
          name: t("labelRecordAmount"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{`${row.remainAmount}/${row.totalAmount}`}</>;
          },
        },
        {
          key: "Type",
          sortable: true,
          name: t("labelRecordType"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>{t(`labelRedPacketViewType${row.type}`, { ns: "common" })}</>
            );
          },
        },
        {
          key: "Status",
          sortable: true,
          name: t("labelRecordStatus"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            if (
              row.type === sdk.LuckyTokenViewType.PRIVATE &&
              [0, 1, 2].includes(LuckyTokenItemStatusMap[row.status])
            ) {
              return (
                <Link
                  height={"100%"}
                  display={"inline-flex"}
                  alignItems={"center"}
                  onClick={() =>
                    onItemClick(row.rawData as sdk.LuckyTokenItemForReceive)
                  }
                >
                  {t(`labelOpen`, { ns: "common" })}
                </Link>
              );
            } else {
              return (
                <>{t(`labelRedPacketStatus${row.status}`, { ns: "common" })}</>
              );
            }
          },
        },
        {
          key: "Number",
          sortable: true,
          name: t("labelRecordNumber"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>{`${row.totalCount - row.remainCount}/${row.totalCount}`}</>
            );
          },
        },

        {
          key: "Time",
          sortable: true,
          name: t("labelRecordTime"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {moment(
                  new Date(row.createdAt + "0000"),
                  "YYYYMMDDHHMM"
                ).fromNow()}
              </>
            );
          },
        },
      ],
      [history, onItemClick, t]
    );
    React.useEffect(() => {
      updateData.cancel();
      handlePageChange({ page: 1 });
      // updateData({});
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);

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
