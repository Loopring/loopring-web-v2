import { FormHelperText, Grid, Typography } from '@mui/material'
import {
  CoinInfo,
  FORMAT_STRING_LEN,
  getValuePrecisionThousand,
  IBData,
  myLog,
} from '@loopring-web/common-resources'
import { InputCoinProps, InputSize } from './Interface'
import React from 'react'
import { useFocusRef } from '../hooks'
import { CoinWrap, IInput, IWrap } from './style'
import { CoinIcon } from './Default'
import { useSettings } from '../../../../stores'
import { sanitize } from 'dompurify'

function _InputCoin<T extends IBData<C>, C, I extends CoinInfo<C>>(
  {
    order = 'left',
    label = 'Amount',
    handleError,
    subLabel,
    className,
    // wait = globalSetup.wait,
    // coinMap,
    // isBalanceLimit = true,
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
    isShowCoinInfo = true,
    isShowCoinIcon = true,
    coinLabelStyle = undefined,
    coinPrecision = 6,
    CoinIconElement,
    tokenType,
    tokenImageKey,
    belongAlice = undefined,
  }: InputCoinProps<T, C, I>,
  ref: React.ForwardedRef<any>,
) {
  const { balance, belong, tradeValue } = (inputData ? inputData : {}) as IBData<C>
  // myLog("InputCoin", balance, belong, tradeValue);
  const { isMobile } = useSettings()
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

  myLog('inputCoin ref inputEle', inputEle)
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
              color={'var(--color-text-third)'}
              className={'main-label'}
              component={'span'}
            >
              {label}
            </Typography>
          </Grid>
          <Grid item xs={9} className={'sub-label'}>
            {subLabel && belong ? (
              <Typography
                component={'span'}
                fontSize={'inherit'}
                color={'inherit'}
                className={maxAllow && balance > 0 ? 'max-allow' : 'no-balance'}
                onClick={_handleMaxAllowClick}
              >
                <span>{subLabel}</span>
                <span>{balance ? formattedBalance : noBalance}</span>
              </Typography>
            ) : null}
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
        >
          {isShowCoinInfo && (
            <CoinWrap
              order={order === 'left' ? 2 : 1}
              display={'flex'}
              alignItems={'center'}
              style={coinLabelStyle}
              className={`icon-wrap icon-wrap-${order}`}
            >
              <Grid container align-items={'center'} display={'flex'}>
                {isShowCoinIcon && (
                  <Grid
                    item
                    display={'flex'}
                    order={order === 'left' ? 2 : 1}
                    paddingLeft={order === 'left' ? 1 : 0}
                    className={'logo-icon'}
                    width={'var(--list-menu-coin-size)'}
                    height={'var(--list-menu-coin-size)'}
                    alignItems={'center'}
                    justifyContent={'center'}
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
                    order={order === 'left' ? 2 : 1}
                    paddingLeft={order === 'left' ? 1 : 0}
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
                  <Typography
                    fontSize={'inherit'}
                    color={'inherit'}
                    dangerouslySetInnerHTML={{ __html: sanitize(belongAlice ?? belong) }}
                  />
                </Grid>
              </Grid>
            </CoinWrap>
          )}

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
            <label />
          </Grid>
        </Grid>

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

export const InputCoin = React.memo(React.forwardRef(_InputCoin)) as <
  T extends IBData<C>,
  C,
  I extends CoinInfo<C>,
>(
  props: InputCoinProps<T, C, I> & React.RefAttributes<any>,
) => JSX.Element
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
