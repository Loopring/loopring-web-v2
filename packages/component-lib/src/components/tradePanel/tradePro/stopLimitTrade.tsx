import { WithTranslation, withTranslation } from 'react-i18next'
import { BtnPercentage, InputCoin, InputSize } from '../../basic-lib'
import {
  LimitTradeData,
  StopLimitTradeData,
  TradeLimitProps,
  TradeStopLimitProps,
} from '../Interface'
import {
  CoinInfo,
  CoinKey,
  CoinMap,
  CurrencyToTag,
  IBData,
  Info2Icon,
  PriceTag,
  TradeBaseType,
  TradeBtnStatus,
  TradeCalcProData,
  TradeProType,
} from '@loopring-web/common-resources'
import { Box, Icon, Tab, Tooltip, Typography } from '@mui/material'
import { TabsStyle } from '../components/Styled'
import { useCommon } from './hookCommon'
import { Button } from './../../index'
import React from 'react'
import { useSettings } from '../../../stores'
import * as sdk from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'

const BoxStyle = styled(Box)`
  .stopPrice {
    input::placeholder {
      white-space: pre-wrap;
      font-size: 10px;
      position: absolute;
      height: fit-content;
      align-items: center;
      top: 50%;
      left: 50%;
      width: 90%;
      transform: translate(-50%, -50%);
    }
  }
` as typeof Box
export const StopLimitTrade = withTranslation('common', { withRef: true })(
  <
    L extends StopLimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>,
    I = CoinKey<any>,
  >({
    tradeData = { type: TradeProType.sell } as L,
    ...props
  }: TradeStopLimitProps<L, T, TCD, I> & WithTranslation) => {
    const {
      t,
      tradeType,
      tradeLimitI18nKey,
      tradeLimitBtnStatus,
      tradeLimitBtnStyle,
      tokenPriceProps,
      stopPriceProps,
      handleSubmitEvent,
      onChangeEvent,
    } = props
    const { currency } = useSettings()
    const priceRef = React.useRef()
    const stopPriceRef = React.useRef()
    const {
      quoteRef,
      baseRef,
      btnLabel,
      getDisabled,
      _handleChangeIndex,
      // inputError,
      tradeCalcProData,
      tradeBtnBaseStatus,
      handleCountChange,
      propsBase,
      propsQuote,
      onPercentage,
      selectedPercentage,
    } = useCommon({
      type: 'limit',
      ...(props as any),
      tradeData,
      tradeType,
      onChangeEvent,
      i18nKey: tradeLimitI18nKey ? tradeLimitI18nKey : 'labelProLimitBtn',
      tradeBtnBaseStatus: tradeLimitBtnStatus,
    })
    const propsPrice = React.useMemo(() => {
      return {
        label: (
          <Box display={'flex'} alignItems={'center'}>
            {t('labelStopPrice')}
            <Tooltip sx={{ marginLeft: 1 / 2 }} title={t('labelStopStopPriceDes')}>
              <Icon>
                <Info2Icon fontSize={'medium'} />
              </Icon>
            </Tooltip>
          </Box>
        ),
        subLabel: `\u2248 ${PriceTag[CurrencyToTag[currency]]}`,
        emptyText: t('tokenSelectToken'),
        placeholderText: '0.00',
        size: InputSize.small,
        order: '"right"' as any,
        coinPrecision: 2,
        coinLabelStyle: { color: 'var(--color-text-secondary)' },
        isShowCoinIcon: false,
        ...tokenPriceProps,
        handleCountChange,
        maxAllow: false,
        t,
      }
    }, [tradeType, TradeProType, tokenPriceProps, handleCountChange])
    const propsStopPrice = React.useMemo(() => {
      return {
        label: (
          <Box display={'flex'} alignItems={'center'}>
            {t('labelStopStopPrice')}
            <Tooltip sx={{ marginLeft: 1 / 2 }} title={t('labelStopStopPriceDes')}>
              <Icon>
                <Info2Icon fontSize={'medium'} />
              </Icon>
            </Tooltip>
          </Box>
        ),
        subLabel: `\u2248 ${PriceTag[CurrencyToTag[currency]]}`,
        emptyText: t('tokenSelectToken'),
        placeholderText:
          tradeCalcProData.stopRange &&
          tradeCalcProData.stopRange[0] &&
          tradeCalcProData.stopRange[1]
            ? t('labelStopLimitMinMax', {
                minValue: tradeCalcProData.stopRange[0],
                maxValue: tradeCalcProData.stopRange[1],
              })
            : '0.00',
        size: InputSize.small,
        order: '"right"' as any,
        coinPrecision: 2,
        coinLabelStyle: { color: 'var(--color-text-secondary)' },
        isShowCoinIcon: false,
        ...stopPriceProps,
        handleCountChange,
        maxAllow: false,
        handleError: (data: T) => {
          if (
            data.tradeValue &&
            tradeCalcProData.stopRange &&
            tradeCalcProData.stopRange[1] &&
            tradeCalcProData.stopRange[0] &&
            (sdk
              .toBig(data.tradeValue)
              .gt(tradeCalcProData.stopRange[1]?.replaceAll(sdk.SEP, '')) ||
              sdk.toBig(data.tradeValue).lt(tradeCalcProData.stopRange[0]?.replaceAll(sdk.SEP, '')))
          ) {
            return {
              error: true,
            }
          }
          return {
            error: false,
          }
        },
        t,
      }
    }, [tradeType, TradeProType, stopPriceProps, handleCountChange])

    return (
      <BoxStyle flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
        <Box
          className={'tool-bar'}
          paddingX={2}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Box component={'header'} width={'100%'}>
            <TabsStyle
              className={'trade-tabs pro-tabs'}
              variant={'fullWidth'}
              value={tradeType}
              onChange={(_e, index) => _handleChangeIndex(index)}
            >
              <Tab className={'trade-tab-buy'} value={TradeProType.buy} label={t('labelProBuy')} />
              <Tab
                className={'trade-tab-sell'}
                value={TradeProType.sell}
                label={t('labelProSell')}
              />
            </TabsStyle>
          </Box>
        </Box>
        <Box className={'trade-panel'} paddingX={2} paddingTop={2}>
          <Box paddingTop={2}>
            <InputCoin<any, I, CoinInfo<I>>
              ref={stopPriceRef as any}
              name={TradeBaseType.stopPrice}
              className={'stopPrice'}
              disabled={false}
              {...({
                ...propsStopPrice,
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                maxAllow: false,
                isHideError: true,
                inputData: tradeData ? tradeData.stopPrice : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              } as any)}
            />
          </Box>
          <Box paddingTop={2}>
            <InputCoin<any, I, CoinInfo<I>>
              ref={priceRef as any}
              name={TradeBaseType.price}
              disabled={false}
              {...({
                ...propsPrice,
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                maxAllow: false,
                isHideError: true,
                inputData: tradeData ? tradeData.price : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              } as any)}
            />
          </Box>
          <Box paddingTop={2}>
            <InputCoin<any, I, CoinInfo<I>>
              ref={baseRef as any}
              name={TradeBaseType.base}
              disabled={getDisabled()}
              {...{
                ...propsBase,
                // maxAllow:false,
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                isHideError: true,
                handleCountChange,
                inputData: tradeData ? tradeData.base : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              }}
            />
          </Box>
          {/*</Grid>*/}
          {/*<Grid item>*/}
          <Box alignSelf={'center'} paddingTop={4} paddingX={1}>
            <BtnPercentage
              step={1}
              // valuetext={(value)=>`${value}%`}
              getAriaLabel={(value) => `${value}%`}
              valueLabelFormat={(value) => `${value}%`}
              valueLabelDisplay={'on'}
              selected={selectedPercentage}
              anchors={[
                {
                  value: 0,
                  label: '',
                },
                {
                  value: 25,
                  label: '',
                },
                {
                  value: 50,
                  label: '',
                },
                {
                  value: 75,
                  label: '',
                },
                {
                  value: 100,
                  label: '',
                },
              ]}
              handleChanged={onPercentage}
            />
          </Box>
          <Box paddingTop={2}>
            <InputCoin<any, I, CoinInfo<I>>
              ref={quoteRef}
              name={TradeBaseType.quote}
              disabled={getDisabled()}
              {...{
                ...propsQuote,
                isHideError: true,
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                handleCountChange,
                inputData: tradeData ? tradeData.quote : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              }}
            />
          </Box>
        </Box>
        <Box className={'info-panel'} paddingX={2} paddingTop={2}></Box>
        <Box paddingX={2} paddingTop={2}>
          {/*{getDisabled()} {tradeBtnBaseStatus}*/}
          <Button
            variant={'contained'}
            size={'medium'}
            color={tradeType === TradeProType.sell ? 'error' : 'success'}
            loadingbg={
              tradeType === TradeProType.sell ? 'var(--color-error)' : 'var(--color-success)'
            }
            style={tradeLimitBtnStyle}
            onClick={() => {
              handleSubmitEvent(tradeData)
            }}
            loading={
              !getDisabled() && tradeBtnBaseStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
            }
            disabled={
              getDisabled() ||
              tradeBtnBaseStatus === TradeBtnStatus.DISABLED ||
              tradeBtnBaseStatus === TradeBtnStatus.LOADING
            }
            fullWidth={true}
          >
            {btnLabel}
          </Button>
        </Box>
      </BoxStyle>
    )
  },
) as <
  L extends LimitTradeData<T>,
  T extends IBData<I>,
  TCD extends TradeCalcProData<I>,
  I = CoinKey<any>,
>(
  props: TradeLimitProps<L, T, TCD, I>,
) => JSX.Element
