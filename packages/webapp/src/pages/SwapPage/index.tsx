import { Box } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  AlertImpact,
  ConfirmImpact,
  SmallOrderAlert,
  SwapPanel,
  SwapSecondConfirmation,
  Toast,
  ToastType,
} from '@loopring-web/component-lib'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  myLog,
  SoursURL,
  TOAST_TIME,
} from '@loopring-web/common-resources'
import {
  getPriceImpactInfo,
  PriceLevel,
  ShowWitchAle3t1,
  useNotify,
  useSwap,
} from '@loopring-web/core'
import React from 'react'

export const SwapPage = withTranslation('common')(({ ...rest }: WithTranslation) => {
  const {
    tradeCalcData,
    tradeData,
    handleSwapPanelEvent,
    onSwapClick,
    swapBtnI18nKey,
    swapBtnStatus,
    toastOpen,
    closeToast,
    should15sRefresh,
    market,
    refreshRef,
    pageTradeLite,
    isSwapLoading,
    toPro,
    isMarketInit,
    isMobile,
    setToastOpen,
    showAlert,
    handleConfirm,
    handleClose,
    priceLevel,
    // alertOpen,
    // confirmOpen,
    // pageTradeLite,
    // priceAlertCallBack,
    // smallOrderAlertCallBack,
    // secondConfirmationCallBack,
    // smallOrderAlertOpen,
    // secondConfirmationOpen,
  } = useSwap({ path: '/trade/lite' })

  const styles = isMobile ? { flex: 1 } : { width: 'var(--swap-box-width)' }
  const { campaignTagConfig } = useNotify().notifyMap ?? {}
  const estimatedFee =
    tradeCalcData && tradeCalcData.fee && tradeData
      ? `${tradeCalcData.fee} ${tradeData.buy?.belong}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
      : EmptyValueTag
  const minimumReceived =
    tradeCalcData && tradeCalcData.minimumReceived && tradeData
      ? `${tradeCalcData.minimumReceived}  ${tradeData.buy?.belong}`
      : EmptyValueTag
  const feePercentage =
    tradeCalcData && tradeData?.buy.tradeValue
      ? ((Number(tradeCalcData.fee) / tradeData.buy.tradeValue) * 100).toFixed(2)
      : EmptyValueTag
  const priceImpactColor = tradeCalcData?.priceImpactColor
    ? tradeCalcData.priceImpactColor
    : 'textPrimary'
  const priceImpact =
    tradeCalcData?.priceImpact !== undefined
      ? getValuePrecisionThousand(tradeCalcData.priceImpact, undefined, undefined, 2, true) + ' %'
      : EmptyValueTag
  const userTakerRate =
    tradeCalcData && tradeCalcData.feeTakerRate
      ? (tradeCalcData.feeTakerRate / 100).toString()
      : EmptyValueTag
  const tradeCostMin =
    tradeCalcData && tradeCalcData.tradeCost && tradeData
      ? `${tradeCalcData.tradeCost} ${tradeData.buy?.belong}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
      : EmptyValueTag

  const fromSymbol = tradeData?.sell.belong ?? EmptyValueTag
  const fromAmount = tradeData?.sell.tradeValue?.toString() ?? EmptyValueTag
  const toSymbol = tradeData?.buy.belong ?? EmptyValueTag
  const toAmount = tradeData?.buy.tradeValue?.toString() ?? EmptyValueTag
  const slippage = tradeData
    ? tradeData.slippage
      ? `${tradeData.slippage}`
      : '0.1'
    : EmptyValueTag
  myLog('isMarketInit', isMarketInit)
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      flex={1}
    >
      <Box
        paddingBottom={isMobile ? 2 : 'initial'}
        display={'flex'}
        style={styles}
        justifyContent={'center'}
      >
        {tradeData ? (
          <SwapPanel
            toPro={toPro}
            tokenBuyProps={{
              disableInputValue: isMarketInit || isSwapLoading,
              disabled: isMarketInit || isSwapLoading,
              decimalsLimit: tradeCalcData.buyPrecision,
            }}
            tokenSellProps={{
              disableInputValue: isMarketInit || isSwapLoading,
              disabled: isMarketInit || isSwapLoading,
              decimalsLimit: tradeCalcData.sellPrecision,
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
        ) : (
          <Box
            flex={1}
            height={'100%'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <img className='loading-gif' width='36' src={`${SoursURL}images/loading-line.gif`} />
          </Box>
        )}
      </Box>
      <Toast
        alertText={toastOpen?.content ?? ''}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
      <AlertImpact
        open={showAlert.isShow && showAlert.showWitch === ShowWitchAle3t1.AlertImpact}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        variance={tradeCalcData?.marketRatePrice ?? ''}
        marketPrice={tradeCalcData?.marketPrice ?? ''}
        settlementPrice={tradeCalcData?.StoB ?? ''}
        symbol={`${tradeData?.sell?.belong}/${tradeData?.buy?.belong}`}
      />
      <ConfirmImpact
        open={showAlert.isShow && showAlert.showWitch === ShowWitchAle3t1.AlertImpact}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        priceImpact={getValuePrecisionThousand(pageTradeLite?.priceImpactObj?.value, 2)}
        color={'var(--color-error)'} //priceLevel.priceImpactColor
        shouldInputAgree={priceLevel.priceLevel === PriceLevel.Lv2}
      />
      <SmallOrderAlert
        open={showAlert.isShow && showAlert.showWitch === ShowWitchAle3t1.AlertImpact}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        estimatedFee={estimatedFee}
        feePercentage={feePercentage}
        minimumReceived={minimumReceived}
        symbol={`${tradeData?.sell?.belong}/${tradeData?.buy?.belong}`}
      />
      <SwapSecondConfirmation
        open={showAlert.isShow && showAlert.showWitch === ShowWitchAle3t1.AlertImpact}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        fromSymbol={fromSymbol}
        fromAmount={fromAmount}
        toSymbol={toSymbol}
        toAmount={toAmount}
        slippage={slippage}
        userTakerRate={userTakerRate}
        tradeCostMin={tradeCostMin}
        estimateFee={estimatedFee}
        priceImpactColor={priceImpactColor}
        priceImpact={priceImpact}
        minimumReceived={minimumReceived}
      />
    </Box>
  )
})
