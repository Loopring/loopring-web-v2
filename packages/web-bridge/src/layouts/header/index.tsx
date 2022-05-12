import { headerRoot } from "@loopring-web/common-resources";

import { Toolbar } from "@mui/material";

import { useHeader } from "./hook";
import { confirmation, useSystem, useAccount } from "@loopring-web/core";
import { withTranslation } from "react-i18next";

import {
  BottomRule,
  Header as HeaderUI,
  HideOnScroll,
  useSettings,
} from "@loopring-web/component-lib";
import { withRouter, useHistory, useLocation } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import React from "react";

const Header = withTranslation("common")(
  withRouter(
    ({
      t,
      location,
      isHideOnScroll = false,
      isLandPage = false,
      ...rest
    }: any & RouteComponentProps) => {
      const {
        headerToolBarData,
        headerMenuData,
        notifyMap,
        headerMenuLandingData,
      } = useHeader();
      const { isMobile } = useSettings();
      const { pathname } = useLocation();
      const { confirmWrapper } = confirmation.useConfirmation();
      const { allowTrade } = useSystem();
      const { account } = useAccount();
      return (
        <>
          {isHideOnScroll ? (
            <HideOnScroll window={undefined}>
              <HeaderUI
                account={account}
                isWrap={isLandPage}
                {...rest}
                isLandPage={isLandPage}
                isMobile={isMobile}
                allowTrade={allowTrade}
                headerMenuData={
                  /(guardian)|(depositto)/gi.test(pathname)
                    ? headerMenuLandingData
                    : headerMenuData
                }
                headerToolBarData={headerToolBarData}
                notification={notifyMap}
                selected={
                  location.pathname === "/" ? headerRoot : location.pathname
                }
              />
            </HideOnScroll>
          ) : (
            <HeaderUI
              {...rest}
              account={account}
              allowTrade={allowTrade}
              isMobile={isMobile}
              headerMenuData={
                /(guardian)|(depositto)/gi.test(pathname)
                  ? headerMenuLandingData
                  : headerMenuData
              }
              headerToolBarData={headerToolBarData}
              notification={notifyMap}
              selected={
                location.pathname === "/" ? headerRoot : location.pathname
              }
            />
          )}
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
