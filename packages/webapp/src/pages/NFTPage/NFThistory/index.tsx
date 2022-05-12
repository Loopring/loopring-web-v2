import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import React from "react";
import { TsNFTTable } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistoryNFT } from "./hookHistory";
import { useAccount } from "@loopring-web/core";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const MyNFTHistory = () => {
  const { t } = useTranslation("common");
  // const theme = useTheme();
  // const { isMobile } = useSettings();
  const { nftHistory, container, getTxnList } = useHistoryNFT();
  const {
    account: { accountId, accAddress },
  } = useAccount();
  return (
    <>
      <StyledPaper
        flex={1}
        className={"MuiPaper-elevation2"}
        marginTop={0}
        marginBottom={2}
        display={"flex"}
        flexDirection={"column"}
      >
        <Box flex={1} display={"flex"} flexDirection={"column"}>
          <Typography
            component={"h3"}
            variant={"h4"}
            paddingX={5 / 2}
            paddingTop={5 / 2}
          >
            {t("labelTransactions")}
          </Typography>
          <Box flex={1} display={"flex"} ref={container} marginTop={2}>
            <TsNFTTable
              {...{
                ...(nftHistory.userNFTTxs as any),
                getTxnList,
                accAddress,
                accountId,
              }}
            />
          </Box>
        </Box>
      </StyledPaper>
    </>
  );
};
