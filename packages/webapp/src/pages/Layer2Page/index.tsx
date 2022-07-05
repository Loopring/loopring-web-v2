import { useRouteMatch } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import {
  AssetTitleMobile,
  SubMenu,
  SubMenuList,
  useSettings,
} from "@loopring-web/component-lib";
import { subMenuLayer2 } from "@loopring-web/common-resources";

import AssetPanel from "./AssetPanel";
import HistoryPanel from "./HistoryPanel";
import OrderPanel from "./OrderPanel";
import React from "react";
import { ViewAccountTemplate } from "@loopring-web/core";
import { SecurityPanel } from "./SecurityPanel";
import { VipPanel } from "./VipPanel";
import { RewardPanel } from "./RewardPanel";
import { RedPockPanel } from "./RedPockPanel";
import { useGetAssets } from "./AssetPanel/hook";
import { ForcewithdrawPanel } from "./ForcewithdrawPanel";

export const subMenu = subMenuLayer2;

export const Layer2Page = () => {
  let match: any = useRouteMatch("/layer2/:item");
  const selected = match?.params.item ?? "assets";
  const { assetTitleProps, assetTitleMobileExtendProps } = useGetAssets();
  const layer2Router = React.useMemo(() => {
    switch (selected) {
      case "assets":
        return <AssetPanel />;
      case "history":
        return <HistoryPanel />;
      case "order":
        return <OrderPanel />;
      case "redpock":
        return <RedPockPanel />;
      case "rewards":
        return <RewardPanel />;
      case "forcewithdraw":
        return <ForcewithdrawPanel />;
      case "security":
        return <SecurityPanel />;
      case "vip":
        return <VipPanel />;
      default:
        <AssetPanel />;
    }
  }, [selected]);
  const { isMobile } = useSettings();
  const activeView = React.useMemo(
    () => (
      <>
        {/*{!isMobile && (*/}
        {/*  <Box*/}
        {/*    width={"200px"}*/}
        {/*    display={"flex"}*/}
        {/*    justifyContent={"stretch"}*/}
        {/*    marginRight={3}*/}
        {/*    marginBottom={2}*/}
        {/*    className={"MuiPaper-elevation2"}*/}
        {/*  >*/}
        {/*    <SubMenu>*/}
        {/*      <SubMenuList selected={selected} subMenu={subMenu as any} />*/}
        {/*    </SubMenu>*/}
        {/*  </Box>*/}
        {/*)}*/}

        <Box
          // minHeight={420}
          display={"flex"}
          alignItems={"stretch"}
          flexDirection={"column"}
          marginTop={0}
          flex={1}
        >
          {isMobile && (
            <AssetTitleMobile
              {...{ ...assetTitleProps, ...assetTitleMobileExtendProps }}
            />
          )}
          {layer2Router}
        </Box>
      </>
    ),
    [
      assetTitleMobileExtendProps,
      assetTitleProps,
      isMobile,
      layer2Router,
      selected,
    ]
  );
  return <ViewAccountTemplate activeViewTemplate={activeView} />;
  // <>{viewTemplate}</>;
};
