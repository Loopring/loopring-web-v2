import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { StylePaper } from "@loopring-web/core";
import {
  AmmTable,
  DefiTxsTable,
  DualTxsTable,
  OrderHistoryTable,
  Toast,
  TradeTable,
  TransactionTable,
  useSettings,
} from "@loopring-web/component-lib";
import {
  AddIcon,
  CheckBoxIcon,
  CheckedIcon,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

export const MyRedPacketPanel = () => {
  const theme = useTheme();
  const container = React.useRef<HTMLDivElement>(null);
  const history = useHistory();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  return (
    <Box
      flex={1}
      display={"flex"}
      sx={isMobile ? { maxWidth: "calc(100vw - 32px)" } : {}}
    >
      <Box display={"flex"} flexDirection={isMobile ? "column" : "row"}>
        <Button
          onClick={() => {
            history.push("/redpacket");
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
