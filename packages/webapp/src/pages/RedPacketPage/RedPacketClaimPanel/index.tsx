import { useTheme } from "@emotion/react";
import React from "react";
import { StylePaper, useSystem, useToast } from "@loopring-web/core";
import {
  RedPacketClaimTable,
  Toast,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useClaimRedPacket } from "./hooks";
import { Box, Button } from "@mui/material";
import { RedPacketIcon, TOAST_TIME } from "@loopring-web/common-resources";

export const RedPacketClaimPanel = () => {
  const theme = useTheme();
  const container = React.useRef<HTMLDivElement>(null);
  const { etherscanBaseUrl, forexMap } = useSystem();
  const { setShowAccount } = useOpenModals();
  const { toastOpen, setToastOpen, closeToast } = useToast();

  // const { forexMap } = u();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const history = useHistory();
  const {
    redPacketClaimList,
    showLoading,
    // redPacketClaimTotal,
    getClaimRedPacket,
    onItemClick,
  } = useClaimRedPacket(setToastOpen);
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
      paddingTop={2}
      position={"relative"}
    >
      <Box
        position={"absolute"}
        display={"flex"}
        alignItems={"center"}
        sx={{
          right: 0,
          top: -42,
          zIndex: 99,
        }}
      >
        <Button
          startIcon={<RedPacketIcon fontSize={"small"} />}
          variant={"contained"}
          size={"small"}
          // sx={{ color: "var(--color-text-secondary)" }}
          color={"primary"}
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
            {...{
              rawData: redPacketClaimList,
              showloading: showLoading,
              forexMap,
              onItemClick,
              etherscanBaseUrl,
              getClaimRedPacket,
            }}
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
      <Toast
        alertText={toastOpen?.content ?? ""}
        severity={toastOpen?.type ?? "success"}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </Box>
  );
};
