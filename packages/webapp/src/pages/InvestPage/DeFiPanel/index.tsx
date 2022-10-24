import React from "react";
import styled from "@emotion/styled";
import { Box, Grid } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { useDeFiHook } from "./hook";
import {
  boxLiner,
  Button,
  ConfirmDefiNOBalance,
  ConfirmInvestDefiServiceUpdate,
  DeFiWrap,
  Toast,
  useSettings,
  LoadingBlock,
} from "@loopring-web/component-lib";
import { confirmation, useDefiMap } from "@loopring-web/core";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  BackIcon,
  MarketType,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { useTheme } from "@emotion/react";

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
    setConfirmDefiInvest,
  }: WithTranslation & {
    setConfirmDefiInvest: (state: any) => void;
  }) => {
    const { marketArray } = useDefiMap();
    const {
      confirmation: { confirmedDefiInvest },
    } = confirmation.useConfirmation();
    setConfirmDefiInvest(!confirmedDefiInvest);
    const match: any = useRouteMatch("/invest/defi/:market?/:isJoin?");
    const history = useHistory();
    const _market: MarketType = [...(marketArray ? marketArray : [])].find(
      (_item) => {
        debugger;
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
      confirmShowNoBalance,
      setConfirmShowNoBalance,
      serverUpdate,
      setServerUpdate,
    } = useDeFiHook({
      market: _market ?? ("WSTETH-ETH" as MarketType),
      isJoin,
    });
    const theme = useTheme();

    const { isMobile } = useSettings();
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };

    return (
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <Box
          marginBottom={2}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={history.goBack}
          >
            {t("labelInvestDefiTitle")}
            {/*<Typography color={"textPrimary"}></Typography>*/}
          </Button>
          <Button
            variant={"outlined"}
            sx={{ marginLeft: 2 }}
            onClick={() => history.push("/invest/balance/stack")}
          >
            {t("labelInvestMyDefi")}
          </Button>
        </Box>
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
          <Toast
            alertText={toastOpen?.content ?? ""}
            severity={toastOpen?.type ?? "success"}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
          />

          <ConfirmInvestDefiServiceUpdate
            open={serverUpdate}
            handleClose={() => setServerUpdate(false)}
          />
          <ConfirmDefiNOBalance
            isJoin={isJoin}
            handleClose={(_e) => {
              setConfirmShowNoBalance(false);
              if (deFiWrapProps?.onRefreshData) {
                deFiWrapProps?.onRefreshData(true, true);
              }
            }}
            open={confirmShowNoBalance}
          />
        </StyleWrapper>
      </Box>
    );
  }
);
