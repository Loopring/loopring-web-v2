import { useDispatch, useSelector } from 'react-redux'
import { updatePageAmmExit, updatePageAmmJoin, updatePageAmmCommon, } from './reducer';
import { PageAmmExit, PageAmmJoin, PageAmmCommon, PageAmmPoolStatus } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';
import { RootState } from 'stores';

export function usePageAmmPool(): PageAmmPoolStatus & {
    updatePageAmmJoin: (pageAmmPool: RequireOne<PageAmmJoin, never>) => void,
    updatePageAmmExit: (pageAmmPool: RequireOne<PageAmmExit, never>) => void,
    updatePageAmmCommon: (pageAmmPool: RequireOne<PageAmmCommon, never>) => void,
} {
    const pageAmmPoolStatus: PageAmmPoolStatus = useSelector((state: RootState) => state._router_pageAmmPool)
    const dispatch = useDispatch()
    return {
        ...pageAmmPoolStatus,
        updatePageAmmCommon: React.useCallback((pageAmmJoin: RequireOne<PageAmmCommon, never>) => {
            dispatch(updatePageAmmCommon(pageAmmJoin))
        }, [dispatch]),
        updatePageAmmJoin: React.useCallback((pageAmmJoin: RequireOne<PageAmmJoin, never>) => {
            dispatch(updatePageAmmJoin(pageAmmJoin))
        }, [dispatch]),
        updatePageAmmExit: React.useCallback((pageAmmJoin: RequireOne<PageAmmExit, never>) => {
            dispatch(updatePageAmmExit(pageAmmJoin))
        }, [dispatch]),
    }

}
