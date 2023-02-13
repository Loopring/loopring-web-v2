import { WithTranslation, withTranslation } from "react-i18next";

import { Box, Tab, Tabs } from "@mui/material";
import styled from "@emotion/styled";
import {
  AssetsTable,
  AssetTitle,
  AssetTitleProps,
  TradeBtnStatus,
  useSettings,
} from "@loopring-web/component-lib";

import { StylePaper, useSystem, useTokenMap } from "@loopring-web/core";
import { AssetPanelProps, useGetAssets } from "./hook";
import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import MyLiquidity from "../../InvestPage/MyLiquidityPanel";
import { SoursURL, TradeStatus } from "@loopring-web/common-resources";

enum TabIndex {
  Tokens = "Tokens",
  Invests = "Invests",
  RedPacket = "RedPacket",
}

const StyleTitlePaper = styled(Box)`
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const AssetPanel = withTranslation("common")(
  ({
    t,
    assetTitleProps,
    assetPanelProps: {
      assetsRawData,
      getTokenRelatedMarketArray,
      onSend,
      assetBtnStatus,
      onReceive,
      hideInvestToken,
      hideSmallBalances,
      allowTrade,
      setHideLpToken,
      setHideSmallBalances,
    },
    ...rest
  }: {
    assetTitleProps: AssetTitleProps;
    assetPanelProps: AssetPanelProps; //AssetPanelProps;
  } & WithTranslation) => {
    const container = React.useRef(null);
    const { disableWithdrawList } = useTokenMap();
    const { forexMap } = useSystem();
    const { isMobile } = useSettings();
    const match: any = useRouteMatch("/l2assets/:assets?/:item?");

    const [currentTab, setCurrentTab] = React.useState<TabIndex>(
      TabIndex.Tokens
    );
    const history = useHistory();
    const handleTabChange = (value: TabIndex) => {
      switch (value) {
        case TabIndex.Invests:
          history.replace("/l2assets/assets/Invests");
          setCurrentTab(TabIndex.Invests);
          break;
        case TabIndex.RedPacket:
          history.replace("/l2assets/assets/RedPacket");
          setCurrentTab(TabIndex.RedPacket);
          break;
        case TabIndex.Tokens:
        default:
          history.replace("/l2assets/assets/Tokens");
          setCurrentTab(TabIndex.Tokens);
          break;
      }
    };
    React.useEffect(() => {
      handleTabChange(match?.params.item ?? TabIndex.Tokens);
    }, [match?.params.item]);

    return (
      <>
        {!isMobile && (
          <StyleTitlePaper
            paddingX={3}
            paddingY={5 / 2}
            className={"MuiPaper-elevation2"}
          >
            <AssetTitle
              {...{
                t,
                ...rest,
                assetBtnStatus,
                ...assetTitleProps,
              }}
            />
          </StyleTitlePaper>
        )}

        <Tabs
          value={currentTab}
          onChange={(_event, value) => handleTabChange(value)}
          aria-label="l2-history-tabs"
          variant="scrollable"
        >
          <Tab label={t("labelAssetTokens")} value={TabIndex.Tokens} />
          <Tab label={t("labelAssetMyInvest")} value={TabIndex.Invests} />
          {/*{!isMobile && (*/}
          {/*  <Tab label={t("labelAssetRedPackets")} value={TabIndex.RedPacket} />*/}
          {/*)}*/}
        </Tabs>
        {currentTab === TabIndex.Tokens && (
          <StylePaper
            marginTop={1}
            marginBottom={2}
            ref={container}
            className={"MuiPaper-elevation2"}
          >
            <Box className="tableWrapper table-divide-short">
              {assetBtnStatus === TradeBtnStatus.LOADING ? (
                <Box
                  flex={1}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  height={"90%"}
                >
                  <img
                    className="loading-gif"
                    alt={"loading"}
                    width="36"
                    src={`${SoursURL}images/loading-line.gif`}
                  />
                </Box>
              ) : (
                <AssetsTable
                  {...{
                    rawData: assetsRawData,
                    disableWithdrawList,
                    showFilter: true,
                    allowTrade,
                    onSend,
                    onReceive,

                    getMarketArrayListCallback: getTokenRelatedMarketArray,
                    hideInvestToken,
                    forexMap: forexMap as any,
                    hideSmallBalances,
                    setHideLpToken,
                    setHideSmallBalances,
                    ...rest,
                  }}
                />
              )}
            </Box>
          </StylePaper>
        )}
        {currentTab === TabIndex.Invests && <MyLiquidity isHideTotal={true} />}
        {/*{!isMobile && currentTab === TabIndex.RedPacket && (*/}
        {/*  <RedPacketClaimPanel />*/}
        {/*)}*/}
      </>
    );
  }
);
