import {
  Box,
  ListItem,
  ListItemProps,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";
import * as sdk from "@loopring-web/loopring-sdk";

import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  Button,
  ButtonListRightStyled,
  GuardianStep,
  InputCode,
  ModalCloseButton,
  SwitchPanelStyled,
} from "@loopring-web/component-lib";
import { LoopringAPI } from "../../api_wrapper";
import Web3 from "web3";

import { connectProvides } from "@loopring-web/web3-provider";
import { useAccount } from "../../stores/account";
import { useSystem } from "../../stores/system";
import {
  SDK_ERROR_MAP_TO_UI,
  SecurityIcon,
} from "@loopring-web/common-resources";

const HebaoGuardianStyled = styled(ListItem)<ListItemProps>`
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
          min-width={200}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"flex-end"}
          justifyContent={"center"}
          title={type}
        >
          <Typography color={"--color-text-secondary"} paddingRight={1}>
            {type.replace("_", " ").toUpperCase()}
          </Typography>
          <ButtonListRightStyled
            item
            xs={5}
            marginTop={1}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"flex-end"}
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
  handleOpenModal,
}: {
  guardiansList: G[];
  guardianConfig: any;
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
            <Box padding={3}>
              <InputCode
                length={VCODE_UNIT}
                onComplete={submitApprove}
                loading={false}
              />
              <Box display={"flex"} marginTop={4} justifyContent={"center"}>
                <Button
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
          <Typography paddingX={5 / 2} component={"h3"} variant={"h5"}>
            {t("labelCommonList")}
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
        <Box flex={1}>
          {guardiansList.map((guardian, index) => {
            return (
              <HebaoGuardianItem
                key={index}
                guardian={guardian}
                submitApprove={submitApprove}
                handleReject={handleReject}
                handleOpenApprove={handleOpenApprove}
              />
            );
          })}
        </Box>
      </Box>
    </>
  );
};
