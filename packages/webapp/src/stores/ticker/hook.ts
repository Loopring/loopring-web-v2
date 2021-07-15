import { useDispatch, useSelector } from 'react-redux'
import { getTicker, getTickers, statusUnset } from './reducer';
import { TickerStates } from './interface';
import { CoinKey } from '@loopring-web/component-lib/src/static-resource';
import React from 'react';

export function useTicker(): TickerStates & {
    updateTickers: (tickerKeys: Array<CoinKey<any>>) => void,
    updateTicker: (tickerKey: CoinKey<any>) => void,
    statusUnset: () => void,
} {
    const tickerMap: TickerStates = useSelector((state: any) => state.tickerMap)
    const dispatch = useDispatch();
    return {
        ...tickerMap,
        statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
        updateTickers: React.useCallback((tickerKeys: Array<CoinKey<any>>) => dispatch(getTickers({tickerKeys})), [dispatch]),
        updateTicker: React.useCallback((tickerKey: CoinKey<any>) => dispatch(getTicker({tickerKey})), [dispatch]),
    }

}
