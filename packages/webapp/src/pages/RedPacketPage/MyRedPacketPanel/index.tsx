import { useTheme } from "@emotion/react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RedPacketReceiveTable,
  RedPacketRecordTable,
  useSettings,
} from "@loopring-web/component-lib";
import { StylePaper, useSystem, useToast } from "@loopring-web/core";
import React from "react";
import {
  useMyRedPacketReceiveTransaction,
  useMyRedPacketRecordTransaction,
} from "./hooks";
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

export const MyRedPacketPanel = ({
  setToastOpen,
}: {
  setToastOpen: (props: any) => void;
}) => {
  const theme = useTheme();
  const history = useHistory();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const { etherscanBaseUrl, forexMap } = useSystem();
  let match: any = useRouteMatch("/redPacket/records/:item");

  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let height = container?.current?.offsetHeight;
    if (height) {
      const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
      setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3);
      handleTabChange(currentTab);
    }
  }, [container?.current?.offsetHeight]);
  const [currentTab, setCurrentTab] = React.useState<TabIndex>(
    match?.params.item ?? TabIndex.Received
  );

  const {
    showLoading: showloadingRecord,
    getMyRedPacketRecordTxList,
    myRedPacketRecordList,
    myRedPacketRecordTotal,
    onItemClick,
  } = useMyRedPacketRecordTransaction(setToastOpen);
  const {
    showLoading: showloadingReceive,
    getRedPacketReceiveList,
    redPacketReceiveList,
    redPacketReceiveTotal,
  } = useMyRedPacketReceiveTransaction(setToastOpen);
  const [pageSize, setPageSize] = React.useState(0);

  const handleTabChange = (value: TabIndex) => {
    switch (value) {
      case TabIndex.Send:
        history.push("/redPacket/records/Send");
        setCurrentTab(TabIndex.Send);
        break;
      case TabIndex.Received:
      default:
        history.replace("/redPacket/records/Received");
        setCurrentTab(TabIndex.Received);
        break;
    }
  };
  // React.useEffect(() => {
  //   handleTabChange(match?.params.item ?? TabIndex.Received);
  // }, [match?.params.item]);
  // @ts-ignore
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
    >
      <Box
        display={"flex"}
        flexDirection={isMobile ? "column" : "row"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
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
                showloading: showloadingReceive,
                forexMap,
                etherscanBaseUrl,
                rawData: redPacketReceiveList,
                getRedPacketReceiveList,
                pagination: {
                  pageSize: pageSize,
                  total: redPacketReceiveTotal,
                },
              }}
            />
          </Box>
        )}
        {currentTab === TabIndex.Send && (
          <Box className="tableWrapper table-divide-short">
            <RedPacketRecordTable
              {...{
                showloading: showloadingRecord,
                etherscanBaseUrl,
                forexMap,
                rawData: myRedPacketRecordList,
                getMyRedPacketRecordTxList,
                pagination: {
                  pageSize: pageSize,
                  total: myRedPacketRecordTotal,
                },
                onItemClick,
              }}
            />
          </Box>
        )}
      </StylePaper>
    </Box>
  );
};
