import styled from '@emotion/styled'
import {
  Box,
  IconButton,
  IconProps,
  LinearProgress,
  linearProgressClasses,
  Tabs,
} from '@mui/material'
import { css } from '@emotion/react'
import { Button } from '../../basic-lib'
import { DropDownIcon } from '@loopring-web/common-resources'

export const FeeTokenItemWrapper = styled(Box)`
  background-color: var(--color-global-bg);
` as typeof Box

export const DropdownIconStyled = styled(DropDownIcon)<IconProps>`
  transform: rotate(
    ${({ status }: any) => {
      return status === 'down' ? '0deg' : '180deg'
    }}
  );
` as unknown as (props: IconProps & { status: string }) => JSX.Element

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.colorBase.textSecondary, //theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.colorBase.primary,
  },
}))
export const IconClearStyled = styled(IconButton)`
  position: absolute;
  top: 20px;
  right: 4px;
` as typeof IconButton

export const IconButtonStyled = styled(IconButton)`
  .MuiToolbar-root &.MuiButtonBase-root {
    svg {
      //font-size: ${({ theme }) => theme.fontDefault.h4};
      //height: var(--btn-icon-size-small);
      //width: var(--btn-icon-size-small);
    }

    &.outlined {
      background-color: var(--color-box);
      margin: 0 ${({ theme }) => theme.unit / 2}px;
      ${({ theme }) => theme.border.defaultFrame({ c_key: 'transparent' })};

      &:last-child {
        margin-right: 0;
      }
    }
  }
` as typeof IconButton

const cssAutoRefresh = (_props: any) => css`
  @keyframes rotate {
    25% {
      transform: rotate(-135deg);
    }
    50% {
      transform: rotate(-135deg);
    }
    75% {
      transform: rotate(-315deg);
    }
    100% {
      transform: rotate(-315deg);
    }
  }

  @keyframes hide1 {
    25% {
      left: -0.5em;
      opacity: 0;
    }
    50% {
      left: 0;
      opacity: 1;
    }
  }

  @keyframes hide2 {
    25% {
      right: -0.5em;
      opacity: 0;
    }
    50% {
      right: 0;
      opacity: 1;
    }
  }

  @keyframes container {
    //0% { background-image:}
    //5% { background-image: none }
    25% {
      transform: translate3d(0, -50%, 0);
      width: 0.5em;
    }
    50% {
      transform: translate3d(-100%, -50%, 0);
      width: 0.5em;
    }
    75% {
      transform: translate3d(-50%, -50%, 0);
      width: 1em;
    }
  }
`
export const CountDownStyled = styled(Box)`
  ${({ theme }) => cssAutoRefresh({ theme })}
  width: var(--btn-icon-size);
  height: var(--btn-icon-size);
  position: relative;
  background-size: 68%;
  background-repeat: no-repeat;
  background-position: center;

  &.outlined {
    background-color: var(--field-opacity);
    margin: 0 ${({ theme }) => theme.unit / 2}px;
    ${({ theme }) => theme.border.defaultFrame({ c_key: 'transparent' })};
    text-align: center;
    line-height: var(--btn-icon-size);

    &:last-child {
      margin-right: 0;
    }
  }

  &.logo {
    background-image: ${({ color }) =>
      `url("data:image/svg+xml,%3Csvg width='34' height='27' viewBox='0 0 34 27' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M19.354 12.7874H33.4527V12.8709L11.4393 26.1381L22.351 17.5019L19.354 12.7874ZM11.1439 0V26.3259L0 17.5228L11.1439 0Z' fill='${encodeURIComponent(
        color ? (color as string) : 'var(--auto-refresh-color)',
      )}'/%3E%3C/svg%3E%0A")`};
  }

  &.countdown {
    font-size: ${({ theme }) => theme.fontDefault.h6};
    display: inline-block;
    color: var(--color-primary);

    .circle {
      font-size: ${({ theme }) => theme.fontDefault.h4};
      width: 1em;
      height: 1em;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%, -50%, 0);
      animation: container var(--durationInternal) steps(1) infinite;
      overflow: hidden;

      &::before,
      &::after {
        display: block;
        content: '';
        box-sizing: border-box;
        border: .125em solid transparent;
        border-radius: 50%;
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1em;
        transform: rotate(45deg);
        animation-timing-function: linear, steps(1);
        animation-duration: var(--durationInternal), var(--durationInternal);
        animation-iteration-count: infinite, infinite;
      }

      &::before {
        border-color: ${({ color }) =>
          color
            ? `transparent transparent ${color} ${color}`
            : 'transparent transparent var(--auto-refresh-color) var(--auto-refresh-color)'};
        animation-name: rotate, hide1;
        left: 0;
      }

      &::after {
        border-color: ${({ color }) =>
          color
            ? `${color} ${color} transparent transparent`
            : 'var(--auto-refresh-color) var(--auto-refresh-color) transparent transparent'};
        animation-delay: var(--delay), var(--delay);
        animation-name: rotate, hide2;
        right: 0;
      }
    }
` as typeof Box

export const ButtonStyle = styled(Button)`
  font-size: 1.6rem;
` as typeof Button

export const TabsStyle = styled(Tabs)`
  &&.trade-tabs {
    background: var(--color-global-bg);
    min-height: 28px;
    height: 28px;
    border-radius: ${({ theme }) => theme.unit / 2}px;
    margin-top: ${({ theme }) => theme.unit * 2}px;

    .MuiTab-fullWidth.MuiTab-root {
      min-height: 28px;
      height: 28px;
      line-height: 28px;
      padding: 0;
      font-size: ${({ theme }) => theme.fontDefault.h6};
      &:focus-visible,
      &:active:after {
        background-color: initial;
      }
      &.Mui-selected {
        overflow: unset;
        border-radius: ${({ theme }) => theme.unit / 2}px;
        color: var(--color-text-button);
        min-height: 28px;
        height: 28px;

        &.trade-tab-buy {
          background: var(--color-success);
        }

        &.trade-tab-sell {
          background: var(--color-error);
        }

        &.trade-tab-quantity,
        &.trade-tab-speed {
          background: var(--color-primary);
        }

        &.trade-tab-sell:after,
        &.trade-tab-speed:after {
          background-color: var(--color-error);
          mask-size: cover;
          //<svg width="17" height="28" viewBox="0 0 17 28" fill="none" >
          //<path d="M0 0H12.4213C15.1599 0 17.0886 2.68993 16.2098 5.28363L9.43321 25.2836C8.88302 26.9074 7.35922 28 5.64476 28H0V0Z" fill="#00BBA8"/>
          //</svg>

          mask-image: url('data:image/svg+xml,\
           <svg width="17" height="28" viewBox="0 0 17 28" fill="white" xmlns="http://www.w3.org/2000/svg">\
           <path d="M0 0H12.4213C15.1599 0 17.0886 2.68993 16.2098 5.28363L9.43321 25.2836C8.88302 26.9074 7.35922 28 5.64476 28H0V0Z" />\
           </svg>');
          top: 0;
          height: 28px;
          left: -8px;
          width: 17px;
          transform: rotate(180deg);
        }

        &.trade-tab-buy:after,
        &.trade-tab-quantity:after {
          background-color: var(--color-success);
          mask-size: cover;
          mask-image: url('data:image/svg+xml,\
           <svg width="17" height="28" viewBox="0 0 17 28" fill="white" xmlns="http://www.w3.org/2000/svg">\
           <path d="M0 0H12.4213C15.1599 0 17.0886 2.68993 16.2098 5.28363L9.43321 25.2836C8.88302 26.9074 7.35922 28 5.64476 28H0V0Z" />\
           </svg>');
          top: 0;
          left: auto;
          height: 28px;
          right: -8px;
          width: 17px;
        }

        &.trade-tab-quantity:after,
        &.trade-tab-speed:after {
          background-color: var(--color-primary);
          margin: 0;
        }
      }
    }
  }
` as typeof Tabs
