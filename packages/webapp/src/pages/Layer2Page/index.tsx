import { useRouteMatch } from "react-router-dom";

import { Box } from "@mui/material";

import React from "react";
import { ViewAccountTemplate } from "@loopring-web/core";
import { SecurityPanel } from "./SecurityPanel";
import { VipPanel } from "./VipPanel";
import { ReferralRewardsPanel } from "./ReferralRewardsPanel";
import { ForcewithdrawPanel } from "./ForcewithdrawPanel";
import { Layer2RouterID } from "@loopring-web/common-resources";

export const Layer2Page = () => {
  let match: any = useRouteMatch("/layer2/:item");
  const selected = match?.params.item ?? "assets";
  const layer2Router = React.useMemo(() => {
    switch (selected.toLocaleLowerCase()) {
      case Layer2RouterID.referralRewards:
        return <ReferralRewardsPanel />;
      case Layer2RouterID.forcewithdraw:
        return <ForcewithdrawPanel />;
      case Layer2RouterID.security:
        return <SecurityPanel />;
      case Layer2RouterID.vip:
        return <VipPanel />;
      default:
        <VipPanel />;
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
          {layer2Router}
        </Box>
      </>
    ),
    [layer2Router]
  );
  return <ViewAccountTemplate activeViewTemplate={activeView} />;
  // <>{viewTemplate}</>;
};
