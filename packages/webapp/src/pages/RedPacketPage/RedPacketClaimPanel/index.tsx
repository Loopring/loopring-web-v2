import { useTheme } from "@emotion/react";
import React from "react";
import {
  StylePaper,
  useSystem,
  useToast,
  useWalletLayer2,
} from "@loopring-web/core";
import {
  EmptyDefault,
  RedPacketClaimTable,
  Toast,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useClaimRedPacket } from "./hooks";
import { Box, Button } from "@mui/material";
import {
  RedPacketIcon,
  SagaStatus,
  TOAST_TIME,
} from "@loopring-web/common-resources";

export const RedPacketClaimPanel = () => {
  const container = React.useRef<HTMLDivElement>(null);
  const { etherscanBaseUrl, forexMap } = useSystem();
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { status: walletLayer2Status } = useWalletLayer2();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const history = useHistory();
  const { redPacketClaimList, showLoading, getClaimRedPacket, onItemClick } =
    useClaimRedPacket(setToastOpen);

  React.useEffect(() => {
    if (getClaimRedPacket && walletLayer2Status === SagaStatus.UNSET) {
      getClaimRedPacket();
    }
  }, [walletLayer2Status]);

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
        {!!redPacketClaimList.length ? (
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
          </Box>
        ) : (
          <Box flex={1} height={"100%"} width={"100%"}>
            <EmptyDefault
              height={"calc(100% - 35px)"}
              message={() => {
                return <Trans i18nKey="labelNoContent">Content is Empty</Trans>;
              }}
            />
          </Box>
        )}
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
