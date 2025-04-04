import React from 'react'
import {
  useNotify,
  useVaultJoin,
  useVaultLayer2,
  useVaultLoan,
  useVaultMap,
  useVaultRedeem,
} from '@loopring-web/core'
import {
  Modal,
  SmallOrderAlert,
  SwapPanel,
  Toast,
  useOpenModals,
  VaultExitPanel,
  VaultJoinPanel,
  VaultJoinPanelModal,
  VaultLoanPanel,
  VaultSwapCancel,
} from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'
import {
  TOAST_TIME,
  TokenType,
  TRADE_TYPE,
  VaultAction,
  VaultLoanType,
  VaultSwapStep,
} from '@loopring-web/common-resources'
import { useVaultSwapExtends } from './useVaultSwapExtends'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'

export const ModalVaultWrap = ({onClickLeverage}: {onClickLeverage: () => void}) => {
  const { t } = useTranslation()
  const { getVaultMap, tokenMap: vaultTokenMao, idIndex: vaultIndex, coinMap } = useVaultMap()
  const theme = useTheme()
  const { campaignTagConfig } = useNotify().notifyMap ?? {}
  const {
    modals: { isShowVaultExit, isShowVaultJoin, isShowVaultSwap, isShowVaultLoan },
    setShowVaultJoin,
    setShowVaultExit,
    setShowVaultLoan,
    setShowVaultSwap,
    setShowNoVaultAccount,
  } = useOpenModals()
  const { vaultAccountInfo } = useVaultLayer2()
  const [{ openCancel, shouldClose }, setOpenCancel] = React.useState({
    openCancel: false,
    shouldClose: false,
  })
  const exitVaultProps = useVaultRedeem()
  // const {
  //   // isMarketInit,
  //   // toastOpen,
  //   // closeToast,
  //   // tradeCalcData,
  //   // tradeData,
  //   // swapBtnI18nKey,
  //   // swapBtnStatus,
  //   // handleSwapPanelEvent,
  //   // refreshData,
  //   // refreshRef,
  //   // onSwapClick,
  //   // tradeVault,
  //   // isSwapLoading,
  //   // market,
  //   // isMobile,
  //   // disabled,
  //   // cancelBorrow,
  //   // borrowedAmount,
  //   // marginLevelChange,
  //   // showSmallTradePrompt,
  //   // setShowSmallTradePrompt,
  //   // hideLeverage
  // } = useVaultSwap({ path: 'portal' })
  // const { BtnEle, maxEle } = useVaultSwapExtends({
  //   tradeCalcData,
  //   swapBtnI18nKey,
  //   swapBtnStatus,
  //   onSwapClick,
  //   isSwapLoading,
  //   disabled,
  //   handleSwapPanelEvent,
  //   tradeData,
  //   toastOpen,
  //   borrowedAmount
  // })
  const { vaultRepayProps, vaultBorrowProps, vaultLoanType, handleTabChange } = useVaultLoan()
  return (
    <>
      {/* <Toast
        alertText={toastOpen?.content ?? ''}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
        severity={toastOpen.type}
      /> */}
      {/* <Modal
        contentClassName={'vault-wrap'}
        open={isShowVaultSwap.isShow}
        onClose={() => {
          if (
            (tradeCalcData as any)?.isVault &&
            (tradeCalcData as any).step !== VaultSwapStep.Edit
          ) {
            setOpenCancel({ openCancel: true, shouldClose: true })
          } else {
            setShowVaultSwap({ isShow: false })
          }
        }}
        content={
          tradeData ? (
            // @ts-ignore
            <SwapPanel
              _width={'var(--modal-width)'}
              classWrapName={'vaultSwap'}
              titleI8nKey={'labelVaultSwap'}
              tokenBuyProps={{
                tokenImageKey: tradeData?.buy?.belong?.slice(2),
                belongAlice: tradeData?.buy?.belong?.slice(2),
                tokenType: TokenType.vault,
                disableInputValue: isMarketInit,
                disabled: isSwapLoading || isMarketInit,
                decimalsLimit: vaultTokenMao[tradeData?.buy?.belong?.toString() ?? '']?.precision,
                allowDecimals: vaultTokenMao[tradeData?.buy?.belong?.toString() ?? '']?.precision
                  ? true
                  : false,
              }}
              covertOnClickPreCheck={() => {
                if (
                  (tradeCalcData as any)?.isVault &&
                  (tradeCalcData as any).step !== VaultSwapStep.Edit
                ) {
                  setOpenCancel({ openCancel: true, shouldClose: true })
                  return false
                } else {
                  return true
                }
              }}
              onCancelClick={() => {
                setOpenCancel({ openCancel: true, shouldClose: false })
              }}
              BtnEle={BtnEle}
              tokenSellProps={{
                decimalsLimit:
                  vaultTokenMao[tradeData?.sell?.belong?.toString() ?? '']?.vaultTokenAmounts
                    ?.qtyStepScale,
                allowDecimals: vaultTokenMao[tradeData?.sell?.belong?.toString() ?? '']
                  ?.vaultTokenAmounts?.qtyStepScale
                  ? true
                  : false,
                tokenImageKey: tradeData?.sell?.belong?.slice(2),
                belongAlice: tradeData?.sell?.belong?.slice(2),
                tokenType: TokenType.vault,
                subEle: maxEle,
                subLabel: undefined,
                disableInputValue: isMarketInit,
                disabled: isSwapLoading || isMarketInit,
                placeholderText:
                  tradeCalcData.sellMaxAmtStr && tradeCalcData.sellMaxAmtStr !== ''
                    ? t('labelBtradeSwapMiniMax', {
                        minValue: tradeCalcData.sellMinAmtStr,
                        maxValue: tradeCalcData.sellMaxAmtStr,
                      })
                    : t('labelBtradeSwapMini', {
                        minValue: tradeCalcData.sellMinAmtStr,
                      }),
              }}
              campaignTagConfig={campaignTagConfig}
              tradeCalcData={tradeCalcData}
              tradeData={tradeData as any}
              onSwapClick={onSwapClick}
              swapBtnI18nKey={swapBtnI18nKey}
              swapBtnStatus={swapBtnStatus}
              handleSwapPanelEvent={handleSwapPanelEvent}
              onRefreshData={refreshData}
              refreshRef={refreshRef}
              tradeVault={tradeVault}
              market={market}
              isMobile={isMobile}
              marginLevelChange={marginLevelChange!}
              vaultLeverage={{
                onClickLeverage: onClickLeverage,
                leverage: vaultAccountInfo?.leverage ?? '0',
                hideLeverage
              }}
              refreshTime={10}
            />
          ) : (
            <></>
          )
        }
      /> */}
      {/* <SmallOrderAlert
        open={showSmallTradePrompt.show}
        handleClose={() => {
          setShowSmallTradePrompt({
            show: false,
            estimatedFee: undefined,
            minimumConverted: undefined,
            feePercentage: undefined,
          })
        }}
        handleConfirm={() => {
          onSwapClick()
        }}
        estimatedFee={showSmallTradePrompt.estimatedFee ?? ''}
        feePercentage={showSmallTradePrompt.feePercentage ?? ''}
        minimumReceived={showSmallTradePrompt.minimumConverted ?? ''}
      /> */}
      <Modal
        contentClassName={'vault-wrap'}
        open={isShowVaultExit.isShow}
        _width={'var(--modal-width)'}
        onClose={() => {
          setShowVaultExit({ isShow: false })
        }}
        content={<VaultExitPanel {...{ ...exitVaultProps }} />}
      />
      <Modal
        open={isShowVaultLoan.isShow}
        onClose={() => {
          setShowVaultLoan({ isShow: false })
        }}
        content={
          <VaultLoanPanel
            vaultRepayProps={vaultRepayProps as any}
            vaultBorrowProps={{...vaultBorrowProps, onClickLeverage} as any}
            vaultLoanType={vaultLoanType as VaultLoanType}
            handleTabChange={handleTabChange}
          />
        }
      />
      {/* <VaultSwapCancel
        open={openCancel}
        handleClose={(_, isAgree) => {
          setOpenCancel({ openCancel: false, shouldClose: false })
          if (isAgree) {
            cancelBorrow(shouldClose)
          }
        }}
      /> */}
    </>
  )
}
