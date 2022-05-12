import { Box, Grid } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import BasicInfoPanel from "./panel/BasicInfoPanel";
import TradePanel from "./panel/TradePanel";
import {
  AlertImpact,
  ChartType,
  ConfirmImpact,
  ScaleAreaChart,
  SwapPanel,
  Toast,
  useToggle,
} from "@loopring-web/component-lib";
import { FixedStyle } from "../styled";
import { TOAST_TIME } from "@loopring-web/core";
import { useSwap } from "./hookSwap";
import { getValuePrecisionThousand } from "@loopring-web/common-resources";

export const SwapPage = withTranslation("common")(
  ({ ...rest }: WithTranslation) => {
    const {
      tradeCalcData,
      tradeData,
      tradeFloat,
      tradeArray,
      myTradeArray,
      marketArray,
      handleSwapPanelEvent,
      onSwapClick,
      pair,
      swapBtnI18nKey,
      swapBtnStatus,
      toastOpen,
      closeToast,
      should15sRefresh,
      // debugInfo,
      alertOpen,
      confirmOpen,
      refreshRef,
      swapFunc,
      isSwapLoading,
      pageTradeLite,
      toPro,
      isMobile,
    } = useSwap({ path: "/trade/lite" });
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    const { toggle } = useToggle();
    return (
      <>
        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />

        {!isMobile ? (
          <>
            <Box
              flex={1}
              marginRight={3}
              alignContent={"stretch"}
              flexDirection={"column"}
              flexWrap={"nowrap"}
            >
              <BasicInfoPanel
                {...{
                  ...rest,
                  ...pair,
                  marketArray,
                  tradeFloat,
                  tradeArray,
                }}
              />
              <TradePanel tradeArray={tradeArray} myTradeArray={myTradeArray} />
            </Box>

            <Box display={"flex"} style={styles} justifyContent={"center"}>
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <FixedStyle>
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
                  onRefreshData={should15sRefresh}
                  refreshRef={refreshRef}
                  tradeData={tradeData as any}
                  tradeCalcData={tradeCalcData as any}
                  onSwapClick={onSwapClick}
                  swapBtnI18nKey={swapBtnI18nKey}
                  swapBtnStatus={swapBtnStatus}
                  {...{ handleSwapPanelEvent, ...rest }}
                />
              </FixedStyle>
            </Box>
          </>
        ) : (
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            flex={1}
          >
            <SwapPanel
              //disabled={isSwapLoading}
              toPro={toPro}
              tokenBuyProps={{
                disabled: isSwapLoading,
                decimalsLimit: tradeCalcData.buyPrecision,
              }}
              tokenSellProps={{
                disabled: isSwapLoading,
                decimalsLimit: tradeCalcData.sellPrecision,
              }}
              onRefreshData={should15sRefresh}
              refreshRef={refreshRef}
              tradeData={tradeData as any}
              tradeCalcData={tradeCalcData as any}
              onSwapClick={onSwapClick}
              swapBtnI18nKey={swapBtnI18nKey}
              swapBtnStatus={swapBtnStatus}
              {...{ handleSwapPanelEvent, ...rest }}
            />
            <Box height={"30%"} paddingY={2}>
              <BasicInfoPanel
                {...{
                  ...rest,
                  ...pair,
                  marketArray,
                  tradeFloat,
                  tradeArray,
                }}
              />
            </Box>
          </Box>
        )}

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
      </>
    );
  }
);

// SwapPage
