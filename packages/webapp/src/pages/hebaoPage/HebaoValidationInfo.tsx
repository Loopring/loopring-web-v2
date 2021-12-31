import { Guardian, Protector } from "@loopring-web/loopring-sdk";
import {
  Box,
  ListItem,
  ListItemProps,
  ListItemText,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import React from "react";
import { myLog } from "@loopring-web/common-resources";
import {
  HebaoStep,
  Button,
  HebaoCodeApprove,
} from "@loopring-web/component-lib";
import moment from "moment";
import { useValidationInfo } from "./hook";

const HebaoGuardianStyled = styled(ListItem)<ListItemProps>`
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

export const HebaoGuardianItem = <G extends Guardian>({
  guardian,
  onApproveClick,
}: {
  guardian: G;
  onApproveClick: (item: G) => void;
}) => {
  const { t } = useTranslation("common");
  const { address, ens, type, id, businessDataJson, createAt } = guardian;
  const newOwner = (businessDataJson as any)?.value?.value?.newOwner;
  const statusButton = React.useMemo(() => {
    switch (type) {
      case "recovery":
      case "transfer":
      case "add_guardian":
      case "remove_guardian":
      case "unlock_wallet":
        return t("labelHebaoApprove");
      default:
        return "";
    }
  }, [type, t]);

  const statusView = React.useMemo(() => {
    switch (type) {
      case "recovery":
        return "recovery";
      case "transfer":
        return "transfer";
      case "add_guardian":
        return "+ guardian";
      case "remove_guardian":
        return "- guardian";
      case "unlock_wallet":
        return "unlock";
      default:
        return "";
    }
  }, [type]);

  return (
    <HebaoGuardianStyled alignItems="flex-start" className={`Hebao`}>
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
        <Box display={"flex"} alignItems={"center"}>
          <ListItemText
            className="description status"
            primary={statusView}
            primaryTypographyProps={{
              minWidth: "80px",
              component: "p",
              variant: "h5",
              color: "textPrimary",
            }}
          />
        </Box>
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
          justifyContent={"center"}
          title={type}
          flexDirection={"column"}
          alignItems={"flex-end"}
        >
          <Typography
            color={"textSecondary"}
            paddingLeft={1}
            variant={"body1"}
            component={"span"}
            alignItems={"center"}
            display={"inline-flex"}
            lineHeight={"inherit"}
          >
            <Button
              variant={"contained"}
              size={"small"}
              color={"primary"}
              onClick={() => onApproveClick(guardian)}
            >
              {statusButton}
            </Button>
          </Typography>
          <Typography
            color={"textThird"}
            paddingLeft={1}
            marginTop={1}
            variant={"body2"}
            component={"span"}
            alignItems={"center"}
            display={"inline-flex"}
            lineHeight={"inherit"}
          >
            {moment(new Date(createAt)).fromNow()}
          </Typography>
        </Box>
      </Box>
    </HebaoGuardianStyled>
  );
};

export const HebaoValidationInfo = <G extends Guardian>({
  guardiansList,
  hebaoConfig,
  handleOpenModal,
}: {
  guardiansList: G[];
  hebaoConfig: any;
  handleOpenModal: (props: { step: HebaoStep; options?: any }) => void;
}) => {
  const {
    onApproveClick,
    // onSubmit,
    hebaoCodeOpen,
    handleClose,
    selectedGuardian,
  } = useValidationInfo();
  return (
    <>
      <HebaoCodeApprove
        open={hebaoCodeOpen}
        handleClose={handleClose}
        guardian={selectedGuardian as any}
      />
      <Box
        paddingTop={3}
        borderRadius={2}
        flex={1}
        marginBottom={0}
        display={"flex"}
        flexDirection={"column"}
      >
        {guardiansList.map((guardian, index) => {
          return (
            <HebaoGuardianItem
              key={index}
              guardian={guardian}
              onApproveClick={onApproveClick}
            />
          );
        })}
      </Box>
    </>
  );
};
