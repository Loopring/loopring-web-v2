import React from 'react'
import { AmmPanel, ConfirmAmmExitMiniOrder, TOASTOPEN } from '@loopring-web/component-lib'

import { Grid } from '@mui/material'
import { useAccount, useAmmMap, usePageAmmPool, walletLayer2Service } from '../../../index'
import styled from '@emotion/styled'
import { useAmmJoin } from '../../../hooks/useractions/hookAmmJoin'
import { useAmmExit } from '../../../hooks/useractions/hookAmmExit'
import { SagaStatus, AmmPanelType } from '@loopring-web/common-resources'

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
` as typeof Grid

export const AmmPanelView = ({
  market,
  ammType,
  getRecentAmmPoolTxs,
  updateAmmPoolSnapshot,
  refreshRef,
  setToastOpen,
  // getFee,
  updateExitFee,
  updateJoinFee,
  // ammExit,
  // ammJoin,
  ...rest
}: {
  market: string
  refreshRef: React.Ref<any>
  updateAmmPoolSnapshot: () => void
  setToastOpen: (state: TOASTOPEN) => void
  // getFee: () => void;
  ammType?: keyof typeof AmmPanelType
  getRecentAmmPoolTxs?: (props: { limit?: number; offset?: number }) => void
  updateExitFee: () => Promise<void>
  updateJoinFee: () => Promise<void>
  // ammExit: any;
  // ammJoin: any;
} & any) => {
  const [confirmExitSmallOrder, setConfirmExitSmallOrder] = React.useState<{
    open: boolean
    type: 'Disabled' | 'Mini'
  }>({ open: false, type: 'Disabled' })
  const { ammMap } = useAmmMap()

  const [index, setIndex] = React.useState(ammType == 1 ? AmmPanelType.Exit : AmmPanelType.Join)
  const handleTabChange = React.useCallback(
    (newValue: any) => {
      if (index !== newValue) {
        setIndex(newValue)
      }
    },
    [index],
  )
  const {
    ammCalcData: ammCalcDataDeposit,
    ammData: ammJoinData,
    handleAmmPoolEvent: handleJoinAmmPoolEvent,
    onAmmClick: onAmmAddClick,
    btnStatus: addBtnStatus,
    btnI18nKey: ammDepositBtnI18nKey,
    propsAExtends,
    propsBExtends,
  } = useAmmJoin({
    updateJoinFee,
    setToastOpen,
    market,
    refreshRef,
  })
  const {
    ammCalcData: ammCalcDataWithdraw,
    ammData: ammExitData,
    handleAmmPoolEvent: handleExitAmmPoolEvent,
    onAmmClick: onAmmRemoveClick,
    btnStatus: removeBtnStatus,
    btnI18nKey: ammWithdrawBtnI18nKey,
    exitSmallOrderCloseClick,
    propsLPExtends,
  } = useAmmExit({
    updateExitFee,
    setToastOpen,
    market,
    refreshRef,
    // ammCalcDefault: ammExit.ammCalcData,
    // ammDataDefault: ammExit.ammData,
    setConfirmExitSmallOrder,
  })
  const { resetAmmPool } = usePageAmmPool()
  const { status: accountStatus } = useAccount()

  React.useEffect(() => {
    if (refreshRef.current) {
      // @ts-ignore
      refreshRef.current.firstElementChild.click()
    }
    return () => {
      resetAmmPool()
    }
  }, [])
  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      walletLayer2Service.sendUserUpdate()
    }
  }, [accountStatus])

  return (
    <>
      <ConfirmAmmExitMiniOrder
        type={confirmExitSmallOrder.type}
        handleClose={(_e: any, isAgree = false) => {
          setConfirmExitSmallOrder({ open: false, type: 'Disabled' })
          exitSmallOrderCloseClick(isAgree)
        }}
        open={confirmExitSmallOrder.open}
      />
      <AmmPanel
        {...{ ...rest }}
        onRefreshData={() => {
          updateAmmPoolSnapshot()
        }}
        tabSelected={ammType ? ammType : AmmPanelType.Join}
        ammInfo={ammMap['AMM-' + market]}
        refreshRef={refreshRef}
        ammType={index}
        handleTabChange={handleTabChange}
        ammDepositData={ammJoinData}
        ammCalcDataDeposit={ammCalcDataDeposit}
        handleAmmAddChangeEvent={handleJoinAmmPoolEvent}
        onAmmAddClick={onAmmAddClick}
        ammDepositBtnI18nKey={ammDepositBtnI18nKey}
        ammDepositBtnStatus={addBtnStatus}
        propsAExtends={propsAExtends}
        propsBExtends={propsBExtends}
        ammWithdrawData={ammExitData}
        ammCalcDataWithDraw={ammCalcDataWithdraw}
        handleAmmRemoveChangeEvent={handleExitAmmPoolEvent}
        onAmmRemoveClick={onAmmRemoveClick}
        ammWithdrawBtnI18nKey={ammWithdrawBtnI18nKey}
        ammWithdrawBtnStatus={removeBtnStatus}
        propsLPExtends={propsLPExtends}
      />
    </>
  )
}
