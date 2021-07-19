import { css } from "@emotion/react";
import reset from './reset';
// @ts-ignore
import InterMedium from '../fonts/english/Inter-Medium.ttf';
// @ts-ignore
// import GilroyMedium from '../fonts/english/DINCondensed.ttf';
import DINCondensed from  '../fonts/english/DINCondensed/363123_0_0.ttf'
// @ts-ignore
// import DINCondensed2 from  '../fonts/english/DINCondensed/363123_2_0.ttf'

import { ColorDarkDefault, ColorLightDefault } from "./color-lib";

export const fontDefault = {
    h1: '4.8rem',
    h2: '3.6rem',
    h3: '2.4rem',
    h4: '2rem',
    h5: '1.4rem',
    h6: '1.2rem',
    body1: '1.6rem'
}


export const scrollbarDefault = ({theme}: any) => css`
  html {
    scrollbar-face-color: ${theme.colorBase.backgroundBox};
    scrollbar-base-color: ${theme.colorBase.backgroundBox};
    scrollbar-3dlight-color: ${theme.colorBase.backgroundBox};
    scrollbar-highlight-color: ${theme.colorBase.backgroundBox};
    scrollbar-track-color: ${theme.colorBase.backgroundBox};
    scrollbar-arrow-color: ${theme.colorBase.backgroundBox};
    scrollbar-shadow-color: ${theme.colorBase.backgroundBox};
    scrollbar-dark-shadow-color: ${theme.colorBase.backgroundBox};
  }

  //::-webkit-scrollbar { width: 8px; height: 3px; position: absolute}
    // ::-webkit-scrollbar-button {  background-color: ${theme.colorBase.textHint};}
  ::-webkit-scrollbar-track {
    background-color: ${theme.colorBase.backgroundBox};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-track-piece {
    background-color: ${theme.colorBase.backgroundBox};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: ${theme.colorBase.blur};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-corner {
    background-color: ${theme.colorBase.backgroundBox};
  }

  ::-webkit-resizer {
    background-color: ${theme.colorBase.backgroundBox};
  }
`;

export const globalCss = ({theme}: any) => css`
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
    --header-menu-icon-size: 28px;
    --list-menu-coin-size: 24px;
    --chart-title-coin-size: 28px;
    --btn-icon-size-small: 24px;
    --btn-icon-size: 36px;
    --svg-size: 24px;
    --svg-size-large: 36px;
    --swap-box-height: 540px; /** js used also **/
    --panel-setting-height: 680px;
    --panel-setting-width: 800px;
    --swap-box-width: 338px;
    --toolbar-row-height: 56px; /** js used also  40 + 56 = 96  CoinList.tsx **/
    --sub-menuItem-width: 200px;
    --sub-menuItem-height: 52px;
    --transfer-modal-width: 480px;
    --modal-width: 480px;
    --gateway-icon-size: 56px;
    --account-button-fixed-width: 88px;
    --account-button-fixed-height: 72px;
    --empty-size: 130px

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
    border: 1px solid #777777;
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
