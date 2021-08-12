import styled from '@emotion/styled';
import { AppBar, Box, Container, IconButton, Slide, Toolbar } from '@material-ui/core';
import { Typography } from '@material-ui/core/';
import { Link as RouterLink } from "react-router-dom";
import logoSVG from '@loopring-web/common-resources/assets/svg/logo.svg'
import { WithTranslation, withTranslation } from 'react-i18next';
import { HeaderMenuSub, HeadMenuItem, Layer2Item, MenuTab, TabItemPlus } from '../basic-lib';
import { HeaderProps, HeaderToolBarInterface } from './Interface';
import {
    ButtonComponentsMap,
    HeaderMenuItemInterface,
    HeaderMenuTabStatus,
    ToolBarAvailableItem
} from '@loopring-web/common-resources';
import { BtnDownload, BtnLanguage, BtnNotification, BtnTheme, WalletConnectBtn } from './toolbar';
import React from 'react';
import { useSettings } from '../../stores';

const ToolBarStyled = styled(Toolbar)`
  && {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    padding: 0;
  }
`
const StyledDiv = styled.div`
  &.item-scrolled .MuiAppBar-root.MuiAppBar-positionFixed {
    background: var(--color-global-bg);
  }
`
const HeaderStyled = styled(AppBar)`
  && {
    .wrap {
      height: var(--header-height);
      margin: 0 auto;
      //min-width: 800px;
    }

    background-color: var(--color-box);
    backdrop-filter: blur(4px);
    box-sizing: border-box;
      // border-bottom: ${({theme}) => theme.border.borderConfig({d_W: 1, c_key: 'blur'})};
    border-radius: 0;
    box-shadow: none;

    &.item-scrolled.MuiAppBar-root.MuiAppBar-positionFixed {
      background-color: var(--color-box);
      box-shadow: var(--shadow);
    }
  }
`

const LogoStyle = styled(Typography)`
  a.MuiButtonBase-root {
    height: auto;
    width: auto;
    min-width: auto;
    border-radius: 0;

    &:hover {
      background-color: inherit;

      span.MuiIconButton-label {
        background: var(--color-primary);
      }
    }

    span.MuiIconButton-label {
      background: var(--color-text-primary);
      mask: url(${logoSVG}) space;
      mask-size: contain;
      mask-position: center;
      mask-size: contain;
      width: 105px;
      height: 40px;
      margin-top: -6px;
      color: transparent;
    }
  }
` as typeof Typography

export const LoopringLogo = (<LogoStyle variant="h6" component="h1">
        <IconButton edge="start" aria-label="menu" component={RouterLink} to="/#" color={"inherit"}>
            Loopring 路印
            {/*/!*<SvgIcon>*!/*/}
            {/*    <img src={logoSVG} alt="" width="104" height="40" />*/}
            {/*</SvgIcon>*/}
        </IconButton>
    </LogoStyle>
);

const ToolBarItem = ({buttonComponent, ...props}: any) => {
    const {themeMode, language} = useSettings()

    const render = React.useMemo(() => {
        switch (buttonComponent) {
            case  ButtonComponentsMap.Download:
                return <BtnDownload {...props} />;
            case  ButtonComponentsMap.Notification:
                return <BtnNotification {...props} />;
            case  ButtonComponentsMap.Theme:
                return <BtnTheme {...{...props, themeMode}} />;
            case  ButtonComponentsMap.Language:
                return <BtnLanguage {...{...props, language}} />;
            case  ButtonComponentsMap.WalletConnect:
                return <WalletConnectBtn {...props} />;
            default:
                return undefined;
        }
    }, [props, buttonComponent])
    return <TabItemPlus>{render}</TabItemPlus>;
}

export const HideOnScroll = React.forwardRef(({children, ...rest}: any, ref) => {
    const [className, setClassName] = React.useState('');
    const handleScroll = React.useCallback(() => {
        const position = window.pageYOffset;
        if (position > 20) {
            setClassName('item-scrolled');
        } else {
            setClassName('');
        }
    }, [setClassName]);

    React.useEffect(() => {
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);
    //className = {_className}
    return <Slide  {...rest} appear={false} adirection="down" forwardedRef={ref} in={!ref}>
        <StyledDiv className={className}>{children}</StyledDiv>
    </Slide>
})

export const Header = withTranslation(['layout', 'common'], {withRef: true})(React.forwardRef(({
                                                                                                   headerMenuData,
                                                                                                   headerToolBarData,
                                                                                                   selected,
                                                                                                   i18n,
                                                                                                   ...rest
                                                                                               }: HeaderProps & WithTranslation, ref: React.ForwardedRef<any>) => {

    const displayDesktop = () => {
        return (
            <ToolBarStyled>
                <Box display="flex" alignContent="center" justifyContent={"flex-start"}
                     alignItems={"stretch"}>
                    {LoopringLogo}
                    {getDrawerChoices({menuList: headerMenuData, i18n, ...rest})}
                </Box>
                <Box component={'ul'} display="flex" alignItems="center" justifyContent={"flex-end"}
                     color={'textColorSecondary'}>
                    {getMenuButtons({toolbarList: headerToolBarData, i18n, ...rest})}
                </Box>
            </ToolBarStyled>
        );
    };

    const getMenuButtons = ({
                                toolbarList,
                                ...rest
                            }: { toolbarList: HeaderToolBarInterface[] } & WithTranslation) => {
        return ToolBarAvailableItem.map((index: number) => {
            return <ToolBarItem {...{...toolbarList[ index ], ...rest}} key={index}/>
        })
        // toolbarList.map((item, index) =>);
    };

    const getDrawerChoices = ({
                                  menuList,
                                  layer = 0,
                                  ...rest
                              }: { menuList: HeaderMenuItemInterface[], layer?: number, handleListKeyDown?: any } & WithTranslation) => {
        const nodeMenuItem = ({label, router, layer, child, ...rest}: HeaderMenuItemInterface & any) => {
            const selectedFlag = new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected)
            return <>{layer >= 1 ? <Layer2Item {...{...rest, label, router, child, layer}} /> : //key={label.id+ '-layer2Item'}/> :
                // label.id === 'Layer2' ? <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'}>
                //     <MenuTab component='div' label={rest.t(label.i18nKey)} key={label.id}
                //              className={ selectedFlag ? 'Mui-selected' : ''}/>
                //     {rest.extender ? rest.extender : undefined}
                // </Box> :
                <MenuTab component='div' label={rest.t(label.i18nKey)} key={label.id}
                         className={selectedFlag ? 'Mui-selected' : ''}/>
            }
            </>
        }

        const Memoized = ({label, router, child, layer, ref, ...rest}: any) => (<HeaderMenuSub {...{
            ...rest,
            label,
            router,
            child,
            layer,
            className: new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected) ? 'Mui-selected' : '',
            renderList: ({handleListKeyDown}: { handleListKeyDown: ({...rest}) => any }) => {
                return getDrawerChoices({menuList: child, layer: layer + 1, handleListKeyDown, ...rest})
            },
        }} />);

        return menuList.map((props: HeaderMenuItemInterface) => {
            // @ts-ignore
            const {label, child, router, status} = props;
            if (status === HeaderMenuTabStatus.hidden) {
                // return <React.Fragment key={label.id + '-' + layer}></React.Fragment>
                return <React.Fragment key={label.id + '-' + layer}></React.Fragment>
            } else {
                if (child) {
                    return <Memoized {...{...props, layer, ...rest}} key={label.id + '-' + layer}/>
                } else {
                    return <HeadMenuItem  {...{
                        ...props,
                        layer,
                        children: nodeMenuItem({...props, layer, child, ...rest}),
                        style: {textDecoration: "none"},
                        key: label.id + '-' + layer,
                    }} onClick={rest?.handleListKeyDown ? rest.handleListKeyDown : undefined}/>
                }
            }
        });
    };

    return (
        <HeaderStyled ref={ref} className={rest?.className}>
            <Container className={'wrap'} maxWidth='lg'>
                {displayDesktop()}
            </Container>
        </HeaderStyled>

    );
}));