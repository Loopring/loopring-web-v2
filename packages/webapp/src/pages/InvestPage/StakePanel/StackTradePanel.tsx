import { confirmation, useStakeTrade, useToast } from "@loopring-web/core";

import {
  Button,
  DeFiSideWrap,
  LoadingBlock,
  useSettings,
} from "@loopring-web/component-lib";
import { Box } from "@mui/material";
import React from "react";
import { BackIcon } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

export const StackTradePanel = ({
  setConfirmedLRCStakeInvestInvest,
  isJoin = true,
}: {
  // market: MarketType;
  setConfirmedLRCStakeInvestInvest: (state: any) => void;
  // setServerUpdate: (state: any) => void;
  // setToastOpen: (state: any) => void;
  isJoin?: boolean;
}) => {
  const {
    confirmation: { confirmedLRCStakeInvest },
  } = confirmation.useConfirmation();
  setConfirmedLRCStakeInvestInvest(!confirmedLRCStakeInvest);
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { t } = useTranslation();
  const history = useHistory();
  const { stackWrapProps } = useStakeTrade({ setToastOpen, isJoin });

  // const [confirmShowNoBalance, setConfirmShowNoBalance] =
  //   React.useState<boolean>(false);
  // const { deFiWrapProps } = useDefiTrade({
  //   isJoin,
  //   setToastOpen: setToastOpen as any,
  //   // market: market ? market : marketArray[0], // marketArray[1] as MarketType,
  //   setServerUpdate,
  //   setConfirmShowNoBalance,
  //   confirmShowLimitBalance,
  //   setConfirmShowLimitBalance,
  // });

  const { isMobile } = useSettings();

  const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };

  return (
    <>
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
            onClick={() => {
              window.open(
                `https://loopring.io/#/document/dual_investment_tutorial_en.md`,
                "_blank"
              );
              window.opener = null;
            }}
            sx={{ color: "var(--color-text-secondary)" }}
          >
            {t("labelMyInvestLRCStaking")}
          </Button>
        </Box>
        {stackWrapProps.deFiSideCalcData ? (
          <Box
            className={"hasLinerBg"}
            display={"flex"}
            style={styles}
            justifyContent={"center"}
            padding={5 / 2}
          >
            <DeFiSideWrap isJoin={isJoin} {...(stackWrapProps as any)} />
            {/*<DeFiWrap*/}
            {/*  market={market}*/}
            {/*  isJoin={isJoin}*/}
            {/*  type={DEFI_ADVICE_MAP[tokenBase].project}*/}
            {/*  {...(deFiWrapProps as any)}*/}
            {/*/>*/}
          </Box>
        ) : (
          <LoadingBlock />
        )}
      </Box>
    </>
  );
};
