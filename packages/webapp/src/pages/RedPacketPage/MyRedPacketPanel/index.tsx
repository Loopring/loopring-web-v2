import { useTheme } from "@emotion/react";
import { useHistory, useRouteMatch, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RedPacketReceiveTable,
  RedPacketRecordTable,
  useSettings,
  RedPacketBlindBoxReceiveTable,
} from "@loopring-web/component-lib";
import { StylePaper, useSystem } from "@loopring-web/core";
import React from "react";
import {
  useMyRedPacketBlindBoxReceiveTransaction,
  useMyRedPacketReceiveTransaction,
  useMyRedPacketRecordTransaction,
} from "./hooks";
import { BackIcon, TokenType } from "@loopring-web/common-resources";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { useNotify } from "@loopring-web/core";

enum TabIndex {
  Received = "Received",
  Send = "Send",
  NFTReceived = "NFTReceived",
  NFTSend = "NFTSend",
  BlindBoxReceived = "BlindBoxReceived",
  NFTsUnClaimed = "NFTsUnClaimed",
  BlindBoxUnClaimed = "BlindBoxUnClaimed",
}

const SelectButton = styled(Button)<{ selected?: boolean }>`
  color: ${({ selected, theme }) =>
    selected ? theme.colorBase.textPrimary : "auto"};
  border-color: ${({ selected, theme }) =>
    selected ? theme.colorBase.textButtonSelect : "auto"};
  background-color: ${({ selected, theme }) =>
    selected ? theme.colorBase.box : "auto"};
`;

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
  let match: any = useRouteMatch("/redPacket/records/:item/:type?");

  const container = React.useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = React.useState<TabIndex>(
    match?.params.item ?? TabIndex.Received
  );
  const isUnClaimed =
    currentTab === TabIndex.BlindBoxUnClaimed ||
    currentTab === TabIndex.NFTsUnClaimed;
  const pageSize = 10;

  const {
    showLoading: showloadingRecord,
    getMyRedPacketRecordTxList,
    myRedPacketRecordList,
    myRedPacketRecordTotal,
    onItemClick,
  } = useMyRedPacketRecordTransaction({
    setToastOpen,
  });

  const [showActionableRecords, setShowActionableRecords] =
    React.useState(true);
  const onChangeShowActionableRecords = React.useCallback(() => {
    setShowActionableRecords(!showActionableRecords);
  }, [showActionableRecords]);
  const {
    showLoading: showloadingReceive,
    getRedPacketReceiveList,
    redPacketReceiveList,
    redPacketReceiveTotal,
    onItemClick: onReceiveItemClick,
    onClaimItem: onReceiveClaimItem,
  } = useMyRedPacketReceiveTransaction({
    setToastOpen,
    // showActionableRecords
  });
  const {
    showLoading: showloadingReceive_BlindBox,
    getRedPacketReceiveList: getRedPacketReceiveList_BlindBox,
    redPacketReceiveList: redPacketReceiveList_BlindBox,
    redPacketReceiveTotal: redPacketReceiveTotal_BlindBox,
    onItemClick: onReceiveItemClick_BlindBox,
  } = useMyRedPacketBlindBoxReceiveTransaction({
    setToastOpen,
    // showActionableRecords
  });
  const handleTabChange = (value: TabIndex) => {
    history.push(`/redPacket/records/${value}`);
    setCurrentTab(value);
  };

  const isRecieve = [
    TabIndex.Received,
    TabIndex.BlindBoxReceived,
    TabIndex.NFTReceived,
    TabIndex.BlindBoxUnClaimed,
    TabIndex.NFTsUnClaimed,
  ].includes(currentTab);
  const tabType = [TabIndex.Received, TabIndex.Send].includes(currentTab)
    ? "tokens"
    : [TabIndex.NFTReceived, TabIndex.NFTSend].includes(currentTab)
    ? "NFTs"
    : "blindBox";

  const showNFT = useNotify().notifyMap?.redPacket.showNFT;
  const tabsView = isUnClaimed ? (
    <Tabs
      value={currentTab}
      onChange={(_event, value) => {
        handleTabChange(value);
      }}
      aria-label="l2-history-tabs"
      variant="scrollable"
    >
      <Tab
        key={"NFTs"}
        label={t("labelRedPacketTabNFTs")}
        value={TabIndex.NFTsUnClaimed}
      />
      <Tab
        key={"Blind Box"}
        label={t("labelRedPacketTabBlindBox")}
        value={TabIndex.BlindBoxUnClaimed}
      />
    </Tabs>
  ) : (
    <>
      <Tabs
        value={isRecieve ? "Received" : "Sent"}
        onChange={(_event, value) => {
          if (tabType === "tokens" && value === "Received") {
            handleTabChange(TabIndex.Received);
          } else if (tabType === "tokens" && value === "Sent") {
            handleTabChange(TabIndex.Send);
          } else if (tabType === "NFTs" && value === "Received") {
            handleTabChange(TabIndex.NFTReceived);
          } else if (tabType === "NFTs" && value === "Sent") {
            handleTabChange(TabIndex.NFTSend);
          } else if (tabType === "blindBox" && value === "Received") {
            handleTabChange(TabIndex.BlindBoxReceived);
          } else if (tabType === "blindBox" && value === "Sent") {
            handleTabChange(TabIndex.Send);
          }
        }}
        aria-label="l2-history-tabs"
        variant="scrollable"
      >
        <Tab
          key={"Received"}
          label={t("labelRedPacketTabReceived")}
          value={"Received"}
        />
        <Tab key={"Sent"} label={t("labelRedPacketTabSent")} value={"Sent"} />
      </Tabs>
      <Box
        paddingX={2}
        marginTop={3}
        display={"flex"}
        justifyContent="space-between"
      >
        <Box>
          <SelectButton
            onClick={() => {
              isRecieve
                ? handleTabChange(TabIndex.Received)
                : handleTabChange(TabIndex.Send);
            }}
            selected={[TabIndex.Send, TabIndex.Received].includes(currentTab)}
            style={{ marginRight: `${theme.unit}px` }}
            variant={"outlined"}
          >
            {t("labelRedpacketTokensShort")}
          </SelectButton>
          {showNFT && (
            <>
              <SelectButton
                onClick={() => {
                  isRecieve
                    ? handleTabChange(TabIndex.NFTReceived)
                    : handleTabChange(TabIndex.NFTSend);
                }}
                selected={[TabIndex.NFTReceived, TabIndex.NFTSend].includes(
                  currentTab
                )}
                style={{ marginRight: `${theme.unit}px` }}
                variant={"outlined"}
              >
                {t("labelRedpacketNFTS")}
              </SelectButton>
              {isRecieve && (
                <SelectButton
                  onClick={() => {
                    handleTabChange(TabIndex.BlindBoxReceived);
                  }}
                  selected={[TabIndex.BlindBoxReceived].includes(currentTab)}
                  variant={"outlined"}
                >
                  {t("labelRedpacketBlindBox")}
                </SelectButton>
              )}
            </>
          )}
        </Box>
        {isRecieve && (tabType === "NFTs" || tabType === "blindBox") && (
          <FormControlLabel
            control={
              <Checkbox
                checked={showActionableRecords}
                onChange={() => {
                  onChangeShowActionableRecords();
                }}
              />
            }
            label={t("labelRedpacketHideInactionable")}
          />
        )}
      </Box>
    </>
  );

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
          onClick={() => {
            if (isUnClaimed) {
              history.push("/l2assets/assets/RedPacket");
            } else {
              history.push("/redPacket/markets");
            }
          }}
        >
          {isUnClaimed ? t("labelViewMore") : t("labelRedPacketRecordTitle")}
        </Button>
      </Box>

      <StylePaper overflow={"scroll"} ref={container} flex={1}>
        {tabsView}
        {[
          TabIndex.Received,
          TabIndex.NFTReceived,
          TabIndex.NFTsUnClaimed,
        ].includes(currentTab) && (
          <Box
            className="tableWrapper table-divide-short"
            display={"flex"}
            flexDirection={"column"}
            flex={1}
          >
            {currentTab == TabIndex.NFTReceived && isUnClaimed && (
              <Typography
                component={"h4"}
                paddingX={2}
                variant={"body1"}
                color={"textSecondary"}
              >
                {t("labelNFTRedPackAskClaim")}
              </Typography>
            )}
            <RedPacketReceiveTable
              {...{
                tokenType:
                  currentTab === TabIndex.NFTReceived ||
                  currentTab === TabIndex.NFTSend ||
                  currentTab === TabIndex.NFTsUnClaimed
                    ? TokenType.nft
                    : TokenType.single,
                onItemClick: onReceiveItemClick,
                onClaimItem: onReceiveClaimItem,
                showloading: showloadingReceive,
                forexMap,
                etherscanBaseUrl,
                rawData: redPacketReceiveList,
                getRedPacketReceiveList,
                pagination: {
                  pageSize: pageSize,
                  total: redPacketReceiveTotal,
                },
                showActionableRecords,
                isUncliamedNFT: currentTab === TabIndex.NFTsUnClaimed
              }}
            />
          </Box>
        )}
        {(currentTab === TabIndex.BlindBoxReceived ||
          currentTab === TabIndex.BlindBoxUnClaimed) && (
          <Box
            className="tableWrapper table-divide-short"
            display={"flex"}
            flexDirection={"column"}
            flex={1}
          >
            <RedPacketBlindBoxReceiveTable
              onItemClick={onReceiveItemClick_BlindBox}
              showloading={showloadingReceive_BlindBox}
              forexMap={forexMap}
              etherscanBaseUrl={etherscanBaseUrl}
              rawData={redPacketReceiveList_BlindBox}
              getRedPacketReceiveList={getRedPacketReceiveList_BlindBox}
              pagination={{
                pageSize: pageSize,
                total: redPacketReceiveTotal_BlindBox,
              }}
              showActionableRecords={showActionableRecords}
              isUnclaimed={currentTab === TabIndex.BlindBoxUnClaimed}
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
