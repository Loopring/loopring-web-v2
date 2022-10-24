import styled from "@emotion/styled";
import { Box, BoxProps } from "@mui/material";
import React from "react";

export const RedPockBg = styled(Box)<BoxProps & { imageSrc?: string }>`
  background: #ff5136;
  border-radius: 8px;
  min-width: 288px;
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
  }
` as (props: BoxProps & { imageSrc?: string }) => JSX.Element;

export const RedPock = ({
  content,
  desContent,
  betweenContent,
}: {
  content: JSX.Element;
  desContent: JSX.Element;
  betweenContent?: JSX.Element;
}) => {
  return (
    <RedPockBg>
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
export const RedPockOpen = () => {
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
      content={content}
      desContent={desContent}
      betweenContent={betweenContent}
    />
  );
};
