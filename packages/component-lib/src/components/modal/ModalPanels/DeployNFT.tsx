import { DeployBase, IconType, PanelProps } from "./BasicPanel";
import { NFTWholeINFO } from "@loopring-web/common-resources";

export const NFTDeploy_WaitForAuth = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTTokenDeployWaitForAuth", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DeployBase {...propsPatch} {...props} />;
};

export const NFTDeploy_Denied = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelDeployDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DeployBase {...propsPatch} {...props} />;
};
export const NFTDeploy_First_Method_Denied = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DeployBase {...propsPatch} {...props} />;
};
export const NFTDeploy_In_Progress = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelDeployInProgress", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DeployBase {...propsPatch} {...props} />;
};

export const NFTDeploy_Failed = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelDeployFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DeployBase {...propsPatch} {...props} />;
};

export const NFTDeploy_Submit = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelDeploySubmit", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DeployBase {...propsPatch} {...props} />;
};
