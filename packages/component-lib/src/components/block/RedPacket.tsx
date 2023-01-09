import styled from "@emotion/styled";
import { Box, BoxProps, Link, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ColorConfig,
  ColorCssConfig,
  EmptyValueTag,
  RedPacketOpenWrapSVG,
  RedPacketQRCodeSvg,
  RedPacketQRPropsExtends,
  RedPacketWrapSVG,
} from "@loopring-web/common-resources";
import QRCode from "qrcode-svg";

export const RedPacketColorConfig: {
  default: ColorConfig;
  official: ColorConfig;
} = {
  default: {
    colorTop: "#FD7659",
    startColor: "#FC7A5A",
    endColor: "#FF6151",
    bgColor: "#ffffff",
    fontColor: "#FFF7B1",
    btnColor: "#FD7659",
    qrColor: "#FD7659",
  },
  official: {
    colorTop: "#FFD595",
    startColor: "#FFD596",
    endColor: "#FDBD6A",
    bgColor: "#ffffff",
    fontColor: "#A25402",
    btnColor: "#FD7659",
    qrColor: "#A25402",
  },
};
const RedPacketCssColorConfig: {
  default: ColorCssConfig;
  official: ColorCssConfig;
} = {
  default: {
    colorTop: "#FD7659",
    startColor: "#FC7A5A",
    endColor: "#FF6151",
    startBgColor: "#FC7A5A",
    endBgColor: "#930D00",
    startCard: "#FEF4DE",
    endCard: "#FED897",
    line: "#D4B164",
    highLightColor: "#A25402",
    highLightDisableColor: "#A25402",
    primaryColor: "#FFF7B1",
    secondaryColor: "#D09145",
    disableColor: "#7C3400",
  },
  official: {
    colorTop: "#FFD595",
    startColor: "#FFD596",
    endColor: "#FDBD6A",
    startBgColor: "#FFD595",
    endBgColor: "#934F00",
    startCard: "#FEF4DE",
    endCard: "#FED897",
    line: "#D4B164",
    highLightColor: "#A25402",
    highLightDisableColor: "#A25402",
    primaryColor: "#A25402",
    secondaryColor: "#D09145",
    disableColor: "#7C3400",
  },
};
export const RedPacketBg = styled(Box)<
  BoxProps & { imageSrc?: string; type: string }
>`
  display: flex;
  align-items: center;
  position: relative;
  justify-content: center;

  .content {
    color: ${({ type }) => RedPacketCssColorConfig[type]?.primaryColor};

    .betweenEle {
      left: 50%;
      top: 128px;
      position: absolute;

      .open {
        background: #fff7b1;
        color: ${({ type }) =>
          RedPacketCssColorConfig[type]?.highLightColor}; //#7c3400;
        &.disable {
          color: ${({ type }) =>
            RedPacketCssColorConfig[type]?.highLightDisableColor}; //#7c3400;
        }

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

    .secondary {
      color: ${({ type }) => RedPacketCssColorConfig[type]?.secondaryColor};
    }

    .viewDetail {
      color: ${({ type }) => RedPacketCssColorConfig[type]?.primaryColor};

      &:hover {
        text-decoration: underline;
        //color: ${({ type }) => RedPacketCssColorConfig[type]?.secondaryColor};
      }
    }

    .top {
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${({ type }) => RedPacketCssColorConfig[type]?.highLightColor};
    }

    .middle {
      height: 208px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: center;
      heigh: 56px;
    }
  }

  //&.redPacketOpened {
  //  .content {
  //
  //  }
  //}
` as (props: BoxProps & { imageSrc?: string; type: string }) => JSX.Element;

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

export type RedPacketQRCodeProps = {
  url: string;
} & RedPacketQRPropsExtends;
export const RedPacketQRCode = ({
  type = "default",
  url,
  ...rest
}: RedPacketDefault & RedPacketQRCodeProps) => {
  const qrcodeRef = React.createRef<SVGGElement>();
  const ref = React.useRef();
  const [qrCodeG, setQrCodeG] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    setQrCodeG(() => {
      const colorConfig = RedPacketColorConfig[type];
      const qrcode = new QRCode({
        content: url,
        width: 160,
        height: 160,
        color: colorConfig.qrColor, //colorConfig.startColor, // "white",
        background: "white", //"colorConfig.bgColor",//"#FD7659",
        predefined: true,
        padding: 2,
        xmlDeclaration: false,
        // container: "g",
      });

      let qrCodeG = qrcode.svg({ container: "g" });
      qrCodeG = qrCodeG.replace(/qrmodule/g, `qrmodule${type}`);
      var parser = new DOMParser();
      var qrCodeGEle = parser.parseFromString(qrCodeG, "text/xml");
      // @ts-ignore
      return qrCodeGEle.firstChild?.innerHTML ?? "";
    });
  }, [type]);
  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    try {
      // @ts-ignore-start
      const svg: SVGElement = ref.current as SVGElement;
      const w = parseInt(svg.getAttribute("width") ?? "334");
      const h = parseInt(svg.getAttribute("height") ?? "603");
      if (svg && svg.outerHTML) {
        const canvas = document.createElement("canvas");
        const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
        const img_to_download = document.createElement("img");
        img_to_download.src = "data:image/svg+xml;base64," + base64doc;
        img_to_download.onload = function () {
          canvas.setAttribute("width", w.toString());
          canvas.setAttribute("height", h.toString());
          // @ts-ignore
          const context: CanvasRenderingContext2D = canvas.getContext("2d");
          context.drawImage(img_to_download, 0, 0, w, h);
          const dataURL = canvas.toDataURL("image/png");
          // @ts-ignore
          if (window.navigator.msSaveBlob) {
            // @ts-ignore
            window.navigator.msSaveBlob(
              // @ts-ignore
              canvas.msToBlob(),
              "Loopring_Red_Packet.png"
            );
            e.preventDefault();
          } else {
            const a = document.createElement("a");
            const my_evt = new MouseEvent("click");
            a.download = "Loopring_Red_Packet.png";
            a.href = dataURL;
            a.dispatchEvent(my_evt);
          }
          //canvas.parentNode.removeChild(canvas);
        };
      }
      // @ts-ignore-end
    } catch (error) {}
  };
  return (
    <>
      {qrCodeG && (
        <Box onClick={onClick}>
          <RedPacketQRCodeSvg
            ref={ref}
            {...{ ...RedPacketColorConfig[type], ...rest }}
            qrcodeRef={qrcodeRef}
            qrCodeG={qrCodeG}
            type={type}
          />
        </Box>
      )}
    </>
  );
};

export const RedPacketBgDefault = ({
  type = "default",
  size = "middle",
  content,
}: RedPacketDefaultBg & any) => {
  const scale = RedPacketSize[size].height / 414;

  return (
    <RedPacketBg
      type={type}
      sx={{
        transform: `scale(${scale})`,
      }}
    >
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
          {...{ ...RedPacketCssColorConfig[type] }}
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
  const scale = RedPacketSize[size].height / 414;

  return (
    <RedPacketBg
      type={type}
      sx={{
        transform: `scale(${scale})`,
      }}
    >
      <Box position={"absolute"} zIndex={100}>
        <RedPacketOpenWrapSVG
          {...{ ...RedPacketCssColorConfig[type] }}
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
export type RedPacketOpenProps = {
  sender: string;
  amountStr: string;
  memo: string;
  viewDetail: () => void;
  onOpen: () => void;
};

export const RedPacketOpen = ({
  type = "default",
  size,
  sender,
  amountStr,
  memo,
  viewDetail,
  onOpen,
}: RedPacketDefault & RedPacketOpenProps) => {
  const { t } = useTranslation();
  const content = React.useMemo(() => {
    return (
      <Box display={"flex"} flex={1} onClick={onOpen}>
        <Box display={"flex"} className={"betweenEle"} position={"absolute"}>
          <Box display={"flex"} position={"absolute"} className={"open"}>
            {t("labelOpen")}
          </Box>
        </Box>
        <Box display={"flex"} className={"top"} flexDirection={"column"}>
          <Typography
            color={"inherit"}
            paddingTop={1 / 2}
            className={"secondary"}
          >
            {sender}
          </Typography>
          {/*<Typography*/}
          {/*  color={"inherit"}*/}
          {/*  variant={"h4"}*/}
          {/*  className={"timeoutTitle"}*/}
          {/*  whiteSpace={"pre-line"}*/}
          {/*  paddingTop={2}*/}
          {/*  textAlign={"center"}*/}
          {/*>*/}
          {/*  {t("labelLuckyRedPacketTimeout")}*/}
          {/*</Typography>*/}
        </Box>
        <Box display={"flex"} className={"middle"}>
          <Typography
            color={"inherit"}
            variant={"h4"}
            whiteSpace={"pre-line"}
            textAlign={"center"}
            paddingX={2}
            paddingTop={1}
          >
            {amountStr}
          </Typography>
          <Typography
            color={"inherit"}
            variant={"body1"}
            whiteSpace={"pre-line"}
            textAlign={"center"}
            paddingX={2}
          >
            {memo}
          </Typography>
        </Box>
        <Box display={"flex"} className={"footer"}>
          <Link
            className={"viewDetail"}
            whiteSpace={"pre-line"}
            color={"inherit"}
            variant={"body1"}
            onClick={viewDetail}
          >
            {t("labelLuckyRedPacketDetail")}
          </Link>
        </Box>
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
  border-radius: ${({theme}) => theme.unit}px;
  background-color: var(--color-box);
` as typeof Box;

export const RedPacketDetail = () => {
  return <RedPacketDetailStyled/>;
};

export type RedPacketTimeoutProps = RedPacketDefault & {
  sender: string;
  memo: string;
  viewDetail: () => void;
};
export const RedPacketTimeout = ({
                                   type = "default",
                                   size = "middle",
                                   sender,
                                   memo,
                                   viewDetail,
                                 }: RedPacketTimeoutProps) => {
  const scale = RedPacketSize[ size ].height / 414;
  const {t} = useTranslation("common");
  return (
    <RedPacketBg
      sx={{
        transform: `scale(${scale})`,
      }}
      type={type}
      className={"redPacketOpened"}
    >
      <Box position={"absolute"} zIndex={100}>
        <RedPacketOpenWrapSVG
          {...{...RedPacketCssColorConfig[ type ]}}
          height={"100%"}
          width={"100%"}
          type={type}
        />
      </Box>
      <Box
        className={`content content${size}`}
        position={"relative"}
        zIndex={200}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"stretch"}
        // alignItems={"s"}
        height={RedPacketSize[ size ]}
      >
        <Box display={"flex"} className={"top"} flexDirection={"column"}>
          <Typography
            color={"inherit"}
            variant={"h4"}
            className={"timeoutTitle"}
            whiteSpace={"pre-line"}
            paddingTop={2}
            textAlign={"center"}
          >
            {t("labelLuckyRedPacketTimeout")}
          </Typography>
          <Typography paddingTop={1 / 2} className={"secondary"}>
            {sender}
          </Typography>
        </Box>
        <Box display={"flex"} className={"middle"}>
          <Typography
            color={"inherit"}
            variant={"body1"}
            whiteSpace={"pre-line"}
            textAlign={"center"}
            paddingX={2}
          >
            {memo}
          </Typography>
        </Box>
        <Box display={"flex"} className={"footer"}>
          <Link
            className={"viewDetail"}
            whiteSpace={"pre-line"}
            color={"inherit"}
            variant={"body1"}
            onClick={viewDetail}
          >
            {t("labelLuckyRedPacketDetail")}
          </Link>
        </Box>
      </Box>
    </RedPacketBg>
  );
};
