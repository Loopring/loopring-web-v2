import { Box, Link, Typography } from "@mui/material";
import { TFunction, Trans, withTranslation } from "react-i18next";
import {
  Account,
  DoneIcon,
  FailedIcon,
  L1L2_NAME_DEFINED,
  LinkIcon,
  LoadingIcon,
  MapChainId,
  RefuseIcon,
  SoursURL,
  SubmitIcon,
  TransErrorHelp,
} from "@loopring-web/common-resources";
import React from "react";

import { Button, TextareaAutosizeStyled } from "../../basic-lib";
import { RESULT_INFO } from "@loopring-web/loopring-sdk";
import { ConnectProviders } from "@loopring-web/web3-provider";
import { DropdownIconStyled } from "../../tradePanel";
import { useSettings } from "../../../stores";
import { sanitize } from "dompurify";
import styled from "@emotion/styled";

export enum IconType {
  LoadingIcon,
  DoneIcon,
  FailedIcon,
  RefuseIcon,
  SubmitIcon,
  PendingIcon,
}

export interface PanelProps {
  title?: string;
  iconType?: IconType;
  value?: number | string;
  symbol?: string;
  hash?: string;
  info?: any;
  describe1?: any;
  describe2?: any;
  chainInfos?: any;
  txCheck?: {
    route: string;
    callback: (e?: any) => void;
  };
  to?: string;
  btnInfo?: {
    btnTxt: any;
    param?: { [key: string]: string };
    callback: (e?: any) => void;
  };
  providerName?: ConnectProviders | "unknown" | undefined;
  link?: {
    name: string;
    url: string;
  };
  t: TFunction;
  account?: Account;
  etherscanBaseUrl?: string;
  patch?: any;
  error?: RESULT_INFO;
  errorOptions?: any;
  updateDepositHash?: any;
  className?: string;

  [key: string]: any;
}

const BoxStyle = styled(Box)`
  &.btrade-panel {
    .status-icon {
      margin-top: ${({ theme }) => theme.unit * 2}px;
    }

    .content-main {
      align-self: stretch;

      & > div {
        align-self: stretch;
      }
    }
  }
`;

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
    className,
    link,
  }: PanelProps) => {
    const isLoading = iconType === IconType.LoadingIcon;

    const size = isLoading ? 60 : 60;

    // const marginTopIcon = isLoading ? 0 : 8;

    const marginTopDescribe1 = isLoading ? 2 : 3;

    // const marginProvider = 9;
    // const marginTopBtn = link ? 8 : 11;

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
        case IconType.PendingIcon:
          return (
            <LoadingIcon
              color={"primary"}
              style={{ width: size, height: size }}
            />
          );
      }
    }, [iconType, size]);

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
    const [dropdownStatus, setDropdownStatus] =
      React.useState<"up" | "down">("down");
    const { isMobile, defaultNetwork } = useSettings();
    const network = MapChainId[defaultNetwork] ?? MapChainId[1];

    return (
      <BoxStyle
        flex={1}
        display={"flex"}
        alignItems={"center"}
        flexDirection={"column"}
        paddingBottom={4}
        width={"100%"}
        className={className}
      >
        <Typography
          component={"h3"}
          variant={isMobile ? "h4" : "h3"}
          whiteSpace={"pre"}
        >
          {t(title as string, {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
          })}
        </Typography>
        <Box
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"space-between"}
          className={"content-main"}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            flex={1}
          >
            <Typography
              component={"div"}
              display={"flex"}
              alignItems={"flex-start"}
              flexDirection={"column"}
              className={"status-icon"}
            >
              {iconDiv}
            </Typography>
            {describe1 && (
              <Box
                display={"flex"}
                marginTop={marginTopDescribe1}
                alignItems={"flex-center"}
              >
                {iconType === IconType.FailedIcon ? (
                  <Typography
                    component={"span"}
                    marginX={3}
                    whiteSpace={"pre-line"}
                    variant={"body1"}
                    marginBottom={2}
                    alignSelf={"flex-center"}
                    paddingX={1}
                    marginY={1}
                    textAlign={"center"}
                  >
                    {error ? (
                      <Typography
                        color={"var(--color-error)"}
                        component={"span"}
                        variant={"inherit"}
                        display={"inline-flex"}
                        alignItems={"center"}
                        onClick={() =>
                          setDropdownStatus((prev) =>
                            prev === "up" ? "down" : "up"
                          )
                        }
                      >
                        <TransErrorHelp error={error} options={errorOptions} />
                        <DropdownIconStyled
                          status={dropdownStatus}
                          fontSize={"medium"}
                        />
                      </Typography>
                    ) : typeof describe1 === "string" ? (
                      <Typography
                        color={"var(--color-error)"}
                        component={"span"}
                        variant={"inherit"}
                        display={"inline-flex"}
                        onClick={() =>
                          setDropdownStatus((prev) =>
                            prev === "up" ? "down" : "up"
                          )
                        }
                        dangerouslySetInnerHTML={{
                          __html: sanitize(describe1),
                        }}
                      />
                    ) : (
                      <>{describe1}</>
                    )}
                    {dropdownStatus === "up" && (
                      <TextareaAutosizeStyled
                        aria-label="Error Description"
                        minRows={5}
                        style={{ maxHeight: "90px", overflow: "scroll" }}
                        disabled={true}
                        value={`${JSON.stringify(error)}}`}
                      />
                    )}

                    {/*{\`Error Description:\\n {code: ${error?.code}, message:${error?.message}}\`}*/}
                  </Typography>
                ) : typeof describe1 === "string" ? (
                  <Typography
                    component={"span"}
                    variant={"h5"}
                    whiteSpace={"pre-line"}
                    textAlign={"center"}
                    color={
                      iconType === IconType.SubmitIcon ||
                      iconType === IconType.DoneIcon
                        ? "var(--color-success)"
                        : iconType === IconType.RefuseIcon
                        ? "var(--color-error)"
                        : "textPrimary"
                    }
                    marginTop={0}
                    alignSelf={"flex-center"}
                    paddingX={2}
                    sx={{ wordBreak: "break-all" }}
                    dangerouslySetInnerHTML={{
                      __html: sanitize(describe1),
                    }}
                  />
                ) : (
                  <Typography
                    component={"span"}
                    variant={"h5"}
                    whiteSpace={"pre-line"}
                    textAlign={"center"}
                    color={
                      iconType === IconType.SubmitIcon ||
                      iconType === IconType.DoneIcon
                        ? "var(--color-success)"
                        : iconType === IconType.RefuseIcon
                        ? "var(--color-error)"
                        : "textPrimary"
                    }
                    marginTop={0}
                    alignSelf={"flex-center"}
                    paddingX={2}
                    sx={{ wordBreak: "break-all" }}
                  >
                    {describe1}
                  </Typography>
                )}

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
            {!!describe2 && <>{describe2}</>}
          </Box>
          {providerName && (
            <Typography
              variant={"body2"}
              color={"textSecondary"}
              component={"span"}
              paddingX={5}
              alignSelf={"flex-start"}
            >
              {providerDescribe}
            </Typography>
          )}
        </Box>
        {btnInfo && (
          <Box
            width={"100%"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"flex-end"}
          >
            <Box alignSelf={"stretch"} paddingX={5}>
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
                {t(btnInfo?.btnTxt, { ...btnInfo?.param })}
              </Button>
            </Box>

            {link && (
              <Box
                marginTop={marginToplink}
                alignSelf={"flex-center"}
                paddingX={0}
              >
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
                  {["Txn Hash", "Banxa Status"].includes(link.name) && (
                    <Typography
                      component={"span"}
                      paddingLeft={1}
                      color={"secondary"}
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
        )}
      </BoxStyle>
    );
  }
);

export const ConnectBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelConnectWallet",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const CreateAccountBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelCreateAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const RetrieveAccountBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelRetrieveAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const UnlockAccountBase = (props: PanelProps) => {
  const propsPatch = {
    ...props,
    title: "labelUnlockAccount",
  };

  return <BasicPanel {...propsPatch} />;
};

export const UpdateAccountBase = (props: PanelProps) => {
  const propsPatch = {
    title: props.patch?.isReset ? "labelResetAccount" : "labelUpdateAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const ExportAccountBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelExportAccount",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const DepositBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelL1toL2",
  };

  return <BasicPanel {...props} {...propsPatch} />;
};

export const MintBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelNFTMint",
  };
  return <BasicPanel {...props} {...propsPatch} />;
};

export const DeployBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelNFTDeployTitle",
  };
  return <BasicPanel {...props} {...propsPatch} />;
};

export const ForceWithdrawBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelForceWithdrawTitle",
  };
  return <BasicPanel {...props} {...propsPatch} />;
};
export const ClaimWithdrawBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelClaimWithdrawTitle",
  };
  return <BasicPanel {...props} {...propsPatch} />;
};

export const TransferBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelL2toL2Title",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const WithdrawBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelL2ToL1Title",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const AmmBase = (props: PanelProps) => {
  return <BasicPanel title={"labelAMMTitle"} {...props} />;
};

export const DualBase = (props: PanelProps & { showTitle: boolean }) => {
  const { showTitle } = props;
  return (
    <BasicPanel title={showTitle ? "labelDualTitle" : undefined} {...props} />
  );
};

export const RedPacketBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelSendRedPacketTitle",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const RedPacketOpenBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelRedPacketOpen",
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const BtradeBase = (props: PanelProps) => {
  const propsPatch = {
    title: "labelBtradeTitle",
  };

  return <BasicPanel className={"btrade-panel"} {...props} {...propsPatch} />;
};
