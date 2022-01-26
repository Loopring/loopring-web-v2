import {
  DepositPanelType,
  PanelContent,
  TsNFTTable,
} from "@loopring-web/component-lib";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";
import React from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import SwipeableViews from "react-swipeable-views";

import { TxType } from "@loopring-web/loopring-sdk";
import { useHistoryNFT } from "./hookHistory";

export const TitleGroup = ({
  tabIndex,
  onTabChange,
}: {
  tabIndex: number;
  onTabChange: (index: DepositPanelType) => void;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Tabs value={tabIndex} onChange={(_e, value) => onTabChange(value)}>
        <Tab
          value={0}
          label={
            <Typography variant={"body1"} component={"h6"}>
              {t("labelNFTTransferTX")}
            </Typography>
          }
        />
        <Tab
          value={1}
          label={
            <Typography variant={"body1"} component={"h6"}>
              {t("labelNFTWithdrawTX")}
            </Typography>
          }
        />
        <Tab
          value={2}
          label={
            <Typography variant={"subtitle1"} component={"h6"}>
              {t("labelNFTDepositTX")}
            </Typography>
          }
        />
      </Tabs>
    </>
  );
};

export const HistoryNFT = () => {
  const theme = useTheme();
  const {
    nftHistory,
    getTransferList,
    getDepositList,
    getWithdrawalList,
    tabIndex,
    setTabIndex,
  } = useHistoryNFT();
  const panelList: Pick<PanelContent<TxType>, "key" | "element">[] = [
    {
      key: TxType.TRANSFER,
      element: (
        <TsNFTTable
          {...{ ...(nftHistory.transfers as any), getTxnList: getTransferList }}
        />
      ),
    },
    {
      key: TxType.OFFCHAIN_WITHDRAWAL,
      element: (
        <TsNFTTable
          {...{
            ...(nftHistory.withdraws as any),
            getTxnList: getWithdrawalList,
          }}
        />
      ),
    },
    {
      key: TxType.DEPOSIT,
      element: (
        <TsNFTTable
          {...{ ...(nftHistory.deposits as any), getTxnList: getDepositList }}
        />
      ),
    },
  ];
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"start"}
      alignItems={"start"}
      flex={1}
      marginBottom={2}
    >
      <Box paddingX={1}>
        <TitleGroup
          onTabChange={(index) => {
            setTabIndex(index);
          }}
          tabIndex={tabIndex}
        />
      </Box>
      <Box flex={1} width={"100%"}>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={tabIndex}
        >
          {panelList.map((panel, index) => {
            return <React.Fragment key={index}>{panel.element}</React.Fragment>;
          })}
        </SwipeableViews>
      </Box>
    </Box>
  );
};
