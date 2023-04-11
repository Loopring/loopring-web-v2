import { ClaimWithdrawBase, IconType, PanelProps } from "./BasicPanel";
import { NFTWholeINFO } from "@loopring-web/common-resources";
import { Typography } from "@mui/material";
import { useSettings } from "../../../stores";

export const ClaimWithdraw_WaitForAuth = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelClaimWithdrawWaitForAuth", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ClaimWithdrawBase {...propsPatch} {...props} />;
};

export const ClaimWithdraw_Denied = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelClaimWithdrawDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ClaimWithdrawBase {...propsPatch} {...props} />;
};

export const ClaimWithdraw_First_Method_Denied = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFirstSignDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ClaimWithdrawBase {...propsPatch} {...props} />;
};

export const ClaimWithdraw_In_Progress = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelClaimWithdrawInProgress", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ClaimWithdrawBase {...propsPatch} {...props} />;
};

export const ClaimWithdraw_Failed = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelClaimWithdrawFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <ClaimWithdrawBase {...propsPatch} {...props} />;
};

export const ClaimWithdraw_Submit = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelClaimWithdrawSubmit", {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <Typography
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 1 : 5}
        color={"var(--color-text-third)"}
        marginBottom={2}
      >
        {props.t("labelTransferDelayConfirm")}
      </Typography>
    ),
  };
  return <ClaimWithdrawBase {...propsPatch} {...props} />;
};
