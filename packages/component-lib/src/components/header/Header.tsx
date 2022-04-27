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
  ClickAwayListener,
  Divider,
} from "@mui/material";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  HeadMenuItem,
  Layer2Item,
  TabItemPlus,
  Button,
  PopoverPure,
  HeaderMenuSub,
} from "../basic-lib";
import { HeaderProps, HeaderToolBarInterface } from "./Interface";
import {
  ButtonComponentsMap,
  HeaderMenuItemInterface,
  HeaderMenuTabStatus,
  SoursURL,
  ToolBarAvailableItem,
  MenuIcon,
  LoopringLogoIcon,
  subMenuLayer2,
  headerMenuLandingData,
  AccountStatus,
  subMenuNFT,
} from "@loopring-web/common-resources";
import {
  BtnDownload,
  BtnNotification,
  BtnSetting,
  WalletConnectBtn,
} from "./toolbar";
import React from "react";
import { bindPopper } from "material-ui-popup-state/es";
import { bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useTheme } from "@emotion/react";
import _ from "lodash";
import { useAccount } from "@loopring-web/webapp/src/stores/account";

const ButtonStyled = styled(Button)`
  background: linear-gradient(94.92deg, #4169ff 0.91%, #a016c2 103.55%);
  padding-left: ${({ theme }) => 3 * theme.unit}px;
  padding-right: ${({ theme }) => 3 * theme.unit}px;
`;

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
    opacity: 0;
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

const ToolBarItem = ({ buttonComponent, notification, ...props }: any) => {
  const render = React.useMemo(() => {
    switch (buttonComponent) {
      case ButtonComponentsMap.Download:
        return <BtnDownload {...props} />;
      case ButtonComponentsMap.Notification:
        return <BtnNotification {...props} notification={notification} />;
      case ButtonComponentsMap.Setting:
        return <BtnSetting {...props} />;
      case ButtonComponentsMap.WalletConnect:
        return <WalletConnectBtn {...props} />;
      default:
        return undefined;
    }
  }, [props, buttonComponent, notification]);
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
  ({
    label,
    router,
    layer,
    child,
    handleListKeyDown,
    ...rest
  }: HeaderMenuItemInterface & any) => {
    return (
      <>
        {layer >= 1 ? (
          <Layer2Item {...{ ...rest, label, router, child, layer }} />
        ) : (
          <Typography
            variant={"body1"}
            key={label.id}
            color={"inherit"}
            onClick={handleListKeyDown}
          >
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
        notification,
        allowTrade,
        selected,
        isWrap = true,
        isLandPage = false,
        isMobile = false,
        i18n,
        t,
        ...rest
      }: HeaderProps & WithTranslation,
      ref: React.ForwardedRef<any>
    ) => {
      const history = useHistory();
      const theme = useTheme();
      const location = useLocation();
      const { account } = useAccount();
      const getMenuButtons = React.useCallback(
        ({
          toolbarList,
          ...rest
        }: { toolbarList: HeaderToolBarInterface[] } & WithTranslation) => {
          return ToolBarAvailableItem.map((index: number) => {
            return (
              <ToolBarItem
                {...{ ...toolbarList[index], notification, ...rest }}
                key={index}
              />
            );
          });
        },
        [notification]
      );
      const memoized: any = React.useCallback(
        ({
          label,
          router,
          child,
          layer,
          ref,
          handleListKeyDown: _handleListKeyDown,
          ...rest
        }: any) => (
          <HeaderMenuSub
            key={layer + "_" + label.id}
            {...{
              ...rest,
              label,
              router,
              allowTrade,
              child,
              layer,
              anchorOrigin: isMobile
                ? {
                    vertical: "right",
                    horizontal: "right",
                  }
                : { vertical: "bottom", horizontal: "left" },
              selected: new RegExp(label.id, "ig").test(
                selected.split("/")[1] ? selected.split("/")[1] : selected
              ),
              renderList: ({
                handleListKeyDown,
              }: {
                handleListKeyDown: ({ ...rest }) => any;
              }) => {
                return getDrawerChoices({
                  menuList: child,
                  layer: layer + 1,
                  handleListKeyDown: () => {
                    if (_handleListKeyDown) {
                      _handleListKeyDown();
                    }
                    if (handleListKeyDown) {
                      handleListKeyDown({ ...rest });
                    }
                  },
                  ...rest,
                });
              },
            }}
          />
        ),
        [allowTrade, isMobile, selected]
      );
      const getDrawerChoices: any = React.useCallback(
        ({
          menuList,
          layer = 0,
          // onClose,
          handleListKeyDown,
          ...rest
        }: {
          menuList: HeaderMenuItemInterface[];
          layer?: number;
          // onClose?: () => void;
          handleListKeyDown?: any;
        } & WithTranslation) => {
          let _obj = {};
          if (menuList instanceof Array) {
            _obj[0] = menuList;
          } else {
            _obj = menuList;
          }
          return Reflect.ownKeys(_obj).map((key, index) => {
            return (
              <Box
                key={key.toString() + "-" + index}
                display={"flex"}
                flexDirection={isMobile || layer > 0 ? "column" : "row"}
              >
                {!!_obj[key].length &&
                  _obj[key].reduce(
                    (
                      prev: JSX.Element[],
                      props: HeaderMenuItemInterface,
                      l2Index: number
                    ) => {
                      const { label, child, status } = props;
                      const selectedFlag = new RegExp(label.id, "ig").test(
                        selected.split("/")[1]
                          ? selected.split("/")[1]
                          : selected
                      );
                      if (status === HeaderMenuTabStatus.hidden) {
                        return prev;
                      } else {
                        if (
                          child &&
                          (account.readyState === AccountStatus.ACTIVATED ||
                            label.id !== "Layer2")
                        ) {
                          return [
                            ...prev,
                            memoized({
                              ...props,
                              layer,
                              divider: index + 1 !== _obj[key].length,
                              handleListKeyDown,
                              ...rest,
                            }),
                          ];
                        }
                        return [
                          ...prev,
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
                                    handleListKeyDown,
                                    ...rest,
                                  }}
                                />
                              ),
                              style: { textDecoration: "none" },
                              key: key.toString() + "-" + layer + l2Index,
                            }}
                            // onClick={handleListKeyDown ? handleListKeyDown : ""}
                          />,
                        ];
                      }
                    },
                    [] as JSX.Element[]
                  )}

                <Box marginX={3}>
                  {Reflect.ownKeys(_obj).length !== index + 1 && <Divider />}
                </Box>
              </Box>
            );
          });
        },
        [isMobile, selected, account.readyState, allowTrade, memoized]
      );

      // const handleThemeClick = React.useCallback(() => {
      //   setTheme(themeMode === "light" ? ThemeType.dark : ThemeType.light);
      // }, [themeMode, setTheme]);

      const isMaintaining = false;

      const displayDesktop = React.useMemo(() => {
        return (
          <ToolBarStyled>
            <Box
              display="flex"
              alignContent="center"
              justifyContent={"flex-start"}
              alignItems={"stretch"}
              flexDirection={"row"} //!isMobile ? "row" : "column"}
            >
              <LoopringLogo />
              {!isLandPage
                ? getDrawerChoices({
                    menuList: headerMenuData,
                    i18n,
                    t,
                    ...rest,
                  })
                : getDrawerChoices({
                    menuList: headerMenuLandingData,
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
              {getMenuButtons({
                toolbarList: isLandPage
                  ? headerToolBarData.filter(
                      (_item, index) =>
                        index !== ButtonComponentsMap.WalletConnect
                    )
                  : headerToolBarData,
                i18n,
                t,
                ...rest,
              })}
              {!!isLandPage && (
                <ButtonStyled
                  size={"small"}
                  disabled={isMaintaining}
                  variant={"contained"}
                  onClick={() => history.push("/trade/lite/LRC-ETH")}
                >
                  {t("labelLaunchApp")}
                </ButtonStyled>
              )}
            </Box>
          </ToolBarStyled>
        );
      }, [
        isLandPage,
        getDrawerChoices,
        headerMenuData,
        i18n,
        t,
        rest,
        isMaintaining,
        getMenuButtons,
        headerToolBarData,
        history,
      ]);
      const popupState = usePopupState({
        variant: "popover",
        popupId: "mobile",
      });
      const displayMobile = React.useMemo(() => {
        const _headerMenuData: HeaderMenuItemInterface[] =
          headerMenuData.reduce((prev, _item) => {
            const item = _.cloneDeep(_item);
            if (item.label.id === "Layer2") {
              item.child = { ...subMenuLayer2 };
            } else if (item.label.id === "NFT") {
              item.child = { ...subMenuNFT };
            }
            return [...prev, item];
          }, [] as HeaderMenuItemInterface[]);

        return (
          <ToolBarStyled>
            <Box
              display="flex"
              alignContent="center"
              justifyContent={"flex-start"}
              alignItems={"stretch"}
              flexDirection={"row"} //!isMobile ? "row" : "column"}
            >
              <Typography display={"inline-flex"} alignItems={"center"}>
                <LoopringLogoIcon
                  fontSize={"large"}
                  style={{ height: 28, width: 28 }}
                  color={"primary"}
                />
              </Typography>
            </Box>
            <Box display={"flex"} alignItems={"center"}>
              {isLandPage ? (
                <>
                  {location.pathname === "/wallet" ? (
                    <NodeMenuItem
                      {...{ ...headerMenuLandingData[0], ...rest, t }}
                      handleListKeyDown={() =>
                        history.push("" + headerMenuLandingData[0].router?.path)
                      }
                    />
                  ) : (
                    <NodeMenuItem
                      {...{ ...headerMenuLandingData[1], ...rest, t }}
                      handleListKeyDown={() =>
                        history.push("" + headerMenuLandingData[1].router?.path)
                      }
                    />
                  )}

                  {getMenuButtons({
                    toolbarList: isLandPage
                      ? headerToolBarData.filter(
                          (_item, index) =>
                            index !== ButtonComponentsMap.WalletConnect
                        )
                      : headerToolBarData,
                    i18n,
                    t,
                    ...rest,
                  })}
                  <ButtonStyled
                    size={"small"}
                    disabled={isMaintaining}
                    variant={"contained"}
                    onClick={() => history.push("/trade/lite/LRC-ETH")}
                  >
                    {t("labelLaunchMobileApp", "")}
                  </ButtonStyled>
                </>
              ) : (
                <>
                  <Box
                    component={"ul"}
                    display="flex"
                    alignItems="center"
                    justifyContent={"flex-end"}
                    color={"textColorSecondary"}
                    marginRight={1}
                  >
                    {getMenuButtons({
                      toolbarList: headerToolBarData,
                      i18n,
                      t,
                      ...rest,
                    })}
                  </Box>
                  <ClickAwayListener
                    onClickAway={() => {
                      popupState.close();
                    }}
                  >
                    <Box
                      display="flex"
                      alignContent="center"
                      justifyContent={"flex-start"}
                      alignItems={"stretch"}
                      flexDirection={"row"} //!isMobile ? "row" : "column"}
                    >
                      <Typography
                        display={"inline-flex"}
                        alignItems={"center"}
                        {...bindTrigger(popupState)}
                      >
                        <MenuIcon
                          // fontSize={"large"}
                          style={{ height: 28, width: 28 }}
                          // color={"primary"}
                        />
                      </Typography>

                      <PopoverPure
                        {...bindPopper(popupState)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                      >
                        <Box
                          className={"mobile"}
                          display={"flex"}
                          alignItems={"stretch"}
                          flexDirection={"column"}
                        >
                          {getDrawerChoices({
                            menuList: _headerMenuData,
                            i18n,
                            t,
                            handleListKeyDown: popupState.close,
                            ...rest,
                          })}
                        </Box>
                      </PopoverPure>
                    </Box>
                  </ClickAwayListener>
                </>
              )}
            </Box>
          </ToolBarStyled>
        );
      }, [
        headerMenuData,
        isLandPage,
        location.pathname,
        t,
        isMaintaining,
        getMenuButtons,
        headerToolBarData,
        i18n,
        rest,
        popupState,
        getDrawerChoices,
        history,
      ]);

      const paddingStyle = {
        paddingTop: 0,
        paddingRight: isLandPage ? theme.unit : theme.unit * 3,
        paddingBottom: 0,
        paddingLeft: isLandPage ? theme.unit : theme.unit * 3,
      };

      return (
        <HeaderStyled elevation={4} ref={ref} className={`${rest?.className}`}>
          {isWrap ? (
            <Container style={paddingStyle} className={"wrap"} maxWidth="lg">
              {isMobile ? displayMobile : displayDesktop}
            </Container>
          ) : (
            <Box marginX={2}>{isMobile ? displayMobile : displayDesktop}</Box>
          )}
        </HeaderStyled>
      );
    }
  )
);
