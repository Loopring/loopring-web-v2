import React from "react";
import {
  AmmPanel,
  AmmPanelType,
  ConfirmAmmExitMiniOrder,
  LoadingBlock,
  Toast,
} from "@loopring-web/component-lib";
import {
  CoinInfo,
  WalletMap,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { useAmmJoin } from "../../../hooks/useractions/hookAmmJoin";
import { useAmmExit } from "../../../hooks/useractions/hookAmmExit";
import { useAmmCommon } from "./hookAmmCommon";
import { Grid } from "@mui/material";
import { AmmPoolSnapshot, TickerData } from "@loopring-web/loopring-sdk";
import { initSlippage, store } from "../../../index";
import styled from "@emotion/styled";
import { useDeepCompareEffect } from "react-use";

export const BoxWrapperStyled = styled(Grid)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  .divider-item {
    border-right: 0;
  }
  @media only screen and (min-width: 900px) {
    .divider-item {
      height: 0;
      padding-top: 42%;
      margin-left: 8px;
      border-right: 1px solid var(--color-divide);
    }
  }
` as typeof Grid;

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
  const [confirmExitSmallOrder, setConfirmExitSmallOrder] = React.useState<{
    open: boolean;
    type: "Disabled" | "Mini";
  }>({ open: false, type: "Disabled" });
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
    updatePageAmmJoin,
  } = useAmmJoin({
    getFee,
    setToastOpen,
    pair,
    snapShotData,
    btos,
    stob,
  });
  const {
    ammCalcData: ammCalcDataWithdraw,
    ammData: ammExitData,
    handleAmmPoolEvent: handleExitAmmPoolEvent,
    onAmmClick: onAmmRemoveClick,
    btnStatus: removeBtnStatus,
    btnI18nKey: ammWithdrawBtnI18nKey,
    exitSmallOrderCloseClick,
  } = useAmmExit({
    getFee,
    setToastOpen,
    pair,
    snapShotData,
    btos,
    stob,
    setConfirmExitSmallOrder,
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
      <ConfirmAmmExitMiniOrder
        type={confirmExitSmallOrder.type}
        handleClose={(_e: any, isAgree = false) => {
          setConfirmExitSmallOrder({ open: false, type: "Disabled" });
          exitSmallOrderCloseClick(isAgree);
        }}
        open={confirmExitSmallOrder.open}
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
        </>
      ) : (
        <LoadingBlock />
      )}
    </>
  );
};
