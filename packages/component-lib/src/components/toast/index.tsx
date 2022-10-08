import {
  Snackbar,
  Alert,
  AlertTitle,
  Typography,
  SnackbarOrigin,
} from "@mui/material";
import {
  GoodIcon,
  AlertIcon,
  ErrorIcon,
  InfoIcon,
} from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import { withTranslation, WithTranslation } from "react-i18next";

export interface ToastProps {
  open: boolean;
  severity?: "success" | "error" | "warning" | "info";
  alertText: string;
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
    severity = "success",
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
