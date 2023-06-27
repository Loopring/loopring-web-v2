import { ConnectProviders } from "@loopring-web/web3-provider";
import { ConnectBase, IconType, PanelProps } from "./BasicPanel";
import { useSettings } from "../../../stores";
import { Box, Typography } from "@mui/material";

// value symbol
export const CommonConnectInProgress = (props: PanelProps) => {
  const { isMobile } = useSettings();

  const providerName = props.providerName;
  const propsPatch = {
    providerName,
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelProviderProcessing", {
      name: isMobile
        ? "DApp, network:" + props?.network
        : providerName
        ? providerName + ", network:" + props?.network
        : props.t("labelUnknown") + ", network:" + props?.network,
    }),
  };
  return <ConnectBase {...propsPatch} {...props} />;
};

export const WalletConnectConnectInProgress = (props: PanelProps) => {
  const propsPatch = {
    providerName: ConnectProviders.WalletConnect,
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelProviderProcessing", {
      name: ConnectProviders.WalletConnect,
    }),
  };
  return <ConnectBase {...propsPatch} {...props} />;
};

// value symbol
export const ConnectSuccess = (props: PanelProps) => {
  const propsPatch = {
    providerName: undefined,
    iconType: IconType.DoneIcon,
    describe1: props.t("labelSuccessConnect", {
      providerName: props.providerName,
    }),
    describe2: (
      <Box display={"flex"} marginTop={0} alignItems={"flex-center"}>
        <Typography
          marginX={3}
          whiteSpace={"pre-line"}
          variant={"h5"}
          textAlign={"center"}
          color={"textPrimary"}
          component={"div"}
          marginTop={0}
          alignSelf={"flex-center"}
          paddingX={1}
        >
          {props.t("labelSuccessConnectDescribe")}
        </Typography>
      </Box>
    ),
  };
  return <ConnectBase {...propsPatch} {...props} />;
};

// value symbol
export const ConnectFailed = ({ NetWorkItems, ...props }: PanelProps) => {
  const propsPatch = {
    providerName: undefined,
    iconType: IconType.FailedIcon,
    describe1: props.t("labelFailedConnect"),
    describe2: <>{NetWorkItems}</>,
  };
  return <ConnectBase {...propsPatch} {...props} />;
};

export const ConnectReject = ({ NetWorkItems, ...props }: PanelProps) => {
  const propsPatch = {
    providerName: undefined,
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelRejectConnect"),
    describe2: <>{NetWorkItems}</>,
  };
  return <ConnectBase {...propsPatch} {...props} />;
};
