import { useTheme } from "@emotion/react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RedPacketReceiveTable,
  RedPacketRecordTable,
  Toast,
  useSettings,
} from "@loopring-web/component-lib";
import { StylePaper, useSystem, useToast } from "@loopring-web/core";
import React from "react";
import { useMyRedPacketReceiveTransaction, useMyRedPacketRecordTransaction } from "./hooks";
import {
  BackIcon,
  RowConfig,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { Box, Button, Tab, Tabs } from "@mui/material";

enum TabIndex {
  Received = "Received",
  Send = "Send",
}
export const MyRedPacketPanel = () => {
  const theme = useTheme();
  const history = useHistory();
  const {t} = useTranslation();
  const {isMobile} = useSettings();
  const {etherscanBaseUrl} = useSystem();
  const {toastOpen, setToastOpen, closeToast} = useToast();

  const container = React.useRef<HTMLDivElement>(null);

  const [currentTab, setCurrentTab] = React.useState<TabIndex>(
    TabIndex.Received
  );

  const {
    getMyRedPacketRecordTxList,
    myRedPacketRecordList,
    myRedPacketRecordTotal,
  } = useMyRedPacketRecordTransaction({
    setToastOpen,
  });
  const {
    getMyRedPacketReceiveList,
    myRedPacketReceiveList,
    myRedPacketReceiveTotal,
  } = useMyRedPacketReceiveTransaction({
    setToastOpen,
  })
  const [pageSize, setPageSize] = React.useState(0);

  React.useEffect(() => {
    let height = container?.current?.offsetHeight;
    if (height) {
      const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
      setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3);
      handleTabChange(currentTab);
    }
  }, [container?.current?.offsetHeight]);

  const handleTabChange = (value: TabIndex) => {
    switch (value) {
      case TabIndex.Send:
        history.push("/redPacket/records/send");
        setCurrentTab(TabIndex.Send);
        break;
      case TabIndex.Received:
      default:
        history.replace("/redPacket/records/Received");
        setCurrentTab(TabIndex.Received);
        break;
    }
  };
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? {maxWidth: "calc(100vw - 32px)"} : {}}
    >
      <Toast
        alertText={toastOpen?.content ?? ""}
        severity={toastOpen?.type ?? "success"}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
      <Box
        display={"flex"}
        flexDirection={isMobile ? "column" : "row"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"}/>}
          variant={"text"}
          size={"medium"}
          sx={{color: "var(--color-text-secondary)"}}
          color={"inherit"}
          onClick={() => history.push("/redPacket/markets")}
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
          <Box className="tableWrapper table-divide-short">
            <RedPacketReceiveTable
              {...{
                etherscanBaseUrl,
                rawData: myRedPacketReceiveList,
                getMyRedPacketReceiveList,
                pagination: {
                  pageSize: pageSize,
                  total: myRedPacketReceive Total,
                },
              }}/>
          </Box>
        )}
        {currentTab === TabIndex.Send && (
          <Box className="tableWrapper table-divide-short">
            <RedPacketRecordTable
              {...{
                etherscanBaseUrl,
                rawData: myRedPacketRecordList,
                getMyRedPacketRecordTxList,
                pagination: {
                  pageSize: pageSize,
                  total: myRedPacketRecordTotal,
                },
              }}
            />
          </Box>
        )}
      </StylePaper>
    </Box>
  );
};
