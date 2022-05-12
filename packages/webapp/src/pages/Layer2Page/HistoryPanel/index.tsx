import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Tab, Tabs } from "@mui/material";
import {
  AmmTable,
  Toast,
  TradeTable,
  TransactionTable,
} from "@loopring-web/component-lib";
import { StylePaper } from "../../styled";
import { useGetAmmRecord, useGetTrades, useGetTxs } from "./hooks";

import {
  TOAST_TIME,
  useSystem,
  useAccount,
  useToast,
  useTokenMap,
  useAmmMap,
} from "@loopring-web/core";
import { RowConfig } from "@loopring-web/common-resources";

const HistoryPanel = withTranslation("common")(
  (rest: WithTranslation<"common">) => {
    const [pageSize, setPageSize] = React.useState(0);
    const [currentTab, setCurrentTab] = React.useState("transactions");
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
      showLoading: showTradeLoading,
    } = useGetTrades(setToastOpen);
    const {
      ammRecordList,
      showLoading: ammLoading,
      ammRecordTotal,
      getAmmpoolList,
    } = useGetAmmRecord(setToastOpen);
    const { etherscanBaseUrl } = useSystem();

    const {
      account: { accAddress, accountId },
    } = useAccount();

    const { t } = rest;
    const container = React.useRef<HTMLDivElement>(null);

    const handleTabChange = React.useCallback(
      (value: string, _pageSize?: number) => {
        setCurrentTab(value);
        if (value === "transactions") {
          getUserTxnList({
            limit: _pageSize ? _pageSize : pageSize,
            types: "deposit,transfer,offchain_withdrawal",
          });
        }
        if (value === "trades") {
          getUserTradeList({
            limit: _pageSize ? _pageSize : pageSize,
          });
        }
        if (value === "ammRecords") {
          getAmmpoolList({
            limit: _pageSize ? _pageSize : pageSize,
          });
        }
      },
      [getAmmpoolList, getUserTradeList, getUserTxnList, pageSize]
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
          >
            <Tab
              label={t("labelLayer2HistoryTransactions")}
              value="transactions"
            />
            <Tab label={t("labelLayer2HistoryTrades")} value="trades" />
            <Tab label={t("labelLayer2HistoryAmmRecords")} value="ammRecords" />
          </Tabs>
        </Box>
        <div className="tableWrapper table-divide-short">
          {currentTab === "transactions" ? (
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
          ) : currentTab === "trades" ? (
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
                  pageSize: pageSize,
                  total: userTradesTotal,
                },
                accAddress,
                accountId,
                ...rest,
              }}
            />
          ) : (
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
                showLoading: ammLoading,
                ...rest,
              }}
            />
          )}
        </div>
      </StylePaper>
    );
  }
);

export default HistoryPanel;
