import { useRouteMatch } from "react-router-dom";

import { Box } from "@mui/material";
import { AssetTitleMobile, useSettings } from "@loopring-web/component-lib";
import { subMenuLayer2 } from "@loopring-web/common-resources";

import AssetPanel from "./AssetPanel";
import HistoryPanel from "./HistoryPanel";
import React from "react";
import { ViewAccountTemplate } from "@loopring-web/core";
import { useGetAssets } from "./AssetPanel/hook";

export const subMenu = subMenuLayer2;

export const AssetPage = () => {
  let match: any = useRouteMatch("/l2assets/:item");
  const selected = match?.params.item ?? "assets";
  const { assetTitleProps, assetTitleMobileExtendProps } = useGetAssets();
  const layer2Router = React.useMemo(() => {
    switch (selected) {
      case "assets":
        return <AssetPanel />;
      case "history":
        return <HistoryPanel />;
      default:
        <AssetPanel />;
    }
  }, [selected]);
  const { isMobile } = useSettings();
  const activeView = React.useMemo(
    () => (
      <>
        <Box
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
