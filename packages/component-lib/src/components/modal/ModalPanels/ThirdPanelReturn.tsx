import { Box, BoxProps, Link, Typography } from "@mui/material";

import { useSettings } from "../../../stores";
import { Button } from "../../basic-lib";
import { BackIcon, BANXA_URLS, SoursURL } from "@loopring-web/common-resources";
import { MenuBtnStyled } from "../../styled";
import styled from "@emotion/styled";
import { Trans, useTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";

export const ThirdPanelReturn = ({
  title,
  description,
  btnInfo,
}: {
  title: string | JSX.Element;
  description: string | JSX.Element;
  btnInfo: {
    btnTxt: string;
    callback: () => void;
  };
} & any) => {
  const { isMobile } = useSettings();

  return (
    <>
      <Box
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDirection={"column"}
      >
        <Typography
          component={"h3"}
          variant={isMobile ? "h4" : "h3"}
          whiteSpace={"pre"}
          marginBottom={3}
          marginTop={-1}
        >
          {title}
        </Typography>

        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          flex={1}
          alignItems={"stretch"}
          alignSelf={"stretch"}
          className="modalContent"
          paddingX={isMobile ? 7 : 5}
          paddingBottom={4}
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            paddingY={3}
          >
            <img
              className="loading-gif"
              width="36"
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
          <Typography
            component={"p"}
            variant={"body1"}
            color={"textSecondary"}
            marginBottom={1}
          >
            {description}
          </Typography>
        </Box>
        <Box alignSelf={"stretch"} paddingX={5} marginY={5 / 2}>
          <Button
            variant={"contained"}
            fullWidth
            size={"medium"}
            onClick={(e?: any) => {
              if (btnInfo?.callback) {
                btnInfo.callback(e);
              }
            }}
          >
            {btnInfo?.btnTxt}
          </Button>
        </Box>
      </Box>
    </>
  );
};

const BoxStyle = styled(Box)<BoxProps & { isMobile: boolean | undefined }>`
  .way-content > div:first-of-type {
    position: relative;
    font-size: ${({ theme }) => theme.fontDefault.body1};
    ${({ theme }) => `
      padding-bottom: ${10 * theme.unit}px;
      &:before {
        display: block;
        content: " ";
        position: absolute;
        bottom: 0px;
        left: 0;
        right: 0;
        bottom: ${6 * theme.unit}px;
        margin: 0 ${2 * theme.unit}px;
        color: var(--color-text-third);
        border: 1px solid var(--color-text-third);
        opacity: 0.4;
      }
      &:after {
        display: block;
        content: "OR";
        position: absolute;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        left: 50%;
        margin-left: -16px;
        bottom: ${2 * theme.unit}px;
        background: ${theme.colorBase.box};
        color: var(--color-text-third);
      }
    `}
    padding-left: 0;
    padding-right: 0;
` as (props: BoxProps & { isMobile: boolean | undefined }) => JSX.Element;

export const ContinuousBanxaOrder = ({
  _title,
  // description,
  chainId,
  btnInfo,
  btnInfo2,
  orderId,
}: {
  title: string | JSX.Element;
  chainId: sdk.ChainId;
  orderId: string;
  // description: string | JSX.Element;
  btnInfo?: {
    btnTxt: string;
    callback: () => void;
    isLoading?: boolean;
  };
  btnInfo2?: {
    btnTxt: string;
    callback: () => void;
    isLoading?: boolean;
  };
} & any) => {
  const { isMobile } = useSettings();
  const { t } = useTranslation();
  return (
    <>
      <Box
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDirection={"column"}
      >
        {/*<Typography*/}
        {/*  component={"h3"}*/}
        {/*  variant={"h5"}*/}
        {/*  whiteSpace={"pre"}*/}
        {/*  marginBottom={3}*/}
        {/*  marginTop={-1}*/}
        {/*>*/}
        {/*  {title}*/}
        {/*</Typography>*/}
        <BoxStyle
          className={"way-content"}
          display={"flex"}
          flexDirection={"column"}
          paddingBottom={3}
          isMobile={isMobile}
        >
          <Box marginTop={1.5} component={"div"}>
            <Typography
              component={"h3"}
              variant={"h5"}
              whiteSpace={"pre"}
              marginBottom={3}
              marginTop={-1}
            >
              <Trans i18nKey={"labelYouAlreadyHaveAnBanxa"}>
                You already have an Banxa Order in progress, If you already
                submit the KYC and input bank account, you can keep waiting for
                Banax validation and
                <Link
                  style={{
                    cursor: "pointer",
                    color: "var(--color-primary)",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${BANXA_URLS[chainId]}/status/${orderId}`}
                >
                  check the status on Banxa website
                </Link>
                , otherwise please click Button create new order
              </Trans>
            </Typography>
            <Box
              flex={1}
              height={"100%"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <img
                className="loading-gif"
                alt={"loading"}
                width="60"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>

            <Box marginTop={1.5}>
              <MenuBtnStyled
                variant={"outlined"}
                size={"large"}
                className={`banxaEnter  ${isMobile ? "isMobile" : ""}`}
                fullWidth
                loading={btnInfo?.isLoading ? "true" : "false"}
                disabled={btnInfo?.isLoading}
                endIcon={<BackIcon sx={{ transform: "rotate(180deg)" }} />}
                onClick={(_e) => {
                  btnInfo.callback();
                }}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"inherit"}
                  display={"inline-flex"}
                  alignItems={"center"}
                  lineHeight={"1.2em"}
                  sx={{
                    textIndent: 0,
                    textAlign: "left",
                  }}
                >
                  {btnInfo.btnTxt}
                </Typography>
              </MenuBtnStyled>
            </Box>
          </Box>

          <Box marginTop={1.5}>
            <Typography
              component={"h3"}
              variant={"h5"}
              whiteSpace={"pre"}
              marginBottom={3}
              marginTop={-1}
            >
              {t("labelHaveAnBanxaCancel")}
            </Typography>
            <MenuBtnStyled
              variant={"outlined"}
              size={"large"}
              className={`banxaEnter  ${isMobile ? "isMobile" : ""}`}
              fullWidth
              loading={btnInfo?.isLoading ? "true" : "false"}
              disabled={btnInfo2?.isLoading}
              endIcon={<BackIcon sx={{ transform: "rotate(180deg)" }} />}
              onClick={(_e) => {
                btnInfo2.callback();
              }}
            >
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"inherit"}
                display={"inline-flex"}
                alignItems={"center"}
                lineHeight={"1.2em"}
                sx={{
                  textIndent: 0,
                  textAlign: "left",
                }}
              >
                {btnInfo2.btnTxt}
              </Typography>
            </MenuBtnStyled>
          </Box>
        </BoxStyle>
      </Box>
    </>
  );
};
