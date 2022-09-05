import { useDeepCompareEffect } from "react-use";
import { WithTranslation, withTranslation } from "react-i18next";

import { Box } from "@mui/material";
import styled from "@emotion/styled";
import {
  AssetsTable,
  AssetTitle,
  useSettings,
} from "@loopring-web/component-lib";

import { useTokenMap, StylePaper, useSystem } from "@loopring-web/core";
import { useGetAssets } from "./hook";
import React from "react";

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

    const {
      marketArray,
      assetsRawData,
      // userAssets,
      assetTitleProps,
      // onShowTransfer,
      // onShowWithdraw,
      // onShowDeposit,
      getTokenRelatedMarketArray,
      onSend,
      onReceive,
      // total,
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
          marginTop={2}
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
