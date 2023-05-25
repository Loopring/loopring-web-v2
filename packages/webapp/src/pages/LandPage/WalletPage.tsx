import { Box, Grid, Link, Typography } from "@mui/material";
import React, { useEffect } from "react";
import styled from "@emotion/styled/";
import { LandPageHeightConfig, SoursURL } from "@loopring-web/common-resources";
import { withTranslation } from "react-i18next";
import { ContainerStyle, ContainerStyled, TitleTypography } from "./style";
import { useSettings } from "@loopring-web/component-lib";
import { useTheme } from "@emotion/react";
import { useHistory } from "react-router";

const LinkStyle = styled(Link)`
  color: var(--color-button-select);
  text-decoration: underline;
  font-size: 1.6rem;
  line-height: 2.4rem;
` as typeof Link;

const ImgWrapperLeftStyled = styled(Box)`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
`;

const ImgWrapperRightStyled = styled(Box)`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
`;

const GridBg = styled(Grid)`
  background-size: 160%;
  background-repeat: no-repeat;
  background-position: -360px -110px;
  ${({ theme }) => {
    return `
        background-image: image-set(url("https://static.loopring.io/assets/images/landPage/img_wallet_app_${theme.mode}.webp") 1x,
        url("https://static.loopring.io/assets/images/landPage/img_wallet_app_${theme.mode}.png") 1x);
            `;
  }}
` as typeof Grid;

const BottomBanner = styled(Box)`
  background: var(--layer-2);
` as typeof Box;

export const WalletPage = withTranslation(["landPage", "common"])(
  ({ t }: any) => {
    const { isMobile } = useSettings();
    const { mode } = useTheme();
    useEffect(() => {
      if (mode === 'dark') {
        window.location.href = '/wallet_dark.html';
      } else {
        window.location.href = '/wallet_light.html';
      }
    }, [])
    return (
      <ContainerStyle>
        <Box>
          <ContainerStyled isMobile={isMobile}>
            {isMobile ? (
              <Grid
                item
                xs={12}
                flex={1}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Box
                  flex={1}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  flexDirection={"column"}
                >
                  <Typography
                    component={"h1"}
                    variant={"h1"}
                    whiteSpace={"pre-line"}
                  >
                    {t("labelH1TitleWallet")}
                  </Typography>
                  <Typography
                    component={"h2"}
                    variant={"h3"}
                    marginTop={2}
                    whiteSpace={"pre-line"}
                  >
                    {t("labelH2TitleWallet")}
                  </Typography>
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    marginTop={12}
                    alignItems={"center"}
                  >
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://play.google.com/store/apps/details?id=loopring.defi.wallet"
                    >
                      <img
                        width={260}
                        src={`${SoursURL}images/landPage/appGooglePlay.webp`}
                        alt={"Android"}
                      />
                    </Link>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://download.loopring.io/LoopringWallet.apk"
                    >
                      <img
                        width={260}
                        src={`${SoursURL}images/landPage/appAndroid.webp`}
                        alt={"GooglePlay"}
                      />
                    </Link>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://apps.apple.com/us/app/loopring-smart-wallet/id1550921126"
                    >
                      <img
                        width={260}
                        src={`${SoursURL}images/landPage/appAppleStore.webp`}
                        alt={"AppStore"}
                      />
                    </Link>
                  </Box>
                  <Box display={"flex"} alignItems={"center"}>
                    <Typography
                      variant={"h5"}
                      color={"var(--color-text-third)"}
                      marginRight={1.5}
                    >
                      {t("labelHaveWallet")}
                    </Typography>
                    <LinkStyle href={"./#/guardian"} variant={"body1"}>
                      {t("labelGoGuardian")}
                    </LinkStyle>
                  </Box>
                </Box>
              </Grid>
            ) : (
              <GridBg
                item
                xs={12}
                maxHeight={LandPageHeightConfig.maxHeight}
                position={"relative"}
                flex={1}
              >
                <Box
                  position={"absolute"}
                  left={0}
                  top={"50%"}
                  style={{ transform: "translateY(-50%)" }}
                >
                  <Typography
                    component={"h1"}
                    fontSize={isMobile ? 24 : 64}
                    marginTop={4}
                    whiteSpace={"pre-line"}
                    lineHeight={"96px"}
                  >
                    {t("labelH1TitleWallet")}
                  </Typography>
                  <Typography
                    component={"h2"}
                    fontSize={isMobile ? 14 : 38}
                    marginTop={2}
                    whiteSpace={"pre-line"}
                    lineHeight={"46px"}
                  >
                    {t("labelH2TitleWallet")}
                  </Typography>
                  <Grid container width={"600px"} marginTop={8} marginLeft={-2}>
                    <Grid item xs={4}>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://play.google.com/store/apps/details?id=loopring.defi.wallet"
                      >
                        <img
                          style={{ width: "100%" }}
                          src={`${SoursURL}images/landPage/appGooglePlay.webp`}
                          alt={"Android"}
                        />
                      </Link>
                    </Grid>
                    <Grid item xs={4}>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://download.loopring.io/LoopringWallet.apk"
                      >
                        <img
                          style={{ width: "100%" }}
                          src={`${SoursURL}images/landPage/appAndroid.webp`}
                          alt={"GooglePlay"}
                        />
                      </Link>
                    </Grid>
                    <Grid item xs={4}>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://apps.apple.com/us/app/loopring-smart-wallet/id1550921126"
                      >
                        <img
                          style={{ width: "100%" }}
                          src={`${SoursURL}images/landPage/appAppleStore.webp`}
                          alt={"AppStore"}
                        />
                      </Link>
                    </Grid>
                  </Grid>
                  <Box display={"flex"} alignItems={"center"}>
                    <Typography
                      variant={"h5"}
                      color={"var(--color-text-third)"}
                      marginRight={1.5}
                    >
                      {t("labelHaveWallet")}
                    </Typography>
                    <LinkStyle href={"./#/guardian"} variant={"body1"}>
                      {t("labelGoGuardian")}
                    </LinkStyle>
                  </Box>
                </Box>
              </GridBg>
            )}
          </ContainerStyled>
        </Box>
        <Box style={{ background: "var(--layer-2)" }}>
          <ContainerStyled isMobile={isMobile}>
            <Grid item xs={12} flex={1} alignItems={"center"}>
              <Box
                flex={1}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Typography
                  component={"h1"}
                  variant={isMobile ? "h2" : "h2"}
                  marginTop={0}
                  textAlign={"center"}
                  whiteSpace={"pre-line"}
                  color={"var(--text-third)"}
                >
                  {t("labelFirstWallet")}
                </Typography>
                <Typography
                  component={"h2"}
                  variant={isMobile ? "h4" : "h3"}
                  marginTop={3}
                  textAlign={"center"}
                  whiteSpace={"pre-line"}
                  color={"var(--text-third)"}
                >
                  {t("labelFirstWalletDetail")}
                </Typography>
              </Box>
            </Grid>
          </ContainerStyled>
        </Box>
        <Box style={{ background: "auto" }}>
          <ContainerStyled isMobile={isMobile}>
            <Grid item xs={12} position={"relative"} className={"wallet-grid"}>
              <Box
                className="wallet-content"
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
              >
                <TitleTypography isMobile={isMobile}>
                  {t("labelWalletSecureH1")}
                </TitleTypography>
                <Typography variant={"h3"}>
                  {t("labelWalletSecureH2")}
                </Typography>
                <Typography
                  whiteSpace={"pre-line"}
                  variant={"h5"}
                  color={"var(--color-text-secondary)"}
                  marginTop={5}
                >
                  {t("labelWalletSecureDetail")}
                </Typography>
              </Box>
              {!isMobile ? (
                <ImgWrapperRightStyled>
                  <img
                    style={{ width: 500 }}
                    src={`${SoursURL}images/landPage/img_wallet_guardians@1x.webp`}
                    alt={"secure"}
                  />
                </ImgWrapperRightStyled>
              ) : (
                <Box>
                  <img
                    width={360}
                    src={`${SoursURL}images/landPage/img_wallet_guardians@1x.webp`}
                    alt={"future"}
                  />
                </Box>
              )}
            </Grid>
          </ContainerStyled>
        </Box>
        <Box style={{ background: "var(--second-bg)" }}>
          <ContainerStyled isMobile={isMobile}>
            <Grid
              item
              xs={12}
              position={"relative"}
              display={"flex"}
              className={"wallet-grid"}
            >
              <Box
                className="wallet-content"
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"flex-end"}
              >
                <TitleTypography className={"right"} isMobile={isMobile}>
                  {t("labelWalletIdentityH1")}
                </TitleTypography>
                <Typography variant={"h3"} textAlign={"right"}>
                  {t("labelWalletIdentityH2")}
                </Typography>
                <Typography
                  whiteSpace={"pre-line"}
                  textAlign={"right"}
                  variant={"h5"}
                  color={"var(--color-text-secondary)"}
                  marginTop={5}
                >
                  {t("labelWalletIdentityDetail")}
                </Typography>
              </Box>
              {!isMobile ? (
                <ImgWrapperLeftStyled>
                  <img
                    style={{ width: 500 }}
                    src={`${SoursURL}images/landPage/img_wallet_address@1x.webp`}
                    alt={"identity"}
                  />
                </ImgWrapperLeftStyled>
              ) : (
                <Box>
                  <img
                    width={360}
                    src={`${SoursURL}images/landPage/img_wallet_address@1x.webp`}
                    alt={"future"}
                  />
                </Box>
              )}
            </Grid>
          </ContainerStyled>
        </Box>
        <Box style={{ background: "var(--layer-1)" }}>
          <ContainerStyled isMobile={isMobile}>
            <Grid
              item
              xs={12}
              position={"relative"}
              display={"flex"}
              className={"wallet-grid"}
            >
              <Box
                className="wallet-content"
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
              >
                <TitleTypography isMobile={isMobile}>
                  {t("labelWalletUsageH1")}
                </TitleTypography>
                <Typography variant={"h3"}>
                  {t("labelWalletUsageH2")}
                </Typography>
                <Typography
                  whiteSpace={"pre-line"}
                  variant={"h5"}
                  color={"var(--color-text-secondary)"}
                  marginTop={5}
                >
                  {t("labelWalletUsageDetail")}
                </Typography>
              </Box>
              {!isMobile ? (
                <ImgWrapperRightStyled>
                  <img
                    style={{ width: 500 }}
                    src={`${SoursURL}images/landPage/img_wallet_operation@1x.webp`}
                    alt={"performance"}
                  />
                </ImgWrapperRightStyled>
              ) : (
                <Box>
                  <img
                    width={360}
                    src={`${SoursURL}images/landPage/img_wallet_operation@1x.webp`}
                    alt={"future"}
                  />
                </Box>
              )}
            </Grid>
          </ContainerStyled>
        </Box>
        <Box style={{ background: "var(--second-bg)" }}>
          <ContainerStyled isMobile={isMobile}>
            <Grid
              item
              xs={12}
              position={"relative"}
              display={"flex"}
              className={"wallet-grid"}
            >
              <Box
                className="wallet-content"
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"flex-end"}
              >
                <TitleTypography className={"right"} isMobile={isMobile}>
                  {t("labelWalletFutureH1")}
                </TitleTypography>
                <Typography variant={"h3"} textAlign={"right"}>
                  {t("labelWalletFutureH2")}
                </Typography>
                <Typography
                  whiteSpace={"pre-line"}
                  textAlign={"right"}
                  variant={"h5"}
                  color={"var(--color-text-secondary)"}
                  marginTop={5}
                >
                  {t("labelWalletFutureDetail")}
                </Typography>
              </Box>
              {!isMobile ? (
                <ImgWrapperLeftStyled>
                  <img
                    style={{ width: 500 }}
                    src={`${SoursURL}images/landPage/img_wallet_income@1x.webp`}
                    alt={"future"}
                  />
                </ImgWrapperLeftStyled>
              ) : (
                <Box>
                  <img
                    width={360}
                    src={`${SoursURL}images/landPage/img_wallet_income@1x.webp`}
                    alt={"future"}
                  />
                </Box>
              )}
            </Grid>
          </ContainerStyled>
        </Box>
        <BottomBanner height={isMobile ? 400 : 500}>
          <ContainerStyled isMobile={isMobile}>
            <Grid
              item
              xs={12}
              display={"flex"}
              position={"relative"}
              style={{ minHeight: "auto" }}
            >
              <Box
                height={isMobile ? 400 : 500}
                // marginTop={isMobile ? 2 : 4}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Typography
                  color={"#fff"}
                  variant={isMobile ? "h2" : "h2"}
                  lineHeight={"56px"}
                  textAlign={"center"}
                >
                  {t("labelWalletUnleashed")}
                </Typography>
                <Typography
                  color={"#fff"}
                  variant={isMobile ? "h4" : "h4"}
                  marginTop={3}
                  textAlign={"center"}
                >
                  {t("labelWalletUnleashedDetail")}
                </Typography>
              </Box>
            </Grid>
          </ContainerStyled>
        </BottomBanner>
      </ContainerStyle>
    );
  }
);
