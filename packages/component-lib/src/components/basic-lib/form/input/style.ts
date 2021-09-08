import styled from '@emotion/styled';
import { Box, BoxProps, Button, ButtonProps } from '@mui/material';
import React from 'react';
import CurrencyInput from 'react-currency-input-field';

export const IWrap = styled(Box)`
  ${({theme}) => theme.border.defaultFrame({c_key: 'var(--opacity)'})};
 
  .label-wrap {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }

  .message-wrap {
    .MuiFormHelperText-root {
      color: var(--color-error);
      text-align: right;
      font-size: ${({theme}) => theme.fontDefault.h6};
    }

  }

  .sub-label {
    text-align: right;
    cursor: pointer;

    .max-allow {
      text-decoration: underline dotted;
      &:hover {
        color: var(--color-secoundary);
      }
    }

    .no-balance {
      text-decoration: none;
    }
  }

  .coinInput-wrap, .btnInput-wrap {
    position: relative;
    box-sizing: border-box;
    background: var(--color-box);
    border-radius: ${({theme}) => theme.unit / 2}px;
    margin-top: ${({theme}) => `${theme.unit / 2}px`};
    height: var(--btn-Input-height);
   
    ::before {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 1;
      
    }


    &.error {
      border: 1px solid var(--color-error) !important;
      border-radius:  ${({theme}) => theme.unit / 2}px;
     
     
      // .input-wrap-right input,.icon-wrap-left {
      //       border-top-left-radius: 0px;
      //       border-bottom-left-radius: 0px;
      //       border-left:0
      // }
      //
      // .input-wrap-left input,.icon-wrap-right,button {
      //     border-top-right-radius: 0px;
      //     border-bottom-right-radius: 0px;
      //     border-right:0
      // }
    }
  }

  .input-wrap {
    //min-width: 128px;
    // width: 100%;
    flex: 1;
    height: 100%
  }

  .icon-wrap, .btn-wrap {
    max-width: var(--btn-max-width);
    min-width: var(--coin-min-width);

    .MuiButton-label {
      justify-content: flex-start;
    }

  }

` as typeof Box
export const CoinWrap:React.ComponentType<BoxProps & { logoColor?: any }> = styled(Box)<BoxProps & { logoColor?: any }>`
  & {

    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 1px solid transparent;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${({theme}) => theme.fontDefault.h5};
    color: var(--color-text-primary);

    .placeholder {
      color: var(--color-text-secondary);
    }
  }

  &.icon-wrap-right > div {
    justify-content: flex-start;
    padding-left: ${({theme}) => theme.unit / 2 * 3}px;
    align-items: center;
  }

  &.icon-wrap-left > div {
    justify-content: flex-end;
    padding-right: ${({theme}) => theme.unit / 2 * 3}px;
    align-items: center;
  }

` ;
export const ISBtn:React.ComponentType<ButtonProps & { logoColor?: any }> = styled(Button)<ButtonProps & { logoColor?: any }>`
  && {
    width: 100%;
    height: 100%;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 1px solid transparent;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${({theme}) => theme.fontDefault.h5};
    color: var(--color-text-primary);
    .MuiButton-endIcon{
      color: var(--color-text-third);
    }
    
    .placeholder {
      color: var(--color-text-secondary);
    }
  }

  // .logo-icon svg {
    //   color: ${({logoColor}) => logoColor}
  // }
  //.MuiAvatar-root {
  //  width: 24px;
  //  height: 24px;
  //}

  // .MuiButton-endIcon svg {
  //   color: var(--color-text-primary)
  //     // color: ${({logoColor}) => logoColor}
  // }

  &:hover, &:active {
    color: var(--color-text-primary);
    background: var(--color-box-hover);
  }
` ;
export const IInput = styled(CurrencyInput)`
  text-align: right;
  color: var(--color-text-primary);

  ::placeholder {
    color: var(--color-text-secondary);;
  }

  width: 100%; //calc(100% - 2rem);
  height: 100%; //var(--btn-Input-height);
  border: 0;
  margin: 0;


  font-size: ${({theme}) => theme.fontDefault.h4};
  display: block;
  padding: .8rem 1rem;
  min-width: 0;
  background: none;
  box-sizing: border-box;
  animation-name: mui-auto-fill-cancel;
  letter-spacing: inherit;
  animation-duration: 10ms;
  -webkit-tap-highlight-color: transparent;
  + label {
    height: 0;
    width: 0;
  }
  :focus {
    outline: 0;
    & + label::before {
      content:'';
      position: absolute;
      top:0;
      left: 0;
      right: 0;
      bottom: 0;
      ${({theme}) => `${theme.border.defaultFrame({c_key: 'var(--color-border-hover)',d_R: 0.5})};`};
    }
  }
  .error &:focus {
    & + label::before {
      ${({theme}) => `${theme.border.defaultFrame({c_key: 'var(--opacity)',d_R: 0.5})};`}
    }
  }

  .input-wrap-right & {
    text-align: right;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
   

    :focus {
      
    }
  }

  .input-wrap-left & {
    text-align: left;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    

    :focus {
     
    }
  }
}` as typeof CurrencyInput
// border-left:  ${theme.border.borderConfig({c_key: 'blur'})};
// ${theme.mode === 'dark' ? `border-color: transparent` : ''};
// ${theme.border.defaultFrame({c_key: 'focus', d_R: 0.5})};
// border-top-left-radius: 0px;
// border-bottom-left-radius: 0px;
// border-right:  ${theme.border.borderConfig({c_key: 'blur'})};
// ${theme.mode === 'dark' ? `border-color: transparent` : ''};
// ${theme.border.defaultFrame({c_key: 'focus', d_R: 0.5})};
// border-top-right-radius: 0;
// border-bottom-right-radius: 0;