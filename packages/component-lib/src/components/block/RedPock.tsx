import styled from "@emotion/styled";
import { Box, BoxProps, Typography } from "@mui/material";
import React from "react";
import { ModalCloseButton } from "../basic-lib";
import { useTranslation } from "react-i18next";
import { EmptyValueTag } from "@loopring-web/common-resources";

export const RedPockBg = styled(Box)<BoxProps & { imageSrc?: string }>`
  background: #ff5136;
  border-radius: 8px;
  min-width: 288px;
  display: flex;
  flex-direction: column;
  .close-button {
    margin-top: 0;
    z-index: 888;
    .MuiIconButton-root {
      color: var(--color-text-button);
    }
  }
  .bottomEle {
    min-height: 120px;
  }
  .topEle {
    overflow: hidden;
    border-radius: 8px 8px;
    border-bottom-left-radius: 100% 88px;
    border-bottom-right-radius: 100% 88px;
    box-shadow: 0px 4px 0px #f73e22;
    position: relative;
    min-height: 350px;
    width: 100%;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    &::after {
      content: "";
      height: 100%;
      width: 100%;
      display: flex;
      z-index: 99;
      position: absolute;
      background-color: rgba(254, 164, 159, 0.38);
    }
  }
  .betweenEle {
    .open {
      background: #fff7b1;
      display: inline-flex;
      z-index: 100;
      align-items: center;
      justify-content: center;
      position: absolute;
      left: 50%;
      bottom: 0px;
      transform: translate(-50%, 50%);
      width: 88px;
      height: 88px;
      content: "Open";
      font-size: 28px;
      font-weight: 900;
      color: #ff5136;
      //color: ${({ theme }) => theme.colorBase.textButton};
      //text-indent: -9999px;
      border-radius: 100%;
    }
    .clock {
      display: flex;
      z-index: 100;
      align-items: center;
      justify-content: center;
      position: absolute;
      font-size: 28px;
      font-weight: 900;
      transform: translate(-50%, calc(-50% - 16px));
      z-index: 100;
      left: 50%;
      top: -50%;
      .hours,
      .minutes,
      .seconds {
        height: 52px;
        width: 52px;
        background: #fff7b1;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        border-radius: ${({ theme }) => theme.unit + "px"};
        overflow: hidden;
        color: #ff5136;
        h4 {
          text-indent: -9999em;
          height: 0;
          width: 0;
        }
      }
      .hours,
      .minutes {
        position: relative;
        span:after {
          display: block;
          content: ":";
          position: absolute;
          right: -8px;
          top: 0;
        }
      }
    }
  }
` as (props: BoxProps & { imageSrc?: string }) => JSX.Element;

export const RedPock = ({
  content,
  desContent,
  betweenContent,
  onClose,
}: {
  onClose: (e: MouseEvent) => void;
  content: JSX.Element;
  desContent: JSX.Element;
  betweenContent?: JSX.Element;
}) => {
  const { t, ...rest } = useTranslation("common");
  return (
    <RedPockBg>
      <ModalCloseButton onClose={onClose} {...{ ...rest, t }} />
      <Box component={"div"} className={"topEle"}>
        {content}
      </Box>
      <Box position={"relative"} top={0} left={0} className={"betweenEle"}>
        {betweenContent}
      </Box>
      <Box component={"div"} className={"bottomEle"}>
        {desContent}
      </Box>
    </RedPockBg>
  );
};
export const RedPockOpen = ({
  onClose,
}: {
  onClose: (e: MouseEvent) => void;
}) => {
  const content = React.useMemo(() => {
    return <></>;
  }, []);
  const betweenContent = React.useMemo(() => {
    return (
      <>
        <Box display={"flex"} position={"absolute"} className={"open"}>
          OPEN
        </Box>
      </>
    );
  }, []);
  const desContent = React.useMemo(() => {
    return (
      <>
        <Box display={"flex"} position={"absolute"} className={"open"}></Box>
      </>
    );
  }, []);
  return (
    <RedPock
      onClose={onClose}
      content={content}
      desContent={desContent}
      betweenContent={betweenContent}
    />
  );
};
export const RedPockClock = ({
  onClose,
  countDown,
}: {
  onClose: (e: MouseEvent) => void;
  countDown: {
    days: undefined | string;
    hours: undefined | string;
    seconds: undefined | string;
    minutes: undefined | string;
  };
}) => {
  const { t } = useTranslation("common");
  const content = React.useMemo(() => {
    return <></>;
  }, []);
  const betweenContent = React.useMemo(() => {
    return (
      <>
        <Box
          display={"flex"}
          flexDirection={"column"}
          position={"absolute"}
          className={"clock"}
        >
          <Typography
            display={"inline-flex"}
            component={"span"}
            variant={"body1"}
            marginBottom={1}
          >
            {t("labelCountDown")}
          </Typography>
          <Box display={"flex"} flexDirection={"row"} flex={1}>
            <Box
              className={"hours"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              marginRight={2}
            >
              <Typography variant={"h2"} component={"span"} color={"inherit"}>
                {Number(countDown?.hours) >= 0
                  ? countDown?.hours
                  : EmptyValueTag}
              </Typography>
              <Typography
                variant={"h4"}
                color={"var(--color-text-secondary)"}
                marginTop={1}
                style={{ textTransform: "uppercase" }}
              >
                {t("labelHours")}
              </Typography>
            </Box>
            <Box
              className={"minutes"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              marginRight={2}
            >
              <Typography variant={"h2"} component={"span"} color={"inherit"}>
                {Number(countDown?.minutes) >= 0
                  ? countDown?.minutes
                  : EmptyValueTag}
              </Typography>
              <Typography
                variant={"h4"}
                color={"var(--color-text-secondary)"}
                marginTop={1}
                style={{ textTransform: "uppercase" }}
              >
                {t("labelMinutes")}
              </Typography>
            </Box>
            <Box
              className={"seconds"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              marginRight={2}
            >
              <Typography variant={"h2"} component={"span"} color={"inherit"}>
                {Number(countDown?.seconds) >= 0
                  ? countDown?.seconds
                  : EmptyValueTag}
              </Typography>
              <Typography
                variant={"h4"}
                color={"var(--color-text-secondary)"}
                marginTop={1}
                style={{ textTransform: "uppercase" }}
              >
                {t("labelSeconds")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </>
    );
  }, []);
  const desContent = React.useMemo(() => {
    return (
      <>
        <Box display={"flex"} position={"absolute"} className={"open"}></Box>
      </>
    );
  }, []);
  return (
    <RedPock
      onClose={onClose}
      content={content}
      desContent={desContent}
      betweenContent={betweenContent}
    />
  );
};

export const RedPockShared = ({
  onClose,
  countDown,
}: {
  onClose: (e: MouseEvent) => void;
  countDown: {
    days: undefined | string;
    hours: undefined | string;
    seconds: undefined | string;
    minutes: undefined | string;
  };
}) => {
  const { t } = useTranslation("common");
  const content = React.useMemo(() => {
    return <></>;
  }, []);
  const betweenContent = React.useMemo(() => {
    return (
      <>
        <Box
          display={"flex"}
          flexDirection={"column"}
          position={"absolute"}
          className={"clock"}
        >
          <Typography
            display={"inline-flex"}
            component={"span"}
            variant={"body1"}
            marginBottom={1}
          >
            {t("labelCountDown")}
          </Typography>
          <Box display={"flex"} flexDirection={"row"} flex={1}>
            <Box
              className={"hours"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              marginRight={2}
            >
              <Typography variant={"h2"} component={"span"} color={"inherit"}>
                {Number(countDown?.hours) >= 0
                  ? countDown?.hours
                  : EmptyValueTag}
              </Typography>
              <Typography
                variant={"h4"}
                color={"var(--color-text-secondary)"}
                marginTop={1}
                style={{ textTransform: "uppercase" }}
              >
                {t("labelHours")}
              </Typography>
            </Box>
            <Box
              className={"minutes"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              marginRight={2}
            >
              <Typography variant={"h2"} component={"span"} color={"inherit"}>
                {Number(countDown?.minutes) >= 0
                  ? countDown?.minutes
                  : EmptyValueTag}
              </Typography>
              <Typography
                variant={"h4"}
                color={"var(--color-text-secondary)"}
                marginTop={1}
                style={{ textTransform: "uppercase" }}
              >
                {t("labelMinutes")}
              </Typography>
            </Box>
            <Box
              className={"seconds"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              marginRight={2}
            >
              <Typography variant={"h2"} component={"span"} color={"inherit"}>
                {Number(countDown?.seconds) >= 0
                  ? countDown?.seconds
                  : EmptyValueTag}
              </Typography>
              <Typography
                variant={"h4"}
                color={"var(--color-text-secondary)"}
                marginTop={1}
                style={{ textTransform: "uppercase" }}
              >
                {t("labelSeconds")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </>
    );
  }, []);
  const desContent = React.useMemo(() => {
    return <></>;
  }, []);
  return (
    <RedPock
      onClose={onClose}
      content={content}
      desContent={desContent}
      betweenContent={betweenContent}
    />
  );
};
