import { Box, Typography } from "@mui/material";
import { Trans, withTranslation, WithTranslation } from "react-i18next";
import {
  DoneIcon,
  FailedIcon,
  RefuseIcon,
  SubmitIcon,
  LinkIcon,
  SoursURL,
  TransErrorHelp,
} from "@loopring-web/common-resources";
import React from "react";

import { Button } from "../../basic-lib";
import { Link } from "@mui/material";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";
import { ConnectProviders } from "@loopring-web/web3-provider";

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
  providerName?: ConnectProviders | "unknown";
  link?: {
    name: string;
    url: string;
  };
  patch?: any;
  error?: RESULT_INFO;
  errorOptions?: any;
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
    error,
    errorOptions,
    link,
  }: PanelProps & WithTranslation) => {
    const isLoading = iconType === IconType.LoadingIcon;

    const size = isLoading ? 60 : 60;

    const marginTopIcon = isLoading ? 0 : 8;

    const marginTopDescribe1 = isLoading ? 2 : 3;

    const marginProvider = 9;

    const marginTopBtn = link ? 8 : 11;

    const marginToplink = 2;

    const iconDiv = React.useMemo(() => {
      switch (iconType) {
        case IconType.LoadingIcon:
          return (
            <img
              className="loading-gif"
              alt={"loading"}
              width={size}
              src={`${SoursURL}images/loading-line.gif`}
            />
            // <LoadingIcon
            //   color={"primary"}
            //   style={{ width: size, height: size }}
            // />
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
          case ConnectProviders.Coinbase:
            return (
              <Trans
                i18nKey={"labelProviderCommonProcessDescribe"}
                tOptions={{ name: providerName }}
              >
                Please click approve button on {providerName} popup window. When
                {providerName} dialog is dismiss, please manually click
                <img
                  alt="MetaMask"
                  style={{ verticalAlign: "text-bottom" }}
                  src={SoursURL + `images/${providerName}PlugIn.png`}
                />
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
        paddingBottom={4}
      >
        <Typography component={"h3"} variant={"h3"}>
          {t(title as string)}
        </Typography>
        <Typography
          marginTop={marginTopIcon}
          component={"div"}
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
              component={"div"}
              marginTop={0}
              alignSelf={"flex-center"}
              paddingRight={1}
            >
              {describe1}
            </Typography>
            {txCheck && (
              <Link
                target="_blank"
                rel="noopener noreferrer"
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
              textAlign={"center"}
              color={"textPrimary"}
              component={"div"}
              marginTop={0}
              alignSelf={"flex-center"}
              paddingX={1}
            >
              {describe2}
            </Typography>
          </Box>
        )}
        {iconType == IconType.FailedIcon && error && (
          <Typography
            marginX={3}
            whiteSpace={"pre-line"}
            variant={"body2"}
            color={"var(--color-text-third)"}
            component={"div"}
            marginBottom={2}
            alignSelf={"flex-center"}
            paddingX={1}
            marginY={1}
          >
            {`${t("labelErrorTitle")}`}
            {error && <TransErrorHelp error={error} options={errorOptions} />}
            {/*{\`Error Description:\\n {code: ${error?.code}, message:${error?.message}}\`}*/}
          </Typography>
        )}

        {providerName && (
          <Typography
            variant={"body2"}
            color={"textSecondary"}
            component={"div"}
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
              {t(btnInfo?.btnTxt)}
            </Button>
          </Box>
        )}

        {link && (
          <Box marginTop={marginToplink} alignSelf={"flex-center"} paddingX={0}>
            <Link
              variant={"body1"}
              display={"inline-flex"}
              alignItems={"center"}
              color={"secondary"}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.name}
              {link.name === "Txn Hash" && (
                <Typography
                  paddingLeft={1}
                  color={"secondary"}
                  component={"span"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  <LinkIcon color={"inherit"} fontSize={"medium"} />
                </Typography>
              )}
            </Link>
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
