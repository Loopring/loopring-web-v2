import { Divider, FormHelperText, Grid, Link, Typography } from '@mui/material'
import {
  CoinInfo,
  DropDownIcon,
  FORMAT_STRING_LEN,
  getValuePrecisionThousand,
  IBData,
  SoursURL,
} from '@loopring-web/common-resources'
import { InputButtonProps, InputSize } from './Interface'
import React from 'react'
import { useFocusRef } from '../hooks'
import { IInput, ISBtn, IWrap } from './style'
import { sanitize } from 'dompurify'
import { useTranslation } from 'react-i18next'
import { CoinIcon } from './Default'

function _InputMaxButton<T extends Partial<IBData<C>>, C, I extends CoinInfo<C>>(
  {
    label = 'Enter token',
    handleError,
    subLabel,
    order = 'left',
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
    noBalance = '0.00',
    size = InputSize.middle,
    isHideError = false,
    fullwidth = false,
    loading = false,
    className,
    coinPrecision = 6,
    tokenType,
    tokenImageKey,
    belongAlice = undefined,
  }: // tokenType = TokenType.single,
  // isAllowBalanceClick
  InputButtonProps<T, C, I>,
  ref: React.ForwardedRef<any>,
) {
  const { t } = useTranslation('common')

  const { balance, belong, tradeValue, max } = (inputData ? inputData : {}) as IBData<C>
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
          } as T & {
            maxAllow?: boolean
          },
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
        _handleContChange(max ?? balance, name)
        //setsValue(balance);
      }
    },
    [_handleContChange, balance, name, maxAllow],
  )
  const formattedBalance = getValuePrecisionThousand(
    balance,
    undefined,
    undefined,
    coinPrecision,
    false,
    { floor: true },
  )

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
      </Grid>
      <Grid
        container
        columns={24}
        className={`btnInput-wrap
                  ${(belong && belong.length) >= FORMAT_STRING_LEN ? 'text-small' : ''}
                  ${error.error ? 'error' : ''}
                  `}
        wrap={'nowrap'}
        alignItems={'stretch'}
        alignContent={'stretch'}
        marginBottom={size == 'small' ? 1 : 2}
      >
        <Grid
          item
          xs={10}
          order={order === 'left' ? 0 : 1}
          className={`input-wrap input-wrap-${order}`}
          sx={{ position: 'relative' }}
        >
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
            groupSeparator=','
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
        <Grid
          item
          className={`btn-wrap btn-wrap-${order} bnt-input-max`}
          xs={10}
          order={order === 'left' ? 1 : 0}
          display={'flex'}
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-around'}
          wrap={'nowrap'}
          paddingY={1}
          paddingX={1}
        >
          <ISBtn
            variant={'text'}
            onClick={(event) => handleOnClick(event, name ?? 'inputBtnDefault', ref)}
            endIcon={
              <DropDownIcon color={'inherit'} fontSize={'large'} style={{ marginLeft: '-4px' }} />
            }
            disabled={disabled}
          >
            {belong ? (
              <Grid container align-items={'center'} display={'flex'} wrap={'nowrap'}>
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
                    dangerouslySetInnerHTML={{ __html: sanitize(belongAlice ?? belong) }}
                  />
                </Grid>
              </Grid>
            ) : (
              <span className={'placeholder'}>{emptyText}</span>
            )}
          </ISBtn>
        </Grid>
        <Grid
          item
          order={2}
          xs={4}
          display={'flex'}
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-around'}
          paddingY={1}
          paddingX={1}
        >
          <Divider orientation={'vertical'} />
          <Link
            component={'span'}
            fontSize={'inherit'}
            className={maxAllow && balance > 0 ? 'max-allow' : 'no-balance'}
            onClick={_handleMaxAllowClick}
            marginLeft={1 / 2}
          >
            {t('labelInputMax')}
          </Link>
        </Grid>
      </Grid>

      {subLabel && (
        <Grid container paddingBottom={1}>
          <Grid item xs={12}>
            <Typography
              component={'span'}
              fontSize={size === 'small' ? 'body1' : 'body1'}
              color={'inherit'}
            >
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

export const InputMaxButton = React.memo(React.forwardRef(_InputMaxButton)) as <
  T,
  C,
  I extends CoinInfo<C>,
>(
  props: InputButtonProps<T, C, I> & React.RefAttributes<any>,
) => JSX.Element
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
