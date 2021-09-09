import { Box, Container, ListItemAvatar, MenuItem, MenuProps, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { WithTranslation } from "react-i18next";
// @ts-ignore
import { anchorRef, bindHover, bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { BasicHeaderItem, HeadMenuType, MenuItemLink, MenuItemProps } from './Interface'
import styled from "@emotion/styled";
import clsx from "clsx";
import { DropDownIcon } from '@loopring-web/common-resources';
import Menu from 'material-ui-popup-state/HoverMenu';
import React, { ForwardedRef, RefAttributes } from "react";
// import Popover from 'material-ui-popup-state/HoverPopover';
// background-color: ${theme.colorBase.primaryLight};



// &:after {
//     ${hr}
// }
// export const MenuTab = styled(Tab)`
//   opacity: 1;
//   height: var(--header-height);
//   &.MuiTab-root.Mui-selected {
//     //background-color: chocolate;
//
//     //color: var(--color-text-primary);
//
//
//   }
// ` as unknown as typeof Tab;
export const HeaderMenu = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  position: relative;
` as typeof Container;
const StyledHeadMenuItem = styled(MenuItem)<MenuItemProps<any>>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-transform: capitalize;
  // font-size: ${({theme}) => theme.fontDefault.h5};
  box-shadow: inherit;
  height: var(--header-height);
  //color: var(--color-text-secondary);
  background: inherit;
  position: relative;
  &.Mui-selected,&:hover,&.Mui-selected:hover {
    background: inherit;
    color: var(--color-text-button-select);
  }
  
  &.layer-0 {
    .MuiButtonBase-root {
      opacity: 1;
      color: inherit;

      &:hover {
        // color: var(--primary);
      }
    }


    .MuiTab-root {
      &:hover {
        //color: var(--primary);
      }
    }


    //.MuiButtonBase-root {
    //  opacity: 1;
    //  color: inherit;
    //}
  }

  //svg {
  //  width: var(--header-menu-icon-size);
  //  height: var(--header-menu-icon-size);
  //}

  &&.layer-next {
    display: flex;
  }

}
` as typeof MenuItem;
const StyledLayer2Item = styled(MenuItem)<MenuItemProps<any>>`
   padding: 0 1.2rem;
  // border-left-color: transparent;
   height: 100%;
  //
  p {
    font-size: ${({theme}) => theme.fontDefault.h5};
    line-height: 2em;
  }

  h5 {
    color: var(--color-text-primary);
    text-transform: capitalize;
    line-height: 2em;
  }

  &:hover {
    //border-left-color: transparent;
    background: var(--opacity);
    h5 {
      color: var(--color-primary)
    }

    //background: var(--color-box-hover);
  }

  // .dot {
  //   width: 24px;
  //   text-align: center;
  //   text-indent: .3em;
  //   //font-size:1.1em;
  //   transform: scale(1.2) translateY(5px);
  //   color: var(--color-primary)
  //
  // }
` as typeof MenuItem;


const StyledHeaderMenuSub = styled(Menu)<MenuProps>`
  && {
    color: var(--color-text-secondary)
    ul {
      background-color: var(--color-pop-bg);
      padding: 0;
      .layer-1 {
        height: var(--header-menu-list-height)
      }
    }


  }` as typeof Menu;
const StyledTabBtn = styled(MenuItem)<MenuItemProps<any>>`
  && {
    text-transform: capitalize;
    display: flex;
    height: 100%;
    //color: var(--color-text-secondary);
    // font-size: ${({theme}) => theme.fontDefault.h5};
    padding: 0 16px;
    svg {
      transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    }
    &:hover {
      background-color: inherit;
      svg {
        transform: rotate(180deg);
      }
    }
` as typeof MenuItem;


export const HeadMenuItem = React.memo(React.forwardRef(<I extends BasicHeaderItem>({
                                                                                        className,
                                                                                        layer,
                                                                                        selected,
                                                                                        handleListKeyDown,
                                                                                        children,
                                                                                        router,
                                                                                    }: MenuItemLink<I>, ref: ForwardedRef<any>) => {
    return <StyledHeadMenuItem  selected={selected}
        className={clsx([`layer-${layer}`, className])} ref={ref}
        onClick={handleListKeyDown ? handleListKeyDown : undefined}
        {...{
            component: RouterLink,
            to: router ? router.path : '',
            style: {textDecoration: "none"},
            // ...props
        }} >  {children}</StyledHeadMenuItem>;
})) as <I extends BasicHeaderItem>(props: MenuItemLink<I>) => JSX.Element;


export let Layer2Item: <I extends BasicHeaderItem>(props: (MenuItemProps<I> & WithTranslation)) => JSX.Element;
Layer2Item = React.memo(<I extends BasicHeaderItem>({t, label}: MenuItemProps<I> & WithTranslation) => {
    return <StyledLayer2Item key={label.id}>
        {/*<Box className={'dot'} paddingTop={0}>&#x25CF;</Box>*/}
        <Box display={"flex"} paddingRight={1.5} flexDirection={"column"} justifyContent={"space-around"}>
            <Box paddingTop={0.5} lineHeight={'1.1'}><Typography component={'h5'} variant={"h6"}>{t(label.i18nKey)}</Typography></Box>
            <Box><Typography component={'p'} variant={'body2'}>{label?.description ? t(label.description) : ''}</Typography></Box>
        </Box>
    </StyledLayer2Item>
}) as <I extends BasicHeaderItem>(props: MenuItemProps<I> & WithTranslation) => JSX.Element;


export const HeaderMenuSub = React.memo(React.forwardRef(<I extends BasicHeaderItem>({
                                                                                         t,
                                                                                         label,
                                                                                         className,
                                                                                         selected,
                                                                                         renderList,
                                                                                         layer = 0
                                                                                     }: HeadMenuType<I> & WithTranslation, ref: ForwardedRef<any>) => {

    const popupState = usePopupState({variant: 'popover', popupId: `popupId: 'tradeHeaderSubMenu'`});
    return <><StyledTabBtn selected={selected} {...bindHover(popupState)} key={label.id} className={className} ref={ref}>
        <Typography component={'span'} variant={'body1'} paddingRight={1}>
            {t(label.i18nKey)}</Typography>
            <ListItemAvatar color={'inherit'}><DropDownIcon/></ListItemAvatar>
        </StyledTabBtn>
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






