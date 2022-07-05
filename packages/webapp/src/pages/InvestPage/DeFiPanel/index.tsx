import React from "react";
import styled from "@emotion/styled";
import { Box, Grid } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { AmmPoolActivityRule, LoopringMap } from "@loopring-web/loopring-sdk";
import { useDeFiHook } from "./hook";
import {
  boxLiner,
  ConfirmImpact,
  DeFiWrap,
  Toast,
  useSettings,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/core";
import { LoadingBlock } from "../../LoadingPage";
import { useRouteMatch } from "react-router-dom";
// background: var(--color-box);
const StyleWrapper = styled(Box)`
  position: relative;
  border-radius: ${({ theme }) => theme.unit}px;
  .loading-block {
    background: initial;
  }
  .hasLinerBg {
    ${({ theme }) => boxLiner({ theme })}
  }
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Grid;

export const DeFiPanel: any = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
    /* ammActivityMap, */ ...rest
  }: WithTranslation & {
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
  }) => {
    const match: any = useRouteMatch("/invest/defi/:market/:isJoin");

    //TODO: list
    const market = match?.params?.market?.toUpperCase() ?? "WSTETH-ETH";
    const isJoin =
      match?.params?.isJoin?.toUpperCase() === "Redeem".toUpperCase()
        ? false
        : true;
    const {
      deFiWrapProps,
      closeToast,
      toastOpen,
      confirmShow,
      setConfirmShow,
    } = useDeFiHook({ market, isJoin });
    const { isMobile } = useSettings();
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };

    return (
      <StyleWrapper
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        flex={1}
      >
        {deFiWrapProps.deFiCalcData ? (
          <Box
            className={"hasLinerBg"}
            display={"flex"}
            style={styles}
            justifyContent={"center"}
            padding={5 / 2}
          >
            <DeFiWrap
              market={market}
              isJoin={isJoin}
              {...(deFiWrapProps as any)}
            />
          </Box>
        ) : (
          <LoadingBlock />
        )}

        {/*<DeFiWrap />*/}
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
      </StyleWrapper>
    );
  }
);
