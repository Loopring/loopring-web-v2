import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import React from 'react'
import {
  AlertImpact,
  AlertLimitPrice,
  ConfirmImpact,
  LimitTrade,
  MarketTrade,
  PopoverPure,
  SmallOrderAlert,
  Toast,
  ToastType,
} from '@loopring-web/component-lib'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  Info2Icon,
  MarketType,
  TOAST_TIME,
  TradeProType,
} from '@loopring-web/common-resources'
import { PriceLevel, ShowWitchAle3t1, usePageTradePro, useTokenMap } from '@loopring-web/core'
import { useMarket } from './hookMarket'
import { useLimit } from './hookLimit'
import { Box, Divider, Tab, Tabs, Typography } from '@mui/material'
import { bindHover } from 'material-ui-popup-state/es'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'

// const TabsStyle = styled(Tabs)`
//   flex: 1;
//   width: 100%;
// ` as typeof Tabs
export enum TabIndex {
  market = 'market',
  limit = 'limit',
}

export const SpotView = withTranslation('common')(
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
    const [tabIndex, setTabIndex] = React.useState<TabIndex>(TabIndex.limit)
    const { marketMap, tokenMap } = useTokenMap()
    //@ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i)
    const {
      toastOpen: toastOpenL,
      closeToast: closeToastL,
      limitTradeData,
      onChangeLimitEvent,
      tradeLimitI18nKey,
      tradeLimitBtnStatus,
      tradeLimitBtnStyle,
      limitBtnClick,
      isLimitLoading,
      handlePriceError,
      resetLimitData,
      limitAlertOpen,
      limitSubmit,
    } = useLimit({ market, resetTradeCalcData })

    const {
      // alertOpen,
      // confirmOpen,
      toastOpen,
      closeToast,
      marketTradeData,
      onChangeMarketEvent,
      tradeMarketI18nKey,
      tradeMarketBtnStatus,
      tradeMarketBtnStyle,
      resetMarketData,
      marketBtnClick,
      isMarketLoading,
      showAlert,
      handleConfirm,
      handleClose,
      priceLevel,
      // priceAlertCallBack,
      // smallOrderAlertCallBack,
      // smallOrderAlertOpen,
    } = useMarket({ market, resetTradeCalcData })
    const onTabChange = React.useCallback(
      (_e, value) => {
        setTabIndex(value)
        //HIGH: Do not move the query
        resetLimitData()
        resetMarketData()
        resetTradeCalcData({ market })

        //HIGH: Do not move the query
      },
      [market],
    )

    const priceImpact = (getValuePrecisionThousand(
      parseFloat(pageTradePro.calcTradeParams?.priceImpact ?? '0') * 100,
      2,
    ) + '%') as any
    const popupLimitState = usePopupState({
      variant: 'popover',
      popupId: `popupId-limit`,
    })
    const popupMarketState = usePopupState({
      variant: 'popover',
      popupId: `popupId-market`,
    })

    const limitLabel = React.useMemo(() => {
      return (
        <>
          <Typography display={'inline-flex'} alignItems={'center'}>
            <Typography component={'span'} marginRight={1}>
              {t('labelProLimit')}
            </Typography>
            <Info2Icon
              {...bindHover(popupLimitState)}
              fontSize={'medium'}
              htmlColor={'var(--color-text-third)'}
            />
          </Typography>
          <PopoverPure
            className={'arrow-center'}
            {...bindPopper(popupLimitState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Typography
              padding={2}
              component={'p'}
              variant={'body2'}
              whiteSpace={'pre-line'}
              maxWidth={280}
            >
              <Trans i18nKey={'depositLimit'}>
                Limit orders set the maximum or minimum price at which you are willing to buy or
                sell.
              </Trans>
            </Typography>
          </PopoverPure>
        </>
      )
    }, [popupLimitState])
    const marketLabel = React.useMemo(() => {
      return (
        <>
          <Typography display={'inline-flex'} alignItems={'center'}>
            <Typography component={'span'} marginRight={1}>
              {t('labelProMarket')}
            </Typography>
            <Info2Icon
              {...bindHover(popupMarketState)}
              fontSize={'medium'}
              htmlColor={'var(--color-text-third)'}
            />
          </Typography>
          <PopoverPure
            className={'arrow-center'}
            {...bindPopper(popupMarketState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Typography
              padding={2}
              component={'p'}
              variant={'body2'}
              whiteSpace={'pre-line'}
              maxWidth={280}
            >
              <Trans i18nKey={'depositMarket'}>
                Market orders are transactions meant to execute as quickly as possible at the
                current market price.
              </Trans>
            </Typography>
          </PopoverPure>
        </>
      )
    }, [popupMarketState])

    const isMarketUnavailable =
      marketMap && marketMap.market && (marketMap.market.status || 0) % 3 !== 0
    const marketUnavailableConent =
      isMarketUnavailable && (marketMap.market.status || 0) % 3 === 2
        ? 'This pair doesn’t support limit order, please place a market order'
        : ''

    const tradeType = pageTradePro.tradeType
    const tradeCalcData = pageTradePro.tradeCalcProData
    const tradeData = marketTradeData
    const estimatedFee =
      tradeCalcData && tradeCalcData.fee
        ? `${tradeCalcData.fee} ${
            tradeType === TradeProType.sell ? tradeData.quote?.belong : tradeData.base?.belong
          }` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
        : EmptyValueTag
    const minimumReceived =
      tradeCalcData && tradeCalcData.minimumReceived
        ? `${tradeCalcData.minimumReceived}  ${
            tradeType === TradeProType.buy ? tradeData.base.belong : tradeData.quote.belong
          }`
        : EmptyValueTag
    const feePercentage =
      tradeCalcData && tradeData?.quote?.tradeValue
        ? (
            (Number(tradeCalcData.fee) /
              (tradeType === TradeProType.sell
                ? tradeData.quote.tradeValue
                : tradeData.base.tradeValue)) *
            100
          ).toFixed(2)
        : EmptyValueTag

    return (
      <>
        <Toast
          alertText={toastOpen?.content ?? ''}
          severity={toastOpen?.type ?? ToastType.success}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
        <Toast
          alertText={isMarketUnavailable ? marketUnavailableConent : toastOpenL?.content ?? ''}
          severity={toastOpenL?.type ?? ToastType.success}
          open={toastOpenL?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToastL}
        />
        {/*<AlertImpact*/}
        {/*  value={priceImpact}*/}
        {/*  open={alertOpen}*/}
        {/*  handleClose={priceAlertCallBack(false)}*/}
        {/*  handleConfirm={priceAlertCallBack(true)}*/}
        {/*  variance={}*/}
        {/*  marketPrice={}*/}
        {/*  settlementPrice={}*/}
        {/*  symbol={}*/}
        {/*  // handleClose={() => priceAlertCallBack(false)}*/}
        {/*  // handleConfirm={() => priceAlertCallBack(true)}*/}
        {/* */}
        {/*  // value={priceImpact}*/}
        {/*/>*/}
        <AlertImpact
          open={showAlert.isShow && showAlert.showWitch === ShowWitchAle3t1.AlertImpact}
          handleClose={handleClose}
          handleConfirm={handleConfirm}
          variance={priceImpact}
          marketPrice={tradeCalcData?.marketPrice ?? ''}
          settlementPrice={tradeCalcData?.StoB ?? ''}
          symbol={`${tradeData?.sell?.belong}/${tradeData?.buy?.belong}`}
        />
        <ConfirmImpact
          open={showAlert.isShow && showAlert.showWitch === ShowWitchAle3t1.AlertImpact}
          handleClose={handleClose}
          handleConfirm={handleConfirm}
          priceImpact={getValuePrecisionThousand(pageTradePro?.priceImpactObj?.value, 2)}
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
        {/*<ConfirmImpact*/}
        {/*  value={}*/}
        {/*  open={}*/}
        {/*  handleClose={}*/}
        {/*  handleConfirm={}*/}
        {/*  priceImpact={}*/}
        {/*  symbol={}*/}
        {/*  color={}*/}
        {/*  shouldInputAgree={}*/}
        {/*  // handleClose={() => priceAlertCallBack(false)}*/}
        {/*  // handleConfirm={() => priceAlertCallBack(true)}*/}
        {/*  // open={confirmOpen}*/}
        {/*  // value={priceImpact}*/}
        {/*/>*/}
        {/*<SmallOrderAlert*/}
        {/*  open={smallOrderAlertOpen}*/}
        {/*  handleClose={() => smallOrderAlertCallBack(false)}*/}
        {/*  handleConfirm={() => smallOrderAlertCallBack(true)}*/}
        {/*  estimatedFee={estimatedFee}*/}
        {/*  feePercentage={feePercentage}*/}
        {/*  minimumReceived={minimumReceived}*/}
        {/*  symbol={}*/}
        {/*/>*/}
        <AlertLimitPrice
          handleClose={limitSubmit}
          open={limitAlertOpen}
          value={
            pageTradePro.tradeType === TradeProType.buy
              ? 'labelPriceCompareGreat'
              : 'labelPriceCompareLess'
          }
        />
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'stretch'}
          height={'inherit'}
          sx={{ overflowY: 'scroll' }}
          marginBottom={2}
        >
          <Box component={'header'} width={'100%'}>
            <Tabs variant={'fullWidth'} value={tabIndex} onChange={onTabChange}>
              <Tab value={TabIndex.limit} label={limitLabel} />
              <Tab value={TabIndex.market} label={marketLabel} />
            </Tabs>
          </Box>

          <Divider style={{ marginTop: '-1px' }} />
          <Box display={'flex'} flex={1} component={'section'}>
            {tabIndex === TabIndex.limit && (
              <LimitTrade
                // disabled={false}
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
                tradeData={limitTradeData}
                onChangeEvent={onChangeLimitEvent as any}
              />
            )}
            {tabIndex === TabIndex.market && (
              <MarketTrade
                // disabled={false}

                tokenBaseProps={{
                  disabled: isMarketLoading,
                  decimalsLimit: tokenMap[baseSymbol].precision,
                }}
                tokenQuoteProps={{
                  disabled: isMarketLoading,
                  decimalsLimit: tokenMap[quoteSymbol].precision,
                }}
                tradeMarketI18nKey={tradeMarketI18nKey}
                tradeMarketBtnStyle={tradeMarketBtnStyle}
                tradeType={tradeType}
                tradeMarketBtnStatus={tradeMarketBtnStatus}
                handleSubmitEvent={marketBtnClick}
                tradeCalcProData={pageTradePro.tradeCalcProData}
                tradeData={tradeData}
                onChangeEvent={onChangeMarketEvent}
              />
            )}
          </Box>
        </Box>
      </>
    )
  },
)
