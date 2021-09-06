import { useDispatch, useSelector } from 'react-redux'
import { updatePageAmmExit, updatePageAmmJoin, } from './reducer';
import { PageAmmExit, PageAmmJoin, PageAmmPoolStatus } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';
import { RootState } from 'stores';

export function usePageAmmPool(): PageAmmPoolStatus & {
    updatePageAmmJoin: (pageAmmPool: RequireOne<PageAmmJoin, never>) => void,
    updatePageAmmExit: (pageAmmPool: RequireOne<PageAmmExit, never>) => void,
} {
    const pageAmmPoolStatus: PageAmmPoolStatus = useSelector((state: RootState) => state.pageAmmPool)
    const dispatch = useDispatch()
    return {
        ...pageAmmPoolStatus,
        updatePageAmmJoin: React.useCallback((pageAmmJoin: RequireOne<PageAmmJoin, never>) => {
            dispatch(updatePageAmmJoin(pageAmmJoin))
        }, [dispatch]),
        updatePageAmmExit: React.useCallback((pageAmmJoin: RequireOne<PageAmmExit, never>) => {
            dispatch(updatePageAmmExit(pageAmmJoin))
        }, [dispatch]),
    }

}
