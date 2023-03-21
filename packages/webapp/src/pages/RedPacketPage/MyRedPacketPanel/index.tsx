import { useTheme } from "@emotion/react";
import { useHistory, useRouteMatch } from "react-router-dom";
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
import { BackIcon, RowConfig, TokenType } from "@loopring-web/common-resources";
import { Box, Button, Tab, Tabs } from "@mui/material";
import styled from "@emotion/styled";

enum TabIndex {
  Received = "Received",
  Send = "Send",
  NFTReceived = "NFTReceived",
  NFTSend = "NFTSend",
  BlindBoxReceived = "BlindBoxReceived",
}

const SelectButton = styled(Button)<{selected?: boolean}>`
  color: ${({selected, theme}) => selected ? theme.colorBase.textPrimary : 'auto'} ;
  border-color: ${({selected, theme}) => selected ? theme.colorBase.textButtonSelect : 'auto'} ;
  background-color: ${({selected, theme}) => selected ? theme.colorBase.box : 'auto'} ;
`

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
      const pageSize = Math.floor((height - 120) / RowConfig.rowHeight - 1);
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
    onClaimItem: onReceiveClaimItem,
  } = useMyRedPacketReceiveTransaction({
    setToastOpen,
  });
  const {
    showLoading: showloadingReceive_BlindBox,
    getRedPacketReceiveList: getRedPacketReceiveList_BlindBox,
    redPacketReceiveList: redPacketReceiveList_BlindBox,
    redPacketReceiveTotal: redPacketReceiveTotal_BlindBox,
    onItemClick: onReceiveItemClick_BlindBox,
  } = useMyRedPacketBlindBoxReceiveTransaction({
    setToastOpen,
  });
  const handleTabChange = (value: TabIndex) => {
    history.push(`/redPacket/records/${value}`);
    setCurrentTab(value);
  };

  const isRecieve = [TabIndex.Received, TabIndex.BlindBoxReceived, TabIndex.NFTReceived].includes(currentTab)
  const tabType = [TabIndex.Received, TabIndex.Send].includes(currentTab) 
    ? 'tokens'
    : [TabIndex.NFTReceived, TabIndex.NFTSend].includes(currentTab) 
      ? 'NFTs'
      : 'blindBox'
  // const theme = useTheme()

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

      <StylePaper overflow={"scroll"} ref={container} flex={1}>
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
          value={isRecieve ? 'Received' : 'Sent'}
          onChange={(_event, value) => {
            if (tabType === 'tokens' && value === 'Received') {
              handleTabChange(TabIndex.Received)
            } else if (tabType === 'tokens' && value === 'Sent') {
              handleTabChange(TabIndex.Send)
            } else if (tabType === 'NFTs' && value === 'Received') {
              handleTabChange(TabIndex.NFTReceived)
            } else if (tabType === 'NFTs' && value === 'Sent') {
              handleTabChange(TabIndex.NFTSend)
            } else if (tabType === 'blindBox' && value === 'Received') {
              handleTabChange(TabIndex.BlindBoxReceived)
            } else if (tabType === 'blindBox' && value === 'Sent') {
              handleTabChange(TabIndex.Send)
            }
          } }
          aria-label="l2-history-tabs"
          variant="scrollable"
        >
          <Tab
            key={"Received"}
            label={"Received"}
            value={"Received"}
          />
          <Tab
            key={"Sent"}
            label={"Sent"}
            value={"Sent"}
          />
        </Tabs>
        <Box marginLeft={2} marginTop={3}>
          <SelectButton
            onClick={() => { isRecieve ? handleTabChange(TabIndex.Received) : handleTabChange(TabIndex.Send) }}
            selected={[TabIndex.Send, TabIndex.Received].includes(currentTab)}
            style={{ marginRight: `${theme.unit}px` }}
            variant={"outlined"}>
            Tokens
          </SelectButton>
          <SelectButton
            onClick={() => { isRecieve ? handleTabChange(TabIndex.NFTReceived) : handleTabChange(TabIndex.NFTSend) }}
            selected={[TabIndex.NFTReceived, TabIndex.NFTSend].includes(currentTab)}
            style={{ marginRight: `${theme.unit}px` }}
            variant={"outlined"}>
            NFTs
          </SelectButton>
          {isRecieve && <SelectButton
            onClick={() => { handleTabChange(TabIndex.BlindBoxReceived) }}
            selected={[TabIndex.BlindBoxReceived].includes(currentTab)}
            variant={"outlined"}>
            Blind Box
          </SelectButton>}
        </Box>
        {[TabIndex.Received, TabIndex.NFTReceived].includes(currentTab) && (
          <Box className="tableWrapper table-divide-short">
            <RedPacketReceiveTable
              {...{
                tokenType: (currentTab === TabIndex.NFTReceived || currentTab === TabIndex.NFTSend)
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
              }}
            />
          </Box>
        )}
        {currentTab === TabIndex.BlindBoxReceived && (
          <Box className="tableWrapper table-divide-short">
          <RedPacketBlindBoxReceiveTable
            onItemClick={onReceiveItemClick_BlindBox}
            showloading={showloadingReceive_BlindBox}
            forexMap={forexMap}
            etherscanBaseUrl={etherscanBaseUrl}
            rawData={redPacketReceiveList_BlindBox}
            getRedPacketReceiveList={getRedPacketReceiveList_BlindBox}
            pagination= {{
              pageSize: pageSize,
              total: redPacketReceiveTotal_BlindBox,
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
