import { headerRoot } from "@loopring-web/common-resources";

import { Toolbar } from "@mui/material";

import { useHeader } from "./hook";
import { withTranslation } from "react-i18next";

import {
  BottomRule,
  Header as HeaderUI,
  HideOnScroll,
} from "@loopring-web/component-lib";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import React from "react";

const Header = withTranslation("common")(
  withRouter(
    ({
      t,
      location,
      isHideOnScroll = false,
      ...rest
    }: any & RouteComponentProps) => {
      const { headerToolBarData, headerMenuData, notifyMap } = useHeader();

      // const {allowTrade} = useSystem()

      return (
        <>
          {isHideOnScroll ? (
            <HideOnScroll window={undefined}>
              <HeaderUI
                isWrap={false}
                {...rest}
                allowTrade={false}
                notification={notifyMap}
                headerMenuData={[]}
                headerToolBarData={headerToolBarData}
                selected={
                  location.pathname === "/" ? headerRoot : location.pathname
                }
              />
            </HideOnScroll>
          ) : (
            <HeaderUI
              {...rest}
              allowTrade={false}
              headerMenuData={headerMenuData}
              headerToolBarData={headerToolBarData}
              notification={notifyMap}
              selected={
                location.pathname === "/" ? headerRoot : location.pathname
              }
            />
          )}
          <Toolbar />
          {/* <BottomRule isShow={!confirmation?.confirmed} */}
          <BottomRule
            isShow={false}
            content={t("labelAgreeLoopringTxt")}
            btnTxt={t("labelCookiesAgree")}
          />
        </>
      );
    }
  )
);

export default Header;
