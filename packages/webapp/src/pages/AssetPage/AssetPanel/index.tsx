import { WithTranslation, withTranslation } from "react-i18next";

import { Box, Tab, Tabs } from "@mui/material";
import styled from "@emotion/styled";
import {
  AssetsTable,
  AssetTitle,
  AssetTitleProps,
  useSettings,
} from "@loopring-web/component-lib";

import { StylePaper, useSystem, useTokenMap } from "@loopring-web/core";
import { AssetPanelProps } from "./hook";
import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import MyLiquidity from "../../InvestPage/MyLiquidityPanel";
import { RedPacketClaimPanel } from "../../RedPacketPage/RedPacketClaimPanel";
import {
  AssetL2TabIndex,
  MapChainId,
  TradeBtnStatus,
} from "@loopring-web/common-resources";

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
      onTokenLockHold,
      tokenLockDetail,
    },
    ...rest
  }: {
    assetTitleProps: AssetTitleProps;
    assetPanelProps: AssetPanelProps; //AssetPanelProps;
  } & WithTranslation) => {
    const container = React.useRef(null);
    const { disableWithdrawList } = useTokenMap();
    const { forexMap } = useSystem();
    const { isMobile, defaultNetwork } = useSettings();
    const match: any = useRouteMatch("/l2assets/:assets?/:item?");
    // const TabIndex = ;
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
    const hideAssets = assetTitleProps.hideL2Assets;

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
                ...assetTitleProps,
                assetBtnStatus,
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
          {AssetL2TabIndex[MapChainId[defaultNetwork]] ? (
            AssetL2TabIndex[MapChainId[defaultNetwork]].map((item: string) => {
              return (
                <Tab
                  key={item.toString()}
                  label={t(`labelAsset${item}`)}
                  value={item}
                />
              );
            })
          ) : (
            <>
              <Tab label={t("labelAssetTokens")} value={TabIndex.Tokens} />
              <Tab label={t("labelAssetMyInvest")} value={TabIndex.Invests} />
              {!isMobile && (
                <Tab
                  label={t("labelAssetRedPackets")}
                  value={TabIndex.RedPacket}
                />
              )}
            </>
          )}
        </Tabs>
        {currentTab === TabIndex.Tokens && (
          <StylePaper
            marginTop={1}
            marginBottom={2}
            ref={container}
            className={"MuiPaper-elevation2"}
          >
            <Box className="tableWrapper table-divide-short">
              <AssetsTable
                {...{
                  rawData: assetsRawData,
                  disableWithdrawList,
                  showFilter: true,
                  allowTrade,
                  onSend,
                  onTokenLockHold: onTokenLockHold as any,
                  tokenLockDetail,
                  onReceive,
                  isLoading: assetBtnStatus === TradeBtnStatus.LOADING,
                  getMarketArrayListCallback: getTokenRelatedMarketArray,
                  hideInvestToken,
                  forexMap: forexMap as any,
                  hideSmallBalances,
                  setHideLpToken,
                  setHideSmallBalances,
                  hideAssets,
                  ...rest,
                }}
              />
            </Box>
          </StylePaper>
        )}
        {currentTab === TabIndex.Invests && (
          <MyLiquidity isHideTotal={true} hideAssets={hideAssets} />
        )}
        {!isMobile && currentTab === TabIndex.RedPacket && (
          <RedPacketClaimPanel hideAssets={hideAssets} />
        )}
      </>
    );
  }
);
