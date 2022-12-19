import React from "react";
import { Box, Button } from "@mui/material";
import { CreateRedPacketPanel } from "@loopring-web/component-lib";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  RedPacketOrderData,
  useCreateRedPacket,
  ViewAccountTemplate,
} from "@loopring-web/core";

import { RedPacketMarketPanel } from "./RedPacketMarketPanel";
import { ReadRedPacketPanel } from "./ReadRedPacketPanel";
import { MyRedPacketPanel } from "./MyRedPacketPanel";
import { BackIcon, FeeInfo } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";

export const RedPacketPage = <
  T extends RedPacketOrderData<I>,
  I extends any,
  F extends FeeInfo,
  LuckInfo
>() => {
  let match: any = useRouteMatch("/redpacket/:item");
  const selected = match?.params.item ?? "markets";
  const history = useHistory();
  const { t } = useTranslation();
  const createRedPacketViewProps = useCreateRedPacket<T, I, F, LuckInfo>();
  const reaPacketRouter = React.useMemo(() => {
    switch (selected) {
      case "create":
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
                onClick={() => history.push("/l2assets")}
              >
                {t("labelRedPacketMarkets")}
              </Button>
            </Box>
            <CreateRedPacketPanel
              {...{ ...(createRedPacketViewProps as any) }}
            />
          </Box>
        );
      case "records":
        return <MyRedPacketPanel />;
      case "reader":
        return <ReadRedPacketPanel />;
      case "markets":
        return <RedPacketMarketPanel />;
      default:
        <RedPacketMarketPanel />;
    }
  }, [selected]);
  const activeView = React.useMemo(
    () => (
      <>
        <Box
          // minHeight={420}
          display={"flex"}
          alignItems={"stretch"}
          flexDirection={"column"}
          marginTop={0}
          flex={1}
        >
          {reaPacketRouter}
        </Box>
      </>
    ),
    [reaPacketRouter]
  );
  return <ViewAccountTemplate activeViewTemplate={activeView} />;
};
