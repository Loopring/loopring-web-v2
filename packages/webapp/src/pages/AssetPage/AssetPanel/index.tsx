import { useDeepCompareEffect } from "react-use";
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";

import { Box, Tab, Tabs } from "@mui/material";
import styled from "@emotion/styled";
import {
  AssetsTable,
  AssetTitle,
  useSettings,
} from "@loopring-web/component-lib";

import { useTokenMap, StylePaper, useSystem } from "@loopring-web/core";
import { useGetAssets } from "./hook";
import React from "react";
import { useHistory } from "react-router-dom";

enum TabIndex {
  Tokens = "Tokens",
  Invests = "Invests",
}

const StyleTitlePaper = styled(Box)`
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const AssetPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const container = React.useRef(null);
    const { disableWithdrawList } = useTokenMap();
    const { forexMap } = useSystem();
    const { isMobile } = useSettings();

    const [currentTab] = React.useState<TabIndex>(TabIndex.Tokens);
    const history = useHistory();
    const handleTabChange = (value: TabIndex) => {
      switch (value) {
        case TabIndex.Invests:
          history.push("/invest/balance");
          break;
        //   return <AssetPanel />;
        // case "history":
        //   return <HistoryPanel />;
        // default:
      }
    };
    const {
      assetsRawData,
      assetTitleProps,
      getTokenRelatedMarketArray,
      onSend,
      onReceive,
      hideInvestToken,
      hideSmallBalances,
      allowTrade,
      setHideLpToken,
      setHideSmallBalances,
    } = useGetAssets();

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
              }}
            />
          </StyleTitlePaper>
        )}

        <StylePaper
          marginY={2}
          ref={container}
          className={"MuiPaper-elevation2"}
        >
          <Tabs
            value={currentTab}
            onChange={(_event, value) => handleTabChange(value)}
            aria-label="l2-history-tabs"
            variant="scrollable"
          >
            <Tab label={t("labelAssetTokens")} value={TabIndex.Tokens} />
            <Tab label={t("labelAssetMyInvest")} value={TabIndex.Invests} />
          </Tabs>
          <Box className="tableWrapper table-divide-short">
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
          </Box>
        </StylePaper>
      </>
    );
  }
);

export default AssetPanel;
