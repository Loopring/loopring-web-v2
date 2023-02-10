import styled from "@emotion/styled";
import { Box, Link, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import {
  BoxNFT,
  Column,
  NftImage,
  Table,
  TablePagination,
} from "../../basic-lib";
import {
  globalSetup,
  myLog,
  RowConfig,
  TokenType,
} from "@loopring-web/common-resources";
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
import moment from "moment";
import { ColumnCoinDeep } from "../assetsTable";

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
    --template-columns: 16% 16% 26% auto auto auto !important;

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
            if (token.type === TokenType.single) {
              return <ColumnCoinDeep token={token as any} />;
            } else {
              const { metadata } = token as sdk.UserNFTBalanceInfo;
              return (
                <Box
                  className="rdg-cell-value"
                  height={"100%"}
                  display={"flex"}
                  alignItems={"center"}
                >
                  {metadata?.imageSize ? (
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      height={RowConfig.rowHeight + "px"}
                      width={RowConfig.rowHeight + "px"}
                      padding={1 / 4}
                      style={{ background: "var(--field-opacity)" }}
                    >
                      {metadata?.imageSize && (
                        <NftImage
                          alt={metadata?.base?.name}
                          onError={() => undefined}
                          src={metadata?.imageSize[sdk.NFT_IMAGE_SIZES.small]}
                        />
                      )}
                    </Box>
                  ) : (
                    <BoxNFT
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      height={RowConfig.rowHeight + "px"}
                      width={RowConfig.rowHeight + "px"}
                    />
                  )}
                  <Typography
                    color={"inherit"}
                    flex={1}
                    display={"inline-flex"}
                    alignItems={"center"}
                    paddingLeft={1}
                    overflow={"hidden"}
                    textOverflow={"ellipsis"}
                    component={"span"}
                  >
                    {metadata?.base?.name ?? "NFT"}
                  </Typography>
                </Box>
              );
            }
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
          sortable: false,
          name: t("labelRecordType"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {t(
                  row.type.partition == sdk.LuckyTokenAmountType.AVERAGE
                    ? "labelRedPacketSendCommonTitle"
                    : "labelRedPacketSenRandomTitle",
                  { ns: "common" }
                ) +
                  " — " +
                  t(`labelRedPacketViewType${row?.type?.scope ?? 0}`, {
                    ns: "common",
                  })}
              </>
            );
          },
        },
        {
          key: "Status",
          sortable: false,
          name: t("labelRecordStatus"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            if (
              // row.type.scope === sdk.LuckyTokenViewType.PRIVATE &&
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
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
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
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelRecordTime"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>{moment(new Date(row.createdAt), "YYYYMMDDHHMM").fromNow()}</>
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
          sortMethod={React.useCallback(
            (_sortedRows, sortColumn) => {
              let resultRows: R[] = [];
              switch (sortColumn) {
                case "Token":
                  resultRows = rawData.sort((a: R, b: R) => {
                    return a.token.simpleName.localeCompare(b.token.simpleName);
                  });
                  break;
                case "Amount":
                  resultRows = rawData.sort((a: R, b: R) => {
                    return a.totalAmount.localeCompare(b.totalAmount);
                  });
                  break;
                case "Number":
                  resultRows = rawData.sort((a: R, b: R) => {
                    return b.totalCount - a.totalCount;
                  });
                  break;
                case "Time":
                  resultRows = rawData.sort((a: R, b: R) => {
                    return b.createdAt - a.createdAt;
                  });
                  break;
                default:
              }
              return resultRows;
            },
            [rawData]
          )}
          {...{
            ...defaultArgs,
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
