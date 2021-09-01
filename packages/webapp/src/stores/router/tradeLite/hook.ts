import { useDispatch, useSelector } from 'react-redux'
import { updatePageTradeLite } from './reducer';
import { PageTradeLite, PageTradeLiteStatus } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';

export function usePageTradeLite(): PageTradeLiteStatus & {
    updatePageTradeLite: (pageTradeLite: RequireOne<PageTradeLite, 'market'>) => void,
    // pageTradeLite:PageTradeLite
    // __SUBMIT_LOCK_TIMER__:number,
    // __TOAST_AUTO_CLOSE_TIMER__:number,
} {
    const pageTradeLiteStatus: PageTradeLiteStatus = useSelector((state: any) => state.pageTradeLite)
    const dispatch = useDispatch();
    return {
        ...pageTradeLiteStatus,
        updatePageTradeLite: React.useCallback((pageTradeLite: RequireOne<PageTradeLite, 'market'>) => {
            dispatch(updatePageTradeLite(pageTradeLite))
        }, [dispatch]),
    }

}
