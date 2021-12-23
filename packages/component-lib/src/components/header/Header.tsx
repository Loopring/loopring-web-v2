import styled from "@emotion/styled";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
  Grid,
} from "@mui/material";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  HeaderMenuSub,
  HeadMenuItem,
  Layer2Item,
  TabItemPlus,
  Button,
} from "../basic-lib";
import { HeaderProps, HeaderToolBarInterface } from "./Interface";
import {
  ButtonComponentsMap,
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  SoursURL,
  ToolBarAvailableItem,
  ThemeType,
  LightIcon,
  DarkIcon,
  maintainceStatTime,
  maintainceEndTime,
} from "@loopring-web/common-resources";
import {
  BtnDownload,
  BtnNotification,
  BtnSetting,
  WalletConnectBtn,
} from "./toolbar";
import React from "react";
import moment from "moment";
import { useSettings } from "../../stores";

const ButtonStyled = styled(Button)`
  background: linear-gradient(94.92deg, #4169ff 0.91%, #a016c2 103.55%);
  padding-left: ${({ theme }) => 3 * theme.unit}px;
  padding-right: ${({ theme }) => 3 * theme.unit}px;
`;

const GridStyled = styled(Grid)`
  color: ${({ iscurrentroute }: any) =>
    iscurrentroute === "true"
      ? "var(--color-text-button-select)"
      : "var(--color-text-secondary)"};
  &:hover {
    color: var(--color-text-button-select);
  }
  font-size: 1.4rem;
  cursor: pointer;
` as any;

const logoSVG = SoursURL + "svg/logo.svg";
const ToolBarStyled = styled(Toolbar)`
  && {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    padding: 0;
  }
`;
const HeaderStyled = styled(AppBar)`
  && {
    z-index: 400;
    box-shadow: var(--shadow-header);
    height: var(--header-height);
    margin: 0 auto;
    background-color: var(--color-box);
    backdrop-filter: blur(4px);
    box-sizing: border-box;
    ${({ theme }) => theme.border.borderConfig({ d_W: 1, c_key: "blur" })};
    border-radius: 0;
    &.item-scrolled.MuiAppBar-root.MuiAppBar-positionFixed {
    }
  }
`;

const LogoStyle = styled(Typography)`
  display: flex;
  align-items: center;
  position: relative;

  &:after {
    content: "beta";
    position: absolute;
    color: var(--color-logo);
    display: block;
    font-size: 1rem;
    line-height: 0.8rem;
    right: -24px;
    top: 14px;
    font-weight: 200;
    opacity: 0.6;
    box-shadow: 0 0 1px 0 var(--color-logo);
    //border: 1px solid ;
    border-radius: 2px;
    padding: 3px 2px;
  }

  a.MuiButtonBase-root {
    min-width: auto;
    border-radius: 0;
    text-indent: -999999em;
    background: var(--color-primary);
    background: var(--color-logo);
    mask: url(${logoSVG}) space;
    mask-size: contain;
    mask-position: center;
    width: 105px;
    height: 40px;
    margin-top: -10px;
    color: transparent;

    &:hover {
      background-color: inherit;
      background: var(--color-logo);
    }
  }
` as typeof Typography;

export const LoopringLogo = React.memo(() => {
  return (
    <LogoStyle variant="h6" component="h1" marginRight={4}>
      <IconButton
        edge="start"
        aria-label="menu"
        component={RouterLink}
        to={"/"}
        color={"inherit"}
      >
        Loopring 路印 loopring protocol 3.6 The first Layer2 Decentralized
        trading Platform
      </IconButton>
    </LogoStyle>
  );
});

const ToolBarItem = ({ buttonComponent, ...props }: any) => {
  const render = React.useMemo(() => {
    switch (buttonComponent) {
      case ButtonComponentsMap.Download:
        return <BtnDownload {...props} />;
      case ButtonComponentsMap.Notification:
        return <BtnNotification {...props} />;
      case ButtonComponentsMap.Setting:
        return <BtnSetting {...props} />;
      case ButtonComponentsMap.WalletConnect:
        return <WalletConnectBtn {...props} />;
      default:
        return undefined;
    }
  }, [props, buttonComponent]);
  return <TabItemPlus>{render}</TabItemPlus>;
};

export const HideOnScroll = React.forwardRef(
  ({ children, window, ...rest }: any, ref) => {
    const trigger = useScrollTrigger({
      target: window ? window() : undefined,
    });
    return (
      <Slide
        {...rest}
        appear={false}
        adirection="down"
        forwardedRef={ref}
        in={!trigger}
      >
        {children}
      </Slide>
    );
  }
);

const NodeMenuItem = React.memo(
  ({ label, router, layer, child, ...rest }: HeaderMenuItemInterface & any) => {
    return (
      <>
        {layer >= 1 ? (
          <Layer2Item {...{ ...rest, label, router, child, layer }} />
        ) : (
          <Typography variant={"body1"} key={label.id} color={"inherit"}>
            {rest.t(label.i18nKey)}
          </Typography>
        )}
      </>
    );
  }
);

export const Header = withTranslation(["layout", "common"], { withRef: true })(
  React.forwardRef(
    (
      {
        headerMenuData,
        headerToolBarData,
        allowTrade,
        selected,
        isWrap = true,
        isLandPage = false,
        i18n,
        t,
        ...rest
      }: HeaderProps & WithTranslation,
      ref: React.ForwardedRef<any>
    ) => {
      const { themeMode, setTheme } = useSettings();
      const history = useHistory();
      const location = useLocation();

      const [currentBJTime, setCurrentBJTime] = React.useState(0);

      React.useEffect(() => {
        setInterval(() => {
          setCurrentBJTime(Number(moment().utcOffset(480).unix()) * 1000);
        }, 1000);

        return () => {
          clearInterval();
        };
      }, []);

      const getMenuButtons = React.useCallback(
        ({
          toolbarList,
          ...rest
        }: { toolbarList: HeaderToolBarInterface[] } & WithTranslation) => {
          return ToolBarAvailableItem.map((index: number) => {
            return (
              <ToolBarItem
                {...{ ...toolbarList[index], ...rest }}
                key={index}
              />
            );
          });
          // toolbarList.map((item, index) =>);
        },
        []
      );
      const getDrawerChoices = React.useCallback(
        ({
          menuList,
          layer = 0,
          ...rest
        }: {
          menuList: HeaderMenuItemInterface[];
          layer?: number;
          handleListKeyDown?: any;
        } & WithTranslation) => {
          return menuList.map((props: HeaderMenuItemInterface) => {
            const { label, child, status } = props;
            const selectedFlag = new RegExp(label.id, "ig").test(
              selected.split("/")[1] ? selected.split("/")[1] : selected
            );
            if (status === HeaderMenuTabStatus.hidden) {
              // return <React.Fragment key={label.id + '-' + layer}></React.Fragment>
              return <React.Fragment key={label.id + "-" + layer} />;
            } else {
              if (child) {
                return (
                  <React.Fragment key={label.id + "-" + layer}>
                    {memoized({
                      ...props,
                      layer,
                      ...rest,
                    })}
                  </React.Fragment>
                );
              } else {
                return (
                  <HeadMenuItem
                    selected={selectedFlag}
                    {...{
                      ...props,
                      allowTrade,
                      layer,
                      children: (
                        <NodeMenuItem
                          {...{
                            ...props,
                            layer,
                            child,
                            ...rest,
                          }}
                        />
                      ),
                      style: { textDecoration: "none" },
                      key: label.id + "-" + layer,
                    }}
                    onClick={
                      rest?.handleListKeyDown
                        ? rest.handleListKeyDown
                        : undefined
                    }
                  />
                );
              }
            }
          });
        },
        [allowTrade, selected]
      );
      const memoized = React.useCallback(
        ({ label, router, child, layer, ref, ...rest }: any) => (
          <HeaderMenuSub
            {...{
              ...rest,
              label,
              router,
              allowTrade,
              child,
              layer,
              selected: new RegExp(label.id, "ig").test(
                selected.split("/")[1] ? selected.split("/")[1] : selected
              ),
              // className: new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected) ? 'Mui-selected' : '',
              renderList: ({
                handleListKeyDown,
              }: {
                handleListKeyDown: ({ ...rest }) => any;
              }) => {
                return getDrawerChoices({
                  menuList: child,
                  layer: layer + 1,
                  handleListKeyDown,
                  ...rest,
                });
              },
            }}
          />
        ),
        [allowTrade, getDrawerChoices, selected]
      );

      const handleThemeClick = React.useCallback(() => {
        setTheme(themeMode === "light" ? ThemeType.dark : ThemeType.light);
      }, [themeMode, setTheme]);

      const isMaintaining =
        currentBJTime >= maintainceStatTime &&
        currentBJTime <= maintainceEndTime;

      const displayDesktop = React.useMemo(() => {
        return (
          <ToolBarStyled>
            <Box
              display="flex"
              alignContent="center"
              justifyContent={"flex-start"}
              alignItems={"stretch"}
            >
              <LoopringLogo />
              {!isLandPage &&
                getDrawerChoices({
                  menuList: headerMenuData,
                  i18n,
                  t,
                  ...rest,
                })}
            </Box>
            <Box
              component={"ul"}
              display="flex"
              alignItems="center"
              justifyContent={"flex-end"}
              color={"textColorSecondary"}
            >
              {isLandPage ? (
                <>
                  {/* {getDrawerChoices({menuList: landingMenuData, i18n, ...rest})} */}
                  <Grid
                    container
                    spacing={4}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <GridStyled
                      iscurrentroute={
                        location.pathname === "/" ? "true" : "false"
                      }
                      item
                      onClick={() => history.push("/")}
                    >
                      zkRollup Layer2
                    </GridStyled>
                    <GridStyled
                      iscurrentroute={
                        location.pathname === "/wallet" ? "true" : "false"
                      }
                      item
                      onClick={() => history.push("/wallet")}
                    >
                      Smart Wallet
                    </GridStyled>
                    <Grid item>
                      <Box
                        style={{ cursor: "pointer" }}
                        onClick={handleThemeClick}
                      >
                        {themeMode === "dark" ? <DarkIcon /> : <LightIcon />}
                      </Box>
                    </Grid>
                    <Grid item>
                      <ButtonStyled
                        size={"small"}
                        disabled={isMaintaining}
                        variant={"contained"}
                        onClick={() => history.push("/trade/lite/LRC-ETH")}
                      >
                        {t("labelLaunchApp")}
                      </ButtonStyled>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  {getMenuButtons({
                    toolbarList: headerToolBarData,
                    i18n,
                    t,
                    ...rest,
                  })}
                </>
              )}
            </Box>
          </ToolBarStyled>
        );
      }, [
        headerToolBarData,
        headerMenuData,
        getDrawerChoices,
        getMenuButtons,
        i18n,
        rest,
        isLandPage,
      ]);

      const paddingStyle = {
        paddingTop: 0,
        paddingRight: isLandPage ? 0 : 24,
        paddingBottom: 0,
        paddingLeft: isLandPage ? 0 : 24,
      };

      return (
        <HeaderStyled elevation={4} ref={ref} className={`${rest?.className}`}>
          {isWrap ? (
            <Container style={paddingStyle} className={"wrap"} maxWidth="lg">
              {displayDesktop}
            </Container>
          ) : (
            <Box marginX={2}>{displayDesktop}</Box>
          )}
        </HeaderStyled>
      );
    }
  )
);
