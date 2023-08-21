import { Box, Grid, Link, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import styled from '@emotion/styled'
import { LandPageHeightConfig, SoursURL } from '@loopring-web/common-resources'
import { withTranslation } from 'react-i18next'
import { ContainerStyle, ContainerStyled, TitleTypography } from './style'
import { useSettings } from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'

// const LinkStyle = styled(Link)`
//   color: var(--color-button-select);
//   text-decoration: underline;
//   font-size: 1.6rem;
//   line-height: 2.4rem;
// ` as typeof Link;
//
// const ImgWrapperLeftStyled = styled(Box)`
//   position: absolute;
//   top: 50%;
//   left: 0;
//   transform: translateY(-50%);
// `;
//
// const ImgWrapperRightStyled = styled(Box)`
//   position: absolute;
//   top: 50%;
//   right: 0;
//   transform: translateY(-50%);
// `;
//
// const GridBg = styled(Grid)`
//   background-size: 160%;
//   background-repeat: no-repeat;
//   background-position: -360px -110px;
//   ${({ theme }) => {
//     return `
//         background-image: image-set(url("https://static.loopring.io/assets/images/landPage/img_wallet_app_${theme.mode}.webp") 1x,
//         url("https://static.loopring.io/assets/images/landPage/img_wallet_app_${theme.mode}.png") 1x);
//             `;
//   }}
// ` as typeof Grid;
//
// const BottomBanner = styled(Box)`
//   background: var(--layer-2);
// ` as typeof Box;

export const WalletPage = withTranslation(['landPage', 'common'])(({ t }: any) => {
  const { isMobile } = useSettings()
  const { mode } = useTheme()
  return <></>
})
