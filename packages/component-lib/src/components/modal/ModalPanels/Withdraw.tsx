import { WithTranslation } from "react-i18next";
import { IconType, PanelProps, WithdrawBase } from "./BasicPanel";

// value symbol
export const Withdraw_WaitForAuth = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

// value symbol
export const Withdraw_First_Method_Denied = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

// value symbol
export const Withdraw_User_Denied = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelSignDenied"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

// value symbol
export const Withdraw_In_Progress = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWithdrawInProgress"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

// value symbol
export const Withdraw_Success = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t("labelWithdrawSuccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

// value symbol
export const Withdraw_Failed = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelWithdrawFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

export const NFTWithdraw_WaitForAuth = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

export const NFTWithdraw_First_Method_Denied = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

export const NFTWithdraw_User_Denied = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelSignDenied"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

export const NFTWithdraw_In_Progress = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWithdrawInProgress"),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

export const NFTWithdraw_Success = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t("labelWithdrawSuccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};

export const NFTWithdraw_Failed = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelWithdrawFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <WithdrawBase {...propsPatch} {...props} />;
};
