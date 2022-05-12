import styled from "@emotion/styled";
import {
  Box,
  Grid,
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
  Layer1Action,
  LoadingIcon,
  LockIcon,
  myLog,
  RefreshIcon,
  SDK_ERROR_MAP_TO_UI,
  SecurityIcon,
} from "@loopring-web/common-resources";
import {
  useAccount,
  layer1Store,
  useSystem,
  LoopringAPI,
} from "@loopring-web/core";
import { connectProvides } from "@loopring-web/web3-provider";
import * as sdk from "@loopring-web/loopring-sdk";

const HebaoProtectStyled = styled(ListItem)<ListItemProps>`
  height: var(--Hebao-activited-heigth);
  overflow: hidden;
  background-color: var(--opacity);
  padding-bottom: 0;
  &:hover {
    background-color: var(--opacity);
  }
  .guardian-content {
    padding: ${({ theme }) => 2 * theme.unit}px ${({ theme }) => theme.unit}px;
    border-radius: ${({ theme }) => theme.unit / 2}px;
    background-color: var(--field-opacity);
    .description {
      padding: 0 ${({ theme }) => 1 * theme.unit}px;
    }
  }
  // &:not(:last-child) {
  //   .guardian-content {
  //     border-bottom: 1px solid var(--color-divide);
  //   }
  //
  //   // margin-bottom: ${({ theme }) => theme.unit}px;
  // }

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
  const { setOneItem } = layer1Store.useLayer1Store();
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
        const [isVersion1, nonce] = await Promise.all([
          LoopringAPI.walletAPI
            .getWalletType({
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
            }),
          sdk.getNonce(connectProvides.usedWeb3 as any, account.accAddress),
        ]);
        const params: sdk.LockHebaoHebaoParam = {
          web3: connectProvides.usedWeb3 as any,
          from: account.accAddress,
          contractAddress: isVersion1 ? guardianModule : item.address,
          wallet: item.address,
          gasPrice,
          gasLimit: config.gasLimit ?? 15000,
          chainId: chainId as any,
          isVersion1,
          nonce,
          sendByMetaMask: true,
        };
        myLog("LockHebaoHebaoParam params", params);
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
              chainId: chainId as sdk.ChainId,
              uniqueId: item.address,
              domain: Layer1Action.GuardianLock,
            });
            handleOpenModal({
              step: GuardianStep.LockAccount_Success,
            });
            loadData();
          }
        } catch (reason: any) {
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
    [
      guardianConfig.actionGasSettings,
      guardianConfig.supportContracts,
      account.accAddress,
      gasPrice,
      chainId,
      handleOpenModal,
      t,
      setOneItem,
      loadData,
    ]
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
              height={32}
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
        alignItems={"flex-start"}
        justifyContent={"space-between"}
        flexDirection={"column"}
        overflow={"hidden"}
        paddingX={2}
      >
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
          className="description description1"
          primaryTypographyProps={{ component: "p", color: "textSecondary" }}
        />
        <Typography
          display={"inline-flex"}
          className="description description1"
          alignSelf={"flex-end"}
          alignItems={"center"}
          height={32}
        >
          {statusView}
        </Typography>
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
}: {
  protectList: T[];
  onOpenAdd: () => void;
  guardianConfig: any;
  loadData: () => Promise<void>;
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void;
}) => {
  const { t } = useTranslation(["common"]);
  const { onLock } = useHebaoProtector({
    guardianConfig,
    handleOpenModal,
    loadData,
  });

  return (
    <Box
      paddingTop={3}
      borderRadius={2}
      flex={1}
      display={"flex"}
      flexDirection={"column"}
    >
      <Box display={"flex"} justifyContent={"space-between"} paddingX={5 / 2}>
        <Typography
          component={"h3"}
          variant={"h5"}
          display={"inline-flex"}
          alignItems={"center"}
        >
          {t("labelWalletGuardianList")}
          <RefreshIcon
            style={{ marginLeft: 8, cursor: "pointer" }}
            color={"inherit"}
            onClick={loadData}
          />
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
            startIcon={<SecurityIcon htmlColor={"var(--color-text-button)"} />}
            onClick={() => onOpenAdd()}
          >
            {t("labelAddProtector")}
          </Button>
        </ButtonListRightStyled>
      </Box>

      {
        <Grid
          container
          alignItems={"flex-start"}
          marginTop={2}
          flex={1}
          alignContent={"flex-start"}
        >
          {!!protectList.length ? (
            <>
              {protectList.map((item) => (
                <Grid item xs={12} md={6} lg={6} key={item.address}>
                  <HebaoProtectItem
                    {...{ ...item }}
                    onClick={() => {
                      onLock(item);
                      handleOpenModal({
                        step: GuardianStep.LockAccount_WaitForAuth,
                        options: { lockRetry: onLock, lockRetryParams: item },
                      });
                    }}
                  />
                </Grid>
              ))}
            </>
          ) : (
            <Box flex={1} height={"100%"} width={"100%"}>
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
            </Box>
          )}
        </Grid>
      }
    </Box>
  );
};
