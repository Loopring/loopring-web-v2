import styled from "@emotion/styled";
import {
  Box,
  Divider,
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
import { TxHebaoAction, TxGuardianHistoryType } from "./hook";
import { useTheme } from "@emotion/react";

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

export const WalletHistory = <H extends HebaoOperationLog>({
  operationLogList,
  guardianConfig,
}: {
  operationLogList: H[];
  guardianConfig: any;
}) => {
  const { t } = useTranslation(["common"]);
  const theme = useTheme();
  return (
    <>
      <Box
        paddingTop={3}
        paddingBottom={3}
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
          {!!operationLogList.length ? (
            <>
              {operationLogList.map((item, index) => (
                <React.Fragment key={item.id + index}>
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    paddingX={2}
                    paddingY={1}
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
                        primary={item.to}
                        primaryTypographyProps={{
                          component: "p",
                          color: "textSecondary",
                        }}
                      />
                    </Box>
                    <Box
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"flex-end"}
                      flexDirection={"column"}
                    >
                      <Typography
                        variant={"body1"}
                        component={"p"}
                        textAlign={"right"}
                      >
                        <Typography
                          variant={"body1"}
                          component={"span"}
                          color={item.status ? "error" : "var(--color-success)"}
                        >
                          {t("labelTxGuardian" + TxHebaoAction[item.status]) +
                            " "}
                        </Typography>
                        <Typography
                          variant={"body1"}
                          component={"span"}
                          color={"--color-text-third"}
                        >
                          {t(
                            "labelTxGuardian" +
                              TxGuardianHistoryType[item.hebaoTxType]
                          )}
                        </Typography>
                      </Typography>
                      <Typography
                        variant={"body2"}
                        component={"p"}
                        color={"--color-text-third"}
                        marginTop={1}
                      >
                        {moment(
                          new Date(item.createdAt),
                          "YYYYMMDDHHMM"
                        ).fromNow()}
                      </Typography>
                    </Box>
                  </Box>
                  {operationLogList.length - 1 !== index && (
                    <Divider
                      style={{ margin: `0 ${(theme.unit * 5) / 2}px` }}
                    />
                  )}
                </React.Fragment>
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
        </Box>
      </Box>
    </>
  );
};
