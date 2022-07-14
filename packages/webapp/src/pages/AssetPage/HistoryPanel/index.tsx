import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Tab, Tabs } from "@mui/material";
import {
  AmmTable,
  Button,
  OrderHistoryTable,
  Toast,
  TradeTable,
  TransactionTable,
} from "@loopring-web/component-lib";
import { StylePaper, useGetOrderHistorys } from "@loopring-web/core";
import { useGetAmmRecord, useGetTrades, useGetTxs } from "./hooks";

import {
  TOAST_TIME,
  useSystem,
  useAccount,
  useToast,
  useTokenMap,
  useAmmMap,
} from "@loopring-web/core";
import { BackIcon, RowConfig } from "@loopring-web/common-resources";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { useOrderList } from "../../Layer2Page/OrderPanel/hook";

enum TabIndex {
  transactions = "transactions",
  trades = "trades",
  ammRecords = "ammRecords",
  orderOpenTable = "orderOpenTable",
  orderHistoryTable = "orderHistoryTable",
}
const HistoryPanel = withTranslation("common")(
  (rest: WithTranslation<"common">) => {
    const history = useHistory();
    const { search } = useLocation();
    const match: any = useRouteMatch("/l2assets/:item/:tab");
    const tab = match?.params.tab ?? TabIndex.transactions;
    const [pageSize, setPageSize] = React.useState(0);
    const [currentTab, setCurrentTab] = React.useState(tab);
    const { toastOpen, setToastOpen, closeToast } = useToast();
    const { totalCoinMap, tokenMap, marketArray } = useTokenMap();
    const { ammMap } = useAmmMap();

    const {
      txs: txTableData,
      txsTotal,
      showLoading: showTxsLoading,
      getUserTxnList,
    } = useGetTxs(setToastOpen);
    const {
      userTrades,
      getUserTradeList,
      userTradesTotal,
      page: tradePage,
      showLoading: showTradeLoading,
    } = useGetTrades(setToastOpen);
    const {
      ammRecordList,
      showLoading: showAmmloading,
      ammRecordTotal,
      getAmmpoolList,
    } = useGetAmmRecord(setToastOpen);
    const {
      rawData,
      getOrderList,
      totalNum,
      showLoading,
      marketArray: orderRaw,
      cancelOrder,
      clearRawData,
    } = useOrderList();
    const { userOrderDetailList, getUserOrderDetailTradeList } =
      useGetOrderHistorys();
    const { etherscanBaseUrl } = useSystem();

    const {
      account: { accAddress, accountId },
    } = useAccount();

    const { t } = rest;
    const container = React.useRef<HTMLDivElement>(null);

    const handleTabChange = React.useCallback(
      (value: TabIndex, _pageSize?: number) => {
        setCurrentTab(value);
        history.replace(
          `/l2assets/history/${value}?${search.replace("?", "")}`
        );
      },
      [clearRawData, getAmmpoolList, getUserTradeList, pageSize]
    );

    React.useEffect(() => {
      let height = container?.current?.offsetHeight;
      if (height) {
        const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
        setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3);
        handleTabChange(currentTab, pageSize);
      }
    }, [container?.current?.offsetHeight]);
    return (
      <Box flex={1} display={"flex"} flexDirection={"column"}>
        <Box marginBottom={2}>
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={history.goBack}
          >
            {t("labelTransactions")}
            {/*<Typography color={"textPrimary"}></Typography>*/}
          </Button>
        </Box>
        {/*<IconButton*/}
        {/*  className={"back-btn"}*/}
        {/*  size={"large"}*/}
        {/*  color={"inherit"}*/}
        {/*  aria-label={t && t("labelBack")}*/}
        {/*  onClick={() => {*/}
        {/*    onBack && onBack();*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <BackIcon />*/}
        {/*</IconButton>*/}
        <StylePaper ref={container}>
          <Toast
            alertText={toastOpen?.content ?? ""}
            severity={toastOpen?.type ?? "success"}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
          />
          <Box marginTop={2} marginLeft={2}>
            <Tabs
              value={currentTab}
              onChange={(_event, value) => handleTabChange(value)}
              aria-label="l2-history-tabs"
              variant="scrollable"
            >
              <Tab
                label={t("labelLayer2HistoryTransactions")}
                value={TabIndex.transactions}
              />
              <Tab label={t("labelLayer2HistoryTrades")} value="trades" />
              <Tab
                label={t("labelLayer2HistoryAmmRecords")}
                value={TabIndex.ammRecords}
              />
              <Tab
                label={t("labelOrderTableOpenOrder")}
                value={TabIndex.orderOpenTable}
              />
              <Tab
                label={t("labelOrderTableOrderHistory")}
                value={TabIndex.orderHistoryTable}
              />
            </Tabs>
          </Box>
          <div className="tableWrapper table-divide-short">
            {currentTab === TabIndex.transactions ? (
              <TransactionTable
                {...{
                  etherscanBaseUrl,
                  rawData: txTableData,
                  pagination: {
                    pageSize: pageSize,
                    total: txsTotal,
                  },
                  filterTokens: totalCoinMap
                    ? (Reflect.ownKeys(totalCoinMap) as string[])
                    : [],
                  showFilter: true,
                  showloading: showTxsLoading,
                  getTxnList: getUserTxnList,
                  accAddress,
                  accountId,
                  ...rest,
                }}
              />
            ) : currentTab === TabIndex.trades ? (
              <TradeTable
                getUserTradeList={getUserTradeList}
                {...{
                  rawData: userTrades,
                  showFilter: true,
                  filterPairs: marketArray,
                  showloading: showTradeLoading,
                  tokenMap: tokenMap,
                  isL2Trade: true,
                  pagination: {
                    page: tradePage,
                    pageSize: pageSize,
                    total: userTradesTotal,
                  },
                  accAddress,
                  accountId,
                  ...rest,
                }}
              />
            ) : currentTab === TabIndex.ammRecords ? (
              <AmmTable
                {...{
                  rawData: ammRecordList,
                  pagination: {
                    pageSize: pageSize,
                    total: ammRecordTotal,
                  },
                  getAmmpoolList,
                  showFilter: true,
                  filterPairs: Reflect.ownKeys(ammMap ?? {}).map((item) =>
                    item.toString().replace("AMM", "LP")
                  ),
                  showloading: showAmmloading,
                  ...rest,
                }}
              />
            ) : (
              <OrderHistoryTable
                {...{
                  pagination:
                    currentTab === TabIndex.orderOpenTable
                      ? undefined
                      : {
                          pageSize: pageSize,
                          total: totalNum,
                        },
                  rawData: rawData,
                  showFilter: true,
                  getOrderList,
                  marketArray: orderRaw,
                  showDetailLoading: false,
                  userOrderDetailList,
                  getUserOrderDetailTradeList,
                  ...rest,
                  showLoading,
                  isOpenOrder: currentTab === TabIndex.orderOpenTable,
                  cancelOrder,
                }}
              />
            )}
          </div>
        </StylePaper>
      </Box>
    );
  }
);

export default HistoryPanel;
