import { IconType, PanelProps, RedPacketBase } from "./BasicPanel";
import { sanitize } from "dompurify";

// value symbol
export const RedPacketSend_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

// value symbol
export const RedPacketSend_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

// value symbol
export const RedPacketSend_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelSignDenied"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

// value symbol
export const RedPacketSend_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t(" labelRedpacketSendInProgress"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

// value symbol
export const RedPacketSend_Submit = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t(" labelRedpacketSendSuccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

// value symbol
export const RedPacketSend_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t(" labelRedpacketSendFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

export const NFTRedPacketSend_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

export const NFTRedPacketSend_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

export const NFTRedPacketSend_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelSignDenied"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

export const NFTRedPacketSend_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t(" labelRedpacketSendInProgress"),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

export const NFTRedPacketSend_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t(" labelRedpacketSendSuccess", {
      symbol: sanitize(props.symbol ?? "NFT").toString(),
      value: props.value,
    }),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};

export const NFTRedPacketSend_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t(" labelRedpacketSendFailed", {
      symbol: sanitize(props.symbol ?? "NFT").toString(),
      value: props.value,
    }),
  };
  return <RedPacketBase {...propsPatch} {...props} />;
};
