import { Trans } from "react-i18next";
import { DepositBase, IconType, PanelProps } from "./BasicPanel";
import { Box, Link, Typography } from "@mui/material";
import { getShortAddr, LinkIcon } from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";

export const Deposit_Sign_WaitForRefer = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelWaitingRefer"),
  };
  return <DepositBase {...props} {...propsPatch} />;
};

export const Deposit_Approve_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelTokenAccess", { symbol: props.symbol }),
  };
  return <DepositBase {...props} {...propsPatch} />;
};

export const Deposit_Approve_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFailedTokenAccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const Deposit_Approve_Submit = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelSuccessTokenAccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const Deposit_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelL1toL2WaitForAuth", {
      symbol: props.symbol,
      value: props.value,
      to: props.to ?? "",
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const Deposit_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelL1toL2Denied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const Deposit_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelL1toL2Failed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const Deposit_Submit = (props: PanelProps) => {
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: (
      <Link
        fontSize={"inherit"}
        whiteSpace={"break-spaces"}
        display={"inline-flex"}
        alignItems={"center"}
        style={{ wordBreak: "break-all" }}
        target="_blank"
        rel="noopener noreferrer"
        href={`${props.etherscanBaseUrl}tx/${props?.hash ?? ""}`}
      >
        <Trans
          i18nKey={"labelL1toL2Submit"}
          tOptions={{
            symbol: props.symbol,
            value: props.value,
          }}
        >
          Add asset submitted.
          <LinkIcon color={"inherit"} fontSize={"medium"} />
        </Trans>
      </Link>
    ),
    describe2: (
      <Box
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 5 : 1}
      >
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography variant={"body1"} color={"var(--color-text-secondary)"}>
            {props.t("labelL1toL2TokenAmount")}
          </Typography>
          <Typography variant={"body1"} color={"var(--color-text-primary)"}>
            {props.value + " " + props.symbol}
          </Typography>
        </Typography>
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography variant={"body1"} color={"var(--color-text-secondary)"}>
            {props.t("labelL1toL2From")}
          </Typography>
          <Typography variant={"body1"} color={"var(--color-text-primary)"}>
            {"L1: " + getShortAddr(props.account?.accAddress ?? "")}
          </Typography>
        </Typography>
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography variant={"body1"} color={"var(--color-text-secondary)"}>
            {props.t("labelL1toL2TO")}
          </Typography>
          <Typography variant={"body1"} color={"var(--color-text-primary)"}>
            {props.to ? "L2: " + getShortAddr(props.to) : "Loopring L2"}
          </Typography>
        </Typography>
      </Box>
    ),
  };
  return <DepositBase {...propsPatch} {...props} />;
};
