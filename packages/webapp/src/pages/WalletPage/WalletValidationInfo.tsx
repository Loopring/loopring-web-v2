import {
  Box,
  Grid,
  ListItem,
  ListItemProps,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";
import * as sdk from "@loopring-web/loopring-sdk";

import styled from "@emotion/styled";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  Button,
  ButtonListRightStyled,
  EmptyDefault,
  GuardianStep,
  InputCode,
  ModalCloseButton,
  SwitchPanelStyled,
} from "@loopring-web/component-lib";
import { LoopringAPI } from "@loopring-web/core";
import Web3 from "web3";

import { connectProvides } from "@loopring-web/web3-provider";
import { useAccount } from "@loopring-web/core";
import { useSystem } from "@loopring-web/core";
import {
  myLog,
  RefreshIcon,
  SDK_ERROR_MAP_TO_UI,
  SecurityIcon,
  SoursURL,
} from "@loopring-web/common-resources";

const HebaoGuardianStyled = styled(ListItem)<ListItemProps>`
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

export const HebaoGuardianItem = <G extends sdk.Guardian>({
  guardian,
  handleOpenApprove,
  handleReject,
}: {
  submitApprove: (args: any) => void;
  handleOpenApprove: (guardians: G) => void;
  handleReject: (guardians: G) => void;
  guardian: G;
}) => {
  const { t } = useTranslation("common");
  const { address, ens, type } = guardian;

  return (
    <HebaoGuardianStyled alignItems="flex-start" className={`Hebao`}>
      <Box
        flex={1}
        className={"guardian-content"}
        component={"section"}
        display={"flex"}
        alignItems={"stretch"}
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
        <Box
          display={"flex"}
          padding={1}
          justifyContent={"space-between"}
          flex={1}
          alignItems={"center"}
        >
          <Typography color={"--color-text-secondary"} paddingRight={1}>
            <Trans
              i18nKey={"labelWalletSignType"}
              tOptions={{ type: t("labelTxGuardian_" + type) }}
            >
              Request for {type?.replace("_", " ").toUpperCase() ?? "Unknown"}
            </Trans>
          </Typography>
          <ButtonListRightStyled
            item
            xs={5}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"center"}
          >
            <Button
              variant={"contained"}
              size={"small"}
              color={"primary"}
              onClick={() => handleOpenApprove(guardian)}
            >
              <Typography paddingX={2}> {t("labelApprove")}</Typography>
            </Button>
            <Button
              variant={"outlined"}
              color={"primary"}
              onClick={() => handleReject(guardian)}
            >
              <Typography paddingX={2}> {t("labelReject")} </Typography>
            </Button>
          </ButtonListRightStyled>
        </Box>
      </Box>
    </HebaoGuardianStyled>
  );
};

export const WalletValidationInfo = <G extends sdk.Guardian>({
  guardiansList,
  loadData,
  onOpenAdd,
  // isLoading,
  handleOpenModal,
}: {
  guardiansList: G[];
  guardianConfig: any;
  // isLoading: boolean;
  loadData: () => Promise<void>;
  onOpenAdd: () => void;
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void;
}) => {
  const { t } = useTranslation(["common", "error"]);

  const [openCode, setOpenCode] = React.useState(false);
  const [selected, setSelected] = React.useState<G | undefined>();
  const [isFirstTime, setIsFirstTime] = React.useState<boolean>(true);
  const { account } = useAccount();
  const { chainId } = useSystem();

  const VCODE_UNIT = 6;

  const submitApprove = (code: string) => {
    setOpenCode(false);
    handleOpenModal({
      step: GuardianStep.Approve_WaitForAuth,
      options: {
        approveRetry: () => {
          submitApprove(code);
        },
      },
    });
    if (LoopringAPI.walletAPI && selected) {
      const request: sdk.ApproveSignatureRequest = {
        approveRecordId: selected.id,
        txAwareHash: selected.messageHash,
        securityNumber: code,
        signer: account.accAddress,
        signature: "",
      };
      LoopringAPI.walletAPI
        .submitApproveSignature({
          request: request,
          guardian: selected,
          web3: connectProvides.usedWeb3 as Web3,
          chainId: chainId as any,
          eddsaKey: "",
          apiKey: "",
          isHWAddr: !isFirstTime,
          walletType: account.connectName as any,
        })
        .then((response) => {
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            handleOpenModal({
              step: GuardianStep.Approve_Failed,
              options: {
                error: response,
              },
            });
          } else {
            handleOpenModal({
              step: GuardianStep.Approve_Success,
            });
            loadData();
          }
        })
        .catch((error: any) => {
          setIsFirstTime((state) => !state);
          const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001];
          handleOpenModal({
            step: GuardianStep.Approve_Failed,
            options: {
              error: errorItem
                ? t(errorItem.messageKey, { ns: "error" })
                : error.message,
            },
          });
        });
    }
  };
  const handleReject = (guardian: G) => {
    handleOpenModal({
      step: GuardianStep.Reject_WaitForAuth,
      options: {
        approveRetry: () => {
          handleReject(guardian);
        },
      },
    });
    if (LoopringAPI.walletAPI && guardian) {
      const request = {
        approveRecordId: guardian.id,
        signer: account.accAddress,
      };
      LoopringAPI.walletAPI
        .rejectHebao({
          request,
          web3: connectProvides.usedWeb3 as Web3,
          address: account.accAddress,
          chainId: chainId as any,
          guardiaContractAddress: guardian.address,
          walletType: account.connectName as any,
        })
        .then((response) => {
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            handleOpenModal({
              step: GuardianStep.Reject_Failed,
              options: {
                error: response,
              },
            });
          } else {
            handleOpenModal({
              step: GuardianStep.Approve_Success,
            });
            loadData();
          }
        })
        .catch((error: any) => {
          const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001];
          handleOpenModal({
            step: GuardianStep.Approve_Failed,
            options: {
              error: errorItem
                ? t(errorItem.messageKey, { ns: "error" })
                : error.message,
            },
          });
        });
    }
  };
  const handleOpenApprove = (guardians: G) => {
    setOpenCode(true);
    setSelected(guardians);
  };
  return (
    <>
      <Modal open={openCode} onClose={() => setOpenCode(false)}>
        <SwitchPanelStyled>
          <Box display={"flex"} flexDirection={"column"}>
            <ModalCloseButton onClose={() => setOpenCode(false)} t={t as any} />
            <Typography
              component={"p"}
              textAlign={"center"}
              marginBottom={2}
              paddingX={2}
            >
              <Typography
                color={"var(--color-text-primary)"}
                component={"p"}
                variant={"h4"}
                marginBottom={2}
              >
                {t("labelWalletInputGuardianCode")}
              </Typography>
              <Typography
                color={"var(--color-text-secondary)"}
                component={"p"}
                variant={"body1"}
                marginBottom={2}
              >
                {t("labelWalletInputGuardianCodeDes")}
              </Typography>
            </Typography>
            <Box paddingBottom={3}>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <InputCode
                  length={VCODE_UNIT}
                  onComplete={submitApprove}
                  loading={false}
                />
              </Box>
              <Box
                display={"flex"}
                marginTop={4}
                marginX={2}
                justifyContent={"center"}
              >
                <Button
                  fullWidth
                  variant={"contained"}
                  size={"small"}
                  color={"primary"}
                  onClick={() => setOpenCode(false)}
                >
                  <Typography paddingX={2}> {t("labelCancel")}</Typography>
                </Button>
              </Box>
            </Box>
          </Box>
        </SwitchPanelStyled>
      </Modal>
      <Box
        paddingTop={3}
        borderRadius={2}
        flex={1}
        marginBottom={0}
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
            {t("labelCommonList")}
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
              startIcon={
                <SecurityIcon htmlColor={"var(--color-text-button)"} />
              }
              onClick={() => onOpenAdd()}
            >
              {t("labelAddProtector")}
            </Button>
          </ButtonListRightStyled>
        </Box>
        <>
          {!!guardiansList.length ? (
            <Grid
              container
              alignItems={"flex-start"}
              marginTop={2}
              flex={1}
              alignContent={"flex-start"}
            >
              {guardiansList.map((guardian, index) => {
                return (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={6}
                    key={guardian.address + index}
                  >
                    <HebaoGuardianItem
                      guardian={guardian}
                      submitApprove={submitApprove}
                      handleReject={handleReject}
                      handleOpenApprove={handleOpenApprove}
                    />
                  </Grid>
                );
              })}
            </Grid>
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
        </>
      </Box>
    </>
  );
};
