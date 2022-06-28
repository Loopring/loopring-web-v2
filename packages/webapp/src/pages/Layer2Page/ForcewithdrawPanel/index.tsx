import styled from "@emotion/styled";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { ForceWithdrawPanel } from "@loopring-web/component-lib";
import { useForceWithdraw } from "@loopring-web/core";

const StylePaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const ForcewithdrawPanel = withTranslation(["common", "layout"])(
  ({ t }: WithTranslation) => {
    const { forceWithdrawProps } = useForceWithdraw();
    return (
      <StylePaper
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        className={"MuiPaper-elevation2"}
        marginBottom={2}
      >
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <ForceWithdrawPanel {...forceWithdrawProps} />
        </Box>
      </StylePaper>
    );
  }
);
