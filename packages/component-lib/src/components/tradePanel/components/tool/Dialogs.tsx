import {
  Box,
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
import { useOpenModals, useSettings } from "../../../../stores";

import {
  Account,
  Bridge,
  CheckBoxIcon,
  CheckedIcon,
  copyToClipBoard,
  getValuePrecisionThousand,
  TradeDefi,
  Lang,
  MarkdownStyle,
} from "@loopring-web/common-resources";
import { useHistory, useLocation } from "react-router-dom";
import BigNumber from "bignumber.js";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { LoadingBlock } from "@loopring-web/webapp/src/pages/LoadingPage";
import { useTheme } from "@emotion/react";

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
            Manually Selected & Copy:
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
    const { setShowLayerSwapNotice, setShowAccount } = useOpenModals();
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
              setShowAccount({ isShow: false });
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

export const ConfirmDefiBalanceIsLimit = withTranslation("common")(
  ({
    t,
    open,
    defiData,
    handleClose,
  }: WithTranslation & {
    open: boolean;
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
              <Trans i18nKey={"labelDefiMaxBalance1"}>
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

export const ConfirmDefiNOBalance = withTranslation("common")(
  ({
    t,
    isJoin,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean;
    isJoin: boolean;
    handleClose: (event: any) => void;
  }) => {
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
                <Trans i18nKey={"labelDefiNoBalance"}>
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
                  <Trans i18nKey={"labelDefiNoBalanceList"}>
                    <ListItem style={{ marginBottom: 0 }}>
                      Withdraw wSTETH to L1 and trade through CRV or LIDO
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
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: any, isAgree?: boolean) => void;
  }) => {
    const [agree, setAgree] = React.useState(false);
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelDefiRiskTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Trans i18nKey={"labelDefiRisk"}>
              <Typography
                whiteSpace={"pre-line"}
                component={"span"}
                variant={"body1"}
                display={"block"}
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
                marginTop={2}
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
                marginTop={2}
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
            <Trans i18nKey={"labelDefiRisk2"}>
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
                tokens to Layer 1 and swap for ETH in Lido, Curve, or 1inch.{" "}
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
    handleClose,
  }: WithTranslation & {
    open: boolean;
    handleClose: (event: any, isAgree?: boolean) => void;
  }) => {
    const [agree, setAgree] = React.useState(false);
    const { language } = useSettings();
    const theme = useTheme();
    const [input, setInput] = React.useState<string>("");
    React.useEffect(() => {
      // if (path) {
      try {
        const lng = Lang[language] ?? "en";
        Promise.all([
          fetch(
            `https://static.loopring.io/documents/markdown/dual_investment_tutorial_en.md`
          ),
          fetch(
            `https://static.loopring.io/documents/markdown/dual_investment_tutorial_${lng}.md`
          ),
        ])
          .then(([response1, response2]) => {
            if (response2) {
              return response2.text();
            } else {
              return response1.text();
            }
          })
          .then((input) => {
            setInput(input);
          })
          .catch(() => {});
      } catch (e: any) {}
    }, []);
    return (
      <Dialog
        open={open}
        keepMounted
        onClose={(e: MouseEvent) => handleClose(e)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> {t("labelDualRiskTitle")}</DialogTitle>

        <DialogContent>
          {input ? (
            <MarkdownStyle maxHeight={"50vh"}>
              <DialogContentText id="alert-dialog-slide-description">
                <Box
                  flex={1}
                  padding={3}
                  boxSizing={"border-box"}
                  className={`${theme.mode}  ${theme.mode}-scheme markdown-body`}
                >
                  <ReactMarkdown
                    remarkPlugins={[gfm]}
                    children={input}
                    // escapeHtml={false}
                  />
                </Box>

                {/*<Trans i18nKey={"labelDualRisk"}>*/}
                {/*  <Typography*/}
                {/*    whiteSpace={"pre-line"}*/}
                {/*    component={"span"}*/}
                {/*    variant={"body1"}*/}
                {/*    display={"block"}*/}
                {/*    color={"textSecondary"}*/}
                {/*  >*/}
                {/*    Lido is a liquid staking solution for ETH 2.0 backed by*/}
                {/*    industry-leading staking providers. Lido lets users stake their*/}
                {/*    ETH - without locking assets or maintaining infrastructure.*/}
                {/*  </Typography>*/}
                {/*  <Typography*/}
                {/*    whiteSpace={"pre-line"}*/}
                {/*    component={"span"}*/}
                {/*    variant={"body1"}*/}
                {/*    marginTop={2}*/}
                {/*    display={"block"}*/}
                {/*    color={"textSecondary"}*/}
                {/*  >*/}
                {/*    When using Lido to stake your ETH on the Ethereum beacon chain,*/}
                {/*    users will receive a token (stETH), which represents their ETH*/}
                {/*    on the Ethereum beacon chain on a 1:1 basis. It effectively acts*/}
                {/*    as a bridge bringing ETH 2.0’s staking rewards to ETH 1.0.*/}
                {/*  </Typography>*/}
                {/*  <Typography*/}
                {/*    whiteSpace={"pre-line"}*/}
                {/*    component={"span"}*/}
                {/*    variant={"body1"}*/}
                {/*    marginTop={2}*/}
                {/*    display={"block"}*/}
                {/*    color={"textSecondary"}*/}
                {/*  >*/}
                {/*    wstETH is the wrapped version of stETH. The total amount of*/}
                {/*    wstETH doesn’t change after users receive the token. Instead,*/}
                {/*    the token’s value increase over time to reflect ETH staking*/}
                {/*    rewards earned.*/}
                {/*  </Typography>*/}
                {/*</Trans>*/}
              </DialogContentText>
            </MarkdownStyle>
          ) : (
            <LoadingBlock />
          )}
        </DialogContent>

        <DialogContent>
          <MuiFormControlLabel
            control={
              <Checkbox
                disabled={!input}
                checked={agree}
                onChange={(_event: any, state: boolean) => {
                  setAgree(state);
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
              />
            }
            label={t("labelDualAgree")}
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
