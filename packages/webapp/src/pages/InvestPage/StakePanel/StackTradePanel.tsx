import { useStakeTrade, useToast } from "@loopring-web/core";

import { LoadingBlock, useSettings } from "@loopring-web/component-lib";
import { Box } from "@mui/material";
import React from "react";

export const StackTradePanel = ({
  isJoin,
}: // market,
// setServerUpdate,
// setToastOpen,
{
  // market: MarketType;
  isJoin: boolean;
  // setServerUpdate: (state: any) => void;
  // setToastOpen: (state: any) => void;
}) => {
  const { toastOpen, setToastOpen, closeToast } = useToast();

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
      {stackWrapProps.deFiSideCalcData ? (
        <Box
          className={"hasLinerBg"}
          display={"flex"}
          style={styles}
          justifyContent={"center"}
          padding={5 / 2}
        >
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
      {/*<ConfirmDefiNOBalance*/}
      {/*  isJoin={isJoin}*/}
      {/*  market={market}*/}
      {/*  type={DEFI_ADVICE_MAP[tokenBase].project}*/}
      {/*  handleClose={(_e) => {*/}
      {/*    setConfirmShowNoBalance(false);*/}
      {/*    if (deFiWrapProps?.onRefreshData) {*/}
      {/*      deFiWrapProps?.onRefreshData(true, true);*/}
      {/*    }*/}
      {/*  }}*/}
      {/*  open={confirmShowNoBalance}*/}
      {/*/>*/}
    </>
  );
};
