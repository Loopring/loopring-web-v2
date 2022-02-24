import { WithTranslation, withTranslation } from "react-i18next";
import QRCode from "qrcode.react";
import styled from "@emotion/styled";
import { Box, Modal, Typography } from "@mui/material";
import { ModalQRCodeProps, QRCodeProps } from "./Interface";
import { ModalCloseButton } from "../../basic-lib";

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

export const QRCodePanel = ({
  size = 160,
  title,
  description,
  url = "https://exchange.loopring.io/",
}: // handleClick
QRCodeProps) => {
  if (url === undefined) {
    url = "";
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
      <QRCode
        value={url}
        size={size}
        style={{ padding: 8, backgroundColor: "#fff" }}
        aria-label={`link:${url}`}
      />
      {description && (
        <Typography variant={"body1"} marginBottom={3} marginTop={1}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export const ModalQRCode = withTranslation("common")(
  ({ onClose, open, t, ...rest }: ModalQRCodeProps & WithTranslation) => {
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
          className={rest.className}
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
