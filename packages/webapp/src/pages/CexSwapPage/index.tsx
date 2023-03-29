import { Box } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  ConfirmCexSwapRisk,
  LoadingBlock,
  SwapPanel,
  Toast,
  useSettings,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/common-resources";
import { confirmation, useCexMap, useCexSwap } from "@loopring-web/core";
import React from "react";
import { useHistory } from "react-router-dom";

export const CexSwapPage = withTranslation("common")(
  ({ ...rest }: WithTranslation) => {
    const {
      confirmation: { confirmedCexSwap: confirmedCexSwapStore },
      confirmedCexSwap: confirmedCexSwapFunc,
    } = confirmation.useConfirmation();
    const [_confirmedCexSwap, setConfirmedCexSwap] = React.useState<boolean>(
      !confirmedCexSwapStore
    );
    const history = useHistory();
    const { isMobile } = useSettings();
    const { marketArray } = useCexMap();
    const { toastOpen, closeToast } = useCexSwap({ path: "/trade/cex" });
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
          {marketArray && marketArray.length ? (
            <SwapPanel
            // tokenBuyProps={{
            //   disabled: isSwapLoading,
            //   decimalsLimit: tradeCalcData.buyPrecision,
            // }}
            // tokenSellProps={{
            //   disabled: isSwapLoading,
            //   decimalsLimit: tradeCalcData.sellPrecision,
            // }}
            // campaignTagConfig={campaignTagConfig ?? ({} as any)}
            // market={market}
            // onRefreshData={should15sRefresh}
            // refreshRef={refreshRef}
            // tradeData={tradeData as any}
            // tradeCalcData={tradeCalcData as any}
            // onSwapClick={onSwapClick}
            // swapBtnI18nKey={swapBtnI18nKey}
            // swapBtnStatus={swapBtnStatus}
            // setToastOpen={setToastOpen}
            // {...{ handleSwapPanelEvent, ...rest }}
            />
          ) : (
            <LoadingBlock />
          )}
        </Box>
        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
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
      </Box>
    );
  }
);
