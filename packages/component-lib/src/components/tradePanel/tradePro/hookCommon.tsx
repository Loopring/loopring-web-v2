import React from 'react';
import { TradeBaseType, TradeCommonProps, TradeProBaseEventProps, TradeProType } from './Interface';
import { IBData, TradeCalcData } from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import { LimitTradeData, MarketTradeData } from '../Interface';

export const useCommon = <X extends LimitTradeData<T> | MarketTradeData<T>,
    T,
    TCD extends TradeCalcData<I>,I>({
                                       t,
                                       i18nKey,
                                       tradeCalcData,
                                       tradeBtnBaseStatus,
                                       tradeData,
                                       onChangeEvent,
                                       tokenBuyProps,
                                       tokenSellProps,
                                       disabled,
                                       handleError,
                                       handleChangeIndex,
                                       ...rest
                                   }: TradeProBaseEventProps<X, T, I> & TradeCommonProps<X,T,TCD,I> & WithTranslation) => {
    const sellRef = React.useRef();
    const buyRef = React.useRef();
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
    const handleCountChange = React.useCallback((ibData: IBData<I>, _ref: any) => {
        // const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
        // if (swapData.tradeData[ focus ].tradeValue !== ibData.tradeValue) {
        //     onChangeEvent(0, {tradeData: {...swapData.tradeData, [ focus ]: ibData}, type: focus, to: 'button'});
        // }
        if (ibData) {

        }
    }, [tradeData, onChangeEvent]);
    const propsBuy = {
        label: t('tokenEnterReceiveToken'),
        subLabel: t('tokenHave'),
        emptyText: t('tokenSelectToken'),
        placeholderText: '0.00',
        maxAllow: false,
        ...tokenBuyProps,
        handleError,
        handleCountChange,
        // handleOnClick,
        ...rest
    }
    const propsSell = {
        label: t('tokenEnterPaymentToken'),
        subLabel: t('tokenMax'),
        emptyText: t('tokenSelectToken'),
        placeholderText: '0.00',
        maxAllow: true,
        ...tokenSellProps,
        handleCountChange,
        // handleOnClick,
        ...rest
    }
    const getDisabled = React.useCallback(() => {
        return disabled || tradeCalcData === undefined || tradeCalcData.coinInfoMap === undefined;
    }, [disabled, tradeCalcData]);
    const _handleChangeIndex = React.useCallback((index: TradeProType) => {
        if (handleChangeIndex) {
            tradeData = handleChangeIndex(index)
        } else {
            tradeData.type = index
        }
        onChangeEvent(tradeData,TradeBaseType.tab)
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
        return t(key[ 0 ], key && key[ 1 ] ? {arg: key[ 1 ]} : undefined)
        // } else {
        //     return t()
        // }

    }, [inputError, t, i18nKey])
    return {
        sellRef,
        buyRef,
        btnLabel,
        // slippage,
        getDisabled,
        // handleCountChange,
        inputError,
        _handleChangeIndex,
        i18nKey,
        tradeCalcData,
        tradeBtnBaseStatus,
        propsBuy,
        propsSell,
    }
}