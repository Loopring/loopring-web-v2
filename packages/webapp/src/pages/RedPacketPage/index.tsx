import React from "react";
import { Box } from "@mui/material";
import { CreateRedPacketPanel } from "@loopring-web/component-lib";
import { useRouteMatch } from "react-router-dom";
import { ViewAccountTemplate } from "@loopring-web/core";

import { RedPacketMarketPanel } from "./RedPacketMarketPanel";
import { ReadRedPacketPanel } from "./ReadRedPacketPanel";
import { MyRedPacketPanel } from "./MyRedPacketPanel";

export const RedPacketPage = () => {
  let match: any = useRouteMatch("/redpacket/:item");
  const selected = match?.params.item ?? "markets";
  const reaPacketRouter = React.useMemo(() => {
    switch (selected) {
      case "create":
        return <CreateRedPacketPanel accAddr={} />;
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
