import { Box } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  AlertImpact,
  ConfirmImpact,
  SwapPanel,
  Toast,
  SmallOrderAlert,
  SwapSecondConfirmation,
  setShowAccount,
} from "@loopring-web/component-lib";
import { useSwap } from "./hookSwap";
import {
  EmptyValueTag,
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
      setToastOpen,
    } = useSwap({ path: "/trade/lite" });
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    const { campaignTagConfig } = useNotify().notifyMap ?? {};
    const estimatedFee =
      tradeCalcData && tradeCalcData.fee && tradeData
        ? `${tradeCalcData.fee} ${tradeData.buy?.belong}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
        : EmptyValueTag;
    const minimumReceived =
      tradeCalcData && tradeCalcData.minimumReceived && tradeData
        ? `${tradeCalcData.minimumReceived}  ${tradeData.buy?.belong}`
        : EmptyValueTag;
    const feePercentage =
      tradeCalcData && tradeData?.buy.tradeValue
        ? (
            (Number(tradeCalcData.fee) / tradeData.buy.tradeValue) *
            100
          ).toFixed(2)
        : EmptyValueTag;
    const priceImpactColor = tradeCalcData?.priceImpactColor
      ? tradeCalcData.priceImpactColor
      : "textPrimary";
    const priceImpact =
      tradeCalcData?.priceImpact !== undefined
        ? getValuePrecisionThousand(
            tradeCalcData.priceImpact,
            undefined,
            undefined,
            2,
            true
          ) + " %"
        : EmptyValueTag;
    const userTakerRate =
      tradeCalcData && tradeCalcData.feeTakerRate
        ? (tradeCalcData.feeTakerRate / 100).toString()
        : EmptyValueTag;
    const tradeCostMin =
      tradeCalcData && tradeCalcData.tradeCost && tradeData
        ? `${tradeCalcData.tradeCost} ${tradeData.buy?.belong}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
        : EmptyValueTag;
    const fromSymbol = tradeData?.sell.belong ?? EmptyValueTag;
    const fromAmount = tradeData?.sell.tradeValue?.toString() ?? EmptyValueTag;
    const toSymbol = tradeData?.buy.belong ?? EmptyValueTag;
    const toAmount = tradeData?.buy.tradeValue?.toString() ?? EmptyValueTag;
    const slippage = tradeData
      ? tradeData.slippage
        ? `${tradeData.slippage}`
        : "0.1"
      : EmptyValueTag;

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
            setToastOpen={setToastOpen}
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
          handleClose={() => setShowAccount(false)}
          handleConfirm={() => smallOrderAlertCallBack(true)}
          open={smallOrderAlertOpen}
          estimatedFee={estimatedFee}
          feePercentage={feePercentage}
          minimumReceived={minimumReceived}
        />
        <SwapSecondConfirmation
          handleClose={() => secondConfirmationCallBack(false)}
          handleConfirm={() => secondConfirmationCallBack(true)}
          open={secondConfirmationOpen}
          fromSymbol={fromSymbol}
          fromAmount={fromAmount}
          toSymbol={toSymbol}
          toAmount={toAmount}
          slippage={slippage}
          userTakerRate={userTakerRate}
          tradeCostMin={tradeCostMin}
          estimateFee={estimatedFee}
          priceImpactColor={priceImpactColor}
          priceImpact={priceImpact}
          minimumReceived={minimumReceived}
        />
      </Box>
    );
  }
);
