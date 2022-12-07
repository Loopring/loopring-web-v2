import styled from "@emotion/styled";
import { Box, BoxProps, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  EmptyValueTag,
  RedPockOpenWrapSVG,
  RedPockQRCodeSvg,
  // RedPockOpenWrapSvg,
  RedPockWrapSVG,
  // RedPockWrapSvg,
} from "@loopring-web/common-resources";
// .close-button {
//   margin-top: 0;
//   z-index: 888;
// .MuiIconButton-root {
//     color: var(--color-text-button);
//   }
// }

export const RedPockBg = styled(Box)<BoxProps & { imageSrc?: string }>`
  //background: #ff5136;
  //border-radius: 8px;
  //min-width: 288px;
  //display: flex;
  //flex-direction: column;
  position: relative;
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
export type RedPockDefault = {
  type?: "default" | "official";
  size?: "middle" | "large";
};
export type RedPockDefaultBg = RedPockDefault & {
  content: JSX.Element;
};
export const RedPockSize = {
  middle: {
    height: 400,
    width: 260,
  },
  large: {
    height: 600,
    width: 320,
  },
};
export const RedPockQRCode = ({ type = "default" }: RedPockDefault & any) => {
  const RedPockColorConfig = {
    default: {
      colorTop: "#FD7659",
      startColor: "#FC7A5A",
      endColor: "#FF6151",
      bgColor: "#ffffff",
      fontColor: "#FFF7B1",
      btnColor: "#FD7659",
    },
    official: {
      colorTop: "#FFD595",
      startColor: "#FFD596",
      endColor: "#FDBD6A",
      bgColor: "#ffffff",
      fontColor: "#A25402",
      btnColor: "#FD7659",
    },
  };
  return <RedPockQRCodeSvg {...{ ...RedPockColorConfig[type] }} type={type} />;
};
export const RedPockBgDefault = ({
  type = "default",
  size = "middle",
  content,
}: RedPockDefaultBg & any) => {
  const RedPockColorConfig = {
    default: {
      colorTop: "#FD7659",
      startColor: "#FC7A5A",
      endColor: "#FF6151",
    },
    official: {
      colorTop: "#FFD595",
      startColor: "#FFD596",
      endColor: "#FDBD6A",
    },
  };
  const scale = 414 / RedPockSize[size].height;
  return (
    <RedPockBg>
      <Box
        className={"bg"}
        position={"absolute"}
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={100}
      >
        <RedPockWrapSVG
          {...{ ...RedPockColorConfig[type] }}
          style={{ transform: `scale(${scale})` }}
          height={"100%"}
          width={"100%"}
          type={type}
          // height={RedPockSize[size].height}
          // width={RedPockSize[size].width}
        />
      </Box>
      <Box
        position={"relative"}
        zIndex={200}
        height={RedPockSize[size].height}
        width={RedPockSize[size].width}
      >
        {content}
      </Box>
    </RedPockBg>
  );
};
export const RedPockBgOpened = ({
  type = "default",
  size = "middle",
  content,
}: RedPockDefaultBg & any) => {
  const scale = 414 / RedPockSize[size].height;

  const RedPockColorConfig = {
    default: {
      colorTop: "#FFD596",
      startColor: "#FC7A5A",
      endColor: "#FF6151",
      startBgColor: "#FC7A5A",
      endBgColor: "#930D00",
      startCard: "#FEF4DE",
      endCard: "#FED897",
      line: "#D4B164",
    },
    official: {
      colorTop: "#FFD595",
      startColor: "#FFD596",
      endColor: "#FFD596",
      startBgColor: "#FFD595",
      endBgColor: "#934F00",
      startCard: "#FEF4DE",
      endCard: "#FED897",
      line: "#D4B164",
    },
  };
  return (
    <RedPockBg>
      <Box position={"absolute"} zIndex={100}>
        <RedPockOpenWrapSVG
          {...{ ...RedPockColorConfig[type] }}
          style={{ transform: `scale(${scale})` }}
          height={"100%"}
          width={"100%"}
          type={type}
        />
      </Box>
      <Box position={"relative"} zIndex={200} height={RedPockSize[size]}>
        {content}
      </Box>
    </RedPockBg>
  );
};

export const RedPockOpen = ({ type = "default" }: RedPockDefault & any) => {
  const content = React.useMemo(() => {
    return (
      <Box display={"flex"} position={"absolute"} className={"open"}>
        OPEN
      </Box>
    );
  }, []);

  return <RedPockBgDefault type={type} content={content} />;
};
export const RedPockClock = ({
  type = "default",
  countDown,
}: RedPockDefault & {
  countDown: {
    days: undefined | string;
    hours: undefined | string;
    seconds: undefined | string;
    minutes: undefined | string;
  };
}) => {
  const { t } = useTranslation("common");
  const content = React.useMemo(() => {
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
  return <RedPockBgDefault type={type} content={content} />;
};
export const RedPockHistory = ({ type = "default" }: RedPockDefault & any) => {
  const { t } = useTranslation("common");
  const content = React.useMemo(() => {
    return <>{t("official")}</>;
  }, []);
  return <RedPockBgOpened type={type} content={content} />;
};

// export const RedPockCard = withTranslation()(() => {});
// export const RedPockQRCode = ({
//   onClose,
//   countDown,
// }: {
//   onClose: (e: MouseEvent) => void;
//   countDown: {
//     days: undefined | string;
//     hours: undefined | string;
//     seconds: undefined | string;
//     minutes: undefined | string;
//   };
// }) => {
//   const { t } = useTranslation("common");
//   const content = React.useMemo(() => {
//     return <></>;
//   }, []);
//   const betweenContent = React.useMemo(() => {
//     return <></>;
//   }, []);
//   const desContent = React.useMemo(() => {
//     return <></>;
//   }, []);
//   return (
//     <RedPock
//       onClose={onClose}
//       content={content}
//       desContent={desContent}
//       betweenContent={betweenContent}
//     />
//   );
// };

// export const RedPockCard = withTranslation()(
//   ({
//     t,
//     luckyTokenItem: {
//       hash,
//       sender,
//       champion,
//       tokenId,
//       tokenAmount,
//       type,
//       status,
//       validSince,
//       validUntil,
//       info,
//       templateNo,
//       createdAt,
//     },
//     idIndex,
//     tokenMap,
//   }: {
//     luckyTokenItem: sdk.LuckyTokenItemForReceive;
//     idIndex: { [key: string]: string };
//     tokenMap: { [key: string]: any };
//   } & WithTranslation) => {
//     const color = {
//       textColor: `var(--color-redPock-text${type.scope})`,
//       background: `var(--color-redPock${type.scope})`,
//     };
//     const luckToken = tokenMap[idIndex[tokenId]];
//     return (
//       <Box
//         display={"flex"}
//         borderRadius={1}
//         height={114}
//         paddingX={1}
//         paddingY={1}
//         flexDirection={"column"}
//         width={"100%"}
//         sx={{ background: color.background }}
//       >
//         <Typography
//           paddingX={1}
//           paddingTop={1}
//           variant={"h4"}
//           fontWeight={"900"}
//           color={color.textColor}
//         >
//           {`${getValuePrecisionThousand(
//             // @ts-ignore
//             sdk.toBig(tokenAmount.totalAmount).div("1e" + luckToken.decimals),
//             luckToken.decimals,
//             luckToken.decimals,
//             luckToken.decimals,
//             false
//           )} ${luckToken.symbol}`}
//         </Typography>
//         <Typography
//           paddingX={1}
//           textOverflow={"ellipsis"}
//           sx={{
//             overflow: "hidden",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
//             wordBreak: "break-all",
//           }}
//           whiteSpace={"pre-line"}
//           variant={"body1"}
//           display={"-webkit-box"}
//           color={color.textColor}
//           height={"3em"}
//         >
//           {info?.memo ?? t("labelLuckTokenDefaultTitle")}
//         </Typography>
//         <Divider
//           sx={{ border: "var(--color-redPock-Border)" }}
//           orientation={"horizontal"}
//         />
//         <Typography
//           variant={"body2"}
//           paddingX={1}
//           display={"flex"}
//           flexDirection={"row"}
//           color={color.textColor}
//           sx={{ opacity: 0.7 }}
//           justifyContent={"space-between"}
//         >
//           <Typography variant={"inherit"} color={"inherit"}>
//             {moment(validSince).format(`${DAY_FORMAT} ${MINUTE_FORMAT}`)}
//           </Typography>
//           <Typography variant={"inherit"} color={"inherit"}>
//             {sender.ens ? sender.ens : getShortAddr(sender.address)}
//           </Typography>
//         </Typography>
//       </Box>
//     );
//   }
// );
