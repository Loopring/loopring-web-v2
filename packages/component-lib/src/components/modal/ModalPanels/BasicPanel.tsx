import { Box, Typography } from "@mui/material";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import {
  ConnectProviders,
  LoadingIcon,
  DoneIcon,
  FailedIcon,
  RefuseIcon,
  SubmitIcon,
  LinkIcon,
  SoursURL,
} from "@loopring-web/common-resources";
import React from "react";

import { Button } from "../../basic-lib";
import { Link } from "@mui/material";

export enum IconType {
  LoadingIcon,
  DoneIcon,
  FailedIcon,
  RefuseIcon,
  SubmitIcon,
}

export interface PanelProps {
  title?: string;
  iconType?: IconType;
  value?: number | string;
  symbol?: string;
  describe1?: any;
  describe2?: any;
  txCheck?: {
    route: string;
    callback: (e?: any) => void;
  };
  btnInfo?: {
    btnTxt: any;
    callback: (e?: any) => void;
  };
  providerName?: "MetaMask" | "WalletConnect" | "unknown";
  link?: {
    name: string;
    url: string;
  };
  patch?: any;
}

export const BasicPanel = withTranslation("common", { withRef: true })(
  ({
    t,
    title,
    iconType,
    describe1,
    describe2,
    txCheck,
    btnInfo,
    providerName,
    link,
  }: PanelProps & WithTranslation) => {
    const isLoading = iconType === IconType.LoadingIcon;

    const size = isLoading ? 72 : 60;

    const marginTopIcon = isLoading ? 7 : 8;

    const marginTopDescribe1 = isLoading ? 2 : 3;

    const marginProvider = 9;

    const marginTopBtn = link ? 8 : 11;

    const marginToplink = 2;

    const iconDiv = React.useMemo(() => {
      switch (iconType) {
        case IconType.LoadingIcon:
          return (
            <LoadingIcon
              color={"primary"}
              style={{ width: size, height: size }}
            />
          );
        case IconType.FailedIcon:
          return (
            <FailedIcon
              style={{ color: "var(--color-error)", width: size, height: size }}
            />
          );
        case IconType.SubmitIcon:
          return (
            <SubmitIcon
              color={"primary"}
              style={{ width: size, height: size }}
            />
          );
        case IconType.RefuseIcon:
          return (
            <RefuseIcon
              style={{
                color: "var(--color-warning)",
                width: size,
                height: size,
              }}
            />
          );
        case IconType.DoneIcon:
          return (
            <DoneIcon
              style={{
                color: "var(--color-success)",
                width: size,
                height: size,
              }}
            />
          );
      }
    }, [iconType]);

    const providerDescribe = React.useMemo(() => {
      if (providerName) {
        switch (providerName) {
          case ConnectProviders.MetaMask:
            return (
              <Trans i18nKey={"labelMetaMaskProcessDescribe"}>
                Please click approve button on MetaMask popup window. When
                MetaMask dialog is dismiss, please manually click{" "}
                <img
                  alt="MetaMask"
                  style={{ verticalAlign: "text-bottom" }}
                  src={SoursURL + "images/MetaMaskPlugIn.png"}
                />{" "}
                on your browser toolbar.
              </Trans>
            );
          case ConnectProviders.WalletConnect:
            return (
              <Trans i18nKey={"labelWalletConnectProcessDescribe2"}>
                Please click approve on your device.
              </Trans>
            );
          default:
            break;
        }
      }
      return <></>;
    }, [providerName]);

    return (
      <Box
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDirection={"column"}
      >
        <Typography component={"h3"} variant={"h3"}>
          {t(title as string)}
        </Typography>
        <Typography
          marginTop={marginTopIcon}
          component={"p"}
          display={"flex"}
          alignItems={"flex-start"}
          flexDirection={"column"}
        >
          {iconDiv}
        </Typography>

        {describe1 && (
          <Box
            display={"flex"}
            marginTop={marginTopDescribe1}
            alignItems={"flex-center"}
          >
            <Typography
              variant={"h5"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
              color={"textPrimary"}
              component={"p"}
              marginTop={0}
              alignSelf={"flex-center"}
              paddingRight={1}
            >
              {describe1}
            </Typography>
            {txCheck && (
              <Link
                target="_blank"
                href={txCheck.route}
                display={"inline-block"}
                marginTop={1 / 4}
              >
                <LinkIcon
                  color={"primary"}
                  fontSize={"small"}
                  style={{ verticalAlign: "middle" }}
                />
              </Link>
            )}
          </Box>
        )}

        {describe2 && (
          <Box
            flex={1}
            display={"flex"}
            marginTop={0}
            alignItems={"flex-center"}
          >
            <Typography
              marginX={3}
              whiteSpace={"pre-line"}
              variant={"h5"}
              color={"textPrimary"}
              component={"p"}
              marginTop={0}
              alignSelf={"flex-center"}
              paddingX={1}
            >
              {describe2}
            </Typography>
          </Box>
        )}

        {providerName && (
          <Typography
            variant={"body2"}
            color={"textSecondary"}
            component={"p"}
            paddingX={5}
            marginTop={marginProvider}
            alignSelf={"flex-start"}
          >
            {providerDescribe}
          </Typography>
        )}

        {btnInfo && (
          <Box marginTop={marginTopBtn} alignSelf={"stretch"} paddingX={5}>
            <Button
              variant={"contained"}
              fullWidth
              size={"medium"}
              onClick={(e?: any) => {
                if (btnInfo?.callback) {
                  btnInfo.callback(e);
                }
              }}
            >
              {t(btnInfo?.btnTxt)}{" "}
            </Button>
          </Box>
        )}

        {link && (
          <Box marginTop={marginToplink} alignSelf={"flex-center"} paddingX={0}>
            <Typography
              variant={"body2"}
              color={"textSecondary"}
              component={"p"}
              alignSelf={"flex-center"}
            >
              <Link color={"textSecondary"} href={link.url}>
                {link.name}
              </Link>
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
);

export const ConnectBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelConnectWallet",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const CreateAccountBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelCreateAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const RetrieveAccountBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelRetrieveAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const UnlockAccountBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelUnlockAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const UpdateAccountBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: props.patch?.isReset ? "labelResetAccount" : "labelUpdateAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const ExportAccountBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelExportAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const DepositBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelDeposit",
  };
  return <BasicPanel {...props} {...propsPatch} />;
};

export const MintBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelNFTMint",
  };
  return <BasicPanel {...props} {...propsPatch} />;
};

export const DeployBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelNFTDeploy",
  };
  return <BasicPanel {...props} {...propsPatch} />;
};

export const TransferBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelTransfer",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const WithdrawBase = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    title: "labelWithdraw",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};
