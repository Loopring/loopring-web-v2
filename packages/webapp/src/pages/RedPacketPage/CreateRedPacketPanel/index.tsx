import { Box, Button } from "@mui/material";
import { CreateRedPacketPanel } from "@loopring-web/component-lib";

import React from "react";
import {
  RedPacketOrderData,
  StylePaper,
  useCreateRedPacket,
} from "@loopring-web/core";
import { BackIcon, FeeInfo } from "@loopring-web/common-resources";
import { useGetAssets } from "../../AssetPage/AssetPanel/hook";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useTheme } from "@emotion/react";

export const CreateRedPacketUIPanel = <
  T extends RedPacketOrderData<I>,
  I extends any,
  F extends FeeInfo
>() => {
  const { assetsRawData } = useGetAssets();
  let match: any = useRouteMatch("/redpacket/:item");

  const history = useHistory();
  const { t } = useTranslation();
  const { createRedPacketProps } = useCreateRedPacket<T, I, F>({
    assetsRawData,
    isShow: match?.params?.item?.toLowerCase() === "create",
  });
  return (
    <Box display={"flex"} flex={1} flexDirection={"column"}>
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
          onClick={() => history.push("/redpacket/markets")}
        >
          {t("labelCreateRedPacketTitle")}
        </Button>
      </Box>
      <StylePaper flex={1} display={"flex"} justifyContent={"center"}>
        <CreateRedPacketPanel
          {...{
            //    _height: DEFAULT_TRANSFER_HEIGHT + 100, ...transferProps, assetsData,
            _height: "auto",
            ...(createRedPacketProps as any),
          }}
        />
      </StylePaper>
    </Box>
  );
};
