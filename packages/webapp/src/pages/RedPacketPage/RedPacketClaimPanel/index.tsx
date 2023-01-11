import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { StylePaper, useSystem } from "@loopring-web/core";
import {
  RedPacketClaimTable,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";

import React from "react";
import { useTranslation } from "react-i18next";
import { RedPacketIcon } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import { useClaimRedPacket, useMarketRedPacket } from "./hooks";

export const RedPacketClaimPanel = () => {
  const theme = useTheme();
  const container = React.useRef<HTMLDivElement>(null);
  const {forexMap} = useSystem();
  // const { forexMap } = u();
  const {setShowAccount} = useOpenModals();
  const {t} = useTranslation();
  const {isMobile} = useSettings();
  const history = useHistory();
  const {
    luckTokenList,
    showLoading,
    showOfficial,
    setShowOfficial,
    getClaimRedPacket,
    handlePageChange,
  } = useClaimRedPacket();
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? {maxWidth: "calc(100vw - 32px)"} : {}}
    >
      <Box
        position={"absolute"}
        display={"flex"}
        alignItems={"center"}
        sx={{
          right: 2 * theme.unit,
          top: -42,
          zIndex: 99,
        }}
      >
        <Button
          startIcon={<RedPacketIcon fontSize={"small"}/>}
          variant={"contained"}
          size={"medium"}
          sx={{color: "var(--color-text-secondary)"}}
          color={"inherit"}
          onClick={() => history.push("/redPacket/markets")}
        >
          {t("labelRedPacketMarketsBtn")}
        </Button>
      </Box>
      <StylePaper
        ref={container}
        flex={1}
        display={"flex"}
        flexDirection={"column"}
      >
        <Box className="tableWrapper table-divide-short">
          <RedPacketClaimTable
            rawData={luckTokenList}
            showloading={showLoading}
            forexMap={forexMap}
            onItemClick={() => void}
            etherscanBaseUrl
            getMyRedPacketClaimList
          />
          {/*<AssetsTable*/}
          {/*  /!*{...{*!/*/}
          {/*  /!*  rawData: assetsRawData,*!/*/}
          {/*  /!*  disableWithdrawList,*!/*/}
          {/*  /!*  showFilter: true,*!/*/}
          {/*  /!*  allowTrade,*!/*/}
          {/*  /!*  onSend,*!/*/}
          {/*  /!*  onReceive,*!/*/}
          {/*  /!*  getMarketArrayListCallback: getTokenRelatedMarketArray,*!/*/}
          {/*  /!*  hideInvestToken,*!/*/}
          {/*  /!*  forexMap: forexMap as any,*!/*/}
          {/*  /!*  hideSmallBalances,*!/*/}
          {/*  /!*  setHideLpToken,*!/*/}
          {/*  /!*  setHideSmallBalances,*!/*/}
          {/*  /!*  ...rest,*!/*/}
          {/*  /!*}}*!/*/}
          {/*/>*/}
        </Box>
      </StylePaper>
    </Box>
  );
};
