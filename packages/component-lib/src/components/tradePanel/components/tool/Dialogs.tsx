import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  Link,
  List,
  ListItem,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";

import { Trans, WithTranslation, withTranslation } from "react-i18next";
import {
  Button,
  CoinIcon,
  ModalCloseButton,
  TextField,
} from "../../../basic-lib";
import React from "react";
import { ConnectProviders } from "@loopring-web/web3-provider";
import styled from "@emotion/styled";
import { useOpenModals, useSettings } from "../../../../stores";

import {
  Account,
  Bridge,
  CheckBoxIcon,
  CheckedIcon,
  copyToClipBoard,
  getValuePrecisionThousand,
  Info2Icon,
  SoursURL,
  TradeDefi,
  TradeProType,
} from "@loopring-web/common-resources";
import { useHistory, useLocation } from "react-router-dom";
import BigNumber from "bignumber.js";
import { modalContentBaseStyle } from "../../../styled";
import * as sdk from "@loopring-web/loopring-sdk";

const ModelStyle = styled(Box)`
  ${({ theme }) => modalContentBaseStyle({ theme: theme })};
  background: ${({ theme }) => theme.colorBase.box};
` as typeof Box;
const DialogStyle = styled(Dialog)`
  &.MuiDialog-root {
    z-index: 1900;
  }

  .MuiList-root {
    list-style: inside;

    .MuiListItem-root {
      display: list-item;
      margin-bottom: ${({ theme }) => theme.unit}px;
      height: auto;
      padding: ${({ theme }) => theme.unit}px 0;
      font-size: ${({ theme }) => theme.fontDefault.body1};
      line-height: 1.5em;
    }
  }

  .MuiDialogContentText-root {
    white-space: pre-line;
  }
`;

export const AlertImpact = withTranslation("common")(
  ({
    t,
    value,
    open,
    handleClose,
    handleConfirm,
  }: WithTranslation & {
    open: boolean;
    value: number;
    handleClose: () => void;
    handleConfirm?: () => void;
  }) => {
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(_e: MouseEvent) => handleClose()}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelImpactTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelImpactExtraGreat"} tOptions={{ value }}>
              Your transaction amount will affect the pool price
              <Typography component={"span"} color={"error"}>
                {<>{value}</>}%
              </Typography>
              . Are you sure to swap?
            </Trans>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(_) => handleClose()}
          >
            {t("labelDisAgreeConfirm")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(_) => {
              handleConfirm && handleConfirm();
            }}
            color={"primary"}
          >
            {t("labelAgreeConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
export const CancelAllOrdersAlert = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    handleCancelAll,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleCancelAll: () => void;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-cancel-all-orders-description"
      >
        <DialogTitle style={{ padding: "2.4rem", paddingBottom: "1.6rem" }}>
          {t("labelCancelAllOrders")}
        </DialogTitle>
        <DialogActions style={{ padding: "2.4rem", paddingTop: 0 }}>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelCancel")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              handleCancelAll();
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
export const CancelOneOrdersAlert = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    handleCancelOne,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleCancelOne: () => Promise<void>;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-cancel-all-orders-description"
      >
        <DialogTitle style={{ padding: "2.4rem", paddingBottom: "1.6rem" }}>
          {t("labelOrderCancelConfirm")}
        </DialogTitle>

        <DialogActions style={{ padding: "2.4rem", paddingTop: 0 }}>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelOrderCancelOrder")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={async (e) => {
              await handleCancelOne();
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
export const AlertNotSupport = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: MouseEvent) => void;
  }) => {
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelNotSupportTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelNotAllowTrade"} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export const GuardianNotSupport = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: MouseEvent) => void;
  }) => {
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelNotSupportTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelWalletToWallet"} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelOK")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export const ConfirmImpact = withTranslation("common")(
  ({
    t,
    value,
    open,
    handleClose,
    handleConfirm,
  }: WithTranslation & {
    open: boolean;
    value: number;
    handleClose: () => void;
    handleConfirm?: () => void;
  }) => {
    const [agree, setAgree] = React.useState("");

    React.useEffect(() => {
      if (!open) {
        setAgree("");
      }
    }, [open]);

    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(_) => handleClose()}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelImpactTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelImpactExtraGreat"} tOptions={{ value }}>
              Your transaction amount will affect the pool price
              <Typography component={"span"} color={"error"}>
                {<>{value}</>}%
              </Typography>
              . Are you sure to swap?
            </Trans>
          </DialogContentText>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelImpactAgree"} tOptions={value} />
          </DialogContentText>
          <TextField
            autoFocus
            value={agree}
            onChange={(event) => {
              setAgree(event.target.value);
            }}
            margin="dense"
            id="agree"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(_) => handleClose()}
          >
            {t("labelDisAgreeConfirm")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(_) => handleConfirm && handleConfirm()}
            disabled={agree.trim() !== "AGREE"}
            color={"primary"}
          >
            {t("labelAgreeConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
export const SmallOrderAlert = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
    handleConfirm,
    estimatedFee,
    feePercentage,
    minimumReceived,
    ...rest
  }: WithTranslation & {
    open: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
    estimatedFee: string;
    feePercentage: string;
    minimumReceived: string;
  }) => {
    const size = 60;
    const { isMobile } = useSettings();
    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModelStyle
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          width={isMobile ? "90%" : "var(--modal-width)"}
        >
          <ModalCloseButton
            onClose={() => {
              handleClose();
            }}
            {...{ ...rest, t }}
          />
          <Box
            flex={1}
            display={"flex"}
            alignItems={"stretch"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            paddingBottom={4}
            width={"100%"}
          >
            <>
              <Box
                marginTop={2}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                flexDirection={"column"}
              >
                <img
                  alt={"warning"}
                  src={SoursURL + "svg/warning.svg"}
                  width={size}
                />
                <Typography
                  marginTop={1}
                  marginBottom={2}
                  textAlign={"center"}
                  variant={"h4"}
                  color={"var(--color-warning)"}
                >
                  {t("labelWarning")}
                </Typography>
              </Box>

              <Box marginTop={3} paddingX={4}>
                <Typography variant={"body1"}>
                  {t("labelSmallOrderAlertLine1")}
                </Typography>
                <Typography variant={"body1"} marginTop={2}>
                  {t("labelSmallOrderAlertLine3")}
                  <Typography
                    component={"span"}
                    color={"var(--color-error)"}
                    paddingLeft={1 / 2}
                  >
                    {estimatedFee}
                  </Typography>
                </Typography>
                <Typography variant={"body1"} marginTop={1}>
                  {t("labelSmallOrderAlertLine4")}
                  <Typography
                    component={"span"}
                    color={"var(--color-error)"}
                    paddingLeft={1 / 2}
                  >
                    {feePercentage}%
                  </Typography>{" "}
                </Typography>
                <Typography variant={"body1"} marginTop={1}>
                  {t("labelSmallOrderAlertLine5")}
                  <Typography
                    component={"span"}
                    color={"var(--color-error)"}
                    paddingLeft={1 / 2}
                  >
                    {minimumReceived}
                  </Typography>
                </Typography>
              </Box>
              <Box display={"flex"} paddingX={4} width={"100%"} marginTop={3}>
                <Button
                  fullWidth
                  variant={"contained"}
                  size={"large"}
                  color={"primary"}
                  onClick={() => handleConfirm()}
                >
                  {t("labelConfirm")}
                </Button>
              </Box>
            </>
          </Box>
        </ModelStyle>
      </Modal>
    );
  }
);
export const SwapSecondConfirmation = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
    handleConfirm,
    fromSymbol,
    fromAmount,
    toSymbol,
    toAmount,
    userTakerRate,
    tradeCostMin,
    estimateFee,
    priceImpactColor,
    priceImpact,
    minimumReceived,
    slippage,
    ...rest
  }: WithTranslation & {
    open: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
    fromSymbol: string;
    fromAmount: string;
    toSymbol: string;
    toAmount: string;
    userTakerRate: string;
    tradeCostMin: string;
    estimateFee: string;
    priceImpactColor: string;
    priceImpact: string;
    minimumReceived: string;
    slippage: string;
  }) => {
    const { isMobile } = useSettings();

    return (
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModelStyle
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          paddingBottom={3}
          width={isMobile ? "90%" : "var(--modal-width)"}
        >
          <ModalCloseButton
            onClose={() => {
              handleClose();
            }}
            {...{ ...rest, t }}
          />
          <Typography variant={"h3"} textAlign={"center"} marginTop={-2}>
            {t("labelSwapSecondConfirmTitle")}
          </Typography>
          <Box className={"content"} display={"flex"} flexDirection={"column"}>
            <Box
              display={"flex"}
              marginTop={5}
              marginBottom={5}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                width={"45%"}
              >
                <CoinIcon symbol={fromSymbol} size={48} />
                <Typography
                  marginTop={2}
                  marginBottom={1}
                  color={"var(--color-text-secondary)"}
                >
                  {t("labelFrom")}
                </Typography>
                <Typography>
                  {fromAmount} {fromSymbol}
                </Typography>
              </Box>
              <Box display={"flex"} justifyContent={"center"} width={"10%"}>
                <Typography variant={"h4"}>{"\u2192"}</Typography>
              </Box>
              <Box
                width={"45%"}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
              >
                <CoinIcon symbol={toSymbol} size={48} />
                <Typography
                  marginTop={2}
                  marginBottom={1}
                  color={"textSecondary"}
                >
                  {t("labelTo")}
                </Typography>
                <Typography>
                  {toAmount} {toSymbol}
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2} paddingX={3}>
              <Grid
                item
                xs={12}
                justifyContent={"space-between"}
                direction={"row"}
                alignItems={"center"}
                display={"flex"}
              >
                <Tooltip
                  title={t("labelSwapFeeTooltips", {
                    rate: userTakerRate,
                    value: tradeCostMin,
                  }).toString()}
                  placement={"top"}
                >
                  <Typography
                    component={"p"}
                    variant="body2"
                    color={"textSecondary"}
                    display={"inline-flex"}
                    alignItems={"center"}
                  >
                    <Info2Icon
                      fontSize={"small"}
                      color={"inherit"}
                      sx={{ marginX: 1 / 2 }}
                    />
                    {t("swapFee")}
                  </Typography>
                </Tooltip>
                <Typography
                  component={"p"}
                  variant="body2"
                  display={"inline-flex"}
                  color={"textPrimary"}
                >
                  {estimateFee}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                justifyContent={"space-between"}
                direction={"row"}
                alignItems={"center"}
                display={"flex"}
              >
                <Tooltip
                  title={t("labelSwapPriceImpactTooltips").toString()}
                  placement={"top"}
                >
                  <Typography
                    component={"p"}
                    variant="body2"
                    color={"textSecondary"}
                    display={"inline-flex"}
                    alignItems={"center"}
                  >
                    <Info2Icon
                      fontSize={"small"}
                      color={"inherit"}
                      sx={{ marginX: 1 / 2 }}
                    />
                    {" " + t("swapPriceImpact")}
                  </Typography>
                </Tooltip>
                <Typography
                  component={"p"}
                  color={priceImpactColor}
                  variant="body2"
                >
                  {priceImpact}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                justifyContent={"space-between"}
                alignItems={"center"}
                display={"flex"}
              >
                <Tooltip
                  title={t("labelSwapMinReceiveTooltips").toString()}
                  placement={"top"}
                >
                  <Typography
                    component={"p"}
                    variant="body2"
                    color={"textSecondary"}
                    display={"inline-flex"}
                    alignItems={"center"}
                  >
                    <Info2Icon
                      fontSize={"small"}
                      color={"inherit"}
                      sx={{ marginX: 1 / 2 }}
                    />
                    {" " + t("swapMinReceive")}
                  </Typography>
                </Tooltip>
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textPrimary"}
                >
                  {minimumReceived}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                justifyContent={"space-between"}
                alignItems={"center"}
                display={"flex"}
              >
                <Tooltip
                  title={t("labelSwapToleranceTooltips").toString()}
                  placement={"top"}
                >
                  <Typography
                    component={"p"}
                    variant="body2"
                    color={"textSecondary"}
                    display={"inline-flex"}
                    alignItems={"center"}
                  >
                    <Info2Icon
                      fontSize={"small"}
                      color={"inherit"}
                      sx={{ marginX: 1 / 2 }}
                    />
                    {" " + t("swapTolerance")}
                  </Typography>
                </Tooltip>
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textPrimary"}
                >
                  {slippage}%
                </Typography>
              </Grid>
            </Grid>
            <Box marginTop={3} paddingX={3} width={"100%"}>
              <Button
                fullWidth
                variant={"contained"}
                size={"large"}
                color={"primary"}
                onClick={() => handleConfirm()}
              >
                {t("labelConfirm")}
              </Button>
            </Box>
          </Box>
        </ModelStyle>
      </Modal>
    );
  }
);
// export const NotAllowForSmartWallet = withTranslation("common", {
//   withRef: true,
// })(
//   ({
//     t,
//     open,
//     handleClose,
//   }: WithTranslation & {
//     open: boolean;
//     handleClose: (event: MouseEvent, isAgree?: boolean) => void;
//   }) => {
//     return (
//       <DialogStyle
//         open={open}
//         keepMounted
//         onClose={(e: MouseEvent) => handleClose(e)}
//         aria-describedby="alert-dialog-slide-description"
//       >
//         <DialogTitle> {t("labelNotAllowForSmartWalletTitle")}</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             <Typography component={"span"} variant={"body1"} color={"inherit"}>
//               {t("labelActivatedAccountNotSupport")}
//             </Typography>
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             variant={"outlined"}
//             size={"medium"}
//             onClick={(e) => handleClose(e as any)}
//           >
//             {t("labelOK")}
//           </Button>
//         </DialogActions>
//       </DialogStyle>
//     );
//   }
// );

export const WrongNetworkGuide = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    return (
      <DialogStyle
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelWrongNetworkGuideTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography component={"span"} variant={"body1"} color={"inherit"}>
              {t("labelWrongNetworkGuide")}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelOK")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);

export const ConfirmLinkCopy = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    handleClose,
    setCopyToastOpen,
  }: WithTranslation & {
    open: boolean;
    setCopyToastOpen: (vale: boolean) => void;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    return (
      <DialogStyle
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          <Typography component={"span"} variant={"h4"} textAlign={"center"}>
            {t("labelOpenInWalletTitle")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography component={"span"} variant={"body1"} color={"inherit"}>
              <Trans i18nKey={"labelOpenInWalletDetail"}>
                labelOpenInWalletDetail URL for adding fund has been copied. You
                can choose either way to continue:
              </Trans>
            </Typography>
          </DialogContentText>
          <List sx={{ marginTop: 2 }}>
            <ListItem>
              <Trans i18nKey={"labelOpenInWalletDetailLi1"}>
                Open your wallet app and paste the url in its internal dapp
                browser
              </Trans>
            </ListItem>
            <ListItem>
              <Trans i18nKey={"labelOpenInWalletDetailLi2"}>
                Open your desktop Chrome browser and paste the url in Chrome
              </Trans>
            </ListItem>
          </List>
        </DialogContent>

        <DialogActions>
          <Button
            variant={"contained"}
            fullWidth
            onClick={(e) => {
              copyToClipBoard(Bridge + `?${searchParams.toString()}`);
              setCopyToastOpen(true);
              handleClose(e as any);
            }}
          >
            {t("labelCopyClipBoard")}
          </Button>
        </DialogActions>
        <DialogContent>
          <Typography component={"p"} marginY={2}>
            {t("labelCopyManually")}
          </Typography>
          <TextField
            disabled={true}
            fullWidth={true}
            value={Bridge + `?${searchParams.toString()}`}
          />
        </DialogContent>
      </DialogStyle>
    );
  }
);

export const AlertLimitPrice = withTranslation("common")(
  ({
    t,
    value,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    value: string;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelImpactTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans
              i18nKey={"labelPriceExtraGreat"}
              tOptions={{ compare: value ? t(value) : "> | <" }}
            >
              The price you set is greater or less than 20% the market price.
              Are you sure you want to make this order?
            </Trans>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelDisAgreeConfirm")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelAgreeConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export const InformationForCoinBase = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: MouseEvent, notShow?: boolean) => void;
  }) => {
    const providers = Object.keys(ConnectProviders).filter(
      (item) => item !== "unknown"
    );
    return (
      <DialogStyle
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans
              i18nKey={"labelNoticeForProvider"}
              tOptions={{ name: providers.join(",") }}
            >
              Loopring only support and maintain {providers.join(",")} plugin
              for Wallet Connect, if your installed other Wallet plugin, please
              make sure it's the
              {providers.join(",")} popup.
            </Trans>
            <Link
              target="_top"
              rel="noopener noreferrer"
              href={"./#/document/plugin_guide.md"}
            >
              {t("labelGuid")}
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelIKnow")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);

export const InformationForNoMetaNFT = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    method,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    method?: string;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    return (
      <DialogStyle
        open={open}
        onClose={(e: MouseEvent) => handleClose(e, false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans
              i18nKey={"labelNoticeForNoMetaNFT"}
              tOptions={{ method: t("label" + method).toLowerCase() }}
            >
              Your Minted NFT does not contain Metadata or media information.
              Are you sure you still wish to {{ method }} this NFT?
            </Trans>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any, false)}
          >
            {t("labelNo")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelYes")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);
export const InformationForAccountFrozen = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    type,
    messageKey = "labelNoticeForForAccountFrozen",
  }: // handleClose,
  WithTranslation & {
    open: boolean;
    type: string;
    messageKey?: string;
    // handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    const { setShowTradeIsFrozen } = useOpenModals();
    return (
      <DialogStyle
        open={open}
        onClose={() => setShowTradeIsFrozen({ isShow: false })}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {messageKey === "labelNoticeForForAccountFrozen" ? (
              <Trans
                i18nKey={messageKey}
                tOptions={{ type: t("label" + type).toLowerCase() }}
              >
                please waiting a while, {{ type }} is on updating.
              </Trans>
            ) : (
              t(messageKey, { type })
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={() => {
              setShowTradeIsFrozen({ isShow: false });
            }}
            color={"primary"}
          >
            {t("labelOK")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);

export const LayerswapNotice = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    account,
  }: WithTranslation & {
    open: boolean;
    account: Account;
  }) => {
    const [agree, setAgree] = React.useState(false);

    React.useEffect(() => {
      if (!open) {
        setAgree(false);
      }
    }, [open]);
    const { setShowLayerSwapNotice } = useOpenModals();
    return (
      <DialogStyle
        open={open}
        onClose={() => setShowLayerSwapNotice({ isShow: false })}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelLayerSwapUnderstandDes"}>
              LayerSwap is a 3rd party App service provider to help move tokens
              from exchange to Loopring L2 directly. If you have any concerns
              regarding their service, please check out their
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={"https://www.layerswap.io/blog/guide/Terms_of_Service"}
              >
                TOS
              </Link>
              .
            </Trans>
          </DialogContentText>
          <MuiFormControlLabel
            control={
              <Checkbox
                checked={agree}
                onChange={(_event: any, state: boolean) => {
                  setAgree(state);
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
              />
            }
            label={t("labelLayerSwapUnderstand")}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            disabled={!agree}
            onClick={() => {
              window.open(
                `https://www.layerswap.io/?destNetwork=loopring_mainnet&destAddress=${account.accAddress}&lockNetwork=true&lockAddress=true&addressSource=loopringWeb`
              );
              window.opener = null;
              setShowLayerSwapNotice({ isShow: false });
            }}
            color={"primary"}
          >
            {t("labelIUnderStand")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);

export const OtherExchangeDialog = withTranslation("common", {
  withRef: true,
})(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: MouseEvent, notShow?: boolean) => void;
  }) => {
    const [agree, setAgree] = React.useState(false);

    React.useEffect(() => {
      if (!open) {
        setAgree(false);
      }
    }, [open]);
    return (
      <DialogStyle
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelConfirmBtrade")}</DialogTitle>
        <DialogContent>
          <Trans i18nKey={"labelConfirmDetail"}>
            <Typography
              marginBottom={2}
              variant={"body1"}
              color={"textSecondary"}
            >
              Before withdrawing, please check with your Btrade support that
              they accept deposits from smart contracts.
            </Typography>
            <Typography
              marginBottom={2}
              variant={"body1"}
              color={"textSecondary"}
            >
              L2 to L1 withdrawing is via a smart contract. The Btrade
              depositing address may not be able to acknowledge the tokens
              deposited automatically.
            </Typography>
            <Typography
              marginBottom={2}
              variant={"body1"}
              color={"textSecondary"}
            >
              If the deposited tokens do not appear at the Btrade address within
              24 hours, please contact your Btrade support to manually
              acknowledge this transaction.
            </Typography>
          </Trans>
          <MuiFormControlLabel
            control={
              <Checkbox
                checked={agree}
                onChange={(_event: any, state: boolean) => {
                  setAgree(state);
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
              />
            }
            label={t("labelBtradeUnderstand")}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelDisAgreeConfirm")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            disabled={!agree}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelAgreeConfirm")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);

export const ConfirmDefiBalanceIsLimit = withTranslation("common")(
  ({
    t,
    open,
    type,
    defiData,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    type: string;
    defiData: TradeDefi<any>;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    const maxValue =
      defiData.buyToken?.symbol &&
      `${getValuePrecisionThousand(
        new BigNumber(defiData?.maxBuyVol ?? 0).div(
          "1e" + defiData.buyToken?.decimals
        ),
        defiData.buyToken?.precision,
        defiData.buyToken?.precision,
        defiData.buyToken?.precision,
        false,
        { floor: true }
      )} ${defiData.buyToken?.symbol}`;

    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {new BigNumber(defiData?.maxSellVol ?? 0).gte(
              defiData?.miniSellVol ?? 0
            ) && (
              <Typography>
                <Trans i18nKey={"labelDefiMaxBalance"} tOptions={{ maxValue }}>
                  Your Redeem order is too large and cannot be withdrawn
                  immediately, you can only redeem {{ maxValue }}
                </Trans>
              </Typography>
            )}
            <Typography>
              <Trans i18nKey={"labelDefiMaxBalance1"} tOptions={{ type }}>
                or you can
                <List sx={{ marginTop: 2 }}>
                  <ListItem>
                    Withdraw to L1 and redeem through crv or lido
                  </ListItem>
                  <ListItem>
                    Wait some time and wait for pool liquidity
                  </ListItem>
                </List>
              </Trans>
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelDisAgreeConfirm")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelAgreeConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export const ConfirmAmmExitMiniOrder = withTranslation("common")(
  ({
    t,
    open,
    type,
    handleClose,
  }: WithTranslation & {
    open: boolean;
  } & (
      | {
          type: "Disabled";
          handleClose: (event: any) => void;
        }
      | {
          type: "Mini";
          handleClose: (event: any, isAgree?: boolean) => void;
        }
    )) => {
    return (
      <DialogStyle
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {t(
              type === "Disabled"
                ? "labelAmmExitMiniOrderDisabled"
                : "labelAmmExitMiniOrderMini"
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {type === "Disabled" ? (
            <Button
              variant={"contained"}
              size={"small"}
              onClick={(e) => {
                handleClose(e);
              }}
              color={"primary"}
            >
              {t("labelIKnow")}
            </Button>
          ) : (
            <>
              <Button
                variant={"outlined"}
                size={"medium"}
                onClick={(e) => handleClose(e as any)}
              >
                {t("labelDisAgreeConfirm")}
              </Button>
              <Button
                variant={"contained"}
                size={"small"}
                onClick={(e) => {
                  handleClose(e as any, true);
                }}
                color={"primary"}
              >
                {t("labelAgreeConfirm")}
              </Button>
            </>
          )}
        </DialogActions>
      </DialogStyle>
    );
  }
);
export const ConfirmStackingRedeem = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
  }) => {
    const { setShowLayerSwapNotice } = useOpenModals();
    return (
      <DialogStyle
        open={open}
        onClose={() => setShowLayerSwapNotice({ isShow: false })}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelStackingAgreeRedeem"} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelOrderCancel")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelAgreeRedeem")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);

export const ConfirmDefiNOBalance = withTranslation("common")(
  ({
    t,
    isJoin,
    open,
    market,
    type,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    type: symbol;
    market: `${string}-${string}`;
    isJoin: boolean;
    handleClose: (event: any) => void;
  }) => {
    // @ts-ignore
    const [, baseSymbol, _quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    return (
      <DialogStyle
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {isJoin ? (
              <Typography component={"span"}>
                <Trans i18nKey={"labelDefiNoBalanceJoin"}>
                  No quota available. Loopring will setup the pool soon, please
                  revisit for subscription later.
                </Trans>
              </Typography>
            ) : (
              <Typography
                component={"span"}
                display={"flex"}
                flexDirection={"column"}
              >
                <Trans
                  i18nKey={"labelDefiNoBalance"}
                  components={{ span: <span /> }}
                >
                  <Typography component={"span"} marginBottom={3}>
                    Loopring rebalance pool can't satisfy your complete request
                    now.
                  </Typography>
                  <Typography component={"span"}>
                    For the remaining investment, you can choose one of the
                    approaches.
                  </Typography>
                </Trans>
                <List sx={{ marginTop: 1 }}>
                  <Trans
                    i18nKey={"labelDefiNoBalanceList"}
                    components={{ li: <li /> }}
                    tOptions={{ symbol: baseSymbol, type }}
                  >
                    <ListItem style={{ marginBottom: 0 }}>
                      Withdraw WSTETH to L1 and trade through CRV or LIDO
                      directly
                    </ListItem>
                    <ListItem style={{ marginBottom: 0 }}>
                      Wait some time for Loopring to setup the rebalance pool
                      again, then revist the page for redeem
                    </ListItem>
                  </Trans>
                </List>
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              handleClose(e);
            }}
            color={"primary"}
          >
            {t("labelIKnow")}
          </Button>
        </DialogActions>
      </DialogStyle>
    );
  }
);

export const ConfirmInvestDefiServiceUpdate = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: any) => void;
  }) => {
    const history = useHistory();
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelInformation")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography
              whiteSpace={"pre-line"}
              component={"span"}
              variant={"body1"}
              display={"block"}
              color={"textSecondary"}
            >
              {t("labelDefiClose")}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => {
              history.goBack();
              handleClose(e);
            }}
            color={"primary"}
          >
            {t("labelIKnow")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
export const ConfirmInvestDefiRisk = withTranslation("common")(
  ({
    t,
    open,
    type,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    type: "WSETH" | "RETH";
    handleClose: (event: any, isAgree?: boolean) => void;
  }) => {
    const [agree, setAgree] = React.useState(false);
    React.useEffect(() => {
      if (!open) {
        setAgree(false);
      }
    }, [open]);
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t(`label${type}DefiRiskTitle`)}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans
              i18nKey={`label${type}DefiRisk`}
              components={{
                p: (
                  <Typography
                    whiteSpace={"pre-line"}
                    component={"span"}
                    variant={"body1"}
                    display={"block"}
                    marginBottom={1}
                    color={"textSecondary"}
                  />
                ),
              }}
            >
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body1"}
                display={"block"}
                marginBottom={1}
                color={"textSecondary"}
              >
                Lido is a liquid staking solution for ETH 2.0 backed by
                industry-leading staking providers. Lido lets users stake their
                ETH - without locking assets or maintaining infrastructure.
              </Typography>
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body1"}
                marginBottom={1}
                display={"block"}
                color={"textSecondary"}
              >
                When using Lido to stake your ETH on the Ethereum beacon chain,
                users will receive a token (stETH), which represents their ETH
                on the Ethereum beacon chain on a 1:1 basis. It effectively acts
                as a bridge bringing ETH 2.0’s staking rewards to ETH 1.0.
              </Typography>
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body1"}
                marginBottom={1}
                display={"block"}
                color={"textSecondary"}
              >
                wstETH is the wrapped version of stETH. The total amount of
                wstETH doesn’t change after users receive the token. Instead,
                the token’s value increase over time to reflect ETH staking
                rewards earned.
              </Typography>
            </Trans>
          </DialogContentText>
          <MuiFormControlLabel
            control={
              <Checkbox
                checked={agree}
                onChange={(_event: any, state: boolean) => {
                  setAgree(state);
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
              />
            }
            label={t("labelDefiAgree")}
          />
        </DialogContent>
        <DialogContent>
          <DialogContentText id="alert-dialog-defiRisk2">
            <Trans i18nKey={`label${type}DefiRisk2`}>
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body2"}
                marginTop={2}
                display={"block"}
                color={"textThird"}
              >
                It is important to note that users can't redeem wstETH for ETH
                until phase 2 of Ethereum 2.0. However, users are able to trade
                wstETH for ETH on various exchanges at market prices.{" "}
              </Typography>
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body2"}
                marginTop={2}
                display={"block"}
                color={"textThird"}
              >
                Loopring will provide a pool to allow users to trade wstETH for
                ETH directly on Layer 2. The pool will rebalance periodically
                when it reaches a specific threshold. If there is not enough
                inventory on Layer 2, user can always withdraw their wstETH
                tokens to Layer 1 and swap for ETH in Lido, Curve, or 1inch.
              </Typography>
            </Trans>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            disabled={!agree}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelIKnow")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
export const ConfirmInvestDualRisk = withTranslation("common")(
  ({
    t,
    open,
    USDCOnly,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    USDCOnly: boolean;
    handleClose: (event: any, isAgree?: boolean) => void;
  }) => {
    const [{ agree1, agree2, agree3, agree4, agree5 }, setAgree] =
      React.useState({
        agree1: false,
        agree2: false,
        agree3: false,
        agree4: false,
        agree5: false,
      });
    // const { language } = useSettings();

    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelDualRiskTitle")}</DialogTitle>
        {USDCOnly ? (
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <Trans i18nKey={"labelInvestDualTutorialCheck4"}>
                <Typography
                  whiteSpace={"pre-line"}
                  component={"span"}
                  variant={"body1"}
                  display={"block"}
                  color={"textPrimary"}
                >
                  Dual Investment offers you a chance to sell cryptocurrency
                  high or buy cryptocurrency low at your desired price on your
                  desired date. Once subscribed, users are not able to cancel or
                  redeem the subscription until the Settlement Date.\n You may
                  be better off holding your cryptocurrency, and may be required
                  to trade your cryptocurrency at a less favorable rate of
                  exchange than the market rate on Settlement Date.
                  Cryptocurrency trading is subject to high market risk. Please
                  make your trades cautiously. There may be no recourse for any
                  losses.
                </Typography>
              </Trans>
            </DialogContentText>
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={agree5}
                  onChange={(_event: any, state: boolean) => {
                    setAgree((_state) => ({
                      ..._state,
                      agree5: state,
                    }));
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={t("labelInvestDualTutorialCheck5")}
            />
          </DialogContent>
        ) : (
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <Trans i18nKey={"labelInvestDualTutorialContent"}>
                <Typography
                  whiteSpace={"pre-line"}
                  component={"span"}
                  variant={"body1"}
                  display={"block"}
                  color={"textPrimary"}
                >
                  Dual Investment offers you a chance to sell cryptocurrency
                  high or buy cryptocurrency low at your desired price on your
                  desired date. Once subscribed, users are not able to cancel or
                  redeem the subscription until the Settlement Date.\n You may
                  be better off holding your cryptocurrency, and may be required
                  to trade your cryptocurrency at a less favorable rate of
                  exchange than the market rate on Settlement Date.
                  Cryptocurrency trading is subject to high market risk. Please
                  make your trades cautiously. There may be no recourse for any
                  losses.
                </Typography>
              </Trans>
            </DialogContentText>
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={agree1}
                  onChange={(_event: any, state: boolean) => {
                    setAgree((_state) => ({
                      ..._state,
                      agree1: state,
                    }));
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={t("labelInvestDualTutorialCheck1")}
            />
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={agree2}
                  onChange={(_event: any, state: boolean) => {
                    setAgree((_state) => ({
                      ..._state,
                      agree2: state,
                    }));
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={t("labelInvestDualTutorialCheck2")}
            />
            <MuiFormControlLabel
              sx={{ marginTop: 0.5 }}
              control={
                <Checkbox
                  checked={agree3}
                  onChange={(_event: any, state: boolean) => {
                    setAgree((_state) => ({
                      ..._state,
                      agree3: state,
                    }));
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={t("labelInvestDualTutorialCheck3")}
            />
            <MuiFormControlLabel
              sx={{ marginTop: 1 }}
              control={
                <Checkbox
                  checked={agree4}
                  onChange={(_event: any, state: boolean) => {
                    setAgree((_state) => ({
                      ..._state,
                      agree4: state,
                    }));
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={t("labelInvestDualTutorialCheck4")}
            />
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={agree5}
                  onChange={(_event: any, state: boolean) => {
                    setAgree((_state) => ({
                      ..._state,
                      agree5: state,
                    }));
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={t("labelInvestDualTutorialCheck5")}
            />
          </DialogContent>
        )}

        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            disabled={
              USDCOnly
                ? !agree5
                : !agree1 || !agree2 || !agree3 || !agree4 || !agree5
            }
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelIKnow")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
export const ConfirmInvestLRCStakeRisk = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: any, isAgree?: boolean) => void;
  }) => {
    const [agree, setAgree] = React.useState(false);
    React.useEffect(() => {
      if (!open) {
        setAgree(false);
      }
    }, [open]);
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t(`labelLRCStakingTitle`)}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans
              i18nKey={`labelLRCStakingRisk`}
              components={{
                p: (
                  <Typography
                    whiteSpace={"pre-line"}
                    component={"span"}
                    variant={"body1"}
                    display={"block"}
                    marginBottom={1}
                    color={"textSecondary"}
                  />
                ),
              }}
            >
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body1"}
                display={"block"}
                marginBottom={1}
                color={"textSecondary"}
              >
                LRC staking is incentivized through an allocated portion of the
                Loopring protocol fee; the exact percentage is determined by the
                Loopring DAO. The APY is updated daily based on the allocated
                amount from previous day’s fee. Any LRC holder can participate
                in LRC staking via L2 to accumulate daily rewards. The assets
                must be staked for a minimum of 90 days to receive rewards.
              </Typography>
            </Trans>
          </DialogContentText>
          <MuiFormControlLabel
            control={
              <Checkbox
                checked={agree}
                onChange={(_event: any, state: boolean) => {
                  setAgree(state);
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
              />
            }
            label={t("labelLRCStakingAgree")}
          />
        </DialogContent>
        <DialogContent>
          <DialogContentText id="alert-dialog-defiRisk2">
            <Trans i18nKey={`labelLRCStakingRisk2`}>
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body2"}
                marginTop={2}
                display={"block"}
                color={"textThird"}
              >
                The staked LRC will be locked in Loopring L2, meaning it cannot
                be used for other purposes. You may redeem your LRC at any time;
                however, doing so before the 90-day minimum requirement will
                forfeit any accumulated reward.
              </Typography>
            </Trans>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            disabled={!agree}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelIKnow")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export const ConfirmBtradeSwapRisk = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: any, isAgree?: boolean) => void;
  }) => {
    const [agree, setAgree] = React.useState(false);
    React.useEffect(() => {
      if (!open) {
        setAgree(false);
      }
    }, [open]);
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t(`labelBtradeSwapTitleDes`)}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-defiRisk2">
            <Trans
              i18nKey={`labelBtradeSwapContentDes`}
              components={{
                p: (
                  <Typography
                    whiteSpace={"pre-line"}
                    component={"span"}
                    variant={"body1"}
                    display={"block"}
                    marginBottom={1}
                    color={"textSecondary"}
                  />
                ),
              }}
            >
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body1"}
                display={"block"}
                marginBottom={1}
                color={"textSecondary"}
              >
                Block Trade offers a secure and trustless way for users to swap
                tokens using CEX liquidity. The trades happen exclusively
                between designated entities, ensuring that the existing
                liquidity of the DEX remains unaffected. There is no price
                impact to other DEX users as a result of the transaction.
              </Typography>
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body1"}
                display={"block"}
                marginBottom={1}
                color={"textSecondary"}
              >
                This is similar to the traditional stock market’s Block Trade
                System. A block trade is a large, privately negotiated
                transaction, which can be made outside the open market through a
                private purchase agreement.
              </Typography>
            </Trans>
          </DialogContentText>
          <MuiFormControlLabel
            control={
              <Checkbox
                checked={agree}
                onChange={(_event: any, state: boolean) => {
                  setAgree(state);
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
              />
            }
            label={t("labelLRCStakingAgree")}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant={"contained"}
            size={"small"}
            disabled={!agree}
            onClick={(e) => {
              handleClose(e as any, true);
            }}
            color={"primary"}
          >
            {t("labelIKnow")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export const ConfirmStopLimitRisk = withTranslation("common")(
  ({
    t,
    open,
    handleClose,
    baseSymbol,
    quoteSymbol,
    tradeType,
    limitPrice,
    stopPrice,
    baseValue,
    quoteValue,
    stopSide,
    onSubmit,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: any) => void;
  } & Partial<{
      baseSymbol: string;
      quoteSymbol: string;
      tradeType: TradeProType;
      baseValue: string | number;
      quoteValue: string | number;
      limitPrice: string;
      stopPrice: string;
      stopSide: sdk.STOP_SIDE;
      onSubmit: (event: any) => void;
    }>) => {
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
        sx={{ width: "var(--swap-box-width)" }}
      >
        <DialogTitle>
          {t(`labelStopLimit`, {
            symbol1: baseSymbol,
            tradeType: tradeType
              ? tradeType[0].toUpperCase() + tradeType.substring(1)
              : "", //tradeType,
          })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-stopLimit"
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <Typography
              component={"span"}
              display={"inline-flex"}
              justifyContent={"space-between"}
              marginTop={2}
            >
              <Typography
                variant={"body1"}
                component={"span"}
                color={"var(--color-text-secondary)"}
              >
                {baseSymbol + " / " + quoteSymbol}
              </Typography>
              <Typography
                variant={"body1"}
                component={"span"}
                color={
                  tradeType == TradeProType.sell
                    ? "var(--color-error)"
                    : "var(--color-success)"
                }
                // color={"var(--color-text-primary)"}
              >
                {t("labelStopLimitType", {
                  tradeType: tradeType
                    ? tradeType[0].toUpperCase() + tradeType.substring(1)
                    : "",
                })}
              </Typography>
            </Typography>
            <Typography
              component={"span"}
              display={"inline-flex"}
              justifyContent={"space-between"}
              marginTop={2}
            >
              <Typography
                variant={"body1"}
                component={"span"}
                color={"var(--color-text-secondary)"}
              >
                {t("labelStopLimitStopPrice")}
              </Typography>
              <Typography
                variant={"body1"}
                component={"span"}
                color={"var(--color-text-primary)"}
              >
                {stopPrice + " " + quoteSymbol}
              </Typography>
            </Typography>
            <Typography
              component={"span"}
              display={"inline-flex"}
              justifyContent={"space-between"}
              marginTop={2}
            >
              <Typography
                variant={"body1"}
                component={"span"}
                color={"var(--color-text-secondary)"}
              >
                {t("labelStopLimitPriceLimitPrice")}
              </Typography>
              <Typography
                variant={"body1"}
                component={"span"}
                color={"var(--color-text-primary)"}
              >
                {limitPrice + " " + quoteSymbol}
              </Typography>
            </Typography>
            <Typography
              component={"span"}
              display={"inline-flex"}
              justifyContent={"space-between"}
              marginTop={2}
            >
              <Typography
                variant={"body1"}
                component={"span"}
                color={"var(--color-text-secondary)"}
              >
                {t("labelStopLimitAmount")}
              </Typography>
              <Typography
                variant={"body1"}
                component={"span"}
                color={"var(--color-text-primary)"}
              >
                {baseValue + " " + baseSymbol}
              </Typography>
            </Typography>
          </DialogContentText>
          <DialogContentText id="alert-dialog-stopLimit">
            <Trans
              i18nKey={`labelStopLimitDes`}
              tOptions={{
                value1: baseValue,
                value2: quoteValue,
                symbol2: quoteSymbol,
                symbol1: baseSymbol,
                stopPrice,
                limitPrice,
                tradeType,
                from:
                  stopSide == sdk.STOP_SIDE.GREAT_THAN_AND_EQUAL
                    ? t("labelStopLimitFromGoesUp")
                    : t("labelStopLimitFromDropsDown"),
                behavior:
                  stopSide == sdk.STOP_SIDE.GREAT_THAN_AND_EQUAL
                    ? t("labelStopLimitBehaviorAbove")
                    : t("labelStopLimitBehaviorBelow"),
              }}
              components={{
                p: (
                  <Typography
                    whiteSpace={"pre-line"}
                    component={"span"}
                    variant={"body1"}
                    display={"block"}
                    marginY={1}
                    color={"textSecondary"}
                    sx={{ background: "var(--field-opacity)" }}
                    borderRadius={1 / 2}
                    padding={1}
                  />
                ),
              }}
            >
              <p>
                If the last price goes up to or above value Symbol2 , and order
                to tradeType value2 Symbol1 at a price of price Symbol2 will be
                placed.
              </p>
            </Trans>
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelStopLimitCancel")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            // fullWidth={true}
            onClick={(e) => {
              // handleClose(e as any);
              if (typeof onSubmit === "function") {
                onSubmit(e);
              }
            }}
            color={"primary"}
          >
            {t("labelStopLimitConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
