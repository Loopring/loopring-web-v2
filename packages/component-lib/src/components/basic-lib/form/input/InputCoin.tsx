import { FormHelperText, FormLabel, Grid, Typography } from '@mui/material';
import { CoinInfo, FORMAT_STRING_LEN, getThousandFormattedNumbers, IBData } from '@loopring-web/common-resources';
import { InputCoinProps } from "./Interface";
import React from "react";
import { useFocusRef } from "../hooks";
import { CoinWrap, IInput, IWrap } from "./style";
import { CoinIcon } from './Default';


function _InputCoin<T extends IBData<C>, C, I extends CoinInfo<C>>({
                                                                       order = 'left',
                                                                       label = "Amount",
                                                                       handleError,
                                                                       subLabel = "Available",
                                                                       // wait = globalSetup.wait,
                                                                       // coinMap,
                                                                       maxAllow,
                                                                       disabled,
                                                                       placeholderText = '0.00',
                                                                       inputData,
                                                                       handleCountChange,
                                                                       focusOnInput,
                                                                       name,
                                                                       isHideError = false,
                                                                       isShowCoinInfo = true,
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
                {isShowCoinInfo && (
                      <CoinWrap order={order === 'left' ? 2 : 1}
                      display={'flex'}
                      alignItems={'center'}
                      className={`icon-wrap icon-wrap-${order}`}>
                <Grid container align-items={'center'} display={'flex'}>
                    <Grid item display={'flex'} order={order === 'left' ? 2 : 1} paddingLeft={order === 'left' ? 1 : 0}
                          className={'logo-icon'}
                          height={'var(--list-menu-coin-size)'}
                          alignItems={'center'} justifyContent={'center'}>

                        <CoinIcon symbol={belong}/>

                    </Grid>
                    <Grid item order={order === 'left' ? 1 : 2}
                          paddingLeft={order === 'left' ? 0 : 1}>
                        <Typography  variant={(belong && belong.length) >= FORMAT_STRING_LEN ? 'body1' : 'h4'}>
                            {belong}
                        </Typography></Grid>
                </Grid>
            </CoinWrap>
            )}
            
            <Grid order={order === 'left' ? 1 : 2} flex={1} item className={`input-wrap input-wrap-${order}`}>
                <IInput ref={inputEle} onValueChange={_handleContChange} value={
                    typeof sValue === 'undefined' ? '' : sValue
                } allowNegativeValue={false}
                        disabled={!(!disabled || belong)}
                        placeholder={placeholderText}
                        aria-placeholder={placeholderText} aria-label={label} decimalsLimit={10000000}/>
                <label/>
            </Grid>
        </Grid>

        {isHideError ? <></> :
            <Grid container className={'message-wrap'} wrap={'nowrap'} alignItems={'stretch'} alignContent={'stretch'}
                  justifyContent={'flex-end'}>
                <Grid item><FormHelperText>{error.message}</FormHelperText></Grid>
            </Grid>}

    </IWrap>
    </>

}

export const InputCoin = React.memo(React.forwardRef(_InputCoin)) as
    <T extends IBData<C>, C, I extends CoinInfo<C>>(props: InputCoinProps<T, C, I>, ref: React.RefAttributes<any>) => JSX.Element;
//as React.ComponentType<InputButtonProps<coinType,CoinInfo> & RefAttributes<HTMLDivElement>>;
