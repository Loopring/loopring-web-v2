import styled from '@emotion/styled'
import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  RadioGroup,
  TextareaAutosize,
  TextField as MuiTextField,
  OutlinedInput as MuiOutlinedInput,
  TextFieldProps,
  OutlinedInputProps,
} from '@mui/material'
import CurrencyInput from 'react-currency-input-field'

import { InputSize } from './Interface'
import { css } from '@emotion/react'

export const inputHeightLarge = () => css`
  height: var(--input-height-large);
  font-size: 1.5rem;

  .MuiInputAdornment-root {
    svg {
      height: var(--btn-icon-size-large);
      width: var(--btn-icon-size-large);
    }
  }
`
export const OutlinedInput = styled(MuiOutlinedInput)<OutlinedInputProps>`
  ${({ size }) => size?.toLowerCase() === 'large' && inputHeightLarge}
`

export const TextField = styled(MuiTextField)<TextFieldProps>`
  && .MuiOutlinedInput-root {
    ${({ size }) => size?.toLowerCase() === 'large' && inputHeightLarge}
  }

  .MuiInputAdornment-root {
    padding: 0 ${({theme}) => theme.unit}px;
  }

  label + & {
    //margin-top: 24px;
    margin-top: 0;
  }

  && {
    .MuiSelect-nativeInput + svg {
      position: absolute;
      right: ${({size}) => size === 'large' ? 1 : 0.4}rem;
      top: ${({theme, size}) => size === 'large' ? 2 * theme.unit : theme.unit}px;
      color: var(--color-text-secondary);
    }

    &:not(.MuiFormControl-fullWidth) {
      max-width: 260px;
    }

    text-overflow: fade();
  }

  &:focus {
    ${({theme}) => theme.border.defaultFrame({c_key: 'focus', d_R: 0.5})};
    outline: transparent;
  }
`
// export MuiTextField = styled(MuTextField)<>``;
export const IWrap = styled(Box)<
  BoxProps & {
    size: 'middle' | 'small'
    isMobile?: boolean
    fullWidth?: boolean
  }
>`
  ${({ theme }) => theme.border.defaultFrame({ c_key: 'var(--opacity)' })};
  ${({ fullWidth }) => fullWidth && `width:100%`};

  .label-wrap {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: capitalize;
    color: var(--color-text-secondary);
  }

  .message-wrap {
    .MuiFormHelperText-root {
      color: var(--color-error);
      text-align: right;
      font-size: ${({ theme }) => theme.fontDefault.h6};
    }
  }

  .sub-label {
    text-align: right;
    cursor: pointer;

    .max-allow {
      text-decoration: underline dotted;
      color: var(--color-secoundary);

      &:hover {
        color: var(--color-primary);
      }
    }

    .no-balance {
      text-decoration: none;
    }

    .disabled {
      color: var(--color-text-disable);
    }
  }

  .coinInput-wrap,
  .btnInput-wrap {
    position: relative;
    box-sizing: border-box;
    background: var(--color-box);
    border-radius: ${({ theme }) => theme.unit / 2}px;
    margin-top: ${({ theme }) => `${theme.unit / 2}px`};
    height: var(--input-height-large);

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
      border-radius: ${({ theme }) => theme.unit / 2}px;
    }
  }

  .input-wrap {
    //min-width: 128px;
    // width: 100%;
    flex: 1;
    height: 100%;
  }

  .icon-wrap,
  .btn-wrap {
    max-width: var(--btn-max-width);
    min-width: var(--coin-min-width);

    .MuiButton-label {
      justify-content: flex-start;
    }
  }

  ${({ size, theme, isMobile }) => {
    if (size === InputSize.small) {
      return `
          .input-wrap,.icon-wrap{
            font-size: ${isMobile ? theme.fontDefault.body2 : theme.fontDefault.body1};
          }
          .label-wrap, .main-label{
            font-size: ${theme.fontDefault.body2};
          }
          .coinInput-wrap, .btnInput-wrap {
            font-size: ${isMobile ? theme.fontDefault.body2 : theme.fontDefault.body1};
            height: var(--btn-Input-small-height);
            &.text-small{
              font-size: ${theme.fontDefault.body2};
            }
            input[type=text]{
              font-size: ${theme.fontDefault.body1};
               &:focus {
                outline: 0;
              }
            }
          }
         
      `
    } else {
      return `
          .input-wrap,.icon-wrap{
             font-size: ${theme.fontDefault.h5};
          }
          .label-wrap{
            font-size: ${theme.fontDefault.body1};
          }
          .coinInput-wrap, .btnInput-wrap{
              font-size: ${theme.fontDefault.h4};
              height: var(--input-height-large);
              &.text-small{
                font-size: ${theme.fontDefault.body1};
              }
              input[type=text]{
                font-size: ${theme.fontDefault.h4};
              }
          }
         
      `
    }
  }};
` as (
  props: BoxProps & {
    size: 'middle' | 'small'
    isMobile?: boolean
    fullWidth?: boolean
  },
) => JSX.Element
export const CoinWrap = styled(Box)<BoxProps & { logoColor?: any }>`
  & {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 1px solid transparent;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${({ theme }) => theme.fontDefault.h5};
    color: var(--color-text-primary);

    .placeholder {
      color: var(--color-text-secondary);
    }
  }

  &.icon-wrap-right > div {
    justify-content: flex-start;
    padding-left: ${({ theme }) => (theme.unit / 2) * 3}px;
    align-items: center;
  }

  &.icon-wrap-left > div {
    justify-content: flex-end;
    padding-right: ${({ theme }) => (theme.unit / 2) * 3}px;
    align-items: center;
  }
` as (props: BoxProps & { logoColor?: any }) => JSX.Element
export const ISBtn = styled(Button)<ButtonProps & { logoColor?: any }>`
  && {
    width: 100%;
    height: 100%;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 1px solid transparent;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${({ theme }) => theme.fontDefault.h5};
    color: var(--color-text-primary);

    .MuiButton-endIcon {
      color: var(--color-text-third);
    }

    .placeholder {
      color: var(--color-text-secondary);
    }
  }

  &:hover,
  &:active {
    color: var(--color-text-primary);
    background: var(--color-box-hover);
  }
` as (props: ButtonProps & { logoColor?: any }) => JSX.Element

export const IInput = styled(CurrencyInput)`
  text-align: right;
  color: var(--color-text-primary);

  ::placeholder {
    color: var(--color-text-secondary);;
  }

  :disabled {
    color: var(--color-text-disable);
  }

  .loading:disabled {
    color: var(--color-text-primary);
  }

  width: 100%;
  height: 100%;
  border: 0;
  margin: 0;


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
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      ${({ theme }) =>
        `${theme.border.defaultFrame({
          c_key: 'var(--color-border-hover)',
          d_R: 0.5,
        })};`};
    }
  }

  .error &:focus {
    & + label::before {
      ${({ theme }) => `${theme.border.defaultFrame({ c_key: 'var(--opacity)', d_R: 0.5 })};`}
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

export const TextareaAutosizeStyled = styled(TextareaAutosize)`
  label + & {
    margin-top: ${({ theme }) => theme.unit}px;
  }

  background: (var(--opacity));
  font-family: inherit;
  color: inherit;
  padding: ${({ theme }) => theme.unit}px;
  width: 100%;
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.border,
      d_R: 0.5,
    })};

  &:focus {
    ${({ theme }) => theme.border.defaultFrame({ c_key: 'focus', d_R: 0.5 })};
    outline: transparent;
  }

  &:disabled {
    line-height: 1.5em;
    border: 0;
    background: (var(--opacity));
    color: var(--color-text-third);
    ${({ theme }) =>
      theme.border.defaultFrame({
        c_key: theme.colorBase.opacity,
        d_R: 0.5,
      })};
  }

  &.error {
    ${({ theme }) => theme.border.defaultFrame({ c_key: 'var(--color-error)', d_R: 0.5 })};
  }
` as typeof TextareaAutosize

export const InputSearchWrapperStyled = styled(Box)`
  padding: ${({ theme }) => theme.unit * 2}px;
  padding-bottom: 0;
` as typeof Box

export const RadioGroupStyle = styled(RadioGroup)`
  margin: 0;

  .MuiFormControlLabel-root {
    margin-right: 0;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: row;
  }

  .MuiFormControlLabel-label {
    line-height: var(--svg-size-cover);
  }
` as typeof RadioGroup
