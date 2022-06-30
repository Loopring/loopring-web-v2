import styled from "@emotion/styled";
import { Box, Grid, Link, Typography } from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  ForceWithdrawPanel,
  TransactionTradeTypes,
} from "@loopring-web/component-lib";
import { useForceWithdraw } from "@loopring-web/core";
import { useTheme } from "@emotion/react";
import { UserTxTypes } from "@loopring-web/loopring-sdk";

const StylePaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const ForcewithdrawPanel = withTranslation(["common", "layout"])(
  ({ t }: WithTranslation) => {
    const { forceWithdrawProps } = useForceWithdraw();
    const theme = useTheme();
    return (
      <StylePaper
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        className={"MuiPaper-elevation2"}
        marginBottom={2}
        position={"relative"}
      >
        <Link
          position={"absolute"}
          variant={"body1"}
          sx={{
            right: 2 * theme.unit,
            top: 2 * theme.unit,
          }}
          target="_self"
          rel="noopener noreferrer"
          href={`./#/layer2/history/transactions?types=${TransactionTradeTypes.forceWithdraw}`}
        >
          {t("labelTransactionsLink")}
        </Link>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <ForceWithdrawPanel {...forceWithdrawProps} _width={420} />
        </Box>
      </StylePaper>
    );
  }
);
