import styled from "@emotion/styled";
import {
  Box,
  BoxProps,
  Button,
  Divider,
  Link,
  Typography,
} from "@mui/material";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Account,
  EmptyValueTag,
  FirstPlaceIcon,
  getShortAddr,
  RedPacketColorConfig,
  RedPacketCssColorConfig,
  RedPacketOpenWrapSVG,
  RedPacketQRCodeSvg,
  RedPacketWrapSVG,
  SoursURL,
} from "@loopring-web/common-resources";
import QRCode from "qrcode-svg";
import * as sdk from "@loopring-web/loopring-sdk";
import { RedPacketViewStep } from "../modal";
import { ModalStatePlayLoad } from "../../stores";
import moment from "moment";
import {
  RedPacketClockProps,
  RedPacketDefault,
  RedPacketDefaultBg,
  RedPacketDetailLimit,
  RedPacketDetailProps,
  RedPacketOpenedProps,
  RedPacketOpenProps,
  RedPacketQRCodeProps,
  RedPacketTimeoutProps,
  RedPacketUnreadyProps,
} from "./Interface";
import { TablePagination } from "../basic-lib";
import { LuckyTokenItemStatus } from "@loopring-web/loopring-sdk";

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

        cursor: pointer;
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

      .open.openUnready {
        background: url("${SoursURL}/images/redpacketLock.webp") center
          no-repeat;
        color: ${({ type }) =>
          RedPacketCssColorConfig[type]?.colorTop}; //#7c3400;
        width: 76px;
        height: 76px;
        background-size: contain;
        border-radius: initial;
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
      color: ${({ type }) => RedPacketCssColorConfig[type]?.primaryColor};
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

  &.redPacketOpened {
    .top {
      color: ${({ type }) => RedPacketCssColorConfig[type]?.highLightColor};
    }
  }

  //&.redPacketOpened {
  //  .content {
  //
  //  }
  //}
` as (props: BoxProps & { imageSrc?: string; type: string }) => JSX.Element;

export const BoxClaim = styled(Box)`
  &.self {
    //background-color: var(--field-opacity);
  }
` as typeof Box;

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
  const scale = RedPacketSize[size].width / 260;

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
        display={"flex"}
        justifyContent={"center"}
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
        height={RedPacketSize["middle"].height}
        width={RedPacketSize["middle"].width}
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
  const scale = RedPacketSize[size].width / 260;

  return (
    <RedPacketBg
      type={type}
      sx={{
        transform: `scale(${scale})`,
      }}
    >
      <Box
        position={"absolute"}
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={100}
        display={"flex"}
        justifyContent={"center"}
      >
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
        height={RedPacketSize["middle"].height}
      >
        {content}
      </Box>
    </RedPacketBg>
  );
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
      <Box display={"flex"} flex={1} onClick={onOpen} flexDirection={"column"}>
        <Box display={"flex"} className={"betweenEle"} position={"absolute"}>
          <Box display={"flex"} position={"absolute"} className={"open"}>
            {t("labelOpen")}
          </Box>
        </Box>
        <Box display={"flex"} className={"top"} flexDirection={"column"}>
          <Typography color={"inherit"}>{sender}</Typography>
        </Box>
        <Box display={"flex"} className={"middle"} flexDirection={"column"}>
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
          {viewDetail && (
            <Link
              className={"viewDetail"}
              whiteSpace={"pre-line"}
              color={"inherit"}
              variant={"body1"}
              onClick={(e) => {
                e.stopPropagation();
                viewDetail();
              }}
            >
              {t("labelLuckyRedPacketDetail")}
            </Link>
          )}
        </Box>
      </Box>
    );
  }, [size, sender, amountStr, memo, viewDetail, onOpen]);

  return <RedPacketBgDefault type={type} size={size} content={content} />;
};

export const RedPacketClock = ({
  type = "default",
  size,
  validSince,
  sender,
  amountStr,
  memo,
  showRedPacket,
}: RedPacketDefault & RedPacketClockProps) => {
  const { t } = useTranslation("common");
  const anchorRef = React.useRef();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [countDown, setCountDown] =
    React.useState<{
      days: undefined | string;
      hours: undefined | string;
      seconds: undefined | string;
      minutes: undefined | string;
    }>();
  const calculateTimeLeft = React.useCallback((validSince: number) => {
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
    }
    let difference = +new Date(validSince).getTime() - Date.now();
    if (difference > 0) {
      setCountDown({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString(),
        hours: (
          "0" + Math.floor((difference / (1000 * 60 * 60)) % 24).toString()
        ).slice(-2),
        minutes: (
          "0" + Math.floor((difference / 1000 / 60) % 60).toString()
        ).slice(-2),
        seconds: ("0" + Math.floor((difference / 1000) % 60).toString()).slice(
          -2
        ),
      });
      nodeTimer.current = setTimeout(() => calculateTimeLeft(validSince), 1000);
    } else {
      showRedPacket();
    }
  }, []);
  React.useEffect(() => {
    calculateTimeLeft(validSince);
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
      }
    };
  }, [validSince]);

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
            <Box
              display={"flex"}
              flexDirection={"row"}
              flex={1}
              ref={anchorRef}
            >
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
        <Box display={"flex"} className={"top"} flexDirection={"column"}>
          <Typography color={"inherit"}>{sender}</Typography>
        </Box>
        <Box display={"flex"} className={"middle"} flexDirection={"column"}>
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
      </>
    );
  }, [countDown]);
  return <RedPacketBgDefault type={type} size={size} content={content} />;
};

export const RedPacketUnready = ({
  type = "default",
  size,
  sender,
  validSince,
  amountStr,
  memo,
}: RedPacketDefault & RedPacketUnreadyProps) => {
  const { t } = useTranslation();
  const content = React.useMemo(() => {
    return (
      <Box display={"flex"} flex={1} flexDirection={"column"}>
        <Box display={"flex"} className={"betweenEle"} position={"absolute"}>
          <Box
            display={"flex"}
            position={"absolute"}
            className={"open openUnready"}
          >
            {t("labelSeal")}
          </Box>
        </Box>
        <Box display={"flex"} className={"top"} flexDirection={"column"}>
          <Typography color={"inherit"}>{sender}</Typography>
        </Box>
        <Box
          display={"flex"}
          className={"middle"}
          flexDirection={"column"}
          position={"relative"}
        >
          <Typography
            color={"inherit"}
            position={"absolute"}
            marginTop={3}
            top={0}
          >
            {t("labelOpenAfter", {
              time: moment(validSince).fromNow(),
            })}
          </Typography>
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
      </Box>
    );
  }, [size, sender, amountStr, memo]);

  return <RedPacketBgDefault type={type} size={size} content={content} />;
};

export const RedPacketOpened = ({
  type = "default",
  sender,
  memo,
  myAmountStr,
  amountStr,
  viewDetail,
}: RedPacketDefault & RedPacketOpenedProps) => {
  const { t } = useTranslation("common");
  const content = React.useMemo(() => {
    return (
      <Box display={"flex"} flex={1} flexDirection={"column"}>
        <Box display={"flex"} className={"top"} flexDirection={"column"}>
          <Typography
            variant={"h5"}
            color={RedPacketCssColorConfig[type].highLightColor}
          >
            {t("labelRedPacketReceived")}
          </Typography>
          <Typography
            variant={"h4"}
            color={RedPacketCssColorConfig[type].highLightColor}
          >
            {myAmountStr ? myAmountStr : EmptyValueTag}
          </Typography>
          <Typography
            variant={"body2"}
            color={RedPacketCssColorConfig[type].highLightColor}
          >
            {t("labelTotalRedPacket", { value: amountStr })}
          </Typography>
        </Box>
        <Box display={"flex"} className={"middle"} flexDirection={"column"}>
          <Typography color={"inherit"}>{sender}</Typography>
          <Typography
            variant={"body2"}
            color={"inherit"}
            whiteSpace={"pre-line"}
            textAlign={"center"}
            marginTop={1 / 2}
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
            onClick={(e) => {
              e.stopPropagation();
              viewDetail();
            }}
          >
            {t("labelLuckyRedPacketDetail")}
          </Link>
        </Box>
      </Box>
    );
  }, []);
  return <RedPacketBgOpened type={type} content={content} />;
};

export const RedPacketDetailStyled = styled(Box)`
  border-radius: ${({ theme }) => theme.unit}px;
  background-color: var(--color-box);
` as typeof Box;

export const RedPacketTimeout = ({
  type = "default",
  size = "middle",
  sender,
  memo,
  viewDetail,
}: RedPacketTimeoutProps) => {
  const scale = RedPacketSize[size].width / 260;
  const { t } = useTranslation("common");
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
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"stretch"}
        // alignItems={"s"}
        height={RedPacketSize["middle"].height}
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
          {viewDetail && (
            <Link
              className={"viewDetail"}
              whiteSpace={"pre-line"}
              color={"inherit"}
              variant={"body1"}
              onClick={(e) => {
                e.stopPropagation();
                viewDetail();
              }}
            >
              {t("labelLuckyRedPacketDetail")}
            </Link>
          )}
        </Box>
      </Box>
    </RedPacketBg>
  );
};

const BoxStyle = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .top {
    border-radius: ${({ theme }) => theme.unit}px;
    border-bottom-right-radius: 100%;
    border-bottom-left-radius: 100%;
  }
`;

export const RedPacketDetail = ({
  sender,
  amountStr,
  // _amountClaimStr,
  memo,
  page = 1,
  claimList,
  // detail,
  // detail,
  handlePageChange,
  myAmountStr,
  isShouldSharedRely,
  totalCount,
  remainCount,
  onShared,
  relyNumber,
  relyAmount,
}: RedPacketDetailProps) => {
  const { t } = useTranslation("common");
  const pageNation = React.useMemo(() => {
    if (totalCount - remainCount - RedPacketDetailLimit > 0) {
      return (
        <TablePagination
          page={page}
          pageSize={RedPacketDetailLimit}
          total={totalCount - remainCount}
          onPageChange={handlePageChange}
        />
      );
    } else {
      return <></>;
    }
  }, []);

  return (
    <BoxStyle
      flex={1}
      width={RedPacketSize.large.width}
      height={RedPacketSize.large.height}
      display={"flex"}
      paddingBottom={1}
      flexDirection={"column"}
    >
      <Box
        className={"top"}
        width={"100%"}
        sx={{
          background: RedPacketColorConfig.default.startColor,
          height: "88px",
        }}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography
          variant={"body1"}
          color={RedPacketColorConfig.default.fontColor}
        >
          {t("labelLuckyRedPacket")}
        </Typography>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        marginY={2}
      >
        <Typography variant={"body1"}>{sender}</Typography>
        <Typography
          variant={"body2"}
          color={"textThird"}
          whiteSpace={"pre-line"}
          textAlign={"center"}
          marginTop={1 / 2}
          paddingX={2}
        >
          {memo}
        </Typography>
        <Typography
          variant={"h3"}
          color={RedPacketColorConfig.default.colorTop}
          marginTop={1}
        >
          {myAmountStr ? myAmountStr : EmptyValueTag}
        </Typography>
        <Typography
          variant={"body2"}
          color={RedPacketColorConfig.default.colorTop}
        >
          {t("labelTotalRedPacket", { value: amountStr })}
        </Typography>
      </Box>
      <Divider orientation={"horizontal"} sx={{ borderWidth: 3 }} />
      <Box
        flex={1}
        display={"flex"}
        justifyContent={"stretch"}
        flexDirection={"column"}
      >
        <Typography
          variant={"body1"}
          color={"textThird"}
          marginY={1}
          paddingX={1}
        >
          {t("labelRedPacketReceivedRecord", {
            value: totalCount - remainCount,
            count: totalCount,
          })}
        </Typography>
        <Divider
          orientation={"horizontal"}
          sx={{ borderWidth: 1, paddingX: 1 }}
        />
        <Box flex={1} overflow={"scroll"}>
          {claimList.map((item) => {
            return (
              <BoxClaim
                className={item.isSelf ? "self claim" : "claim"}
                display={"flex"}
                justifyContent={"stretch"}
                flexDirection={"column"}
                paddingY={1}
                paddingX={2}
              >
                <Typography
                  component={"span"}
                  display={"inline-flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Typography
                    variant={"body1"}
                    component={"span"}
                    color={item.isSelf ? "success" : "textPrimary"}
                  >
                    {item.isSelf
                      ? t("labelMyRedPacketReward")
                      : item.accountStr}
                  </Typography>
                  <Typography
                    variant={"body1"}
                    component={"span"}
                    color={"textPrimary"}
                  >
                    {item.amountStr}
                  </Typography>
                </Typography>
                <Typography
                  component={"span"}
                  display={"inline-flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Typography
                    variant={"body2"}
                    component={"span"}
                    color={"textThird"}
                  >
                    {moment(new Date(item.createdAt), "YYYYMMDDHHMM").fromNow()}
                  </Typography>
                  <Typography display={"inline"}>
                    {item.helper && (
                      <Typography
                        component={"span"}
                        color={"var(--color-primary)"}
                        display={"inline-flex"}
                        alignItems={"center"}
                        variant={"body2"}
                      >
                        {item.helper}
                      </Typography>
                    )}
                    {item.isMax && (
                      <Typography
                        component={"span"}
                        color={"var(--color-warning)"}
                        display={"inline-flex"}
                        alignItems={"center"}
                        variant={"body2"}
                        marginLeft={1}
                      >
                        <FirstPlaceIcon
                          fontSize={"medium"}
                          sx={{ paddingRight: 1 / 2 }}
                        />
                        {t("labelLuckDraw")}
                      </Typography>
                    )}
                  </Typography>
                </Typography>
              </BoxClaim>
            );
          })}
        </Box>
        {pageNation}
      </Box>
      {isShouldSharedRely && (
        <Box paddingX={1} display={"flex"} flexDirection={"column"}>
          <Button
            variant={"contained"}
            color={"error"}
            sx={{
              backgroundColor: RedPacketColorConfig.default.colorTop as any,
              "&:hover": {
                backgroundColor: RedPacketColorConfig.default.colorTop as any,
              },
            }}
            fullWidth={true}
            onClick={onShared}
          >
            {t("labelRedPacketGrab")}
          </Button>
          <Typography
            color={"textSecondary"}
            variant={"body2"}
            textAlign={"center"}
            paddingTop={1}
            component={"span"}
          >
            <Trans
              i18nKey={"labelRedpacketHavePeopleHelp"}
              tOptions={{
                number: relyNumber ? relyNumber : EmptyValueTag,
                amount: relyAmount ? relyAmount : EmptyValueTag,
              }}
            >
              have
              <Typography
                variant={"inherit"}
                component={"span"}
                color={RedPacketColorConfig.default.startColor}
              >
                {relyNumber ?? EmptyValueTag}
              </Typography>
              friends help you pick up Redpacket, you extends reward:
              <Typography
                variant={"inherit"}
                component={"span"}
                color={RedPacketColorConfig.default.fontColor}
              >
                {relyAmount ?? EmptyValueTag}
              </Typography>
            </Trans>
          </Typography>
        </Box>
      )}
    </BoxStyle>
  );
};

export const RedPacketPrepare = ({
  chainId,
  account,
  tokenInfo,
  setShowRedPacket,
  claim,
  _type = "default",
  amountStr,
  myAmountStr,
  onOpen,
  ...props
}: {
  chainId: sdk.ChainId;
  account: Account;
  amountStr: string;
  tokenInfo: sdk.TokenInfo;
  claim: string | undefined;
  myAmountStr: string | undefined;
  setShowRedPacket: (
    state: ModalStatePlayLoad & {
      step?: number;
      info?: { [key: string]: any };
    }
  ) => void;
  onOpen: () => void;
  _type?: "official" | "default";
} & sdk.LuckyTokenItemForReceive) => {
  // const { t } = useTranslation("common");
  const _info = props as sdk.LuckyTokenItemForReceive;
  const viewItem = React.useMemo(() => {
    let difference = new Date(_info.validSince).getTime() - Date.now();
    if (claim) {
      return (
        <RedPacketOpened
          {...{
            ...props,
          }}
          type={_type ? _type : "default"}
          amountStr={amountStr}
          myAmountStr={myAmountStr}
          viewDetail={() => {
            setShowRedPacket({
              isShow: true,
              step: RedPacketViewStep.DetailPanel,
              info: _info,
            });
          }}
          sender={
            props?.sender?.ens
              ? props?.sender?.ens
              : getShortAddr(props?.sender?.address)
          }
          memo={props?.info?.memo}
        />
      );
    } else if (difference > 180000) {
      return (
        <RedPacketUnready
          sender={
            props?.sender?.ens
              ? props?.sender?.ens
              : getShortAddr(props?.sender?.address)
          }
          {...props?.info}
          amountStr={amountStr}
          validSince={_info.validSince}
        />
      );
    } else if (difference > 0) {
      return (
        <RedPacketClock
          {...props?.info}
          sender={
            props?.sender?.ens
              ? props?.sender?.ens
              : getShortAddr(props?.sender?.address)
          }
          showRedPacket={() => {
            setShowRedPacket({
              isShow: false,
              step: RedPacketViewStep.OpenPanel,
              info: _info,
            });
          }}
          amountStr={amountStr}
          validSince={_info.validSince}
        />
      );
    } else if (
      // difference + 86400000 < 0 ||
      _info.status == LuckyTokenItemStatus.COMPLETED ||
      _info.status == LuckyTokenItemStatus.OVER_DUE ||
      _info.tokenAmount.remainCount === 0
    ) {
      return (
        <RedPacketTimeout
          {...props?.info}
          sender={
            props?.sender?.ens
              ? props?.sender?.ens
              : getShortAddr(props?.sender?.address)
          }
          // viewDetail={() => {
          //   setShowRedPacket({
          //     isShow: true,
          //     step: RedPacketViewStep.DetailPanel,
          //     info: props,
          //   });
          // }}
        />
      );
    } else {
      return (
        <RedPacketOpen
          {...{
            ...props,
          }}
          type={_type ? _type : "default"}
          amountStr={amountStr}
          // textSendBy={textSendBy}
          // viewDetail={() => {
          //   setShowRedPacket({
          //     isShow: true,
          //     step: RedPacketViewStep.DetailPanel,
          //     info: props,
          //   });
          // }}
          sender={
            props?.sender?.ens
              ? props?.sender?.ens
              : getShortAddr(props?.sender?.address)
          }
          memo={props?.info?.memo}
          onOpen={() => {
            setShowRedPacket({
              isShow: true,
              step: RedPacketViewStep.OpenPanel,
              info: _info,
            });
            onOpen();
          }}
        />
      );
    }
  }, [amountStr, claim, myAmountStr, onOpen, _info]);
  return <Box>{viewItem}</Box>;
};
