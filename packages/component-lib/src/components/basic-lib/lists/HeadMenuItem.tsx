import {
  Box,
  BoxProps,
  Container,
  ListItemAvatar,
  MenuItem,
  MenuProps,
  Typography,
} from '@mui/material'
import { WithTranslation } from 'react-i18next'
import { bindHover, bindMenu, usePopupState } from 'material-ui-popup-state/hooks'
import { BasicHeaderItem, HeadMenuType, MenuItemLink, MenuItemProps } from './Interface'
import styled from '@emotion/styled'
import clsx from 'clsx'
import {
  ammDisableList,
  DropDownIcon,
  L1L2_NAME_DEFINED,
  MapChainId,
  orderDisableList,
} from '@loopring-web/common-resources'
import Menu from 'material-ui-popup-state/HoverMenu'
import React, { ForwardedRef, RefAttributes } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useSettings } from '../../../stores'

export const HeaderMenu = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  position: relative;
` as typeof Container
const StyledHeadMenuItem = styled(MenuItem)<MenuItemProps<any>>`
  &:not(.layer-0) {
    display: flex;
    min-height: var(--header-submenu-item-height);
    height: fit-content;
    width: var(--header-submenu-item-weight);
    align-items: flex-start;
  }


  &.layer-0 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-transform: capitalize;
      // font-size: ${({ theme }) => theme.fontDefault.h5};
    box-shadow: inherit;
    height: var(--header-height);
    //color: var(--color-text-secondary);
    background: inherit;
    position: relative;
    &.Mui-disabled{
      color: var(--color-text-disable)
    }
    &.Mui-selected, &.Mui-selected:hover {
      background: inherit;
      color: var(--color-text-button-select);
      //color: var(--color-primary);
    }
    &:hover {
      background: inherit;
      color: var(--color-primary);
    }

    &.Mui-selected.Mui-focusVisible {
      background: inherit;
    }

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

  .mobile & {
    align-items: flex-start;
  }

}
` as typeof MenuItem
const StyledLayer2Item = styled(Box)<BoxProps<any>>`
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &:hover {
    //border-left-color: transparent;
    background: var(--opacity);
    h5 {
      color: var(--color-primary);
    }
  }
` as typeof MenuItem

const StyledHeaderMenuSub = styled(Menu)<MenuProps>`
  && {
    color: var(--color-text-third);

    ul {
      box-shadow: inset 0.5px var(--color-border);
      background: var(--color-box-pop);
      padding: 0;
      //.layer-sub {
      //  height: var(--header-menu-list-height)
      //}
    }
  }
` as typeof Menu
const StyledTabBtn = styled(MenuItem)<MenuItemProps<any>>`
  &.Mui-selected, &.Mui-selected.Mui-focusVisible {
    background: inherit;
  }
  &.Mui-disabled{
    color: var(--color-text-disable)
  }


  && {
    text-transform: capitalize;
    display: flex;
    height: 100%;
    padding-right: 0;

    svg {
      transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    }

    &:hover {
      background-color: inherit;
      color: var(--color-primary);
      svg {
        transform: rotate(180deg);
      }
    }
` as typeof MenuItem

const checkEnable = ({ allowTrade, id }: { id: string; allowTrade?: any }): boolean => {
  if (allowTrade?.order?.enable === false && orderDisableList.includes(id)) {
    return true
  } else if (allowTrade?.joinAmm?.enable === false && ammDisableList.includes(id)) {
    return true
  } else {
    return false
  }
}

export const HeadMenuItem = React.memo(
  React.forwardRef(
    <I extends BasicHeaderItem>(
      {
        className,
        layer,
        selected,
        allowTrade,
        handleListKeyDown,
        children,
        status,
        router,
        label,
      }: MenuItemLink<I>,
      ref: ForwardedRef<any>,
    ) => {
      const history = useHistory()
      const match = useRouteMatch('/trade/:item/:pair')
      //@ts-ignore
      const pair = match?.params?.pair ?? 'LRC-ETH'

      return (
        <StyledHeadMenuItem
          selected={selected}
          disabled={checkEnable({ allowTrade, id: label.id }) || status === 'disabled'}
          className={clsx([`layer-${layer}`, className])}
          ref={ref}
          title={router?.description ?? undefined}
          onClick={
            handleListKeyDown
              ? handleListKeyDown
              : () => {
                  router?.path?.startsWith('http')
                    ? window.open(router?.path, '_blank')
                    : history.push(router?.path.replace('${pair}', pair) ?? '')
                }
          }
        >
          {children}
        </StyledHeadMenuItem>
      )
    },
  ),
) as <I extends BasicHeaderItem>(props: MenuItemLink<I>) => JSX.Element

export let Layer2Item: <I extends BasicHeaderItem>(
  props: MenuItemProps<I> & WithTranslation,
) => JSX.Element
Layer2Item = React.memo(
  <I extends BasicHeaderItem>({ t, label }: MenuItemProps<I> & WithTranslation) => {
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    return (
      <StyledLayer2Item className={'layer-sub'} key={label.id}>
        <Typography lineHeight={'22px'} component={'h5'} variant={'body1'} color={'text.primary'}>
          {t(label.i18nKey, {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            ns: ['layout', 'landPage', 'common'],
          })}
        </Typography>
        <Typography
          lineHeight={'20px'}
          component={'p'}
          whiteSpace={'pre-line'}
          variant={'body2'}
          color={'inherit'}
        >
          {label?.description ? t(label.description) : ''}
        </Typography>
      </StyledLayer2Item>
    )
  },
) as <I extends BasicHeaderItem>(props: MenuItemProps<I> & WithTranslation) => JSX.Element

export const HeaderMenuSub = React.memo(
  React.forwardRef(
    <I extends BasicHeaderItem>(
      {
        t,
        label,
        className,
        selected,
        allowTrade,
        status,
        renderList,
        layer = 0,
        anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
      }: HeadMenuType<I> & WithTranslation,
      ref: ForwardedRef<any>,
    ) => {
      const { defaultNetwork } = useSettings()
      const network = MapChainId[defaultNetwork] ?? MapChainId[1]
      const popupState = usePopupState({
        variant: 'popover',
        popupId: `tradeHeaderSubMenu${label.id}`,
      })
      return (
        <>
          {checkEnable({ allowTrade, id: label.id }) || status === 'disabled' ? (
            <StyledTabBtn disabled={true} selected={selected} className={className}>
              <Typography component={'span'} variant={'body1'} paddingRight={1} color={'inherit'}>
                {t(label.i18nKey, {
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  ns: ['layout', 'landPage', 'common'],
                })}
              </Typography>
            </StyledTabBtn>
          ) : (
            <>
              <StyledTabBtn
                {...bindHover(popupState)}
                selected={selected}
                className={className}
                ref={ref}
              >
                <Typography component={'span'} variant={'body1'} paddingRight={1} color={'inherit'}>
                  {t(label.i18nKey, {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                    ns: ['layout', 'landPage', 'common'],
                  })}
                </Typography>
                <ListItemAvatar
                  color={'inherit'}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <DropDownIcon
                    style={{
                      transform: anchorOrigin.vertical === 'right' ? 'rotate(-90deg)' : '',
                    }}
                    fontSize={'medium'}
                  />
                </ListItemAvatar>
              </StyledTabBtn>
              <StyledHeaderMenuSub
                key={`menu-${layer}-${label.id}`}
                {...bindMenu(popupState)}
                // getContentAnchorEl={null}
                anchorOrigin={anchorOrigin}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                className={`MuiPaper-elevation2 menu-${layer}-${label.id}`}
              >
                {renderList &&
                  renderList({
                    handleListKeyDown: popupState.close,
                  })}
              </StyledHeaderMenuSub>
            </>
          )}
        </>
      )
    },
  ),
) as <I extends BasicHeaderItem>(
  props: HeadMenuType<I> & WithTranslation & RefAttributes<any>,
) => JSX.Element
