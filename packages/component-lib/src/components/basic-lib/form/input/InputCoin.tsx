import { Avatar, Box, BoxProps, FormHelperText, FormLabel, Grid } from "@material-ui/core";
import styled from "@emotion/styled";
import { debounce } from "lodash"
import CurrencyInput from 'react-currency-input-field';
import {
    AvatarCoinStyled,
    CoinInfo,
    getThousandFormattedNumbers,
    globalSetup,
    IBData
} from '@loopring-web/common-resources';
import { InputCoinProps } from "./Interface";
import React from "react";
import { useFocusRef } from "../hooks";
import { useSettings } from '../../../../stores';
// import { useImage } from '../../resource';

const IWrap = styled(Box)`
  .label-wrap {
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }

  .message-wrap {
    .MuiFormHelperText-root {
      color: ${({theme}) => theme.colorBase.error};
      text-align: right;
      font-size: ${({theme}) => theme.fontDefault.h6};
    }

  }

  .sub-label {
    text-align: right;
    cursor: pointer;

    .max-allow {
      text-decoration: underline dotted;

      &:hover {
        color: ${({theme}) => theme.colorBase.primaryLight};
      }
    }

    .no-balance {
      text-decoration: none;
    }
  }

  .coinInput-wrap {
    background-color: ${({theme}) => theme.colorBase.background().outline};
    border-radius: ${({theme}) => theme.unit / 2}px;
    position: relative;
    margin-top: ${({theme}) => `${theme.unit / 2}px`};
    height: var(--btn-Input-height);

    ::before {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 1;
      ${({theme}) => `
            ${theme.border.defaultFrame({c_key: 'blur'})};
            ${theme.mode === 'dark' ? `border-color: transparent` : ''};
     `};
    }


    &.error {
      .input-wrap-right input {
        ${({theme}) => `
            ${theme.border.defaultFrame({c_key: theme.colorBase.error, d_R: 0.5})};
            border-top-left-radius: 0px;
            border-bottom-left-radius: 0px;
          `};

      }

      .input-wrap-left input {
        ${({theme}) => `
            ${theme.border.defaultFrame({c_key: theme.colorBase.error, d_R: 0.5})};
            border-top-right-radius: 0px;
            border-bottom-right-radius: 0px;
          `};

      }
    }
  }

  .input-wrap {
    //min-width: 128px;
    // width: 100%;
    flex: 1;
    height: 100%
  }

  .icon-wrap {
    max-width: var(--btn-max-width);
    min-width: var(--coin-min-width);

    //.MuiButton-label {
    //  justify-content: flex-start;
    //}

  }

` as typeof Box
const CoinWrap = styled(Box)<BoxProps & { logoColor?: any }>`
  & {

    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 1px solid transparent;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${({theme}) => theme.fontDefault.h5};
    color: ${({theme}) => theme.colorBase.textPrimary};

    .placeholder {
      color: ${({theme}) => theme.colorBase.textSecondary};
    }
  }

  &.icon-wrap-right > div {
    justify-content: flex-start;
    padding-left: ${({theme}) => theme.unit / 2 * 3}px;
    align-items: center;
  }

  &.icon-wrap-left > div {
    justify-content: flex-end;
    padding-right: ${({theme}) => theme.unit / 2 * 3}px;
    align-items: center;
  }

  //.MuiAvatar-root {
  //  width: 24px;
  //  height: 24px;
  //}

  // .MuiButton-endIcon svg {
    //   color: ${({theme}) => theme.colorBase.textPrimary}
  // }

  // &:hover, &:active {
    //     //color: ${({theme}) => theme.colorBase.primaryLight};
    //   color: ${({theme}) => theme.colorBase.textPrimary};
    //   background-color: ${({theme}) => theme.colorBase.background().hover};
  // }
` as React.ComponentType<BoxProps & { logoColor?: any }>;
const IInput = styled(CurrencyInput)`

  color: ${({theme}) => theme.colorBase.textPrimary};

  ::placeholder {
    color: ${({theme}) => theme.colorBase.textSecondary};
  }

  width: 100%; //calc(100% - 2rem);
  height: 100%; //var(--btn-Input-height);
  border: 0;
  margin: 0;


  font-size: ${({theme}) => theme.fontDefault.h4};
  display: block;
  padding: .8rem 1rem;
  min-width: 0;
  background: none;
  box-sizing: border-box;
  animation-name: mui-auto-fill-cancel;
  letter-spacing: inherit;
  animation-duration: 10ms;
  -webkit-tap-highlight-color: transparent;

  :focus {
    outline: 0;
  }

  .input-wrap-right & {
    text-align: right;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    ${({theme}) => `
        border-left:  ${theme.border.borderConfig({c_key: 'blur'})};
        ${theme.mode === 'dark' ? `border-color: transparent` : ''};
    `};

    :focus {
      ${({theme}) => `
        ${theme.border.defaultFrame({c_key: 'focus', d_R: 0.5})};
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
     `};
    }
  }

  .input-wrap-left & {
    text-align: left;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    ${({theme}) => `
        border-right:  ${theme.border.borderConfig({c_key: 'blur'})};
        ${theme.mode === 'dark' ? `border-color: transparent` : ''};
    `};

    :focus {
      ${({theme}) => `
        ${theme.border.defaultFrame({c_key: 'focus', d_R: 0.5})};
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
     `};
    }
  }
}

` as typeof CurrencyInput

function _InputCoin<T extends IBData<C>, C, I extends CoinInfo<C>>({
                                                                       order = 'left',
                                                                       label = "Amount",
                                                                       handleError,
                                                                       subLabel = "Available",
                                                                       wait = globalSetup.wait,
                                                                       coinMap,
                                                                       maxAllow,
                                                                       disabled,
                                                                       placeholderText = '0.00',
                                                                       inputData,
                                                                       handleCountChange,
                                                                       focusOnInput,

                                                                   }
                                                                       : InputCoinProps<T, C, I>, ref: React.ForwardedRef<any>) {
    const {balance, belong, tradeValue} = (inputData ? inputData : {}) as IBData<C>;
    const [sValue, setsValue] = React.useState<number | undefined>(tradeValue ? tradeValue : undefined);
    // let _error = {error: false, message: ''};
    // if (handleError && inputData) {
    //     let error:any = handleError(inputData, ref);
    //     _error = error ? error : {error: false}
    // }
    const _handleError = (value: any) => {
        if (handleError) {
            let _error = handleError({balance: Number(balance), belong, ...{tradeValue: value}} as T, ref);
            setError(_error ? _error : {error: false});
        }
    }
    const [error, setError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
        error: false,
        message: ''
    });
    const inputCallback = React.useCallback(({current}) => {
            if (inputData && (inputData.tradeValue !== Number(current?.value))) {
                setsValue(inputData.tradeValue);
                _handleError(inputData.tradeValue);
            }
        },
        [inputData])
    const inputEle = useFocusRef({
        callback: inputCallback,
        shouldFocusOn: focusOnInput,
        value: tradeValue,
    });
    const debounceCount = debounce(({...props}: any) => {
        if (handleCountChange) {
            handleCountChange({...props}, ref)
        }
    }, wait)
    const _handleContChange = React.useCallback((value: any, _name: any) => {
            _handleError(value);
            setsValue(value);
            debounceCount({...inputData, ...{tradeValue: value}})
        }
        , [debounceCount, _handleError, inputData])
    // const _handleContChange =
    // const _handleOnClick = React.useCallback((event: React.MouseEvent) => {
    //     if (handleOnClick) handleOnClick(event,ref)
    // }, [])
    const _handleMaxAllowClick = (_event: React.MouseEvent) => {
        if (maxAllow) {
            setsValue(balance);
        }
    }
    const {coinJson} = useSettings();
    const coinIcon: any = coinJson [ belong ];

    // const coinInfo: any = coinMap[ belong ] ? coinMap[ belong ] : {};
    // const hasLoaded = useImage(coinInfo.icon ? coinInfo.icon : '').hasLoaded;
    // formatValue(sValue)
    return <> <IWrap component={'div'} ref={ref}>
        <Grid container component={'div'} className={'label-wrap'} justifyContent={'space-between'}
              paddingBottom={1 / 2}>
            <Grid item xs={6}><FormLabel className={'main-label'}>{label}</FormLabel></Grid>
            <Grid item xs={6} className={'sub-label'}>{subLabel && belong ?
                <FormLabel className={maxAllow && balance > 0 ? "max-allow" : 'no-balance'}
                           onClick={_handleMaxAllowClick}>
                    {<span>{balance > 0 ? subLabel + ':' : ''}</span>}
                    <span>{getThousandFormattedNumbers(balance)}</span>
                </FormLabel> : null}</Grid>
        </Grid>

        <Grid container className={`coinInput-wrap ${error.error ? 'error' : ''}`} wrap={'nowrap'}
              alignItems={'stretch'}
              alignContent={'stretch'}>
            <CoinWrap order={order === 'left' ? 2 : 1}
                      display={'flex'}
                      alignItems={'center'}
                      className={`icon-wrap icon-wrap-${order}`}>
                <Grid container align-items={'center'} display={'flex'}>
                    {/*<Grid item order={order === 'left' ? 2 : 1} paddingLeft={order === 'left' ? 1 : 0}*/}
                    {/*      className={'logo-icon'}>*/}
                    {/*    {coinMap[ belong ]?.simpleName ?*/}
                    {/*        <AvatarCoinStyled imgX={coinInfo.x} imgY={coinInfo.y} imgHeight={coinInfo.height}*/}
                    {/*                          imgWidth={coinInfo.width}*/}
                    {/*                          variant="circular" alt={coinMap[ belong ]?.simpleName as string}*/}
                    {/*            // src={sellData?.icon}*/}
                    {/*                          src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>*/}
                    {/*        : ''}*/}
                    {/*</Grid>*/}
                    <Grid item order={order === 'left' ? 2 : 1} paddingLeft={order === 'left' ? 1 : 0}
                          className={'logo-icon'}
                          height={'var(--list-menu-coin-size)'} width={'var(--list-menu-coin-size)'} alignItems={'center'} justifyContent={'center'}>
                        {coinIcon ?
                            <AvatarCoinStyled imgX={coinIcon.x} imgY={coinIcon.y} imgHeight={coinIcon.height}
                                              imgWidth={coinIcon.width}
                                              variant="circular" alt={coinMap[ belong ]?.simpleName as string}
                                // src={sellData?.icon}
                                              src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                            : <Avatar variant="circular" alt={coinMap[ belong ]?.simpleName as string} style={{
                                height:'var(--list-menu-coin-size)',
                                width:'var(--list-menu-coin-size)'
                            }}
                                // src={sellData?.icon}
                                      src={'static/images/icon-default.png'}/>}
                    </Grid>
                    <Grid item order={order === 'left' ? 1 : 2}
                          paddingLeft={order === 'left' ? 0 : 1}>{coinMap[ belong ]?.simpleName}</Grid>
                </Grid>
            </CoinWrap>
            <Grid order={order === 'left' ? 1 : 2} flex={1} item className={`input-wrap input-wrap-${order}`}>
                <IInput ref={inputEle} onValueChange={_handleContChange} value={sValue} allowNegativeValue={false}
                        disabled={!disabled || belong ? false : true}
                        placeholder={placeholderText}
                        aria-placeholder={placeholderText} aria-label={label} decimalsLimit={10000000}></IInput>

            </Grid>
        </Grid>


        <Grid container className={'message-wrap'} wrap={'nowrap'} alignItems={'stretch'} alignContent={'stretch'}
              justifyContent={'flex-end'}>
            <Grid item><FormHelperText>{error.message}</FormHelperText></Grid>
        </Grid>

    </IWrap>
    </>

}

export const InputCoin = React.memo(React.forwardRef(_InputCoin)) as
    <T extends IBData<C>, C, I extends CoinInfo<C>>(props: InputCoinProps<T, C, I>, ref: React.RefAttributes<any>) => JSX.Element;
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
