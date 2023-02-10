import { useTheme } from "@emotion/react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RedPacketReceiveTable,
  RedPacketRecordTable,
  useSettings,
} from "@loopring-web/component-lib";
import { StylePaper, useSystem } from "@loopring-web/core";
import React from "react";
import {
  useMyRedPacketReceiveTransaction,
  useMyRedPacketRecordTransaction,
} from "./hooks";
import {
  BackIcon,
  RowConfig,
  TabTokenTypeIndex,
  TokenType,
} from "@loopring-web/common-resources";
import { Box, Button, Tab, Tabs } from "@mui/material";

enum TabIndex {
  Received = "Received",
  Send = "Send",
  NFTReceived = "NFTReceived",
  NFTSend = "NFTSend",
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
  let match: any = useRouteMatch("/redPacket/records/?:item/?:type");

  const container = React.useRef<HTMLDivElement>(null);

  const [currentTab, setCurrentTab] = React.useState<TabIndex>(
    match?.params.item ?? TabIndex.Received
  );

  const [pageSize, setPageSize] = React.useState(0);

  React.useEffect(() => {
    let height = container?.current?.offsetHeight;
    if (height) {
      const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
      setPageSize(pageSize);
      handleTabChange(currentTab);
    }
  }, [container?.current?.offsetHeight]);

  // getRedPacketReceiveList({ offset: 0, limit: pageSize });
  // getMyRedPacketRecordTxList({ offset: 0, limit: pageSize });
  const {
    showLoading: showloadingRecord,
    getMyRedPacketRecordTxList,
    myRedPacketRecordList,
    myRedPacketRecordTotal,
    onItemClick,
  } = useMyRedPacketRecordTransaction({
    setToastOpen,
    // tabType: currentTokenTab,
  });
  const {
    showLoading: showloadingReceive,
    getRedPacketReceiveList,
    redPacketReceiveList,
    redPacketReceiveTotal,
    onItemClick: onReceiveItemClick,
  } = useMyRedPacketReceiveTransaction({
    setToastOpen,
    // tabType: currentTokenTab,
  });
  const handleTabChange = (value: TabIndex) => {
    history.push(`/redPacket/records/${value}`);
    setCurrentTab(value);
  };

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
        {/*<Tabs*/}
        {/*  value={currentTokenTab}*/}
        {/*  onChange={(_event, value) => handleTypeTabChange(value)}*/}
        {/*  aria-label="l2-history-tabs"*/}
        {/*  variant="scrollable"*/}
        {/*>*/}
        {/*  <Tab*/}
        {/*    label={t("labelRedPacketMarket" + TabTokenTypeIndex.ERC20)}*/}
        {/*    value={TabTokenTypeIndex.ERC20}*/}
        {/*  />*/}
        {/*  <Tab*/}
        {/*    label={t("labelRedPacketMarket" + TabTokenTypeIndex.NFT)}*/}
        {/*    value={TabTokenTypeIndex.NFT}*/}
        {/*  />*/}
        {/*</Tabs>*/}
        <Tabs
          value={currentTab}
          onChange={(_event, value) => handleTabChange(value)}
          aria-label="l2-history-tabs"
          variant="scrollable"
        >
          {Reflect.ownKeys(TabIndex).map((keyItem) => {
            return (
              <Tab
                key={keyItem.toString()}
                label={t(`labelRedPacket${TabIndex[keyItem.toString()]}`)}
                value={TabIndex[keyItem]}
              />
            );
          })}
          {/*<Tab label={t("labelRedPacketReceived")} value={TabIndex.Received} />*/}
          {/*<Tab label={t("labelRedPacketSend")} value={TabIndex.Send} />*/}
        </Tabs>
        {[TabIndex.Received, TabIndex.NFTReceived].includes(currentTab) && (
          <Box className="tableWrapper table-divide-short">
            <RedPacketReceiveTable
              {...{
                tokenType: /nft/gi.test(currentTab)
                  ? TokenType.nft
                  : TokenType.single,
                onItemClick: onReceiveItemClick,
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
        {[TabIndex.Send, TabIndex.NFTSend].includes(currentTab) && (
          <Box className="tableWrapper table-divide-short">
            <RedPacketRecordTable
              {...{
                tokenType: /nft/gi.test(currentTab)
                  ? TokenType.nft
                  : TokenType.single,
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
