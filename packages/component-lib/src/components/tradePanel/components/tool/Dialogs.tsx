import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel as MuiFormControlLabel,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";

import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { Button } from "../../../basic-lib";
import React from "react";
import { ConnectProviders } from "@loopring-web/web3-provider";
import styled from "@emotion/styled";
import { useOpenModals } from "../../../../stores";
import { CheckBoxIcon, CheckedIcon } from "@loopring-web/common-resources";

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

export const AlertImpact = withTranslation("common", { withRef: true })(
  ({
    t,
    value,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    value: number;
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
export const AlertNotSupport = withTranslation("common", { withRef: true })(
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

export const ConfirmImpact = withTranslation("common", { withRef: true })(
  ({
    t,
    value,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    value: number;
    handleClose: (event: MouseEvent, isAgree?: boolean) => void;
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
        onClose={(e: MouseEvent) => handleClose(e)}
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
            onClick={(e) => handleClose(e as any)}
          >
            {t("labelDisAgreeConfirm")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            onClick={(e) => handleClose(e as any, true)}
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
        <DialogTitle> {t("labelOpenInWalletTitle")}</DialogTitle>
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

export const AlertLimitPrice = withTranslation("common", { withRef: true })(
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
  }: // handleClose,
  WithTranslation & {
    open: boolean;
    type: string;
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
            <Trans
              i18nKey={"labelNoticeForForAccountFrozen"}
              tOptions={{ type: t("label" + type).toLowerCase() }}
            >
              please waiting a while, {{ type }} is on updating.
            </Trans>
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
        <DialogTitle> {t("labelConfirmCEX")}</DialogTitle>
        <DialogContent>
          <Trans i18nKey={"labelConfirmDetail"}>
            <Typography
              marginBottom={2}
              variant={"body1"}
              color={"textSecondary"}
            >
              Before withdrawing, please check with your CEX support that they
              accept deposits from smart contracts.
            </Typography>
            <Typography
              marginBottom={2}
              variant={"body1"}
              color={"textSecondary"}
            >
              L2 to L1 withdrawing is via a smart contract. The CEX depositing
              address may not be able to acknowledge the tokens deposited
              automatically.
            </Typography>
            <Typography
              marginBottom={2}
              variant={"body1"}
              color={"textSecondary"}
            >
              If the deposited tokens do not appear at the CEX address within 24
              hours, please contact your CEX support to manually acknowledge
              this transaction.
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
            label={t("labelCEXUnderstand")}
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
