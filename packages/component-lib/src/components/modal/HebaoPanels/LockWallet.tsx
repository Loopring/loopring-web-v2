import { Trans, WithTranslation } from "react-i18next";
import { IconType, PanelProps, BasicPanel } from "../ModalPanels/BasicPanel";

export const LockWallet = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelLockWallet",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};
// symbol
export const LockAccount_WaitForAuth = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <LockWallet {...props} {...propsPatch} />;
};

export const LockAccount_User_Denied = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={"labelSignDenied"}></Trans>,
  };
  return <LockWallet {...propsPatch} {...props} />;
};

// symbol
export const LockAccount_Success = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={"labelLockAccountSuccess"}></Trans>,
  };
  return <LockWallet {...propsPatch} {...props} />;
};

// value symbol
export const LockAccount_Failed = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: <Trans i18nKey={"labelLockAccountFailed"}></Trans>,
  };
  return <LockWallet {...propsPatch} {...props} />;
};
