import styled from '@emotion/styled'
import { Box, BoxProps, Grid, Typography } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { UpColor } from '@loopring-web/common-resources'
import { Button, ButtonProps } from './basic-lib'
import { useSettings } from '../stores'

// @ts-ignore
export const boxLiner = (_props: { theme: Theme }) => css`
  background: var(--color-box-linear);
  border: 0.5px solid var(--color-border);
  border-radius: ${_props.theme.unit}px;

  textarea,
  .coinInput-wrap,
  .btnInput-wrap,
  .MuiOutlinedInput-root {
    background: var(--field-opacity);
    border-color: var(--opacity);

    :hover {
      border-color: var(--color-border-hover);
    }
  }

  .MuiToolbar-root .MuiButtonBase-root.outlined {
    background-color: var(--field-opacity);
  }
`
export const TypographyStrong = styled(Typography)`
  color: var(--color-secoundary);
` as typeof Typography
export const TypographyGood = styled(Typography)`
  color: var(--color-success);
` as typeof Typography
export const TablePaddingX = (_props: { pLeft: number; pRight: number }) => {
  const { unit } = useTheme()
  const { isMobile } = useSettings()
  return css`
    .rdg-row,
    .rdg-header-row {
      .rdg-cell:first-of-type {
        padding-left: ${unit * (isMobile ? 1 : 3)}px;
      }

      .rdg-cell:last-of-type {
        padding-right: ${unit * (isMobile ? 1 : 3)}px;
      }
    }
  `
}
export const VipStyled = styled(Typography)`
  margin-left: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => theme.unit / 4}px ${({ theme }) => theme.unit}px;
  ${({ theme }) => theme.border.defaultFrame({ c_key: 'rgba(0,0,0,0)', d_R: 0.25 })};
  background-color: var(--vip-bg);
  height: 2rem;
  color: var(--vip-text);
` as typeof Typography
export const floatTag = ({ theme, custom }: any) => css`
  .float-group {
    font-weight: lighter;

    .float-tag.float-increase {
      color: ${custom.chg === UpColor.green ? theme.colorBase.success : theme.colorBase.error};
    }

    .float-tag.float-decrease {
      color: ${custom.chg === UpColor.green ? theme.colorBase.error : theme.colorBase.success};
    }

    .float-tag.float-none {
      color: ${theme.colorBase.textPrimary};
    }
  }
`
export const AvatarIconPair = ({ theme }: any) => css`
  .icon-next {
    margin-left: -${theme.unit}px;
  }
`
export const baseTitleCss = ({ theme, custom }: any) => css`
  height: 72px;

  ${AvatarIconPair({ theme })}
  h3.MuiTypography-root {
    font-size: 1.6rem;
    margin-left: ${theme.unit}px;
    color: ${theme.colorBase.textSecondary};

    .MuiTypography-root {
      margin: 0 ${theme.unit / 4}px;
    }

    .next-coin {
      color: ${theme.colorBase.textPrimary};
    }
  }

  ${floatTag({ theme, custom })};

  .float-chart {
    margin-left: ${theme.unit}px;

    .chart-change {
      color: ${theme.colorBase.textSecondary};
    }
  }
`
export const ButtonListRightStyled = styled(Grid)`
  .MuiButton-root:not(:last-child) {
    margin-right: ${({ theme }) => theme.unit}px;
  }
` as typeof Grid
export const modalContentBaseStyle = ({ theme }: any) => css`
  &:focus-visible {
    outline: 0;
  }

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding-top: var(--toolbar-row-padding);
  border: 0;
  border-radius: ${theme.unit}px;
`
export const ModelPanelStyle = styled(Box)`
  ${({ theme }) => modalContentBaseStyle({ theme: theme })};
  background: var(--color-pop-bg);
` as typeof Box

export const SwitchPanelStyled: any = styled(Box)<
  { _height?: number | string; _width?: number | string } & BoxProps
>`
  .MuiModal-root & {
    .react-swipeable-view-container > div {
      background: var(--opacity);
    }

    .container {
      padding-bottom: 0;
    }
  }

  .trade-panel {
    .react-swipeable-view-container {
      & > div {
        padding: 0 ${({ theme }) => (theme.unit * 5) / 2}px ${({ theme }) => theme.unit * 5}px;

        .container {
          height: 100%;
          padding-top: 0;
        }
      }
    }
  }

  && {
    ${({ theme }) => modalContentBaseStyle({ theme: theme })}
    ${({ _height, _width, theme }) => `
     
      background: ${theme.colorBase.box};
      .react-swipeable-view-container {
           height: ${
             _height && Number.isNaN(_height) ? _height + 'px' : _height ? _height : '100%'
           } ;
           width: ${_width && Number.isNaN(_width) ? _width + 'px' : _width ? _width : '100%'};
           & > div{
              height:initial;
              overflow-x: hidden;
              overflow-y: scroll !important;
              background: initial;
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* Internet Explorer 10+ */
              &::-webkit-scrollbar {
                /* WebKit */
                width: 0;
              }
           }
       }
      
      .trade-panel{
        .react-swipeable-view-container {
           & > div{
              height: calc(100% -  var(--toolbar-row-padding));
              padding-bottom:0; 
              overflow-x: hidden;
              overflow-y: scroll !important;
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* Internet Explorer 10+ */
              &::-webkit-scrollbar {
                /* WebKit */
                width: 0;
              }
          }
        }
      }
      
    `}
  }

  &.collectionSelect {
    background: var(--color-global-bg);
    align-items: stretch;
  }

  .MuiModal-root & {
    .coin-menu {
      flex: 1;
      height: 100%;
    }
  }
` as (props: { _height?: number | string; _width?: number | string } & BoxProps) => JSX.Element
// height:${
//   _height
//     ? typeof _height === "number"
//       ? ` calc(${_height + "px"} - ${
//           theme.unit * 4
//         }px - 2 * var(--toolbar-row-padding)  ) `
//       : ` calc(${_height} - ${
//           theme.unit * 4
//         }px - 2 * var(--toolbar-row-padding)  )`
//     : "410px"
// } !important;

export const toolBarPanel = ({ theme }: any) => css`
  .MuiToolbar-root {
    align-content: stretch;
    justify-content: flex-end;
    box-sizing: border-box;
    height: var(--toolbar-row-padding-minus);
    padding: 0 ${(theme.unit * 5) / 2}px;
    margin-top: var(--toolbar-row-padding-minus);

    .MuiIconButton-root {
      height: var(--btn-icon-size);
      width: var(--btn-icon-size);
      min-width: var(--btn-icon-size);
      margin: 0;
      display: flex;
      padding: 0;
      justify-content: center;
      justify-items: center;
      align-items: center;
      font-size: ${theme.fontDefault.h4};
    }
  }
`

export const TableFilterStyled = styled(Box)`
  margin: 0 ${({ theme }) => theme.unit * 3}px ${({ theme }) => theme.unit * 2}px;
` as typeof Box

export const AnimationArrow = styled(Box)`
  &.arrowCta {
    transform-origin: center;
    display: block;
    height: 12px;
    width: 12px;
    border: 9px solid transparent;
    transform: rotate(45deg) scale(0.5);
    position: relative;
    margin: ${({ theme }) => theme.unit * 2}px;
  }

  &.arrowCta:after,
  &.arrowCta:before {
    content: '';
    display: block;
    height: inherit;
    width: inherit;
    position: absolute;
    top: 0;
    left: 0;
  }

  &.arrowCta:after {
    border-bottom: 3px solid var(--color-text-primary);
    border-right: 3px solid var(--color-text-primary);
    top: 0;
    left: 0;
    opacity: 1;
    animation: bottom-arrow 1.65s infinite;
  }

  @keyframes bottom-arrow {
    0% {
      opacity: 1;
      transform: translate(0, 0);
    }
    45% {
      opacity: 0;
      transform: translate(12px, 12px);
    }
    46% {
      opacity: 0;
      transform: translate(-16px, -16px);
    }
    90% {
      opacity: 1;
      transform: translate(-6px, -6px);
    }
    100% {
      opacity: 1;
      transform: translate(-6px, -6px);
    }
  }

  &.arrowCta:before {
    top: 0;
    left: 0;
    border-bottom: 3px solid var(--color-text-primary);
    border-right: 3px solid var(--color-text-primary);
    animation: top-arrow 1.65s infinite;
  }

  @keyframes top-arrow {
    0% {
      transform: translate(-6px, -6px);
    }
    35% {
      transform: translate(0, 0);
    }
    90% {
      opacity: 1;
      transform: translate(0, 0);
    }
    100% {
      opacity: 1;
      transform: translate(0, 0);
    }
  }
` as typeof Box

export const shake = css`
  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }
    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }
    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }
    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
`

export const MenuBtnStyled = styled(Button)<ButtonProps>`
  font-size: ${({ theme }) => theme.fontDefault.body1};
  background: var(--opacity);
  color: var(--color-text-secondary);
  display: flex;

  padding: 0 ${({ theme }) => theme.unit * 3}px;
  text-indent: 0.5em;
  position: relative;

  &.addAsset,
  &.sendAsset {
    white-space: pre;
    font-size: ${({ theme }) => theme.fontDefault.h5};
    justify-content: space-between;
    flex-direction: row;
    height: 64px;

    &.isMobile {
      font-size: 14px;
      height: 48px;
    }
  }

  &.banxaEnter {
    justify-content: space-between;
  }
  &.vaultBtn {
    border: 0;
    font-size: ${({ theme }) => theme.fontDefault.h5};
    color: var(--color-text-primary);
    justify-content: space-between;
    .MuiButton-endIcon {
      color: var(--color-text-Secondary);
    }
    &:hover {
      .MuiButton-endIcon {
        color: var(--color-primary);
      }
    }
  }

  &.redPacketType {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    height: ${({ theme }) => theme.unit * 18}px;
    text-indent: 0em;
    text-align: left;
    padding: ${({ theme }) => theme.unit * 1.5}px ${({ theme }) => theme.unit * 2}px;
    justify-content: flex-start;
    .mainTitlte {
    }
  }

  &.provider {
    justify-content: space-between;
    flex-direction: row;
    white-space: pre;
    color: var(--color-text-primary);
    height: var(--provider-btn-height);

    &:hover {
      border: 1px solid var(--color-border-select);
    }

    &.Mui-disabled {
      .MuiButton-endIcon {
        color: var(--color-text-disable);
      }
    }

    &.selected {
      border: 1px solid var(--color-border-select);

      &:after {
        display: none;
      }
    }

    &.MuiButton-root {
      ${
        // @ts-ignore
        ({ loading, loadingbg, t }) => {
          return loading === 'true'
            ? `
           pointer-events: none;    
         
       `
            : ''
        }
      }
    }

    .loading {
      font-size: ${({ theme }) => theme.fontDefault.body2};
    }
  }

  &.vendor {
    justify-content: center;
    flex-direction: column;

    & > .vendorName {
      text-indent: -999em;
      justify-content: center;
    }
  }

  &:hover {
    background: var(--provider-hover);
    border-color: var(--color-border-select); 
    color: var(--color-text-button-select);
  }

  &.selected {
    &.redPacketType {
      border: 1px solid var(--color-border-select);

      &:after {
        display: none;
      }
    }

    position: relative;
    background: var(--provider-hover);
    border-color: var(--opacity);
    color: var(--color-text-button-select);

    &:after {
      position: absolute;
      content: '\u25CF';
      text-indent: 0em;
      color: var(--color-success);
      display: flex;
      left: 0;
      padding-left: ${({ theme }) => (theme.unit * 3) / 2}px;
      align-items: center;
      font-size: ${({ theme }) => theme.fontDefault.h5};
    }
  }
` as (props: ButtonProps) => JSX.Element

export const StyledPaperBg = styled(Box)`
  background: var(--color-box-third);
  border-radius: ${({ theme }) => theme.unit}px;
` as any

export const MediaLabelStyled = styled(Box)<BoxProps & { colorbg?: string }>`
  border-radius: 0 0 ${({ theme }) => theme.unit}px 0;
  padding: ${({ theme }) => theme.unit / 2}px ${({ theme }) => theme.unit}px;
  color: var(--color-box);
  font-size: 1.4rem;
  background: ${({ colorbg }) => (colorbg ? colorbg : 'var(--color-tag)')};
  cursor: help;
` as (props: BoxProps & { colorbg?: string }) => JSX.Element

export const BoxBannerStyle = styled(Box)<
  BoxProps & { backGroundUrl?: string | number; direction?: 'left' | 'right' }
>`
  background-color: var(--color-box);

  .bg:after {
    display: block;
    content: '';
    float: ${({ direction }) => direction};
    width: 35%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-image: url('${({ backGroundUrl }) => backGroundUrl}');
  }

  &.mobile .bg {
    position: relative;
    display: flex;
    flex-direction: column;

    &:after {
      opacity: 0.08;
      z-index: 1;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  }
` as (
  props: BoxProps & {
    backGroundUrl?: string | number
    direction?: 'left' | 'right'
  },
) => JSX.Element
