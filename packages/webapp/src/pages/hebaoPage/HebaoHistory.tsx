import styled from "@emotion/styled";
import {
  Box,
  ListItem,
  ListItemProps,
  ListItemText,
  Typography,
} from "@mui/material";
import { EmptyDefault } from "@loopring-web/component-lib";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAccount } from "../../stores/account";
import { HebaoOperationLog, HEBAO_META_TYPE } from "@loopring-web/loopring-sdk";
import {
  CompleteIcon,
  ErrorIcon,
  GoodIcon,
  WarningIcon,
} from "@loopring-web/common-resources";
import moment from "moment";

const HebaoHistoryStyled = styled(ListItem)<ListItemProps>`
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

export const HebaoHistoryItem = <T extends HebaoOperationLog>(props: T) => {
  const { t } = useTranslation("common");
  const { createdAt, ens, from, hebaoTxType, id: number, status, to } = props;
  const statusButton = React.useMemo(() => {
    switch (hebaoTxType as any) {
      case HEBAO_META_TYPE.recovery:
        return "recovery";
      case HEBAO_META_TYPE.transfer:
        return "transfer";
      case HEBAO_META_TYPE.add_guardian:
        return "Add Guardia";
      case HEBAO_META_TYPE.remove_guardian:
        return "Remove Guardia";
      case HEBAO_META_TYPE.unlock_wallet:
        return "Unlock Wallet";
      default:
        return "";
    }
  }, [hebaoTxType]);
  const statusView = React.useMemo(() => {
    switch (hebaoTxType as any) {
      case HEBAO_META_TYPE.recovery:
        return "recovery";
      case HEBAO_META_TYPE.transfer:
        return "transfer";
      case HEBAO_META_TYPE.add_guardian:
        return "+ Guardia";
      case HEBAO_META_TYPE.remove_guardian:
        return "- Guardia";
      case HEBAO_META_TYPE.unlock_wallet:
        return "Unlock Wallet";
      default:
        return "";
    }
  }, [hebaoTxType]);

  return (
    <HebaoHistoryStyled alignItems="flex-start" className={`Hebao`}>
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
        <Box display={"flex"} alignItems={"center"} width={40}>
          <ListItemText
            className="description status"
            primary={
              status === 0 ? (
                <GoodIcon color={"success"} fontSize={"large"} />
              ) : (
                <ErrorIcon color={"error"} fontSize={"large"} />
              )
            }
            primaryTypographyProps={{
              component: "p",
              variant: "body1",
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
            primary={from}
            primaryTypographyProps={{ component: "p", color: "textSecondary" }}
          />
        </Box>
        <Box
          width={100}
          display={"flex"}
          justifyContent={"center"}
          title={hebaoTxType.toString()}
          alignItems={"flex-end"}
          flexDirection={"column"}
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
            {statusView}
            {hebaoTxType}
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
            {moment(new Date(createdAt)).fromNow()}
          </Typography>
        </Box>
      </Box>
    </HebaoHistoryStyled>
  );
};
export const HebaoHistory = <T extends HebaoOperationLog>({
  historyList,
}: {
  historyList: T[];
}) => {
  const { account } = useAccount();
  const { t } = useTranslation(["common"]);
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
            {t("labelHebaoLogList")}
          </Typography>
        </Box>
        <Box flex={1} alignItems={"center"} marginTop={2}>
          {historyList.length ? (
            <>
              {historyList.map((item) => (
                <HebaoHistoryItem key={item.id} {...{ ...item }} />
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
