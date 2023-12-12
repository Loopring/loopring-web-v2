import styled from '@emotion/styled'
import { Box, Container, Typography, TypographyProps } from '@mui/material'
import { SoursURL, ThemeType } from '@loopring-web/common-resources'
import { ContainerProps } from '@mui/material/Container/Container'
import { Button } from '@loopring-web/component-lib'
import { withTranslation } from 'react-i18next'

export const ContainerStyle = styled(Box)`
  .MuiContainer-root {
    width: fit-content;

    @media only screen and (min-width: 1200px) {
      min-width: 1200px;
    }
    @media only screen and (max-width: 768px) {
      min-width: 360px;
    }
  }
  --dark: #000000;
  --dark1000: #31353d;
  --dark900: #141414;
  --dark800: #1f1f1f;
  --dark700: #262626;
  --dark600: #434343;
  --dark500: #595959;
  --dark400: #8c8c8c;
  --light400: #bfbfbf;
  --light500: #d9d9d9;
  --light600: #ebebeb;
  --light700: #f0f0f0;
  --light800: #f5f5f5;
  --light900: #fafafa;
  --light1000: #ffffff;
  --light: #ffffff;
  --color-success: #00bba8;
  --color-warning: #fba95c;
  --color-error: #ff5677;
  /**** config pex ****/
  --h1: 48px;
  --h2: 30px;
  --h3: 24px;
  --h4: 20px;
  --h5: 16px;
  --body: 14px;
  --body2: 12px;
  --header-row-height: 44px;
  --header-height: 64px;
  --header-submenu-item-height: 52px;
  --header-submenu-item-width: 250px;
  ${({ theme }) => {
    let result = `
       --img-banner-url: url("${SoursURL}landPage/img_home_banner_${theme.mode}@2x.png");
      `
    if (theme.mode === ThemeType.dark) {
      result += `
    --color-global-Bg: var(--dark);
    --color-primary: #446eff;
    --color-primary-hover: var(--light900);
    --color-primary-pressed: #2d49b2;
    --color-disable: #343754;
    --color-text-primary: var(--light);
    --color-border: var(--light900);
    --color-divide: var(--dark800);
    --color-border-hover: var(--color-primary);
    --color-text-secondary: var(--light500);
    --color-text-third: var(--dark400);
    --color-text-button: var(--light);
    --color-text-buttonSelect: var(--light);
    --color-text-disable: var(--light) 45;
    --color-box: var(--dark1000);
    --color-logo: var(--light);
    --color-field:#6B8FEB20;
        `
    } else {
      result += `
    --color-global-Bg: var(--light);
    --color-primary: #446eff;
    --color-primary-hover: var(--light900) 20;
    --color-primary-pressed: #2d49b2;
    --color-disable: #343754;
    --color-text-primary: var(--dark);
    --color-border: var(--dark900);
    --color-divide: var(--light500);
    --color-border-hover: var(--color-primary);
    --color-text-secondary: var(--dark500);
    --color-text-third: var(--light400);
    --color-text-button: var(--light);
    --color-text-buttonSelect: var(--light);
    --color-text-disable: var(--light) 45;
    --color-box: var(--light1000);
    --color-logo: #446eff;
    --color-field:#6B8FEB20;
        `
    }
    return result
  }};

  .MuiButton-root {
    min-height: 48px;
    padding: 0 48px;
    --color-text: var(--color-text-button);
    //border: 1px solid var(--color-border);
    //border-radius: 2px;
    box-sizing: border-box;
    background: var(--color-primary);
    color: var(--color-text);
    width: fit-content;
    display: flex;
    align-items: center;
    font-size: var(--h5);
    & .MuiButton-endIcon {
      color: inherit;
    }
    &:hover {
      color: inherit;
      background: var(--color-primary-pressed);
      .MuiButton-endIcon {
        color: inherit;
      }
      svg {
        color: inherit;
      }
    }
  }
  .product {
    position: relative;

    .MuiButton-root {
      text-align: left;
    }
    .MuiTabs-scrollButtons {
      position: absolute;
      height: 100%;
      z-index: 99;
      svg {
        height: 32px;
        width: 32px;
        background: #4a505c;
        color: var(--color-text-button);
        outline: 2px solid #4a505c;
        border-radius: 50%;
      }
    }
    .MuiTab-root {
      display: flex;
      align-items: stretch;
    }

    .MuiTab-root:first-of-type {
      padding-left: 0;
    }
    .MuiTabs-scrollButtons:first-of-type {
      left: 0;
    }
    .MuiTabs-scrollButtons:last-child {
      right: 0;
    }
  }
  .MuiButton-root.walletConnectL2Btn {
    width: 100%;
  }

  .MuiButton-root.menuItem {
    display: flex;
    justify-content: flex-start;

    padding-left: 2rem;
    height: 80px;
    min-width: 320px;
    width: 100%;
    fontsize: 1.4rem;
    padding-right: ${({ theme }) => theme.unit * 3}px;
    .MuiButton-startIcon svg {
      fill: var(--color-primary);
    }
    & {
      background: none;
      :hover {
        background: none;
        outline: 1px solid var(--color-border-hover);
      }
    }
  }
  .box1,
  .box5,
  .box6,
  .box3 {
    margin-bottom: 40px;
    > div {
      background: var(--color-box);
      border-radius: 12px;
      padding: 48px;
    }
  }
  .box1,
  .box5,
  .box3 {
    h4 {
      margin-bottom: ${({ theme }) => theme.unit * 3}px;
    }
  }

  .box6 {
    > div {
      flex: 1;
      justify-content: space-between;
    }
  }
  .box1 {
    > div {
      flex: 1;
      justify-content: space-between;
    }
  }
  .box4 {
    margin-bottom: 80px;
    & .MuiGrid-grid-md-8 {
      flex-basis: auto;
      width: calc(66% - 48px);
      max-width: inherit;
      position: relative;
      overflow: hidden;
      svg {
        position: absolute;
        right: 20px;
        bottom: 20px;
      }
    }
    & .MuiGrid-grid-md-2 {
      flex-basis: auto;
      width: 22%;
      max-width: inherit;
      position: relative;
      overflow: hidden;
      svg {
        position: absolute;
        right: -72px;
        bottom: 20px;
      }
    }

    > .MuiGrid-root {
      transition: all 0.5s ease;
      svg {
        transition: all 0.5s ease;
      }
    }
    .boxDetail {
      overflow: hidden;
      border-radius: ${({ theme }) => theme.unit}px;
    }

    p {
      display: none;
      opacity: 0;
    }
    & .MuiGrid-grid-md-12 {
      p {
        display: block;
        opacity: 1;
      }
    }
    svg {
      opacity: 0.5;
      .fill-light {
        fill: var(--color-text-primary);
      }
      .fill-primary {
        fill: var(--color-primary);
      }
    }

    .selected,
    > .MuiGrid-root:hover {
      p {
        display: block;
        opacity: 1;
      }
      .boxDetail {
        border: 1px solid var(--color-border-hover);
      }

      svg {
        align-self: flex-end;
        opacity: 1;
      }
    }
  }

  .box2 {
    margin-bottom: 80px;
    h4 {
      margin-bottom: ${({ theme }) => theme.unit * 3}px;
    }

    .MuiButton-root {
      margin-top: ${({ theme }) => theme.unit * 3}px;
    }
    > .MuiGrid-root div {
      border-radius: ${({ theme }) => theme.unit}px;
    }
    > .MuiGrid-root:first-of-type div {
      .MuiButton-root {
        background: white;
        color: var(--color-primary);
        &:hover {
          svg {
            fill: var(--color-primary);
          }
          opacity: 0.6;
        }
      }
      .MuiTypography-root {
        color: var(--color-text-button);
      }
      background: linear-gradient(260.11deg, #547fe7 18.38%, #2e60e3 85.98%);
      /* Rectangle 41978 */
    }
    > .MuiGrid-root:last-child div {
      background: var(--light1000);
      .MuiTypography-root {
        color: var(--dark);
      }
    }
  }
  body {
    background: var(--main-page-bg);
  }

  .MuiTab-root {
    width: 30%;
  }

  @media only screen and (max-width: 1024px) {
    .box1 {
      .MuiBox-root {
        flex-direction: column;
        > div {
          margin-bottom: 24px;
        }
      }
    }
    .box4 {
      p {
        display: block;
      }
    }

    .box2 {
      padding: 0 20px;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
      > .flexBox {
        &:first-of-type {
          margin-left: 0px;
        }
        flex-direction: column;
        margin-left: 0px;
        > div {
          margin-bottom: 24px;
        }
        margin-bottom: 24px;
      }
    }
    .box2 {
      padding: 0;
    }

    #mobileBg {
      width: 100%;
    }

    #labelEthereumUnleashed {
      width: 100%;
      font-size: 36px;
      margin-top: 32px;
    }
  }

  @media only screen and (max-width: 768px) {
    header {
      .Ul-root {
        position: absolute;
        display: flex;
        top: 0;
        flex-direction: column;
        margin-left: 56px;
        li {
          height: 48px;
          line-height: 48px;
        }
      }
    }
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

    height: 6px;
    width: 96px;
    display: block;
    background: var(--color-primary);
  }
` as (props: TypographyProps & { isMobile?: boolean }) => JSX.Element

export const ContainerStyled = styled(Container)<ContainerProps & { isMobile?: boolean }>`
  padding: 0 !important;
` as (props: ContainerProps & { isMobile?: boolean }) => JSX.Element

const ButtonStyled = styled(Button)`
  background: linear-gradient(94.92deg, #4169ff 0.91%, #a016c2 103.55%);
  padding-left: ${({ theme }) => 3 * theme.unit}px;
  padding-right: ${({ theme }) => 3 * theme.unit}px;
`
export const LandBtn = withTranslation(['landPage'])(({ t }) => {
  return (
    <ButtonStyled size={'small'} variant={'contained'} href={'/#/?goProd'}>
      {t('labelLaunchApp')}
    </ButtonStyled>
  )
})

export const CardBox = styled(Box)`
  display: flex;
  justify-content: center;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit * 2}px;
  cursor: pointer;
  box-sizing: border-box;
  &.hasHover {
    p {
      text-transform: initial;
    }
  }
  border: 1px solid var(--opacity);
  box-shadow: 0 0 0.5px 0.5px var(--color-divide);
  &.hasHover:hover {
    border: 1px solid var(--color-border-hover);
    box-shadow: none;
  }
` as typeof Box
