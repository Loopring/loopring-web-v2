import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Button, Column, Table, TablePagination } from "../../basic-lib";
import {
  globalSetup,
  myLog,
  RowConfig,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  RawDataRedPacketBlindBoxReceivesItem,
  RedPacketBlindBoxReceiveTableProps,
} from "./Interface";
import React from "react";
import { FormatterProps } from "react-data-grid";
import _ from "lodash";
import moment from "moment";
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
    --template-columns: 20% 20% 30% 30% !important;

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
export const RedPacketBlindBoxReceiveTable = withTranslation([
  "tables",
  "common",
])(
  <R extends RawDataRedPacketBlindBoxReceivesItem>(
    props: RedPacketBlindBoxReceiveTableProps<R> & WithTranslation
  ) => {
    const {
      getRedPacketReceiveList,
      pagination,
      rawData,
      showloading,
      t,
      onItemClick,
      showActionableRecords
    } = props;
    const [page, setPage] = React.useState(1);
    const updateData = _.debounce(async ({ page = 1, filter = {} }: any) => {
      await getRedPacketReceiveList({
        offset: (page - 1) * (pagination?.pageSize ?? 10),
        limit: pagination?.pageSize ?? 10,
        filter: {
          ...filter,
          statuses: showActionableRecords 
            ? [0] // 0 is for sdk.BlindBoxStatus.NOT_OPENED
            : undefined
        }
      });
    }, globalSetup.wait);

    const handlePageChange = React.useCallback(
      ({ page = 1 }: any) => {
        setPage(page);
        myLog("RedPacket Receive page,", page);
        updateData({
          page,
        });
      },
      [updateData]
    );
    React.useEffect(() => {
      updateData.cancel();
      handlePageChange({ page: 1 });
      return () => {
        updateData.cancel();
      };
    }, [showActionableRecords]);
    const columnModeTransaction = [
      {
        key: "Address",
        name: t("labelAddress"),
        formatter: ({ row }: FormatterProps<R>) => {
          return <>{row.sender}</>;
        },
      },
      {
        key: "Time",
        cellClass: "textAlignRight",
        headerCellClass: "textAlignRight",
        name: t("labelRecordTime"),
        formatter: ({ row }: FormatterProps<R>) => {
          return <>{moment(new Date(row.claimAt), "YYYYMMDDHHMM").fromNow()}</>;
        },
      },
      {
        key: "End Time",
        cellClass: "textAlignRight",
        headerCellClass: "textAlignRight",
        name: t("labelBlindBoxEndTime"),
        formatter: ({ row }: FormatterProps<R>) => {
          return (
            <>
              {moment(row.rawData.luckyToken.nftExpireTime).format(
                YEAR_DAY_MINUTE_FORMAT
              )}
            </>
          );
        },
      },
      {
        key: "Action",
        cellClass: "textAlignRight",
        headerCellClass: "textAlignRight",
        name: "Action",
        formatter: ({ row }: FormatterProps<R>) => {
          if (row.rawData.luckyToken.validUntil > Date.now() && row.rawData.luckyToken.status !== sdk.LuckyTokenItemStatus.COMPLETED) {
            return <>{t("labelBlindBoxStartTime", {
              time: moment(row.rawData.luckyToken.validUntil).format('YYYY.MM.DD HH:mm')
            })} </>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.OPENED) {
            return <>{t("labelBlindBoxOpend")}</>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.EXPIRED) { 
            return <>{t("labelBlindBoxExpired")}</>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.NOT_OPENED) { 
            return <Button onClick={(e) => {
              // e.preventDefault()
              // onItemClick(row.rawData,  {
              //   offset: (page - 1) * (pagination?.pageSize ?? 10),
              //   limit: pagination?.pageSize ?? 10,
              //   filter: { },
              // })
            }} variant={"text"}>{t("labelRedPacketOpen", {ns: "common"})}</Button>
          }
        },
      },
    ] as Column<R, unknown>[];
    const defaultArgs: any = {
      columnMode: columnModeTransaction,
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
          onRowClick={(_index: number, row: R, ) => {
            onItemClick(row.rawData, {
              offset: (page - 1) * (pagination?.pageSize ?? 10),
              limit: pagination?.pageSize ?? 10,
              filter: {
                statuses: showActionableRecords 
                  ? [0] // 0 is for sdk.BlindBoxStatus.NOT_OPENED
                  : undefined
              },
            })
          }}
          sortMethod={React.useCallback(
            (_sortedRows, sortColumn) => {
              let resultRows: R[] = [];
              switch (sortColumn) {
                case "Token":
                  resultRows = rawData.sort((a: R, b: R) => {
                    if (a.token.type == TokenType.nft) {
                      return (
                        a.token as any
                      )?.metadata?.base?.name?.localeCompare(
                        (b.token as any)?.metadata?.base?.name
                      );
                    } else {
                      return (a.token as any)?.simpleName.localeCompare(
                        (b.token as any)?.simpleName
                      );
                    }
                  });
                  break;
                case "Amount":
                  resultRows = rawData.sort((a: R, b: R) => {
                    return a.amount.localeCompare(b.amount);
                  });
                  break;
                case "Time":
                  resultRows = rawData.sort((a: R, b: R) => {
                    return b.claimAt - a.claimAt;
                  });
                  break;
                default:
              }
              return resultRows;
            },
            [rawData]
          )}
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
