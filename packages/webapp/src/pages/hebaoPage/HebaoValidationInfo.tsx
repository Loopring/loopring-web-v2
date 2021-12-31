import { Guardian, Protector } from "@loopring-web/loopring-sdk";
import { Box, ListItem, ListItemProps, ListItemText } from "@mui/material";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import React from "react";
import { myLog } from "@loopring-web/common-resources";
import { HebaoStep } from "@loopring-web/component-lib";

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
}: {
  guardian: G;
}) => {
  const { t } = useTranslation("common");
  const { address, ens, type, id, businessDataJson } = guardian;
  const newOwner = (businessDataJson as any)?.value?.value?.newOwner;
  const statusView = React.useMemo(() => {
    switch (type) {
      case "recovery":
        break;
      case "transfer":
        break;
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
          title={type}
          alignItems={"center"}
        >
          {type}
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
  myLog(guardiansList);
  return (
    <Box
      paddingTop={3}
      borderRadius={2}
      flex={1}
      marginBottom={0}
      display={"flex"}
      flexDirection={"column"}
    >
      {guardiansList.map((guardian, index) => {
        return <HebaoGuardianItem key={index} guardian={guardian} />;
      })}
    </Box>
  );
};
