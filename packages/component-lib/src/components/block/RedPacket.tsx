import styled from "@emotion/styled";
import { Box, BoxProps, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  EmptyValueTag,
  RedPacketOpenWrapSVG,
  RedPacketQRCodeSvg,
  // RedPacketOpenWrapSvg,
  RedPacketWrapSVG,
  // RedPacketWrapSvg,
} from "@loopring-web/common-resources";
// .close-button {
//   margin-top: 0;
//   z-index: 888;
// .MuiIconButton-root {
//     color: var(--color-text-button);
//   }
// }

export const RedPacketBg = styled(Box)<BoxProps & { imageSrc?: string }>`
  //background: #ff5136;
  //border-radius: 8px;
  //min-width: 288px;
  //display: flex;
  //flex-direction: column;
  position: relative;

  .content {
    .betweenEle {
      left: 50%;
      top: 128px;
      position: absolute;

      .open {
        background: #fff7b1;
        color: #7c3400;
        display: inline-flex;
        z-index: 100;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        content: "Open";
        font-size: 20px;
        font-weight: 500;
        border-radius: 100%;
        transform: translate(-50%, -50%);
      }

      .clock {
        display: flex;
        z-index: 100;
        align-items: center;
        justify-content: center;
        position: absolute;
        font-size: 28px;
        font-weight: 900;
        transform: translate(-50%, -50%);
        z-index: 100;
        left: 50%;
        top: -50%;

        .hours,
        .minutes,
        .seconds {
          justify-content: center;
          height: 52px;
          width: 52px;
          background: #fff7b1;
          color: #7c3400;
          display: inline-flex;
          align-items: center;
          border-radius: ${({ theme }) => theme.unit + "px"};

          h4 {
            text-indent: -9999em;
            height: 0;
            width: 0;
          }
        }

        .hours,
        .minutes {
          position: relative;

          &:after {
            display: block;
            content: ":";
            position: absolute;
            font-size: 20px;
            right: -12px;
            line-height: 52px;
            top: 0;
          }
        }
      }
    }
  }
` as (props: BoxProps & { imageSrc?: string }) => JSX.Element;
export type RedPacketDefault = {
  type?: "default" | "official";
  size?: "middle" | "large";
};
export type RedPacketDefaultBg = RedPacketDefault & {
  content: JSX.Element;
};
export const RedPacketSize = {
  middle: {
    height: 400,
    width: 260,
  },
  large: {
    height: 600,
    width: 320,
  },
};
export const RedPacketQRCode = ({
  type = "default",
}: RedPacketDefault & any) => {
  const RedPacketColorConfig = {
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
  return (
    <RedPacketQRCodeSvg {...{ ...RedPacketColorConfig[type] }} type={type} />
  );
};
export const RedPacketBgDefault = ({
  type = "default",
  size = "middle",
  content,
}: RedPacketDefaultBg & any) => {
  const RedPacketColorConfig = {
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
  const scale = 414 / RedPacketSize[size].height;
  return (
    <RedPacketBg>
      <Box
        className={"bg"}
        position={"absolute"}
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={100}
      >
        <RedPacketWrapSVG
          {...{ ...RedPacketColorConfig[type] }}
          style={{ transform: `scale(${scale})` }}
          height={"100%"}
          width={"100%"}
          type={type}
          // height={RedPacketSize[size].height}
          // width={RedPacketSize[size].width}
        />
      </Box>
      <Box
        className={`content content${size}`}
        position={"relative"}
        zIndex={200}
        height={RedPacketSize[size].height}
        width={RedPacketSize[size].width}
      >
        {content}
      </Box>
    </RedPacketBg>
  );
};
export const RedPacketBgOpened = ({
  type = "default",
  size = "middle",
  content,
}: RedPacketDefaultBg & any) => {
  const scale = 414 / RedPacketSize[size].height;

  const RedPacketColorConfig = {
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
    <RedPacketBg>
      <Box position={"absolute"} zIndex={100}>
        <RedPacketOpenWrapSVG
          {...{ ...RedPacketColorConfig[type] }}
          style={{ transform: `scale(${scale})` }}
          height={"100%"}
          width={"100%"}
          type={type}
        />
      </Box>
      <Box
        className={`content content${size}`}
        position={"relative"}
        zIndex={200}
        height={RedPacketSize[size]}
      >
        {content}
      </Box>
    </RedPacketBg>
  );
};

export const RedPacketOpen = ({
  type = "default",
  size,
}: RedPacketDefault & any) => {
  const { t } = useTranslation();
  const content = React.useMemo(() => {
    return (
      <Box display={"flex"} flex={1}>
        <Box display={"flex"} className={"betweenEle"} position={"absolute"}>
          <Box display={"flex"} position={"absolute"} className={"open"}>
            {t("labelOpen")}
          </Box>
        </Box>
        <Box display={"flex"}></Box>

        <Box></Box>
      </Box>
    );
  }, []);

  return <RedPacketBgDefault type={type} size={size} content={content} />;
};

export const RedPacketClock = ({
  type = "default",
  countDown,
}: RedPacketDefault & {
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
        <Box display={"flex"} className={"betweenEle"} position={"absolute"}>
          <Box
            display={"flex"}
            flexDirection={"column"}
            position={"absolute"}
            className={"clock"}
          >
            <Typography
              display={"none"}
              component={"span"}
              variant={"body1"}
              // marginBottom={1}
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
                  display={"none"}
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
                  display={"none"}
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
              >
                <Typography variant={"h2"} component={"span"} color={"inherit"}>
                  {Number(countDown?.seconds) >= 0
                    ? countDown?.seconds
                    : EmptyValueTag}
                </Typography>
                <Typography
                  variant={"h4"}
                  color={"var(--color-text-secondary)"}
                  display={"none"}
                  style={{ textTransform: "uppercase" }}
                >
                  {t("labelSeconds")}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );
  }, []);
  return <RedPacketBgDefault type={type} content={content} />;
};
export const RedPacketHistory = ({
  type = "default",
}: RedPacketDefault & any) => {
  const { t } = useTranslation("common");
  const content = React.useMemo(() => {
    return <>{t("official")}</>;
  }, []);
  return <RedPacketBgOpened type={type} content={content} />;
};

export const RedPacketDetailStyled = styled(Box)`
  border-radius: ${({ theme }) => theme.unit}px;
  background-color: var(--color-box);
`;

export const RedPacketDetail = () => {
  return <RedPacketDetailStyled></RedPacketDetailStyled>;
};

// export const RedPacketCard = withTranslation()(() => {});
// export const RedPacketQRCode = ({
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
//     <RedPacket
//       onClose={onClose}
//       content={content}
//       desContent={desContent}
//       betweenContent={betweenContent}
//     />
//   );
// };

// export const RedPacketCard = withTranslation()(
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
//       textColor: `var(--color-redPacket-text${type.scope})`,
//       background: `var(--color-redPacket${type.scope})`,
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
//           sx={{ border: "var(--color-redPacket-Border)" }}
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
