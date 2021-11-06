import styled from '@emotion/styled';
import { AppBar, Box, Container, IconButton, Link, Slide, Toolbar, Typography, useScrollTrigger, Grid } from '@mui/material';
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { WithTranslation, withTranslation } from 'react-i18next';
import { HeaderMenuSub, HeadMenuItem, Layer2Item, TabItemPlus } from '../basic-lib';
import { HeaderProps, HeaderToolBarInterface } from './Interface';
import {
    // ammDisableList,
    ButtonComponentsMap,
    HeaderMenuItemInterface,
    HeaderMenuTabStatus, SoursURL,
    // orderDisableList,
    ToolBarAvailableItem,
    ThemeType,
    LightIcon,
    DarkIcon,
} from '@loopring-web/common-resources';
import { BtnDownload, BtnNotification, BtnSetting, WalletConnectBtn } from './toolbar';
import React from 'react';
import { useSettings } from '../../stores/reducer/settings';

const GridStyled = styled(Grid)`
    color: ${({iscurrentroute}: any) => iscurrentroute === 'true' ? 'var(--color-text-button-select)' : 'var(--color-text-secondary)' } ; 
    &:hover {
        color: var(--color-text-button-select);
    };
    font-size: 1.4rem;
    cursor: pointer;
` as any

const logoSVG = SoursURL+'svg/logo.svg'
const ToolBarStyled = styled(Toolbar)`
  && {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    padding: 0;
  }
`
const LinkStyle = styled(Link)`
  color: var(--color-text-secondary);
  //&.item-scrolled .MuiAppBar-root.MuiAppBar-positionFixed {
  //  //background: var(--color-global-bg);
  //  //box-shadow: var(--shadow);
  //}
` as typeof Link
const HeaderStyled = styled(AppBar)`
  && {
    z-index: 400;
    box-shadow: var(--shadow-header);
    //.wrap {
    // 
    //  //min-width: 800px;
    //}
    height: var(--header-height);
    margin: 0 auto;
    background-color: var(--color-box);
    backdrop-filter: blur(4px);
    box-sizing: border-box;
      // border-bottom: ${({theme}) => theme.border.borderConfig({d_W: 1, c_key: 'blur'})};
    border-radius: 0;
    //box-shadow: var(--shadow);
    &.item-scrolled.MuiAppBar-root.MuiAppBar-positionFixed {
      //background-color: var(--color-box);
      //box-shadow: var(--shadow);
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
    opacity: .6;
    box-shadow: 0px 0px 1px 0px  var(--color-logo);
    //border: 1px solid ;
    border-radius: 2px;
    padding: 3px 2px;
  }

  a.MuiButtonBase-root {
    height: auto;
    width: auto;
    min-width: auto;
    border-radius: 0;
    text-indent: -999999em;
    background: var(--color-primary);
    background: var(--color-logo);
    mask: url(${logoSVG}) space;
    mask-size: contain;
    mask-position: center;
    mask-size: contain;
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
    // const history = useHistory();
    // const url = history.push('/main').
    return <LogoStyle variant="h6" component="h1" marginRight={4}>
        <IconButton edge="start" aria-label="menu" component={RouterLink} to={'/'} color={"inherit"}>
            Loopring 路印
            loopring protocol 3.6
            The first Layer2 Decentralized trading Platform
        </IconButton>
    </LogoStyle>
});

const ToolBarItem = ({buttonComponent, ...props}: any) => {

    const render = React.useMemo(() => {
        switch (buttonComponent) {
            case  ButtonComponentsMap.Download:
                return <BtnDownload {...props} />;
            case  ButtonComponentsMap.Notification:
                return <BtnNotification {...props} />;
            case  ButtonComponentsMap.Setting:
                return <BtnSetting {...props} />;
            // case  ButtonComponentsMap.Theme:
            //     return <BtnTheme {...{...props, themeMode}} />;
            // case  ButtonComponentsMap.Language:
            //     return <BtnLanguage {...{...props, language}} />;
            case  ButtonComponentsMap.WalletConnect:
                return <WalletConnectBtn {...props} />;
            default:
                return undefined;
        }
    }, [props, buttonComponent])
    return <TabItemPlus>{render}</TabItemPlus>;
}

export const HideOnScroll = React.forwardRef(({children, window, ...rest}: any, ref) => {
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
    });
    return <Slide  {...rest} appear={false} adirection="down" forwardedRef={ref} in={!trigger}>
        {children}
    </Slide>
})

// const _headerMenuData = React.useMemo(()=>{
//     // const {register,order,joinAmm,dAppTrade,raw_data} = allowTrade;
//     // @ts-ignore
//     return headerMenuData.reduce((pre,ele) =>{
//         // debugger
//         myLog('Liquidity')
//         if(allowTrade.order.enable === false &&  .includes(ele.label.id)){
//             ele.status = 'disabled';
//         }else if(allowTrade.joinAmm.enable === false && ['Liquidity'].includes(ele.label.id) ){
//             ele.status = 'disabled';
//         }
//         return [...pre,ele]
//     },[] as HeaderMenuItemInterface[])
//
// },[allowTrade.order.enable])


export const Header = withTranslation(['layout', 'common'], {withRef: true})(React.forwardRef(({
                                                                                                   headerMenuData,
                                                                                                   headerToolBarData,
                                                                                                   allowTrade,
                                                                                                   selected,
                                                                                                   isWrap = true,
                                                                                                   isLandPage = false,
                                                                                                   i18n,
                                                                                                   ...rest
                                                                                               }: HeaderProps & WithTranslation, ref: React.ForwardedRef<any>) => {
    const { themeMode, setTheme } = useSettings()
    const history = useHistory()
    const location = useLocation()
    const getMenuButtons = React.useCallback(({
                                toolbarList,
                                ...rest
                            }: { toolbarList: HeaderToolBarInterface[] } & WithTranslation) => {
        return ToolBarAvailableItem.map((index: number) => {
            return <ToolBarItem {...{...toolbarList[ index ], ...rest}} key={index}/>
        })
        // toolbarList.map((item, index) =>);
    }, [])

    // const getSettingsButton = ({
    //     toolbarList,
    //     ...rest
    // }: { toolbarList: HeaderToolBarInterface[] } & WithTranslation) => {
    //     return <ToolBarItem {...{...toolbarList[2], ...rest}} />
    // }

    const getDrawerChoices = React.useCallback(({
                                  menuList,
                                  layer = 0,
                                  ...rest
                              }: { menuList: HeaderMenuItemInterface[], layer?: number, handleListKeyDown?: any } & WithTranslation) => {
        const nodeMenuItem = ({label, router, layer, child, ...rest}: HeaderMenuItemInterface & any) => {
            return <>{layer >= 1 ? <Layer2Item {...{...rest, label, router, child, layer}} />
                : <Typography variant={'body1'} key={label.id} color={'inherit'}>{rest.t(label.i18nKey)}</Typography>
            }
            </>
        }

        const Memoized = ({label, router, child, layer, ref, ...rest}: any) => (<HeaderMenuSub {...{
            ...rest,
            label,
            router,
            allowTrade,
            child,
            layer,
            selected: new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected) ? true : false,
            // className: new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected) ? 'Mui-selected' : '',
            renderList: ({handleListKeyDown}: { handleListKeyDown: ({...rest}) => any }) => {
                return getDrawerChoices({menuList: child, layer: layer + 1, handleListKeyDown, ...rest})
            },
        }} />);

        return menuList.map((props: HeaderMenuItemInterface) => {
            const {label, child, status} = props;
            const selectedFlag = new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected)
            if (status === HeaderMenuTabStatus.hidden) {
                // return <React.Fragment key={label.id + '-' + layer}></React.Fragment>
                return <React.Fragment key={label.id + '-' + layer}></React.Fragment>
            } else {
                if (child) {
                    return <Memoized {...{
                        ...props,
                        // status: checkEnable({headerMenuItem: props, allowTrade}),
                        layer, ...rest
                    }} key={label.id + '-' + layer}/>
                } else {
                    return <HeadMenuItem selected={selectedFlag}
                                         {...{
                                             ...props,
                                             allowTrade,
                                             layer,
                                             children: nodeMenuItem({...props, layer, child, ...rest}),
                                             style: {textDecoration: "none"},
                                             key: label.id + '-' + layer,
                                         }} onClick={rest?.handleListKeyDown ? rest.handleListKeyDown : undefined}/>
                }
            }
        });
    }, [allowTrade, selected])

    const handleThemeClick = React.useCallback(() => {
        setTheme(themeMode === 'light' ? ThemeType.dark : ThemeType.light);
    }, [themeMode, setTheme])

    const displayDesktop = React.useMemo(() => {
        return (
            <ToolBarStyled>
                <Box display="flex" alignContent="center" justifyContent={"flex-start"}
                     alignItems={"stretch"}>
                    <LoopringLogo/>
                    {!isLandPage && getDrawerChoices({menuList: headerMenuData, i18n, ...rest})}
                </Box>
                <Box component={'ul'} display="flex" alignItems="center" justifyContent={"flex-end"}
                     color={'textColorSecondary'}>
                    {isLandPage ? (
                        <>
                            {/* {getDrawerChoices({menuList: landingMenuData, i18n, ...rest})} */}
                            <Grid container spacing={4}>
                                <GridStyled 
                                    iscurrentroute={location.pathname === '/' ? 'true' : 'false'}
                                    item
                                    onClick={() => history.push('/')}>zkRollup Layer2</GridStyled>
                                <GridStyled iscurrentroute={location.pathname === '/wallet' ? 'true' : 'false'} item onClick={() => history.push('/wallet')}>Smart Wallet</GridStyled>
                            </Grid>
                            <Box marginLeft={4} style={{ cursor: 'pointer' }} onClick={handleThemeClick}>
                                {themeMode === 'dark' ?  <DarkIcon /> : <LightIcon />}
                            </Box>
                        </>
                    ) : (
                        <>
                            <LinkStyle variant={'body2'} href={'https://legacy.loopring.io/'}>
                                Use Legacy UI
                            </LinkStyle>
                            {getMenuButtons({toolbarList: headerToolBarData, i18n, ...rest})}
                        </>
                    )}
                </Box>
            </ToolBarStyled>
        );
    }, [headerToolBarData, headerMenuData, getDrawerChoices, getMenuButtons, i18n, rest, isLandPage]);

    const paddingStyle = {
        paddingTop: 0,
        paddingRight: isLandPage ? 0 : 24,
        paddingBottom: 0,
        paddingLeft: isLandPage ? 0 : 24,
    }

    return (
        <HeaderStyled elevation={4} ref={ref} className={`${rest?.className}`}>
            {isWrap
                ? <Container style={paddingStyle} className={'wrap'} maxWidth='lg'>
                    {displayDesktop}
                    </Container>
                : <Box marginX={2}>{displayDesktop}</Box>
            }
        </HeaderStyled>
    );
}));
