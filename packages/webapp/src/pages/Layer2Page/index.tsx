import { useRouteMatch } from "react-router-dom";

import { Box, Container } from "@mui/material";

import React from "react";
import { ViewAccountTemplate } from "@loopring-web/core";
import { SecurityPanel } from "./SecurityPanel";
import { VipPanel } from "./VipPanel";
import { ForcewithdrawPanel } from "./ForcewithdrawPanel";
import { ReferralRewardsPanel } from "./ReferralRewardsPanel";
import { ContactPage } from "./ContactPanel";
import {
  Layer2L2Router,
  Layer2L2RouterIndex,
  MapChainId,
} from "@loopring-web/common-resources";
import { useSettings } from "@loopring-web/component-lib";

export const Layer2Page = () => {
  let match: any = useRouteMatch("/layer2/:item");
  const selected = match?.params.item ?? "assets";
  const { defaultNetwork } = useSettings();

  const layer2Router = React.useMemo(() => {
    let _selected;

    if (Layer2L2RouterIndex[MapChainId[defaultNetwork]]?.includes(selected)) {
      _selected = selected;
    } else {
      _selected = "";
    }
    switch (_selected) {
      case Layer2L2Router.forcewithdraw:
        return <ForcewithdrawPanel />;
      case Layer2L2Router.security:
        return <SecurityPanel />;
      case Layer2L2Router.vip:
        return <VipPanel />;
      case Layer2L2Router.contact:
        return <ContactPage />;
      default:
        return <VipPanel />;
    }
  }, [selected]);

  return selected === Layer2L2Router.referralrewards ? (
    <Box flex={1} display={"flex"} flexDirection={"column"}>
      <ReferralRewardsPanel />
    </Box>
  ) : (
    <Container
      maxWidth="lg"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <Box
        display={"flex"}
        flex={1}
        alignItems={"stretch"}
        flexDirection={"column"}
        marginTop={3}
      >
        <ViewAccountTemplate activeViewTemplate={layer2Router} />
      </Box>
    </Container>
  );
  // <>{viewTemplate}</>;
};
