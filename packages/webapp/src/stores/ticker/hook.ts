import { useDispatch, useSelector } from 'react-redux'
import { tickerMapSlice } from './reducer';
import { TickerStates } from './interface';
import { CoinKey } from '@loopring-web/component-lib/src/static-resource';

export function useTicker(): TickerStates & {
    updateTickers:(tickerKeys:Array<CoinKey<any>>)=>void,
    updateTicker:(tickerKey:CoinKey<any>)=>void,
    statusUnset:()=>void,
} {
    const tickerMap:TickerStates = useSelector((state: any) => state.tickerMap)
    const dispatch = useDispatch();
    const updateTicker = (tickerKey:CoinKey<any>) => {
        dispatch(tickerMapSlice.actions.getTicker({tickerKey}))
    }
    const updateTickers = (tickerKeys:Array<CoinKey<any>>) => {
        dispatch(tickerMapSlice.actions.getTickers({tickerKeys}))
    }
    const statusUnset = ()=>{
        dispatch(tickerMapSlice.actions.statusUnset(undefined))
    }
    return {
        ...tickerMap,
        statusUnset,
        updateTickers,
        updateTicker,
    }

}
