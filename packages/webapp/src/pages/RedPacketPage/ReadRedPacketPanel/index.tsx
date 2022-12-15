import { Box, Button } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSettings } from "@loopring-web/component-lib";

import React from "react";
import { useTranslation } from "react-i18next";
import { AddIcon } from "@loopring-web/common-resources";
import { StylePaper } from "@loopring-web/core";
import { useHistory } from "react-router-dom";

export const ReadRedPacketPanel = () => {
  const theme = useTheme();
  const container = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const history = useHistory();
  return (
    <Box
      flex={1}
      display={"flex"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
    >
      <Box display={"flex"} flexDirection={isMobile ? "column" : "row"}>
        <Button
          onClick={() => {
            history.push("/redpacket/market");
          }}
          startIcon={<AddIcon />}
          variant={"contained"}
          size={"small"}
          color={"primary"}
        >
          {t("labelCreateCollection")}
        </Button>
      </Box>
      <StylePaper ref={container} flex={1}></StylePaper>
    </Box>
  );
};
