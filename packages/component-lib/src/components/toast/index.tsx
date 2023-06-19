import {
  Alert,
  AlertTitle,
  Box,
  Snackbar,
  SnackbarOrigin,
  Typography,
} from "@mui/material";
import {
  AlertIcon,
  ErrorIcon,
  GoodIcon,
  InfoIcon,
  SnackbarMessage,
} from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import { withTranslation, WithTranslation } from "react-i18next";
import React from "react";
import { VendorIconItem } from "../tradePanel";

export enum ToastType {
  success = "success",
  error = "error",
  warning = "warning",
  info = "info",
}
export type TOASTOPEN = {
  open: boolean;
  content: JSX.Element | string;
  type: ToastType;
};
export type TOSTOBJECT = {
  toastOpen: TOASTOPEN;
  setToastOpen: (state: TOASTOPEN) => void;
  closeToast: () => void;
};

export interface ToastProps {
  open: boolean;
  severity?: ToastType;
  alertText: string | JSX.Element;
  autoHideDuration?: number;
  onClose: () => void;
  snackbarOrigin?: SnackbarOrigin;
}

const AlertStyled = styled(Alert)`
  svg:first-of-type {
    width: 2rem;
    height: 2rem;
    margin-top: 0.2rem;
  }
`;

export const Toast = withTranslation("common")(
  ({
    t,
    open,
    severity = ToastType.success,
    alertText,
    autoHideDuration = 2000,
    onClose,
    snackbarOrigin,
  }: ToastProps & WithTranslation) => {
    const renderTitle =
      severity === "success"
        ? t("labelSuccessfully")
        : severity === "warning"
        ? t("labelWarning")
        : severity === "error"
        ? t("labelFailure")
        : t("labelPrompt");

    const renderIcon =
      severity === "success" ? (
        <GoodIcon htmlColor={"var(--color-success)"} />
      ) : severity === "warning" ? (
        <AlertIcon htmlColor={"var(--color-warning)"} />
      ) : severity === "error" ? (
        <ErrorIcon htmlColor={"var(--color-error)"} />
      ) : (
        <InfoIcon htmlColor={"var(--color-secondary)"} />
      );

    return (
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={snackbarOrigin}
      >
        <AlertStyled icon={renderIcon} severity={severity}>
          <AlertTitle>{renderTitle}</AlertTitle>
          <Typography variant={"h6"} color={"var(--color-text-secondary)"}>
            {alertText}
          </Typography>
        </AlertStyled>
      </Snackbar>
    );
  }
);

export const NoticeSnack = ({
  messageInfo,
  handleClose,
  open,
  actionEle,
}: {
  open: boolean;
  handleClose: () => void;
  actionEle: JSX.Element;
  messageInfo: SnackbarMessage;
}) => {
  return (
    <Snackbar
      key={messageInfo ? messageInfo.key : undefined}
      open={open}
      autoHideDuration={20000}
      sx={{
        pointerEvents: "all",
        flexDirection: "column",
        top: "80% !important",
        height: "fit-content",
        ".MuiPaper-root": { background: "var(--color-pop-bg)" },
      }}
      onClose={handleClose}
      message={
        <Box display={"flex"} flexDirection={"column"}>
          {messageInfo.svgIcon &&
            VendorIconItem({ svgIcon: messageInfo.svgIcon })}
          <Typography component={"span"} display={"block"} marginY={1}>
            {messageInfo ? messageInfo.message : undefined}
          </Typography>
        </Box>
      }
      action={actionEle}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    />
  );
};
export const NoticePanelSnackBar = ({
  noticeSnacksElEs,
}: {
  noticeSnacksElEs: Array<typeof NoticeSnack>;
}) => {
  return (
    <>
      {noticeSnacksElEs.map((item, index) => {
        return <React.Fragment key={index}>{item}</React.Fragment>;
      })}
    </>
  );
};
