import { WithTranslation, withTranslation } from 'react-i18next'
import React from 'react'
import { ConfirmStopLimitRisk, StopLimitTrade, Toast, ToastType } from '@loopring-web/component-lib'
import { MarketType, TOAST_TIME } from '@loopring-web/common-resources'
import { usePageTradePro, useTicker, useTokenMap } from '@loopring-web/core'
import { Box, Divider, Typography } from '@mui/material'
import { useStopLimit } from './hookStopLimit'

export const StopLimitView = withTranslation('common')(
  ({
    t,
    market,
    resetTradeCalcData,
  }: // ,marketTicker
  {
    market: MarketType
    resetTradeCalcData: (props: { tradeData?: any; market: MarketType | string }) => void
    // marketTicker:  MarketBlockProps<C>
  } & WithTranslation) => {
    const { pageTradePro } = usePageTradePro()
    const { marketMap, tokenMap } = useTokenMap()
    const [confirmed, setConfirmed] = React.useState<boolean>(false)
    const { tickerMap } = useTicker()

    //@ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i)
    const {
      toastOpen: toastOpenL,
      closeToast: closeToastL,
      stopLimitTradeData,
      onChangeLimitEvent,
      tradeLimitI18nKey,
      tradeLimitBtnStatus,
      tradeLimitBtnStyle,
      limitBtnClick,
      isLimitLoading,
      handlePriceError,
      confirmStopLimit,
      limitAlertOpen,
      limitSubmit,
    } = useStopLimit({ market, resetTradeCalcData, setConfirmed })

    const isMarketUnavailable =
      marketMap && marketMap.market && (marketMap.market.status || 0) % 3 !== 0
    const marketUnavailableConent =
      isMarketUnavailable && (marketMap.market.status || 0) % 3 === 2
        ? 'This pair doesn’t support limit order, please place a market order'
        : ''

    return (
      <>
        <Toast
          alertText={isMarketUnavailable ? marketUnavailableConent : toastOpenL?.content ?? ''}
          severity={toastOpenL?.type ?? ToastType.success}
          open={toastOpenL?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToastL}
        />
        <ConfirmStopLimitRisk
          open={confirmed}
          handleClose={(_e) => {
            confirmStopLimit.handleClose()
          }}
          {...{ ...(confirmStopLimit as any) }}
        />
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'stretch'}
          height={'inherit'}
          sx={{ overflowY: 'scroll', background: 'var(--color-global-bg)' }}
          marginBottom={2}
          flex={1}
        >
          <Box component={'header'} width={'100%'}>
            <Typography variant={'body1'} paddingX={2} lineHeight={'44px'}>
              {t('labelStopLimitTitle')}
            </Typography>
          </Box>
          <Divider style={{ marginTop: '-1px' }} />
          <Box display={'flex'} component={'section'} flexDirection={'column'}>
            {pageTradePro.market && (
              <StopLimitTrade
                // @ts-ignore
                stopPriceProps={{
                  handleError: handlePriceError as any,
                  decimalsLimit: marketMap[market]?.precisionForPrice,
                }}
                tokenPriceProps={{
                  handleError: handlePriceError as any,
                  decimalsLimit: marketMap[market]?.precisionForPrice,
                }}
                tradeType={pageTradePro.tradeType}
                tokenBaseProps={{
                  disabled: isLimitLoading,
                  decimalsLimit: tokenMap[baseSymbol].precision,
                }}
                tokenQuoteProps={{
                  disabled: isLimitLoading,
                  decimalsLimit: tokenMap[quoteSymbol].precision,
                }}
                tradeLimitI18nKey={tradeLimitI18nKey}
                tradeLimitBtnStyle={tradeLimitBtnStyle}
                tradeLimitBtnStatus={tradeLimitBtnStatus as any}
                handleSubmitEvent={limitBtnClick as any}
                tradeCalcProData={pageTradePro.tradeCalcProData}
                tradeData={stopLimitTradeData}
                onChangeEvent={onChangeLimitEvent as any}
              />
            )}
            {pageTradePro.market && !tickerMap[pageTradePro.market].close && (
              <Typography
                variant={'body1'}
                paddingX={2}
                paddingTop={1}
                color={'var(--color-warning)'}
              >
                {t('labelStopLimitNotSupport')}
              </Typography>
            )}
          </Box>
        </Box>
      </>
    )
  },
)
