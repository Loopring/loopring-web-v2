import { headerRoot } from "@loopring-web/common-resources";

import { Toolbar } from "@mui/material";

import { useHeader } from "./hook";
import { confirmation, useAccount, useSystem } from "@loopring-web/core";
import { withTranslation } from "react-i18next";

import {
  BottomRule,
  Header as HeaderUI,
  HideOnScroll,
  useSettings,
} from "@loopring-web/component-lib";
import { useLocation, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import React from "react";

const Header = withTranslation("common")(
  withRouter(
    ({
      t,
      location,
      isLandPage = false,
      ...rest
    }: any & RouteComponentProps) => {
      const { headerToolBarData, notifyMap, headerMenuLandingData } =
        useHeader();
      const { isMobile } = useSettings();
      const { pathname } = useLocation();
      const { confirmWrapper } = confirmation.useConfirmation();
      const { allowTrade } = useSystem();
      const { account } = useAccount();
      return (
        <>
          <HideOnScroll window={undefined}>
            <HeaderUI
              {...rest}
              account={account}
              allowTrade={allowTrade}
              isMobile={isMobile}
              // isLandPage={true}
              // isWrap={false}
              headerMenuData={headerMenuLandingData}
              headerToolBarData={headerToolBarData}
              notification={notifyMap}
              selected={
                location.pathname === "/" ? headerRoot : location.pathname
              }
            />
          </HideOnScroll>
          <Toolbar id="back-to-top-anchor" />
          {/* <BottomRule isShow={!confirmation?.confirmed} */}
          <BottomRule
            isShow={false}
            content={t("labelAgreeLoopringTxt")}
            btnTxt={t("labelCookiesAgree")}
            clickToConfirm={() => confirmWrapper()}
          />
        </>
      );
    }
  )
);

export default Header;
