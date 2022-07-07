import React from "react";
import styled from "@emotion/styled";
import { Grid } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { AmmPoolActivityRule, LoopringMap } from "@loopring-web/loopring-sdk";
import { useDeFiHook } from "./hook";
import { ConfirmImpact, DeFiWrap, Toast } from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/core";
import { getValuePrecisionThousand } from "@loopring-web/common-resources";
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
    const {
      deFiWrapProps,
      closeToast,
      toastOpen,
      confirmShow,
      setConfirmShow,
    } = useDeFiHook();
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
        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
        <ConfirmImpact
          handleClose={() => setConfirmShow(false)}
          open={confirmShow}
          value={1}
        />
        <DeFiWrap {...(deFiWrapProps as any)} />
        {/*<DeFiWrap />*/}
      </StyleWrapper>
    );
  }
);
