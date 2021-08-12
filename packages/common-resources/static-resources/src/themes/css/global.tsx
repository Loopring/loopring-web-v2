import { css } from "@emotion/react";
import reset from './reset';
// @ts-ignore
import InterMedium from '../fonts/english/Inter-Medium.ttf';
// @ts-ignore
// import GilroyMedium from '../fonts/english/DINCondensed.ttf';
import DINCondensed from  '../fonts/english/DINCondensed/363123_0_0.ttf'

import { ColorDarkDefault, ColorLightDefault,hexToRGB } from "./color-lib";

export const fontDefault = {
    h1: '3.8rem',
    h2: '3.0rem',
    h3: '2.4rem',
    h4: '2.0rem',
    h5: '1.6rem',
    h6: '1.4rem',
    body1: '1.4rem',
    body2: '1.2rem'
}

export const
    refreshTime = 10;
export const colorBase = ({theme}: any) => css`
  html {
    --color-primary: ${theme.colorBase.primary};
    --color-primary-hover: ${theme.colorBase.primaryHover};
    --color-primary-pressed: ${theme.colorBase.primaryPressed};
    --color-secondary: ${theme.colorBase.secondary};
    --color-secondary-hover: ${theme.colorBase.secondaryHover};
    --color-secondary-pressed: ${theme.colorBase.secondaryPressed};
    --color-success: ${theme.colorBase.success};
    --color-warning: ${theme.colorBase.warning};
    --color-error: ${theme.colorBase.error};
    --color-text-primary: ${theme.colorBase.textPrimary};
    --color-text-secondary: ${theme.colorBase.textSecondary};
    --color-text-disable: ${theme.colorBase.textDisable};
    --color-disable: ${theme.colorBase.disable};
    --color-border: ${theme.colorBase.border};
    --color-border-hover: ${theme.colorBase.borderHover};
    --color-divide: ${theme.colorBase.divide};
    --color-pop-bg: ${theme.colorBase.popBg};
    --color-box: ${theme.colorBase.box};
    --color-box-secondary: ${theme.colorBase.boxSecondary};
    --color-box-hover: ${theme.colorBase.boxHover};
    --color-box-linear: ${theme.colorBase.boxLinear};
    --color-global-bg: ${theme.colorBase.globalBg};
    /********************Case for shadow*******************/
    --shadow: ${theme.colorBase.shadow};
    --opacity: ${theme.colorBase.opacity};
    /********************Case for special*******************/
    --vip-bg: ${hexToRGB(theme.colorBase.warning, '0.2')};
    --vip-text: ${theme.colorBase.warning};
    --network-bg: ${hexToRGB(theme.colorBase.warning, '0.2')};
    --network-text: ${theme.colorBase.warning};
    --provider-btn: ${hexToRGB(theme.colorBase.white, '0.1')};
    --provider-hover: ${hexToRGB(theme.colorBase.white, '0.03')};
    --field-opacity: ${hexToRGB(theme.colorBase.white, '0.1')};
    --auto-refresh-color: ${theme.colorBase.primary};
  }
`;
export const scrollbarDefault = ({theme}: any) => css`
  html {
    scrollbar-face-color: ${theme.colorBase.box};
    scrollbar-base-color: ${theme.colorBase.box};
    scrollbar-3dlight-color: ${theme.colorBase.box};
    scrollbar-highlight-color: ${theme.colorBase.box};
    scrollbar-track-color: ${theme.colorBase.box};
    scrollbar-arrow-color: ${theme.colorBase.box};
    scrollbar-shadow-color: ${theme.colorBase.box};
    scrollbar-dark-shadow-color: ${theme.colorBase.box};
  }
  
  //::-webkit-scrollbar { width: 8px; height: 3px; position: absolute}
    // ::-webkit-scrollbar-button {  background-color: ${theme.colorBase.textHint};}
  ::-webkit-scrollbar-track {
    background-color: ${theme.colorBase.box};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-track-piece {
    background-color: ${theme.colorBase.box};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: ${theme.colorBase.blur};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-corner {
    background-color: ${theme.colorBase.box};
  }

  ::-webkit-resizer {
    background-color: ${theme.colorBase.box};
  }
`;
export const globalCss = ({theme}: any) => css`
  ${colorBase({theme})}
  ${scrollbarDefault({theme})};
  ${reset}
  html, body {
    @font-face {
      font-family: 'Inter-Medium';
      src: url(${InterMedium}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'DINCondensed';
      src: url(${DINCondensed}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    
    height: 100%;
    box-sizing: border-box;
    -moz-box-sizing: border-box; /* Firefox */
    -webkit-box-sizing: border-box; /* Safari */
    font-family: DINCondensed, Helvetica, Arial, "华文细黑", "Microsoft YaHei", "微软雅黑", SimSun, "宋体", Heiti, "黑体", sans-serif;
    font-size: 62.5%; /* 62.5% of 16px = 10px */

  }

  body {
    display: flex;
    width: 100%;
    position: relative;
    z-index: 1;

    &:before {
      content: '';
      position: fixed;
      z-index: -1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  h1 {
    font-size: ${fontDefault.h1};
  }

  h2 {
    font-size: ${fontDefault.h2};
  }

  h3 {
    font-size: ${fontDefault.h3};
  }

  h4 {
    font-size: ${fontDefault.h4};
  }

  h5 {
    font-size: ${fontDefault.h5};
  }

  h6 {
    font-size: ${fontDefault.h6};
  }

  html {
   
    overflow-y: scroll;
    --auto-refresh-duration: ${refreshTime-1}s;
    --durationInternal: calc(var(--auto-refresh-duration) * 2);
    --delay: calc(var(--auto-refresh-duration) / 2);
    --header-row-height: 44px;
    --header-height: 64px;
    --header-menu-list-height: 72px;
    --header-menu-list-width: 250px;
    --desktop-max-width: 1200px;
    --desktop-min-width: 1024px;
    --btn-Input-height: 48px;
    //--btn-max-width: 160px;
    --btn-min-width: 100px;
    --coin-min-width: 80px;
    --datePicker-width: 320px;
    --datePicker-height: 232px;
    --list-coin-item: 44px;
    --header-menu-icon-size: 20px;
    --list-menu-coin-size: 24px;
    --slippage-pop-width: 184px;
    --slippage-pop-height: 88px ;
    --chart-title-coin-size: 28px;
    --btn-icon-size-small: 24px;
    --btn-icon-size: 36px;
    --svg-size: 24px;
    --svg-size-large: 36px;
    --swap-box-height: 540px; /** js used also **/
    --panel-setting-height: 680px;
    --panel-setting-width: 800px;
    --modal-width: 480px;
    --modal-height: 400px;
    --swap-box-width: 338px;
    --toolbar-row-height: 56px; /** js used also  40 + 56 = 96  CoinList.tsx **/
    --toolbar-row-height-minus: -56px;
    --toolbar-row-padding: 40px; /** js used also  40 + 56 = 96  CoinList.tsx **/
    --toolbar-row-padding-minus: -40px;
    --sub-menuItem-width: 200px;
    --sub-menuItem-height: 52px;
    --lage-modal-width: 580px;
    --lage-modal-height: 620px;
    --gateway-icon-size: 56px;
    --account-button-fixed-width: 88px;
    --account-button-fixed-height: 72px;
    --empty-size: 130px;
    --account-modal-box-width:284px;
    --walletconnect-width:160px

  }

  div {
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
  }

  select {

    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;

    &::-ms-expand {
      display: none;
    }

  }

  . draggable_panel {
    border: 1px solid var(--color-border);
    height: 100%;
  }

  . draggable_header {
    display: none;
    cursor: move;
    height: 0px;
    width: 100%;
  }

  .rdg.rdg {
    --background-color: inherit;
  }
`
export { ColorDarkDefault, ColorLightDefault }
