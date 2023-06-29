import { Box, Icon, Typography } from "@mui/material";
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import {
  ConfirmBtradeSwapRisk,
  LoadingBlock,
  SwapPanel,
  Toast,
  ToastType,
  useSettings,
} from "@loopring-web/component-lib";
import { HelpIcon, LOOPRING_DOCUMENT, TOAST_TIME } from "@loopring-web/common-resources";
import {
  confirmation,
  useBtradeMap,
  useBtradeSwap,
  useNotify,
} from "@loopring-web/core";
import React from "react";
import { useHistory } from "react-router-dom";
import styled from "@emotion/styled";

const BoxStyle = styled(Box)`
  &.btradePage {
    .input-wrap {
      input::placeholder {
        font-size: 0.65em;
      }
    }
  }
`;
const Content = withTranslation("common")(({ ...rest }: WithTranslation) => {
  const { campaignTagConfig } = useNotify().notifyMap ?? {};
  const { t } = useTranslation();
  const {
    toastOpen,
    closeToast,
    setToastOpen,
    refreshRef,
    tradeData,
    tradeCalcData,
    onSwapClick,
    swapBtnStatus,
    swapBtnI18nKey,
    handleSwapPanelEvent,
    isSwapLoading,
    market,
    should15sRefresh,
  } = useBtradeSwap({ path: "/trade/btrade" });
  return (
    <Box>
      <Box display={"flex"} justifyContent={"right"} marginBottom={1}>
        <Box
          onClick={() => {
            window.open(
              `${LOOPRING_DOCUMENT}Block_Trade_tutorial_en.md`,
              "_blank"
            );
            window.opener = null;
          }}
          sx={{ cursor: "pointer" }}
          display={"flex"}
          color={"var(--color-text-secondary)"}
          alignItems={"center"}>
          <HelpIcon
            fontSize={"large"}
            color={"inherit"}
            sx={{ marginRight: 1 / 2 }}
          />
          <Typography variant={"h5"}>{t("labelTutorial")}</Typography>
        </Box>
      </Box>
      <SwapPanel
        titleI8nKey={"labelBtradeSwapTitle"}
        tokenBuyProps={{
          disableInputValue: isSwapLoading,
          decimalsLimit: tradeCalcData.buyPrecision,
        }}
        tokenSellProps={{
          disableInputValue: isSwapLoading,
          decimalsLimit: tradeCalcData.sellPrecision,
          placeholderText:
            tradeCalcData.sellMaxAmtStr && tradeCalcData.sellMaxAmtStr !== ""
              ? t("labelBtradeSwapMiniMax", {
                  minValue: tradeCalcData.sellMinAmtStr,
                  maxValue: tradeCalcData.sellMaxAmtStr,
                })
              : t("labelBtradeSwapMini", {
                  minValue: tradeCalcData.sellMinAmtStr,
                }),
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
      <Toast
        alertText={toastOpen?.content ?? ""}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </Box>
  );
});
export const BtradeSwapPage = withTranslation("common")(
  ({ ...rest }: WithTranslation) => {
    const {
      confirmation: { confirmedBtradeSwap: confirmedBtradeSwapStore },
      confirmedBtradeSwap: confirmedBtradeSwapFunc,
    } = confirmation.useConfirmation();
    const [_confirmedBtradeSwap, setConfirmedBtradeSwap] =
      React.useState<boolean>(!confirmedBtradeSwapStore);

    const { isMobile } = useSettings();
    const { marketArray } = useBtradeMap();
    const history = useHistory();

    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    return (
      <BoxStyle
        className={"btradePage"}
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
          {marketArray && marketArray.length ? <Content /> : <LoadingBlock />}
        </Box>

        <ConfirmBtradeSwapRisk
          open={_confirmedBtradeSwap}
          handleClose={(_e, isAgree) => {
            setConfirmedBtradeSwap(false);
            if (!isAgree) {
              history.replace("/markets");
              // history.goBack();
            } else {
              confirmedBtradeSwapFunc();
            }
          }}
        />
      </BoxStyle>
    );
  }
);
