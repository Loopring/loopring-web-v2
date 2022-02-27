import React, { useEffect } from "react";
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
import { useSystem } from "stores/system";
import { useAccount } from "stores/account";
import store from "stores";
import { TOAST_TIME } from "defs/common_defs";
import { useToast } from "hooks/common/useToast";
import { useTokenMap } from "../../../stores/token";

const HistoryPanel = withTranslation("common")(
  (rest: WithTranslation<"common">) => {
    const [pageSize, setPageSize] = React.useState(0);
    const [currentTab, setCurrentTab] = React.useState("transactions");
    const { toastOpen, setToastOpen, closeToast } = useToast();
    const { totalCoinMap } = useTokenMap();

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
      getAmmpoolList,
    } = useGetAmmRecord(setToastOpen);
    const { tokenMap, marketArray } = store.getState().tokenMap;
    const {
      account: { accAddress },
    } = useAccount();

    const { t } = rest;
    const container = React.useRef(null);

    React.useEffect(() => {
      // @ts-ignore
      let height = container?.current?.offsetHeight;
      if (height) {
        setPageSize(Math.floor((height - 120) / 44) - 3);
      }
    }, [container, pageSize]);

    useEffect(() => {
      if (pageSize) {
        getUserTxnList({
          limit: pageSize,
          types: "deposit,transfer,offchain_withdrawal",
        });
      }
    }, [getUserTxnList, pageSize]);

    const { etherscanBaseUrl } = useSystem();

    const handleTabChange = React.useCallback(
      (value: string) => {
        setCurrentTab(value);
        if (value === "transactions") {
          getUserTxnList({
            limit: pageSize,
            types: "deposit,transfer,offchain_withdrawal",
          });
        }
        if (value === "trades") {
          getUserTradeList({
            limit: pageSize,
          });
        }
        if (value === "ammRecords") {
          getAmmpoolList();
        }
      },
      [getAmmpoolList, getUserTradeList, getUserTxnList, pageSize]
    );

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
                // marketMap: marketMap,
                pagination: {
                  pageSize: pageSize,
                  total: userTradesTotal,
                },
                ...rest,
              }}
            />
          ) : (
            <AmmTable
              {...{
                rawData: ammRecordList,
                pagination: {
                  pageSize: pageSize,
                },
                showFilter: true,
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
