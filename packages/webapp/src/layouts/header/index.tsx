import { headerRoot } from "@loopring-web/common-resources";

import { Container, Toolbar } from "@mui/material";

import { useHeader } from "./hook";
import { useConfirmation } from "stores/localStore/confirmation";
import { withTranslation } from "react-i18next";

import {
  BottomRule,
  Header as HeaderUI,
  HideOnScroll,
} from "@loopring-web/component-lib";
import { withRouter, useHistory } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import React from "react";
import { useSystem } from "../../stores/system";

const Header = withTranslation("common")(
  withRouter(
    ({
      t,
      location,
      isHideOnScroll = false,
      isLandPage = false,
      ...rest
    }: any & RouteComponentProps) => {
      const { headerToolBarData, headerMenuData, notifyMap } = useHeader();

      const { confirmWrapper } = useConfirmation();
      const { allowTrade } = useSystem();

      return (
        <>
          {isHideOnScroll ? (
            <HideOnScroll window={undefined}>
              <HeaderUI
                isWrap={isLandPage}
                {...rest}
                isLandPage={isLandPage}
                allowTrade={allowTrade}
                headerMenuData={headerMenuData}
                headerToolBarData={headerToolBarData}
                notification={notifyMap}
                selected={
                  location.pathname === "/" ? headerRoot : location.pathname
                }
              ></HeaderUI>
            </HideOnScroll>
          ) : (
            <HeaderUI
              {...rest}
              allowTrade={allowTrade}
              headerMenuData={headerMenuData}
              headerToolBarData={headerToolBarData}
              notification={notifyMap}
              selected={
                location.pathname === "/" ? headerRoot : location.pathname
              }
            ></HeaderUI>
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
