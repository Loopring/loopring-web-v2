import styled from '@emotion/styled'
import {
  AppBar,
  Box,
  ClickAwayListener,
  Container,
  Divider,
  IconButton,
  Slide,
  SwipeableDrawer,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material'
import { Link as RouterLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import { HeaderMenuSub, HeadMenuItem, Layer2Item, PopoverPure, TabItemPlus } from '../basic-lib'
import { HeaderProps, HeaderToolBarInterface } from './Interface'
import {
  ButtonComponentsMap,
  CloseIcon,
  HeaderMenuItemInterface,
  headerMenuLandingData,
  HeaderMenuTabStatus,
  hexToRGB,
  L1L2_NAME_DEFINED,
  LoopringLogoIcon,
  MapChainId,
  MenuIcon,
  RouterMainKey,
  SoursURL,
  subMenuLayer2,
} from '@loopring-web/common-resources'
import {
  BtnDownload,
  BtnNotification,
  BtnSetting,
  ColorSwitch,
  ProfileMenu,
  WalletConnectBtn,
  WalletConnectL1Btn,
} from './toolbar'
import React, { useState } from 'react'
import { bindPopper } from 'material-ui-popup-state/es'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useTheme } from '@emotion/react'
import _ from 'lodash'
import { useSettings } from '../../stores'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

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
  & {
    z-index: 400;
    box-shadow: none;
    height: var(--header-height);
    margin: 0 auto;
    background-color: var(--color-box);
    backdrop-filter: blur(4px);
    box-sizing: border-box;
    ${({ theme }) => theme.border.borderConfig({ d_W: 1, c_key: 'blur' })};
    border-radius: 0;
    border: 0;
    &.item-scrolled.MuiAppBar-root.MuiAppBar-positionFixed {
    }
  }
  &.scrollable {
    background-color: initial;
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

export const LoopringLogo = React.memo(() => {
  return (
    <LogoStyle variant='h6' component='h1'>
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
})

const ToolBarItem = ({
  buttonComponent,
  notification,
  account,
  chainId,
  isLayer1Only = false,
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
      case ButtonComponentsMap.ColorSwitch:
        return <ColorSwitch {...props} />
      case ButtonComponentsMap.WalletConnect:
        return isLayer1Only ? (
          <WalletConnectL1Btn {...props} />
        ) : (
          <WalletConnectBtn {...props} accountState={{ account }} />
        )
      default:
        return undefined
    }
  }, [buttonComponent, match?.params, props, notification, account])
  return <TabItemPlus sx={{ display: props.hidden ? 'none' : '' }}>{render}</TabItemPlus>
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

interface MobileDrawerProps {
  linkList: {
    title: string
    des: string
    link: string
    logo: string
    onClick: () => void
    imgMarginRight?: number
  }[]
  open: boolean
  onClose: () => void
  showSetting: boolean
  showColorSwitch: boolean
}

const mobileDrawerBGColorList = ['#E1E8FF', '#D5FFF0', '#FFE9D9', '#E5E8EE', '#E5E8EE']

const MobileDrawer = (props: MobileDrawerProps) => {
  const { linkList, showColorSwitch, showSetting } = props
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <SwipeableDrawer onOpen={() => {}} open={props.open} anchor='top' onClose={props.onClose}>
      <Box py={8} px={6} height={'100vh'} bgcolor={'var(--color-global-bg)'}>
        <Box
          display={'flex'}
          height={'28px'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <LoopringLogoIcon
            fontSize={'large'}
            style={{ height: 28, width: 28 }}
            color={'primary'}
          />
          <CloseIcon
            className='custom-size'
            sx={{
              fontSize: '24px',
              cursor: 'pointer',
            }}
            onClick={props.onClose}
          />
        </Box>
        <Box my={5} height={'calc(100% - 96px)'} sx={{ overflowY: 'scroll' }}>
          {linkList.map((item, index) => {
            return (
              <Box
                height={'120px'}
                borderRadius={'20px'}
                key={item.title}
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                mb={3}
                px={5}
                onClick={item.onClick}
                bgcolor={hexToRGB(
                  mobileDrawerBGColorList[index % mobileDrawerBGColorList.length],
                  theme.mode === 'dark' ? 0.2 : 1,
                )}
              >
                <Box width={'100%'} display={'flex'} justifyContent={'space-between'}>
                  <Box>
                    <Typography>{item.title}</Typography>
                    <Typography mt={3} variant={'body2'} color={'var(--color-text-secondary)'}>
                      {item.des}
                    </Typography>
                  </Box>
                  <Box
                    mr={item.imgMarginRight ?? 0}
                    component={'img'}
                    src={item.logo}
                    alt={item.title}
                    height={'44px'}
                  />
                </Box>
              </Box>
            )
          })}
        </Box>
        <Box
          display={'flex'}
          height={'28px'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          {/* <Box /> */}
          <Box>
            {showSetting && <ToolBarItem t={t} buttonComponent={ButtonComponentsMap.Setting} />}
          </Box>
          <Box>
            {showColorSwitch && <ToolBarItem buttonComponent={ButtonComponentsMap.ColorSwitch} />}
          </Box>
        </Box>
      </Box>
    </SwipeableDrawer>
  )
}

interface NestedMobileDrawerProps {
  linkList: {
    title: string
    // des: string,
    link: string
    // logo: string,
    onClick?: () => void
    id: string
    subLinkList?: {
      title: string
      des: string
      link: string
      LogoElement: any
      onClick: () => void
    }[]
  }[]
  open: boolean
  onClose: () => void
  showSetting: boolean
  showColorSwitch: boolean
}

const NestedMobileDrawer = (props: NestedMobileDrawerProps) => {
  const { linkList, showColorSwitch, showSetting } = props
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined)

  return (
    <SwipeableDrawer onOpen={() => {}} open={props.open} anchor='top' onClose={props.onClose}>
      <Box py={8} px={6} height={'100vh'} bgcolor={'var(--color-global-bg)'}>
        <Box
          display={'flex'}
          height={'28px'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <LoopringLogoIcon
            fontSize={'large'}
            style={{ height: 28, width: 28 }}
            color={'primary'}
          />
          <CloseIcon
            className='custom-size'
            sx={{
              fontSize: '24px',
              cursor: 'pointer',
            }}
            onClick={props.onClose}
          />
        </Box>
        <Box my={9} height={'calc(100% - 112px)'} sx={{ overflowY: 'scroll' }}>
          {linkList.map((item) => {
            const selected = selectedItem === item.id
            return (
              <Box
                key={item.title}
                display={'flex'}
                mb={4}
                px={4}
                onClick={item.onClick}
                flexDirection={'column'}
              >
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  onClick={() => {
                    if (selectedItem === item.id) {
                      setSelectedItem(undefined)
                    } else {
                      setSelectedItem(item.id)
                    }
                  }}
                >
                  <Typography fontSize={'16px'} mr={1}>
                    {item.title}
                  </Typography>
                  {item.subLinkList &&
                    (selected ? (
                      <KeyboardArrowUpIcon
                        className='custom-size'
                        sx={{ color: 'var(--color-text-primary)', fontSize: '16px' }}
                      />
                    ) : (
                      <KeyboardArrowDownIcon
                        className='custom-size'
                        sx={{ color: 'var(--color-text-primary)', fontSize: '16px' }}
                      />
                    ))}
                </Box>

                {item.subLinkList && selected && (
                  <Box mt={4}>
                    {item.subLinkList.map((subItem) => {
                      console.log('subItem', subItem)
                      const LogoElement = subItem.LogoElement
                      return (
                        <Box
                          mb={4}
                          key={subItem.title}
                          ml={4}
                          height={'52px'}
                          display={'flex'}
                          alignItems={'center'}
                          onClick={subItem.onClick}
                        >
                          <LogoElement
                            className='custom-size'
                            style={{
                              width: '24px',
                              height: '24px',
                              color: 'var(--color-text-primary)',
                            }}
                          />
                          {/* <Box component={'img'} src={subItem.logo} width={'24px'} height={'24px'} /> */}
                          <Box ml={4}>
                            <Typography>{subItem.title}</Typography>
                            <Typography variant='body2' color={'var(--color-text-secondary)'}>
                              {subItem.des}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
        <Box
          display={'flex'}
          height={'28px'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          {/* <Box /> */}
          <Box>
            {showSetting && <ToolBarItem t={t} buttonComponent={ButtonComponentsMap.Setting} />}
          </Box>
          <Box>
            {showColorSwitch && <ToolBarItem buttonComponent={ButtonComponentsMap.ColorSwitch} />}
          </Box>
        </Box>
      </Box>
    </SwipeableDrawer>
  )
}

export const Header = withTranslation(['layout', 'landPage', 'common'], { withRef: true })(
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
        landBtn,
        isLandPage = false,
        isMobile = false,
        toolBarMap = ButtonComponentsMap,
        i18n,
        t,
        transparent,
        application,
        ...rest
      }: HeaderProps<R> & WithTranslation,
      ref: React.ForwardedRef<any>,
    ) => {
      const history = useHistory()
      const theme = useTheme()
      const location = useLocation()
      const match = useRouteMatch('/:l1/:l2?/:pair?')
      const getMenuButtons = React.useMemo(() => {
        return Reflect.ownKeys(headerToolBarData ?? {}).map((item, index) => {
          return (
            <ToolBarItem
              {...{
                ...headerToolBarData[item],
                account,
                chainId,
                notification,
                ButtonComponentsMap: toolBarMap,
                t,
                i18n,
                ...rest,
              }}
              key={index}
            />
          )
        })
      }, [account, isMobile, notification, headerToolBarData])

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

                        let selectedFlag: boolean | undefined = undefined
                        if (application === 'web-earn') {
                          if (label.id === 'portal') {
                            selectedFlag = match?.params['l1'] === 'portal'
                          } else if (label.id === 'L2Assets') {
                            selectedFlag = match?.params['l1'] === 'l2assets'
                          } else if (label.id === 'dual') {
                            selectedFlag =
                              match?.params['l1'] === 'invest' && match?.params['l2'] === 'dual'
                          } else if (label.id === 'btrade') {
                            selectedFlag =
                              match?.params['l1'] === 'trade' && match?.params['l2'] === 'btrade'
                          } else {
                            selectedFlag = false
                          }
                        } else {
                          selectedFlag =
                            match?.params[LAYERMAP[layer + 1]] &&
                            new RegExp(label.id?.toLowerCase(), 'ig').test(
                              match?.params[LAYERMAP[layer + 1]],
                            )
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
                              style: { textDecoration: 'none' },
                              key: key.toString() + '-' + layer + l2Index,
                            }}
                          />,
                        ]
                      }
                    },
                    [] as JSX.Element[],
                  )}

                <Box marginX={2}>{Reflect.ownKeys(_obj).length !== index + 1 && <Divider />}</Box>
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
              <LoopringLogo />
              {!isLandPage &&
                getDrawerChoices({
                  menuList: headerMenuData,
                  i18n,
                  t,
                  ...rest,
                })}
            </Box>
            {isLandPage && (
              <Box mr={'2.5%'}>
                {getDrawerChoices({
                  menuList: headerMenuLandingData,
                  i18n,
                  t,
                  ...rest,
                })}
              </Box>
            )}
            <Box
              component={'ul'}
              display='flex'
              alignItems='center'
              justifyContent={'flex-end'}
              color={'textColorSecondary'}
            >
              {getMenuButtons}
              {!!isLandPage && landBtn ? landBtn : <></>}
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
        isMaintaining,
        history,
      ])
      const popupState = usePopupState({
        variant: 'popover',
        popupId: 'mobile',
      })
      const { defaultNetwork } = useSettings()
      const network = MapChainId[defaultNetwork] ?? MapChainId[1]
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
              <Typography display={'inline-flex'} alignItems={'center'}>
                <LoopringLogoIcon
                  fontSize={'large'}
                  style={{ height: 28, width: 28 }}
                  color={'primary'}
                />
              </Typography>
            </Box>
            <Box display={'flex'} alignItems={'center'}>
              {isLandPage && headerMenuLandingData[0] ? (
                <>
                  {getMenuButtons}
                  {landBtn ? landBtn : <></>}
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
                      <MobileDrawer
                        linkList={headerMenuLandingData.map((item) => {
                          return {
                            title: t(item.label.i18nKey, {
                              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                            }),
                            des: item.label.description ? t(item.label.description) : '',
                            link: item.router?.path ?? '',
                            logo: theme.mode === 'dark' ? item.logo?.dark : item.logo?.light,
                            onClick: () => {
                              window.open(item.router?.path ?? '', '_blank')
                            },
                          }
                        })}
                        open={popupState.isOpen}
                        onClose={() => {

                          popupState.close()
                          
                        }}

                        showColorSwitch
                      />
                    </Box>
                  </ClickAwayListener>
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
                    {getMenuButtons}
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

                      {application === 'webapp' ? (
                        <NestedMobileDrawer
                          linkList={_headerMenuData.map((item) => {
                            const childList = Array.isArray(item.child)
                              ? item.child
                              : _.values(item.child).flat()
                            console.log('childList', childList)
                            const hasChildren = childList && childList.length > 0
                            return {
                              title: t(item.label.i18nKey, {
                                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                              }),
                              id: item.label.id,
                              des: item.label.description ? t(item.label.description) : '',
                              link: item.router?.path ?? '',
                              logo: theme.mode === 'dark' ? item.logo?.dark : item.logo?.light,
                              onClick: () => {
                                if (!hasChildren) {
                                  history.push(item.router?.path ?? '')
                                  popupState.close()
                                }
                              },
                              selected: true,
                              subLinkList: hasChildren
                                ? childList.map((subItem) => {
                                    return {
                                      title: t(subItem.label.i18nKey),
                                      des: subItem.label.description
                                        ? t(subItem.label.description)
                                        : '',
                                      link: subItem.router?.path ?? '',
                                      LogoElement: subItem.label.icon,
                                      onClick: () => {
                                        history.push(subItem.router?.path ?? '')
                                        popupState.close()
                                      },
                                    }
                                  })
                                : undefined,
                            }
                          })}
                          open={popupState.isOpen}
                          onClose={() => {
                            popupState.close()
                          }}
                          showSetting={true}
                          showColorSwitch={true}
                        />
                      ) : (
                        <MobileDrawer
                          linkList={_headerMenuData.map((item) => {
                            return {
                              title: t(item.label.i18nKey),
                              des: item.label.description ? t(item.label.description) : '',
                              link: item.router?.path ?? '',
                              logo: theme.mode === 'dark' ? item.logo?.dark : item.logo?.light,
                              onClick: () => {
                                history.push(item.router?.path ?? '')
                                popupState.close()
                              },
                              imgMarginRight: item.label.id === 'dual' ? -2 : 0,
                            }
                          })}
                          open={popupState.isOpen}
                          onClose={() => {
                            popupState.close()
                          }}
                          showSetting={true}
                          showColorSwitch={true}
                        />
                      )}
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
          sx={{ '&&&': { background: transparent ? 'transparent' : '' } }}
          elevation={4}
          ref={ref}
          className={`${rest?.className}`}
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
