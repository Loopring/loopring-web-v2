import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { StylePaper } from "@loopring-web/core";
import {
  AmmTable,
  AssetsTable,
  DefiTxsTable,
  DualTxsTable,
  OrderHistoryTable,
  Toast,
  TradeTable,
  TransactionTable,
  useSettings,
} from "@loopring-web/component-lib";
import {
  AddIcon,
  BackIcon,
  CheckBoxIcon,
  CheckedIcon,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import MyLiquidity from "../../InvestPage/MyLiquidityPanel";
enum TabIndex {
  Received = "Received",
  Send = "Send",
}
export const MyRedPacketPanel = () => {
  const theme = useTheme();
  const container = React.useRef<HTMLDivElement>(null);
  const history = useHistory();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const [currentTab, setCurrentTab] = React.useState<TabIndex>(
    TabIndex.Received
  );
  const handleTabChange = (value: TabIndex) => {
    switch (value) {
      case TabIndex.Send:
        history.push("/redpacket/transaction/send");
        setCurrentTab(TabIndex.Send);
        break;
      case TabIndex.Received:
      default:
        history.replace("/redpacket/transaction/Received");
        setCurrentTab(TabIndex.Received);
        break;
    }
  };
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
    >
      <Box display={"flex"} flexDirection={isMobile ? "column" : "row"}>
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={() => history.push("/redpacket/markets")}
        >
          {t("labelRedPacketRecordTitle")}
        </Button>
      </Box>
      <StylePaper ref={container} flex={1}>
        <Tabs
          value={currentTab}
          onChange={(_event, value) => handleTabChange(value)}
          aria-label="l2-history-tabs"
          variant="scrollable"
        >
          <Tab label={t("labelRedPacketReceived")} value={TabIndex.Received} />
          <Tab label={t("labelRedPacketSend")} value={TabIndex.Send} />
        </Tabs>
        {currentTab === TabIndex.Received && (
          <Box className="tableWrapper table-divide-short"></Box>
        )}
        {currentTab === TabIndex.Send && (
          <Box className="tableWrapper table-divide-short"></Box>
        )}
      </StylePaper>
    </Box>
  );
};
