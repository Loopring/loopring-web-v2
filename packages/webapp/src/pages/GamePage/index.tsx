import { useRouteMatch } from "react-router-dom";

import { Box } from "@mui/material";
import { Toast, useSettings } from "@loopring-web/component-lib";
import { subMenuNFT, TOAST_TIME } from "@loopring-web/common-resources";
import React from "react";
import {
  useMyCollection,
  useNFTMintAdvance,
  ViewAccountTemplate,
} from "@loopring-web/core";
import { useTranslation } from "react-i18next";
import { SlayTheWeb } from "./ui/index";

export const subMenu = subMenuNFT;

export const Game = () => {
  const { t } = useTranslation(["common"]);

  const { isMobile } = useSettings();

  return (
    <div id="game-root">
      <SlayTheWeb />
    </div>
  );
};
