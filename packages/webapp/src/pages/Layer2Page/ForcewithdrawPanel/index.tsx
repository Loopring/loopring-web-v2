import styled from "@emotion/styled";
import { Box, Grid, Link, Typography } from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  ForceWithdrawPanel,
  TransactionTradeTypes,
  useSettings,
} from "@loopring-web/component-lib";
import { useForceWithdraw } from "@loopring-web/core";
import { useTheme } from "@emotion/react";

const StylePaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  .content {
    width: 420px;
  }
  &.isMobile {
    .content {
      flex: 1;
      width: var(--swap-box-width);
    }
  }
`;

export const ForcewithdrawPanel = withTranslation(["common", "layout"])(
  ({ t }: WithTranslation) => {
    const { isMobile } = useSettings();
    const { forceWithdrawProps } = useForceWithdraw();
    const theme = useTheme();
    const extendsProps = isMobile ? { _width: 420 } : { _width: "auto" };
    return (
      <StylePaper
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        className={isMobile ? "isMobile" : "MuiPaper-elevation2"}
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
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          className={"content"}
        >
          <ForceWithdrawPanel {...{ ...forceWithdrawProps, ...extendsProps }} />
        </Box>
      </StylePaper>
    );
  }
);
