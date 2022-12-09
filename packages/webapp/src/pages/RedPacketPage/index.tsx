import React from "react";
import { Box } from "@mui/material";
import { Button } from "@loopring-web/component-lib";
import { BackIcon } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StylePaper } from "@loopring-web/core";

export const RedPacketPage = () => {
  const history = useHistory();
  const { t } = useTranslation();
  return (
    <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
      <Box
        marginBottom={2}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={() => {
            history.push("/l2assets/redpacket");
          }}
        >
          {t("labelRedPacketTitle")}
        </Button>
      </Box>
      <StylePaper
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        flex={1}
      ></StylePaper>
    </Box>
  );
};
