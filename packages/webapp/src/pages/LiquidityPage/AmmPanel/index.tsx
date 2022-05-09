import React from "react";
import {
  AmmPanel,
  AmmPanelType,
  CoinIcon,
  Toast,
} from "@loopring-web/component-lib";
import {
  AmmInData,
  CoinInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  WalletMap,
} from "@loopring-web/common-resources";
import { useAmmJoin } from "./hook_join";
import { useAmmExit } from "./hook_exit";
import { useAmmCommon } from "./hook_common";
import { Box, Divider, Grid, Typography } from "@mui/material";
import { AmmPoolSnapshot, TickerData } from "@loopring-web/loopring-sdk";
import { TOAST_TIME, initSlippage } from "@loopring-web/core";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { store } from "@loopring-web/core";
import { useDeepCompareEffect } from "react-use";

const MyAmmLPAssets = withTranslation("common")(
  ({ ammCalcData, t }: { ammCalcData: AmmInData<any> } & WithTranslation) => {
    const { tokenMap } = store.getState().tokenMap;

    const getTokenPrecision = React.useCallback(
      (token: string) => {
        if (tokenMap) {
          return tokenMap[token]?.precision;
        }
      },
      [tokenMap]
    );
    const coinAPrecision = getTokenPrecision(ammCalcData?.lpCoinA?.belong);
    const coinBPrecision = getTokenPrecision(ammCalcData?.lpCoinB?.belong);
    return (
      <Box className={"MuiPaper-elevation2"} paddingX={3} paddingY={2}>
        <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
          <Box
            display={"flex"}
            className={"logo-icon"}
            height={"var(--list-menu-coin-size)"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <CoinIcon
              symbol={
                "LP-" +
                ammCalcData.lpCoinA.belong +
                "-" +
                ammCalcData.lpCoinB.belong
              }
            />
          </Box>
          <Box paddingLeft={1}>
            <Typography
              variant={"h4"}
              component={"h3"}
              paddingRight={1}
              fontWeight={700}
            >
              <Typography
                component={"span"}
                title={"sell"}
                className={"next-coin"}
              >
                {ammCalcData.lpCoinA.belong}
              </Typography>
              <Typography component={"i"}>/</Typography>
              <Typography component={"span"} title={"buy"}>
                {ammCalcData.lpCoinB.belong}
              </Typography>
            </Typography>
          </Box>
        </Box>
        <Divider style={{ margin: "16px 0" }} />
        <Box display={"flex"} flexDirection={"column"}>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography component={"p"} variant="body2" color={"textSecondary"}>
              {t("labelMyLPToken")}
            </Typography>
            <Typography component={"p"} variant="body2">
              {ammCalcData && ammCalcData?.lpCoin?.balance !== undefined
                ? getValuePrecisionThousand(
                    ammCalcData.lpCoin.balance,
                    undefined,
                    undefined,
                    undefined,
                    false,
                    { isTrade: true }
                  )
                : EmptyValueTag}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            marginTop={1 / 2}
          >
            <Typography component={"p"} variant="body2" color={"textSecondary"}>
              {t("labelMyLPAToken", {
                symbol: ammCalcData.lpCoinA.belong,
              })}
            </Typography>
            <Typography component={"p"} variant="body2">
              {ammCalcData && ammCalcData.lpCoinA.balance
                ? getValuePrecisionThousand(
                    ammCalcData.lpCoinA.balance,
                    coinAPrecision,
                    2,
                    undefined,
                    false,
                    { floor: true }
                  )
                : EmptyValueTag}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            marginTop={1 / 2}
          >
            <Typography component={"p"} variant="body2" color={"textSecondary"}>
              {t("labelMyLPBToken", {
                symbol: ammCalcData.lpCoinB.belong,
              })}
            </Typography>
            <Typography component={"p"} variant="body2">
              {ammCalcData && ammCalcData.lpCoinB.balance
                ? getValuePrecisionThousand(
                    ammCalcData.lpCoinB.balance,
                    coinBPrecision,
                    2,
                    undefined,
                    false,
                    { floor: true }
                  )
                : EmptyValueTag}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            marginTop={1 / 2}
          >
            <Typography component={"p"} variant="body2" color={"textSecondary"}>
              {t("labelMyLPAmountFor")}
            </Typography>
            <Typography component={"p"} variant="body2">
              {ammCalcData && ammCalcData.percentage
                ? getValuePrecisionThousand(
                    Number(ammCalcData.percentage) * 100,
                    4,
                    2,
                    undefined,
                    false,
                    { floor: true, isExponential: true }
                  ) + "%"
                : EmptyValueTag}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);

const BoxWrapperStyled = styled(Grid)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
export const AmmPanelView = ({
  pair,
  walletMap,
  btos,
  stob,
  ammType,
  snapShotData,
  getRecentAmmPoolTxs,
  ...rest
}: {
  pair: {
    coinAInfo: CoinInfo<string> | undefined;
    coinBInfo: CoinInfo<string> | undefined;
  };
  btos: string | undefined;
  stob: string | undefined;
  snapShotData:
    | {
        tickerData: TickerData | undefined;
        ammPoolSnapshot: AmmPoolSnapshot | undefined;
      }
    | undefined;
  walletMap: WalletMap<string>;
  ammType?: keyof typeof AmmPanelType;
  getRecentAmmPoolTxs?: (props: { limit?: number; offset?: number }) => void;
} & any) => {
  const {
    accountStatus,
    toastOpen,
    setToastOpen,
    closeToast,
    refreshRef,
    updateAmmPoolSnapshot,
    getFee,
  } = useAmmCommon({ pair });

  const {
    ammCalcData: ammCalcDataDeposit,
    ammData: ammJoinData,
    handleAmmPoolEvent: handleJoinAmmPoolEvent,
    onAmmClick: onAmmAddClick,
    btnStatus: addBtnStatus,
    btnI18nKey: ammDepositBtnI18nKey,
    updateJoinFee,
    updatePageAmmJoin,
  } = useAmmJoin({
    getFee,
    setToastOpen,
    pair,
    snapShotData,
    btos,
    stob,
  });
  // const [currAmmData, setCurrAmmData] = React.useState<any>(null)

  // clear data when changing pair
  useDeepCompareEffect(() => {
    if (pair && !pair.coinAInfo && !pair.coinBInfo) {
      const newAmmData = {
        coinA: { belong: "" as any, tradeValue: undefined, balance: 0 },
        coinB: { belong: "" as any, tradeValue: undefined, balance: 0 },
        slippage: initSlippage,
      };
      updatePageAmmJoin({
        ammData: newAmmData,
      });
    }
  }, [pair, ammJoinData, updatePageAmmJoin]);

  const {
    ammCalcData: ammCalcDataWithdraw,
    ammData: ammExitData,
    handleAmmPoolEvent: handleExitAmmPoolEvent,
    onAmmClick: onAmmRemoveClick,
    btnStatus: removeBtnStatus,
    btnI18nKey: ammWithdrawBtnI18nKey,
  } = useAmmExit({
    getFee,
    setToastOpen,
    pair,
    snapShotData,
    btos,
    stob,
  });

  const { tokenMap } = store.getState().tokenMap;

  const getTokenPrecision = React.useCallback(
    (token: string) => {
      if (tokenMap && token) {
        return tokenMap[token]?.precision;
      }
      return undefined;
    },
    [tokenMap]
  );

  const coinAPrecision = getTokenPrecision(pair?.coinAInfo?.simpleName);
  const coinBPrecision = getTokenPrecision(pair?.coinBInfo?.simpleName);

  return (
    <>
      <Toast
        alertText={toastOpen?.content ?? ""}
        severity={toastOpen?.type ?? "success"}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />

      {pair ? (
        <>
          <AmmPanel
            {...{ ...rest }}
            accStatus={accountStatus}
            getRecentAmmPoolTxs={getRecentAmmPoolTxs}
            onRefreshData={() => {
              updateAmmPoolSnapshot();
              if (getRecentAmmPoolTxs) {
                getRecentAmmPoolTxs({});
              }
            }}
            refreshRef={refreshRef}
            ammDepositData={ammJoinData}
            ammCalcDataDeposit={ammCalcDataDeposit}
            handleAmmAddChangeEvent={handleJoinAmmPoolEvent}
            onAmmAddClick={onAmmAddClick}
            tabSelected={ammType ? ammType : AmmPanelType.Join}
            ammDepositBtnI18nKey={ammDepositBtnI18nKey}
            ammDepositBtnStatus={addBtnStatus}
            ammWithdrawData={ammExitData}
            ammCalcDataWithDraw={ammCalcDataWithdraw}
            handleAmmRemoveChangeEvent={handleExitAmmPoolEvent}
            onAmmRemoveClick={onAmmRemoveClick}
            ammWithdrawBtnI18nKey={ammWithdrawBtnI18nKey}
            ammWithdrawBtnStatus={removeBtnStatus}
            coinAPrecision={coinAPrecision}
            coinBPrecision={coinBPrecision}
          />
          {ammCalcDataDeposit && ammCalcDataDeposit.lpCoin ? (
            <BoxWrapperStyled marginTop={5 / 2}>
              <MyAmmLPAssets ammCalcData={ammCalcDataDeposit} />
            </BoxWrapperStyled>
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
};
