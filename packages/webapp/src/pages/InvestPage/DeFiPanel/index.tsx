import React from "react";
import styled from "@emotion/styled";
import { Box, Grid } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { useDeFiHook } from "./hook";
import {
  boxLiner,
  ConfirmDefiBalanceIsLimit,
  DeFiWrap,
  Toast,
  useSettings,
} from "@loopring-web/component-lib";
import {
  TOAST_TIME,
  useDefiMap,
  useTokenMap,
  useTradeDefi,
} from "@loopring-web/core";
import { LoadingBlock } from "../../LoadingPage";
import { useRouteMatch } from "react-router-dom";
import {
  getValuePrecisionThousand,
  MarketType,
} from "@loopring-web/common-resources";

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
    ...rest
  }: WithTranslation) => {
    const { marketArray } = useDefiMap();
    const { tokenMap } = useTokenMap();
    const match: any = useRouteMatch("/invest/defi/:market/:isJoin");
    const _market: MarketType = [...(marketArray ? marketArray : [])].find(
      (_item) => {
        const value = match?.params?.market
          ?.replace(/null|-/gi, "")
          ?.toUpperCase();
        return new RegExp(value, "ig").test(_item);
      }
    ) as MarketType;

    const isJoin =
      match?.params?.isJoin?.toUpperCase() !== "Redeem".toUpperCase();

    const {
      deFiWrapProps,
      closeToast,
      toastOpen,
      confirmShow,
      setConfirmShow,
    } = useDeFiHook({
      market: _market ?? ("WSTETH-ETH" as MarketType),
      isJoin,
    });
    const { tradeDefi } = useTradeDefi();
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
              market={_market}
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
        <ConfirmDefiBalanceIsLimit
          handleClose={() => setConfirmShow(false)}
          open={confirmShow}
          defiData={tradeDefi}
        />
      </StyleWrapper>
    );
  }
);
