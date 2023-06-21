import styled from '@emotion/styled'
import { Box, Container, Typography, TypographyProps } from '@mui/material'
import { SoursURL, ThemeType } from '@loopring-web/common-resources'
import { ContainerProps } from '@mui/material/Container/Container'
import { LAYOUT } from '@loopring-web/core'

export const ContainerStyle = styled(Box)`
  .MuiContainer-root {
    min-width: 1200px;
    @media only screen and (max-width: 768px) {
      min-width: 360px;
    }
  }

  ${({ theme }) => {
    let result = `
       --img-banner-url: url("${SoursURL}landPage/img_home_banner_${theme.mode}@2x.png");
      `
    if (theme.mode === ThemeType.dark) {
      result += `
            --main-page-bg: var(--color-global-bg);
            --color-primary: #4169FF;
            --layer-2: #1A32A2;
            --second-bg: var(--color-box);
            --box-card-decorate:rgba(255, 255, 255, 0.1);
            --box-card-background: #283485;
            --box-card-background-hover:#4169FF;
            --box-card-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15); 
            --text-secondary: #687295;
            --border-card:1px solid #49527D;
            --border-card-hover: rgba(255, 255, 255, 0.1);
            --text-highlight:#4169FF;
            --text-third:#ffffff;
            --bg-bottom: #1A32A1;
        `
    } else {
      result += `
            --main-page-bg: #ffffff;
            --color-primary: #3B5AF4;
            --layer-2: #4169FF;
            --second-bg: #F6F7FB;
            --box-card-decorate:rgba(255, 255, 255, 0);
            --box-card-background:#ffffff;
            --box-card-background-hover:#3B5AF4;
            --box-card-shadow: 0px 10px 20px rgba(87, 129, 236, 0.1);
            --text-secondary: #A3A8CA;
            --border-card:1px solid #E9EAF2;
            --border-card-hover: rgba(255, 255, 255, 0.1);
            --text-highlight:#4169FF;
            --text-third:#ffffff;
            --bg-bottom: #4169FF;
        `
    }
    return result
  }};
  background: var(--main-page-bg);

  body {
    background: var(--main-page-bg);
  }
` as typeof Box
export const TitleTypography = styled(Typography)<TypographyProps & { isMobile?: boolean }>`
  text-transform: uppercase;
  font-size: ${({ isMobile }) => (isMobile ? '2rem' : '4rem')};
  font-weight: 700;
  white-space: pre-line;
  line-height: 5.6rem;
  position: relative;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  &.right {
    align-items: flex-end;
  }
  justify-content: space-between;
  align-self: flex-start;
  height: ${({ isMobile }) => (isMobile ? 'auto' : 'calc(80px + 24px)')};
  width: 100%;
  &:before {
    margin-top: 24px;
    content: '';
    // top: ${({ isMobile }) => (isMobile ? '-16px' : '-30px')};
    // left: 0;
    height: 6px;
    width: 96px;
    display: block;
    background: var(--color-primary);
  }
` as (props: TypographyProps & { isMobile?: boolean }) => JSX.Element

export const ContainerStyled = styled(Container)<ContainerProps & { isMobile?: boolean }>`
  padding: 0 !important;
  & > .MuiGrid-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    ${({ isMobile }) => `
      min-height: ${isMobile ? `calc(100vh - ${LAYOUT.HEADER_HEIGHT}px)` : '734px'};
      &.wallet-grid{
        justify-content: space-around;
        .wallet-content {
          width:100%;
          .MuiTypography-h5{
            max-width:360px;
          }
          // flex:1;
        }
      }
    `}

    .boxCard {
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: var(--box-card-background);
      box-shadow: var(--box-card-shadow);
      font-size: 1.4rem;
      h4 {
        text-transform: uppercase;
        font-weight: 500;
        margin-left: 14px;
        font-size: 2em;
      }
      .content {
        margin-left: 14px;
        //position: absolute;
        font-size: 5.6em;
      }

      :before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 10px;
        display: block;
        border-start-end-radius: 4px;
        border-end-end-radius: 4px;
        background: var(--box-card-decorate);
      }

      ${({ isMobile }) =>
        isMobile
          ? `
            position: relative;
             margin: 24px;
          `
          : `
      position: absolute;
     
      &.trade-volume {
        width: 320px;
        height: 256px;
        top: 196px;
        z-index: 42;
        
      }
      &.trade-tvl {
        width: 262px;
        height: 210px;
        top: 102px;
        left: 394px;
        z-index:  42;
        font-size: 12px;
      }
      
      &.trade-user {
        width: 262px;
        height: 210px;
        top: 102px;
        left: 798px;
        z-index:  42;
        font-size: 12px;
      }
      &.trade-trades {
        width: 399px;
        height: 319px;
        top: 351px;
        left: 798px;
        z-index: 42;
        font-size: 24px;
       
      }
      `}
    }
  }
` as (props: ContainerProps & { isMobile?: boolean }) => JSX.Element
