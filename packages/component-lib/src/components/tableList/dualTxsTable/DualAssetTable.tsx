import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import {
  DualViewBase,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  RowConfig,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import {
  Column,
  ModalCloseButton,
  Table,
  TablePagination,
} from "../../basic-lib";
import { Box, BoxProps, Link, Modal, Typography } from "@mui/material";
import moment from "moment";
import { TablePaddingX, SwitchPanelStyled } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import { DualAssetTableProps, RawDataDualAssetItem } from "./Interface";
import { CoinIcons } from "../assetsTable";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";
import { DualDetail } from "../../tradePanel";
import BigNumber from "bignumber.js";
import { LoopringAPI } from "@loopring-web/core";

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (prosp: BoxProps & { isMobile: boolean }) => JSX.Element;
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      return props.currentheight + "px";
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

export const DualAssetTable = withTranslation(["tables", "common"])(
  <R extends RawDataDualAssetItem>(
    props: DualAssetTableProps<R> & WithTranslation
  ) => {
    const {
      rawData,
      pagination,
      getDualAssetList,
      idIndex,
      tokenMap,
      showloading,
      t,
    } = props;
    const [open, setOpen] = React.useState<boolean>(false);
    const [detail, setDetail] =
      React.useState<
        | {
            dualViewInfo: R;
            lessEarnTokenSymbol: string;
            greaterEarnTokenSymbol: string;
            lessEarnView: string;
            greaterEarnView: string;
          }
        | undefined
      >(undefined);

    const { isMobile, coinJson } = useSettings();
    const [page, setPage] = React.useState(1);
    const showDetail = async (item: R) => {
      const {
        sellSymbol,
        buySymbol,
        settleRatio,
        strike,
        __raw__: {
          order: {
            dualType,
            tokenInfoOrigin: { base, quote, amountIn, amountOut },
            // timeOrigin: { settlementTime },
          },
        },
      } = item;
      const {
        dualPrice: { index },
      } = await LoopringAPI.defiAPI?.getDualIndex({
        baseSymbol: base,
        quoteSymbol: quote,
      });
      item.currentPrice.currentPrice = index;
      const lessEarnTokenSymbol = base; //isUp ? sellSymbol : buySymbol;
      const greaterEarnTokenSymbol = quote; //isUp ? buySymbol : sellSymbol;
      let lessEarnVol, greaterEarnVol;
      const sellAmount = sdk
        .toBig(amountIn ? amountIn : 0)
        .div("1e" + tokenMap[sellSymbol].decimals);
      if (dualType === sdk.DUAL_TYPE.DUAL_BASE) {
        lessEarnVol = sdk.toBig(settleRatio).plus(1).times(amountIn); //dualViewInfo.strike);
        greaterEarnVol = sdk
          .toBig(
            sdk
              .toBig(settleRatio)
              .plus(1)
              .times(sellAmount ? sellAmount : 0)
              .times(strike)
              .toFixed(tokenMap[buySymbol].precision, BigNumber.ROUND_CEIL)
          )
          .times("1e" + tokenMap[buySymbol].decimals);
      } else {
        lessEarnVol = sdk
          .toBig(
            sdk
              .toBig(settleRatio)
              .plus(1)
              .times(sellAmount ? sellAmount : 0)
              // .times(1 + info.ratio)
              .div(strike)
              .toFixed(tokenMap[buySymbol].precision, BigNumber.ROUND_CEIL)
          )
          .times("1e" + tokenMap[buySymbol].decimals);

        // sellVol.times(1 + info.ratio).div(dualViewInfo.strike); //.times(1 + dualViewInfo.settleRatio);
        greaterEarnVol = sdk.toBig(settleRatio).plus(1).times(amountIn);
      }
      const lessEarnView =
        amountIn && amountOut
          ? getValuePrecisionThousand(
              sdk.toBig(lessEarnVol).div("1e" + tokenMap[base].decimals),
              tokenMap[base].precision,
              tokenMap[base].precision,
              tokenMap[base].precision,
              false,
              { floor: true }
            )
          : EmptyValueTag;
      const greaterEarnView =
        amountIn && amountOut
          ? getValuePrecisionThousand(
              sdk.toBig(greaterEarnVol).div("1e" + tokenMap[quote].decimals),
              tokenMap[quote].precision,
              tokenMap[quote].precision,
              tokenMap[quote].precision,
              false,
              { floor: true }
            )
          : EmptyValueTag;

      const amount = getValuePrecisionThousand(
        sellAmount,
        tokenMap[sellSymbol].precision,
        tokenMap[sellSymbol].precision,
        tokenMap[sellSymbol].precision,
        false
      );
      setOpen(true);

      setDetail({
        dualViewInfo: {
          ...item,
          amount: amount + " " + sellSymbol,
        },
        lessEarnTokenSymbol,
        greaterEarnTokenSymbol,
        lessEarnView,
        greaterEarnView,
      });
    };
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
        getDualAssetList({
          limit: pageSize,
          offset: (currPage - 1) * pageSize,
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
    const getColumnMode = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Product",
          sortable: false,
          width: "auto",
          name: t("labelDualAssetProduct"),
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                component={"span"}
                flexDirection={"row"}
                display={"flex"}
                height={"100%"}
                alignItems={"center"}
              >
                <Typography component={"span"} display={"inline-flex"}>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <CoinIcons
                    type={"dual"}
                    size={24}
                    tokenIcon={[
                      coinJson[row.sellSymbol],
                      coinJson[row.buySymbol],
                    ]}
                  />
                </Typography>
                <Typography
                  component={"span"}
                  flexDirection={"column"}
                  display={"flex"}
                >
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    color={"textPrimary"}
                  >
                    {`${row.sellSymbol}/${row.buySymbol}`}
                  </Typography>
                </Typography>
              </Typography>
            );
          },
        },
        {
          key: "Frozen",
          sortable: false,
          width: "auto",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDualAssetFrozen"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.amount + " " + row.buySymbol}</>;
          },
        },
        {
          key: "Price",
          sortable: false,
          width: "auto",
          name: t("labelDualAssetPrice"),
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.strike}</>;
          },
        },
        {
          key: "Settlement_Date",
          sortable: true,
          width: "auto",
          name: t("labelDualAssetSettlement_Date"),
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {moment(new Date(row.expireTime)).format(
                  YEAR_DAY_MINUTE_FORMAT
                )}
              </>
            );
          },
        },
        {
          key: "APR",
          sortable: true,
          width: "auto",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDualAssetAPR"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.apy}</>;
          },
        },
        {
          key: "Action",
          sortable: false,
          width: "auto",
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelDualAssetAction"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Link onClick={(_e) => showDetail(row)}>
                {t("labelDualAssetDetail")}
              </Link>
            );
          },
        },
      ],
      [coinJson, t]
    );

    const getColumnMobile = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Product",
          sortable: false,
          width: "auto",
          name: t("labelDualAssetProduct"),
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Typography
                component={"span"}
                flexDirection={"row"}
                display={"flex"}
                height={"100%"}
                alignItems={"center"}
              >
                <Typography component={"span"} display={"inline-flex"}>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <CoinIcons
                    type={"dual"}
                    size={24}
                    tokenIcon={[
                      coinJson[row.sellSymbol],
                      coinJson[row.buySymbol],
                    ]}
                  />
                </Typography>
                <Typography
                  component={"span"}
                  flexDirection={"column"}
                  display={"flex"}
                >
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    color={"textPrimary"}
                  >
                    {`${row.sellSymbol}/${row.buySymbol}`}
                  </Typography>
                </Typography>
              </Typography>
            );
          },
        },
        {
          key: "Frozen",

          sortable: false,
          width: "auto",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDualFrozen"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.amount + " " + row.buySymbol}</>;
          },
        },
        {
          key: "Price",
          sortable: false,
          width: "auto",
          name: t("labelDualAssetPrice"),
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.strike}</>;
          },
        },
        {
          key: "Settlement_Date",
          sortable: true,
          width: "auto",
          name: t("labelDualAssetSettlement_Date"),
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {moment(new Date(row.expireTime)).format(
                  YEAR_DAY_MINUTE_FORMAT
                )}
              </>
            );
          },
        },
        {
          key: "APR",
          sortable: true,
          width: "auto",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDualAssetAPR"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return <>{row?.apy}</>;
          },
        },
        {
          key: "Action",
          sortable: false,
          width: "auto",
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelDualAssetAction"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <Link onClick={(_e) => showDetail(row)}>
                {t("labelDualAssetDetail")}
              </Link>
            );
          },
        },
      ],
      [t, tokenMap, idIndex]
    );

    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let _dualList: R[] = [];
        switch (sortColumn) {
          case "Settlement_Date":
            _dualList = rawData.sort((a, b) => {
              return b.expireTime - a.expireTime;
            });
            break;

          case "APR":
            _dualList = rawData.sort((a, b) => {
              const replaced = new RegExp(`[\\${sdk.SEP},%]`);
              const valueA = a.apy?.replace(replaced, "") ?? 0;
              const valueB = b.apy?.replace(replaced, "") ?? 0;
              return Number(valueB) - Number(valueA);
            });
            break;
          default:
            _dualList = rawData;
        }
        // resetTableData(_dualList)
        return _dualList;
      },
      [rawData]
    );
    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobile() : getColumnMode(),
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
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={
            RowConfig.rowHeaderHeight + rawData.length * RowConfig.rowHeight
          }
          sortMethod={sortMethod}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,
            rawData,
            showloading,
          }}
        />
        {pagination && pagination.total > pagination.pageSize && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
        <Modal
          open={open}
          onClose={(_e: any) => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled width={"var(--modal-width)"}>
            <ModalCloseButton onClose={(_e: any) => setOpen(false)} t={t} />
            {detail && (
              <Box
                flex={1}
                paddingY={2}
                width={"100%"}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  marginTop={-4}
                  textAlign={"center"}
                  paddingBottom={2}
                >
                  {t("labelDuaInvestmentDetails", { ns: "common" })}
                </Typography>
                <DualDetail
                  isOrder={true}
                  dualViewInfo={detail.dualViewInfo as DualViewBase}
                  currentPrice={detail.dualViewInfo.currentPrice}
                  tokenMap={tokenMap}
                  lessEarnTokenSymbol={detail.lessEarnTokenSymbol}
                  greaterEarnTokenSymbol={detail.greaterEarnTokenSymbol}
                  lessEarnView={detail.lessEarnView}
                  greaterEarnView={detail.greaterEarnView}
                />
              </Box>
            )}
          </SwitchPanelStyled>
        </Modal>
      </TableWrapperStyled>
    );
  }
);
