import { CoinInfo, CoinMap, IBData } from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import React from 'react';
import {  BasicANFTTradeProps } from './Interface';
import { InputCoin, } from '../../basic-lib';
import { NFTWholeINFO } from '@loopring-web/webapp/src/api_wrapper';


export const BasicANFTTrade = <T extends IBData<I> & Partial<NFTWholeINFO>,
    I>({
           t, tradeData, onChangeEvent, disabled,
           handleError, inputNFTRef,
           inputNFTProps,
            inputNFTDefaultProps,
           ...rest
       }: BasicANFTTradeProps<T, I> & WithTranslation) => {
    const getDisabled = () => {
        if (disabled || tradeData === undefined ) {
            return true
        } else {
            return false
        }
    };
    // const handleOnClick = React.useCallback((_event: React.MouseEvent, _ref: any) => {
    //     onChangeEvent(1, {tradeData, to: 'menu'});
    // }, [tradeData, onChangeEvent])
    const handleCountChange: any = React.useCallback((_tradeData: T, _name:string, _ref: any) => {
        //const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
        if (tradeData.tradeValue !== _tradeData.tradeValue) {
            onChangeEvent(0, {tradeData: {...tradeData, ..._tradeData}, to: 'button'});
        }

        // onCoinValueChange(ibData);
    }, [onChangeEvent, tradeData]);

    if (typeof handleError !== 'function') {
        handleError = ({belong, balance, tradeValue}: T) => {
            if (typeof tradeValue !== 'undefined' && balance < tradeValue || (tradeValue && !balance)) {
                return {error: true, message: t('tokenNotEnough', {belong: belong})}
            }
            return {error: false, message: ''}
        }
    }

    const inputCoinProps = {

        // label: t('labelTokenAmount'),
        subLabel: t('labelAvailable'),
        placeholderText: '0',
        decimalsLimit : 0,
        // size = InputSize.middle,
        isHideError : false,
        isShowCoinInfo : false,
        isShowCoinIcon : false,
        // coinLabelStyle ,
        coinPrecision : 0,
        maxAllow: true,
        handleError,
        handleCountChange,
        ...inputNFTDefaultProps,
        ...inputNFTProps,
        ...rest
    }


    // @ts-ignore
    return <InputCoin<T,I,CoinInfo<I>> ref={inputNFTRef} disabled={getDisabled()}  {...{
        ...inputCoinProps,
        inputData: tradeData ? tradeData : {} as T,
        coinMap:  {} as CoinMap<I, CoinInfo<I>>
    }} />

}



