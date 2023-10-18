import { Divider, FormHelperText, Grid, Link, Typography } from '@mui/material'
import {
  CoinInfo,
  FORMAT_STRING_LEN,
  getValuePrecisionThousand,
  IBData,
} from '@loopring-web/common-resources'
import { InputCoinProps, InputSize } from './Interface'
import React from 'react'
import { useFocusRef } from '../hooks'
import { CoinWrap, IInput, IWrap } from './style'
import { useSettings } from '../../../../stores'
import { useTranslation } from 'react-i18next'
import { CoinIcon } from './Default'

function _InputMaxCoin<T extends IBData<C>, C, I extends CoinInfo<C>>(
  {
    order = 'left',
    label = 'Amount',
    handleError,
    subLabel,
    className,
    maxAllow,
    disabled,
    placeholderText = '0.00',
    inputData,
    handleCountChange,
    focusOnInput,
    name,
    allowDecimals = true,
    noBalance = '0.00',
    decimalsLimit = 8,
    size = InputSize.middle,
    isHideError = false,
    isShowCoinIcon = true,
    coinLabelStyle = undefined,
    coinPrecision = 6,
    CoinIconElement,
    tokenType,
    tokenImageKey,
  }: // coinIcon,
  InputCoinProps<T, C, I>,
  ref: React.ForwardedRef<any>,
) {
  const { t } = useTranslation('common')
  const { balance, belong, tradeValue } = (inputData ? inputData : {}) as IBData<C>
  // myLog("InputCoin", balance, belong, tradeValue);
  const { isMobile, coinJson } = useSettings()

  const [sValue, setsValue] = React.useState<number | undefined>(
    tradeValue ? tradeValue : undefined,
  )
  React.useEffect(() => {
    if (tradeValue === undefined && error.error) {
      setError({ error: false })
    } else if (balance !== undefined && tradeValue) {
      _handleError(tradeValue)
    }
  }, [tradeValue, balance])
  const [error, setError] = React.useState<{
    error: boolean
    message?: string | JSX.Element
  }>({
    error: false,
    message: '',
  })
  const _handleError = React.useCallback(
    (value: any) => {
      if (handleError) {
        let _error = handleError(
          {
            balance: Number(balance),
            belong,
            ...{ tradeValue: value },
            maxAllow,
          } as T & { maxAllow?: boolean },
          ref,
        )
        setError(_error ? _error : { error: false })
      }
    },
    [handleError, balance, belong, maxAllow, ref],
  )
  const inputCallback = React.useCallback(
    ({ current }: any) => {
      if (inputData && inputData.tradeValue !== Number(current?.value)) {
        setsValue(inputData.tradeValue)
        _handleError(inputData.tradeValue)
        // debounceCount({...inputData, ...{tradeValue: inputData.tradeValue}})
        // _handleContChange(current?.value, name)
      }
    },
    [inputData, _handleError],
  )
  const inputEle = useFocusRef({
    callback: inputCallback,
    shouldFocusOn: focusOnInput,
    value: tradeValue,
  })

  // const debounceCount = debounce(({...props}: any) => {
  //     if (handleCountChange) {
  //         handleCountChange({...props}, ref)
  //     }
  // }, wait)
  const _handleContChange = React.useCallback(
    (value: any, _name: any) => {
      _handleError(value)
      setsValue(value)
      if (handleCountChange) {
        handleCountChange({ ...inputData, ...{ tradeValue: value } } as any, _name, ref)
      }
      //debounceCount({...inputData, ...{tradeValue: value}})
    },
    [_handleError, setsValue, inputData, handleCountChange, ref],
  )

  // const _handleContChange =
  // const _handleOnClick = React.useCallback((event: React.MouseEvent) => {
  //     if (handleOnClick) handleOnClick(event,ref)
  // }, [])
  const _handleMaxAllowClick = React.useCallback(
    (_event: React.MouseEvent) => {
      if (maxAllow && !disabled) {
        _handleContChange(balance, name)
        //setsValue(balance);
      }
    },
    [_handleContChange, balance, name, maxAllow, disabled],
  )

  // const coinInfo: any = coinMap[ belong ] ? coinMap[ belong ] : {};
  // const hasLoaded = useImage(coinInfo.icon ? coinInfo.icon : '').hasLoaded;
  // formatValue(sValue)
  const formattedBalance = getValuePrecisionThousand(
    balance,
    undefined,
    undefined,
    coinPrecision,
    false,
    { floor: true },
  )
  return (
    <>
      <IWrap className={className} isMobile={isMobile} size={size} component={'div'} ref={ref}>
        <Grid
          container
          component={'div'}
          className={'label-wrap'}
          justifyContent={'space-between'}
          paddingBottom={1 / 2}
        >
          <Grid item xs={3}>
            <Typography
              fontSize={'inherit'}
              color={'var(--color-text-secondary)'}
              className={'main-label'}
              component={'span'}
            >
              {label}
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          className={`coinInput-wrap
         ${(belong && belong.length) >= FORMAT_STRING_LEN ? 'text-small' : ''} 
         ${error.error ? 'error' : ''}`}
          wrap={'nowrap'}
          alignItems={'stretch'}
          alignContent={'stretch'}
          marginBottom={size == 'small' ? 1 : 2}
        >
          <Grid
            order={order === 'left' ? 1 : 2}
            flex={1}
            item
            className={`input-wrap input-wrap-${order}`}
          >
            <IInput
              ref={inputEle}
              autoComplete='off'
              onValueChange={_handleContChange}
              value={typeof sValue === 'undefined' ? '' : isNaN(sValue) ? '' : sValue}
              allowNegativeValue={false}
              decimalSeparator='.'
              groupSeparator=','
              name={name}
              decimalsLimit={decimalsLimit}
              allowDecimals={allowDecimals}
              disabled={disabled || !belong}
              placeholder={placeholderText}
              aria-placeholder={placeholderText}
              aria-label={typeof label === 'string' ? label : ''}
            />
          </Grid>
          <Grid
            order={order === 'left' ? 2 : 1}
            xs={4}
            item
            display={'flex'}
            direction={'row'}
            alignItems={'center'}
            justifyContent={'space-around'}
            className={`input-wrap input-wrap-${order}`}
            paddingY={1}
            paddingX={1}
          >
            <CoinWrap
              order={order === 'left' ? 1 : 3}
              display={'flex'}
              alignItems={'center'}
              style={coinLabelStyle}
              justifyContent={order === 'left' ? 'flex-end' : 'flex-start'}
              className={`icon-wrap icon-wrap-${order} icon-input-max`}
            >
              {isShowCoinIcon && (
                <Grid
                  item
                  display={'flex'}
                  // order={order === 'left' ? 2 : 1}
                  paddingLeft={order === 'left' ? 0 : 0}
                  className={'logo-icon'}
                  width={'var(--list-menu-coin-size)'}
                  height={'var(--list-menu-coin-size)'}
                  alignItems={'center'}
                  justifyContent={order === 'left' ? 'flex-start' : 'center'}
                >
                  <CoinIcon
                    tokenImageKey={tokenImageKey ?? undefined}
                    symbol={belong}
                    type={tokenType ?? undefined}
                  />
                </Grid>
              )}
              {!isShowCoinIcon && CoinIconElement && (
                <Grid
                  item
                  display={'flex'}
                  // order={order === 'left' ? 2 : 1}
                  paddingLeft={order === 'left' ? 0 : 0}
                  className={'logo-icon'}
                  width={'var(--list-menu-coin-size)'}
                  height={'var(--list-menu-coin-size)'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  {CoinIconElement}
                </Grid>
              )}
              <Grid item order={order === 'left' ? 1 : 2} paddingLeft={order === 'left' ? 0 : 1}>
                <Typography fontSize={'inherit'} color={'inherit'}>
                  {belong}
                </Typography>
              </Grid>
            </CoinWrap>
            <Divider sx={{ order: 2 }} orientation={'vertical'} />
            <Link
              order={order === 'left' ? 3 : 1}
              component={'span'}
              fontSize={'inherit'}
              className={maxAllow && balance > 0 ? 'max-allow' : 'no-balance'}
              onClick={_handleMaxAllowClick}
            >
              {t('labelInputMax')}
            </Link>
          </Grid>
        </Grid>
        {subLabel && (
          <Grid container paddingBottom={1}>
            <Grid item xs={12}>
              <Typography component={'span'} fontSize={'body1'} color={'inherit'}>
                <Typography component={'span'} variant={'inherit'} color={'textSecondary'}>
                  {subLabel}
                  {/*{t('labelTokenMaxBalance')}*/}
                </Typography>
                <Typography
                  component={'span'}
                  variant={'inherit'}
                  color={'textPrimary'}
                  marginLeft={1 / 2}
                >
                  {balance ? formattedBalance : noBalance}
                </Typography>
              </Typography>
            </Grid>
          </Grid>
        )}
        {/*<Grid item xs={9} className={'sub-label'}>*/}
        {/*  */}
        {/*</Grid>*/}
        {isHideError ? (
          <></>
        ) : (
          <Grid
            container
            className={'message-wrap'}
            wrap={'nowrap'}
            alignItems={'stretch'}
            alignContent={'stretch'}
            justifyContent={'flex-end'}
          >
            <Grid item>
              <FormHelperText sx={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}>
                {error.message}
              </FormHelperText>
            </Grid>
          </Grid>
        )}
      </IWrap>
    </>
  )
}

export const InputMaxCoin = React.memo(React.forwardRef(_InputMaxCoin)) as <
  T extends IBData<C>,
  C,
  I extends CoinInfo<C>,
>(
  props: InputCoinProps<T, C, I> & React.RefAttributes<any>,
) => JSX.Element
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
