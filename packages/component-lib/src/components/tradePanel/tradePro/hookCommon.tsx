import React from 'react';
import { TradeBaseType, TradeCommonProps, TradeProBaseEventProps, TradeProType } from './Interface';
import { myLog, TradeCalcProData } from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import { LimitTradeData, MarketTradeData } from '../Interface';
import { InputSize } from '../../basic-lib';
import _ from 'lodash';

export const useCommon = <X extends LimitTradeData<T> | MarketTradeData<T>,
    T,
    TCD extends TradeCalcProData<I>, I>({
                                            t,
                                            type,
                                            i18nKey,
                                            tradeCalcProData,
                                            tradeBtnBaseStatus,
                                            tradeData, handleCountChange,
                                            onChangeEvent,
                                            tokenBaseProps,
                                            tokenQuoteProps,
                                            disabled,
                                            handleError,
                                            handleChangeIndex,
                                            ...rest
                                        }: TradeProBaseEventProps<X, T, I> & TradeCommonProps<X, T, TCD, I> & WithTranslation) => {
    const quoteRef = React.useRef();
    const baseRef = React.useRef();
    const [selectedPercentage, setSelectedPercentage] = React.useState(0);
    const [tabIndex, setTabIndex] = React.useState<TradeProType>(tradeData.type ?? TradeProType.sell);
    const [inputError, setInputError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
        error: false,
        message: ''
    });
    if (typeof handleError !== 'function') {
        handleError = ({belong, balance, tradeValue}: any) => {
            if (balance < tradeValue || (tradeValue && !balance)) {
                const _error = {error: true, message: t('tokenNotEnough', {belong: belong})}
                setInputError(_error);
                return _error

            }
            setInputError({error: false, message: ''});
            return {error: false, message: ''}
        }
    }
    const _handleCountChange = React.useCallback((ibData: T, name: string, _ref: any) => {
        if(handleCountChange){
            handleCountChange(ibData, name, _ref)
        }else{
            myLog(`${type}Trade: handleUser input on :`, ibData, name)
            const _tradeData = {
                    ...tradeData,
                    [ name ]: ibData,
            }
            onChangeEvent(_tradeData, TradeBaseType[ name ])
        }

    }, [tradeData,type]);


    const propsBase = React.useMemo(() => {
        return {
            label: t('labelProBaseLabel'),
            subLabel: t('tokenMax'),
            emptyText: t('tokenSelectToken'),
            placeholderText: '0.00',
            size: InputSize.small,
            order: '"right"' as any,
            coinLabelStyle: {color: 'var(--color-text-secondary)'},
            isShowCoinIcon: false,
            ...tokenBaseProps,
            handleError: tabIndex === TradeProType.sell ? handleError : undefined,
            maxAllow: tabIndex === TradeProType.sell ? true : false,
            // handleOnClick,
            ...rest
        }
    }, [tokenBaseProps, tabIndex, TradeProType])
    const propsQuote = React.useMemo(() => {
        return {
            label: t('labelProQuoteLabel'),
            subLabel: t('tokenMax'),
            emptyText: t('tokenSelectToken'),
            placeholderText: '0.00',
            size: InputSize.small,
            order: '"right"' as any,
            coinLabelStyle: {color: 'var(--color-text-secondary)'},
            isShowCoinIcon: false,
            ...tokenQuoteProps,
            handleError: tabIndex === TradeProType.buy ? handleError : undefined,
            maxAllow: tabIndex === TradeProType.buy ? true : false,


            // handleOnClick,
            ...rest
        }
    }, [tokenQuoteProps, tabIndex, TradeProType])
    const getDisabled = React.useCallback(() => {
        return disabled || tradeCalcProData === undefined || tradeCalcProData.coinInfoMap === undefined;
    }, [disabled, tradeCalcProData]);
    const _handleChangeIndex = React.useCallback((index: TradeProType) => {
        setTabIndex(index)
        if (handleChangeIndex) {
            tradeData = handleChangeIndex(index)
        } else {
            tradeData.type = index
        }
        onChangeEvent(tradeData, TradeBaseType.tab)
    }, [tradeData])

    const btnLabel = React.useMemo(() => {
        if (inputError.error) {
            if (typeof inputError.message === 'string') {
                return t(inputError.message)
            } else if (inputError.message !== undefined) {
                return inputError.message;
            } else {
                return t('labelError')
            }

        }
        // if (i18nKey) {
        const key = i18nKey.split(',');
        return t(key[ 0 ], {
            arg: key[ 1 ],
            tradeType: tabIndex === TradeProType.sell ? t('labelProSell') : t('labelProBuy'),
            symbol: tradeCalcProData.coinBase
        })
        // } else {
        //     return t()
        // }

    }, [inputError, t, i18nKey, tabIndex, tradeCalcProData])

    const onPercentage = React.useCallback((value: any) => {
        // myLog('onPercentage:', value)
        const inputType =  tradeData.type === 'buy' ? 'sell':'buy';
        setSelectedPercentage(value)
        const tradeCoin = _.cloneDeep(tradeData[inputType]);
        if (tradeCoin.tradeCoin.balance) {
            tradeCoin.tradeValue = (tradeCoin.balance / 100) * value;
            _handleCountChange(tradeCoin, inputType, {current: 'percentage'} as React.Ref<any>)
        }
    },[_handleCountChange,tradeData]);
    return {
        quoteRef,
        baseRef,
        btnLabel,
        tabIndex,
        getDisabled,
        handleCountChange:_handleCountChange,
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