import { MenuItem as MuiMenuItem, Select, SelectProps } from '@material-ui/core';
import styled from '@emotion/styled';
import { MuiMenuItemProps } from './Interface';
import React from 'react';

//backgroundColor: ${theme.colorBase.primaryLight};
// background-color: ${theme.colorBase.background().hover};
export const MenuItem = styled(MuiMenuItem)<MuiMenuItemProps>`
   ${({withNoCheckIcon}) => {
    return withNoCheckIcon === 'true' ? `        
        &.Mui-selected, &.Mui-selected.Mui-focusVisible {
            color: var(--color-text-primary);
            &:after{
             display:none;
            }
        }
     ` : ''
}}
  
` as React.ComponentType<MuiMenuItemProps>;

export const OutlineSelect = styled(Select)`
  padding: 0;
  border: transparent;
  background-color: transparent;
  color: ${({theme}) => theme.colorBase.textSecondary};

  &.MuiInputBase-root {
    min-width: auto;
    width: auto;
  }

  svg {
    right: .4rem;
    top:  ${({theme}) => theme.unit}px;
    position: absolute;
    pointer-events: none;
    transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    color: var(--color-text-secondary)
  }

  .MuiSelect-iconOpen {
    transform: rotate(180deg)
  }

  .MuiSelect-select, &.Mui-selected.Mui-focusVisible {
    &:focus {
      background-color: transparent;
    }
    &:before {
      content: '';
      display: none;
    }
  }

  &:hover {
    color:var(--color-text-primary);
    border-left-color: transparent;
  }

  input {
    padding-right: 0;
  }

  &:hover:not(.Mui-disabled):before,
  &:after, &:before {
    margin: 0 auto;
    width: 60%;
    border: 0;
  }
` as React.ComponentType<SelectProps>;


export const OutlineSelectItem = styled(MenuItem)<any>`
  padding: ${({theme}) => `0 ${theme.unit * 1} $0 ${theme.unit * 1} `};
  padding-right: ${({theme}) => `${theme.unit * 2}`};

  &.Mui-selected, &.Mui-selected.Mui-focusVisible {
    padding: ${({theme}) => `${theme.unit * 1} ${theme.unit * 1} 0 ${theme.unit * 1} `};
    padding-right: ${({theme}) => `${theme.unit * 2}`};

    &:after {
      content: '';
    }
  }

  &:hover {
    color:var(--color-text-primary);
    border-left-color: transparent;
  }
` as typeof MenuItem;

export * from './HeadMenuItem'
export * from './Interface'
export * from './CoinList'
export * from './HeadToolbar'
export * from './SubMenuList'
export * from './Notification';


// export * from './SimpleSelectItem'



