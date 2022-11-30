import { Box, Button } from "@mui/material";
import { useTheme } from "@emotion/react";
import { StylePaper } from "@loopring-web/core";
import { useSettings } from "@loopring-web/component-lib";

import React from "react";
import { useTranslation } from "react-i18next";
import { BackIcon, QRIcon, ScanQRIcon } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";

export const RedPacketMarketPanel = () => {
  const theme = useTheme();
  const container = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const history = useHistory();
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={() => history.push("/l2assets")}
        >
          {t("labelRedPacketMarkets")}
        </Button>
        <Box display={"flex"} alignItems={"center"} justifyContent={"flex-end"}>
          <Button
            variant={"outlined"}
            size={"medium"}
            color={"inherit"}
            sx={{ marginLeft: 1 }}
            onClick={() => history.push("/redpacket/create")}
          >
            {t("labelCreateRedPacket")}
          </Button>
          <Button
            variant={"outlined"}
            size={"medium"}
            color={"inherit"}
            sx={{ marginLeft: 1 }}
            onClick={() => history.push("/redpacket/records")}
          >
            {t("labelMyRedPacket")}
          </Button>
          <Button
            startIcon={<ScanQRIcon fontSize={"small"} />}
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1 }}
            onClick={() => history.push("/l2assets/reader")}
          >
            {t("labelRedPacketQRCodeImport")}
          </Button>
        </Box>
      </Box>
      <StylePaper ref={container} flex={1}>
        {/*<Toast*/}
        {/*  alertText={toastOpen?.content ?? ""}*/}
        {/*  severity={toastOpen?.type ?? "success"}*/}
        {/*  open={toastOpen?.open ?? false}*/}
        {/*  autoHideDuration={TOAST_TIME}*/}
        {/*  onClose={closeToast}*/}
        {/*/>*/}
        {/*<Box*/}
        {/*  marginTop={2}*/}
        {/*  marginLeft={2}*/}
        {/*  display={"flex"}*/}
        {/*  */}
        {/*>*/}
        {/*    */}
        {/*</Box>*/}
      </StylePaper>
    </Box>
  );
};
