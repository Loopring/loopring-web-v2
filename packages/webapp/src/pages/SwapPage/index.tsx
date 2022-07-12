import { Box } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  AlertImpact,
  ConfirmImpact,
  SwapPanel,
  Toast,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/core";
import { useSwap } from "./hookSwap";
import { getValuePrecisionThousand } from "@loopring-web/common-resources";

export const SwapPage = withTranslation("common")(
  ({ ...rest }: WithTranslation) => {
    const {
      tradeCalcData,
      tradeData,
      handleSwapPanelEvent,
      onSwapClick,
      swapBtnI18nKey,
      swapBtnStatus,
      toastOpen,
      closeToast,
      should15sRefresh,
      // debugInfo,
      market,
      alertOpen,
      confirmOpen,
      refreshRef,
      swapFunc,
      isSwapLoading,
      pageTradeLite,
      toPro,
      // updateMyTradeTable,
      isMobile,
    } = useSwap({ path: "/trade/lite" });
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    return (
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        flex={1}
      >
        <Box
          paddingBottom={isMobile ? 2 : "initial"}
          display={"flex"}
          style={styles}
          justifyContent={"center"}
        >
          <SwapPanel
            toPro={toPro}
            tokenBuyProps={{
              disabled: isSwapLoading,
              decimalsLimit: tradeCalcData.buyPrecision,
            }}
            tokenSellProps={{
              disabled: isSwapLoading,
              decimalsLimit: tradeCalcData.sellPrecision,
            }}
            market={market}
            onRefreshData={should15sRefresh}
            refreshRef={refreshRef}
            tradeData={tradeData as any}
            tradeCalcData={tradeCalcData as any}
            onSwapClick={onSwapClick}
            swapBtnI18nKey={swapBtnI18nKey}
            swapBtnStatus={swapBtnStatus}
            {...{ handleSwapPanelEvent, ...rest }}
          />
        </Box>
        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
        <AlertImpact
          handleClose={swapFunc}
          open={alertOpen}
          value={
            (getValuePrecisionThousand(
              pageTradeLite?.priceImpactObj?.value,
              2
            ) + "%") as any
          }
        />
        <ConfirmImpact
          handleClose={swapFunc}
          open={confirmOpen}
          value={
            (getValuePrecisionThousand(
              pageTradeLite?.priceImpactObj?.value,
              2
            ) + "%") as any
          }
        />
      </Box>
    );
  }
);

// SwapPage
