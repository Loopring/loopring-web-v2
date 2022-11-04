import {
  CloseIcon,
  headerRoot,
  hexToRGB,
  myLog,
} from "@loopring-web/common-resources";

import { Box, IconButton, Toolbar, Typography } from "@mui/material";

import { useHeader } from "./hook";
import { confirmation, useSystem, useAccount } from "@loopring-web/core";
import { withTranslation } from "react-i18next";

import {
  BottomRule,
  Header as HeaderUI,
  HideOnScroll,
  useSettings,
} from "@loopring-web/component-lib";
import { withRouter, useLocation } from "react-router-dom";
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
      const [view, setView] = React.useState(true);
      // myLog("headerToolBarData", headerToolBarData);
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

          <Box
            display={view ? "flex" : "none"}
            alignItems={"center"}
            justifyContent={"center"}
            position={"fixed"}
            top={58}
            right={0}
            left={0}
            sx={{ background: hexToRGB("#FBA95C", "0.8") }}
            width={"100%"}
          >
            <Typography color={"white"} padding={2}>
              We are currently experiencing a DDOS attack. The external services
              are temporarily unstable, while it won't impact the blockchain
              security. Our engineers are working hard to resolve this issue. We
              will keep you updated. As always your assets are safe on Loopring
            </Typography>
            <IconButton
              size={"large"}
              aria-label={t("labelClose")}
              color={"inherit"}
              onClick={(event) => {
                setView(false);
              }}
            >
              <CloseIcon htmlColor={"white"} />
            </IconButton>
          </Box>
        </>
      );
    }
  )
);

export default Header;
