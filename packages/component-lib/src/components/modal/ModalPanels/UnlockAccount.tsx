import { Trans } from "react-i18next";
import { UnlockAccountBase, IconType, PanelProps } from "./BasicPanel";
import { Link, Typography } from "@mui/material";
import { WalletType } from "@loopring-web/loopring-sdk";
import { FEED_BACK_LINK } from "@loopring-web/common-resources";

// symbol
export const UnlockAccount_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <UnlockAccountBase {...props} {...propsPatch} />;
};

export const UnlockAccount_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={"labelSignDenied"} />,
  };
  return <UnlockAccountBase {...propsPatch} {...props} />;
};

// symbol
export const UnlockAccount_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={"labelUnlockAccountSuccess"} />,
  };
  return <UnlockAccountBase {...propsPatch} {...props} />;
};

export const UnlockAccount_Failed = (
  props: PanelProps & { walletType?: WalletType; resetAccount: () => void }
) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: (
      <Typography component={"div"} display={"inline-flex"}>
        <Trans i18nKey={"labelUnlockAccountFailed"} />
        {props.walletType &&
        (props.walletType.isContract ||
          props.walletType.isInCounterFactualStatus) ? (
          <Typography color={"textSecondary"} paddingLeft={2}>
            <Trans i18nKey={"labelConnectUsSimple"} ns={"error"}>
              Please
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={FEED_BACK_LINK}
              >
                contact us
              </Link>
              .
            </Trans>
          </Typography>
        ) : (
          <Link onClick={props.resetAccount} paddingLeft={2}>
            {<Trans i18nKey={"labelReActiveAccount"} />}
          </Link>
        )}
      </Typography>
    ),
  };
  return <UnlockAccountBase {...propsPatch} {...props} />;
};
