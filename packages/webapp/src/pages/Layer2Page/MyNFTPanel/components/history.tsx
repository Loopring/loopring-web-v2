import { TsNFTTable } from "@loopring-web/component-lib";
import React from "react";
import { Box } from "@mui/material";

import { useHistoryNFT } from "./hookHistory";
import { useAccount } from "stores/account";

export const HistoryNFT = () => {
  const { nftHistory, container, getTxnList } = useHistoryNFT();
  const {
    account: { accountId, accAddress },
  } = useAccount();
  return (
    <Box flex={1} display={"flex"} ref={container}>
      <TsNFTTable
        {...{
          ...(nftHistory.userNFTTxs as any),
          getTxnList,
          accAddress,
          accountId,
        }}
      />
    </Box>
  );
};
