import React from "react";
import styled from "@emotion/styled";
import { Grid } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { AmmPoolActivityRule, LoopringMap } from "@loopring-web/loopring-sdk";
const StyleWrapper = styled(Grid)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Grid;

export const DeFiPanel: any = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
    /* ammActivityMap, */ ...rest
  }: WithTranslation & {
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
  }) => {
    return (
      <StyleWrapper
        container
        className={"MuiPaper-elevation2"}
        paddingY={3}
        paddingX={4}
        margin={0}
        marginBottom={2}
        display={"flex"}
        position={"relative"}
      >
        {/*<DeFiWrap />*/}
      </StyleWrapper>
    );
  }
);
