import { IconButton, MenuItem as MuiMenuItem, Select, SelectProps } from '@mui/material'
import styled from '@emotion/styled'
import { MuiMenuItemProps } from './Interface'
import React from 'react'

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
