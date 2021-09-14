import { useDispatch, useSelector } from 'react-redux'
import { updatePageTradePro } from './reducer';
import { PageTradePro, PageTradeProStatus } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';

export function usePageTradePro(): PageTradeProStatus & {
    updatePageTradePro: (pageTradePro: RequireOne<PageTradePro, 'market'>) => void,
} {
    const pageTradeProStatus: PageTradeProStatus = useSelector((state: any) => state._router_pageTradePro)
    const dispatch = useDispatch();
    return {
        ...pageTradeProStatus,
        updatePageTradePro: React.useCallback((pageTradePro: RequireOne<PageTradePro, 'market'>) => {
            dispatch(updatePageTradePro(pageTradePro))
        }, [dispatch]),
    }

}
