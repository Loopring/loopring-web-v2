import React from 'react'
import {
  useNotify,
  useVaultJoin,
  useVaultLoad,
  useVaultMap,
  useVaultRedeem,
  useVaultSwap,
} from '@loopring-web/core'
import {
  Modal,
  SwapPanel,
  Toast,
  useOpenModals,
  VaultExitPanel,
  VaultJoinPanel,
  VaultLoadPanel,
} from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'
import { TOAST_TIME, TRADE_TYPE, VaultLoadType } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'

export const ModalVaultWrap = () => {
  const { t } = useTranslation()
  const { getVaultMap, tokenMap: vaultTokenMao, idIndex: vaultIndex } = useVaultMap()
  const theme = useTheme()
  const { campaignTagConfig } = useNotify().notifyMap ?? {}
  const {
    modals: { isShowVaultExit, isShowVaultJoin, isShowVaultSwap, istShowVaultLoad },
    setShowVaultJoin,
    setShowVaultExit,
    setShowVaultLoad,
    setShowVaultSwap,
  } = useOpenModals()

  const joinVaultProps = useVaultJoin()
  const exitVaultProps = useVaultRedeem()
  const {
    isMarketInit,
    toastOpen,
    closeToast,
    tradeCalcData,
    tradeData,
    swapBtnI18nKey,
    swapBtnStatus,
    handleSwapPanelEvent,
    should15sRefresh,
    refreshRef,
    onSwapClick,
    tradeVault,
    isSwapLoading,
    market,
    isMobile,
  } = useVaultSwap({ path: 'vault' })
  const { vaultRepayProps, vaultBorrowProps, vaultLoadType, handleTabChange } = useVaultLoad()
  return (
    <>
      <Toast
        alertText={toastOpen?.content ?? ''}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
        severity={toastOpen.type}
      />
      <Modal
        contentClassName={'trade-wrap'}
        open={isShowVaultJoin.isShow}
        onClose={() => {
          setShowVaultJoin({ isShow: false })
        }}
        content={
          <VaultJoinPanel
            {...{
              ...joinVaultProps,
              type: TRADE_TYPE.TOKEN,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `auto`,
            }}
          />
        }
      />
      <Modal
        open={isShowVaultSwap.isShow}
        onClose={() => {
          setShowVaultSwap({ isShow: false })
        }}
        content={
          <SwapPanel
            classWrapName={'vaultSwap'}
            titleI8nKey={'labelVaultSwap'}
            tokenBuyProps={{
              disableInputValue: isMarketInit,
              disabled: isSwapLoading || isMarketInit,
              decimalsLimit: tradeCalcData.buyPrecision,
            }}
            _width={'var(--modal-width)'}
            tokenSellProps={{
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
            {...{
              campaignTagConfig,
              tradeCalcData,
              tradeData: tradeData as any,
              onSwapClick,
              swapBtnI18nKey,
              swapBtnStatus,
              handleSwapPanelEvent,
              should15sRefresh,
              refreshRef,
              tradeVault,
              market,
              isMobile,
            }}
          />
        }
      />
      <Modal
        open={isShowVaultExit.isShow}
        onClose={() => {
          setShowVaultExit({ isShow: false })
        }}
        content={<VaultExitPanel {...{ ...exitVaultProps }} />}
      />
      <Modal
        open={istShowVaultLoad.isShow}
        onClose={() => {
          setShowVaultLoad({ isShow: false })
        }}
        content={
          <VaultLoadPanel
            vaultRepayProps={vaultRepayProps as any}
            vaultBorrowProps={vaultBorrowProps as any}
            vaultLoadType={vaultLoadType as VaultLoadType}
            handleTabChange={handleTabChange}
          />
        }
      />
    </>
  )
}
