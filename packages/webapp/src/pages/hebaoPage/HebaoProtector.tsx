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
  HebaoStep,
} from "@loopring-web/component-lib";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  LoadingIcon,
  LockIcon,
  SecurityIcon,
} from "@loopring-web/common-resources";
import { useAccount } from "../../stores/account";
import { Protector } from "@loopring-web/loopring-sdk";
import { useHebaoProtector } from "./hook";

const HebaoProtectStyled = styled(ListItem)<ListItemProps>`
  height: var(--Hebao-activited-heigth);
  overflow: hidden;
  background-color: var(--opacity);
  padding-bottom: 0;
  .hebao-content {
    padding: ${({ theme }) => theme.unit}px 0px;
  }
  &:not(:last-child) {
    .hebao-content {
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

export const HebaoProtectItem = <T extends Protector>(
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
        className={"hebao-content"}
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
export const HebaoProtector = <T extends Protector>({
  protectList,
  hebaoConfig,
  handleOpenModal,
}: {
  protectList: T[];
  hebaoConfig: any;
  handleOpenModal: (props: { step: HebaoStep; options?: any }) => void;
}) => {
  const { account } = useAccount();
  const { t } = useTranslation(["common"]);
  const [openQRCode, setOpenQRCode] = React.useState(false);
  const { onLock } = useHebaoProtector({
    hebaoConfig,
    handleOpenModal,
  });
  const description = () => (
    <Typography
      marginTop={2}
      component={"div"}
      textAlign={"center"}
      variant={"body1"}
    >
      <Typography
        color={"var(--color-text-secondary)"}
        component={"p"}
        variant={"inherit"}
      >
        {account?.accAddress}
      </Typography>
      <Typography
        color={"var(--color-text-third)"}
        component={"p"}
        variant={"body2"}
      >
        {account?.connectName}
      </Typography>
    </Typography>
  );
  return (
    <>
      <ModalQRCode
        open={openQRCode}
        className={"hebaoPop"}
        onClose={() => setOpenQRCode(false)}
        title={() => (
          <Typography component={"p"} textAlign={"center"} marginBottom={1}>
            <Typography
              color={"var(--color-text-primary)"}
              component={"p"}
              variant={"h5"}
            >
              {t("labelHebaoAddAsGuardian")}
            </Typography>
            <Typography
              color={"var(--color-text-secondary)"}
              component={"p"}
              variant={"body1"}
            >
              {t("labelHebaoScanQRCode")}
            </Typography>
          </Typography>
        )}
        size={240}
        description={description()}
        url={`ethereum:${account?.accAddress}?type=${account?.connectName}&action=HebaoAddGuardian`}
      />

      <Box
        paddingTop={3}
        borderRadius={2}
        flex={1}
        display={"flex"}
        flexDirection={"column"}
      >
        <Box display={"flex"} justifyContent={"space-between"} paddingX={5 / 2}>
          <Typography component={"h3"} variant={"h5"}>
            {t("labelHebaoGuardianList")}
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
              onClick={() => setOpenQRCode(true)}
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
                      step: HebaoStep.LockAccount_WaitForAuth,
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
