import { Avatar,
    // Box,
    // BoxProps,
    FormHelperText, FormLabel, Grid } from "@material-ui/core";
// import styled from "@emotion/styled";
// import CurrencyInput from 'react-currency-input-field';
import { AvatarCoinStyled, CoinInfo, getThousandFormattedNumbers, IBData } from '@loopring-web/common-resources';
import { InputCoinProps } from "./Interface";
import React from "react";
import { useFocusRef } from "../hooks";
import { useSettings } from '../../../../stores';
import { IInput, CoinWrap, IWrap } from "./style";
// import { useImage } from '../../resource';

function _InputCoin<T extends IBData<C>, C, I extends CoinInfo<C>>({
                                                                       order = 'left',
                                                                       label = "Amount",
                                                                       handleError,
                                                                       subLabel = "Available",
                                                                       // wait = globalSetup.wait,
                                                                       coinMap,
                                                                       maxAllow,
                                                                       disabled,
                                                                       placeholderText = '0.00',
                                                                       inputData,
                                                                       handleCountChange,
                                                                       focusOnInput,
                                                                       name,
                                                                   }
                                                                       : InputCoinProps<T, C, I>, ref: React.ForwardedRef<any>) {
    const {balance, belong, tradeValue} = (inputData ? inputData : {}) as IBData<C>;
    const [sValue, setsValue] = React.useState<number | undefined>(tradeValue ? tradeValue : undefined);
    // let _error = {error: false, message: ''};
    // if (handleError && inputData) {
    //     let error:any = handleError(inputData, ref);
    //     _error = error ? error : {error: false}
    // }
    const _handleError = React.useCallback((value: any) => {
        if (handleError) {
            let _error = handleError({
                balance: Number(balance),
                belong, ...{tradeValue: value},
                maxAllow
            } as T & { maxAllow?: boolean }, ref);
            setError(_error ? _error : {error: false});
        }
    }, [handleError, balance, belong, maxAllow, ref])
    const [error, setError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
        error: false,
        message: ''
    });
    const inputCallback = React.useCallback(({current}) => {
            if (inputData && (inputData.tradeValue !== Number(current?.value))) {
                setsValue(inputData.tradeValue);
                _handleError(inputData.tradeValue);
                // debounceCount({...inputData, ...{tradeValue: inputData.tradeValue}})
                // _handleContChange(current?.value, name)
            }
        },
        [inputData, _handleError])
    const inputEle = useFocusRef({
        callback: inputCallback,
        shouldFocusOn: focusOnInput,
        value: tradeValue,
    });

    // const debounceCount = debounce(({...props}: any) => {
    //     if (handleCountChange) {
    //         handleCountChange({...props}, ref)
    //     }
    // }, wait)
    const _handleContChange = React.useCallback((value: any, _name: any) => {
            _handleError(value);
            setsValue(value);
            if (handleCountChange) {
                handleCountChange({...inputData, ...{tradeValue: value}} as any, ref)
            }
            //debounceCount({...inputData, ...{tradeValue: value}})
        }
        , [_handleError, setsValue, inputData, handleCountChange, ref])

    // const _handleContChange =
    // const _handleOnClick = React.useCallback((event: React.MouseEvent) => {
    //     if (handleOnClick) handleOnClick(event,ref)
    // }, [])
    const _handleMaxAllowClick = React.useCallback((_event: React.MouseEvent) => {
        if (maxAllow) {
            _handleContChange(balance, name)
            //setsValue(balance);
        }
    }, [_handleContChange, balance, name, maxAllow]);
    const {coinJson} = useSettings();
    const coinIcon: any = coinJson[ belong ];

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
                    <span>{maxAllow ? subLabel + ':' : ''}</span>
                    <span>{balance ? getThousandFormattedNumbers(balance) : '0'}</span>
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
                    <Grid item order={order === 'left' ? 2 : 1} paddingLeft={order === 'left' ? 1 : 0}
                          className={'logo-icon'}
                          height={'var(--list-menu-coin-size)'} width={'var(--list-menu-coin-size)'}
                          alignItems={'center'} justifyContent={'center'}>
                        {coinIcon ?
                            <AvatarCoinStyled imgx={coinIcon.x} imgy={coinIcon.y} imgheight={coinIcon.height}
                                              imgwidth={coinIcon.width}
                                              variant="circular" alt={coinMap[ belong ]?.simpleName as string}
                                // src={sellData?.icon}
                                              src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                            : <Avatar variant="circular" alt={coinMap[ belong ]?.simpleName as string} style={{
                                height: 'var(--list-menu-coin-size)',
                                width: 'var(--list-menu-coin-size)'
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
                        disabled={!(!disabled || belong)}
                        placeholder={placeholderText}
                        aria-placeholder={placeholderText} aria-label={label} decimalsLimit={10000000}/>
                <label></label>
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
