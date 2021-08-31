import { useDispatch, useSelector } from 'react-redux'
import { updatePageTradeLite } from './reducer';
import { PageTradeLite } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';

export function usePageTradeLite(): PageTradeLite & {
    updatePageTradeLite:(pageTradeLite:RequireOne<PageTradeLite,'market'>)=>void,
    pageTradeLite:PageTradeLite
    __SUBMIT_LOCK_TIMER__:number,
    __TOAST_AUTO_CLOSE_TIMER__:number,
} {
    const pageTradeLite:PageTradeLite = useSelector((state: any) => state.pageTradeLite)
    const dispatch = useDispatch();
    return {
        pageTradeLite:pageTradeLite,
        __SUBMIT_LOCK_TIMER__:pageTradeLite.__SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__: pageTradeLite.__TOAST_AUTO_CLOSE_TIMER__,
        updatePageTradeLite:React.useCallback((pageTradeLite:RequireOne<PageTradeLite,'market'> )=>dispatch(updatePageTradeLite(pageTradeLite)),[dispatch]),
    }

}
