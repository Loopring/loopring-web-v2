import { Box } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  AlertImpact,
  ConfirmImpact,
  SwapPanel,
  Toast,
  SmallOrderAlert,
  SwapSecondConfirmation
} from "@loopring-web/component-lib";
import { useSwap } from "./hookSwap";
import {
  getValuePrecisionThousand,
  myLog,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { useNotify } from "@loopring-web/core";

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
      market,
      alertOpen,
      confirmOpen,
      refreshRef,
      swapFunc,
      isSwapLoading,
      pageTradeLite,
      toPro,
      isMobile,
      priceAlertCallBack,
      smallOrderAlertCallBack,
      secondConfirmationCallBack,
      smallOrderAlertOpen,
      secondConfirmationOpen,
    } = useSwap({ path: "/trade/lite" });
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    const { campaignTagConfig } = useNotify().notifyMap ?? {};

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
            campaignTagConfig={campaignTagConfig ?? ({} as any)}
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
          handleClose={() => priceAlertCallBack(false)}
          handleConfirm={() => priceAlertCallBack(true)}
          open={alertOpen}
          value={
            (getValuePrecisionThousand(
              pageTradeLite?.priceImpactObj?.value,
              2
            ) + "%") as any
          }
        />
        <ConfirmImpact
          handleClose={() => priceAlertCallBack(false)}
          handleConfirm={() => priceAlertCallBack(true)}
          open={confirmOpen}
          value={
            (getValuePrecisionThousand(
              pageTradeLite?.priceImpactObj?.value,
              2
            ) + "%") as any
          }
        />
        <SmallOrderAlert
          handleClose={() => smallOrderAlertCallBack(false)}
          handleConfirm={() => smallOrderAlertCallBack(true)}
          open={smallOrderAlertOpen}
        />
        <SwapSecondConfirmation
          handleClose={() => secondConfirmationCallBack(false)}
          handleConfirm={() => secondConfirmationCallBack(true)}
          open
          // ={secondConfirmationOpen}
        />
      </Box>
    );
  }
);
