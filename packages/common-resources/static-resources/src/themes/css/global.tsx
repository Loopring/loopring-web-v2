import { css } from '@emotion/react'
import reset from './reset'
// @ts-ignore
import InterMedium from '../fonts/english/Inter-Medium.ttf'

import {
  ColorDarkDefault,
  ColorLightDefault,
  GrayBlack,
  GrayLight,
  hexToRGB,
  SystemColor,
} from './color-lib'
import { ThemeType } from '../interface'

export const fontDefault = {
  h1: '3.8rem',
  h2: '3.0rem',
  h3: '2.4rem',
  h4: '2.0rem',
  h5: '1.6rem',
  h6: '1.4rem',
  body1: '1.4rem',
  body2: '1.2rem',
}
export enum SvgSize {
  svgSize = 14,
  svgSizeMedium = 16,
  svgSizeCover = 32,
  svgSizeLarge = 24,
  svgSizeHuge2 = 40,
  svgSizeHuge = 48,
}

export const refreshTime = 15
export const colorBase = ({ theme }: any) => css`
  html {
    --gray100: ${theme.mode == ThemeType.dark ? GrayBlack.gray100 : GrayLight.gray100};
    --gray200: ${theme.mode == ThemeType.dark ? GrayBlack.gray200 : GrayLight.gray200};
    --gray300: ${theme.mode == ThemeType.dark ? GrayBlack.gray300 : GrayLight.gray300};
    --gray400: ${theme.mode == ThemeType.dark ? GrayBlack.gray400 : GrayLight.gray400};
    --gray500: ${theme.mode == ThemeType.dark ? GrayBlack.gray500 : GrayLight.gray500};
    --gray600: ${theme.mode == ThemeType.dark ? GrayBlack.gray600 : GrayLight.gray600};
    --gray700: ${theme.mode == ThemeType.dark ? GrayBlack.gray700 : GrayLight.gray700};
    --gray800: ${theme.mode == ThemeType.dark ? GrayBlack.gray800 : GrayLight.gray800};
    --gray900: ${theme.mode == ThemeType.dark ? GrayBlack.gray900 : GrayLight.gray900};

    --color-primary: ${theme.colorBase.primary};
    --color-primary-hover: ${theme.colorBase.primaryHover};
    --color-primary-pressed: ${theme.colorBase.primaryPressed};
    --color-secondary: ${theme.colorBase.secondary};
    --color-secondary-hover: ${theme.colorBase.secondaryHover};
    --color-secondary-pressed: ${theme.colorBase.secondaryPressed};
    --color-disable: ${theme.colorBase.disable};
    --color-success: ${theme.colorBase.success};
    --color-warning: ${theme.colorBase.warning};
    --color-error: ${theme.colorBase.error};
    --color-text-primary: ${theme.colorBase.textPrimary};
    --color-text-secondary: ${theme.colorBase.textSecondary};
    --color-text-third: ${theme.colorBase.textThird};
    --color-text-button: ${theme.colorBase.textButton};
    --color-text-button-select: ${theme.colorBase.textButtonSelect};
    --color-text-button-disabled: ${theme.colorBase.textButtonDisabled};
    --color-text-disable: ${theme.colorBase.textDisable};
    --color-border: ${theme.colorBase.border};
    --color-border-hover: ${theme.colorBase.borderHover};
    --color-border-dark: ${theme.colorBase.borderDark};
    --color-placeholder: ${theme.colorBase.placeholder};
    --color-border-select: ${theme.colorBase.borderSelect};
    --color-border-disable: ${theme.colorBase.borderDisable};
    --color-border-disable2: ${theme.colorBase.borderDisable2};
    --color-tag: ${theme.colorBase.tag};
    --color-box: ${theme.colorBase.box};
    --color-box-nft-label: ${theme.colorBase.boxNFTLabel};
    --color-box-nft-btn: ${theme.colorBase.boxNFTBtn};
    --color-box: ${theme.colorBase.box};
    --color-box-hover: ${theme.colorBase.boxHover};
    --color-pop-bg: ${theme.colorBase.popBg};

    --color-box-linear: ${theme.colorBase.boxLinear};
    --color-global-bg: ${theme.colorBase.globalBg};
    --color-global-bg-opacity: ${theme.colorBase.globalBgOpacity};
    --field-opacity: ${theme.colorBase.fieldOpacity};
    --color-divide: ${theme.colorBase.divide};
    --color-box-secondary: ${theme.colorBase.boxSecondary};
    --color-box-third: ${theme.colorBase.boxThird};
    --color-mask: ${theme.colorBase.mask};
    --color-box-enhance: ${theme.colorBase.boxEnhance};
    --color-table-header-bg: ${theme.colorBase.tableHeaderBg};
    --color-star: ${theme.colorBase.star};
    --color-logo: ${theme.colorBase.logo};

    /********************Case for shadow*******************/
    --color-button-pot: ${theme.colorBase.buttonPot};
    --color-button-icon: ${theme.colorBase.buttonIcon};
    --color-button-inactive: ${theme.colorBase.buttonInactive};
    --color-button-disabled: ${theme.colorBase.buttonDisabled};
    --color-button-outlined: ${theme.colorBase.buttonOutlined};

    /********************CSS shadow *******************/
    --shadow: ${theme.colorBase.shadow};
    --shadow-header: ${theme.colorBase.shadowHeader};
    --shadow2: ${theme.colorBase.shadow2};
    --shadow-hover: ${theme.colorBase.shadowHover};
    --shadow3: ${theme.colorBase.shadow3};

    /********************Case for special*******************/
    --provider-btn: ${theme.colorBase.providerBtn};
    --provider-hover: ${theme.colorBase.providerBtnHover};
    --provider-agree: ${theme.colorBase.providerApprove};
    --vip-bg: ${hexToRGB(theme.colorBase.warning, '0.2')};
    --vip-text: ${theme.colorBase.warning};
    --network-bg: ${hexToRGB(theme.colorBase.warning, '0.2')};
    --network-text: ${theme.colorBase.warning};
    --auto-refresh-color: ${theme.colorBase.primary};
    --opacity: ${theme.colorBase.opacity};
    --color-white: white;
    --color-black: ${theme.colorBase.black};
    --color-settlet: ${theme.colorBase.opacity};

    --color-redPacket0: ${theme.colorBase.redPacket0};
    --color-redPacket1: ${theme.colorBase.redPacket1};
    --color-redPacket1Disabled: ${theme.colorBase.redPacket1Disabled};
    --color-redPacket-text0: ${theme.colorBase.redPacketText0};
    --color-redPacket-text1: ${theme.colorBase.redPacketText1};
    --color-redPacket-Border: ${theme.colorBase.redPacketBorder};
  }
`
export const scrollbarDefault = ({ theme }: any) => css`
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

  .MuiPaper-elevation2 {
    box-shadow: var(--shadow);
  }

  .MuiPaper-elevation4 {
    box-shadow: var(--shadow-header);
  }
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
`
export const globalCss = ({ theme }: any) => css`
  ${colorBase({ theme })}
  ${scrollbarDefault({ theme })};

  ${reset}
  #root {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  html,
  body {
    position: relative;
    color: var(--color-text-primary);
    background: var(--color-global-bg);
    height: 100vh;
    box-sizing: border-box;
    -moz-box-sizing: border-box; /* Firefox */
    -webkit-box-sizing: border-box; /* Safari */
    font-family: Roboto, Helvetica, Arial, '华文细黑', 'Microsoft YaHei', '微软雅黑', SimSun, '宋体',
      Heiti, '黑体', sans-serif;
    font-size: 62.5%; /* 62.5% of 16px = 10px */
  }

  body {
    display: flex;
    width: 100%;
    position: relative;
    z-index: 1;
    flex-direction: column;

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
    --auto-refresh-duration: ${refreshTime - 1}s;
    --durationInternal: calc(var(--auto-refresh-duration) * 2);
    --delay: calc(var(--auto-refresh-duration) / 2);
    --header-row-height: 44px;
    --header-height: 64px;
    --header-submenu-item-height: 52px;
    --header-submenu-item-width: 250px;
    --desktop-max-width: 1200px;
    --desktop-min-width: 1024px;
    --btn-Input-small-height: 32px;
    --btn-medium-height: 40px;
    --btn-min-width: 100px;
    --coin-min-width: 80px;
    --datePicker-width: 320px;
    --datePicker-height: 232px;
    --list-coin-item: 44px;
    --withdraw-coin-size: 16px;
    --header-menu-icon-size: 20px;
    --header-menu-icon-large: 28px;
    --list-menu-coin-size: 24px;
    --slippage-pop-width: 308px;
    --chart-title-coin-size: 28px;
    --btn-icon-size-small: 20px;
    --btn-icon-size-medium: 24px;
    --btn-icon-size-large: 28px;
    --btn-icon-size: 36px;
    --svg-size: ${SvgSize.svgSize}px;
    --svg-size-medium: ${SvgSize.svgSizeMedium}px;
    --svg-size-cover: ${SvgSize.svgSizeCover}px;
    --svg-size-large: ${SvgSize.svgSizeLarge}px;
    --svg-size-huge2: ${SvgSize.svgSizeHuge2}px;
    --svg-size-huge: ${SvgSize.svgSizeHuge}px;
    --swap-box-height: 580px; /** js used also **/
    --panel-setting-height: 680px;
    --panel-setting-width: 800px;
    --modal-width: 480px;
    --modal-height: 400px;
    --swap-box-width: 338px;
    --mobile-full-panel-width: 352px;
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
    --account-modal-box-width: 284px;
    --walletconnect-width: 150px;
    --row-height: 44px;
    --row-header-height: 44px;
    --chart-height: 396px;
    --nft-height: 396px;
    --nft-card: 320px;
    --nft-large-avatar: 160px;
    --nft-small-avatar: 80px;
    --redPacket-avatar: 72px;
    --notification-activited-heigth: 80px;
    --modal-min-width: 340px;
    --carousel-dot-size: 14px;
    --earning-banner-width: 320px;
    --provider-btn-height: 56px;
    --input-height-large: 48px;
    --input-height-huge: 56px;
    --dual-type-width: 320px;
    --min-height: 350px;
    --input-height-swap: 86px;
    @media only screen and (max-width: 768px) {
      --modal-width: var(--modal-min-width);
      --lage-modal-width: 460px;
      --walletconnect-width: 126px;
      --dual-type-width: 240px;
    }
    --color-EOA-Text: #fba95c;
    --color-Loopring-Text: #4169ff;
    --color-OtherSmart-Text: #979797;
    --color-Binance-Text: #a25402;
    --color-Huobi-Text: #199e5e;
    --color-OtherExchange-Text: #a0635a;
    --color-EOA-Bg: #fffedc;
    --color-Loopring-Bg: #c9dbef;
    --color-OtherSmart-Bg: #d9d9d9;
    --color-Binance-Bg: #fde3c8;
    --color-Huobi-Bg: #b1f4dd;
    --color-OtherExchange-Bg: #c1a6a2;
  }

  select {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;

    &::-ms-expand {
      display: none;
    }
  }

  .rdg.rdg {
    --background-color: inherit;
  }
`
export { ColorDarkDefault, ColorLightDefault, SystemColor }
