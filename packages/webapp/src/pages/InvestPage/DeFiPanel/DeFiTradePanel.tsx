import { useDefiMap, useDefiTrade, useToast } from "@loopring-web/core";
import { MarketType, myLog } from "@loopring-web/common-resources";
import {
  ConfirmDefiNOBalance,
  DeFiWrap,
  LoadingBlock,
  useSettings,
} from "@loopring-web/component-lib";
import { Box } from "@mui/material";
import React from "react";
export const DeFiTradePanel = ({
  isJoin,
  market,
  setServerUpdate,
  setToastOpen,
}: {
  market: MarketType;
  isJoin: boolean;
  setServerUpdate: (state: any) => void;
  setToastOpen: (state: any) => void;
}) => {
  const { marketArray } = useDefiMap();
  myLog("isJoin", isJoin, "market", market);
  const [confirmShowLimitBalance, setConfirmShowLimitBalance] =
    React.useState<boolean>(false);
  const [confirmShowNoBalance, setConfirmShowNoBalance] =
    React.useState<boolean>(false);
  const { deFiWrapProps } = useDefiTrade({
    isJoin,
    setToastOpen: setToastOpen as any,
    market: market ? market : marketArray[0], // marketArray[1] as MarketType,
    setServerUpdate,
    setConfirmShowNoBalance,
    confirmShowLimitBalance,
    setConfirmShowLimitBalance,
  });

  const { isMobile } = useSettings();

  const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };

  return (
    <>
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
      <ConfirmDefiNOBalance
        isJoin={isJoin}
        market={market}
        handleClose={(_e) => {
          setConfirmShowNoBalance(false);
          if (deFiWrapProps?.onRefreshData) {
            deFiWrapProps?.onRefreshData(true, true);
          }
        }}
        open={confirmShowNoBalance}
      />
    </>
  );
};
