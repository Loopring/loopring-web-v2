import styled from '@emotion/styled'
import {
  AppBar,
  Box,
  ClickAwayListener,
  Container,
  Divider,
  IconButton,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material'
import { Link as RouterLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Button,
  HeaderMenuSub,
  HeadMenuItem,
  Layer2Item,
  PopoverPure,
  TabItemPlus,
} from '../basic-lib'
import { HeaderProps, HeaderToolBarInterface } from './Interface'
import {
  ButtonComponentsMap,
  HeaderMenuItemInterface,
  headerMenuLandingData,
  HeaderMenuTabStatus,
  L1L2_NAME_DEFINED,
  LoopringLogoIcon,
  MapChainId,
  MenuIcon,
  RouterMainKey,
  SoursURL,
  subMenuLayer2,
  toolBarAvailableItem as _toolBarAvailableItem,
} from '@loopring-web/common-resources'
import {
  BtnDownload,
  BtnNotification,
  BtnSetting,
  ProfileMenu,
  WalletConnectBtn,
  WalletConnectL1Btn,
} from './toolbar'
import React from 'react'
import { bindPopper } from 'material-ui-popup-state/es'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useTheme } from '@emotion/react'
import _ from 'lodash'
import { useSettings } from '../../stores'
import * as sdk from '@loopring-web/loopring-sdk'

const ButtonStyled = styled(Button)`
  background: linear-gradient(94.92deg, #4169ff 0.91%, #a016c2 103.55%);
  padding-left: ${({ theme }) => 3 * theme.unit}px;
  padding-right: ${({ theme }) => 3 * theme.unit}px;
`

const logoSVG = SoursURL + 'svg/logo.svg'
const ToolBarStyled = styled(Toolbar)`
  && {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    padding: 0;
  }
`
const HeaderStyled = styled(AppBar)`
  && {
    z-index: 400;
    box-shadow: var(--shadow-header);
    height: var(--header-height);
    margin: 0 auto;
    background-color: var(--color-box);
    backdrop-filter: blur(4px);
    box-sizing: border-box;
    ${({ theme }) => theme.border.borderConfig({ d_W: 1, c_key: 'blur' })};
    border-radius: 0;

    &.item-scrolled.MuiAppBar-root.MuiAppBar-positionFixed {
    }

    &.testNet {
      .beta {
        color: var(--color-warning);
        font-size: 9px;

        &.dev {
          color: var(--color-success);
        }
      }
    }
  }
`

const LogoStyle = styled(Typography)`
  display: flex;
  align-items: center;
  position: relative;

  &:after {
    content: 'beta';
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
` as typeof Typography

export const LoopringLogo = () => {
  return (
    <LogoStyle variant='h6' component='h1' marginRight={4}>
      <IconButton
        edge='start'
        aria-label='menu'
        component={RouterLink}
        to={'/'}
        // href={"https://loopring.io/#"}
        replace={true}
        color={'inherit'}
      >
        Loopring 路印 loopring protocol 3.6 The first Layer2 Decentralized trading Platform
      </IconButton>
    </LogoStyle>
  )
}

const ToolBarItem = ({
  buttonComponent,
  notification,
  account,
  chainId,
  isLayer1Only = false,
  ButtonComponentsMap,
  ...props
}: any) => {
  const match = useRouteMatch('/:l1/:l2?')
  const render = React.useMemo(() => {
    switch (buttonComponent) {
      case ButtonComponentsMap.ProfileMenu:
        // @ts-ignore
        return <ProfileMenu rounter={match?.params[LAYERMAP['2']] as any} {...props} />
      case ButtonComponentsMap.Notification:
        return (
          <BtnNotification
            {...props}
            notification={notification}
            account={account}
            chainId={chainId}
          />
        )
      case ButtonComponentsMap.Setting:
        return <BtnSetting {...props} />
      case ButtonComponentsMap.Download:
        return <BtnDownload {...props} />

      case ButtonComponentsMap.WalletConnect:
        return isLayer1Only ? <WalletConnectL1Btn {...props} /> : <WalletConnectBtn {...props} />
      default:
        return undefined
    }
  }, [buttonComponent, match?.params, props, notification, account])
  return <TabItemPlus>{render}</TabItemPlus>
}

export const HideOnScroll = React.forwardRef(({ children, window, ...rest }: any, ref) => {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  })

  return (
    <Slide {...rest} appear={false} adirection='down' forwardedRef={ref} in={!trigger}>
      {children}
    </Slide>
  )
})

const NodeMenuItem = React.memo(
  ({ label, router, layer, child, handleListKeyDown, ...rest }: HeaderMenuItemInterface & any) => {
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    return (
      <>
        {layer >= 1 ? (
          <Layer2Item {...{ ...rest, label, router, child, layer }} />
        ) : (
          <Typography
            variant={'body1'}
            key={label.id}
            color={'inherit'}
            onClick={handleListKeyDown}
          >
            {rest.t(label.i18nKey, {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            })}
          </Typography>
        )}
      </>
    )
  },
)
export const LAYERMAP = {
  '1': 'l1',
  '2': 'l2',
}

export const Header = withTranslation(['layout', 'common'], { withRef: true })(
  React.forwardRef(
    <R extends HeaderToolBarInterface>(
      {
        headerMenuData,
        headerToolBarData,
        notification,
        allowTrade,
        selected,
        account,
        chainId,
        isWrap = true,
        isLandPage = false,
        isMobile = false,
        toolBarAvailableItem = _toolBarAvailableItem,
        toolBarMap = ButtonComponentsMap,
        i18n,
        t,
        ...rest
      }: HeaderProps<R> & WithTranslation,
      ref: React.ForwardedRef<any>,
    ) => {
      const history = useHistory()
      const theme = useTheme()
      const location = useLocation()
      const match = useRouteMatch('/:l1/:l2?/:pair?')

      const _headerToolBarData = isLandPage
        ? Reflect.ownKeys(headerToolBarData).reduce((prev, key) => {
            if ((key as unknown as ButtonComponentsMap) !== ButtonComponentsMap.WalletConnect) {
              return (prev[key] = headerToolBarData[key])
            }
            return prev
          }, {} as { [key: number]: R })
        : headerToolBarData
      const getMenuButtons = React.useCallback(
        ({
          toolbarList,
          ...rest
        }: {
          toolbarList: { [key: number]: R }
        } & WithTranslation) => {
          return toolBarAvailableItem.map((index: number) => {
            return (
              <ToolBarItem
                {...{
                  ...toolbarList[index],
                  account,
                  chainId,
                  notification,
                  ButtonComponentsMap: toolBarMap,
                  ...rest,
                }}
                key={index}
              />
            )
          })
        },
        [account, isMobile, notification],
      )

      const getDrawerChoices: any = React.useCallback(
        ({
          menuList,
          layer = 0,
          // onClose,
          handleListKeyDown,
          ...rest
        }: {
          menuList: HeaderMenuItemInterface[]
          layer?: number
          // onClose?: () => void;
          handleListKeyDown?: any
        } & WithTranslation) => {
          let _obj = {}
          if (menuList instanceof Array) {
            _obj[0] = menuList
          } else {
            _obj = menuList
          }
          return Reflect.ownKeys(_obj).map((key, index) => {
            return (
              <Box
                key={key.toString() + '-' + index}
                display={'flex'}
                flexDirection={isMobile || layer > 0 ? 'column' : 'row'}
              >
                {!!_obj[key].length &&
                  _obj[key].reduce(
                    (prev: JSX.Element[], props: HeaderMenuItemInterface, l2Index: number) => {
                      const { label, child, status } = props

                      if (status === HeaderMenuTabStatus.hidden) {
                        return prev
                      } else {
                        if (child) {
                          return [
                            ...prev,
                            memoized({
                              ...props,
                              layer,
                              divider: index + 1 !== _obj[key].length,
                              handleListKeyDown,
                              ...rest,
                            }),
                          ]
                        }

                        const selectFlag =
                          match?.params[LAYERMAP[layer + 1]] &&
                          new RegExp(label.id?.toLowerCase(), 'ig').test(
                            match?.params[LAYERMAP[layer + 1]],
                          )
                        return [
                          ...prev,
                          <HeadMenuItem
                            selected={selectFlag}
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
                              style: { textDecoration: 'none' },
                              key: key.toString() + '-' + layer + l2Index,
                            }}
                          />,
                        ]
                      }
                    },
                    [] as JSX.Element[],
                  )}

                <Box marginX={3}>{Reflect.ownKeys(_obj).length !== index + 1 && <Divider />}</Box>
              </Box>
            )
          })
        },
        [isMobile, selected, account?.readyState, allowTrade],
      )

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
            key={layer + '_' + label.id}
            {...{
              ...rest,
              label,
              router,
              allowTrade,
              child,
              layer,
              anchorOrigin: isMobile
                ? {
                    vertical: 'right',
                    horizontal: 'right',
                  }
                : { vertical: 'bottom', horizontal: 'left' },
              selected:
                match?.params[LAYERMAP[layer + 1]] &&
                new RegExp(`^${label.id?.toLowerCase()}`, 'ig').test(
                  match?.params[LAYERMAP[layer + 1]],
                ),
              //match?.params.item,
              //   new RegExp(label.id, "ig").test(
              //   selected.split("/")[1] ? selected.split("/")[1] : selected
              // ),
              renderList: ({ handleListKeyDown }: { handleListKeyDown: ({ ...rest }) => any }) => {
                return getDrawerChoices({
                  menuList: child,
                  layer: layer + 1,
                  handleListKeyDown: () => {
                    if (_handleListKeyDown) {
                      _handleListKeyDown()
                    }
                    if (handleListKeyDown) {
                      handleListKeyDown({ ...rest })
                    }
                  },
                  ...rest,
                })
              },
            }}
          />
        ),
        [allowTrade, getDrawerChoices, isMobile, match?.params],
      )

      // const handleThemeClick = React.useCallback(() => {
      //   setTheme(themeMode === "light" ? ThemeType.dark : ThemeType.light);
      // }, [themeMode, setTheme]);

      const isMaintaining = false
      const { isDevToggle, setIsDevToggle } = useSettings()

      const displayDesktop = React.useMemo(() => {
        return (
          <ToolBarStyled>
            <Box
              display='flex'
              alignContent='center'
              justifyContent={'flex-start'}
              alignItems={'stretch'}
              flexDirection={'row'} //!isMobile ? "row" : "column"}
            >
              {process.env?.REACT_APP_TEST_ENV && chainId !== sdk.ChainId.MAINNET ? (
                <Button
                  variant={'text'}
                  size={'small'}
                  className={isDevToggle ? 'dev beta' : 'beta'}
                  onClick={() => setIsDevToggle(!isDevToggle)}
                >
                  Beta
                </Button>
              ) : (
                ''
              )}
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
              component={'ul'}
              display='flex'
              alignItems='center'
              justifyContent={'flex-end'}
              color={'textColorSecondary'}
            >
              {getMenuButtons({
                toolbarList: _headerToolBarData,
                i18n,
                t,
                ...rest,
              })}
              {!!isLandPage && (
                <ButtonStyled
                  size={'small'}
                  disabled={isMaintaining}
                  variant={'contained'}
                  onClick={() => history.push('/trade/lite/LRC-ETH')}
                >
                  {t('labelLaunchApp')}
                </ButtonStyled>
              )}
            </Box>
          </ToolBarStyled>
        )
      }, [
        isLandPage,
        getDrawerChoices,
        headerMenuData,
        i18n,
        t,
        rest,
        getMenuButtons,
        _headerToolBarData,
        isMaintaining,
        history,
      ])
      const popupState = usePopupState({
        variant: 'popover',
        popupId: 'mobile',
      })
      const displayMobile = React.useMemo(() => {
        const _headerMenuData: HeaderMenuItemInterface[] = (headerMenuData ?? []).reduce(
          (prev, _item) => {
            const item = _.cloneDeep(_item)
            if (item.label.id === RouterMainKey.l2assets) {
              item.child = { ...subMenuLayer2 }
            }
            return [...prev, item]
          },
          [] as HeaderMenuItemInterface[],
        )
        // @ts-ignore
        const pair = match?.params?.pair ?? 'LRC-ETH'

        return (
          <ToolBarStyled>
            <Box
              display='flex'
              alignContent='center'
              justifyContent={'flex-start'}
              alignItems={'stretch'}
              flexDirection={'row'} //!isMobile ? "row" : "column"}
            >
              {process.env?.REACT_APP_TEST_ENV && chainId !== sdk.ChainId.MAINNET ? (
                <Button
                  variant={'text'}
                  size={'small'}
                  className={isDevToggle ? 'dev beta' : 'beta'}
                  onClick={() => setIsDevToggle(!isDevToggle)}
                >
                  B
                </Button>
              ) : (
                ''
              )}
              <Typography display={'inline-flex'} alignItems={'center'}>
                <LoopringLogoIcon
                  fontSize={'large'}
                  style={{ height: 28, width: 28 }}
                  color={'primary'}
                />
              </Typography>
            </Box>
            <Box display={'flex'} alignItems={'center'}>
              {isLandPage ? (
                <>
                  {location.pathname === '/wallet' ? (
                    <NodeMenuItem
                      {...{ ...headerMenuLandingData[0], ...rest, t }}
                      handleListKeyDown={() =>
                        history.push(
                          headerMenuLandingData[0].router?.pathName?.replace('${pair}', pair) ?? '',
                        )
                      }
                    />
                  ) : (
                    <NodeMenuItem
                      {...{ ...headerMenuLandingData[1], ...rest, t }}
                      handleListKeyDown={() => {
                        window.location.href = headerMenuLandingData[1].router!.path
                      }}
                    />
                  )}

                  {getMenuButtons({
                    toolbarList: _headerToolBarData,
                    i18n,
                    t,
                    ...rest,
                  })}
                  <ButtonStyled
                    size={'small'}
                    disabled={isMaintaining}
                    variant={'contained'}
                    onClick={() => history.push('/trade/lite/LRC-ETH')}
                  >
                    {t('labelLaunchMobileApp', '')}
                  </ButtonStyled>
                </>
              ) : (
                <>
                  <Box
                    component={'ul'}
                    display='flex'
                    alignItems='center'
                    justifyContent={'flex-end'}
                    color={'textColorSecondary'}
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
                      popupState.close()
                    }}
                  >
                    <Box
                      display='flex'
                      alignContent='center'
                      justifyContent={'flex-start'}
                      alignItems={'stretch'}
                      flexDirection={'row'} //!isMobile ? "row" : "column"}
                    >
                      <Typography
                        display={'inline-flex'}
                        alignItems={'center'}
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
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                      >
                        <Box
                          className={'mobile'}
                          display={'flex'}
                          alignItems={'stretch'}
                          flexDirection={'column'}
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
        )
      }, [
        headerMenuData,
        match?.params,
        isLandPage,
        location.pathname,
        rest,
        t,
        getMenuButtons,
        headerToolBarData,
        i18n,
        isMaintaining,
        popupState,
        getDrawerChoices,
        history,
      ])

      const paddingStyle = {
        paddingTop: 0,
        paddingRight: isLandPage ? theme.unit : theme.unit * 3,
        paddingBottom: 0,
        paddingLeft: isLandPage ? theme.unit : theme.unit * 3,
      }

      return (
        <HeaderStyled
          elevation={4}
          ref={ref}
          className={`${rest?.className} ` + process.env?.REACT_APP_TEST_ENV ? 'testNet' : ''}
        >
          {isWrap ? (
            <Container style={paddingStyle} className={'wrap'} maxWidth='lg'>
              {isMobile ? displayMobile : displayDesktop}
            </Container>
          ) : (
            <Box marginX={2}>{isMobile ? displayMobile : displayDesktop}</Box>
          )}
        </HeaderStyled>
      )
    },
  ),
)
