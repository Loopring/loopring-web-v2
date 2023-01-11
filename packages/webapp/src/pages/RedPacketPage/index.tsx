import React from "react";
import { Box } from "@mui/material";
import { useRouteMatch } from "react-router-dom";
import { useToast, ViewAccountTemplate } from "@loopring-web/core";

import { RedPacketMarketPanel } from "./RedPacketMarketPanel";
import { CreateRedPacketUIPanel } from "./CreateRedPacketPanel";
import { MyRedPacketPanel } from "./MyRedPacketPanel";
import { ReadRedPacketPanel } from "./ReadRedPacketPanel";
import { TOAST_TIME } from "@loopring-web/common-resources";
import { Toast } from "@loopring-web/component-lib";

export const RedPacketPage = () => {
  let match: any = useRouteMatch("/redPacket/:item");
  const selected = match?.params.item ?? "markets";
  const { toastOpen, setToastOpen, closeToast } = useToast();

  const reaPacketRouter = React.useMemo(() => {
    switch (selected) {
      case "create":
        return <CreateRedPacketUIPanel />;
      case "records":
        return <MyRedPacketPanel setToastOpen={setToastOpen} />;
      // case "reader":
      //   return <ReadRedPacketPanel />;
      case "markets":
        return <RedPacketMarketPanel />;
      default:
        <RedPacketMarketPanel />;
    }
  }, [selected]);

  const activeView = React.useMemo(
    () => (
      <>
        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
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
