import { Trans, WithTranslation } from "react-i18next";
import { IconType, PanelProps, BasicPanel } from "../ModalPanels/BasicPanel";

export const HebaoApprove = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelHebaoApprove",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};
// symbol
export const Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <HebaoApprove {...props} {...propsPatch} />;
};

export const Approve_User_Denied = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={"labelSignDenied"} />,
  };
  return <HebaoApprove {...propsPatch} {...props} />;
};

// symbol
export const Approve_Success = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={"labelApproveSuccess"} />,
  };
  return <HebaoApprove {...propsPatch} {...props} />;
};

// value symbol
export const Approve_Failed = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: <Trans i18nKey={"labelApproveFailed"} />,
  };
  return <HebaoApprove {...propsPatch} {...props} />;
};

export const HebaoReject = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelHebaoReject",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

// symbol
export const Reject_WaitForAuth = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <HebaoReject {...props} {...propsPatch} />;
};

export const Reject_User_Denied = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={"labelSignDenied"} />,
  };
  return <HebaoReject {...propsPatch} {...props} />;
};

// symbol
export const Reject_Success = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={"labelRejectSuccess"} />,
  };
  return <HebaoReject {...propsPatch} {...props} />;
};

// value symbol
export const Reject_Failed = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: <Trans i18nKey={"labelRejectFailed"} />,
  };
  return <HebaoReject {...propsPatch} {...props} />;
};
