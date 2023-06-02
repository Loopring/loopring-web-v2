import _ from "lodash";
import { WithTranslation, withTranslation } from "react-i18next";
import { useSettings } from "../../../stores";
import React from "react";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  HiddenTag,
  RowInvestConfig,
} from "@loopring-web/common-resources";
import {
  Column,
  ModalCloseButton,
  Table,
  TablePagination,
} from "../../basic-lib";
import * as sdk from "@loopring-web/loopring-sdk";

import { Box, BoxProps, Modal, Typography } from "@mui/material";
import { SwitchPanelStyled, TablePaddingX } from "../../styled";
import styled from "@emotion/styled";
import { FormatterProps } from "react-data-grid";
import {
  DefiSideStakingTableProps,
  RawDataDefiSideStakingItem,
} from "./Interface";
import { ConfirmStackingRedeem, DeFiSideDetail } from "../../tradePanel";
import ActionMemo from "./components/ActionMemo";
import moment from "moment";

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 14% auto 16% 16% 11% 10% 160px !important;`
        : `--template-columns: 24% auto auto 8% !important;`}
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
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element;
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.ispro === "pro") {
        return "620px";
      }
      if (props.currentheight) {
        return props.currentheight + "px";
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
export const DefiStakingTable = withTranslation(["tables", "common"])(
  <R extends RawDataDefiSideStakingItem>(
    props: DefiSideStakingTableProps<R> & WithTranslation
  ) => {
    const {
      rawData,
      idIndex,
      pagination,
      tokenMap,
      geDefiSideStakingList,
      showloading,
      // onDetailClick,
      redeemItemClick: _redeemItemClick,
      hideAssets,
      t,
    } = props;
    const [openDetail, setOpenDetail] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [detail, setDetail] = React.useState<R | undefined>(undefined);
    const { isMobile } = useSettings();
    const [page, setPage] = React.useState(1);
    const redeemItemClick = (item: R) => {
      setDetail(item);
      const requiredHoldDay = (item.claimableTime - item.stakeAt) / 86400000;
      const holdDay = moment(Date.now()).diff(
        moment(new Date(item.stakeAt ?? ""))
          .utc()
          .startOf("days"),
        "days",
        false
      );
      if (requiredHoldDay > holdDay) {
        setOpenAlert(true);
      } else {
        setOpenDetail(false);
        _redeemItemClick(item);
      }
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
        geDefiSideStakingList({
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

    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Product",
          sortable: false,
          width: "auto",
          name: t("labelDefiStakingProduct"),
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          formatter: ({ row }) => {
            return (
              <Typography
                component={"span"}
                flexDirection={"row"}
                display={"flex"}
                height={"100%"}
                alignItems={"center"}
              >
                {row.productId}
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
          name: t("labelDefiStakingFrozen"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            const tokenInfo = tokenMap[idIndex[row.tokenId ?? ""]];
            const amountStr =
              row.remainAmount && row.remainAmount !== "0"
                ? hideAssets
                  ? HiddenTag
                  : getValuePrecisionThousand(
                      sdk
                        .toBig(row.remainAmount)
                        .div("1e" + tokenInfo.decimals),
                      tokenInfo.precision,
                      tokenInfo.precision,
                      undefined,
                      false,
                      {
                        floor: false,
                        // isTrade: true,
                      }
                    ) +
                    " " +
                    tokenInfo.symbol
                : EmptyValueTag;

            return <> {amountStr}</>;
          },
        },
        {
          key: "Earn",
          sortable: false,
          width: "auto",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDefiStakingEarn"),
          formatter: ({ row }) => {
            const tokenInfo = tokenMap[idIndex[row.tokenId ?? ""]];
            const amountStr =
              row.totalRewards && row.totalRewards !== "0"
                ? hideAssets
                  ? HiddenTag
                  : getValuePrecisionThousand(
                      sdk
                        .toBig(row.totalRewards)
                        .div("1e" + tokenInfo.decimals),
                      tokenInfo.precision,
                      tokenInfo.precision,
                      undefined,
                      false,
                      {
                        floor: false,
                        // isTrade: true,
                      }
                    ) +
                    " " +
                    tokenInfo.symbol
                : EmptyValueTag;
            return <> {amountStr}</>;
          },
        },
        {
          key: "PreviousEarn",
          sortable: false,
          width: "auto",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDefiStakingPreviousEarn"),
          formatter: ({ row }) => {
            const tokenInfo = tokenMap[idIndex[row.tokenId ?? ""]];
            const amountStr =
              row.lastDayPendingRewards && row.lastDayPendingRewards !== "0"
                ? hideAssets
                  ? HiddenTag
                  : getValuePrecisionThousand(
                      sdk
                        .toBig(row.lastDayPendingRewards)
                        .div("1e" + tokenInfo.decimals),
                      tokenInfo.precision,
                      tokenInfo.precision,
                      undefined,
                      false,
                      {
                        floor: false,
                        // isTrade: true,
                      }
                    ) +
                    " " +
                    tokenInfo.symbol
                : EmptyValueTag;
            return <> {amountStr}</>;
          },
        },
        {
          key: "Duration",
          sortable: false,
          width: "auto",
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          name: t("labelDefiStakingDuration"),
          formatter: ({ row }) => {
            const diff = moment(Date.now()).diff(
              moment(new Date(row.stakeAt ?? ""))
                .utc()
                .startOf("days"),
              "days",
              false
            );
            return (
              <>
                {diff
                  ? diff + " " + t("labelDays")
                  : "< 1" + " " + t("labelDays")}
              </>
            );
          },
        },
        {
          key: "APR",
          sortable: false,
          width: "auto",
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelDefiStakingARR"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            return (
              <>
                {row.apr && row.apr !== "0.00" ? row.apr + "%" : EmptyValueTag}
              </>
            );
          },
        },
        {
          key: "StakingAction",
          sortable: false,
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelDefiStakingAction"),
          formatter: ({ row }) => {
            return (
              <ActionMemo
                {...{
                  item: row,
                  redeemItemClick,
                  onDetailClick: (item: R) => {
                    setDetail(item);
                    setOpenDetail(item as any);
                  },
                }}
              />
            );
          },
        },
      ],
      [t, tokenMap, idIndex, hideAssets]
    );

    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: "Product",
          sortable: false,
          width: "auto",
          name:
            t("labelDefiStakingProduct") + "/" + t("labelDefiStakingFrozen"),
          cellClass: "textAlignLeft",
          headerCellClass: "textAlignLeft",
          formatter: ({ row }) => {
            const tokenInfo = tokenMap[idIndex[row.tokenId ?? ""]];
            const amountStr =
              row.remainAmount && row.remainAmount !== "0"
                ? (hideAssets
                    ? HiddenTag
                    : getValuePrecisionThousand(
                        sdk
                          .toBig(row.remainAmount)
                          .div("1e" + tokenInfo.decimals),
                        tokenInfo.precision,
                        tokenInfo.precision,
                        undefined,
                        false,
                        {
                          floor: false,
                          // isTrade: true,
                        }
                      )) +
                  " " +
                  tokenInfo.symbol
                : EmptyValueTag;

            return (
              <Typography
                component={"span"}
                flexDirection={"column"}
                display={"flex"}
                height={"100%"}
                alignItems={"center"}
              >
                <Typography color={"textPrimary"} variant={"body1"}>
                  {amountStr}
                </Typography>
                <Typography color={"textSecondary"} variant={"body2"}>
                  {row.productId}
                </Typography>
              </Typography>
            );
          },
        },
        {
          key: "Earn",
          sortable: false,
          width: "auto",
          cellClass: "textAlignCenter",
          headerCellClass: "textAlignCenter",
          name: t("labelDefiStakingAndPreviousEarn"),
          formatter: ({ row }) => {
            const tokenInfo = tokenMap[idIndex[row.tokenId ?? ""]];
            const amountStr =
              row.lastDayPendingRewards && row.lastDayPendingRewards !== "0"
                ? hideAssets
                  ? HiddenTag
                  : getValuePrecisionThousand(
                      sdk
                        .toBig(row.lastDayPendingRewards)
                        .div("1e" + tokenInfo.decimals),
                      tokenInfo.precision,
                      tokenInfo.precision,
                      undefined,
                      false,
                      {
                        floor: false,
                        // isTrade: true,
                      }
                    )
                : EmptyValueTag;
            const amountPreviousEarnStr =
              row.totalRewards && row.totalRewards != "0"
                ? (hideAssets
                    ? HiddenTag
                    : getValuePrecisionThousand(
                        sdk
                          .toBig(row.totalRewards)
                          .div("1e" + tokenInfo.decimals),
                        tokenInfo.precision,
                        tokenInfo.precision,
                        undefined,
                        false,
                        {
                          floor: false,
                          // isTrade: true,
                        }
                      )) +
                  " " +
                  tokenInfo.symbol
                : EmptyValueTag;
            return <>{amountStr + "/" + amountPreviousEarnStr}</>;
          },
        },
        {
          key: "APR",
          sortable: false,
          width: "auto",
          headerCellClass: "textAlignRight",
          cellClass: "textAlignRight",
          name: t("labelDefiStakingDuration") + "/" + t("labelDefiStakingARR"),
          formatter: ({ row }) => {
            const diff = moment(Date.now()).diff(
              moment(new Date(row.stakeAt ?? ""))
                .utc()
                .startOf("days"),
              "days",
              false
            );
            return (
              <Typography component={"span"} textAlign={"right"}>
                {diff
                  ? diff + " " + t("labelDays")
                  : "< 1" + " " + t("labelDays") + "/"}
                {row.apr && row.apr !== "0.00" && Number(row.apr) !== 0
                  ? row.apr + "%"
                  : EmptyValueTag}
              </Typography>
            );
          },
        },
        {
          key: "StakingAction",
          sortable: false,
          cellClass: "textAlignRight",
          headerCellClass: "textAlignRight",
          name: t("labelDefiStakingAction"),
          formatter: ({ row }: FormatterProps<R, unknown>) => {
            //onDetailClick
            return (
              <ActionMemo
                {...{
                  item: row,
                  redeemItemClick,
                  onDetailClick: (item: R) => {
                    setDetail(item);
                    setOpenDetail(item as any);
                  },
                }}
              />
            );
          },
        },
      ],
      [t, tokenMap, idIndex]
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
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={
            RowInvestConfig.rowHeaderHeight +
            rawData.length * RowInvestConfig.rowHeight
          }
          rowHeight={RowInvestConfig.rowHeight}
          headerRowHeight={RowInvestConfig.rowHeaderHeight}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,
            rawData,
            showloading,
          }}
        />
        {!!(pagination && pagination.total > pagination.pageSize) && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
        <Modal
          open={openDetail}
          onClose={(_e: any) => setOpenDetail(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled width={"var(--modal-width)"}>
            <ModalCloseButton
              onClose={(_e: any) => setOpenDetail(false)}
              t={t}
            />
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
                  {t("labelDeFiSideInvestmentDetails", {
                    ns: "common",
                    symbol: "LRC",
                  })}
                </Typography>
                <DeFiSideDetail
                  tokenSell={tokenMap[idIndex[detail.tokenId]]}
                  order={{ ...detail }}
                  onRedeem={redeemItemClick as any}
                />
              </Box>
            )}
          </SwitchPanelStyled>
        </Modal>
        <ConfirmStackingRedeem
          open={openAlert}
          handleClose={(_, isAgree?: boolean) => {
            setOpenAlert(false);
            if (isAgree) {
              _redeemItemClick(detail as any);
            }
          }}
        />
      </TableWrapperStyled>
    );
  }
);
