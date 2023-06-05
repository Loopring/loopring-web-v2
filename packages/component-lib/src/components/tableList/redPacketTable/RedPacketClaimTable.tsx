import styled from "@emotion/styled";
import { Box, Link, Typography } from "@mui/material";
import { TablePaddingX } from "../../styled";
import { Column, NftImage, Table, TablePagination } from "../../basic-lib";
import { WithTranslation, withTranslation } from "react-i18next";

import {
  RawDataNFTRedPacketClaimItem,
  RawDataRedPacketClaimItem,
  RedPacketClaimTableProps,
} from "./Interface";
import { useHistory } from "react-router-dom";
import { useSettings } from "../../../stores";
import React from "react";
import { FormatterProps } from "react-data-grid";
import {
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  HiddenTag,
  myLog,
  PriceTag,
  RowConfig,
  TokenType,
} from "@loopring-web/common-resources";
import { ColumnCoinDeep } from "../assetsTable";
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
  <R extends RawDataRedPacketClaimItem | RawDataNFTRedPacketClaimItem>(
    props: RedPacketClaimTableProps<R> & WithTranslation
  ) => {
    const {
      rawData,
      forexMap,
      showloading,
      onItemClick,
      onViewMoreNFTsClick,
      getClaimRedPacket,
      pagination,
      page,
      isNFT = false,
      totalLuckyTokenNFTBalance,
      hideAssets,
      t,
    } = props;
    const history = useHistory();
    const { currency } = useSettings();
    const updateData = _.debounce(async ({ page = 1 }: any) => {
      await getClaimRedPacket({
        offset: (page - 1) * (pagination?.pageSize ?? 10),
        limit: pagination?.pageSize ?? 10,
      });
    }, globalSetup.wait);

    const handlePageChange = React.useCallback(
      ({ page = 1 }: any) => {
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
      // updateData({});
      return () => {
        updateData.cancel();
      };
    }, []);
    const getColumnModeTransaction = React.useCallback((): Column<
      R,
      unknown
    >[] => {
      return [
        {
          key: "Token",
          sortable: true,
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          name: t("labelToken"),
          formatter: ({ row: { token } }: FormatterProps<R>) => {
            // if (token.)
            if (token.type !== TokenType.nft) {
              if (token.icon && token.simpleName === "NFTs") {
                return (
                  <Box
                    className="rdg-cell-value"
                    height={"100%"}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      // style={{ background: "var(--field-opacity)" }}
                    >
                      <NftImage
                        alt={token.simpleName}
                        onError={() => undefined}
                        src={token.icon}
                      />
                    </Box>
                    <Typography
                      color={"inherit"}
                      flex={1}
                      display={"inline-flex"}
                      alignItems={"center"}
                      marginLeft={1}
                      overflow={"hidden"}
                      textOverflow={"ellipsis"}
                      component={"span"}
                    >
                      {token.simpleName}
                    </Typography>
                  </Box>
                );
              } else {
                return (
                  <ColumnCoinDeep
                    isNotRequiredName={true}
                    token={token as any}
                  />
                );
              }
            } else {
              return <></>;
            }
          },
        },
        {
          key: "Amount",
          sortable: true,
          name: t("labelAmount"),
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <Box display={"flex"}>
                {hideAssets ? HiddenTag : row.amountStr}
              </Box>
            );
          },
        },
        {
          key: "Value",
          sortable: true,
          name: t("labelValue"),
          formatter: ({ row }: FormatterProps<R>) => {
            return (
              <Box display="flex">
                {row.volume !== undefined
                  ? hideAssets
                    ? HiddenTag
                    : PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        (row.volume || 0) * (forexMap[currency] ?? 0),
                        2,
                        2,
                        2,
                        true,
                        { isFait: true }
                      )
                  : EmptyValueTag}
              </Box>
            );
          },
        },
        {
          key: "Actions",
          name: t("labelActions"),
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          formatter: ({ row }) => {
            if (
              row.token.type === TokenType.single &&
              row.token.name === "NFTs"
            ) {
              return (
                <Link onClick={() => onViewMoreNFTsClick!()}>View More</Link>
              );
            } else {
              return (
                <Link onClick={() => onItemClick(row.rawData)}>
                  {t("labelClaim")}
                </Link>
              );
            }
          },
        },
      ];
    }, [history, t, hideAssets]);

    const NFTrow = {
      token: {
        icon: "https://static.loopring.io/assets/svg/NFT-logo.svg",
        name: "NFTs",
        simpleName: "NFTs",
        description: "ETH",
        company: "Ethereum",
        type: TokenType.single,
      },
      amountStr: totalLuckyTokenNFTBalance
        ? totalLuckyTokenNFTBalance.toString()
        : EmptyValueTag,
      volume: undefined,
    };
    const defaultArgs: any = {
      columnMode: getColumnModeTransaction(),
      generateRows: (rawData: any) => [
        ...(isNFT ? [] : [NFTrow]), // if isNFT then not show nft row, else shows.
        ...rawData,
      ],
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };
    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let resultRows: R[] = [];
        switch (sortColumn) {
          case "Token":
            resultRows = rawData.sort((a: R, b: R) => {
              if (a.token.type == TokenType.nft) {
                return (a.token as any)?.metadata?.base?.name?.localeCompare(
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
              return a.amountStr.localeCompare(b.amountStr);
            });
            break;
          case "Value":
            resultRows = rawData.sort((a: R, b: R) => {
              return b.volume - a.volume;
            });
            break;
          default:
        }
        return resultRows;
      },
      [rawData]
    );

    return (
      <TableWrapperStyled>
        <TableStyled
          currentheight={
            pagination
              ? undefined
              : RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
          }
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.rowHeaderHeight}
          onRowClick={(_index: number, row: R) => {
            const isNFTs =
              row.token.type === TokenType.single && row.token.name === "NFTs";
            if (!isNFTs) {
              onItemClick(row.rawData);
            }
          }}
          sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,

            rawData,
            showloading,
          }}
        />
        {!!(pagination && pagination.total && page !== undefined) && (
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
