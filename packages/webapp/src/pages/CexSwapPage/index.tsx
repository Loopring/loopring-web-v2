import { Box } from "@mui/material";
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import {
  ConfirmCexSwapRisk,
  LoadingBlock,
  SwapPanel,
  Toast,
  useSettings,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/common-resources";
import {
  confirmation,
  useCexMap,
  useCexSwap,
  useNotify,
} from "@loopring-web/core";
import React from "react";
import { useHistory } from "react-router-dom";
import styled from "@emotion/styled";
const BoxStyle = styled(Box)`
  &.cexPage {
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
  } = useCexSwap({ path: "/trade/cex" });
  return (
    <>
      <SwapPanel
        titleI8nKey={"labelCexSwapTitle"}
        tokenBuyProps={{
          disabled: isSwapLoading,
          decimalsLimit: tradeCalcData.buyPrecision,
        }}
        tokenSellProps={{
          disabled: isSwapLoading,
          decimalsLimit: tradeCalcData.sellPrecision,
          placeholderText:
            tradeCalcData.sellMaxAmtStr && tradeCalcData.sellMaxAmtStr !== ""
              ? t("labelCexSwapMiniMax", {
                  minValue: tradeCalcData.sellMinAmtStr,
                  maxValue: tradeCalcData.sellMaxAmtStr,
                })
              : t("labelCexSwapMini", {
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
        severity={toastOpen?.type ?? "success"}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </>
  );
});
export const CexSwapPage = withTranslation("common")(
  ({ ...rest }: WithTranslation) => {
    const {
      confirmation: { confirmedCexSwap: confirmedCexSwapStore },
      confirmedCexSwap: confirmedCexSwapFunc,
    } = confirmation.useConfirmation();
    const [_confirmedCexSwap, setConfirmedCexSwap] = React.useState<boolean>(
      !confirmedCexSwapStore
    );

    const { isMobile } = useSettings();
    const { marketArray } = useCexMap();
    const history = useHistory();

    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    return (
      <BoxStyle
        className={"cexPage"}
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

        <ConfirmCexSwapRisk
          open={_confirmedCexSwap}
          handleClose={(_e, isAgree) => {
            setConfirmedCexSwap(false);
            if (!isAgree) {
              history.goBack();
            } else {
              confirmedCexSwapFunc();
            }
          }}
        />
      </BoxStyle>
    );
  }
);
