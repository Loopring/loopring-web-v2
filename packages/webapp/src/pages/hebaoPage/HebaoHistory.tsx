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

import { HebaoOperationLog } from "@loopring-web/loopring-sdk";
import moment from "moment";

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

export const HebaoHistory = <H extends HebaoOperationLog>({
  operationLogList,
  hebaoConfig,
}: {
  operationLogList: H[];
  hebaoConfig: any;
}) => {
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
            {t("labelLogList")}
          </Typography>
        </Box>
        <Box flex={1} alignItems={"center"} marginTop={2}>
          {operationLogList.length ? (
            <>
              {operationLogList.map((item) => (
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  paddingX={2}
                >
                  <Box flex={1}>
                    <ListItemText
                      className="description description1"
                      primary={item.ens ? item.ens : t("labelUnknown")}
                      primaryTypographyProps={{
                        component: "p",
                        variant: "h5",
                        color: "textPrimary",
                      }}
                    />
                    <ListItemText
                      primary={item.from}
                      primaryTypographyProps={{
                        component: "p",
                        color: "textSecondary",
                      }}
                    />
                  </Box>
                  <Box
                    width={100}
                    display={"flex"}
                    justifyContent={"flex-end"}
                    alignItems={"center"}
                  >
                    <Typography
                      variant={"body1"}
                      component={"p"}
                      color={"--color-text-third"}
                    >
                      {item.hebaoTxType}
                    </Typography>
                    <Typography
                      variant={"body2"}
                      component={"p"}
                      color={"--color-text-third"}
                    >
                      {moment(
                        new Date(item.createdAt),
                        "YYYYMMDDHHMM"
                      ).fromNow()}
                    </Typography>
                  </Box>
                </Box>
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
