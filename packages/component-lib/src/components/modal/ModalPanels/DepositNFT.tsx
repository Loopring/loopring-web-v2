import { DepositBase, IconType, PanelProps } from "./BasicPanel";
import { NFTWholeINFO } from "@loopring-web/common-resources";

export const NFTDeposit_Approve_WaitForAuth = (
  props: PanelProps & Partial<NFTWholeINFO> & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTAccess", {
      symbol: props?.symbol ?? "NFT",
    }),
  };
  return <DepositBase {...props} {...propsPatch} />;
};

export const NFTDeposit_Approve_Denied = (
  props: PanelProps & Partial<NFTWholeINFO> & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelNFTTokenFailedAccess", {
      symbol: props?.symbol ?? "NFT",
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Approve_Submit = (
  props: PanelProps & Partial<NFTWholeINFO> & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelNFTTokenSuccessAccess", {
      symbol: props?.symbol ?? "NFT",
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_WaitForAuth = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTTokenDepositWaitForAuth", {
      symbol: props?.symbol ?? "NFT",
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Denied = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelL1toL2Denied", {
      symbol: props?.symbol ?? "NFT",
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Failed = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelL1toL2Failed", {
      symbol: props?.symbol ?? "NFT",
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Submit = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelL1toL2Submit", {
      symbol: props?.symbol ?? "NFT",
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};
