import _ from "lodash";
import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import {
  DirectionTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
} from "@loopring-web/common-resources";
import { Column, Table, TablePagination } from "../../basic-lib";
import { Box, BoxProps, Typography } from "@mui/material";
import moment from "moment";
import { RawDataDefiTxsItem } from "./Interface";
import { TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import * as sdk from "@loopring-web/loopring-sdk";

// export type TxsFilterProps = {
//   tokenSymbol?: string;
//   start?: number;
//   end?: number;
//   offset?: number;
//   limit?: number;
//   types?: sdk.UserTxTypes[] | string;
// };
// const TYPE_COLOR_MAPPING = [
//   { type: TransactionStatus.processed, color: "success" },
//   { type: TransactionStatus.processing, color: "warning" },
//   { type: TransactionStatus.received, color: "warning" },
//   { type: TransactionStatus.failed, color: "error" },
// ];
// const CellStatus = ({ row }: any) => {
//   const status = row["status"];
//   const RenderValue = styled.div`
//     display: flex;
//     align-items: center;
//     color: ${({ theme }) =>
//       theme.colorBase[
//         `${TYPE_COLOR_MAPPING.find((o) => o.type === status)?.color}`
//       ]};
//
//     & svg {
//       width: 24px;
//       height: 24px;
//     }
//   `;
//   const svg =
//     status === "processed" ? (
//       <CompleteIcon />
//     ) : status === "processing" || status === "received" ? (
//       <WaitingIcon />
//     ) : (
//       <WarningIcon />
//     );
//   return <RenderValue>{svg}</RenderValue>;
// };
// const MemoCellStyled = styled(Box)`
//   max-width: 100px;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
//   text-align: right;
// `;

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 40% 20% auto !important;`
        : `--template-columns: 60% 40% !important;`}
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

export interface DefiTxsTableProps<R = RawDataDefiTxsItem> {
  // etherscanBaseUrl?: string;
  rawData: R[];
  pagination?: {
    pageSize: number;
    total: number;
  };
  idIndex: { [key: string]: string };
  tokenMap: { [key: string]: any };

  getDefiTxList: (props: any) => Promise<void>;
  // filterTokens: string[];
  // showFilter?: boolean;
  showloading: boolean;
  // accAddress: string;
  // accountId: number;
}
export const DefiTXsTable = withTranslation(["tables", "common"])(
  <R extends RawDataDefiTxsItem>(
    props: DefiTxsTableProps<R> & WithTranslation
  ) => {
    const {
      rawData,
      idIndex,
      pagination,
      tokenMap,
      // showFilter,
      getDefiTxList,
      // filterTokens,
      showloading,
      // etherscanBaseUrl,
      // accAddress,
      // accountId,
      t,
    } = props;
    const { isMobile } = useSettings();
    // const { search } = useLocation();
    // const searchParams = new URLSearchParams(search);
    const [page, setPage] = React.useState(1);
    // const [filterToken, setFilterToken] = React.useState<string>("all");

    const updateData = _.debounce(
      ({
        // tableType,
        currPage = page,
        pageSize = pagination?.pageSize ?? 10,
      }: {
        // tableType: TableType;
        currPage?: number;
        pageSize?: number;
      }) => {
        // if (tableType === "filter") {
        //   currPage = 1;
        //   setPage(1);
        // }
        // const tokenSymbol = currFilterToken === "all" ? "" : currFilterToken;
        // const formattedType = currFilterType.toUpperCase();
        // const start = Number(moment(currFilterDate[0]).format("x"));
        // const end = Number(moment(currFilterDate[1]).format("x"));
        getDefiTxList({
          limit: pageSize,
          offset: (currPage - 1) * pageSize,
          // types,
          // tokenSymbol: tokenSymbol,
          // start: Number.isNaN(start) ? -1 : start,
          // end: Number.isNaN(end) ? -1 : end,
        });
      },
      globalSetup.wait
    );

    const handlePageChange = React.useCallback(
      (currPage: number) => {
        if (currPage === page) return;
        setPage(currPage);
        updateData({ currPage: currPage });
      },
      [updateData, page]
    );

    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "style",
          sortable: false,
          width: "auto",
          minWidth: 240,
          name: t("labelAmmTableType"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const { action, sellToken, buyToken } = row;
            const isJoin = !new RegExp(sdk.DefiAction.Withdraw, "ig").test(
              action ?? " "
            );
            const sellTokenInfo =
              sellToken?.tokenId !== undefined &&
              tokenMap[idIndex[sellToken?.tokenId]];
            const sellVolume = sdk
              .toBig(sellToken?.volume ?? 0)
              .div("1e" + sellTokenInfo.decimals);
            const buyTokenInfo =
              buyToken?.tokenId !== undefined &&
              tokenMap[idIndex[buyToken?.tokenId]];
            const buyVolume = sdk
              .toBig(buyToken?.volume ?? 0)
              .div("1e" + buyTokenInfo.decimals);
            const side = isJoin ? t("labelDefiJoin") : t("labelDefiExit");
            return (
              <Box display={"flex"} alignItems={"center"}>
                <Typography
                  color={isJoin ? "var(--color-success)" : "var(--color-error)"}
                >
                  {side}
                </Typography>
                &nbsp;&nbsp;
                <Typography component={"span"}>
                  {`${getValuePrecisionThousand(
                    sellVolume,
                    sellTokenInfo?.precision,
                    sellTokenInfo?.precision,
                    sellTokenInfo?.precision,
                    false,
                    { isTrade: true, floor: false }
                  )} ${sellTokenInfo.symbol}`}
                </Typography>
                &nbsp;{DirectionTag} &nbsp;
                <Typography component={"span"}>
                  {`${getValuePrecisionThousand(
                    buyVolume,
                    buyTokenInfo?.precision,
                    buyTokenInfo?.precision,
                    buyTokenInfo?.precision,
                    false,
                    { isTrade: true, floor: false }
                  )} ${buyTokenInfo.symbol}`}
                </Typography>
              </Box>
            );
          },
        },
        {
          key: "fee",
          name: t("labelTxFee"),
          headerCellClass: "textAlignRight",
          formatter: ({ row }) => {
            const { fee } = row;
            const feeTokenInfo = tokenMap[idIndex[fee?.tokenId ?? ""]];
            const feeVolume = sdk
              .toBig(fee?.volume ?? 0)
              .div("1e" + feeTokenInfo.decimals)
              .toNumber();
            const renderValue =
              feeVolume === 0 || feeVolume === undefined
                ? EmptyValueTag
                : `${getValuePrecisionThousand(
                    feeVolume,
                    feeTokenInfo?.precision,
                    feeTokenInfo?.precision,
                    feeTokenInfo?.precision,
                    false,
                    { isTrade: true, floor: false }
                  )} ${feeTokenInfo.symbol}`;
            return (
              <Box className="rdg-cell-value textAlignRight">{renderValue}</Box>
            );
          },
        },
        // {
        //   key: "status",
        //   name: t("labelTxFee"),
        //   headerCellClass: "textAlignRight",
        //   formatter: ({ row }) => {
        //     const fee = row.fee;
        //     const feeTokenInfo = tokenMap[idIndex[fee?.tokenId]];
        //     const feeVolume = sdk
        //       .toBig(fee?.volume ?? 0)
        //       .div("1e" + feeTokenInfo.decimals);
        //     const renderValue =
        //       fee.value === 0 || fee.value === undefined
        //         ? EmptyValueTag
        //         : `${getValuePrecisionThousand(
        //             feeVolume,
        //             feeTokenInfo?.precision,
        //             feeTokenInfo?.precision,
        //             feeTokenInfo?.precision,
        //             false,
        //             { isTrade: true, floor: false }
        //           )} ${feeTokenInfo.name}`;
        //     return (
        //       <Box className="rdg-cell-value textAlignRight">{renderValue}</Box>
        //     );
        //   },
        // },
        {
          key: "time",
          sortable: false,
          width: "auto",
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          name: t("labelAmmTime"),
          formatter: ({ row }) => {
            const { updatedAt: time } = row;
            let timeString;
            if (typeof time === "undefined") {
              timeString = EmptyValueTag;
            } else {
              timeString = moment(new Date(time), "YYYYMMDDHHMM").fromNow();
            }
            return (
              <Typography component={"span"} textAlign={"right"}>
                {timeString}
              </Typography>
            );
          },
        },
      ],
      [t, tokenMap, idIndex]
    );

    // const [isDropDown, setIsDropDown] = React.useState(true);

    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnModeTransaction()
        : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<any, unknown>[],
    };
    React.useEffect(() => {
      // let filters: any = {};
      updateData.cancel();
      updateData({ currPage: 1 });
      // handlePageChange(1);
      // if (searchParams.get("types")) {
      //   filters.type = searchParams.get("types");
      // }
      // handleFilterChange(filters);
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);

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
        {pagination && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    );
  }
);
