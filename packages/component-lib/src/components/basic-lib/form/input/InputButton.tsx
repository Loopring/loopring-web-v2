import { FormHelperText, Grid, Typography } from '@mui/material'
import {
  CoinInfo,
  DropDownIcon,
  EmptyValueTag,
  FORMAT_STRING_LEN,
  getValuePrecisionThousand,
  IBData,
  SoursURL,
} from '@loopring-web/common-resources'
import { InputButtonProps, InputSize } from './Interface'
import React from 'react'
import { useFocusRef } from '../hooks'
import { IInput, ISBtn, IWrap } from './style'
import { CoinIcon } from './Default'
import { sanitize } from 'dompurify'
import * as sdk from '@loopring-web/loopring-sdk'

function _InputButton<T extends Partial<IBData<C>>, C, I extends CoinInfo<C>>(
  {
    label = 'Enter token',
    handleError,
    subLabel,
    // wait = globalSetup.wait,
    // coinMap,
    disableInputValue,
    maxAllow,
    disabled,
    decimalsLimit = 8,
    allowDecimals = true,
    isShowCoinIcon = false,
    CoinIconElement,
    emptyText = 'tokenSelectToken',
    placeholderText = '0.00',
    inputData,
    handleCountChange,
    handleOnClick,
    focusOnInput,
    name,
    size = InputSize.middle,
    isHideError = false,
    fullwidth = false,
    loading = false,
    disableBelong = false,
    className,
    tokenType,
    tokenImageKey,
  }: // isAllowBalanceClick
  InputButtonProps<T, C, I>,
  ref: React.ForwardedRef<any>,
) {
  const { balance, belong, tradeValue } = (inputData ? inputData : {}) as IBData<C>
  const [sValue, setsValue] = React.useState<number | undefined | string>(
    tradeValue ? tradeValue : undefined,
  )
  const [error, setError] = React.useState<{
    error: boolean
    message?: string | JSX.Element
  }>({
    error: false,
    message: '',
  })
  React.useEffect(() => {
    if (tradeValue === undefined && error.error) {
      setError({ error: false })
    } else if (balance && tradeValue) {
      _handleError(tradeValue)
    }
  }, [tradeValue, balance])
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
    [_handleContChange, balance, name, maxAllow],
  )
  //@ts-ignore
  // const {coinJson} = useSettings();
  // const coinIcon: any = coinJson[ belong ];
  //"x": 248,
  // "y": 322,
  // "w": 36,
  // "h": 35,
  // "offX": 0,
  // "offY": 0,
  // "sourceW": 37,
  // "sourceH": 36
  // const coinInfo: any = coinMap[ belong ] ? coinMap[ belong ] : {};
  // const hasLoaded = useImage(coinInfo.icon ? coinInfo.icon : '').hasLoaded;

  // formatValue(sValue)

  return (
    <IWrap className={className} component={'div'} ref={ref} size={size} fullWidth={fullwidth}>
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
            className={'main-label'}
            color={'var(--color-text-third)'}
          >
            {label}
          </Typography>
        </Grid>
        <Grid item xs={9} className={'sub-label'}>
          {subLabel && belong ? (
            <Typography
              fontSize={'inherit'}
              className={
                maxAllow && balance > 0
                  ? `max-allow ${disabled ? 'disabled' : ''}`
                  : `no-balance ${disabled ? 'disabled' : ''}`
              }
              onClick={_handleMaxAllowClick}
            >
              <span>{subLabel}</span>
              <span>
                {balance ? getValuePrecisionThousand(balance, 8, 8, 8, false) : EmptyValueTag}
              </span>
            </Typography>
          ) : null}
        </Grid>
      </Grid>
      <Grid
        container
        className={`btnInput-wrap
                  ${(belong && belong.length) >= FORMAT_STRING_LEN ? 'text-small' : ''}
                  ${error.error ? 'error' : ''}
                  `}
        wrap={'nowrap'}
        alignItems={'stretch'}
        alignContent={'stretch'}
      >
        <Grid item className={'btn-wrap'}>
          <ISBtn
            variant={'text'}
            onClick={(event) => handleOnClick(event, name ?? 'inputBtnDefault', ref)}
            endIcon={
              <DropDownIcon color={'inherit'} fontSize={'large'} style={{ marginLeft: '-4px' }} />
            }
            disabled={disabled || disableBelong}
          >
            {belong ? (
              <Grid container align-items={'center'} display={'flex'}>
                {isShowCoinIcon && (
                  <Grid
                    item
                    display={'flex'}
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
                    className={'logo-icon'}
                    width={'var(--list-menu-coin-size)'}
                    height={'var(--list-menu-coin-size)'}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    {CoinIconElement}
                  </Grid>
                )}
                <Grid item paddingLeft={1}>
                  <Typography
                    fontSize={'inherit'}
                    color={'inherit'}
                    dangerouslySetInnerHTML={{ __html: sanitize(belong) }}
                  />
                </Grid>
              </Grid>
            ) : (
              <span className={'placeholder'}>{emptyText}</span>
            )}
          </ISBtn>
        </Grid>
        <Grid item className={'input-wrap input-wrap-right'} sx={{ position: 'relative' }}>
          {loading && (
            <img
              style={{
                position: 'absolute',
                transform: 'translate(50%, -50%)',
                top: '50%',
                right: '24px',
              }}
              className='loading-gif'
              alt={'loading'}
              width='24'
              src={`${SoursURL}images/loading-line.gif`}
            />
          )}

          <IInput
            className={loading ? 'loading' : ''}
            ref={inputEle}
            autoComplete='off'
            onValueChange={_handleContChange}
            value={typeof sValue === 'undefined' ? '' : sValue}
            allowNegativeValue={false}
            decimalSeparator='.'
            groupSeparator={sdk.SEP}
            name={name}
            disabled={!(!disabled || belong) || disableInputValue || loading}
            placeholder={placeholderText}
            aria-placeholder={placeholderText}
            aria-label={belong}
            decimalsLimit={decimalsLimit}
            allowDecimals={allowDecimals}
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
            <FormHelperText>{error.message}</FormHelperText>
          </Grid>
        </Grid>
      )}
    </IWrap>
  )
}

export const InputButton = React.memo(React.forwardRef(_InputButton)) as <
  T,
  C,
  I extends CoinInfo<C>,
>(
  props: InputButtonProps<T, C, I> & React.RefAttributes<any>,
) => JSX.Element
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
