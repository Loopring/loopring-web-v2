import { useDispatch, useSelector } from 'react-redux'
import { updatePageTradePro } from './reducer'
import { PageTradePro, PageTradeProStatus } from './interface'
import React from 'react'
import { RequireOne } from '@loopring-web/common-resources'

export function usePageTradePro<C extends { [key: string]: any }>(): PageTradeProStatus<C> & {
  updatePageTradePro: (pageTradePro: RequireOne<PageTradePro<C>, 'market'>) => void
} {
  const pageTradeProStatus: PageTradeProStatus<C> = useSelector(
    (state: any) => state._router_pageTradePro,
  )
  const dispatch = useDispatch()
  return {
    ...pageTradeProStatus,
    updatePageTradePro: React.useCallback(
      (pageTradePro: RequireOne<PageTradePro<C>, 'market'>) => {
        dispatch(updatePageTradePro(pageTradePro))
      },
      [dispatch],
    ),
  }
}
