import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Tab, Tabs } from "@mui/material";
import {
  AmmTable,
  Button,
  DefiStakingTxTable,
  DefiTxsTable,
  DualTxsTable,
  OrderHistoryTable,
  Toast,
  TradeTable,
  TransactionTable,
  useSettings,
  CexSwapTable,
} from "@loopring-web/component-lib";
import {
  StylePaper,
  useAccount,
  useAmmMap,
  useGetOrderHistorys,
  useSystem,
  useToast,
  useTokenMap,
} from "@loopring-web/core";
import {
  useCexTransaction,
  useDefiSideRecord,
  useDualTransaction,
  useGetAmmRecord,
  useGetDefiRecord,
  useGetTrades,
  useGetTxs,
  useOrderList,
} from "./hooks";
import {
  BackIcon,
  RowConfig,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";

enum TabIndex {
  transactions = "transactions",
  trades = "trades",
  ammRecords = "ammRecords",
  orders = "orders",
  // orderOpenTable = "orderOpenTable",
  // orderHistoryTable = "orderHistoryTable",
  defiRecords = "defiRecords",
  dualRecords = "dualRecords",
  sideStakingRecords = "sideStakingRecords",
  cexSwapRecords = "CexSwap",
}

export const RecordTabIndex = TabIndex;

enum TabOrderIndex {
  orderOpenTable = "orderOpenTable",
  orderHistoryTable = "orderHistoryTable",
}

const HistoryPanel = withTranslation("common")(
  (rest: WithTranslation<"common">) => {
    const history = useHistory();
    const { search } = useLocation();
    const { isMobile } = useSettings();
    const match: any = useRouteMatch("/l2assets/:history/:tab/:orderTab?");
    // const orderTabMatch: any = useRouteMatch(
    //   "/l2assets/:history/:tab/:orderTab"
    // );

    const [pageSize, setPageSize] = React.useState(0);
    const [currentTab, setCurrentTab] = React.useState(() => {
      return match?.params.tab ?? TabIndex.transactions;
    });
    const [currentOrderTab, setCurrentOrderTab] = React.useState(() => {
      return match?.params?.orderTab ?? TabOrderIndex.orderOpenTable;
    });

    const { toastOpen, setToastOpen, closeToast } = useToast();
    const { totalCoinMap, tokenMap, idIndex, marketArray } = useTokenMap();
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
      defiList,
      showLoading: showDefiLoading,
      getDefiTxList,
      defiTotal,
    } = useGetDefiRecord(setToastOpen);
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
    } = useOrderList(setToastOpen);
    const {
      dualList,
      showLoading: showDualLoading,
      getDualTxList,
      dualMarketMap,
      dualTotal,
    } = useDualTransaction(setToastOpen);
    const {
      sideStakingList,
      showLoading: showDefiSideStakingLoading,
      getSideStakingTxList,
      sideStakingTotal,
    } = useDefiSideRecord(setToastOpen);

    const { userOrderDetailList, getUserOrderDetailTradeList } =
      useGetOrderHistorys();
    const { etherscanBaseUrl } = useSystem();
    const {
      getCexOrderList,
      cexOrderData,
      onDetail,
      totalNum: cexTotalNum,
      showLoading: showCexLoading,
    } = useCexTransaction(setToastOpen);

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
      [history, search]
    );

    React.useEffect(() => {
      let height = container?.current?.offsetHeight;
      if (height) {
        const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
        setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3);
        handleTabChange(currentTab, pageSize);
      }
    }, [container?.current?.offsetHeight]);
    // React.useEffect(()=>{},[])
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
        <StylePaper ref={container} flex={1}>
          <Toast
            alertText={toastOpen?.content ?? ""}
            severity={toastOpen?.type ?? "success"}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
          />
          <Box
            marginTop={2}
            marginLeft={2}
            display={"flex"}
            sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
          >
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
              <Tab
                label={t("labelLayer2HistoryTrades")}
                value={TabIndex.trades}
              />
              <Tab label={t("labelOrderGroup")} value={TabIndex.orders} />
              <Tab
                label={t("labelLayer2HistoryAmmRecords")}
                value={TabIndex.ammRecords}
              />
              <Tab
                label={t("labelDefiOrderTable")}
                value={TabIndex.defiRecords}
              />
              <Tab
                label={t("labelDualOrderTable")}
                value={TabIndex.dualRecords}
              />
              <Tab
                label={t("labelSideStakingTable")}
                value={TabIndex.sideStakingRecords}
              />
              <Tab
                label={t("labelCexSwapTitle")}
                value={TabIndex.cexSwapRecords}
              />
            </Tabs>
          </Box>
          <Box
            className="tableWrapper table-divide-short"
            display={"flex"}
            flex={1}
            overflow={"scroll"}
          >
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
            ) : currentTab === TabIndex.defiRecords ? (
              <DefiTxsTable
                {...{
                  rawData: defiList,
                  pagination: {
                    pageSize: pageSize,
                    total: defiTotal,
                  },
                  getDefiTxList,
                  showloading: showDefiLoading,
                  ...rest,
                }}
                tokenMap={tokenMap}
                idIndex={idIndex}
              />
            ) : currentTab === TabIndex.sideStakingRecords ? (
              <DefiStakingTxTable
                {...{
                  rawData: sideStakingList as any[],
                  pagination: {
                    pageSize: pageSize,
                    total: sideStakingTotal,
                  },
                  getSideStakingTxList,
                  showloading: showDefiSideStakingLoading,
                  ...rest,
                }}
                tokenMap={tokenMap}
                idIndex={idIndex}
              />
            ) : currentTab === TabIndex.dualRecords ? (
              <DualTxsTable
                rawData={dualList}
                getDualTxList={getDualTxList}
                pagination={{
                  pageSize: pageSize + 2,
                  total: dualTotal,
                }}
                dualMarketMap={dualMarketMap}
                showloading={showDualLoading}
                tokenMap={tokenMap}
                idIndex={idIndex}
                {...{
                  ...rest,
                }}
              />
            ) : currentTab === TabIndex.sideStakingRecords ? (
              <Box
                flex={1}
                display={"flex"}
                flexDirection={"column"}
                marginTop={-2}
              >
                <Box marginBottom={2} marginLeft={3}>
                  <Tabs
                    value={currentOrderTab}
                    onChange={(_event, value) => {
                      setCurrentOrderTab(value);
                      history.replace(
                        `/l2assets/history/orders/${value}?${search.replace(
                          "?",
                          ""
                        )}`
                      );
                    }}
                    aria-label="l2-history-tabs"
                    variant="scrollable"
                  >
                    <Tab
                      label={t("labelOrderTableOpenOrder")}
                      value={TabOrderIndex.orderOpenTable}
                    />
                    <Tab
                      label={t("labelOrderTableOrderHistory")}
                      value={TabOrderIndex.orderHistoryTable}
                    />
                  </Tabs>
                </Box>

                <OrderHistoryTable
                  {...{
                    pagination:
                      currentOrderTab === TabOrderIndex.orderOpenTable
                        ? undefined
                        : {
                            pageSize: pageSize - 1,
                            total: totalNum,
                          },
                    rawData,
                    showFilter: true,
                    getOrderList,
                    marketArray: orderRaw,
                    showDetailLoading: false,
                    userOrderDetailList,
                    getUserOrderDetailTradeList,
                    ...rest,
                    showLoading,
                    isOpenOrder:
                      currentOrderTab === TabOrderIndex.orderOpenTable,
                    cancelOrder,
                  }}
                />
              </Box>
            ) : currentTab === TabIndex.cexSwapRecords ? (
              <Box
                flex={1}
                display={"flex"}
                flexDirection={"column"}
                marginTop={-2}
              >
                <CexSwapTable
                  {...{
                    showloading: showCexLoading,
                    getCexOrderList,
                    rawData: cexOrderData,
                  }}
                  pagination={{
                    pageSize: pageSize + 2,
                    total: cexTotalNum,
                  }}
                  onItemClick={onDetail}
                />
              </Box>
            ) : (
              <></>
            )}
          </Box>
        </StylePaper>
      </Box>
    );
  }
);

export default HistoryPanel;
