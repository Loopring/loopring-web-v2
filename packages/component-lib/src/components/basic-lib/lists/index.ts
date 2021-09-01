import { MenuItem as MuiMenuItem, Select, SelectProps } from '@material-ui/core';
import styled from '@emotion/styled';
import { MuiMenuItemProps } from './Interface';
import React from 'react';

//backgroundColor: ${theme.colorBase.primaryLight};
// background-color: ${theme.colorBase.background().hover};
export const MenuItem = styled(MuiMenuItem)<MuiMenuItemProps>`
  ${({withnocheckicon}) => {
    return withnocheckicon === 'true' ? `        
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
  //padding: 0;
  
  //background-color: transparent;
  color: var(--color-text-secondary);
  padding: .3rem 1.2rem .3rem .8rem;
  //&.MuiInputBase-root {
  //  min-width: auto;
  //  width: auto;
  //}

  svg {
    //right: .4rem;
    top: ${({theme}) => theme.unit -3}px;
    position: absolute;
    //pointer-events: none;
    //transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    //color: var(--color-text-secondary)
  }

  //.MuiSelect-iconOpen {
  //  transform: rotate(180deg)
  //}
  border: transparent;
  .MuiSelect-select, &.Mui-selected.Mui-focusVisible {
    border: transparent;
    &:focus {
      background-color: transparent;
    }

    &:before {
      content: '';
      display: none;
    }
  }

  &:hover {
    color: var(--color-text-primary);
    border: transparent;
    //border-left-color: transparent;
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
  &.MuiSelect-root{
    padding: ${({theme}) => `0 ${theme.unit * 1} $0 ${theme.unit * 1} `};
    padding-right: ${({theme}) => `${theme.unit * 2}`};
    &:hover {
      color: var(--color-text-primary);
      border-left-color: transparent;
    }
  }
 

  &.Mui-selected, &.Mui-selected.Mui-focusVisible {
    padding: ${({theme}) => `${theme.unit * 1} ${theme.unit * 1} 0 ${theme.unit * 1} `};
    padding-right: ${({theme}) => `${theme.unit * 2}`};

    &:after {
      content: '';
    }
  }

  
` as typeof MenuItem;

export * from './HeadMenuItem'
export * from './Interface'
export * from './CoinList'
export * from './HeadToolbar'
export * from './SubMenuList'
export * from './Notification';


// export * from './SimpleSelectItem'



