import { useDispatch, useSelector } from 'react-redux'
import {
  resetAmmPool,
  // updatePageAmmCommon,
  updatePageAmmExit,
  updatePageAmmExitBtn,
  updatePageAmmJoin,
  updatePageAmmJoinBtn,
} from './reducer'
import {
  // PageAmmCommon,
  PageAmmExit,
  PageAmmJoin,
  PageAmmPoolStatus,
} from './interface'
import React from 'react'
import { RequireOne } from '@loopring-web/common-resources'
import { RootState } from '../../index'

export function usePageAmmPool(): PageAmmPoolStatus & {
  // updatePageAmmCommon: (pageAmmPool: RequireOne<PageAmmCommon, never>) => void;
  updatePageAmmJoin: (pageAmmPool: RequireOne<PageAmmJoin, never>) => void
  updatePageAmmJoinBtn: (pageAmmPool: RequireOne<PageAmmJoin, never>) => void
  updatePageAmmExit: (pageAmmPool: RequireOne<PageAmmExit, never>) => void
  updatePageAmmExitBtn: (pageAmmPool: RequireOne<PageAmmExit, never>) => void
  resetAmmPool: () => void
} {
  const pageAmmPoolStatus: PageAmmPoolStatus = useSelector(
    (state: RootState) => state._router_pageAmmPool,
  )
  const dispatch = useDispatch()
  return {
    ...pageAmmPoolStatus,
    resetAmmPool: React.useCallback(() => {
      dispatch(resetAmmPool({}))
    }, [dispatch]),

    updatePageAmmJoin: React.useCallback(
      (pageAmmJoin: RequireOne<PageAmmJoin, never>) => {
        dispatch(updatePageAmmJoin(pageAmmJoin))
      },
      [dispatch],
    ),
    updatePageAmmJoinBtn: React.useCallback(
      (pageAmmJoin: RequireOne<PageAmmJoin, never>) => {
        dispatch(updatePageAmmJoinBtn(pageAmmJoin))
      },
      [dispatch],
    ),
    updatePageAmmExit: React.useCallback(
      (pageAmmJoin: RequireOne<PageAmmExit, never>) => {
        dispatch(updatePageAmmExit(pageAmmJoin))
      },
      [dispatch],
    ),
    updatePageAmmExitBtn: React.useCallback(
      (pageAmmJoin: RequireOne<PageAmmExit, never>) => {
        dispatch(updatePageAmmExitBtn(pageAmmJoin))
      },
      [dispatch],
    ),
  }
}
