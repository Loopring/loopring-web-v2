import { useDispatch, useSelector } from 'react-redux'
import { updatePageTradeLite } from './reducer';
import { PageTradeLite } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';

export function usePageTradeLite(): PageTradeLite & {
    updatePageTradeLite:(pageTradeLite:RequireOne<PageTradeLite,'market'>)=>void,
} {
    const pageTradeLite:PageTradeLite = useSelector((state: any) => state.pageTradeLite)
    const dispatch = useDispatch();
    return {
        ...pageTradeLite,
        updatePageTradeLite:React.useCallback((pageTradeLite:RequireOne<PageTradeLite,'market'> )=>dispatch(updatePageTradeLite(pageTradeLite)),[dispatch]),
    }

}
