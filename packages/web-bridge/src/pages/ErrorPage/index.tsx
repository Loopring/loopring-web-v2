import { Trans, useTranslation } from "react-i18next";
import { Box, Container, Link, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { ErrorObject } from "@loopring-web/common-resources";
import { getContactInfo } from "@loopring-web/core";

const StyleBox = styled(Box)`
  background-image: url("https://static.loopring.io/assets/images/error_bg.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: bottom;
  white-space: pre-wrap;
  //h2{
  //  position: relative;
  //}
` as typeof Box;

export const ErrorPage = ({ messageKey }: ErrorObject) => {
  // const {messageKey}: { id?:string,messageKey:string } = {messageKey: 'errorMessageTokenMapIsEmpty'};
  const { t } = useTranslation("error");
  const message = `labelConnectUs`;
  return (
    <>
      <Container style={{ flex: 1 }}>
        {/*style={{height: '100%' }}*/}
        <StyleBox
          flex={1}
          display={"flex"}
          alignItems={"flex-start"}
          justifyContent={"center"}
          flexDirection={"column"}
          marginTop={4}
          height={680}
          maxWidth={1200}
        >
          {/*<StyleBox>*/}
          <Box textAlign={"center"} position={"relative"} left={128} top={-64}>
            <Typography component={"h2"} variant={"h3"}>
              {t(messageKey)}
            </Typography>
            <Typography
              marginY={2}
              component={"p"}
              variant={"body1"}
              color={"textSecondary"}
            >
              <Trans i18nKey={message}>
                If you believe this is indeed a bug, please
                <Link
                  component={"a"}
                  onClick={(e) => {
                    window.location.href = getContactInfo();
                    e.preventDefault();
                  }}
                >
                  contact us
                </Link>
                <br /> We would appreciate your feedback
              </Trans>
              {/*{t(message)}*/}
              {/*{t(messageKey)}*/}
            </Typography>
          </Box>
          {/*</StyleBox>*/}
        </StyleBox>
      </Container>

      {/*<Footer></Footer>*/}
    </>
  );
};
