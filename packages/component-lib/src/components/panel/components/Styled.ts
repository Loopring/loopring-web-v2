import styled from '@emotion/styled';
import { Box, IconButton, LinearProgress, linearProgressClasses, Typography } from '@material-ui/core';
import { css } from '@emotion/react';

export const TypographyStrong = styled(Typography)`
  color: ${({theme}) => theme.colorBase.secondary};
` as typeof Typography
export const TypographyGood = styled(Typography)`
  color: ${({theme}) => theme.colorBase.success};
` as typeof Typography
export const BorderLinearProgress = styled(LinearProgress)(({theme}) => ({
    height: 10,
    borderRadius: 5,
    [ `&.${linearProgressClasses.colorPrimary}` ]: {
        backgroundColor: theme.colorBase.textSecondary, //theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [ `& .${linearProgressClasses.bar}` ]: {
        borderRadius: 5,
        backgroundColor: theme.colorBase.primaryLight,
    },
}));
export const IconClearStyled = styled(IconButton)`
  position: absolute;
  top: 30px;
  right: 4px;
`

export const IconButtonStyled = styled(IconButton)`
  .MuiToolbar-root &.MuiButtonBase-root{
    svg {
      font-size: ${({theme}) => theme.fontDefault.h4};
      height: 24px;
      width: 24px;
    }

    &.outline {
      background-color: ${({theme}) => theme.colorBase.textDisable};
      margin: 0 ${({theme}) => theme.unit / 2}px;
      ${({theme}) => theme.border.defaultFrame({c_key: 'transparent'})};

      &:last-child {
        margin-right: 0;

      }
    }

  }
}
`

const cssAutoRefresh = (_props:any)=>css`
  @keyframes rotate {
    25% { transform: rotate(-135deg); }
    50% { transform: rotate(-135deg); }
    75% { transform: rotate(-315deg); }
    100% { transform: rotate(-315deg); }
  }

  @keyframes hide1 {
    25% { left: -.5em; opacity: 0; }
    50% { left: 0; opacity: 1; }
  }

  @keyframes hide2 {
    25% { right: -.5em; opacity: 0; }
    50% { right: 0; opacity: 1; }
  }

  @keyframes container {

    25% { transform: translate3d(0, -50%, 0); width: .5em; }
    50% { transform: translate3d(-100%, -50%, 0); width: .5em; }
    75% { transform: translate3d(-50%, -50%, 0); width: 1em; }
  }
  @keyframes countDown {
    0% { content:'5'; opacity: 1; }
    16% { content:''; opacity: 0; }
    20% { content:'4'; opacity: 1; }
    36% { content:''; opacity: 0; }
    40% { content:'3'; opacity: 1; }
    56% { content:''; opacity: 0; }
    60% { content:'2'; opacity: 1; }
    76% { content:''; opacity: 0; }
    80% { content:'1'; opacity: 1; }
    96% { content:''; opacity: 0; }
   
  }

`
export const CountDownStyled = styled(Box)`
  ${({theme}) => cssAutoRefresh({theme})}
  width: var(--btn-icon-size);
  height: var(--btn-icon-size);
  position: relative; 
  &.outline {
      background-color: ${({theme}) => theme.colorBase.textDisable};
      margin: 0 ${({theme}) => theme.unit / 2}px;
      ${({theme}) => theme.border.defaultFrame({c_key: 'transparent'})};
      text-align: center;
      line-height: var(--btn-icon-size);
      &:last-child {
        margin-right: 0;

      }
   
     }
  }
  &.countdown{
    &::before {
      content: '5';
      font-size: ${({theme}) => theme.fontDefault.h6};
      display: inline-block;
      color:  ${({theme}) => theme.colorBase.primaryLight}; 
      animation: countDown var(--durationInternal) steps(1) infinite;
    }
    .circle {
      font-size: ${({theme}) => theme.fontDefault.h3};
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
        border-color: transparent transparent var(--auto-refresh-color) var(--auto-refresh-color);
        animation-name: rotate, hide1;
        left: 0;
      }

      &::after {
        border-color: var(--auto-refresh-color) var(--auto-refresh-color) transparent transparent;
        animation-delay: var(--delay), var(--delay);
        animation-name: rotate, hide2;
        right: 0;
      }
  }
  
  //}
`
