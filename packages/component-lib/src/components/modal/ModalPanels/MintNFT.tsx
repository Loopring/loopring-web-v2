import { WithTranslation } from "react-i18next";
import { IconType, MintBase, PanelProps } from "./BasicPanel";
import { NFTWholeINFO } from "@loopring-web/common-resources";

export const NFTMint_WaitForAuth = (
  props: PanelProps & WithTranslation & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTTokenMintWaitForAuth", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};

export const NFTMint_Denied = (
  props: PanelProps & WithTranslation & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelMintDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};

export const NFTMint_First_Method_Denied = (
  props: PanelProps & WithTranslation & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};
export const NFTMint_In_Progress = (
  props: PanelProps & WithTranslation & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelMintInProgress", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};

export const NFTMint_Failed = (
  props: PanelProps & WithTranslation & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelMintFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};

export const NFTMint_Submit = (
  props: PanelProps & WithTranslation & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelMintSubmit", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};
