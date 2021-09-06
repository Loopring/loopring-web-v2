import { useDispatch, useSelector } from 'react-redux'
import { updatePageAmmPool } from './reducer';
import { PageAmmPool, PageAmmPoolStatus } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';
import { RootState } from 'stores';

export function usePageAmmPool(): PageAmmPoolStatus & {
    updatePageAmmPool: (pageAmmPool: RequireOne<PageAmmPool, never>) => void,
} {
    const pageAmmPoolStatus: PageAmmPoolStatus = useSelector((state: any) => state.pageAmmPool)
    const dispatch = useDispatch()
    return {
        ...pageAmmPoolStatus,
        updatePageAmmPool: React.useCallback((pageTradeLite: RequireOne<PageAmmPool, never>) => {
            dispatch(updatePageAmmPool(pageTradeLite))
        }, [dispatch]),
    }

}
