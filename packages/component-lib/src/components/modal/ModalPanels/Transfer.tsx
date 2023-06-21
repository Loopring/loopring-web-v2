import { IconType, PanelProps, TransferBase } from "./BasicPanel";
import { sanitize } from "dompurify";

// value symbol
export const Transfer_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

// value symbol
export const Transfer_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

// value symbol
export const Transfer_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelSignDenied"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

// value symbol
export const Transfer_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelL2toL2InProgress"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

// value symbol
export const Transfer_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t("labelL2toL2Success", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

export const Transfer_banxa_confirm = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelBanxaConfirmSubmit", { order: props.info.id }),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

// value symbol
export const Transfer_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelL2toL2Failed", {
      loopringL2: "Loopring L2",
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

export const NFTTransfer_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitForAuth"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

export const NFTTransfer_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

export const NFTTransfer_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelSignDenied"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

export const NFTTransfer_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelL2toL2InProgress"),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

export const NFTTransfer_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t("labelL2toL2Success", {
      symbol: sanitize(props.symbol ?? "NFT").toString(),
      value: props.value,
    }),
  };
  return <TransferBase {...propsPatch} {...props} />;
};

export const NFTTransfer_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelL2toL2Failed", {
      symbol: sanitize(props.symbol ?? "NFT").toString(),
      value: props.value,
    }),
  };
  return <TransferBase {...propsPatch} {...props} />;
};
