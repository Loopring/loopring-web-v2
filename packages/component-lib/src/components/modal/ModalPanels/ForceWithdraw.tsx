import { ForceWithdrawBase, IconType, PanelProps } from "./BasicPanel";
import { NFTWholeINFO } from "@loopring-web/common-resources";

export const ForceWithdraw_WaitForAuth = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelForceWithdrawWaitForAuth", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ForceWithdrawBase {...propsPatch} {...props} />;
};

export const ForceWithdraw_Denied = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelForceWithdrawDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ForceWithdrawBase {...propsPatch} {...props} />;
};

export const ForceWithdraw_First_Method_Denied = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ForceWithdrawBase {...propsPatch} {...props} />;
};

export const ForceWithdraw_In_Progress = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelForceWithdrawInProgress", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ForceWithdrawBase {...propsPatch} {...props} />;
};

export const ForceWithdraw_Failed = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelForceWithdrawFailed", {
      loopringL2: "Loopring L2",
      l2Symbol: "L2",
      l1Symbol: "L1",
      ethereumL1: "Ethereum L1",
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ForceWithdrawBase {...propsPatch} {...props} />;
};

export const ForceWithdraw_Submit = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelForceWithdrawSubmit", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ForceWithdrawBase {...propsPatch} {...props} />;
};
