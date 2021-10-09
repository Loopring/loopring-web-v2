import React from 'react';
import { TradeBaseType, TradeCommonProps, TradeProBaseEventProps, TradeProType } from './Interface';
import { IBData, myLog, TradeCalcProData } from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import { LimitTradeData, MarketTradeData } from '../Interface';
import { InputSize } from '../../basic-lib';
import _ from 'lodash';
import * as sdk from 'loopring-sdk'

export const useCommon = <X extends LimitTradeData<T> | MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>, I>({
                                            t,
                                            type,
                                            i18nKey,
                                            tradeCalcProData,
                                            tradeBtnBaseStatus,
                                            tradeData,
                                            tradeType,
                                            handleCountChange,
                                            onChangeEvent,
                                            tokenBaseProps,
                                            tokenQuoteProps,
                                            disabled,
                                            //handleError,
                                            handleChangeIndex,
                                            ...rest
                                        }: TradeProBaseEventProps<X, T, I> & TradeCommonProps<X, T, TCD, I> & WithTranslation) => {
    const quoteRef = React.useRef();
    const baseRef = React.useRef();
    const [selectedPercentage, setSelectedPercentage] = React.useState(0);
    // const [tabIndex, setTabIndex] = React.useState<TradeProType>(tradeData.type ?? TradeProType.buy);
    const [inputError, setInputError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
        error: false,
        message: ''
    });
    React.useEffect(()=>{
        const inputType = tradeType === TradeProType.sell ? 'base' : 'quote';
        if(tradeData[inputType].tradeValue && tradeData[inputType].balance){
            const _data = tradeData[inputType]//.tradeValue
            const value = sdk.toBig(_data.tradeValue).div(sdk.toBig(_data.balance)).times(100).toFixed()
            setSelectedPercentage(Number(value))
        }else{
            setSelectedPercentage(0)
        }
    },[tradeData['base'].tradeValue,tradeData['quote'].tradeValue]);


    const handleError = React.useCallback(({belong, balance, tradeValue}: any,ref?) => {
        if (typeof rest.handleError !== 'function') {
            if (balance < tradeValue || (tradeValue && !balance)) {
                const _error = {error: true, message: t('tokenNotEnough', {belong: belong})}
                setInputError(_error);
                return _error

            }
            setInputError({error: false, message: ''});
            return {error: false, message: ''}
        }else{
            return rest.handleError({belong, balance, tradeValue} as any,ref)
        }

    },[rest.handleError,setInputError])
    const _handleCountChange = React.useCallback((ibData: T, name: string, _ref: any) => {
        if (handleCountChange) {
            handleCountChange(ibData, name, _ref)
        } else {
            // myLog(`${type}Trade: handleUser input on :`, ibData, name, tradeData)
            const _tradeData = {
                ...tradeData,
                // type: tabIndex,
                [ name ]: ibData,
            }
            onChangeEvent(_tradeData, TradeBaseType[ name ])
        }

    }, [tradeData, type, tradeType]);


    const propsBase = React.useMemo(() => {
        return {
            label: t('labelProBaseLabel'),
            subLabel: tradeType === TradeProType.sell ? t('tokenMax') : undefined,
            emptyText: t('tokenSelectToken'),
            placeholderText: '0.00',
            size: InputSize.small,
            order: '"right"' as any,
            coinLabelStyle: {color: 'var(--color-text-secondary)'},
            isShowCoinIcon: false,
            ...tokenBaseProps,
            handleError: tradeType === TradeProType.sell ? handleError : undefined,
            maxAllow: tradeType === TradeProType.sell,
            // handleOnClick,
            ...rest
        }
    }, [tokenBaseProps, tradeType, TradeProType])
    const propsQuote = React.useMemo(() => {
        return {
            label: t('labelProQuoteLabel'),
            subLabel: tradeType === TradeProType.buy ? t('tokenMax') : undefined,
            emptyText: t('tokenSelectToken'),
            placeholderText: '0.00',
            size: InputSize.small,
            order: '"right"' as any,
            coinLabelStyle: {color: 'var(--color-text-secondary)'},
            isShowCoinIcon: false,
            ...tokenQuoteProps,
            handleError: tradeType === TradeProType.buy ? handleError : undefined,
            maxAllow: tradeType === TradeProType.buy,


            // handleOnClick,
            ...rest
        }
    }, [tokenQuoteProps, tradeType, TradeProType])
    const getDisabled = React.useCallback(() => {
        return disabled || tradeCalcProData === undefined || tradeCalcProData.coinInfoMap === undefined;
    }, [disabled, tradeCalcProData]);
    const _handleChangeIndex = React.useCallback((index: TradeProType) => {
        // setTabIndex(index)
        if (handleChangeIndex) {
            tradeData = handleChangeIndex(index)
        } else {
            tradeData.type = index
            setSelectedPercentage(0)
        }

        // myLog('tradeData.type:', tradeData.type)

        onChangeEvent(tradeData, TradeBaseType.tab)
    }, [tradeData])

    const btnLabel = React.useMemo(() => {
        // if (inputError.error) {
        //     if (typeof inputError.message === 'string') {
        //         return t(inputError.message)
        //     } else if (inputError.message !== undefined) {
        //         return inputError.message;
        //     } else {
        //         return t('labelError')
        //     }
        //
        // }
        // myLog('i18nKey',i18nKey)
        // if (i18nKey) {
        const key = i18nKey.split('|');
        return t(key[ 0 ], {
            arg: key[ 1 ],
            tradeType: tradeType === TradeProType.sell ? t('labelProSell') : t('labelProBuy'),
            symbol: tradeCalcProData.coinBase
        })
        // } else {
        //     return t()
        // }

    }, [inputError, t, i18nKey, tradeType, tradeCalcProData])

    const onPercentage = React.useCallback((value: any) => {
        myLog('hookCommon onPercentage:', value, tradeData)
        const inputType = tradeType === TradeProType.sell ? 'base' : 'quote'
        setSelectedPercentage(value)
        const tradeCoin = _.cloneDeep(tradeData[ inputType ]);
        if (tradeCoin && tradeCoin.balance) {
            tradeCoin.tradeValue = sdk.toBig(tradeCoin.balance).times(sdk.toBig(value)).div(100).toNumber()
            _handleCountChange(tradeCoin, inputType, {current: 'percentage'} as React.Ref<any>)
        }
    }, [_handleCountChange, tradeType, tradeData]);
    return {
        quoteRef,
        baseRef,
        btnLabel,
        // tabIndex,
        getDisabled,
        handleCountChange: _handleCountChange,
        selectedPercentage,
        onPercentage,
        inputError,
        _handleChangeIndex,
        i18nKey,
        tradeCalcProData,
        tradeBtnBaseStatus,
        propsBase,
        propsQuote,
    }
}