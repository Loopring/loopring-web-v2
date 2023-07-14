import {
  CoinInfo,
  CoinMap,
  IBData,
  ImageIcon,
  NFTWholeINFO,
  TRADE_TYPE,
} from '@loopring-web/common-resources'
import { Trans, useTranslation } from 'react-i18next'
import React, { ForwardedRef } from 'react'
import { BasicANFTTradeProps } from './Interface'
import {
  InputButton,
  InputButtonProps,
  InputCoin,
  InputCoinProps,
  InputSize,
} from '../../basic-lib'
import { Avatar, Box, Typography } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'

const BoxInput = styled(Box)`
  & .main-label {
    color: var(--color-text-secondary);
    font-size: ${({ theme }) => theme.fontDefault.body1};
  }
` as typeof Box
export const _BasicANFTTrade = <T extends IBData<I> & Partial<NFTWholeINFO>, I extends any>(
  {
    tradeData,
    onChangeEvent,
    disabled,
    isBalanceLimit,
    handleError: _handleError,
    inputNFTRef,
    baseURL,
    getIPFSString,
    inputNFTProps,
    inputNFTDefaultProps,
    // isSelected = false,
    // isRequired = false,
    isThumb,
    ...rest
  }: BasicANFTTradeProps<T, I>,
  _ref: ForwardedRef<any>,
) => {
  const { t } = useTranslation('common')
  const getDisabled = () => {
    return disabled || tradeData === undefined
  }

  const handleCountChange: any = React.useCallback(
    (_tradeData: T, _name: string, _ref: any) => {
      //const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
      if ((tradeData as T)?.tradeValue !== _tradeData.tradeValue) {
        onChangeEvent &&
          onChangeEvent(0, {
            tradeData: { ...tradeData, ..._tradeData },
            to: 'button',
          })
      }
    },
    [onChangeEvent, tradeData],
  )
  const handleOnClick = React.useCallback(
    (_event: React.MouseEvent, _ref: any) => {
      onChangeEvent(1, {
        tradeData: { ...tradeData, tradeValue: 0 },
        to: 'menu',
      })
    },
    [tradeData, onChangeEvent],
  )
  let handleError: any
  if (typeof _handleError !== 'function') {
    handleError = ({ balance, tradeValue }: T) => {
      if (
        (isBalanceLimit &&
          balance &&
          typeof tradeValue !== 'undefined' &&
          isBalanceLimit &&
          sdk.toBig(balance).lt(tradeValue)) ||
        (typeof tradeValue !== 'undefined' && Number(tradeValue) < 1)
      ) {
        return {
          error: true,
          message: t('tokenNotEnough', { belong: 'NFT' }),
        }
      }
      return { error: false, message: '' }
    }
  } else {
    handleError = _handleError
  }
  const CoinIconElement =
    isThumb && tradeData?.nftData ? (
      tradeData?.image ? (
        <img
          alt={tradeData?.belong ? tradeData?.belong : 'NFT'}
          width={'100%'}
          height={'100%'}
          src={getIPFSString(tradeData.image, baseURL)}
        />
      ) : (
        <Avatar
          sx={{
            bgcolor: 'var(--color-border-disable2)',
            width: '100%',
            height: '100%',
          }}
          variant={'circular'}
        >
          <ImageIcon />
        </Avatar>
      )
    ) : undefined
  const noSelectElement = React.useMemo(() => {
    const inputCoinProps: InputCoinProps<T, I, CoinInfo<I>> = {
      subLabel: t('labelAvailable'),
      placeholderText: '0',
      decimalsLimit: 0,
      allowDecimals: false,
      isHideError: true,
      isShowCoinInfo: !!isThumb,
      isShowCoinIcon: false,
      CoinIconElement,
      order: 'right',
      noBalance: '0',
      // coinLabelStyle ,
      coinPrecision: 0,
      maxAllow: isBalanceLimit,
      handleError: handleError as any,
      handleCountChange,
      ...inputNFTDefaultProps,
      ...inputNFTProps,
      ...rest,
    } as InputCoinProps<T, I, CoinInfo<I>>
    return (
      <InputCoin<T, I, CoinInfo<I>>
        ref={inputNFTRef}
        disabled={getDisabled()}
        {...{
          ...inputCoinProps,
          inputData: tradeData
            ? {
                ...tradeData,
                belong: tradeData?.belong ? tradeData?.belong : 'NFT',
              }
            : ({} as T),
          coinMap: {} as CoinMap<I, CoinInfo<I>>,
        }}
      />
    )
  }, [
    tradeData,
    getDisabled,
    isBalanceLimit,
    handleError,
    inputNFTRef,
    inputNFTProps,
    inputNFTDefaultProps,
    rest?.isSelected,
  ])
  const chooseElement = React.useMemo(() => {
    const inputBtnProps: InputButtonProps<T, any, I> = {
      subLabel: t('labelAvailable'),
      emptyText: t('labelChooseNFT'),
      placeholderText: '0',
      decimalsLimit: 0,
      allowDecimals: false,
      CoinIconElement,
      order: 'right',
      noBalance: '0',
      coinPrecision: 0,
      maxAllow: isBalanceLimit,
      handleError: handleError as any,
      handleCountChange,
      handleOnClick: handleOnClick as any,
      ...inputNFTDefaultProps,

      ...inputNFTProps,
      ...rest,
    } as InputButtonProps<T, any, I>
    return (
      <InputButton
        ref={inputNFTRef}
        disabled={getDisabled()}
        fullwidth={true}
        {...{
          ...inputBtnProps,
          inputData: tradeData
            ? {
                ...tradeData,
                belong: tradeData?.belong ? tradeData?.belong : t('tokenSelectNFTToken'),
              }
            : ({} as T),
          coinMap: {} as CoinMap<I, CoinInfo<I>>,
        }}
      />
    )
  }, [
    tradeData,
    getDisabled,
    isBalanceLimit,
    handleError,
    inputNFTRef,
    inputNFTProps,
    inputNFTDefaultProps,
    rest?.isSelected,
  ])
  return <>{rest?.isSelected ? chooseElement : noSelectElement}</>
}
export const BasicANFTTrade = React.memo(React.forwardRef(_BasicANFTTrade)) as <
  T extends IBData<I> & Partial<NFTWholeINFO>,
  I extends any,
>(
  props: BasicANFTTradeProps<T, I>,
  ref: ForwardedRef<any>,
) => JSX.Element

export const NFTInput = React.memo(
  <T extends IBData<I> & Partial<NFTWholeINFO>, I extends any>({
    isThumb,
    tradeData,
    isBalanceLimit = true,
    onCopy,
    inputNFTDefaultProps,
    inputNFTRef,
    type,
    disabled,
    getIPFSString,
    baseURL,
    fullwidth,
    ...rest
  }: BasicANFTTradeProps<T, I> & {
    onCopy?: (content: string) => Promise<void>
    type?: TRADE_TYPE.NFT
  }) => {
    const { t } = useTranslation('common')
    return (
      <>
        {isThumb ? (
          <Box
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            height={'auto'}
            width={'100%'}
          >
            <BasicANFTTrade
              {...{
                ...rest,
                t,
                isThumb,
                type,
                baseURL,
                fullwidth,
                getIPFSString,
                disabled,
                walletMap: {},
                tradeData,
                isBalanceLimit,
                inputNFTDefaultProps: {
                  label: rest?.isSelected ? (
                    <Typography
                      component={'span'}
                      variant={'body1'}
                      color={'textSecondary'}
                      className={'main-label'}
                      paddingBottom={1 / 2}
                      display={'inline-flex'}
                      height={24}
                      lineHeight={24}
                      alignItems={'center'}
                    >
                      {inputNFTDefaultProps?.label ? (
                        inputNFTDefaultProps?.label
                      ) : (
                        <Trans
                          i18nKey={'labelChooseNFT'}
                          tOptions={{
                            required: rest?.isRequired ? '\uFE61' : '',
                          }}
                        >
                          Choose NFT
                          <Typography component={'span'} variant={'inherit'} color={'error'}>
                            {'\uFE61'}
                          </Typography>
                        </Trans>
                      )}
                    </Typography>
                  ) : (
                    <Typography
                      variant={'body1'}
                      component={'span'}
                      color={'var(--color-text-secondary)'}
                      className={'main-label'}
                      paddingBottom={1 / 2}
                    >
                      {t(
                        typeof inputNFTDefaultProps?.label === 'string'
                          ? inputNFTDefaultProps?.label
                          : 'labelNFTTitle',
                      )}
                    </Typography>
                  ),
                },
                inputNFTRef,
                ...(typeof rest?.isSelected !== undefined
                  ? ({
                      isSelected: rest?.isSelected,
                      isRequired: !!rest?.isRequired,
                      // handleOnChoose,
                    } as any)
                  : {}),
              }}
            />
          </Box>
        ) : (
          <BoxInput>
            <BasicANFTTrade
              isThumb={isThumb}
              {...{
                ...rest,
                type,
                t,
                disabled,
                walletMap: {},
                tradeData,
                inputNFTDefaultProps: {
                  ...{ size: InputSize.small, label: t('labelTokenAmount') },
                  ...(inputNFTDefaultProps as any),
                },
                getIPFSString,
                baseURL,
                isBalanceLimit,
                inputNFTRef,
              }}
            />
          </BoxInput>
        )}
      </>
    )
  },
) as <T extends IBData<I> & Partial<NFTWholeINFO>, I extends any>(
  props: BasicANFTTradeProps<T, I> & {
    onCopy?: (content: string) => Promise<void>
    type?: TRADE_TYPE.NFT
  },
) => JSX.Element
