import { DepositBase, IconType, PanelProps } from "./BasicPanel";
import {
  getShortAddr,
  LinkIcon,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import { sanitize } from "dompurify";
import { Box, Link, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { useSettings } from "../../../stores";

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

export const NFTDeposit_WaitForAuth = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTTokenDepositWaitForAuth", {
      loopringL2: "Loopring L2",
      // l2Symbol: "L2",
      // l1Symbol: "L1",
      // ethereumL1:"Ethereum L1",
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
      symbol: sanitize(props.symbol ?? "NFT").toString(),
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Submit = (
  props: PanelProps & Partial<NFTWholeINFO>
) => {
  const { isMobile } = useSettings();
  const { t } = useTranslation();

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
            symbol: sanitize(props.symbol ?? "NFT").toString(),
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
        paddingX={isMobile ? 1 : 0}
      >
        <Typography component={"span"} color={"var(--color-warning)"}>
          {t("labelDepositWaiting")}
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            component={"span"}
            variant={"body1"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelL1toL2NFTAmount")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
          >
            {props.value + " " + props.symbol}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            component={"span"}
            variant={"body1"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelL1toL2From")}
          </Typography>
          <Typography
            component={"span"}
            variant={"body1"}
            color={"var(--color-text-primary)"}
          >
            {"L1: " + getShortAddr(props.account?.accAddress ?? "")}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            component={"span"}
            variant={"body1"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelL1toL2TO", {
              loopringL2: "Loopring L2",
              l2Symbol: "L2",
              l1Symbol: "L1",
              ethereumL1: "Ethereum L1",
            })}
          </Typography>
          <Typography
            component={"span"}
            variant={"body1"}
            color={"var(--color-text-primary)"}
          >
            {props.to
              ? "L2: " + getShortAddr(props.to)
              : t("labelToMyL2", {
                  loopringL2: "Loopring L2",
                  l2Symbol: "L2",
                  l1Symbol: "L1",
                  ethereumL1: "Ethereum L1",
                })}
          </Typography>
        </Typography>
      </Box>
    ),
  };
  return <DepositBase {...propsPatch} {...props} />;
};
