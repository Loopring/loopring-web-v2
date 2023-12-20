import React from 'react'
import {
  useNotify,
  useVaultJoin,
  useVaultLayer2,
  useVaultLoan,
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
  VaultLoanPanel,
} from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'
import {
  TOAST_TIME,
  TokenType,
  TRADE_TYPE,
  VaultAction,
  VaultLoanType,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'

export const ModalVaultWrap = () => {
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
  const { vaultRepayProps, vaultBorrowProps, vaultLoanType, handleTabChange } = useVaultLoan()
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
        contentClassName={'vault-wrap'}
        open={isShowVaultJoin.isShow}
        onClose={() => {
          setShowVaultJoin({ isShow: false })
          if (
            ![sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus as any)
          ) {
            setShowNoVaultAccount({
              isShow: true,
              whichBtn: VaultAction.VaultJoin,
              des: 'labelJoinDesMessage',
              title: 'labelJoinTitle',
            })
          }
        }}
        content={
          <VaultJoinPanel
            {...{
              ...(joinVaultProps as any),
              type: TRADE_TYPE.TOKEN,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `auto`,
            }}
          />
        }
      />
      <Modal
        contentClassName={'vault-wrap'}
        open={isShowVaultSwap.isShow}
        onClose={() => {
          setShowVaultSwap({ isShow: false })
        }}
        content={
          <SwapPanel
            _width={'var(--modal-width)'}
            classWrapName={'vaultSwap'}
            titleI8nKey={'labelVaultSwap'}
            tokenBuyProps={{
              tokenImageKey: coinMap[tradeData?.buy?.belong?.toString()]?.erc20Symbol,
              tokenType: TokenType.vault,
              disableInputValue: isMarketInit,
              disabled: isSwapLoading || isMarketInit,
              decimalsLimit: tradeCalcData.buyPrecision,
            }}
            tokenSellProps={{
              tokenImageKey: coinMap[tradeData?.sell?.belong?.toString()]?.erc20Symbol,
              tokenType: TokenType.vault,
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
            vaultBorrowProps={vaultBorrowProps as any}
            vaultLoanType={vaultLoanType as VaultLoanType}
            handleTabChange={handleTabChange}
          />
        }
      />
    </>
  )
}
