import styled from '@emotion/styled'
import {
  Box,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemProps,
  ListItemText,
  Typography,
} from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { SubMenuListProps } from './Interface'

import { Link as RouterLink } from 'react-router-dom'
import { L1L2_NAME_DEFINED, MapChainId, myLog } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import React from 'react'

export const SubMenuItem = styled<any>(ListItem)`
  border-left: 2px solid transparent;
  border-right: 0px solid transparent;
  padding: 0 0 0 ${({ theme }) => theme.unit * 3}px;
  width: var(--sub-menuItem-width);
  min-width: var(--sub-menuItem-width);
  height: var(--sub-menuItem-height);
  color: var(--color-text-secondary);
  text-transform: capitalize;

  .MuiListItemAvatar-root {
    margin-left: ${({ theme }) => theme.unit * 0.75}px;
    color: var(--color-text-third);

    svg {
      width: var(--header-menu-icon-size);
      height: var(--header-menu-icon-size);
    }
  }

  //&:hover,
  //&.Mui-selected,
  //&.Mui-selected.Mui-focusVisible,
  //&.Mui-selected:hover {
  //}

  &:hover,
  &.Mui-selected,
  &.Mui-selected:hover,
  &.Mui-selected.Mui-focusVisible,
  &.Mui-selected.Mui-focusVisible:hover {
    background-color: var(--color-box-hover);
    border-color: var(--color-primary);
    color: var(--color-button-select);

    &&,
    .MuiListItemAvatar-root {
      color: var(--color-button-select);
    }
  }

  //&.Mui-selected, &.Mui-selected.Mui-focusVisible {
  //  background-color: var(--color-primary);
  //  color: var(--color-text-button);
  //  &:hover{
  //    background-color: var(--color-primary);
  //    color: var(--color-text-button);
  //  }
  //  //border-color:var(--primary);
  //
  //}
` as (props: ListItemProps<any>) => JSX.Element
export const SubMenuList = withTranslation(['layout', 'common'], {
  withRef: true,
})(<I extends any>({ t, selected, subMenu }: SubMenuListProps<I> & WithTranslation<'layout'>) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const filteredSubMenus = Object.keys(subMenu).filter(key => subMenu[key])
  return (
    <>
      {filteredSubMenus.map((list: any, index) => {
        const subList = subMenu[list]?.map((item: any) => {
          return (
            <SubMenuItem
              button
              selected={new RegExp(item.label.id, 'ig').test(selected)}
              alignItems={item.label.description ? 'flex-start' : 'center'}
              key={item.label.id}
              {...{
                component: RouterLink,
                to: item.router ? item.router.path : '',
                style: { textDecoration: 'none' },
                // ...props
              }}
            >
              <ListItemAvatar>
                <item.icon />
              </ListItemAvatar>
              {item.label.description ? (
                <ListItemText
                  primary={
                    <Typography sx={{ display: 'block' }} component='span' variant='body1'>
                      {t(item.label.i18nKey, {
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      })}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ display: 'inline' }} component='span' variant='body2'>
                      {t(item.label.description)}
                    </Typography>
                  }
                />
              ) : (
                <ListItemText
                  primary={
                    <Typography
                      sx={{ display: 'block' }}
                      color={'text.button'}
                      component='span'
                      variant='body1'
                    >
                      {t(item.label.i18nKey, {
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      })}
                    </Typography>
                  }
                />
              )}
            </SubMenuItem>
          )
        })
        return (
          <>
            {subList ? (
              <div key={`group-${list}`}>
                {subList}
                {index + 1 !== filteredSubMenus.length ? (
                  <Box marginX={3}>
                    <Divider />
                  </Box>
                ) : (
                  ''
                )}
              </div>
            ) : (
              <React.Fragment key={`group-any`}></React.Fragment>
            )}
          </>
        )
      })}
    </>
  )
})
