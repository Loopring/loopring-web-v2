import {
  Box,
  Typography,
} from "@mui/material";
import { EmptyDefault } from "@loopring-web/component-lib";
import React from "react";
import { useTranslation } from "react-i18next";

import { HebaoOperationLog } from "@loopring-web/loopring-sdk";
import moment from "moment";
import { TxGuardianHistoryType, TxHebaoAction } from "./hook";

export const WalletHistory = ({ operationLogList}: { operationLogList: HebaoOperationLog[] }) => {
  // operationLogList = [
  //   {status: 1, createdAt: 0, ens: 'ens', from: '111',hebaoTxType: 1, to: '111', id: 1},
  //   {status: 1, createdAt: 0, ens: 'ens', from: '111',hebaoTxType: 1, to: '111', id: 1},
  // ]
  const {t} = useTranslation();
  return operationLogList.length !== 0 ? <Box height={"400px"} overflow="scroll">
    {operationLogList.map((log, index) => {
      return (
        <Box
          key={log.id}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          marginBottom={4}
        >
          <Box>
            <Typography>
              {log.ens ? log.ens : t("labelUnknown")} /
              <Typography component={"span"} color={"var(--color-text-third)"}>{log.to && `${log.to.slice(0, 6)}...${log.to.slice(log.to.length - 4,)}`}</Typography>
            </Typography>
            <Typography
              variant={"body1"}
              component={"span"}
              color={log.status ? "error" : "var(--color-success)"}
            >
              {t("labelTxGuardian" + TxHebaoAction[log.status]) +
                " "}
            </Typography>
            
            <Typography
              variant={"body1"}
              component={"span"}
              color={"--color-text-third"}
            >
              
              {t(
                "labelTxGuardian" +
                TxGuardianHistoryType[log.hebaoTxType]
              )}
            </Typography>
            <Typography color={"var(--color-text-third)"} variant={"body1"}>
              {moment(
                new Date(log.createdAt),
                "YYYYMMDDHHMM"
              ).fromNow()}
            </Typography>
          </Box>
        </Box>
      );
    })}
  </Box> : (
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
  )
}