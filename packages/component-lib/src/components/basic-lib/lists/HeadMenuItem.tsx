import { Box, Button, Container, Link, MenuItem, Tab, Typography } from "@material-ui/core";
import { Link as RouterLink } from 'react-router-dom';
import { WithTranslation } from "react-i18next";
// @ts-ignore
import { anchorRef, bindHover, bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { BasicHeaderItem, HeadMenuType, MenuItemLink, MenuItemProps } from './Interface'
import styled from "@emotion/styled";
import clsx from "clsx";
import { DropDownIcon } from '@loopring-web/common-resources';
import { css } from "@emotion/react";
import Menu from 'material-ui-popup-state/HoverMenu';
import React, { ForwardedRef, RefAttributes } from "react";
// import Popover from 'material-ui-popup-state/HoverPopover';
const hr = ({theme}: any) => css`
  border-radius: ${theme.unit / 2}px;
  content: '';
  margin: 0 8px;
  display: block;
  height: 2px;
  background-color: ${theme.colorBase.primaryLight};
  //margin-bottom: -2px;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const MenuTab = styled(Tab)`
  opacity: 1;
  height: var(--header-height);
  &.MuiTab-root.Mui-selected {
    //background-color: chocolate;

    color: ${({theme}) => theme.colorBase.textPrimary};

    &:after {
      ${hr}
    }
  }
` as unknown as typeof Tab;
export const HeaderMenu = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  position: relative;
` as typeof Container;
const StyledHeadMenuItem = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-transform: capitalize;
  font-size: ${({theme}) => theme.fontDefault.h5};
  box-shadow: inherit;
  height: var(--header-height);
  color: ${({theme}) => theme.colorBase.textSecondary};
  position: relative;

  &.layer-0 {
    .MuiButtonBase-root {
      opacity: 1;
      color: inherit;
      &:hover{
        color: ${({theme}) => theme.colorBase.primaryLight};
      }
    }
    

    
      .MuiTab-root{
        &:hover {
          color: ${({theme}) => theme.colorBase.textPrimary};
        }
      }
     
     

      //.MuiButtonBase-root {
      //  opacity: 1;
      //  color: inherit;
      //}
    }
    svg {
      width: var(--header-menu-icon-size);
      height: var(--header-menu-icon-size);
    }

    &&.layer-next {
      display: flex;
    }

  }
` as typeof Link;
const StyledLayer2Item = styled(MenuItem)<any>`
  padding: 0 1.2rem;
  border-left-color: transparent;
  height: 100%;

  p {
    font-size: ${({theme}) => theme.fontDefault.h5};
    line-height: 2em;
  }

  h5 {
    color: ${({theme}) => theme.colorBase.textPrimary};
    text-transform: capitalize;
    line-height: 2em;
  }

  &:hover {
    border-left-color: transparent;

    h5 {
      color: ${({theme}) => theme.colorBase.primaryLight};
    }

    background: ${({theme}) => theme.colorBase.background().hover};
  }

  // .dot {
  //   width: 24px;
  //   text-align: center;
  //   text-indent: .3em;
  //   //font-size:1.1em;
  //   transform: scale(1.2) translateY(5px);
    //   color: ${({theme}) => theme.colorBase.primaryLight};
  //
  // }
` as typeof MenuItem;


const StyledHeaderMenuSub = styled(Menu)`
  && {
    color: ${({theme}) => theme.colorBase.textSecondary};

    ul {
      background-color: ${({theme}) => theme.colorBase.background().default};
      padding: 0;

      .layer-1 {
        height: var(--header-menu-list-height)
      }
    }


  }` as typeof Menu;
const StyledTabBtn = styled(Button)`
  && {
    text-transform: capitalize;
    display: flex;
    padding: initial;
    height: 100%;
    color: ${({theme}) => theme.colorBase.textSecondary};
    font-size: ${({theme}) => theme.fontDefault.h5};
    padding: 0 16px;

    svg {
      transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    }

    &:hover {
      background-color: inherit;
      color: ${({theme}) => theme.colorBase.textPrimary};

      svg {
        transform: rotate(180deg);
      }

    }

    &.Mui-selected {
      color: ${({theme}) => theme.colorBase.textPrimary};

      &:after {
        ${hr}
      }
    }

`;

export const HeadMenuItem = React.memo(React.forwardRef(<I extends BasicHeaderItem>({
                                                                                        className,
                                                                                        layer,
                                                                                        handleListKeyDown,
                                                                                        children,
                                                                                        router,
                                                                                    }: MenuItemLink<I>, ref: ForwardedRef<any>) => {
    return <StyledHeadMenuItem
        className={clsx([`layer-${layer}`, className])} ref={ref}
        onClick={handleListKeyDown ? handleListKeyDown : undefined}
        // disabled={status === HeaderMenuTabStatus.disabled}
        {...{
            component: RouterLink,
            to: router ? router.path : '',
            style: {textDecoration: "none"},
            // ...props
        }} >  {children}</StyledHeadMenuItem>;
}));


export const Layer2Item = <I extends BasicHeaderItem>({t, label}: MenuItemProps<I> & WithTranslation) => {
    return <StyledLayer2Item key={label.id}>
        {/*<Box className={'dot'} paddingTop={0}>&#x25CF;</Box>*/}
        <Box display={"flex"} paddingRight={1.5} flexDirection={"column"} justifyContent={"space-around"}>
            <Box paddingTop={0.5} lineHeight={'1.1'}><Typography component={'h5'}
                                                                 variant="h5">{t(label.i18nKey)}</Typography></Box>
            <Box><Typography component={'p'}
                             variant={'body2'}>{label?.description ? t(label.description) : ''}</Typography></Box>
        </Box>
    </StyledLayer2Item>
}


export const HeaderMenuSub = React.memo(React.forwardRef(<I extends BasicHeaderItem>({
                                                                                         t,
                                                                                         label,
                                                                                         className,
                                                                                         renderList,
                                                                                         layer = 0
                                                                                     }: HeadMenuType<I> & WithTranslation, ref: ForwardedRef<any>) => {

    const popupState = usePopupState({variant: 'popover', popupId: `popupId: 'tradeHeaderSubMenu'`});
    return <><StyledTabBtn {...bindHover(popupState)} key={label.id} className={className} ref={ref}> <Typography
        component={'span'}
        variant={'body1'} paddingRight={1}>{t(label.i18nKey)}</Typography><DropDownIcon/></StyledTabBtn>
        <StyledHeaderMenuSub key={`menu-${layer}-${label.id}`}
                             {...bindMenu(popupState)}
                             getContentAnchorEl={null}
                             anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                             transformOrigin={{vertical: 'top', horizontal: 'left'}}
                             className={`menu-${layer}-${label.id}`}>
            {renderList && renderList({handleListKeyDown: popupState.close})}
        </StyledHeaderMenuSub>
        {/*</ParentPopupState.Provider>*/}
    </>
})) as <I extends BasicHeaderItem> (props: HeadMenuType<I> & WithTranslation & RefAttributes<any>) => JSX.Element;






