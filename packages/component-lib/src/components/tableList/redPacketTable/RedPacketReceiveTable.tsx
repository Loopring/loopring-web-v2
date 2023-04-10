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
  CoinInfo,
  globalSetup,
  myLog,
  RowConfig,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
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
const TableStyled = styled(Table)<{ isNFT: boolean }>`
  &.rdg {
    --template-columns: ${({ isNFT }) =>
      isNFT
        ? "20% 7% auto 12% 10% 15% 10% !important"
        : "20% 20% 30% auto auto !important"};

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
    const {
      tokenType,
      getRedPacketReceiveList,
      pagination,
      rawData,
      showloading,
      t,
      onItemClick,
      onClaimItem,
    } = props;
    // const { isMobile, upColor } = useSettings();
    const history = useHistory();
    const [page, setPage] = React.useState(1);

    const updateData = _.debounce(async ({ page = 1, filter = {} }: any) => {
      await getRedPacketReceiveList({
        offset: (page - 1) * (pagination?.pageSize ?? 10),
        limit: pagination?.pageSize ?? 10,
        filter,
      });
    }, globalSetup.wait);

    const handlePageChange = React.useCallback(
      ({ page = 1 }: any) => {
        setPage(page);
        myLog("RedPacket Receive page,", page);
        updateData({
          page,
          filter: { isNft: tokenType === TokenType.nft },
        });
      },
      [updateData, tokenType]
    );
    React.useEffect(() => {
      updateData.cancel();
      handlePageChange({ page: 1 });
      // updateData({});
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize, tokenType]);
    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Token",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelToken"),
          formatter: ({ row: { token } }: FormatterProps<R, unknown>) => {
            if (token.type === TokenType.single) {
              const _token = token as CoinInfo<any> & { type: TokenType };
              return (
                <ColumnCoinDeep
                  token={{
                    ..._token,
                    name: "", // for not displaying name here
                  }}
                />
              );
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
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          sortable: true,
          name: t("labelAmount"),
          formatter: ({ row }: FormatterProps<R>) => {
            return <>{`${row.amount}`}</>;
          },
        },
        {
          key: "Type",
          sortable: false,
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
                  " — " +
                  t(`labelRedPacketViewType${row?.type?.scope ?? 0}`, {
                    ns: "common",
                  })}
              </>
            );
          },
        },
        {
          key: "Address",
          sortable: false,
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
          name: t("labelReceiveTime"),
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <>{moment(new Date(row.claimAt), "YYYYMMDDHHMM").fromNow()}</>
            );
          },
        },
        // ...[tokenType === TokenType.nft?]
        ...(tokenType === TokenType.nft
          ? [
              {
                key: "End Time",
                sortable: true,
                cellClass: "textAlignRight",
                headerCellClass: "textAlignRight",
                name: t("labelBlindBoxEndTime"),
                formatter: ({ row }: FormatterProps<R>) => {
                  return (
                    <>
                      {moment(
                        new Date(row.rawData.luckyToken.validUntil)
                      ).format(YEAR_DAY_MINUTE_FORMAT)}
                    </>
                  );
                },
              },
              {
                key: "Action",
                sortable: true,
                cellClass: "textAlignRight",
                headerCellClass: "textAlignRight",
                name: "Action",
                formatter: ({ row }: FormatterProps<R>) => {
                  if (
                    row.rawData.claim.status ===
                    sdk.ClaimRecordStatus.WAITING_CLAIM
                  ) {
                    return (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClaimItem(row.rawData);
                        }}
                      >
                        {t("labelBlindBoxCalim")}
                      </Button>
                    );
                  } else if (
                    row.rawData.claim.status === sdk.ClaimRecordStatus.EXPIRED
                  ) {
                    return <Box>{t("labelBlindBoxExpired")}</Box>;
                  } else if (
                    row.rawData.claim.status === sdk.ClaimRecordStatus.CLAIMED
                  ) {
                    return <Box>{t("labelBlindBoxClaimed")}</Box>;
                  } else {
                    return <></>;
                  }
                },
              },
            ]
          : []),
      ],
      [history, t, tokenType]
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
          isNFT={tokenType === TokenType.nft}
          currentheight={
            RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
          }
          rowHeight={RowConfig.rowHeight}
          onRowClick={(_index: number, row: R) => {
            onItemClick(row.rawData);
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
