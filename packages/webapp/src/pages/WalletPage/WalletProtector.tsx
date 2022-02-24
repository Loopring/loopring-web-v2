import styled from "@emotion/styled";
import {
  Box,
  ListItem,
  ListItemProps,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  ButtonListRightStyled,
  EmptyDefault,
  Button,
  ModalQRCode,
  GuardianStep,
} from "@loopring-web/component-lib";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  ConnectProviders,
  Layer1Action,
  LoadingIcon,
  LockIcon,
  SDK_ERROR_MAP_TO_UI,
  SecurityIcon,
  // SoursURL,
} from "@loopring-web/common-resources";
import { useAccount } from "../../stores/account";
import { useSystem } from "../../stores/system";
import { LoopringAPI } from "../../api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import * as sdk from "@loopring-web/loopring-sdk";
import { ChainId } from "@loopring-web/loopring-sdk";
import { useLayer1Store } from "../../stores/localStore/layer1Store";

const HebaoProtectStyled = styled(ListItem)<ListItemProps>`
  height: var(--Hebao-activited-heigth);
  overflow: hidden;
  background-color: var(--opacity);
  padding-bottom: 0;
  .guardian-content {
    padding: ${({ theme }) => theme.unit}px 0px;
  }
  &:not(:last-child) {
    .guardian-content {
      border-bottom: 1px solid var(--color-divide);
    }

    // margin-bottom: ${({ theme }) => theme.unit}px;
  }

  .MuiListItemText-root {
    margin-top: 0;
    white-space: pre-line;
  }
  .description {
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: pre-line;
  }
  .MuiListItemAvatar-root {
    width: 1em;
    height: 100%;
  }
` as (prosp: ListItemProps) => JSX.Element;

export const useHebaoProtector = <T extends sdk.Protector>({
  guardianConfig,
  handleOpenModal,
  loadData,
}: {
  guardianConfig: any;
  // isContractAddress: boolean;
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void;
  loadData: () => Promise<void>;
}) => {
  const { account } = useAccount();
  const { chainId, gasPrice } = useSystem();
  const { t } = useTranslation(["error"]);
  const { setOneItem } = useLayer1Store();
  const onLock = React.useCallback(
    async (item: T) => {
      // const [isContract1XAddress, setIsContract1XAddress] = React.useState(false);
      const config = guardianConfig.actionGasSettings.find(
        (item: any) => item.action === "META_TX_LOCK_WALLET_WA"
      );
      const guardianModule = guardianConfig.supportContracts.find(
        (ele: any) => ele.contractName.toUpperCase() === "GUARDIAN_MODULE"
      ).contractAddress;
      if (LoopringAPI?.walletAPI) {
        const isVersion1 = await LoopringAPI.walletAPI
          ?.getWalletType({
            wallet: item.address, //account.accAddress,
          })
          .then(({ walletType }) => {
            if (
              walletType &&
              walletType.loopringWalletContractVersion?.startsWith("V1_")
            ) {
              return true;
            } else {
              return false;
            }
          });
        const params: sdk.LockHebaoHebaoParam = {
          web3: connectProvides.usedWeb3 as any,
          from: account.accAddress,
          contractAddress: isVersion1 ? guardianModule : item.address,
          wallet: item.address,
          gasPrice,
          gasLimit: config.gasLimit ?? 15000,
          chainId: chainId as any,
          isVersion1,
          sendByMetaMask:
            connectProvides.provideName === ConnectProviders.MetaMask,
        };
        try {
          const { error } = await LoopringAPI.walletAPI.lockHebaoWallet(params);
          const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001];
          if (error) {
            handleOpenModal({
              step: GuardianStep.LockAccount_Failed,
              options: {
                error: errorItem ? t(errorItem.messageKey) : error.message,
              },
            });
          } else {
            setOneItem({
              chainId: chainId as ChainId,
              uniqueId: item.address,
              domain: Layer1Action.GuardianLock,
            });
            handleOpenModal({
              step: GuardianStep.LockAccount_Success,
            });
            loadData();
          }
        } catch (reason) {
          // result.code = ActionResultCode.ApproveFailed;
          // result.data = reason;
          sdk.dumpError400(reason);
          handleOpenModal({
            step: GuardianStep.LockAccount_User_Denied,
            options: { error: reason.message },
          });
        }
      }
    },
    [guardianConfig, handleOpenModal]
  );
  return {
    onLock,
  };
};

export const HebaoProtectItem = <T extends sdk.Protector>(
  props: T & { onClick: () => void }
) => {
  const { t } = useTranslation("common");
  const { address, ens, lockStatus, onClick } = props;
  const statusView = React.useMemo(() => {
    switch (lockStatus) {
      case "UNLOCK_FAILED":
      case "LOCKED":
        return (
          <>
            <LockIcon color={"error"} fontSize={"medium"} />
            <Typography
              color={"error"}
              paddingLeft={1}
              variant={"body1"}
              component={"span"}
              alignItems={"center"}
              display={"inline-flex"}
              lineHeight={"inherit"}
            >
              {"LOCKED"}
            </Typography>
          </>
        );
      case "UNLOCK_WAITING":
        return (
          <>
            <LoadingIcon color={"warning"} fontSize={"medium"} />
            <Typography
              color={"warning"}
              paddingLeft={1}
              variant={"body1"}
              component={"span"}
              alignItems={"center"}
              display={"inline-flex"}
              lineHeight={"inherit"}
            >
              {"UNLOCKING"}
            </Typography>
          </>
        );
      case "LOCK_WAITING":
        return (
          <>
            <LockIcon color={"warning"} fontSize={"medium"} />
            <Typography
              color={"var(--color-warning)"}
              paddingLeft={1}
              variant={"body1"}
              component={"span"}
              alignItems={"center"}
              display={"inline-flex"}
              lineHeight={"inherit"}
            >
              {"LOCKING"}
            </Typography>
          </>
        );
      case "LOCK_FAILED":
      case "CREATED":
        return (
          <Button
            variant={"contained"}
            size={"small"}
            color={"primary"}
            startIcon={<LockIcon htmlColor={"var(--color-text-button)"} />}
            onClick={() => onClick()}
          >
            {t("labelLock")}
          </Button>
        );
    }
  }, [lockStatus]);

  return (
    <HebaoProtectStyled alignItems="flex-start" className={`Hebao`}>
      <Box
        flex={1}
        className={"guardian-content"}
        component={"section"}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDirection={"row"}
        overflow={"hidden"}
        paddingX={2}
      >
        <Box flex={1}>
          <ListItemText
            className="description description1"
            primary={ens ? ens : t("labelUnknown")}
            primaryTypographyProps={{
              component: "p",
              variant: "h5",
              color: "textPrimary",
            }}
          />

          <ListItemText
            primary={address}
            primaryTypographyProps={{ component: "p", color: "textSecondary" }}
          />
        </Box>
        <Box
          width={100}
          display={"flex"}
          justifyContent={"flex-end"}
          title={lockStatus}
          alignItems={"center"}
        >
          {statusView}
        </Box>
      </Box>
    </HebaoProtectStyled>
  );
};
export const WalletProtector = <T extends sdk.Protector>({
  protectList,
  guardianConfig,
  handleOpenModal,
  loadData,
  onOpenAdd,
}: // isContractAddress,
{
  protectList: T[];
  onOpenAdd: () => void;
  guardianConfig: any;
  loadData: () => Promise<void>;
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void;
  // isContractAddress: boolean;
}) => {
  const { account } = useAccount();
  const { t } = useTranslation(["common"]);
  const { onLock } = useHebaoProtector({
    guardianConfig,
    handleOpenModal,
    loadData,
  });

  return (
    <>
      <Box
        paddingTop={3}
        borderRadius={2}
        flex={1}
        display={"flex"}
        flexDirection={"column"}
      >
        <Box display={"flex"} justifyContent={"space-between"} paddingX={5 / 2}>
          <Typography component={"h3"} variant={"h5"}>
            {t("labelWalletGuardianList")}
          </Typography>
          <ButtonListRightStyled
            item
            xs={5}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"flex-end"}
          >
            <Button
              variant={"contained"}
              size={"small"}
              color={"primary"}
              startIcon={
                <SecurityIcon htmlColor={"var(--color-text-button)"} />
              }
              onClick={() => onOpenAdd()}
            >
              {t("labelAddProtector")}
            </Button>
          </ButtonListRightStyled>
        </Box>
        <Box flex={1} alignItems={"center"} marginTop={2}>
          {protectList.length ? (
            <>
              {protectList.map((item) => (
                <HebaoProtectItem
                  key={item.address}
                  {...{ ...item }}
                  onClick={() => {
                    onLock(item);
                    handleOpenModal({
                      step: GuardianStep.LockAccount_WaitForAuth,
                      options: { lockRetry: onLock, lockRetryParams: item },
                    });
                  }}
                />
              ))}
            </>
          ) : (
            <EmptyDefault
              style={{ alignSelf: "center" }}
              height={"100%"}
              message={() => (
                <Box
                  flex={1}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  {t("labelNoContent")}
                </Box>
              )}
            />
          )}
        </Box>
      </Box>
    </>
  );
};
