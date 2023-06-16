import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Box, Modal, Typography } from "@mui/material";
import { ModalQRCodeProps, QRCodePanelProps } from "./Interface";
import { ModalCloseButton } from "../../basic-lib";
import QRCodeStyling from "qr-code-styling";
import { SoursURL } from "@loopring-web/common-resources";
import React from "react";

const ModalContentStyled = styled(Box)`
  & > div {
    background: var(--color-pop-bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--modal-width);
  }
  &.guardianPop .content {
    padding-top: ${({ theme }) => 5 * theme.unit}px;
    border-radius: ${({ theme }) => theme.unit}px;
  }
`;

export type QCodeProps = {
  url: string;
  size?: number;
  fgColor1?: string;
  fgColor2?: string;
  bgColor?: string;
  imageInfo?: { imageSrc?: string; size?: number };
};
export const QRCode = ({
  size = 160,
  fgColor1 = "var(--color-primary)",
  fgColor2 = "#000",
  bgColor = "#fff",
  url = "https://exchange.loopring.io/",
  imageInfo = {
    imageSrc: `${SoursURL + "svg/loopring.svg"}`,
    size: 40,
  },
}: QCodeProps & QRCodePanelProps) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (url) {
      const qrCode = new QRCodeStyling({
        type: "svg",
        data: url,
        width: size,
        height: size,
        image: imageInfo.imageSrc,
        dotsOptions: {
          gradient: {
            rotation: 45,
            type: 'linear',
            colorStops: [{
              offset: 0,
              color: fgColor1,
            },
            {
              offset: 1,
              color: fgColor2
            }
          ]
          },
          type: "dots",
        },
        backgroundOptions: {
          color: bgColor,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 8,
        },
        cornersSquareOptions: {
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          type: 'square'
        }
      });
      if (ref.current) {
        const boxRef = ref.current as any
        while( boxRef.hasChildNodes() ){
          boxRef.removeChild(boxRef.lastChild);
        }
      }
      qrCode.append(ref.current)
    }
  }, [url]);
  return <Box ref={ref} />;
};
export const QRCodePanel = ({
  title,
  description,
  ...rest
}: // imageSettings = {
//   height: 80,
//   width: 80,
//   src: `${SoursURL + "svg/loopring.svg"}`,
// },
// handleClick
QCodeProps & QRCodePanelProps) => {
  if (rest.url === undefined) {
    rest.url = "";
  }
  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flexDirection={"column"}
    >
      {title && (
        <Typography
          variant={"h4"}
          component="h3"
          className="modalTitle"
          marginBottom={3}
        >
          {title}
        </Typography>
      )}
      <QRCode {...rest} />
      {description && (
        <Typography variant={"body1"} marginBottom={3} marginTop={1}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export const ModalQRCode = withTranslation("common")(
  ({
    onClose,
    open,
    t,
    ...rest
  }: QCodeProps & ModalQRCodeProps & WithTranslation) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalContentStyled
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          className={rest?.className}
        >
          <Box
            className={"content"}
            paddingTop={3}
            paddingBottom={3}
            display={"flex"}
            flexDirection={"column"}
          >
            <ModalCloseButton onClose={onClose} {...{ ...rest, t }} />
            <QRCodePanel {...{ ...rest, t }} />
          </Box>
        </ModalContentStyled>
      </Modal>
    );
  }
);
