import {
  Box,
  Typography,
} from "@mui/material";
import { EmptyDefault } from "@loopring-web/component-lib";
import React from "react";
import { useTranslation } from "react-i18next";

import { HebaoOperationLog } from "@loopring-web/loopring-sdk";
import moment from "moment";
import { TxHebaoAction } from "./hook";

export const WalletHistory = ({ operationLogList}: { operationLogList: HebaoOperationLog[] }) => {
  // operationLogList = [
  //   {status: 1, createdAt: 0, ens: 'ens', from: '111',hebaoTxType: 1, to: '111', id: 1},
  //   {status: 1, createdAt: 0, ens: 'ens', from: '111',hebaoTxType: 1, to: '111', id: 1},
  // ]
  const {t} = useTranslation();
  return operationLogList.length !== 0 ? <>
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
            <Typography variant={"h6"}>{log.status === TxHebaoAction.Approve ? '授权' : '拒绝'}{log.ens ? log.ens : t("labelUnknown")}为守护人</Typography>
            <Typography variant={"h6"}>
              {moment(
                new Date(log.createdAt),
                "YYYYMMDDHHMM"
              ).fromNow()}
            </Typography>
          </Box>
        </Box>
      );
    })}
  </> : (
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