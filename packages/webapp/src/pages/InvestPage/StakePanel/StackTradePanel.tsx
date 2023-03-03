import { confirmation, useStakeTradeJOIN, useToast } from "@loopring-web/core";

import {
  Button,
  DeFiSideWrap,
  LoadingBlock,
  Toast,
  useSettings,
} from "@loopring-web/component-lib";
import { Box } from "@mui/material";
import React from "react";
import { BackIcon, TOAST_TIME } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { StyleWrapper } from "../DeFiPanel/";

export const StackTradePanel = ({
  setConfirmedLRCStakeInvestInvest,
  isJoin = true,
  symbol = "LRC",
}: {
  symbol?: string;
  setConfirmedLRCStakeInvestInvest: (state: any) => void;
  isJoin?: boolean;
}) => {
  const {
    confirmation: { confirmedLRCStakeInvest },
  } = confirmation.useConfirmation();
  setConfirmedLRCStakeInvestInvest(!confirmedLRCStakeInvest);
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { t } = useTranslation();
  const history = useHistory();
  const { stackWrapProps } = useStakeTradeJOIN({ setToastOpen, symbol });

  const { isMobile } = useSettings();

  const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };

  return (
    <>
      <Toast
        alertText={toastOpen?.content ?? ""}
        severity={toastOpen?.type ?? "success"}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <Box
          marginBottom={2}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={isMobile ? "left" : "center"}
          flexDirection={isMobile ? "column" : "row"}
        >
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={
              isMobile
                ? {
                    color: "var(--color-text-secondary)",
                    justifyContent: "left",
                  }
                : { color: "var(--color-text-secondary)" }
            }
            color={"inherit"}
            onClick={() => history.push("/invest/overview")}
          >
            {t("labelInvestLRCStakingTitle")}
          </Button>
          <Button
            variant={"outlined"}
            size={"medium"}
            onClick={() => history.push("/invest/balance/sideStake")}
            sx={{ color: "var(--color-text-secondary)" }}
          >
            {t("labelMyInvestLRCStaking")}
          </Button>
        </Box>
        <StyleWrapper
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          flex={1}
        >
          {stackWrapProps.deFiSideCalcData ? (
            <Box
              className={"hasLinerBg"}
              display={"flex"}
              style={styles}
              justifyContent={"center"}
              padding={5 / 2}
            >
              <DeFiSideWrap
                isJoin={isJoin}
                symbol={"LRC"}
                {...(stackWrapProps as any)}
              />
            </Box>
          ) : (
            <LoadingBlock />
          )}
        </StyleWrapper>
      </Box>
    </>
  );
};
