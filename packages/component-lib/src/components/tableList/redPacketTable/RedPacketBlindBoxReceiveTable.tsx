import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import {
  BoxNFT,
  Button,
  Column,
  NftImage,
  Table,
  TablePagination,
} from "../../basic-lib";
import {
  EmptyValueTag,
  globalSetup,
  myLog,
  RowConfig,
  TokenType,
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
    --template-columns: 20% 20% 15% 15% 30% !important;

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
const RowHeight = 55;
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
      showActionableRecords,
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
            : undefined,
        },
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
        key: "Token",
        name: t("labelToken"),
        formatter: ({ row }: FormatterProps<R>) => {
          const metadata = row.rawData.luckyToken.nftTokenInfo.metadata;
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
                display={"inline-block"}
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
        },
      },
      {
        key: "Address",
        name: t("labelRedPacketSenderAddress"),
        formatter: ({ row }: FormatterProps<R>) => {
          return <>{row.sender}</>;
        },
      },
      {
        key: "Amount",
        name: t("labelAmount"),
        formatter: ({ row }: FormatterProps<R>) => {
          return (
            <>
              {row.rawData.claim.amount
                ? row.rawData.claim.amount
                : EmptyValueTag}
            </>
          );
        },
      },
      {
        key: "Receive Time",
        cellClass: "textAlignRight",
        headerCellClass: "textAlignRight",
        name: t("labelReceiveTime"),
        formatter: ({ row }: FormatterProps<R>) => {
          return <>{moment(new Date(row.claimAt), "YYYYMMDDHHMM").fromNow()}</>;
        },
      },
      // {
      //   key: "End Time",
      //   cellClass: "textAlignRight",
      //   headerCellClass: "textAlignRight",
      //   name: t("labelBlindBoxEndTime"),
      //   formatter: ({ row }: FormatterProps<R>) => {
      //     return (
      //       <>
      //         {moment(row.rawData.luckyToken.nftExpireTime).format(
      //           YEAR_DAY_MINUTE_FORMAT
      //         )}
      //       </>
      //     );
      //   },
      // },
      {
        key: "Status",
        cellClass: "textAlignRight",
        headerCellClass: "textAlignRight",
        name: t("labelRecordStatus"),
        formatter: ({ row }: FormatterProps<R>) => {
          if (
            row.rawData.luckyToken.validUntil > Date.now() &&
            row.rawData.luckyToken.status !== sdk.LuckyTokenItemStatus.COMPLETED
          ) {
            return (
              <>
                {t("labelBlindBoxStartTime", {
                  time: moment(row.rawData.luckyToken.validUntil).format(
                    "YYYY.MM.DD HH:mm"
                  ),
                })}{" "}
              </>
            );
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.OPENED) {
            return <>{t("labelBlindBoxOpend")}</>;
            // return <Box height={"100%"} display={"flex"} flexDirection={"column"} alignItems={"end"} justifyContent={"center"}>
            //   <Typography>{t("labelBlindBoxOpend")}</Typography>
            //   {/* <Typography>x {row.rawData.claim.amount}</Typography> */}
            // </Box>
          } else if (row.rawData.claim.status === sdk.BlindBoxStatus.EXPIRED) {
            return <>{t("labelBlindBoxExpired")}</>;
          } else if (
            row.rawData.claim.status === sdk.BlindBoxStatus.NOT_OPENED
          ) {
            return (
              <Box display={"flex"} flexDirection={"column"} alignItems={"end"}>
                <Button size={"small"} onClick={(e) => {}} variant={"text"}>
                  {t("labelRedPacketOpen", { ns: "common" })}
                </Button>
                <Typography>
                  {t("labelBlindBoxExpiredTime", {
                    time: moment(row.rawData.luckyToken.nftExpireTime).format(
                      "YYYY.MM.DD HH:mm"
                    ),
                  })}
                </Typography>
              </Box>
            );
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
          currentheight={RowConfig.rowHeaderHeight + rawData.length * RowHeight}
          rowHeight={RowHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row.rawData, {
              offset: (page - 1) * (pagination?.pageSize ?? 10),
              limit: pagination?.pageSize ?? 10,
              filter: {
                statuses: showActionableRecords
                  ? [0] // 0 is for sdk.BlindBoxStatus.NOT_OPENED
                  : undefined,
              },
            });
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
