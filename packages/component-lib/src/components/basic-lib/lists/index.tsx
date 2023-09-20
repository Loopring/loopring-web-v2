import {
  Card,
  CardProps,
  IconButton,
  MenuItem as MuiMenuItem,
  Select,
  SelectProps,
} from '@mui/material'
import styled from '@emotion/styled'
import { MuiMenuItemProps } from './Interface'
import React from 'react'
import { BorderTickIcon, SystemColor } from '@loopring-web/common-resources'

export const MenuItem = styled(MuiMenuItem)<MuiMenuItemProps>`
  ${({ withnocheckicon }) => {
    return withnocheckicon === 'true'
      ? `        
        &.Mui-selected, &.Mui-selected.Mui-focusVisible {
            color: var(--color-text-primary);
            &:after{
             display:none;
            }
        }
     `
      : ''
  }}
` as React.ComponentType<MuiMenuItemProps>

export const OutlineSelect = styled(Select)`
  //padding: 0;
  min-width: var(--btn-min-width);
  //background-color: transparent;
  color: var(--color-text-secondary);
  .MuiInput-input {
    padding: 0.3rem 0.3rem 0.3rem 0.8rem;
  }
  border: transparent;
  .MuiSelect-select,
  &.Mui-selected.Mui-focusVisible {
    border: transparent;
    &:focus {
      background-color: transparent;
    }

    &:before {
      content: '';
      display: none;
      pointer-events: none;
    }
  }

  &:hover {
    color: var(--color-text-primary);
    border: transparent;
  }

  input {
    padding-right: 0;
  }

  &:hover:not(.Mui-disabled):before,
  &:after,
  &:before {
    margin: 0 auto;
    width: 60%;
    border: 0;
    pointer-events: none;
  }
` as React.ComponentType<SelectProps>

export const OutlineSelectItem = styled(MenuItem)<any>`
  &.MuiSelect-root {
    padding: ${({ theme }) => `0 ${theme.unit * 1} $0 ${theme.unit * 1} `};
    padding-right: ${({ theme }) => `${theme.unit * 2}`};
    &:hover {
      color: var(--color-text-primary);
      border-left-color: transparent;
    }
  }

  &.Mui-selected,
  &.Mui-selected.Mui-focusVisible {
    padding: ${({ theme }) => `${theme.unit * 1} ${theme.unit * 1} 0 ${theme.unit * 1} `};
    padding-right: ${({ theme }) => `${theme.unit * 2}`};

    &:after {
      content: '';
    }
  }
` as typeof MenuItem
export const IconButtonStyle = styled(IconButton)`
  background-color: var(--color-box-nft-btn);
  margin: 0 ${({ theme }) => theme.unit / 2}px;
  ${({ theme }) => theme.border.defaultFrame({ c_key: 'transparent' })};
}`

const CardStyleItem = styled(Card)<
  CardProps & {
    contentheight?: number
    size?: 'large' | 'medium' | 'small' | undefined
  }
>`
  background: var(--color-global-bg);
  width: 100%;
  height: auto;
  display: flex;
  cursor: pointer;
  padding: 0 0 calc(100% + ${({ contentheight }) => `${contentheight ? contentheight : 80}px`});
  position: relative;
  background: var(--color-box);

  .MuiCardContent-root {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  &.column .MuiCardContent-root {
    flex-direction: column;
  }

  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => (3 / 2) * theme.unit}px;
  box-shadow: none;
  transition: none;
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: 'var(--color-border)',
      d_R: 0.5,
    })};

  &.selected,
  &:hover {
    ${({ theme }) =>
      theme.border.defaultFrame({
        c_key: 'var(--color-border-select)',
        d_R: 0.5,
      })};
  }

  img {
    object-fit: contain;
  }
  &.dualPrice {
    padding: ${({ theme }) => theme.unit}px;
    height: 54px;
  }
` as (
  props: CardProps & {
    contentheight?: number
    size?: 'large' | 'medium' | 'small' | undefined
  },
) => JSX.Element
export const TickCardStyleItem = (
  props: CardProps & {
    contentheight?: number
    size?: 'large' | 'medium' | 'small' | undefined
    selected?: boolean
  },
) => {
  const { children, selected, ...rest } = props
  return (
    <CardStyleItem {...rest}>
      {selected && (
        <BorderTickIcon
          fontSize={'large'}
          fill={SystemColor.blue}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        />
      )}
      {children}
    </CardStyleItem>
  )
}

export * from './FileListItem'
export * from './HeadMenuItem'
export * from './Interface'
export * from './CoinList'
export * from './HeadToolbar'
export * from './SubMenuList'
export * from './Notification'
export * from './CollectionItem'
export * from './NFTList'
// export * from './SimpleSelectItem'
