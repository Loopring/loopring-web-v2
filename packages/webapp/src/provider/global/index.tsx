import { debounce } from 'lodash'
import React, { useEffect } from 'react'
import { UserStorage } from 'storage'

import { useCheckAccStatus, } from 'stores/account/hook'

import { 
  useUpdateChainId,
  useUpdateExchangeInfo, 
  useUpdateExchangeMarkets, 
  useUpdateTokens, 
  useUpdateAmmPoolConf,
  useUpdateAmmActivityRules,
  useUpdateAmmPoolStats,
} from 'stores/trading/hook'

enum WindowEvent {
  Click = 'click',
  Scroll = 'scroll',
  Mouseover = 'mouseover',
}

const events = [WindowEvent.Click, WindowEvent.Scroll]

const forceReset = debounce(() => { UserStorage.checkTimeout(true) }, 100)

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {

  useUpdateExchangeInfo()
  useUpdateExchangeMarkets()
  useUpdateTokens()
  useUpdateAmmPoolConf()
  useUpdateAmmActivityRules()
  useUpdateAmmPoolStats()
  useUpdateChainId()

  useCheckAccStatus()

  useEffect(() => {

    events.forEach((event: string) => {
      document.addEventListener(event, forceReset)
    })

    return () => {

      events.forEach((event: string) => {
        document.removeEventListener(event, forceReset)
      })
    }

  }, [])

  return (
    <React.Fragment>
      { children}
    </React.Fragment>
  )

}
