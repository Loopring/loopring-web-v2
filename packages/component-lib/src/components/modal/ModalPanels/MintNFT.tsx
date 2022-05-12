import { IconType, MintBase, PanelProps } from "./BasicPanel";
import { NFTWholeINFO } from "@loopring-web/common-resources";

export const NFTMint_WaitForAuth = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTTokenMintWaitForAuth", {
      symbol:
        props.symbol && props.symbol?.length > 10
          ? props.symbol?.slice(0, 10) + "..."
          : props.symbol ?? "",
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};

export const NFTMint_Denied = (props: PanelProps & Partial<NFTWholeINFO>) => {
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
  props: PanelProps & Partial<NFTWholeINFO>
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
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelMintInProgress", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};

export const NFTMint_Failed = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelMintFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};

export const NFTMint_Success = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t("labelMintSuccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <MintBase {...propsPatch} {...props} />;
};
