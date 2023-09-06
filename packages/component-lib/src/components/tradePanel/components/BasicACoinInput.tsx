import { CoinInfo, CoinMap, IBData } from '@loopring-web/common-resources'
import { WithTranslation } from 'react-i18next'
import React from 'react'
import { BasicACoinInputProps } from './Interface'
import { InputCoin, InputCoinProps } from '../../basic-lib'
import * as sdk from '@loopring-web/loopring-sdk'

export const BasicACoinInput = <T extends Partial<IBData<I>>, I>({
  t,
  tradeData,
  onChangeEvent,
  coinMap,
  walletMap,
  disabled,
  handleError,
  inputCoinRef,
  inputCoinProps,
  inputCoinDefaultProps,
  className,
  ...rest
}: BasicACoinInputProps<T, I> & WithTranslation) => {
  const getDisabled = () => {
    if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined) {
      return true
    } else {
      return false
    }
  }
  const handleOnClick = React.useCallback(
    (_event: React.MouseEvent, _ref: any) => {
      onChangeEvent(1, {
        tradeData: { ...tradeData, tradeValue: 0 },
        to: 'menu',
      })
    },
    [tradeData, onChangeEvent],
  )
  const handleCountChange: any = React.useCallback(
    (_tradeData: T, _name: string, _ref: any) => {
      //const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
      if (tradeData.tradeValue !== _tradeData.tradeValue) {
        onChangeEvent(0, {
          tradeData: { ...tradeData, ..._tradeData },
          to: 'button',
        })
      }

      // onCoinValueChange(ibData);
    },
    [onChangeEvent, tradeData],
  )

  if (typeof handleError !== 'function') {
    handleError = ({ belong, balance, tradeValue }: T) => {
      const minimum = inputCoinProps?.minimum ?? inputCoinDefaultProps?.minimum
      const maxValue = inputCoinProps?.maxValue
      if (
        (typeof tradeValue !== 'undefined' && balance && balance < tradeValue) ||
        (tradeValue && !balance)
      ) {
        return {
          error: true,
          message: t('tokenNotEnough', { belong: belong }),
        }
      } else if (
        typeof tradeValue !== 'undefined' &&
        minimum !== undefined &&
        tradeValue < Number(minimum)
      ) {
        return {
          error: true,
          message: t('errorMinError', {
            value: minimum,
            ns: ['error', 'common'],
          }),
        }
      } else if (
        typeof tradeValue !== 'undefined' &&
        maxValue !== undefined &&
        sdk.toBig(tradeValue).gt(maxValue)
      ) {
        return {
          error: true,
          message: t('errorMaxError', {
            value: maxValue,
            ns: ['error', 'common'],
          }),
        }
      }
      return { error: false, message: '' }
    }
  }

  const _inputCoinProps: InputCoinProps<T, CoinInfo<I>, I> = {
    subLabel: t('tokenMax'),
    emptyText: t('tokenSelectToken'),
    placeholderText: '0.00',
    maxAllow: true,
    order: 'right',
    handleError: handleError as any,
    handleCountChange,
    handleOnClick,
    label: t('labelInput'),
    ...inputCoinDefaultProps,
    ...inputCoinProps,
    ...rest,
  } as InputCoinProps<T, CoinInfo<I>, I>

  return (
    <InputCoin
      ref={inputCoinRef}
      isShowCoinIcon={true}
      disabled={getDisabled()}
      className={className}
      {...{
        ...(_inputCoinProps as any),
        inputData: tradeData ? tradeData : ({} as T),
        coinMap: coinMap ? coinMap : ({} as CoinMap<I, CoinInfo<I>>),
      }}
    />
  )
}
