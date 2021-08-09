import styled from '@emotion/styled';
import { BoxProps, Grid, Typography } from '@material-ui/core';
import { css } from '@emotion/react';
import { UpColor } from '@loopring-web/common-resources';
import { Box } from '@material-ui/core/';
import React from 'react';

export const TypographyStrong = styled(Typography)`
  color: ${({theme}) => theme.colorBase.secondary};
` as typeof Typography
export const TypographyGood = styled(Typography)`
  color: ${({theme}) => theme.colorBase.success};
` as typeof Typography
export const TablePaddingX = ({pLeft = 24, pRight = 24}: { pLeft: number, pRight: number }) => css`
  .rdg-row, .rdg-header-row {
    .rdg-cell:first-of-type {
      padding-left: ${pLeft}px;
    }

    .rdg-cell:last-of-type {
      padding-right: ${pRight}px;
    }
  }
`
export const VipStyled = styled(Typography)`
  margin-left: ${({theme}) => theme.unit}px;
  padding: ${({theme}) => theme.unit / 4}px ${({theme}) => theme.unit}px;
  ${({theme}) => theme.border.defaultFrame({c_key: 'rgba(0,0,0,0)', d_R: 0.25})};
  background-color: ${({theme}) => theme.colorBase.vipBgColor};
  height: 2rem;
  //line-height: 2rem;
  color: ${({theme}) => theme.colorBase.secondaryDark};
` as typeof Typography
export const floatTag = ({theme, custom}: any) => css`
  .float-group {
    font-weight: lighter;

    .float-tag.float-increase {
      color: ${custom.chg === UpColor.green ? theme.colorBase.success : theme.colorBase.error}
    }

    .float-tag.float-decrease {
      color: ${custom.chg === UpColor.green ? theme.colorBase.error : theme.colorBase.success};
    }

    .float-tag.float-none {
      color: ${theme.colorBase.textPrimary};
    }
  }
`
export const AvatarIconPair = ({theme}: any) => css`
  //.MuiAvatar-root {
  //  width: var(--chart-title-coin-size);
  //  height: var(--chart-title-coin-size);
  //}

  .icon-next {
    margin-left: -${theme.unit}px;
  }`
export const baseTitleCss = ({theme, custom}: any) => css`
  height: 72px;

  ${AvatarIconPair({theme})}
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

  ${floatTag({theme, custom})};

  .float-chart {
    margin-left: ${theme.unit}px;

    .chart-change {
      color: ${theme.colorBase.textSecondary};
    }
  }
`
export const ButtonListRightStyled = styled(Grid)`
  .MuiButton-root:not(:last-child) {
    margin-right: ${({theme}) => theme.unit}px;
  }
` as typeof Grid
export const modalContentBaseStyle = ({theme}: any) => css`
  &:focus-visible {
    outline: 0
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
// height:100%;
// margin-top: var(--toolbar-row-padding-minus);
// padding-top: var(--toolbar-row-padding);
export const SwitchPanelStyled: any = styled(Box)<{ _height?: number | string, _width?: number | string } & BoxProps>`
  &&{
    ${({theme}) => modalContentBaseStyle({theme: theme})}
    ${({_height, _width, theme}) => `
      background: ${theme.colorBase.background().popupBg1};
      .react-swipeable-view-container {
           height: ${_height && Number.isNaN(_height) ? _height + 'px' : _height ? _height : '100%'} ;
           width: ${_width && Number.isNaN(_width) ? _width + 'px' : _width ? _width : '100%'};
           & > div{
              height:initial;
              padding-bottom:var(--toolbar-row-padding); 
              background: initial;
              .container{
                height:100%;
              }
               .trade-panel{
                 .react-swipeable-view-container {
                     & > div{
                          padding: 0 ${theme.unit * 5/2}px 0;
                     }
                 }
               }
           }
       }
      .trade-panel{
        margin-top: var(--toolbar-row-padding-minus);                         MuiToolbar-root
        height: ${_height && Number.isNaN(_height) ? _height + 'px' : _height ? _height : '100%'} ;
        width: ${_width && Number.isNaN(_width) ? _width + 'px' : _width ? _width : '100%'};
        .react-swipeable-view-container {
            & > div{
              padding: 0 ${theme.unit * 5/2}px var(--toolbar-row-padding);
              overflow: unset !important
              .container{
                height:100%;
              
              }
           }
        }
      }
      
    `}
  }
` as React.ElementType<{ _height?: number | string, _width?: number | string } & BoxProps>

export const TableFilterStyled = styled(Box)`
  margin-left: 26px;
  margin-bottom: ${({theme}) => theme.unit * 2}px;
` as typeof Box

export const AnimationArrow = styled(Box)`
  &.arrowCta {
    transform-origin: center;
    display: block;
    height: 12px;
    width: 12px;
    border: 9px solid transparent;
    transform: rotate(45deg) scale(.5);
    position: relative;
    margin: ${({theme}) => theme.unit * 2}px;
    //margin: 25vh auto;
  }

  &.arrowCta:after,
  &.arrowCta:before {
    content: "";
    display: block;
    height: inherit;
    width: inherit;
    position: absolute;
    top: 0;
    left: 0;
  }

  &.arrowCta:after {
    border-bottom: 3px solid white;
    border-right: 3px solid white;
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
    border-bottom: 3px solid white;
    border-right: 3px solid white;
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



